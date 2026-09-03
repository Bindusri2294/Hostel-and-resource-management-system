const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Student = require("../models/student");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: "30d",
  });
};

// Register Student (Public registration creates Student accounts ONLY)
const registerStudent = async (req, res) => {
  try {
    const { name, email, password, rollNo, course, campus, year, roomNo } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Link or create Student model record
    let studentRecord;
    if (rollNo) {
      studentRecord = await Student.findOne({ Rollno: rollNo.trim() });
    }

    if (!studentRecord && rollNo) {
      studentRecord = await Student.create({
        Name: name,
        Rollno: rollNo.trim(),
        Course: course || "General",
        Campus: campus || "Main Campus",
        Year: Number(year) || 1,
        Roomno: roomNo || "Unassigned",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Force role to 'Student' for public registration
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "Student",
      student: studentRecord ? studentRecord._id : null,
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
