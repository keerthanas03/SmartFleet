const express = require('express');
const router = express.Router();
const {
  exportBookingsCsv,
  exportVehiclesCsv,
  exportMaintenanceCsv,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

// All report routes require admin authentication
router.use(protect, adminOnly);

router.get('/export-bookings', exportBookingsCsv);
router.get('/export-vehicles', exportVehiclesCsv);
router.get('/export-maintenance', exportMaintenanceCsv);

module.exports = router;
