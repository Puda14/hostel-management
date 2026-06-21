const Tenant = require('../models/Tenant');
const Room = require('../models/Room');

exports.getAllTenants = async (req, res) => {
  try {
    const { room, active, search, unassigned } = req.query;
    const filter = {};
    if (room) filter.room = room;
    if (active !== undefined) filter.active = active === 'true';
    else filter.active = true;

    // Filter tenants who don't have a room assigned
    if (unassigned === 'true') {
      filter.room = null;
    }

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const tenants = await Tenant.find(filter)
      .populate('room', 'roomNumber floor')
      .sort({ fullName: 1 });

    console.log(`[TENANTS] Fetched ${tenants.length} tenants`);
    res.json(tenants);
  } catch (error) {
    console.error('[TENANTS] Error fetching tenants:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTenantById = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id).populate('room', 'roomNumber floor');

    if (!tenant) {
      return res.status(404).json({ message: 'Không tìm thấy khách thuê' });
    }

    console.log(`[TENANTS] Fetched tenant ${tenant.fullName}`);
    res.json(tenant);
  } catch (error) {
    console.error('[TENANTS] Error fetching tenant:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createTenant = async (req, res) => {
  try {
    const { fullName, phone } = req.body;

    const idCardFront = req.files?.idCardFront?.[0]
      ? `/uploads/${req.files.idCardFront[0].filename}`
      : null;
    const idCardBack = req.files?.idCardBack?.[0]
      ? `/uploads/${req.files.idCardBack[0].filename}`
      : null;

    const tenant = new Tenant({
      fullName,
      phone,
      idCardFront,
      idCardBack,
      room: null,
      isLeader: false,
      moveInDate: Date.now(),
    });

    await tenant.save();

    const populatedTenant = await Tenant.findById(tenant._id).populate('room', 'roomNumber floor');

    console.log(`[TENANTS] Created tenant "${fullName}" (no room assigned)`);
    res.status(201).json(populatedTenant);
  } catch (error) {
    console.error('[TENANTS] Error creating tenant:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Assign a tenant to a room
exports.assignRoom = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ message: 'Không tìm thấy khách thuê' });
    }

    const { roomId } = req.body;
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }

    const currentTenants = await Tenant.countDocuments({ room: roomId, active: true });
    if (currentTenants >= room.maxOccupants) {
      return res.status(400).json({ message: 'Phòng đã đạt số người ở tối đa' });
    }

    tenant.room = roomId;
    tenant.moveInDate = new Date();
    await tenant.save();

    room.status = 'occupied';
    await room.save();

    const populatedTenant = await Tenant.findById(tenant._id).populate('room', 'roomNumber floor');

    console.log(`[TENANTS] Assigned "${tenant.fullName}" to room ${room.roomNumber}`);
    res.json(populatedTenant);
  } catch (error) {
    console.error('[TENANTS] Error assigning room:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove a tenant from their room (unassign)
exports.unassignRoom = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ message: 'Không tìm thấy khách thuê' });
    }

    if (!tenant.room) {
      return res.status(400).json({ message: 'Khách thuê này chưa được gán vào phòng nào' });
    }

    const oldRoom = await Room.findById(tenant.room);

    // If tenant was the leader, remove leader from room
    if (oldRoom && oldRoom.leader?.toString() === tenant._id.toString()) {
      oldRoom.leader = null;
    }

    tenant.isLeader = false;
    tenant.room = null;
    await tenant.save();

    // Check if old room still has tenants
    if (oldRoom) {
      const remaining = await Tenant.countDocuments({ room: oldRoom._id, active: true });
      if (remaining === 0) {
        oldRoom.status = 'available';
      }
      await oldRoom.save();
    }

    const populatedTenant = await Tenant.findById(tenant._id).populate('room', 'roomNumber floor');

    console.log(`[TENANTS] Unassigned "${tenant.fullName}" from room ${oldRoom?.roomNumber || 'unknown'}`);
    res.json(populatedTenant);
  } catch (error) {
    console.error('[TENANTS] Error unassigning room:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ message: 'Không tìm thấy khách thuê' });
    }

    const { fullName, phone, isLeader, moveInDate, moveOutDate, active } = req.body;

    if (req.files?.idCardFront?.[0]) {
      tenant.idCardFront = `/uploads/${req.files.idCardFront[0].filename}`;
    }
    if (req.files?.idCardBack?.[0]) {
      tenant.idCardBack = `/uploads/${req.files.idCardBack[0].filename}`;
    }

    // Handle leader change
    const setAsLeader = isLeader === 'true' || isLeader === true;
    const unsetLeader = isLeader === 'false' || isLeader === false;

    if (setAsLeader && tenant.room) {
      await Tenant.updateMany(
        { room: tenant.room, active: true, _id: { $ne: tenant._id } },
        { isLeader: false }
      );
      tenant.isLeader = true;
      await Room.findByIdAndUpdate(tenant.room, { leader: tenant._id });
    } else if (unsetLeader) {
      tenant.isLeader = false;
      if (tenant.room) {
        const currentRoom = await Room.findById(tenant.room);
        if (currentRoom?.leader?.toString() === tenant._id.toString()) {
          currentRoom.leader = null;
          await currentRoom.save();
        }
      }
    }

    if (fullName) tenant.fullName = fullName;
    if (phone) tenant.phone = phone;
    if (moveInDate) tenant.moveInDate = moveInDate;
    if (moveOutDate) tenant.moveOutDate = moveOutDate;

    if (active !== undefined) {
      tenant.active = active === 'true' || active === true;
      if (!tenant.active) {
        tenant.moveOutDate = new Date();
        if (tenant.room) {
          const remaining = await Tenant.countDocuments({
            room: tenant.room,
            active: true,
            _id: { $ne: tenant._id },
          });
          if (remaining === 0) {
            await Room.findByIdAndUpdate(tenant.room, { status: 'available', leader: null });
          } else {
            const rm = await Room.findById(tenant.room);
            if (rm?.leader?.toString() === tenant._id.toString()) {
              rm.leader = null;
              await rm.save();
            }
          }
        }
      }
    }

    await tenant.save();
    const populatedTenant = await Tenant.findById(tenant._id).populate('room', 'roomNumber floor');

    console.log(`[TENANTS] Updated tenant "${tenant.fullName}"`);
    res.json(populatedTenant);
  } catch (error) {
    console.error('[TENANTS] Error updating tenant:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ message: 'Không tìm thấy khách thuê' });
    }

    tenant.active = false;
    tenant.moveOutDate = new Date();
    await tenant.save();

    if (tenant.room) {
      const remaining = await Tenant.countDocuments({ room: tenant.room, active: true });
      if (remaining === 0) {
        await Room.findByIdAndUpdate(tenant.room, { status: 'available', leader: null });
      } else {
        const room = await Room.findById(tenant.room);
        if (room?.leader?.toString() === tenant._id.toString()) {
          room.leader = null;
          await room.save();
        }
      }
    }

    console.log(`[TENANTS] Deactivated tenant "${tenant.fullName}"`);
    res.json({ message: 'Xóa khách thuê thành công' });
  } catch (error) {
    console.error('[TENANTS] Error deleting tenant:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
