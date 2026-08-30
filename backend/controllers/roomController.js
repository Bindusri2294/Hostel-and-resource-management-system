const Room = require("../models/Room");

// Create a new room
const createRoom = async (req, res) => {
  try {
    const { room, block, floor, capacity, occupied } = req.body;

    // Validation
    if (!room || !block || !floor || capacity === undefined) {
      return res.status(400).json({
        message:
          "Please provide room, block, floor, and capacity fields",
      });
    }

    if (capacity < 1) {
      return res.status(400).json({
        message: "Capacity must be at least 1",
      });
    }

    if (occupied !== undefined && occupied > capacity) {
      return res.status(400).json({
        message: "Occupied count cannot exceed capacity",
      });
    }

    const newRoom = await Room.create({
      room,
      block,
      floor,
      capacity,
      occupied: occupied || 0,
    });

    res.status(201).json(newRoom);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: `Room ${error.keyValue.room} already exists`,
      });
    }
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get all rooms
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ block: 1, floor: 1, room: 1 });
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get a single room by ID
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update a room
const updateRoom = async (req, res) => {
  try {
    const { room, block, floor, capacity, occupied } = req.body;

    // Find the room first
    const existingRoom = await Room.findById(req.params.id);
    if (!existingRoom) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    // Validation
    if (capacity !== undefined && capacity < 1) {
      return res.status(400).json({
        message: "Capacity must be at least 1",
      });
    }

    // Check if occupied count is valid
    const newCapacity = capacity !== undefined ? capacity : existingRoom.capacity;
    const newOccupied = occupied !== undefined ? occupied : existingRoom.occupied;

    if (newOccupied > newCapacity) {
      return res.status(400).json({
        message: `Occupied count (${newOccupied}) cannot exceed capacity (${newCapacity})`,
      });
    }

    // Check for duplicate room number if it's being changed
    if (room && room !== existingRoom.room) {
      const duplicateRoom = await Room.findOne({ room });
      if (duplicateRoom) {
        return res.status(400).json({
          message: `Room ${room} already exists`,
        });
      }
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      {
        room: room || existingRoom.room,
        block: block || existingRoom.block,
        floor: floor || existingRoom.floor,
        capacity: newCapacity,
        occupied: newOccupied,
      },
      { new: true }
    );

    res.status(200).json(updatedRoom);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete a room
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }
    res.status(200).json({
      message: "Room deleted successfully",
      room,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get rooms by status
const getRoomsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ["Available", "Partially Occupied", "Full"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const rooms = await Room.find({ status }).sort({ block: 1, floor: 1, room: 1 });
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get rooms statistics
const getRoomsStats = async (req, res) => {
  try {
    const rooms = await Room.find();
    const stats = {
      totalRooms: rooms.length,
      availableRooms: rooms.filter((r) => r.status === "Available").length,
      partiallyOccupiedRooms: rooms.filter(
        (r) => r.status === "Partially Occupied"
      ).length,
      fullRooms: rooms.filter((r) => r.status === "Full").length,
      totalCapacity: rooms.reduce((sum, r) => sum + r.capacity, 0),
      totalOccupied: rooms.reduce((sum, r) => sum + r.occupied, 0),
    };
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  getRoomsByStatus,
  getRoomsStats,
};
