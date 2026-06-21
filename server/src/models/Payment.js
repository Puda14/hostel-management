const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    rent: {
      type: Number,
      default: 0,
    },
    serviceFee: {
      type: Number,
      default: 0,
    },
    rentPaid: {
      type: Boolean,
      default: false,
    },
    servicePaid: {
      type: Boolean,
      default: false,
    },
    utilityPaid: {
      type: Boolean,
      default: false,
    },
    electricityCost: {
      type: Number,
      default: 0,
    },
    waterCost: {
      type: Number,
      default: 0,
    },
    note: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

paymentSchema.index({ room: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payment', paymentSchema);
