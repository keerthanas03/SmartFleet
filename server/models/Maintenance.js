const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle reference is required'],
    },
    serviceDate: {
      type: Date,
      required: [true, 'Service date is required'],
    },
    mileage: {
      type: Number,
      required: [true, 'Current mileage is required'],
      min: [0, 'Mileage cannot be negative'],
    },
    serviceType: {
      type: String,
      required: [true, 'Service type is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    cost: {
      type: Number,
      required: [true, 'Maintenance cost is required'],
      min: [0, 'Cost cannot be negative'],
    },
    nextServiceDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: {
        values: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'],
        message: '{VALUE} is not a valid maintenance status',
      },
      default: 'SCHEDULED',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
maintenanceSchema.index({ vehicle: 1 });
maintenanceSchema.index({ status: 1 });
maintenanceSchema.index({ serviceDate: -1 });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
