const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  getRoomsByStatus,
  getRoomsStats,
  syncRoomCounts,
} = require("../controllers/roomController");

const router = express.Router();

router.post("/", protect, authorize("Admin"), createRoom);
router.post("/sync", protect, authorize("Admin"), syncRoomCounts);
router.get("/", protect, authorize("Admin", "Student"), getRooms);
router.get("/stats", protect, authorize("Admin"), getRoomsStats);
router.get("/status/:status", protect, authorize("Admin", "Student"), getRoomsByStatus);
router.get("/:id", protect, authorize("Admin", "Student"), getRoomById);
router.put("/:id", protect, authorize("Admin"), updateRoom);
router.delete("/:id", protect, authorize("Admin"), deleteRoom);

module.exports = router;