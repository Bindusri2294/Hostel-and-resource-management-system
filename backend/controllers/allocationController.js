const Allocation = require("../models/Allocation");
const Room = require("../models/Room");
const Student = require("../models/student");

// Create an allocation
const createAllocation = async (req, res) => {
  try {
    const { studentId, roomId } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }


    if (room.OccupiedCount >= room.Capacity) {
      return res.status(400).json({ message: "Room is full" });
    }

    const existingAllocation = await Allocation.findOne({
      studentId,
      status: "Active",
    });
    if (existingAllocation) {
      return res
        .status(400)
        .json({ message: "Student already has an active room allocation" });
    }

    const allocation = await Allocation.create({
      studentId,
      roomId,
      allocatedDate: req.body.allocatedDate || Date.now(),
      status: "Active",
    });

    room.OccupiedCount += 1;
    if (room.OccupiedCount >= room.Capacity) {
      room.Status = "Full";
    } else {
      room.Status = "Available";
    }
    await room.save();

    const populatedAllocation = await Allocation.findById(allocation._id)
      .populate("studentId")
      .populate("roomId");

    res.status(201).json(populatedAllocation);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get all allocations
const getAllocations = async (req, res) => {
  try {
    const allocations = await Allocation.find()
      .populate("studentId")
      .populate("roomId");
    res.status(200).json(allocations);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get allocation by ID
const getAllocationById = async (req, res) => {
  try {
    const allocation = await Allocation.findById(req.params.id)
      .populate("studentId")
      .populate("roomId");
    if (!allocation) {
      return res.status(404).json({ message: "Allocation not found" });
    }
    res.status(200).json(allocation);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update an allocation
const updateAllocation = async (req, res) => {
  try {
    const allocation = await Allocation.findById(req.params.id);
    if (!allocation) {
      return res.status(404).json({ message: "Allocation not found" });
    }

    const previousStatus = allocation.status;
    const { status, vacatedDate } = req.body;

    if (status && status !== previousStatus) {
      allocation.status = status;

      if (status === "Vacated") {
        allocation.vacatedDate = vacatedDate || Date.now();

        const room = await Room.findById(allocation.roomId);
        if (room) {
          room.OccupiedCount = Math.max(0, room.OccupiedCount - 1);
          if (room.OccupiedCount === 0) {
            room.Status = "Available";
          } else if (room.OccupiedCount < room.Capacity) {
            room.Status = "Available";
          }
          await room.save();
        }
      }
    }

    await allocation.save();
    const updatedAllocation = await Allocation.findById(allocation._id)
      .populate("studentId")
      .populate("roomId");

    res.status(200).json(updatedAllocation);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete an allocation
const deleteAllocation = async (req, res) => {
  try {
    const allocation = await Allocation.findById(req.params.id);
    if (!allocation) {
      return res.status(404).json({ message: "Allocation not found" });
    }

    if (allocation.status === "Active") {
      const room = await Room.findById(allocation.roomId);
      if (room) {
        room.OccupiedCount = Math.max(0, room.OccupiedCount - 1);
        if (room.OccupiedCount === 0) {
          room.Status = "Available";
        } else if (room.OccupiedCount < room.Capacity) {
          room.Status = "Available";
        }
        await room.save();
      }
    }

    await Allocation.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Allocation deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createAllocation,
  getAllocations,
  getAllocationById,
  updateAllocation,
  deleteAllocation,
};
