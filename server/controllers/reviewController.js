const mongoose = require('mongoose');
const Review = require('../models/Review');
const Vehicle = require('../models/Vehicle');

/**
 * @desc    Submit a review for a vehicle
 * @route   POST /api/reviews
 * @access  Private/Customer
 */
const createReview = async (req, res, next) => {
  try {
    const { vehicleId, rating, comment } = req.body;

    if (!vehicleId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide vehicleId, rating (1-5), and review comment',
      });
    }

    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5 stars',
      });
    }

    if (mongoose.connection.readyState !== 1 || vehicleId.startsWith('demo-')) {
      const mockReview = {
        _id: `rev-${Date.now()}`,
        customer: { name: req.user.name || 'Customer' },
        vehicle: vehicleId,
        rating: numRating,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
      };
      return res.status(201).json({
        success: true,
        message: 'Thank you for reviewing this vehicle!',
        data: mockReview,
      });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const review = await Review.create({
      customer: req.user.userId,
      vehicle: vehicle._id,
      rating: numRating,
      comment: comment.trim(),
    });

    const populated = await Review.findById(review._id).populate('customer', 'name');

    res.status(201).json({
      success: true,
      message: 'Thank you for reviewing this vehicle!',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews and average rating for a vehicle
 * @route   GET /api/reviews/vehicle/:vehicleId
 * @access  Public
 */
const getVehicleReviews = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1 || req.params.vehicleId.startsWith('demo-')) {
      return res.status(200).json({
        success: true,
        count: 1,
        averageRating: 4.8,
        data: [
          {
            _id: 'rev-sample-1',
            customer: { name: 'Aditya Krishnan' },
            rating: 5,
            comment: 'Fantastic driving experience and seamless airport pickup!',
            createdAt: new Date('2026-10-15').toISOString(),
          },
        ],
      });
    }

    const reviews = await Review.find({ vehicle: req.params.vehicleId })
      .populate('customer', 'name')
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
        : 5.0; // Default baseline

    res.status(200).json({
      success: true,
      count: totalReviews,
      averageRating,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getVehicleReviews,
};
