const mongoose = require('mongoose');
const Maintenance = require('../models/Maintenance');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const {
  getMockMaintenances,
  addMockMaintenance,
  updateMockMaintenance,
} = require('../utils/mockStore');

/**
 * @desc    Create a new maintenance record
 * @route   POST /api/maintenance
 * @access  Private/Admin
 */
const createMaintenance = async (req, res, next) => {
  try {
    const { vehicleId, serviceDate, mileage, serviceType, description, cost, nextServiceDate, status } =
      req.body;

    if (!vehicleId || !serviceDate || mileage === undefined || !serviceType || cost === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide required maintenance details: vehicleId, serviceDate, mileage, serviceType, cost',
      });
    }

    const isDbConnected = mongoose.connection.readyState === 1;

    if (!isDbConnected) {
      const newRec = addMockMaintenance(req.body);
      return res.status(201).json({
        success: true,
        message: 'Maintenance record created and vehicle status updated to MAINTENANCE',
        data: newRec,
      });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found with specified identifier',
      });
    }

    const maintenance = await Maintenance.create({
      vehicle: vehicle._id,
      serviceDate: new Date(serviceDate),
      mileage: Number(mileage),
      serviceType: serviceType.trim(),
      description: description ? description.trim() : '',
      cost: Number(cost),
      nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : undefined,
      status: status || 'SCHEDULED',
    });

    // Update vehicle status, mileage, and next service date
    vehicle.status = 'MAINTENANCE';
    vehicle.mileage = Number(mileage);
    if (nextServiceDate) {
      vehicle.nextServiceDate = new Date(nextServiceDate);
    }
    await vehicle.save();

    const populated = await Maintenance.findById(maintenance._id).populate(
      'vehicle',
      'brand model registrationNumber category status'
    );

    res.status(201).json({
      success: true,
      message: 'Maintenance record created and vehicle status updated to MAINTENANCE',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all maintenance records
 * @route   GET /api/maintenance
 * @access  Private/Admin
 */
const getAllMaintenance = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (!isDbConnected) {
      const records = getMockMaintenances();
      return res.status(200).json({
        success: true,
        count: records.length,
        data: records,
      });
    }

    const records = await Maintenance.find()
      .populate('vehicle', 'brand model registrationNumber category status mileage')
      .sort({ serviceDate: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update maintenance record & handle vehicle status safely
 * @route   PUT /api/maintenance/:id
 * @access  Private/Admin
 */
const updateMaintenance = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (!isDbConnected || req.params.id.startsWith('maint-')) {
      const updated = updateMockMaintenance(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Maintenance record updated successfully',
        data: updated,
      });
    }

    let record = await Maintenance.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found with specified identifier',
      });
    }

    const { status, cost, mileage, serviceType, description, nextServiceDate } = req.body;

    if (cost !== undefined) record.cost = Number(cost);
    if (mileage !== undefined) record.mileage = Number(mileage);
    if (serviceType) record.serviceType = serviceType.trim();
    if (description !== undefined) record.description = description.trim();
    if (nextServiceDate) record.nextServiceDate = new Date(nextServiceDate);

    const oldStatus = record.status;
    if (status) {
      record.status = status;
    }

    await record.save();

    // If maintenance was marked COMPLETED, check if vehicle can become AVAILABLE
    if (status === 'COMPLETED' && oldStatus !== 'COMPLETED') {
      const vehicle = await Vehicle.findById(record.vehicle);
      if (vehicle) {
        if (record.mileage && record.mileage > vehicle.mileage) {
          vehicle.mileage = record.mileage;
        }
        if (record.nextServiceDate) {
          vehicle.nextServiceDate = record.nextServiceDate;
        }

        // Check if there are any current ACTIVE bookings for this vehicle
        const activeBooking = await Booking.findOne({
          vehicle: vehicle._id,
          status: 'ACTIVE',
        });

        // Check if there are other open maintenance records for this vehicle
        const otherOpenMaintenance = await Maintenance.findOne({
          vehicle: vehicle._id,
          _id: { $ne: record._id },
          status: { $in: ['SCHEDULED', 'IN_PROGRESS'] },
        });

        if (activeBooking) {
          vehicle.status = 'RENTED';
        } else if (!otherOpenMaintenance) {
          vehicle.status = 'AVAILABLE';
        }
        await vehicle.save();
      }
    }

    const updated = await Maintenance.findById(record._id).populate(
      'vehicle',
      'brand model registrationNumber category status mileage'
    );

    res.status(200).json({
      success: true,
      message: 'Maintenance record updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete maintenance record
 * @route   DELETE /api/maintenance/:id
 * @access  Private/Admin
 */
const deleteMaintenance = async (req, res, next) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (!isDbConnected || req.params.id.startsWith('maint-')) {
      return res.status(200).json({
        success: true,
        message: 'Maintenance record removed successfully',
      });
    }

    const record = await Maintenance.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found',
      });
    }

    await record.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Maintenance record removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMaintenance,
  getAllMaintenance,
  updateMaintenance,
  deleteMaintenance,
};

