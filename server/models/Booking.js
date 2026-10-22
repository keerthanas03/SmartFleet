const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required'],
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle reference is required'],
    },
    pickupDate: {
      type: Date,
      required: [true, 'Pickup date is required'],
    },
    returnDate: {
      type: Date,
      required: [true, 'Return date is required'],
    },
    pickupLocation: {
      type: String,
      required: [true, 'Pickup location is required'],
      trim: true,
    },
    returnLocation: {
      type: String,
      required: [true, 'Return location is required'],
      trim: true,
    },
    numberOfDays: {
      type: Number,
      required: true,
      min: [1, 'Rental must be at least 1 day'],
    },
    baseAmount: {
      type: Number,
      required: true,
      min: [0, 'Base amount cannot be negative'],
    },
    taxAmount: {
      type: Number,
      required: true,
      min: [0, 'Tax amount cannot be negative'],
    },
    insuranceAmount: {
      type: Number,
      required: true,
      default: 500,
      min: [0, 'Insurance amount cannot be negative'],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
        message: '{VALUE} is not a valid booking status',
      },
      default: 'PENDING',
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
        message: '{VALUE} is not a valid payment status',
      },
      default: 'PENDING',
    },
    razorpayOrderId: {
      type: String,
      default: '',
    },
    razorpayPaymentId: {
      type: String,
      default: '',
    },
    paidAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for high performance queries
bookingSchema.index({ customer: 1 });
bookingSchema.index({ vehicle: 1 });
bookingSchema.index({ pickupDate: 1, returnDate: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
