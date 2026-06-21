const Payment = require('../models/Payment');
const Room = require('../models/Room');
const Tenant = require('../models/Tenant');
const Utility = require('../models/Utility');

// Get payment overview for a specific month/year
// Returns all occupied rooms with their payment status and utility info
exports.getPaymentOverview = async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month);
    const y = parseInt(year);

    if (!m || !y) {
      return res.status(400).json({ message: 'Tháng và năm là bắt buộc' });
    }

    // Get all occupied rooms
    const rooms = await Room.find({ status: 'occupied' })
      .populate('leader', 'fullName phone')
      .sort({ roomNumber: 1 });

    const overview = await Promise.all(
      rooms.map(async (room) => {
        const tenantCount = await Tenant.countDocuments({ room: room._id, active: true });

        // Get utility for current month
        const currentUtil = await Utility.findOne({ room: room._id, month: m, year: y });

        // Get utility for next month (for calculating usage)
        let nextMonth = m + 1;
        let nextYear = y;
        if (nextMonth === 13) {
          nextMonth = 1;
          nextYear = y + 1;
        }
        const nextUtil = await Utility.findOne({ room: room._id, month: nextMonth, year: nextYear });

        // Calculate electricity and water usage
        let electricityUsed = null;
        let waterUsed = null;
        let electricityCost = 0;
        let waterCost = 0;

        if (currentUtil && nextUtil) {
          // Single reading per month is stored in electricityEnd / waterEnd
          electricityUsed = nextUtil.electricityEnd - currentUtil.electricityEnd;
          waterUsed = nextUtil.waterEnd - currentUtil.waterEnd;
          
          if (electricityUsed < 0) electricityUsed = 0;
          if (waterUsed < 0) waterUsed = 0;

          const elecPrice = room.electricityPrice || 3000;
          const wPrice = room.waterPrice || 15000;
          electricityCost = electricityUsed * elecPrice;
          waterCost = waterUsed * wPrice;
        }

        // Get or create payment record
        let payment = await Payment.findOne({ room: room._id, month: m, year: y });

        const serviceFee = room.serviceFeePerPerson * tenantCount;

        if (!payment) {
          // Auto-create payment record for occupied rooms
          payment = await Payment.create({
            room: room._id,
            month: m,
            year: y,
            rent: room.monthlyRent,
            serviceFee,
            electricityCost,
            waterCost,
          });
        } else {
          // Update rent, service fee, and utility costs
          payment.rent = room.monthlyRent;
          payment.serviceFee = serviceFee;
          payment.electricityCost = electricityCost;
          payment.waterCost = waterCost;
          await payment.save();
        }

        return {
          _id: payment._id,
          room: {
            _id: room._id,
            roomNumber: room.roomNumber,
            floor: room.floor,
          },
          month: m,
          year: y,
          rent: room.monthlyRent,
          tenantCount,
          electricityUsed,
          waterUsed,
          electricityCost,
          waterCost,
          serviceFee,
          rentPaid: payment.rentPaid,
          servicePaid: payment.servicePaid,
          utilityPaid: payment.utilityPaid,
          note: payment.note,
        };
      })
    );

    console.log(`[PAYMENTS] Fetched payment overview for ${m}/${y}: ${overview.length} rooms`);
    res.json(overview);
  } catch (error) {
    console.error('[PAYMENTS] Error fetching payment overview:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle rent payment status
exports.toggleRentPaid = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Không tìm thấy bản ghi thanh toán' });
    }

    payment.rentPaid = !payment.rentPaid;
    await payment.save();

    console.log(`[PAYMENTS] Toggled rent paid=${payment.rentPaid} for payment ${payment._id}`);
    res.json(payment);
  } catch (error) {
    console.error('[PAYMENTS] Error toggling rent paid:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle service fee payment status
exports.toggleServicePaid = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Không tìm thấy bản ghi thanh toán' });
    }

    payment.servicePaid = !payment.servicePaid;
    await payment.save();

    console.log(`[PAYMENTS] Toggled service paid=${payment.servicePaid} for payment ${payment._id}`);
    res.json(payment);
  } catch (error) {
    console.error('[PAYMENTS] Error toggling service paid:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle electricity/water utility payment status
exports.toggleUtilityPaid = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Không tìm thấy bản ghi thanh toán' });
    }

    payment.utilityPaid = !payment.utilityPaid;
    await payment.save();

    console.log(`[PAYMENTS] Toggled utility paid=${payment.utilityPaid} for payment ${payment._id}`);
    res.json(payment);
  } catch (error) {
    console.error('[PAYMENTS] Error toggling utility paid:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Không tìm thấy bản ghi thanh toán' });
    }

    await Payment.findByIdAndDelete(req.params.id);
    console.log(`[PAYMENTS] Deleted payment ${req.params.id}`);
    res.json({ message: 'Xóa bản ghi thanh toán thành công' });
  } catch (error) {
    console.error('[PAYMENTS] Error deleting payment:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
