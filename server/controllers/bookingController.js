const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const { mockVehicles, mockDashboardStats } = require('../utils/mockStore');

/**
 * Helper to check date overlap
 */
const checkOverlap = async (vehicleId, pickupDate, returnDate, excludeBookingId = null) => {
  if (mongoose.connection.readyState !== 1) return false;
  const query = {
    vehicle: vehicleId,
    status: { $in: ['PENDING', 'CONFIRMED', 'ACTIVE'] },
    pickupDate: { $lt: new Date(returnDate) },
    returnDate: { $gt: new Date(pickupDate) },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflict = await Booking.findOne(query);
  return !!conflict;
};

/**
 * @desc    Create a new vehicle booking
 * @route   POST /api/bookings
 * @access  Private/Customer
 */
const createBooking = async (req, res, next) => {
  try {
    const { vehicleId, pickupDate, returnDate, pickupLocation, returnLocation } = req.body;

    if (!vehicleId || !pickupDate || !returnDate || !pickupLocation || !returnLocation) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all booking details: vehicleId, pickupDate, returnDate, pickupLocation, returnLocation',
      });
    }

    if (mongoose.connection.readyState !== 1) {
      const mockV = mockVehicles.find((v) => v._id === vehicleId) || mockVehicles[0];
      const start = new Date(pickupDate);
      const end = new Date(returnDate);
      const days = Math.max(1, Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)));
      const base = days * mockV.pricePerDay;
      const tax = Math.round(base * 0.18);
      const total = base + tax + 500;

      const newBooking = {
        _id: `demo-bk-${Date.now()}`,
        bookingReference: `SF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        customer: req.user?.userId || 'u-demo-1',
        vehicle: mockV,
        pickupDate,
        returnDate,
        numberOfDays: days,
        baseAmount: base,
        taxAmount: tax,
        insuranceAmount: 500,
        totalAmount: total,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        pickupLocation,
        returnLocation,
      };

      if (mockDashboardStats && mockDashboardStats.recentBookings) {
        mockDashboardStats.recentBookings.unshift(newBooking);
      }

      return res.status(201).json({
        success: true,
        message: 'Booking created successfully (Demo Mode)',
        data: newBooking,
      });
    }

    const start = new Date(pickupDate);
    const end = new Date(returnDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pickup or return date provided',
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'Return date must be strictly after pickup date',
      });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Selected vehicle not found',
      });
    }

    if (vehicle.status === 'MAINTENANCE' || vehicle.status === 'INACTIVE') {
      return res.status(400).json({
        success: false,
        message: `Vehicle is currently unavailable for booking (Status: ${vehicle.status})`,
      });
    }

    // Overlap verification
    const hasConflict = await checkOverlap(vehicleId, start, end);
    if (hasConflict) {
      return res.status(400).json({
        success: false,
        message: 'This vehicle already has a confirmed or pending booking during the selected dates',
      });
    }

    // Calculate days
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const numberOfDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Calculate amounts
    const baseAmount = numberOfDays * vehicle.pricePerDay;
    const taxAmount = Math.round(baseAmount * 0.18); // 18% tax
    const insuranceAmount = 500; // Flat INR 500
    const totalAmount = baseAmount + taxAmount + insuranceAmount;

    const booking = await Booking.create({
      customer: req.user.userId,
      vehicle: vehicle._id,
      pickupDate: start,
      returnDate: end,
      pickupLocation: pickupLocation.trim(),
      returnLocation: returnLocation.trim(),
      numberOfDays,
      baseAmount,
      taxAmount,
      insuranceAmount,
      totalAmount,
      status: 'PENDING',
      paymentStatus: 'PENDING',
    });

    const populatedBooking = await Booking.findById(booking._id).populate('vehicle');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully. Please proceed with payment.',
      data: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check vehicle availability for specified dates
 * @route   GET /api/bookings/availability
 * @access  Public
 */
const checkAvailability = async (req, res, next) => {
  try {
    const { vehicleId, pickupDate, returnDate } = req.query;

    if (!vehicleId || !pickupDate || !returnDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide vehicleId, pickupDate, and returnDate',
      });
    }

    const start = new Date(pickupDate);
    const end = new Date(returnDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return res.status(400).json({
        success: false,
        available: false,
        message: 'Invalid date range provided',
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        available: true,
        message: 'Vehicle is available for the selected dates',
      });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        available: false,
        message: 'Vehicle not found',
      });
    }

    if (vehicle.status === 'MAINTENANCE' || vehicle.status === 'INACTIVE') {
      return res.status(200).json({
        success: true,
        available: false,
        message: `Vehicle is currently not available due to ${vehicle.status.toLowerCase()} status`,
      });
    }

    const hasConflict = await checkOverlap(vehicleId, start, end);
    if (hasConflict) {
      return res.status(200).json({
        success: true,
        available: false,
        message: 'Vehicle is already booked for the selected dates',
      });
    }

    return res.status(200).json({
      success: true,
      available: true,
      message: 'Vehicle is available for the selected dates',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in customer's bookings
 * @route   GET /api/bookings/my
 * @access  Private/Customer
 */
const getMyBookings = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        count: mockDashboardStats.recentBookings.length,
        data: mockDashboardStats.recentBookings,
      });
    }

    const bookings = await Booking.find({ customer: req.user.userId })
      .populate('vehicle')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings (Admin)
 * @route   GET /api/bookings
 * @access  Private/Admin
 */
const getAllBookings = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        count: mockDashboardStats.recentBookings.length,
        data: mockDashboardStats.recentBookings,
      });
    }

    const bookings = await Booking.find()
      .populate('customer', 'name email phone')
      .populate('vehicle', 'brand model registrationNumber category pricePerDay location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update booking status (Admin)
 * @route   PUT /api/bookings/:id/status
 * @access  Private/Admin
 */
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'];

    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowed.join(', ')}`,
      });
    }

    if (mongoose.connection.readyState !== 1 || req.params.id.startsWith('demo-') || req.params.id.startsWith('bk-')) {
      const mockB = (mockDashboardStats?.recentBookings || []).find((b) => b._id === req.params.id);
      if (mockB) {
        mockB.status = status;
        return res.status(200).json({
          success: true,
          message: `Booking status updated to ${status}`,
          data: mockB,
        });
      }
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found with specified identifier',
      });
    }

    // Prevent transitions from terminal states
    if (booking.status === 'COMPLETED' && status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify a booking that is already COMPLETED',
      });
    }

    booking.status = status;
    await booking.save();

    // Synchronize vehicle status if appropriate
    if (booking.vehicle) {
      const vehicle = await Vehicle.findById(booking.vehicle);
      if (vehicle && vehicle.status !== 'MAINTENANCE' && vehicle.status !== 'INACTIVE') {
        if (status === 'ACTIVE') {
          vehicle.status = 'RENTED';
          await vehicle.save();
        } else if (status === 'COMPLETED' || status === 'CANCELLED') {
          // If no other ACTIVE bookings, mark AVAILABLE
          const otherActive = await Booking.findOne({
            vehicle: vehicle._id,
            status: 'ACTIVE',
            _id: { $ne: booking._id },
          });
          if (!otherActive) {
            vehicle.status = 'AVAILABLE';
            await vehicle.save();
          }
        }
      }
    }

    const updatedBooking = await Booking.findById(booking._id)
      .populate('customer', 'name email phone')
      .populate('vehicle');

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel booking by customer
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private/Customer
 */
const cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (mongoose.connection.readyState !== 1 || req.params.id.startsWith('demo-') || req.params.id.startsWith('bk-')) {
      const mockB = (mockDashboardStats?.recentBookings || []).find((b) => b._id === req.params.id);
      if (mockB) {
        mockB.status = 'CANCELLED';
        mockB.cancellationReason = reason || 'Cancelled by customer';
        return res.status(200).json({
          success: true,
          message: 'Booking cancelled successfully',
          data: mockB,
        });
      }
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Ownership check
    if (booking.customer.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Cannot cancel an already completed booking' });
    }

    if (booking.status === 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'Cannot cancel an active rental trip in progress' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'This booking is already cancelled' });
    }

    booking.status = 'CANCELLED';
    booking.cancellationReason = reason || 'Cancelled by customer';
    booking.cancelledAt = new Date();
    await booking.save();

    // Check if vehicle can become AVAILABLE
    const vehicle = await Vehicle.findById(booking.vehicle);
    if (vehicle && vehicle.status !== 'MAINTENANCE' && vehicle.status !== 'INACTIVE') {
      const otherActive = await Booking.findOne({
        vehicle: vehicle._id,
        status: { $in: ['CONFIRMED', 'ACTIVE'] },
        _id: { $ne: booking._id },
      });
      if (!otherActive) {
        vehicle.status = 'AVAILABLE';
        await vehicle.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  checkAvailability,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  cancelBooking,
};

