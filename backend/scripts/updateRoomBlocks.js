// ONE-TIME MIGRATION SCRIPT — Already applied on 2026-09-23
// Updates Room Block and Floor fields based on Excel data (3rd_yr_kiet, 3rd_yr_kw, Final_yr_kw)
// Safe to re-run — duplicate match entries will simply find nothing and be skipped
require("dotenv").config();
const mongoose = require("mongoose");
const Room = require("../models/Room");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const updates = [
    // --- Block D ---
    { match: { RoomNo: "208", Capacity: 16 }, set: { Block: "D", Floor: 2 } },
    { match: { RoomNo: "209", Capacity: 16 }, set: { Block: "D", Floor: 2 } },
    { match: { RoomNo: "210", Capacity: 16 }, set: { Block: "D", Floor: 2 } },
    { match: { RoomNo: "411", Capacity: 12 }, set: { Block: "D", Floor: 4 } },
    { match: { RoomNo: "412", Capacity: 12 }, set: { Block: "D", Floor: 4 } },
    { match: { RoomNo: "413", Capacity: 12 }, set: { Block: "D", Floor: 4 } },
    { match: { RoomNo: "414", Capacity: 12 }, set: { Block: "D", Floor: 4 } },
    { match: { RoomNo: "415", Capacity: 12 }, set: { Block: "D", Floor: 4 } },
    { match: { RoomNo: "416", Capacity: 12 }, set: { Block: "D", Floor: 4 } },
    { match: { RoomNo: "417", Capacity: 12 }, set: { Block: "D", Floor: 4 } },
    { match: { RoomNo: "418", Capacity: 12 }, set: { Block: "D", Floor: 4 } },
    { match: { RoomNo: "419", Capacity: 12 }, set: { Block: "D", Floor: 4 } },
    { match: { RoomNo: "420", Capacity: 12 }, set: { Block: "D", Floor: 4 } },
    { match: { RoomNo: "421", Capacity: 12 }, set: { Block: "D", Floor: 4 } },
    { match: { RoomNo: "422", Capacity: 12 }, set: { Block: "D", Floor: 4 } },
    { match: { RoomNo: "423", Capacity: 12 }, set: { Block: "D", Floor: 4 } },
    { match: { RoomNo: "424", Capacity: 12 }, set: { Block: "D", Floor: 4 } },

    // --- Block E ---
    { match: { RoomNo: "101", Capacity: 6 }, set: { Block: "E", Floor: 1 } },
    { match: { RoomNo: "202", Capacity: 6 }, set: { Block: "E", Floor: 2 } },
    { match: { RoomNo: "203", Capacity: 6 }, set: { Block: "E", Floor: 2 } },
    { match: { RoomNo: "204", Capacity: 6 }, set: { Block: "E", Floor: 2 } },
    { match: { RoomNo: "406", Capacity: 6, OccupiedCount: 1 }, set: { Block: "E", Floor: 4 } },

    // --- Block KW ---
    { match: { RoomNo: "203", Capacity: 8 }, set: { Block: "KW", Floor: 2 } },
    { match: { RoomNo: "301" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "302" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "303" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "304" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "305" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "306" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "307" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "308" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "309" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "310" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "311" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "312" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "313" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "314" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "315" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "316" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "317" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "318" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "319" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "320" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "321" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "322" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "323" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "324" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "325" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "326" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "327" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "328" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "329" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "336" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "337" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "338" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "342" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "343" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "344" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "345" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "347" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "348" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "349" }, set: { Block: "KW", Floor: 3 } },
    { match: { RoomNo: "350" }, set: { Block: "KW", Floor: 3 } },

    // --- Block Executive ---
    { match: { RoomNo: "406", Capacity: 6, OccupiedCount: 4 }, set: { Block: "Executive", Floor: 1 } },
    { match: { RoomNo: "409", OccupiedCount: 2 }, set: { Block: "Executive", Floor: 1 } },
    { match: { RoomNo: "409", OccupiedCount: 3 }, set: { Block: "Executive", Floor: 1 } },
    { match: { RoomNo: "410" }, set: { Block: "Executive", Floor: 1 } },
    { match: { RoomNo: "411", Capacity: 6 }, set: { Block: "Executive", Floor: 1 } },
    { match: { RoomNo: "417", Capacity: 9 }, set: { Block: "Executive", Floor: 2 } },
    { match: { RoomNo: "417", Capacity: 8 }, set: { Block: "Executive", Floor: 2 } },

    // --- A-101 (unassigned test rooms -> E block) ---
    { match: { RoomNo: "A-101" }, set: { Block: "E", Floor: 1 } },
  ];

  let totalUpdated = 0;
  for (const u of updates) {
    const result = await Room.updateMany(u.match, { $set: u.set });
    if (result.modifiedCount > 0) {
      console.log(`✅ Updated ${result.modifiedCount} room(s): ${JSON.stringify(u.match)} -> Block ${u.set.Block}, Floor ${u.set.Floor}`);
      totalUpdated += result.modifiedCount;
    }
  }

  console.log("\n=== DONE ===");
  console.log("Total rooms updated:", totalUpdated);

  // Verify final state
  const blocks = await Room.distinct("Block");
  console.log("Distinct blocks now:", blocks);

  const summary = await Room.aggregate([
    { $group: { _id: "$Block", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  console.log("\nRooms per block:");
  summary.forEach(s => console.log(`  Block ${s._id}: ${s.count} rooms`));

  mongoose.disconnect();
}).catch(e => console.error(e.message));
