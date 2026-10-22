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
