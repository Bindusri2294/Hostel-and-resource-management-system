/**
 * Script to restore vacated/inactive students back to Active status.
 * 
 * Students to restore:
 *   - S.BALAMANU
 *   - MEESALA MEENA
 *   - CHITTULURI MEENA
 *   - GURRAM SRI SANTOSHI
 * 
 * This script will:
 *   1. Find each student by name
 *   2. Show their current details
 *   3. Set Student.Status back to "Active"
 *   4. Set their Allocation.status back to "Active" and clear vacatedDate
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const Student = require("../models/student");
const Allocation = require("../models/Allocation");

const STUDENTS_TO_RESTORE = [
  "S.BALAMANU",
  "MEESALA MEENA",
  "CHITTULURI MEENA",
  "GURRAM SRI SANTOSHI",
];

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB\n");

    for (const name of STUDENTS_TO_RESTORE) {
      console.log(`========== Looking for: ${name} ==========`);

      // Case-insensitive search to be safe
      const student = await Student.findOne({
        Name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") },
      });

      if (!student) {
        console.log(`  ❌ Student NOT FOUND in database\n`);
        continue;
      }

      console.log(`  Found: ${student.Name}`);
      console.log(`  Roll No: ${student.Rollno}`);
      console.log(`  Course: ${student.Course}`);
      console.log(`  Block: ${student.Block}, Room: ${student.Roomno}`);
      console.log(`  Current Status: ${student.Status}`);

      // Find their allocation(s)
      const allocations = await Allocation.find({ studentId: student._id }).sort({ createdAt: -1 });
      console.log(`  Allocations found: ${allocations.length}`);

      for (const alloc of allocations) {
        console.log(`    - Allocation ${alloc._id}: status=${alloc.status}, vacatedDate=${alloc.vacatedDate}`);
      }

      // --- Restore Student Status ---
      if (student.Status !== "Active") {
        await Student.updateOne({ _id: student._id }, { $set: { Status: "Active" } });
        console.log(`  ✅ Student status restored to "Active"`);
      } else {
        console.log(`  ℹ️  Student status is already "Active"`);
      }

      // --- Restore most recent Allocation ---
      if (allocations.length > 0) {
        const latestAlloc = allocations[0]; // most recent
        if (latestAlloc.status === "Vacated") {
          await Allocation.updateOne(
            { _id: latestAlloc._id },
            { $set: { status: "Active", vacatedDate: null } }
          );
          console.log(`  ✅ Latest allocation restored to "Active", vacatedDate cleared`);
        } else {
          console.log(`  ℹ️  Latest allocation is already "Active"`);
        }
      } else {
        console.log(`  ⚠️  No allocations found for this student`);
      }

      console.log();
    }

    console.log("Done! All students processed.");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

main();
