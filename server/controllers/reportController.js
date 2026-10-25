const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const Maintenance = require('../models/Maintenance');
const {
  getAllBookings: getAllLiveBookings,
  getVehicles: getLiveVehicles,
  getMaintenances: getLiveMaintenances,
} = require('../utils/liveStore');

/**
 * Helper to escape CSV cell content
 */
const escapeCsv = (val) => {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

/**
 * @desc    Export all bookings as CSV
 * @route   GET /api/admin/reports/export-bookings
 * @access  Private/Admin
 */
const exportBookingsCsv = async (req, res, next) => {
  try {
    let bookings = [];
    if (mongoose.connection.readyState === 1) {
      bookings = await Booking.find()
        .populate('customer', 'name email phone')
        .populate('vehicle', 'brand model registrationNumber')
        .sort({ createdAt: -1 });
    } else {
      bookings = getAllLiveBookings().map((b) => ({
        ...b,
        customer: { name: b.customerName || 'Customer', email: b.customerEmail, phone: b.customerPhone },
      }));
    }

    const headers = [
      'Booking ID',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Vehicle',
      'Registration',
      'Pickup Date',
      'Return Date',
      'Days',
      'Pickup Location',
      'Return Location',
      'Base Fare (INR)',
      'GST Tax (INR)',
      'Insurance (INR)',
      'Total Amount (INR)',
      'Booking Status',
      'Payment Status',
      'Razorpay Payment ID',
      'Booked On',
    ];

    const rows = bookings.map((b) => [
      escapeCsv(b._id),
      escapeCsv(b.customer?.name || 'N/A'),
      escapeCsv(b.customer?.email || 'N/A'),
      escapeCsv(b.customer?.phone || 'N/A'),
      escapeCsv(`${b.vehicle?.brand || ''} ${b.vehicle?.model || ''}`.trim()),
      escapeCsv(b.vehicle?.registrationNumber || 'N/A'),
      escapeCsv(new Date(b.pickupDate).toISOString().split('T')[0]),
      escapeCsv(new Date(b.returnDate).toISOString().split('T')[0]),
      escapeCsv(b.numberOfDays),
      escapeCsv(b.pickupLocation),
      escapeCsv(b.returnLocation),
      escapeCsv(b.baseAmount),
      escapeCsv(b.taxAmount),
      escapeCsv(b.insuranceAmount),
      escapeCsv(b.totalAmount),
      escapeCsv(b.status),
      escapeCsv(b.paymentStatus),
      escapeCsv(b.razorpayPaymentId || 'N/A'),
      escapeCsv(new Date(b.createdAt).toISOString().split('T')[0]),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="smartfleet_bookings_${Date.now()}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export all vehicles as CSV
 * @route   GET /api/admin/reports/export-vehicles
 * @access  Private/Admin
 */
const exportVehiclesCsv = async (req, res, next) => {
  try {
    let vehicles = [];
    if (mongoose.connection.readyState === 1) {
      vehicles = await Vehicle.find().sort({ createdAt: -1 });
    } else {
      vehicles = getLiveVehicles();
    }

    const headers = [
      'Vehicle ID',
      'Brand',
      'Model',
      'Year',
      'Category',
      'Registration Number',
      'Fuel Type',
      'Transmission',
      'Seating Capacity',
      'Price Per Day (INR)',
      'Stationed Location',
      'Odometer (km)',
      'Status',
      'Next Service Date',
    ];

    const rows = vehicles.map((v) => [
      escapeCsv(v._id),
      escapeCsv(v.brand),
      escapeCsv(v.model),
      escapeCsv(v.year),
      escapeCsv(v.category),
      escapeCsv(v.registrationNumber),
      escapeCsv(v.fuelType),
      escapeCsv(v.transmission),
      escapeCsv(v.seatingCapacity),
      escapeCsv(v.pricePerDay),
      escapeCsv(v.location),
      escapeCsv(v.mileage || 0),
      escapeCsv(v.status),
      escapeCsv(v.nextServiceDate ? new Date(v.nextServiceDate).toISOString().split('T')[0] : 'None'),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="smartfleet_inventory_${Date.now()}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export all maintenance logs as CSV
 * @route   GET /api/admin/reports/export-maintenance
 * @access  Private/Admin
 */
const exportMaintenanceCsv = async (req, res, next) => {
  try {
    let records = [];
    if (mongoose.connection.readyState === 1) {
      records = await Maintenance.find()
        .populate('vehicle', 'brand model registrationNumber')
        .sort({ serviceDate: -1 });
    } else {
      records = getLiveMaintenances();
    }

    const headers = [
      'Maintenance ID',
      'Vehicle',
      'Registration',
      'Service Date',
      'Service Type',
      'Odometer (km)',
      'Cost (INR)',
      'Status',
      'Next Projected Service',
      'Service Description',
    ];

    const rows = records.map((m) => [
      escapeCsv(m._id),
      escapeCsv(`${m.vehicle?.brand || ''} ${m.vehicle?.model || ''}`.trim()),
      escapeCsv(m.vehicle?.registrationNumber || 'N/A'),
      escapeCsv(new Date(m.serviceDate).toISOString().split('T')[0]),
      escapeCsv(m.serviceType),
      escapeCsv(m.mileage || 0),
      escapeCsv(m.cost),
      escapeCsv(m.status),
      escapeCsv(m.nextServiceDate ? new Date(m.nextServiceDate).toISOString().split('T')[0] : 'None'),
      escapeCsv(m.description || ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="smartfleet_maintenance_${Date.now()}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  exportBookingsCsv,
  exportVehiclesCsv,
  exportMaintenanceCsv,
};
