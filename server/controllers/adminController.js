const mongoose = require('mongoose');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Maintenance = require('../models/Maintenance');
const { mockDashboardStats } = require('../utils/mockStore');

/**
 * @desc    Get Admin Dashboard KPI metrics and recent bookings
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
const getDashboardStats = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        data: mockDashboardStats,
      });
    }
    // 1. Vehicle counts by status
    const [totalVehicles, availableVehicles, bookedVehicles, rentedVehicles, maintenanceVehicles] =
      await Promise.all([
        Vehicle.countDocuments(),
        Vehicle.countDocuments({ status: 'AVAILABLE' }),
        Vehicle.countDocuments({ status: 'BOOKED' }),
        Vehicle.countDocuments({ status: 'RENTED' }),
        Vehicle.countDocuments({ status: 'MAINTENANCE' }),
      ]);

    // 2. Booking counts by status
    const [totalBookings, pendingBookings, confirmedBookings, completedBookings, cancelledBookings] =
      await Promise.all([
        Booking.countDocuments(),
        Booking.countDocuments({ status: 'PENDING' }),
        Booking.countDocuments({ status: 'CONFIRMED' }),
        Booking.countDocuments({ status: 'COMPLETED' }),
        Booking.countDocuments({ status: 'CANCELLED' }),
      ]);

    // 3. Customer count
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // 4. Revenue calculation from paid bookings
    const revenueAgg = await Booking.aggregate([
      { $match: { paymentStatus: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // 5. Total maintenance costs
    const maintenanceAgg = await Maintenance.aggregate([
      { $group: { _id: null, totalCost: { $sum: '$cost' } } },
    ]);
    const totalMaintenanceCost = maintenanceAgg.length > 0 ? maintenanceAgg[0].totalCost : 0;

    // 6. Recent bookings
    const recentBookings = await Booking.find()
      .populate('customer', 'name email phone')
      .populate('vehicle', 'brand model registrationNumber category pricePerDay')
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      data: {
        vehicles: {
          total: totalVehicles,
          available: availableVehicles,
          booked: bookedVehicles,
          rented: rentedVehicles,
          maintenance: maintenanceVehicles,
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          confirmed: confirmedBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
        },
        customers: {
          total: totalCustomers,
        },
        financials: {
          totalRevenue,
          totalMaintenanceCost,
        },
        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Aggregated Analytics for Charts (Monthly revenue, status breakdown, top vehicles)
 * @route   GET /api/admin/analytics
 * @access  Private/Admin
 */
const getAnalytics = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        data: {
          summary: {
            totalRevenue: 348500,
            totalBookings: 38,
            totalCustomers: 46,
            totalVehicles: 24,
            totalMaintenanceCost: 28400,
          },
          monthlyRevenue: [
            { name: 'May 2026', revenue: 42000, bookings: 8 },
            { name: 'Jun 2026', revenue: 58000, bookings: 12 },
            { name: 'Jul 2026', revenue: 64000, bookings: 15 },
            { name: 'Aug 2026', revenue: 78500, bookings: 18 },
            { name: 'Sep 2026', revenue: 92000, bookings: 22 },
            { name: 'Oct 2026', revenue: 114000, bookings: 26 },
          ],
          bookingStatusDistribution: [
            { status: 'CONFIRMED', count: 22 },
            { status: 'COMPLETED', count: 11 },
            { status: 'PENDING', count: 3 },
            { status: 'CANCELLED', count: 2 },
          ],
          vehicleStatusDistribution: [
            { status: 'AVAILABLE', count: 18 },
            { status: 'BOOKED', count: 4 },
            { status: 'RENTED', count: 2 },
          ],
          topVehicles: [
            { brand: 'BMW', model: 'M-Performance Grand Coupe', bookings: 14, revenue: 95200 },
            { brand: 'Range Rover', model: 'Autobiography Edition', bookings: 11, revenue: 52800 },
            { brand: 'Aether', model: 'Flux Cyber Edition EV', bookings: 9, revenue: 32400 },
          ],
        },
      });
    }
    // 1. Monthly revenue aggregation (last 6-12 months)
    const monthlyRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'PAID' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          bookingsCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          revenue: 1,
          bookingsCount: 1,
        },
      },
    ]);

    // Format month names for frontend chart
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const formattedMonthlyRevenue = monthlyRevenue.map((item) => ({
      name: `${monthNames[item.month - 1]} ${item.year}`,
      revenue: item.revenue,
      bookings: item.bookingsCount,
    }));

    // 2. Booking status distribution
    const bookingStatusCounts = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
    ]);

    // 3. Vehicle status distribution
    const vehicleStatusCounts = await Vehicle.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
    ]);

    // 4. Top rented vehicles
    const topVehiclesAgg = await Booking.aggregate([
      {
        $group: {
          _id: '$vehicle',
          totalBookings: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'PAID'] }, '$totalAmount', 0],
            },
          },
        },
      },
      { $sort: { totalBookings: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'vehicles',
          localField: '_id',
          foreignField: '_id',
          as: 'vehicleInfo',
        },
      },
      { $unwind: '$vehicleInfo' },
      {
        $project: {
          _id: 1,
          brand: '$vehicleInfo.brand',
          model: '$vehicleInfo.model',
          registrationNumber: '$vehicleInfo.registrationNumber',
          totalBookings: 1,
          totalRevenue: 1,
        },
      },
    ]);

    // 5. Totals
    const [totalVehicles, totalBookings, totalCustomers] = await Promise.all([
      Vehicle.countDocuments(),
      Booking.countDocuments(),
      User.countDocuments({ role: 'customer' }),
    ]);

    const totalRevAgg = await Booking.aggregate([
      { $match: { paymentStatus: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = totalRevAgg.length > 0 ? totalRevAgg[0].total : 0;

    const maintenanceAgg = await Maintenance.aggregate([
      { $group: { _id: null, total: { $sum: '$cost' } } },
    ]);
    const totalMaintenanceCost = maintenanceAgg.length > 0 ? maintenanceAgg[0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalBookings,
          totalCustomers,
          totalVehicles,
          totalMaintenanceCost,
        },
        monthlyRevenue: formattedMonthlyRevenue,
        bookingStatusDistribution: bookingStatusCounts,
        vehicleStatusDistribution: vehicleStatusCounts,
        topVehicles: topVehiclesAgg,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users for verification review
 * @route   GET /api/admin/verification
 * @access  Private/Admin
 */
const getVerificationQueue = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        count: 2,
        data: [
          {
            _id: 'user-v1',
            name: 'Pooja Varma',
            email: 'pooja@deloitte.com',
            phone: '+919876500113',
            verificationStatus: 'pending',
            drivingLicense: {
              licenseNumber: 'KA-01-20220019283',
              verified: false,
              documentUrl: '/images/hero-luxury-sedan.jpg',
            },
            idProof: {
              documentType: 'Passport',
              documentNumber: 'Z8192819',
              verified: false,
            },
            createdAt: new Date('2026-10-12'),
          },
          {
            _id: 'user-v2',
            name: 'Vikram Sethi',
            email: 'vikram@startup.io',
            phone: '+919876500114',
            verificationStatus: 'approved',
            drivingLicense: {
              licenseNumber: 'MH-02-20210088122',
              verified: true,
              documentUrl: '/images/hero-luxury-sedan.jpg',
            },
            idProof: {
              documentType: 'Aadhaar',
              documentNumber: 'XXXX-XXXX-9128',
              verified: true,
            },
            createdAt: new Date('2026-10-10'),
          },
        ],
      });
    }

    const users = await User.find({ role: 'customer' })
      .select('name email phone verificationStatus drivingLicense idProof createdAt')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve or reject customer verification
 * @route   PUT /api/admin/verification/:userId
 * @access  Private/Admin
 */
const updateVerificationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status. Allowed: approved, rejected, pending',
      });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with specified identifier',
      });
    }

    user.verificationStatus = status;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User verification status updated to ${status}`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAnalytics,
  getVerificationQueue,
  updateVerificationStatus,
};
