const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getAllCustomers,
  toggleCustomerStatus,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

// Customer routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/change-password', protect, changePassword);

// Admin routes
router.get('/admin/customers', protect, adminOnly, getAllCustomers);
router.put('/admin/customers/:id/status', protect, adminOnly, toggleCustomerStatus);

module.exports = router;
