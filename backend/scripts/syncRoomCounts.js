const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 }).then(async () => {
  const Room = require('../models/Room');
  const Allocation = require('../models/Allocation');

  const allocCounts = await Allocation.aggregate([
    { $match: { status: 'Active' } },
    { $group: { _id: '$roomId', count: { $sum: 1 } } },
  ]);

  const countMap = {};
  allocCounts.forEach(a => { countMap[String(a._id)] = a.count; });

  const rooms = await Room.find();
  let updated = 0;
  let totalOccupied = 0;
  let totalCapacity = 0;

  for (const room of rooms) {
    const liveCount = countMap[String(room._id)] || 0;
    totalOccupied += liveCount;
    totalCapacity += room.Capacity;
    if (room.OccupiedCount !== liveCount) {
      console.log(`Fixing room ${room.RoomNo} (Block ${room.Block}): OccupiedCount ${room.OccupiedCount} -> ${liveCount}`);
      room.OccupiedCount = liveCount;
      room.Status = liveCount >= room.Capacity ? 'Full' : (liveCount > 0 ? 'Partial' : 'Available');
      await room.save();
      updated++;
    }
  }

  console.log(`\nSummary:`);
  console.log(`- Synced: ${updated} room(s)`);
  console.log(`- Total rooms: ${rooms.length}`);
  console.log(`- Total occupied (from allocations): ${totalOccupied}`);
  console.log(`- Total capacity: ${totalCapacity}`);
  console.log(`- Available beds: ${totalCapacity - totalOccupied}`);
  process.exit(0);
}).catch(e => {
  console.error(e.message);
  process.exit(1);
});
