const Room = require('../models/Room');
const Tenant = require('../models/Tenant');

exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('leader', 'fullName phone').sort({ roomNumber: 1 });

    const roomsWithCount = await Promise.all(
      rooms.map(async (room) => {
        const tenantCount = await Tenant.countDocuments({ room: room._id, active: true });
        return { ...room.toObject(), tenantCount };
      })
    );

    console.log(`[ROOMS] Fetched ${rooms.length} rooms`);
    res.json(roomsWithCount);
  } catch (error) {
    console.error('[ROOMS] Error fetching rooms:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('leader', 'fullName phone');
    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }

    const tenants = await Tenant.find({ room: room._id, active: true });

    console.log(`[ROOMS] Fetched room ${room.roomNumber}`);
    res.json({ ...room.toObject(), tenants });
  } catch (error) {
    console.error('[ROOMS] Error fetching room:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const { roomNumber, floor, maxOccupants, monthlyRent, deposit, serviceFeePerPerson, electricityPrice, waterPrice } = req.body;

    const existing = await Room.findOne({ roomNumber });
    if (existing) {
      return res.status(400).json({ message: 'Số phòng đã tồn tại' });
    }

    const room = new Room({
      roomNumber,
      floor,
      maxOccupants,
      monthlyRent,
      deposit,
      serviceFeePerPerson,
      electricityPrice,
      waterPrice,
    });

    await room.save();
    console.log(`[ROOMS] Created room ${roomNumber}`);
    res.status(201).json(room);
  } catch (error) {
    console.error('[ROOMS] Error creating room:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const { roomNumber, floor, maxOccupants, monthlyRent, deposit, serviceFeePerPerson, status, depositPaid, electricityPrice, waterPrice } =
      req.body;

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }

    if (roomNumber && roomNumber !== room.roomNumber) {
      const existing = await Room.findOne({ roomNumber });
      if (existing) {
        return res.status(400).json({ message: 'Số phòng đã tồn tại' });
      }
    }

    Object.assign(room, {
      ...(roomNumber && { roomNumber }),
      ...(floor !== undefined && { floor }),
      ...(maxOccupants !== undefined && { maxOccupants }),
      ...(monthlyRent !== undefined && { monthlyRent }),
      ...(deposit !== undefined && { deposit }),
      ...(serviceFeePerPerson !== undefined && { serviceFeePerPerson }),
      ...(status && { status }),
      ...(depositPaid !== undefined && { depositPaid }),
      ...(electricityPrice !== undefined && { electricityPrice }),
      ...(waterPrice !== undefined && { waterPrice }),
    });

    await room.save();
    console.log(`[ROOMS] Updated room ${room.roomNumber}`);
    res.json(room);
  } catch (error) {
    console.error('[ROOMS] Error updating room:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }

    const tenantCount = await Tenant.countDocuments({ room: room._id, active: true });
    if (tenantCount > 0) {
      return res.status(400).json({ message: 'Không thể xóa phòng đang có người ở' });
    }

    await Room.findByIdAndDelete(req.params.id);
    console.log(`[ROOMS] Deleted room ${room.roomNumber}`);
    res.json({ message: 'Xóa phòng thành công' });
  } catch (error) {
    console.error('[ROOMS] Error deleting room:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
