require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Student = require("../models/student");
const Room = require("../models/Room");

async function syncStudentBlocks() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const rooms = await Room.find({});
    const roomBlockMap = {};
    rooms.forEach((r) => {
      roomBlockMap[r.RoomNo] = r.Block;
    });

    const students = await Student.find({});
    let updatedCount = 0;

    for (const student of students) {
      const actualBlock = roomBlockMap[student.Roomno];
      if (actualBlock && student.Block !== actualBlock) {
        student.Block = actualBlock;
        await student.save();
        updatedCount++;
      }
    }

    console.log(`Successfully updated ${updatedCount} students with their real room blocks!`);

    const summary = {};
    const updatedStudents = await Student.find({});
    updatedStudents.forEach((s) => {
      summary[s.Block] = (summary[s.Block] || 0) + 1;
    });
    console.log("Updated Student Block counts:", summary);

    process.exit(0);
  } catch (error) {
    console.error("Error syncing student blocks:", error);
    process.exit(1);
  }
}

syncStudentBlocks();
