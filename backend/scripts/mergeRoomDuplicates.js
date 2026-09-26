require("dotenv").config();
const mongoose = require("mongoose");
const Room = require("../models/Room");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  // Find all rooms grouped by Block + RoomNo
  const allRooms = await Room.find({}).lean();

  // Group by Block + RoomNo
  const grouped = {};
  allRooms.forEach((r) => {
    const key = `${r.Block}__${r.RoomNo}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  // Find groups with duplicates
  const duplicates = Object.entries(grouped).filter(([, rooms]) => rooms.length > 1);

  if (duplicates.length === 0) {
    console.log("No duplicates found.");
    mongoose.disconnect();
    return;
  }

  console.log(`Found ${duplicates.length} duplicate group(s):\n`);

  for (const [key, rooms] of duplicates) {
    const [block, roomNo] = key.split("__");
    const totalOccupied = rooms.reduce((sum, r) => sum + (r.OccupiedCount || 0), 0);
    const maxCapacity = Math.max(...rooms.map((r) => r.Capacity || 0));
    const status = totalOccupied >= maxCapacity ? "Full" : "Available";

    console.log(`Block ${block} Room ${roomNo}:`);
    rooms.forEach((r) =>
      console.log(`  _id: ${r._id} | Cap: ${r.Capacity} | Occ: ${r.OccupiedCount}`)
    );
    console.log(`  → Merging into: Cap ${maxCapacity}, Occ ${totalOccupied}, Status: ${status}`);

    // Keep the first record, update it with merged values
    const keepId = rooms[0]._id;
    const deleteIds = rooms.slice(1).map((r) => r._id);

    await Room.updateOne(
      { _id: keepId },
      {
        $set: {
          Capacity: maxCapacity,
          OccupiedCount: totalOccupied,
          Status: status,
        },
      }
    );

    await Room.deleteMany({ _id: { $in: deleteIds } });
    console.log(`  ✅ Kept ${keepId}, deleted ${deleteIds.length} duplicate(s)\n`);
  }

  // Final summary
  const finalBlocks = await Room.aggregate([
    { $group: { _id: "$Block", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  console.log("=== FINAL ROOM COUNT PER BLOCK ===");
  finalBlocks.forEach((b) => console.log(`  Block ${b._id}: ${b.count} rooms`));

  const total = await Room.countDocuments();
  console.log(`  Total: ${total} rooms`);

  mongoose.disconnect();
}).catch((e) => console.error(e.message));
