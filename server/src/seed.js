require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Room = require('./models/Room');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[SEED] Connected to MongoDB');

    // Seed admin user
    const existingUser = await User.findOne({ username: 'adat123' });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('quanlynhatroadat', 12);
      await User.create({
        username: 'adat123',
        password: hashedPassword,
      });
      console.log('[SEED] Admin user created: adat123');
    } else {
      console.log('[SEED] Admin user already exists');
    }

    // Seed rooms
    const roomCount = await Room.countDocuments();
    if (roomCount === 0) {
      const rooms = [
        { roomNumber: '101', floor: 1, maxOccupants: 4, monthlyRent: 2500000, deposit: 2500000, serviceFeePerPerson: 100000 },
        { roomNumber: '102', floor: 1, maxOccupants: 3, monthlyRent: 2000000, deposit: 2000000, serviceFeePerPerson: 100000 },
        { roomNumber: '103', floor: 1, maxOccupants: 4, monthlyRent: 2500000, deposit: 2500000, serviceFeePerPerson: 100000 },
        { roomNumber: '201', floor: 2, maxOccupants: 4, monthlyRent: 2800000, deposit: 2800000, serviceFeePerPerson: 100000 },
        { roomNumber: '202', floor: 2, maxOccupants: 3, monthlyRent: 2200000, deposit: 2200000, serviceFeePerPerson: 100000 },
        { roomNumber: '203', floor: 2, maxOccupants: 4, monthlyRent: 2800000, deposit: 2800000, serviceFeePerPerson: 100000 },
        { roomNumber: '301', floor: 3, maxOccupants: 4, monthlyRent: 3000000, deposit: 3000000, serviceFeePerPerson: 100000 },
        { roomNumber: '302', floor: 3, maxOccupants: 3, monthlyRent: 2500000, deposit: 2500000, serviceFeePerPerson: 100000 },
      ];

      await Room.insertMany(rooms);
      console.log(`[SEED] Created ${rooms.length} rooms`);
    } else {
      console.log(`[SEED] Rooms already exist (${roomCount} rooms)`);
    }

    console.log('[SEED] Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('[SEED] Error:', error.message);
    process.exit(1);
  }
};

seedData();
