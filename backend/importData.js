require("dotenv").config();

const mongoose = require("mongoose");
const XLSX = require("xlsx");
const path = require("path");

const Student = require("./models/Student");
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

      // 1. Insert Rooms from current sheet
      const roomDocs = await Room.insertMany(
        rooms.map((r) => ({
          RoomNo: String(r.RoomNo).trim(),
          Block: String(r.Block).trim(),
          Floor: Number(r.Floor),
          Capacity: Number(r.Capacity),
          OccupiedCount: Number(r.OccupiedCount),
          Status: String(r.Status).trim(),
        }))
      );

      // Map RoomNo -> Room Document _id for this specific sheet
      const sheetRoomMap = new Map();
      roomDocs.forEach((r) => sheetRoomMap.set(r.RoomNo, r._id));
      totalRoomsCount += roomDocs.length;

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
        const roomId = sheetRoomMap.get(roomNo);

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