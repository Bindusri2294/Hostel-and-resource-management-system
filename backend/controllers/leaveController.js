const LeaveRequest = require("../models/LeaveRequest");
const Student = require("../models/student");
const User = require("../models/User");
const Attendance = require("../models/Attendance");

// Helper to generate array of date strings ["YYYY-MM-DD", ...] between start and end inclusive
const getDatesInRange = (startDateStr, endDateStr) => {
  const dates = [];
  const curr = new Date(startDateStr);
  const end = new Date(endDateStr);

  while (curr <= end) {
    const y = curr.getFullYear();
    const m = String(curr.getMonth() + 1).padStart(2, "0");
    const d = String(curr.getDate()).padStart(2, "0");
    dates.push(`${y}-${m}-${d}`);
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
};

// 1. Student applies for leave
const applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason, parentContact } = req.body;

    if (!startDate || !endDate || !reason || !parentContact) {
      return res.status(400).json({
        message: "Please provide start date, end date, reason, and parent contact number.",
      });
    }

    if (endDate < startDate) {
      return res.status(400).json({
        message: "End date cannot be earlier than start date.",
      });
    }

    // Locate linked student record
    let student = req.user.student;
    if (!student || !student._id) {
      const user = await User.findById(req.user._id).populate("student");
      student = user?.student;
    }

    if (!student) {
      return res.status(404).json({
        message: "No student profile linked to your user account.",
      });
    }

    const leaveRequest = await LeaveRequest.create({
      student: student._id,
      user: req.user._id,
      rollNo: student.Rollno,
      studentName: student.Name,
      roomNo: student.Roomno || "Unassigned",
      block: student.Block || "D",
      leaveType: leaveType || "Home Visit",
      startDate,
      endDate,
      reason: reason.trim(),
      parentContact: parentContact.trim(),
      status: "Pending",
    });

    res.status(201).json({
      message: "Leave application submitted successfully. Awaiting warden approval.",
      leaveRequest,
    });
  } catch (error) {
    next(error);
  }
};

// 2. Student gets their own leave applications
const getMyLeaves = async (req, res, next) => {
  try {
    let studentId = req.user.student?._id || req.user.student;
    if (!studentId) {
      const user = await User.findById(req.user._id);
      studentId = user?.student;
    }

    const leaves = await LeaveRequest.find({
      $or: [{ student: studentId }, { user: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(leaves);
  } catch (error) {
    next(error);
  }
};

// 3. Admin gets all leave applications
const getAllLeaves = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== "All") {
      query.status = status;
    }

    const leaves = await LeaveRequest.find(query)
      .populate("student", "Name Rollno Roomno Block Course Department")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const pendingCount = await LeaveRequest.countDocuments({ status: "Pending" });
    const approvedCount = await LeaveRequest.countDocuments({ status: "Approved" });
    const rejectedCount = await LeaveRequest.countDocuments({ status: "Rejected" });

    res.status(200).json({
      leaves,
      stats: {
        total: leaves.length,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 4. Admin updates leave request status (Approve / Reject)
const updateLeaveStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminRemarks } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'Approved' or 'Rejected'." });
    }

    const leave = await LeaveRequest.findById(id);
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found." });
    }

    leave.status = status;
    leave.adminRemarks = adminRemarks || "";
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    await leave.save();

    // AUTO-SYNC TO ATTENDANCE WHEN APPROVED:
    if (status === "Approved") {
      const dates = getDatesInRange(leave.startDate, leave.endDate);
      const bulkOps = dates.map((dateStr) => ({
        updateOne: {
          filter: { date: dateStr, student: leave.student },
          update: {
            $set: {
              date: dateStr,
              student: leave.student,
              rollNo: leave.rollNo,
              status: "Leave",
              remarks: `Approved ${leave.leaveType}: ${leave.reason.slice(0, 35)}`,
              markedBy: req.user._id,
            },
          },
          upsert: true,
        },
      }));

      if (bulkOps.length > 0) {
        await Attendance.bulkWrite(bulkOps);
        console.log(`[LEAVE AUTO-SYNC] Synced ${bulkOps.length} days of 'Leave' attendance for ${leave.rollNo}`);
      }
    }

    res.status(200).json({
      message: `Leave application marked as ${status}.`,
      leave,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
};
