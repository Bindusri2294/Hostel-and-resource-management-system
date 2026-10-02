const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Student = require("../models/student");
const User = require("../models/User");

const studentFilter = (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { $or: [{ _id: id }, { Rollno: id }] };
  }
  return { Rollno: id };
};

const Allocation = require("../models/Allocation");
const Room = require("../models/Room");

// Helper to sync allocation when student room/block changes
const syncStudentAllocation = async (student) => {
  try {
    const isAssigned = student.Roomno && student.Roomno !== "Unassigned" && student.Roomno.trim() !== "";
    if (isAssigned) {
      const room = await Room.findOne({
        RoomNo: student.Roomno,
        ...(student.Block ? { Block: student.Block } : {}),
      });

      if (room) {
        // Find existing active allocation
        const activeAlloc = await Allocation.findOne({
          studentId: student._id,
          status: "Active",
        });

        if (!activeAlloc) {
          await Allocation.create({
            studentId: student._id,
            roomId: room._id,
            allocatedDate: new Date(),
            status: "Active",
          });
        } else if (String(activeAlloc.roomId) !== String(room._id)) {
          // Changed room: vacate previous and create new
          activeAlloc.status = "Vacated";
          activeAlloc.vacatedDate = new Date();
          await activeAlloc.save();

          await Allocation.create({
            studentId: student._id,
            roomId: room._id,
            allocatedDate: new Date(),
            status: "Active",
          });
        }
      }
    } else {
      // If unassigned, vacate any active allocation
      await Allocation.updateMany(
        { studentId: student._id, status: "Active" },
        { status: "Vacated", vacatedDate: new Date() }
      );
    }
  } catch (err) {
    console.error("Error syncing student allocation:", err.message);
  }
};

// Create a student (Admin only)
// Auto-creates or links User login account with roll number as default password
const createStudent = async (req, res, next) => {
  let createdStudentId = null;
  try {
    const rawRollno = req.body.Rollno ? req.body.Rollno.trim().toUpperCase() : "";
    if (!rawRollno) {
      return res.status(400).json({ message: "Roll Number is required" });
    }

    req.body.Rollno = rawRollno;
    if (req.body.Name) req.body.Name = req.body.Name.trim();

    // Check if student with this Rollno already exists
    const existingStudent = await Student.findOne({ Rollno: rawRollno });
    if (existingStudent) {
      return res.status(400).json({
        message: `Student with roll number "${rawRollno}" already exists.`,
      });
    }

    const student = await Student.create(req.body);
    createdStudentId = student._id;

    // Auto-create or link User login account
    const email = `${rawRollno.toLowerCase().replace(/[^a-z0-9]/g, "")}@hostel.local`;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawRollno, salt);

    // Find if user already exists (by student ID or email)
    const existingUser = await User.findOne({
      $or: [{ student: student._id }, { email }],
    });

    if (existingUser) {
      existingUser.student = student._id;
      existingUser.name = student.Name;
      existingUser.role = "Student";
      await existingUser.save();
    } else {
      await User.create({
        name: student.Name,
        email,
        password: hashedPassword,
        role: "Student",
        student: student._id,
      });
    }

    // Auto-sync room allocation if room is assigned
    await syncStudentAllocation(student);

    res.status(201).json(student);
  } catch (error) {
    // If student was created but subsequent operations failed, rollback student
    if (createdStudentId) {
      try {
        await Student.findByIdAndDelete(createdStudentId);
      } catch (cleanupErr) {
        console.error("Failed to rollback student creation:", cleanupErr.message);
      }
    }
    next(error);
  }
};

// Get all students
const getStudents = async (req, res, next) => {
  try {
    const students = await Student.find().lean();
    const users = await User.find({ role: "Student" }).select("email student");
    const emailByStudentId = new Map(users.map((user) => [String(user.student), user.email]));
    res.status(200).json(
      students.map((student) => ({
        ...student,
        email: emailByStudentId.get(String(student._id)) || "",
      }))
    );
  } catch (error) {
    next(error);
  }
};

// Get student by Rollno or _id
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findOne(studentFilter(req.params.id));
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    next(error);
  }
};

// Update a student
const updateStudent = async (req, res, next) => {
  try {
    if (req.body.Rollno) {
      req.body.Rollno = req.body.Rollno.trim().toUpperCase();
    }
    if (req.body.Name) {
      req.body.Name = req.body.Name.trim();
    }

    const student = await Student.findOneAndUpdate(
      studentFilter(req.params.id),
      req.body,
      { returnDocument: "after", runValidators: true }
    );
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Update linked user name / email if Rollno or Name changed
    if (req.body.Name || req.body.Rollno) {
      const email = `${student.Rollno.toLowerCase().replace(/[^a-z0-9]/g, "")}@hostel.local`;
      await User.updateMany(
        { student: student._id },
        {
          name: student.Name,
          email,
        }
      );
    }

    // Auto-sync room allocation if room changed
    await syncStudentAllocation(student);

    res.status(200).json(student);
  } catch (error) {
    next(error);
  }
};

// Delete a student
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findOneAndDelete(studentFilter(req.params.id));
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Clean up active allocations
    await Allocation.updateMany(
      { studentId: student._id, status: "Active" },
      { status: "Vacated", vacatedDate: new Date() }
    );

    // Clean up linked user account
    const email = student.Rollno
      ? `${student.Rollno.toLowerCase().replace(/[^a-z0-9]/g, "")}@hostel.local`
      : null;
    await User.deleteMany({
      $or: [
        { student: student._id },
        ...(email ? [{ email }] : []),
      ],
    });

    res.status(200).json({ message: "Student deleted successfully", student });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};