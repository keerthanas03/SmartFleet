const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'smartfleet_super_secret_jwt_key_2026';
      const decoded = jwt.verify(token, secret);

      const userId = decoded.userId || decoded.id;

      const { findMockUserById } = require('../utils/mockStore');

      // Handle demo / offline users immediately
      if (userId && (userId.startsWith('demo-') || mongoose.connection.readyState !== 1)) {
        const mockUser = findMockUserById(userId);
        req.user = {
          userId,
          id: userId,
          name: mockUser ? mockUser.name : (decoded.role === 'admin' ? (process.env.ADMIN_NAME || 'Fleet Administrator') : 'Demo Test Driver'),
          email: mockUser ? mockUser.email : (decoded.role === 'admin' ? (process.env.ADMIN_EMAIL || 'admin@smartfleet.com') : 'customer@smartfleet.com'),
          phone: mockUser ? mockUser.phone : '+919876543210',
          role: mockUser ? mockUser.role : (decoded.role || 'customer'),
          verificationStatus: mockUser ? (mockUser.verificationStatus || 'approved') : 'approved',
          address: mockUser ? mockUser.address : '',
        };
        return next();
      }

      // Fetch user from DB excluding password
      let user = null;
      try {
        user = await User.findById(userId).select('-password');
      } catch (dbErr) {
        console.warn('[SmartFleet Auth] DB lookup failed, using decoded token payload');
      }

      if (!user) {
        req.user = {
          userId,
          id: userId,
          role: decoded.role || 'customer',
          verificationStatus: 'approved',
        };
        return next();
      }

      // Attach user consistently with userId and role
      req.user = {
        userId: user._id.toString(),
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        verificationStatus: user.verificationStatus,
      };

      next();
    } catch (error) {
      console.error('[SmartFleet Auth] Token verification error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed or expired',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no bearer token provided',
    });
  }
};

module.exports = { protect };
