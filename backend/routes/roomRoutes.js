const express = require("express");
const {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  getRoomsByStatus,
  getRoomsStats,
} = require("../controllers/roomController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// CRUD operations
router.post("/", protect, authorize("Admin"), createRoom);
router.get("/", protect, authorize("Admin", "Student"), getRooms);
router.get("/stats", protect, authorize("Admin"), getRoomsStats);
router.get("/status/:status", protect, authorize("Admin", "Student"), getRoomsByStatus);
router.get("/:block/:roomNo", protect, authorize("Admin", "Student"), getRoomById);
router.put("/:block/:roomNo", protect, authorize("Admin"), updateRoom);
router.delete("/:block/:roomNo", protect, authorize("Admin"), deleteRoom);

module.exports = router;