const express = require('express');
const router = express.Router();
const {
  submitVerification,
  getVerificationStatus,
} = require('../controllers/verificationController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Fields for driving license and id proof
const uploadFields = upload.fields([
  { name: 'drivingLicense', maxCount: 1 },
  { name: 'idProof', maxCount: 1 },
]);

router.post('/submit', protect, uploadFields, submitVerification);
router.get('/status', protect, getVerificationStatus);

module.exports = router;
