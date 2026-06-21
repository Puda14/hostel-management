const Utility = require('../models/Utility');
const Room = require('../models/Room');

exports.getUtilities = async (req, res) => {
  try {
    const { month, year, room } = req.query;
    const filter = {};
    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);
    if (room) filter.room = room;

    const utilities = await Utility.find(filter)
      .populate('room', 'roomNumber floor')
      .sort({ 'room.roomNumber': 1 });

    console.log(`[UTILITIES] Fetched ${utilities.length} utility records`);
    res.json(utilities);
  } catch (error) {
    console.error('[UTILITIES] Error fetching utilities:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createOrUpdateUtility = async (req, res) => {
  try {
    const { room, month, year, electricityStart, electricityEnd, waterStart, waterEnd } = req.body;

    const roomDoc = await Room.findById(room);
    if (!roomDoc) {
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }

    let utility = await Utility.findOne({ room, month: parseInt(month), year: parseInt(year) });

    if (utility) {
      if (utility.isFinalized) {
        return res.status(400).json({ message: 'Bản ghi điện nước đã được chốt, không thể chỉnh sửa' });
      }
      if (electricityStart !== undefined) utility.electricityStart = electricityStart;
      if (electricityEnd !== undefined) utility.electricityEnd = electricityEnd;
      if (waterStart !== undefined) utility.waterStart = waterStart;
      if (waterEnd !== undefined) utility.waterEnd = waterEnd;
      await utility.save();
    } else {
      utility = await Utility.create({
        room,
        month: parseInt(month),
        year: parseInt(year),
        electricityStart: electricityStart || 0,
        electricityEnd: electricityEnd || 0,
        waterStart: waterStart || 0,
        waterEnd: waterEnd || 0,
      });
    }

    const populated = await Utility.findById(utility._id).populate('room', 'roomNumber floor');

    console.log(`[UTILITIES] Saved utility for room ${roomDoc.roomNumber} - ${month}/${year}`);
    res.json(populated);
  } catch (error) {
    console.error('[UTILITIES] Error saving utility:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.finalizeUtility = async (req, res) => {
  try {
    const utility = await Utility.findById(req.params.id);
    if (!utility) {
      return res.status(404).json({ message: 'Không tìm thấy bản ghi điện nước' });
    }

    if (utility.isFinalized) {
      return res.status(400).json({ message: 'Chỉ số điện nước đã được chốt trước đó' });
    }

    utility.electricityUsed = utility.electricityEnd - utility.electricityStart;
    utility.waterUsed = utility.waterEnd - utility.waterStart;
    utility.isFinalized = true;
    utility.finalizedAt = new Date();

    await utility.save();
    const populated = await Utility.findById(utility._id).populate('room', 'roomNumber floor');

    console.log(
      `[UTILITIES] Finalized: room=${populated.room.roomNumber}, electricity=${utility.electricityUsed}kWh, water=${utility.waterUsed}m³`
    );
    res.json(populated);
  } catch (error) {
    console.error('[UTILITIES] Error finalizing utility:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.unfinalizeUtility = async (req, res) => {
  try {
    const utility = await Utility.findById(req.params.id);
    if (!utility) {
      return res.status(404).json({ message: 'Không tìm thấy bản ghi điện nước' });
    }

    utility.isFinalized = false;
    utility.finalizedAt = null;
    utility.electricityUsed = 0;
    utility.waterUsed = 0;

    await utility.save();
    const populated = await Utility.findById(utility._id).populate('room', 'roomNumber floor');

    console.log(`[UTILITIES] Unfinalized utility ${utility._id}`);
    res.json(populated);
  } catch (error) {
    console.error('[UTILITIES] Error unfinalizing utility:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUtility = async (req, res) => {
  try {
    const utility = await Utility.findById(req.params.id);
    if (!utility) {
      return res.status(404).json({ message: 'Không tìm thấy bản ghi điện nước' });
    }

    await Utility.findByIdAndDelete(req.params.id);
    console.log(`[UTILITIES] Deleted utility record ${req.params.id}`);
    res.json({ message: 'Utility record deleted' });
  } catch (error) {
    console.error('[UTILITIES] Error deleting utility:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
