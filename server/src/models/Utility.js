const mongoose = require('mongoose');

const utilitySchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    electricityStart: {
      type: Number,
      default: 0,
    },
    electricityEnd: {
      type: Number,
      default: 0,
    },
    electricityUsed: {
      type: Number,
      default: 0,
    },
    waterStart: {
      type: Number,
      default: 0,
    },
    waterEnd: {
      type: Number,
      default: 0,
    },
    waterUsed: {
      type: Number,
      default: 0,
    },
    isFinalized: {
      type: Boolean,
      default: false,
    },
    finalizedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

utilitySchema.index({ room: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Utility', utilitySchema);
