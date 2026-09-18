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
} = require("../controllers/roomController");

const router = express.Router();

router.post("/", protect, authorize("Admin"), createRoom);
router.get("/", protect, authorize("Admin"), getRooms);
router.get("/stats", protect, authorize("Admin"), getRoomsStats);
router.get("/status/:status", protect, authorize("Admin"), getRoomsByStatus);
router.get("/:id", protect, authorize("Admin"), getRoomById);
router.put("/:id", protect, authorize("Admin"), updateRoom);
router.delete("/:id", protect, authorize("Admin"), deleteRoom);

module.exports = router;