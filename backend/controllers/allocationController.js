const Allocation = require("../models/Allocation");
const Room = require("../models/Room");
const Student = require("../models/student");

// Format allocation response
const formatAllocation = (allocation) => {
  return {
    id: allocation._id,
    student: allocation.studentId,
    room: allocation.roomId,
    allocationDate: allocation.allocatedDate,
    status: allocation.status,
    vacatedDate: allocation.vacatedDate || null,
  };
};

// Create an allocation
const createAllocation = async (req, res) => {
  try {
    const { studentId, roomId, allocatedDate } = req.body;

    // Check student
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    // Check room
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    // Check room capacity
    if (room.OccupiedCount >= room.Capacity) {
      return res.status(400).json({
        message: "Room is full",
      });
    }

    // Check if student already has an active allocation
    const existingAllocation = await Allocation.findOne({
      studentId,
      status: "Active",
    });

    if (existingAllocation) {
      return res.status(400).json({
        message: "Student already has an active room allocation",
      });
    }

    // Create allocation
    const allocation = await Allocation.create({
      studentId,
      roomId,
      allocatedDate: allocatedDate || Date.now(),
      status: "Active",
      vacatedDate: null,
    });

    // Increase room occupied count
    room.OccupiedCount += 1;

    // Update room status
    if (room.OccupiedCount >= room.Capacity) {
      room.Status = "Full";
    } else {
      room.Status = "Available";
    }

    await room.save();

    // Get populated allocation
    const populatedAllocation = await Allocation.findById(allocation._id)
      .populate("studentId")
      .populate("roomId");

    res.status(201).json(formatAllocation(populatedAllocation));
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
      .populate("roomId")
      .sort({ allocatedDate: -1 });

    const formattedAllocations = allocations.map(formatAllocation);

    res.status(200).json(formattedAllocations);
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
      return res.status(404).json({
        message: "Allocation not found",
      });
    }

    res.status(200).json(formatAllocation(allocation));
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
      return res.status(404).json({
        message: "Allocation not found",
      });
    }

    const { status, vacatedDate } = req.body;

    // Validate status
    if (status && !["Active", "Vacated"].includes(status)) {
      return res.status(400).json({
        message: "Status must be either Active or Vacated",
      });
    }

    // Handle status change
    if (status && status !== allocation.status) {
      allocation.status = status;

      // Student is vacating the room
      if (status === "Vacated") {
        allocation.vacatedDate = vacatedDate || Date.now();

        const room = await Room.findById(allocation.roomId);

        if (room) {
          room.OccupiedCount = Math.max(
            0,
            room.OccupiedCount - 1
          );

          if (room.OccupiedCount < room.Capacity) {
            room.Status = "Available";
          }

          await room.save();
        }
      }

      // Re-activate an allocation
      if (status === "Active") {
        const existingActiveAllocation = await Allocation.findOne({
          studentId: allocation.studentId,
          status: "Active",
          _id: { $ne: allocation._id },
        });

        if (existingActiveAllocation) {
          return res.status(400).json({
            message: "Student already has another active allocation",
          });
        }

        const room = await Room.findById(allocation.roomId);

        if (!room) {
          return res.status(404).json({
            message: "Room not found",
          });
        }

        if (room.OccupiedCount >= room.Capacity) {
          return res.status(400).json({
            message: "Room is full",
          });
        }

        room.OccupiedCount += 1;

        if (room.OccupiedCount >= room.Capacity) {
          room.Status = "Full";
        } else {
          room.Status = "Available";
        }

        await room.save();

        allocation.vacatedDate = null;
      }
    }

    // Allow vacated date to be updated
    if (status === "Vacated" && vacatedDate) {
      allocation.vacatedDate = vacatedDate;
    }

    await allocation.save();

    const updatedAllocation = await Allocation.findById(
      allocation._id
    )
      .populate("studentId")
      .populate("roomId");

    res.status(200).json(formatAllocation(updatedAllocation));
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
      return res.status(404).json({
        message: "Allocation not found",
      });
    }

    // If active, free the room
    if (allocation.status === "Active") {
      const room = await Room.findById(allocation.roomId);

      if (room) {
        room.OccupiedCount = Math.max(
          0,
          room.OccupiedCount - 1
        );

        if (room.OccupiedCount < room.Capacity) {
          room.Status = "Available";
        }

        await room.save();
      }
    }

    await Allocation.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Allocation deleted successfully",
    });
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