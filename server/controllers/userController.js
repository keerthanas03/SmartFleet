const mongoose = require('mongoose');
const User = require('../models/User');
const Booking = require('../models/Booking');
const {
  findMockUserById,
  updateMockUser,
  getMockCustomers,
  toggleMockCustomerStatus,
} = require('../utils/mockStore');

/**
 * @desc    Get current user profile and stats
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (!isDbConnected || req.user.userId.startsWith('demo-')) {
      const mockU = findMockUserById(req.user.userId) || req.user;
      return res.status(200).json({
        success: true,
        data: {
          user: {
            _id: mockU._id || mockU.id || req.user.userId,
            name: mockU.name,
            email: mockU.email,
            phone: mockU.phone,
            role: mockU.role,
            verificationStatus: mockU.verificationStatus || 'approved',
            address: mockU.address || '',
          },
          stats: {
            totalBookings: 3,
            completedBookings: 2,
            totalSpent: 42500,
          },
        },
      });
    }

    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Aggregate user's booking stats
    const [totalBookings, completedBookings, totalSpentAgg] = await Promise.all([
      Booking.countDocuments({ customer: user._id }),
      Booking.countDocuments({ customer: user._id, status: 'COMPLETED' }),
      Booking.aggregate([
        { $match: { customer: user._id, paymentStatus: 'PAID' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const totalSpent = totalSpentAgg.length > 0 ? totalSpentAgg[0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        user,
        stats: {
          totalBookings,
          completedBookings,
          totalSpent,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile details
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (!isDbConnected || req.user.userId.startsWith('demo-')) {
      const updated = updateMockUser(req.user.userId, {
        ...(name && { name: name.trim() }),
        ...(phone && { phone: phone.trim() }),
        ...(address !== undefined && { address: address.trim() }),
      }) || req.user;

      if (name) req.user.name = name.trim();
      if (phone) req.user.phone = phone.trim();
      if (address !== undefined) req.user.address = address.trim();

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: req.user.userId,
          name: updated.name || req.user.name,
          email: updated.email || req.user.email,
          phone: updated.phone || req.user.phone,
          address: updated.address || req.user.address || '',
          role: updated.role || req.user.role,
          verificationStatus: updated.verificationStatus || req.user.verificationStatus,
        },
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (address !== undefined) user.address = address.trim();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change account password
 * @route   PUT /api/users/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your current and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const isDbConnected = mongoose.connection.readyState === 1;

    if (!isDbConnected || req.user.userId.startsWith('demo-')) {
      updateMockUser(req.user.userId, { password: newPassword });
      return res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match our records',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all customers with trip count and lifetime spending (Admin)
 * @route   GET /api/admin/customers
 * @access  Private/Admin
 */
const getAllCustomers = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (!isDbConnected) {
      const data = getMockCustomers();
      return res.status(200).json({
        success: true,
        count: data.length,
        data,
      });
    }

    const customers = await User.find({ role: 'customer' })
      .select('-password')
      .sort({ createdAt: -1 });

    // Populate trip metrics for each customer
    const customerIds = customers.map((c) => c._id);

    const bookingStats = await Booking.aggregate([
      { $match: { customer: { $in: customerIds } } },
      {
        $group: {
          _id: '$customer',
          totalTrips: { $sum: 1 },
          completedTrips: {
            $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] },
          },
          totalSpend: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'PAID'] }, '$totalAmount', 0] },
          },
        },
      },
    ]);

    const statsMap = {};
    bookingStats.forEach((s) => {
      statsMap[s._id.toString()] = {
        totalTrips: s.totalTrips,
        completedTrips: s.completedTrips,
        totalSpend: s.totalSpend,
      };
    });

    const data = customers.map((c) => ({
      ...c.toObject(),
      metrics: statsMap[c._id.toString()] || { totalTrips: 0, completedTrips: 0, totalSpend: 0 },
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle customer account status (suspend/activate) (Admin)
 * @route   PUT /api/admin/customers/:id/status
 * @access  Private/Admin
 */
const toggleCustomerStatus = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (!isDbConnected || req.params.id.startsWith('demo-')) {
      const isSuspended = toggleMockCustomerStatus(req.params.id);
      return res.status(200).json({
        success: true,
        message: `Account has been ${isSuspended ? 'suspended' : 'reactivated'}`,
        isSuspended,
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Customer account not found' });
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Account has been ${user.isSuspended ? 'suspended' : 'reactivated'}`,
      isSuspended: user.isSuspended,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getAllCustomers,
  toggleCustomerStatus,
};

