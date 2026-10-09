const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/authController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/register", registerStudent);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.post("/refresh", refreshToken);
router.post("/logout", logoutUser);
router.put("/contact", protect, updateContact);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);
router.post("/request-manual-reset", requestManualReset);

// Admin-only Password Reset Management routes
router.get("/reset-requests", protect, authorize("Admin"), getResetRequests);
router.post("/reset-requests/:requestId/resolve", protect, authorize("Admin"), resolveResetRequest);

module.exports = router;
