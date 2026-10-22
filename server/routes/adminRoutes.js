const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAnalytics,
  getVerificationQueue,
  updateVerificationStatus,
} = require('../controllers/adminController');
const {
  getAllCustomers,
  toggleCustomerStatus,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

// All admin routes require authentication and admin role
router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/verification', getVerificationQueue);
router.put('/verification/:userId', updateVerificationStatus);
router.get('/customers', getAllCustomers);
router.put('/customers/:id/status', toggleCustomerStatus);

module.exports = router;

