const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Student = require("../models/student");

const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in environment variables");
  }
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
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
    const rawIdentifier = req.body.userId || req.body.email || req.body.rollNo || req.body.identifier || "";
    const { password } = req.body;

    const identifier = rawIdentifier.trim();

    if (!identifier || !password) {
      return res.status(400).json({ message: "Please provide User ID / Roll Number and password" });
    }

    let user = null;
    let studentMatch = null;

    // 1. Check if identifier looks like a roll number (try Student collection first)
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    studentMatch = await Student.findOne({
      Rollno: { $regex: new RegExp("^" + escapeRegex(identifier) + "$", "i") },
    });

    if (studentMatch) {
      // Student roll number found in DB — find linked User account
      user = await User.findOne({ student: studentMatch._id }).populate("student");

      if (!user) {
        // No User account yet — auto-create on first login if password = roll number
        const passwordMatchesRollNo = password.toUpperCase() === studentMatch.Rollno.toUpperCase();
        if (passwordMatchesRollNo) {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(studentMatch.Rollno, salt);
          const autoEmail = `${studentMatch.Rollno.toLowerCase().replace(/[^a-z0-9]/g, "")}@hostel.local`;
          const newUser = await User.create({
            name: studentMatch.Name,
            email: autoEmail,
            password: hashedPassword,
            role: "Student",
            student: studentMatch._id,
          });
          user = await User.findById(newUser._id).populate("student");
          console.log(`[AUTH] Auto-created User account for student: ${studentMatch.Rollno}`);
        } else {
          // Roll number found but wrong password on first login
          return res.status(401).json({
            message: "Incorrect password. Your default password is your roll number.",
          });
        }
      }
    } else {
      // 2. Not a roll number — search by email or admin name
      const cleanLower = identifier.toLowerCase();
      user = await User.findOne({
        $or: [
          { email: cleanLower },
          { name: { $regex: new RegExp("^" + escapeRegex(identifier) + "$", "i") } },
        ],
      }).populate("student");

      // 3. Fallback: 'admin' / 'admin1' shortcut
      if (!user && (identifier.toLowerCase() === "admin" || identifier.toLowerCase() === "admin1")) {
        user = await User.findOne({ role: "Admin" }).populate("student");
      }

      // If still no user found and it could be a student roll number that's not registered
      if (!user) {
        // Check if it looks like a roll number pattern (alphanumeric, no spaces)
        const looksLikeRollNo = /^[a-zA-Z0-9]+$/.test(identifier) && identifier.length >= 5;
        if (looksLikeRollNo) {
          return res.status(404).json({
            message: "Student not registered. Please contact the hostel administration.",
          });
        }
        return res.status(404).json({
          message: "User does not exist. Please check your credentials.",
        });
      }
    }

    if (!user) {
      return res.status(404).json({ message: "User does not exist. Please check your credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password. Please try again." });
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
