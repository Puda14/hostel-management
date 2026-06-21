const Room = require('../models/Room');
const Tenant = require('../models/Tenant');
const Payment = require('../models/Payment');

exports.getStats = async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ status: 'occupied' });
    const availableRooms = await Room.countDocuments({ status: 'available' });
    const totalTenants = await Tenant.countDocuments({ active: true });

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const monthlyPayments = await Payment.find({ month: currentMonth, year: currentYear });
    const totalRevenue = monthlyPayments.reduce(
      (sum, p) => sum + (p.isPaid ? p.totalAmount : 0),
      0
    );
    const unpaidCount = monthlyPayments.filter((p) => !p.isPaid).length;

    console.log('[DASHBOARD] Stats fetched');
    res.json({
      totalRooms,
      occupiedRooms,
      availableRooms,
      totalTenants,
      currentMonth,
      currentYear,
      totalRevenue,
      unpaidCount,
    });
  } catch (error) {
    console.error('[DASHBOARD] Error fetching stats:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
