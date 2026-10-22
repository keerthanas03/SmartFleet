const express = require('express');
const router = express.Router();
const {
  createMaintenance,
  getAllMaintenance,
  updateMaintenance,
  deleteMaintenance,
} = require('../controllers/maintenanceController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

// All maintenance routes are admin-only
router.use(protect, adminOnly);

router.route('/')
  .get(getAllMaintenance)
  .post(createMaintenance);

router.route('/:id')
  .put(updateMaintenance)
  .delete(deleteMaintenance);

module.exports = router;
