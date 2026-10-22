const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const {
  findUserByEmail: findLiveUserByEmail,
  registerUser: registerLiveUser,
} = require('../utils/liveStore');
const {
  findMockUserByEmail,
  addMockUser,
} = require('../utils/mockStore');

const JWT_SECRET = process.env.JWT_SECRET || 'smartfleet_super_secret_jwt_key_2026';

/**
 * Generate a JWT token for authenticated user
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId: userId.toString(), id: userId.toString(), role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * @desc    Register a new customer account
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, phone, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      // Check MongoDB for existing user
      const userExists = await User.findOne({ email: cleanEmail });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists. Please log in.',
        });
      }

      // Create new user (User model hashes password in pre-save hook)
      const user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        phone: phone.trim(),
        password,
        role: 'customer',
        verificationStatus: 'pending',
      });

      const token = generateToken(user._id, user.role);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          verificationStatus: user.verificationStatus,
        },
      });
    }

    // Resilient offline / demo fallback mode
    const existingLive = findLiveUserByEmail(cleanEmail);
    if (existingLive) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    const newLiveUser = registerLiveUser({
      name,
      email: cleanEmail,
      phone,
      password,
      role: 'customer',
    });

    addMockUser({
      name,
      email: cleanEmail,
      phone,
      password,
      role: 'customer',
    });

    const token = generateToken(newLiveUser._id, newLiveUser.role);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        _id: newLiveUser._id,
        name: newLiveUser.name,
        email: newLiveUser.email,
        phone: newLiveUser.phone,
        role: newLiveUser.role,
        verificationStatus: newLiveUser.verificationStatus || 'unverified',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email address and password',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@smartfleet.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

    // 1. Check quick fallback for configured administrator
    if (cleanEmail === adminEmail && password === adminPassword) {
      const adminToken = generateToken('demo-admin-id', 'admin');
      return res.status(200).json({
        success: true,
        message: 'Administrator authentication successful',
        token: adminToken,
        user: {
          _id: 'demo-admin-id',
          name: process.env.ADMIN_NAME || 'Fleet Administrator',
          email: adminEmail,
          phone: process.env.ADMIN_PHONE || '+919876543210',
          role: 'admin',
          verificationStatus: 'approved',
        },
      });
    }

    // 2. Check quick fallback for demo customer
    if (cleanEmail === 'customer@smartfleet.com' && password === 'Customer@123456') {
      const custToken = generateToken('demo-driver-id', 'customer');
      return res.status(200).json({
        success: true,
        message: 'Customer authentication successful',
        token: custToken,
        user: {
          _id: 'demo-driver-id',
          name: 'Demo Test Driver',
          email: 'customer@smartfleet.com',
          phone: '+919876543211',
          role: 'customer',
          verificationStatus: 'approved',
        },
      });
    }

    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const user = await User.findOne({ email: cleanEmail });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. User with this email does not exist.',
        });
      }

      if (user.isSuspended) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended by administration. Please contact support.',
        });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password combination.',
        });
      }

      const token = generateToken(user._id, user.role);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          verificationStatus: user.verificationStatus,
        },
      });
    }

    // 3. Resilient offline / liveStore fallback
    const liveUser = findLiveUserByEmail(cleanEmail) || findMockUserByEmail(cleanEmail);

    if (liveUser) {
      if (liveUser.isSuspended) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended by administration. Please contact support.',
        });
      }

      if (liveUser.password === password) {
        const token = generateToken(liveUser._id, liveUser.role || 'customer');
        return res.status(200).json({
          success: true,
          message: 'Login successful',
          token,
          user: {
            _id: liveUser._id,
            name: liveUser.name,
            email: liveUser.email,
            phone: liveUser.phone,
            role: liveUser.role || 'customer',
            verificationStatus: liveUser.verificationStatus || 'approved',
          },
        });
      }
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
