const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: [true, 'Vehicle brand is required'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Vehicle model is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Model year is required'],
      min: [1990, 'Year must be 1990 or newer'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the far future'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Hatchback', 'Sedan', 'SUV', 'Luxury', 'Electric', 'Bike', 'Van'],
        message: '{VALUE} is not a valid vehicle category',
      },
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    fuelType: {
      type: String,
      required: [true, 'Fuel type is required'],
      enum: {
        values: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
        message: '{VALUE} is not a valid fuel type',
      },
    },
    transmission: {
      type: String,
      required: [true, 'Transmission type is required'],
      enum: {
        values: ['Manual', 'Automatic'],
        message: '{VALUE} is not a valid transmission type',
      },
    },
    seatingCapacity: {
      type: Number,
      required: [true, 'Seating capacity is required'],
      min: [1, 'Must have at least 1 seat'],
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Price per day is required'],
      min: [0, 'Price must be positive'],
    },
    location: {
      type: String,
      required: [true, 'Vehicle location is required'],
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    features: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: ['AVAILABLE', 'BOOKED', 'RENTED', 'MAINTENANCE', 'INACTIVE'],
        message: '{VALUE} is not a valid vehicle status',
      },
      default: 'AVAILABLE',
    },
    mileage: {
      type: Number,
      default: 0,
      min: [0, 'Mileage cannot be negative'],
    },
    nextServiceDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ category: 1 });
vehicleSchema.index({ location: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
