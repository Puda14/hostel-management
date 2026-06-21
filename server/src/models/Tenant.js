const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    idCardFront: {
      type: String,
      default: null,
    },
    idCardBack: {
      type: String,
      default: null,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null,
    },
    isLeader: {
      type: Boolean,
      default: false,
    },
    moveInDate: {
      type: Date,
      default: Date.now,
    },
    moveOutDate: {
      type: Date,
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tenant', tenantSchema);
