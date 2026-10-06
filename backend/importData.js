require("dotenv").config();

const mongoose = require("mongoose");
const XLSX = require("xlsx");
const path = require("path");

const Student = require("./models/student");
const Room = require("./models/Room");
const Allocation = require("./models/Allocation");
const connectDB = require("./config/db");

// Excel files list
const files = [
  {
    path: path.join(__dirname, "data", "3rd_yr_kiet.xlsx"),
    studentSheet: "Students List",
    roomSheet: "Rooms List",
    label: "3rd Year KIET",
  },
  {
    path: path.join(__dirname, "data", "3rd_yr_kw.xlsx"),
    studentSheet: "Students List",
    roomSheet: "Rooms List",
    label: "3rd Year KW",
  },
  {
    path: path.join(__dirname, "data", "Final_yr_kw.xlsx"),
    studentSheet: "Students List",
    roomSheet: "Rooms List",
    label: "Final Year KW",
  },
];

const executiveRoomFloors = new Map([
  ["406", 1],
  ["409", 4],
  ["410", 4],
  ["411", 4],
  ["417", 4],
]);

// Helper to read Excel sheet safely
function readSheet(filePath, sheetName) {
  const workbook = XLSX.readFile(filePath);

  if (!workbook.SheetNames.includes(sheetName)) {
    throw new Error(
      `Sheet "${sheetName}" not found in ${filePath}. Available sheets: ${workbook.SheetNames.join(", ")}`
    );
  }

  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
}

// Clean up legacy collection indexes that might conflict with non-unique fields
async function cleanLegacyIndexes() {
  try {
    const roomsColl = mongoose.connection.collection("rooms");
    const indexes = await roomsColl.indexes();
    for (const idx of indexes) {
      if (idx.name !== "_id_") {
        console.log(`Dropping index "${idx.name}" from rooms collection...`);
        await roomsColl.dropIndex(idx.name);
      }
    }
  } catch (e) {
    // Collection or indexes might not exist yet
  }

  try {
    const studentsColl = mongoose.connection.collection("students");
    const indexes = await studentsColl.indexes();
    for (const idx of indexes) {
      if (idx.name !== "_id_" && idx.name !== "Rollno_1") {
        console.log(`Dropping legacy index "${idx.name}" from students collection...`);
        await studentsColl.dropIndex(idx.name);
      }
    }
  } catch (e) {
    // Collection or indexes might not exist yet
  }

  // Remove old legacy documents missing uppercase field schemas
  await Student.deleteMany({ $or: [{ Rollno: { $exists: false } }, { Rollno: null }] });
  await Room.deleteMany({ $or: [{ RoomNo: { $exists: false } }, { RoomNo: null }] });
}

async function importData() {
  try {
    console.log("\n========================================");
    console.log("HOSTEL DATA IMPORT");
    console.log("========================================\n");

    // Connect to MongoDB database
    await connectDB();
    console.log("MongoDB connected successfully.\n");

    // Clean legacy indexes and outdated test docs
    await cleanLegacyIndexes();

    // Re-sync schema indexes
    await Student.syncIndexes();
    await Room.syncIndexes();

    let totalRoomsCount = 0;
    let totalStudentsCount = 0;
    let totalAllocationsCount = 0;
    const executiveRoomMap = new Map();

    // Clear existing room & allocation collections for clean re-import
    await Room.deleteMany({});
    await Allocation.deleteMany({});

    // Read and import each Excel file
    for (const file of files) {
      console.log(`Processing ${file.label}...`);

      const students = readSheet(file.path, file.studentSheet);
      const rooms = readSheet(file.path, file.roomSheet);

      console.log(`✓ Students in sheet: ${students.length}`);
      console.log(`✓ Rooms in sheet: ${rooms.length}`);

      const studentsByRoom = new Map();
      students.forEach((student) => {
        const roomNo = String(student.Roomno).trim();
        studentsByRoom.set(roomNo, (studentsByRoom.get(roomNo) || 0) + 1);
      });

      // 1. Insert Rooms from current sheet
      const roomEntries = rooms.map((r) => {
          const roomNo = String(r.RoomNo).trim();
          const sourceBlock = String(r.Block).trim();
          const block = sourceBlock === "Exective" ? "Executive" : sourceBlock;
          const capacity = Number(r.Capacity);
          const occupiedCount = block === "Executive"
            ? studentsByRoom.get(roomNo) || 0
            : Number(r.OccupiedCount);

          return {
            roomNo,
            block,
            room: {
              RoomNo: roomNo,
              Block: block,
              Floor: block === "Executive"
                ? executiveRoomFloors.get(roomNo) ?? Number(r.Floor)
                : Number(r.Floor),
              Capacity: capacity,
              OccupiedCount: occupiedCount,
              Status: block === "Executive"
                ? occupiedCount >= capacity ? "Full" : "Available"
                : String(r.Status).trim(),
            },
          };
      });

      const sheetRoomMap = new Map();
      const roomEntriesToInsert = [];
      roomEntries.forEach((entry) => {
        if (entry.block === "Executive" && executiveRoomMap.has(entry.roomNo)) {
          sheetRoomMap.set(entry.roomNo, executiveRoomMap.get(entry.roomNo));
          return;
        }
        roomEntriesToInsert.push(entry);
      });

      const insertedRooms = await Room.insertMany(roomEntriesToInsert.map((entry) => entry.room));
      insertedRooms.forEach((room, index) => {
        const entry = roomEntriesToInsert[index];
        sheetRoomMap.set(entry.roomNo, room);
        if (entry.block === "Executive") {
          executiveRoomMap.set(entry.roomNo, room);
        }
      });
      totalRoomsCount += insertedRooms.length;

      // 2. Bulk Upsert Students from current sheet
      const studentOps = students.map((s) => ({
        updateOne: {
          filter: { Rollno: String(s.Rollno).trim() },
          update: {
            $set: {
              Name: String(s.Name).trim(),
              Rollno: String(s.Rollno).trim(),
              Course: String(s.Course).trim(),
              Campus: String(s.Campus).trim(),
              Year: Number(s.Year),
              Roomno: String(s.Roomno).trim(),
              ...(sheetRoomMap.has(String(s.Roomno).trim())
                ? { Block: sheetRoomMap.get(String(s.Roomno).trim()).Block }
                : {}),
            },
          },
          upsert: true,
        },
      }));

      if (studentOps.length > 0) {
        await Student.bulkWrite(studentOps);
      }
      totalStudentsCount += students.length;

      // 3. Query created student _ids for current sheet to build Allocations
      const rollNos = students.map((s) => String(s.Rollno).trim());
      const studentDocs = await Student.find({ Rollno: { $in: rollNos } });
      const studentDocMap = new Map();
      studentDocs.forEach((sd) => studentDocMap.set(sd.Rollno, sd._id));

      const allocationOps = [];
      for (const s of students) {
        const rollNo = String(s.Rollno).trim();
        const roomNo = String(s.Roomno).trim();
        const studentId = studentDocMap.get(rollNo);
        const roomId = sheetRoomMap.get(roomNo)?._id;

        if (studentId && roomId) {
          allocationOps.push({
            updateOne: {
              filter: { studentId },
              update: {
                $set: {
                  studentId,
                  roomId,
                  status: "Active",
                },
              },
              upsert: true,
            },
          });
        }
      }

      if (allocationOps.length > 0) {
        await Allocation.bulkWrite(allocationOps);
      }
      totalAllocationsCount += allocationOps.length;

      console.log(`✓ Completed ${file.label}\n`);
    }

    const executiveOccupancies = await Allocation.aggregate([
      { $match: { status: "Active" } },
      { $group: { _id: "$roomId", count: { $sum: 1 } } },
    ]);
    const executiveOccupancyMap = new Map(
      executiveOccupancies.map((entry) => [String(entry._id), entry.count])
    );
    for (const room of executiveRoomMap.values()) {
      room.OccupiedCount = executiveOccupancyMap.get(String(room._id)) || 0;
      room.Status = room.OccupiedCount >= room.Capacity ? "Full" : "Available";
      await room.save();
    }

    console.log("========================================");
    console.log("IMPORT COMPLETED SUCCESSFULLY");
    console.log("========================================");
    console.log(`Rooms imported:       ${totalRoomsCount}`);
    console.log(`Students imported:    ${totalStudentsCount}`);
    console.log(`Allocations created: ${totalAllocationsCount}`);
    console.log("========================================\n");

  } catch (error) {
    console.error("\n❌ IMPORT FAILED");
    console.error(error.message);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
}

importData();