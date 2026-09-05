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
const createAllocation = async (req, res, next) => {
  try {
    const { studentId, roomNo, block, allocatedDate } = req.body;

    const student = await Student.findOne({ Rollno: studentId });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const room = await Room.findOne({ RoomNo: roomNo, Block: block });
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.OccupiedCount >= room.Capacity) {
      return res.status(400).json({ message: "Room is full" });
    }

    const existingAllocation = await Allocation.findOne({
      studentId: student._id,
      status: "Active",
    });

    if (existingAllocation) {
      return res.status(400).json({
        message: "Student already has an active room allocation",
      });
    }

    const allocation = await Allocation.create({
      studentId: student._id,
      roomId: room._id,
      allocatedDate: allocatedDate || Date.now(),
      status: "Active",
      vacatedDate: null,
    });

    room.OccupiedCount += 1;
    room.Status = room.OccupiedCount >= room.Capacity ? "Full" : "Available";
    await room.save();

    student.Roomno = room.RoomNo;
    await student.save();

    const populatedAllocation = await Allocation.findById(allocation._id)
      .populate("studentId")
      .populate("roomId");

    res.status(201).json(formatAllocation(populatedAllocation));
  } catch (error) {
    next(error);
  }
};

// Get all allocations
const getAllocations = async (req, res, next) => {
  try {
    const allocations = await Allocation.find()
      .populate("studentId")
      .populate("roomId")
      .sort({ allocatedDate: -1 });

    const formattedAllocations = allocations.map(formatAllocation);

    res.status(200).json(formattedAllocations);
  } catch (error) {
    next(error);
  }
};

// Get allocation by ID
const getAllocationById = async (req, res, next) => {
  try {
    const allocation = await Allocation.findById(req.params.id)
      .populate("studentId")
      .populate("roomId");

    if (!allocation) {
      return res.status(404).json({ message: "Allocation not found" });
    }

    res.status(200).json(formatAllocation(allocation));
  } catch (error) {
    next(error);
  }
};

// Update an allocation
const updateAllocation = async (req, res, next) => {
  try {
    const allocation = await Allocation.findById(req.params.id);

    if (!allocation) {
      return res.status(404).json({ message: "Allocation not found" });
    }

    const { status, vacatedDate } = req.body;

    if (status && !["Active", "Vacated"].includes(status)) {
      return res.status(400).json({
        message: "Status must be either Active or Vacated",
      });
    }

    if (status && status !== allocation.status) {
      allocation.status = status;

      if (status === "Vacated") {
        allocation.vacatedDate = vacatedDate || Date.now();

        const room = await Room.findById(allocation.roomId);

        if (room) {
          room.OccupiedCount = Math.max(0, room.OccupiedCount - 1);
          if (room.OccupiedCount < room.Capacity) {
            room.Status = "Available";
          }
          await room.save();
        }

        const student = await Student.findById(allocation.studentId);
        if (student) {
          student.Roomno = "Unassigned";
          await student.save();
        }
      }

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
          return res.status(404).json({ message: "Room not found" });
        }

        if (room.OccupiedCount >= room.Capacity) {
          return res.status(400).json({ message: "Room is full" });
        }

        room.OccupiedCount += 1;
        room.Status = room.OccupiedCount >= room.Capacity ? "Full" : "Available";
        await room.save();

        allocation.vacatedDate = null;

        const student = await Student.findById(allocation.studentId);
        if (student) {
          student.Roomno = room.RoomNo;
          await student.save();
        }
      }
    }

    if (status === "Vacated" && vacatedDate) {
      allocation.vacatedDate = vacatedDate;
    }

    await allocation.save();

    const updatedAllocation = await Allocation.findById(allocation._id)
      .populate("studentId")
      .populate("roomId");

    res.status(200).json(formatAllocation(updatedAllocation));
  } catch (error) {
    next(error);
  }
};

// Delete an allocation
const deleteAllocation = async (req, res, next) => {
  try {
    const allocation = await Allocation.findById(req.params.id);

    if (!allocation) {
      return res.status(404).json({ message: "Allocation not found" });
    }

    if (allocation.status === "Active") {
      const room = await Room.findById(allocation.roomId);

      if (room) {
        room.OccupiedCount = Math.max(0, room.OccupiedCount - 1);
        if (room.OccupiedCount < room.Capacity) {
          room.Status = "Available";
        }
        await room.save();
      }

      const student = await Student.findById(allocation.studentId);
      if (student) {
        student.Roomno = "Unassigned";
        await student.save();
      }
    }

    const populatedAllocation = await Allocation.findById(allocation._id)
      .populate("studentId")
      .populate("roomId");

    await Allocation.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Allocation deleted successfully",
      allocation: formatAllocation(populatedAllocation),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAllocation,
  getAllocations,
  getAllocationById,
  updateAllocation,
  deleteAllocation,
};