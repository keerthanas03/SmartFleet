const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const { mockVehicles } = require('../utils/mockStore');

/**
 * @desc    Get all vehicles (supports public view and optional query filters)
 * @route   GET /api/vehicles
 * @access  Public
 */
const getVehicles = async (req, res, next) => {
  try {
    const { category, fuelType, transmission, status, search } = req.query;

    if (mongoose.connection.readyState === 1) {
      try {
        const query = {};

        if (category) query.category = category;
        if (fuelType) query.fuelType = fuelType;
        if (transmission) query.transmission = transmission;
        if (status) query.status = status;

        if (search) {
          query.$or = [
            { brand: { $regex: search, $options: 'i' } },
            { model: { $regex: search, $options: 'i' } },
            { location: { $regex: search, $options: 'i' } },
            { registrationNumber: { $regex: search, $options: 'i' } },
          ];
        }

        const vehicles = await Vehicle.find(query).sort({ createdAt: -1 });

        if (vehicles && vehicles.length > 0) {
          return res.status(200).json({
            success: true,
            count: vehicles.length,
            data: vehicles,
          });
        }
      } catch (dbErr) {
        console.warn('[SmartFleet Vehicles] DB query error, using mock fallback:', dbErr.message);
      }
    }

    // Filter mock vehicles
    let filtered = [...mockVehicles];
    if (category) filtered = filtered.filter((v) => v.category === category);
    if (fuelType) filtered = filtered.filter((v) => v.fuelType === fuelType);
    if (transmission) filtered = filtered.filter((v) => v.transmission === transmission);
    if (status) filtered = filtered.filter((v) => v.status === status);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.brand.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.location.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single vehicle by ID
 * @route   GET /api/vehicles/:id
 * @access  Public
 */
const getVehicleById = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (vehicle) {
          return res.status(200).json({
            success: true,
            data: vehicle,
          });
        }
      } catch (dbErr) {
        // Fallback to mock search
      }
    }

    const mock = mockVehicles.find((v) => v._id === req.params.id);
    if (mock) {
      return res.status(200).json({
        success: true,
        data: mock,
      });
    }

    res.status(404).json({
      success: false,
      message: 'Vehicle not found with specified identifier',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new vehicle
 * @route   POST /api/vehicles
 * @access  Private/Admin
 */
const createVehicle = async (req, res, next) => {
  try {
    const {
      brand,
      model,
      year,
      category,
      registrationNumber,
      fuelType,
      transmission,
      seatingCapacity,
      pricePerDay,
      location,
      images,
      features,
      status,
      mileage,
      nextServiceDate,
    } = req.body;

    // Validate required fields
    if (
      !brand ||
      !model ||
      !year ||
      !category ||
      !registrationNumber ||
      !fuelType ||
      !transmission ||
      !seatingCapacity ||
      !pricePerDay ||
      !location
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all mandatory vehicle details',
      });
    }

    // Check unique registration number
    const existingVehicle = await Vehicle.findOne({
      registrationNumber: registrationNumber.toUpperCase().trim(),
    });
    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: `A vehicle with registration number ${registrationNumber} is already registered`,
      });
    }

    const vehicle = await Vehicle.create({
      brand: brand.trim(),
      model: model.trim(),
      year: Number(year),
      category,
      registrationNumber: registrationNumber.toUpperCase().trim(),
      fuelType,
      transmission,
      seatingCapacity: Number(seatingCapacity),
      pricePerDay: Number(pricePerDay),
      location: location.trim(),
      images: Array.isArray(images) ? images : images ? [images] : [],
      features: Array.isArray(features) ? features : features ? features.split(',').map((f) => f.trim()) : [],
      status: status || 'AVAILABLE',
      mileage: mileage ? Number(mileage) : 0,
      nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update vehicle details
 * @route   PUT /api/vehicles/:id
 * @access  Private/Admin
 */
const updateVehicle = async (req, res, next) => {
  try {
    let vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found with specified identifier',
      });
    }

    // If registration number is changing, verify uniqueness
    if (req.body.registrationNumber) {
      const reg = req.body.registrationNumber.toUpperCase().trim();
      const existing = await Vehicle.findOne({
        registrationNumber: reg,
        _id: { $ne: req.params.id },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Another vehicle with registration number ${reg} already exists`,
        });
      }
      req.body.registrationNumber = reg;
    }

    if (req.body.features && typeof req.body.features === 'string') {
      req.body.features = req.body.features.split(',').map((f) => f.trim());
    }

    vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully',
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete vehicle
 * @route   DELETE /api/vehicles/:id
 * @access  Private/Admin
 */
const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found with specified identifier',
      });
    }

    await vehicle.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Vehicle deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
