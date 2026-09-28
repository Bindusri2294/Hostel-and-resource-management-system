const express = require("express");
const router = express.Router();
const { registerStudent, loginUser, getMe, refreshToken, logoutUser, updateContact, forgotPassword, verifyOTP, resetPassword, requestManualReset, getResetRequests, resolveResetRequest } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerStudent);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.post("/refresh", refreshToken);
router.post("/logout", logoutUser);
router.put("/contact", protect, updateContact);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);
router.post("/request-manual-reset", requestManualReset);
router.get("/reset-requests", protect, getResetRequests);
router.post("/reset-requests/:requestId/resolve", protect, resolveResetRequest);

module.exports = router;
