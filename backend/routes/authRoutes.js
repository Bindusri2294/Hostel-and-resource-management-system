const express = require("express");
const router = express.Router();
const { registerStudent, loginUser, getMe, refreshToken, logoutUser } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerStudent);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.post("/refresh", refreshToken);
router.post("/logout", logoutUser);

module.exports = router;
