const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Student = require("../models/student");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "kiet_hostel_super_secure_jwt_secret_key_2026", {
    expiresIn: "30d",
  });
};

// Register Student (Public registration creates Student accounts ONLY)
const registerStudent = async (req, res) => {
  try {
    const { name, email, password, rollNo, course, campus, year, roomNo } = req.body;

    if (!name || !email || !password || !rollNo) {
      return res.status(400).json({ message: "Name, email, password, and Roll Number are required." });
    }

    const cleanRollNo = rollNo.trim().toUpperCase();
    const cleanEmail = email.toLowerCase().trim();

    // 1. Check if email already exists in User collection
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ message: "An account already exists with this email address." });
    }

    // 2. Check if Student record exists with this Rollno
    let studentRecord = await Student.findOne({ Rollno: cleanRollNo });

    if (studentRecord) {
      // 3. Check if a User account is ALREADY linked to this Student record
      const existingLinkedUser = await User.findOne({ student: studentRecord._id });
      if (existingLinkedUser) {
        return res.status(400).json({
          message: `A student account with Roll Number "${cleanRollNo}" already exists. Please sign in or contact administration.`,
        });
      }
    } else {
      // 4. Create new Student record if none exists
      studentRecord = await Student.create({
        Name: name.trim(),
        Rollno: cleanRollNo,
        Course: course ? course.trim() : "General",
        Campus: campus ? campus.trim() : "Main Campus",
        Year: Number(year) || 1,
        Roomno: roomNo ? roomNo.trim() : "Unassigned",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create User account linked to studentRecord
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: "Student",
      student: studentRecord._id,
    });

    const populatedUser = await User.findById(user._id).select("-password").populate("student");

    res.status(201).json({
      _id: populatedUser._id,
      name: populatedUser.name,
      email: populatedUser.email,
      role: populatedUser.role,
      student: populatedUser.student,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate entry detected: Email or Roll Number is already registered.",
      });
    }
    res.status(500).json({ message: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).populate("student");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      student: user.student,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user profile
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password").populate("student");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerStudent,
  loginUser,
  getMe,
};
