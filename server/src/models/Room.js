const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    floor: {
      type: Number,
      required: true,
    },
    maxOccupants: {
      type: Number,
      required: true,
      default: 4,
    },
    monthlyRent: {
      type: Number,
      required: true,
    },
    deposit: {
      type: Number,
      default: 0,
    },
    serviceFeePerPerson: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'maintenance', 'deposited'],
      default: 'available',
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      default: null,
    },
    depositPaid: {
      type: Boolean,
      default: false,
    },
    electricityPrice: {
      type: Number,
      default: 3000, // VNĐ / kWh
    },
    waterPrice: {
      type: Number,
      default: 15000, // VNĐ / m³
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);
