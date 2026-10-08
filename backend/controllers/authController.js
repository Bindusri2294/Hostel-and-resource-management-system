const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Student = require("../models/student");
const PasswordResetRequest = require("../models/PasswordResetRequest");

const generateAccessToken = (id, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in environment variables");
  }
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (id, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in environment variables");
  }
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const sendAuthResponse = async (res, user, statusCode = 200) => {
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id, user.role);

  // Save refresh token to user (keep only the most recent tokens to prevent document bloat)
  user.refreshTokens = (user.refreshTokens || []).slice(-4);
  user.refreshTokens.push(refreshToken);
  await user.save();

  // Set HTTP-only cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(statusCode).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    student: user.student,
    token: accessToken,
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
    await sendAuthResponse(res, populatedUser, 201);
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
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // 1. If identifier contains '@', it is definitely an email
    if (identifier.includes("@")) {
      const cleanEmail = identifier.toLowerCase();
      user = await User.findOne({ email: cleanEmail }).populate("student");
    } else if (identifier.toLowerCase() === "admin" || identifier.toLowerCase() === "admin1") {
      // Admin username shortcut
      user = await User.findOne({ role: "Admin" }).populate("student");
    } else {
      // 2. Not an email: try Student roll number using exact index match first (O(1))
      const cleanUpper = identifier.toUpperCase();
      studentMatch = await Student.findOne({ Rollno: cleanUpper });

      // Fallback regex only if exact match didn't find anything
      if (!studentMatch) {
        studentMatch = await Student.findOne({
          Rollno: { $regex: new RegExp("^" + escapeRegex(identifier) + "$", "i") },
        });
      }

      if (studentMatch) {
        // Student roll number found in DB — find linked User account
        user = await User.findOne({ student: studentMatch._id }).populate("student");

        if (!user) {
          // No User account yet — auto-create on first login if password = roll number
          const passwordMatchesRollNo = password.toUpperCase() === studentMatch.Rollno.toUpperCase();
          if (passwordMatchesRollNo) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(studentMatch.Rollno, salt);
            const newUser = await User.create({
              name: studentMatch.Name,
              password: hashedPassword,
              role: "Student",
              student: studentMatch._id,
            });
            user = await User.findById(newUser._id).populate("student");
            console.log(`[AUTH] Auto-created User account for student: ${studentMatch.Rollno} (without email)`);
          } else {
            return res.status(401).json({
              message: "Incorrect password. Your default password is your roll number.",
            });
          }
        }
      } else {
        // Search by username
        user = await User.findOne({
          name: { $regex: new RegExp("^" + escapeRegex(identifier) + "$", "i") },
        }).populate("student");
      }
    }

    if (!user) {
      return res.status(404).json({ message: "User does not exist. Please check your credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password. Please try again." });
    }

    await sendAuthResponse(res, user, 200);
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

// Update current user profile (email)
const updateProfile = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (email) {
      const cleanEmail = email.toLowerCase().trim();

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({ message: "Please provide a valid email address." });
      }

      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email: cleanEmail, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ message: "This email is already in use by another account." });
      }

      user.email = cleanEmail;
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password").populate("student");
    res.status(200).json(updatedUser);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "This email is already in use." });
    }
    res.status(500).json({ message: error.message });
  }
};

// Refresh Token
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token provided." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate("student");

    if (!user || !user.refreshTokens.includes(token)) {
      res.clearCookie("refreshToken");
      return res.status(401).json({ message: "Invalid refresh token." });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    res.status(200).json({ token: accessToken });
  } catch (error) {
    res.clearCookie("refreshToken");
    return res.status(401).json({ message: "Expired or invalid refresh token." });
  }
};

// Logout User
const logoutUser = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      // Decode without verification just to get user ID if possible
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
        const user = await User.findById(decoded.id);
        if (user) {
          user.refreshTokens = user.refreshTokens.filter(rt => rt !== token);
          await user.save();
        }
      } catch (err) {
        console.error("Logout decode error", err);
      }
    }
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Contact Info
const updateContact = async (req, res) => {
  try {
    const { email, phone } = req.body;
    
    // Email uniqueness check if email is provided and not empty
    if (email && email.trim() !== "") {
      const existingUser = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: req.user._id } });
      if (existingUser) {
        return res.status(400).json({ message: "This email is already in use by another account." });
      }
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (email !== undefined) user.email = email.trim() === "" ? undefined : email.toLowerCase().trim();
    if (phone !== undefined) user.phone = phone.trim();

    await user.save();
    
    res.status(200).json({ 
      message: "Contact information updated successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Forgot Password - Send OTP
const forgotPassword = async (req, res) => {
  try {
    const { rollNo } = req.body;
    
    // Find student by roll number
    const student = await Student.findOne({ Rollno: { $regex: new RegExp("^" + rollNo + "$", "i") } });
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    // Find associated user
    const user = await User.findOne({ student: student._id });
    if (!user) {
      return res.status(404).json({ message: "Account not registered yet. Please login with your roll number first." });
    }

    if (!user.email) {
      return res.status(400).json({ message: "No email address found in your profile. Please contact the administration." });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash OTP before saving
    const salt = await bcrypt.genSalt(10);
    user.resetPasswordOTP = await bcrypt.hash(otp, salt);
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send Email
    const sendEmail = require("../utils/sendEmail");
    const message = `You requested a password reset.\n\nYour 6-digit OTP code is: ${otp}\n\nThis code will expire in 10 minutes.`;
    
    await sendEmail({
      email: user.email,
      subject: "Password Reset OTP",
      message,
    });

    const [name, domain] = user.email.split("@");
    const maskedName = name.length > 2 ? name.substring(0, 2) + "*".repeat(name.length - 2) : name;
    const maskedEmail = `${maskedName}@${domain}`;

    res.status(200).json({ message: `OTP sent to ${maskedEmail}`, maskedEmail });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { rollNo, otp } = req.body;
    
    const student = await Student.findOne({ Rollno: { $regex: new RegExp("^" + rollNo + "$", "i") } });
    if (!student) return res.status(404).json({ message: "Student not found." });

    const user = await User.findOne({ student: student._id });
    if (!user || !user.resetPasswordOTP || !user.resetPasswordExpires) {
      return res.status(400).json({ message: "Invalid request or OTP expired." });
    }

    if (user.resetPasswordExpires < Date.now()) {
      user.resetPasswordOTP = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    const isMatch = await bcrypt.compare(otp, user.resetPasswordOTP);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP code." });
    }

    // OTP verified - generate a temporary token for the actual reset step
    const resetToken = jwt.sign({ id: user._id, type: 'reset' }, process.env.JWT_SECRET, { expiresIn: '15m' });
    
    // Clear OTP
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "OTP verified successfully.", resetToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    
    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: "Please provide the reset token and new password." });
    }

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (decoded.type !== 'reset') {
      return res.status(400).json({ message: "Invalid token type." });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password reset successfully! You can now login." });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired reset token." });
  }
};

// Request Manual Password Reset
const requestManualReset = async (req, res) => {
  try {
    const { rollNo } = req.body;
    
    const student = await Student.findOne({ Rollno: { $regex: new RegExp("^" + rollNo + "$", "i") } });
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const user = await User.findOne({ student: student._id });
    if (!user) {
      return res.status(404).json({ message: "Account not registered yet." });
    }

    // Check if a pending request already exists
    const existingRequest = await PasswordResetRequest.findOne({ user: user._id, status: "Pending" });
    if (existingRequest) {
      return res.status(400).json({ message: "You already have a pending password reset request with the admin." });
    }

    await PasswordResetRequest.create({
      student: student._id,
      user: user._id,
      status: "Pending"
    });

    res.status(200).json({ message: "Your request has been sent to the administration office. They will reset your password to your roll number soon." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Password Reset Requests (Admin only)
const getResetRequests = async (req, res) => {
  try {
    const requests = await PasswordResetRequest.find({ status: "Pending" })
      .populate("student", "Name Rollno Course")
      .sort({ createdAt: 1 });
      
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Resolve Password Reset Request (Admin only)
const resolveResetRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const request = await PasswordResetRequest.findById(requestId).populate("student");
    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    if (!request.student || !request.student.Rollno) {
      return res.status(400).json({ message: "Associated student record or roll number not found." });
    }

    const user = await User.findById(request.user);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Reset password to Rollno
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(request.student.Rollno, salt);
    await user.save();

    // Mark request as resolved
    request.status = "Resolved";
    await request.save();

    res.status(200).json({ message: `Password for ${request.student.Rollno} reset successfully to their roll number.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerStudent,
  loginUser,
  getMe,
  updateProfile,
  refreshToken,
  logoutUser,
  updateContact,
  forgotPassword,
  verifyOTP,
  resetPassword,
  requestManualReset,
  getResetRequests,
  resolveResetRequest,
};

