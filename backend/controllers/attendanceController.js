const Attendance = require("../models/Attendance");
const Student = require("../models/student");
const User = require("../models/User");

// Format Date helper to "YYYY-MM-DD"
const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 1. GET LOGGED-IN STUDENT'S OWN ATTENDANCE (Strictly isolated)
const getMyAttendance = async (req, res, next) => {
  try {
    let studentId = req.user.student?._id || req.user.student;
    let rollNo = req.user.student?.Rollno;

    if (!studentId || !rollNo) {
      // Look up student from User
      const user = await User.findById(req.user._id).populate("student");
      if (user?.student) {
        studentId = user.student._id;
        rollNo = user.student.Rollno;
      } else {
        // Fallback: search student by roll number if user email starts with roll number
        const potentialRollNo = (req.user.email || "").split("@")[0].toUpperCase();
        const found = await Student.findOne({ Rollno: potentialRollNo });
        if (found) {
          studentId = found._id;
          rollNo = found.Rollno;
        }
      }
    }

    if (!studentId) {
      return res.status(404).json({
        message: "No linked student profile found for your account.",
      });
    }

    const { month } = req.query; // optional format: "YYYY-MM"
    const query = { student: studentId };

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      query.date = { $regex: new RegExp(`^${month}`) };
    }

    const records = await Attendance.find(query)
      .sort({ date: -1 })
      .lean();

    const totalDays = records.length;
    const presentDays = records.filter((r) => r.status === "Present").length;
    const absentDays = records.filter((r) => r.status === "Absent").length;
    const leaveDays = records.filter((r) => r.status === "Leave").length;
    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    // Student summary
    res.status(200).json({
      student: {
        id: studentId,
        rollNo,
        name: req.user.name,
      },
      summary: {
        totalDays,
        presentDays,
        absentDays,
        leaveDays,
        percentage,
      },
      records,
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET ATTENDANCE FOR A SPECIFIC DATE (Admin only)
const getAttendanceByDate = async (req, res, next) => {
  try {
    const targetDate = req.query.date || getTodayString();

    const records = await Attendance.find({ date: targetDate })
      .populate("student", "Name Rollno Roomno Block Department Course Year")
      .lean();

    const attendanceMap = {};
    records.forEach((r) => {
      const sId = r.student?._id ? String(r.student._id) : String(r.student);
      attendanceMap[sId] = {
        status: r.status,
        remarks: r.remarks || "",
        id: r._id,
      };
    });

    const totalMarked = records.length;
    const presentCount = records.filter((r) => r.status === "Present").length;
    const absentCount = records.filter((r) => r.status === "Absent").length;
    const leaveCount = records.filter((r) => r.status === "Leave").length;

    res.status(200).json({
      date: targetDate,
      totalMarked,
      presentCount,
      absentCount,
      leaveCount,
      percentage: totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0,
      attendanceMap,
      records,
    });
  } catch (error) {
    next(error);
  }
};

// 3. SAVE DAILY ATTENDANCE (Admin only)
const saveDailyAttendance = async (req, res, next) => {
  try {
    const { date, records } = req.body;

    if (!date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: "Invalid payload. 'date' and 'records' are required." });
    }

    const bulkOps = records.map((rec) => ({
      updateOne: {
        filter: { date, student: rec.studentId },
        update: {
          $set: {
            date,
            student: rec.studentId,
            rollNo: (rec.rollNo || "").toUpperCase(),
            status: rec.status || "Present",
            remarks: rec.remarks || "",
            markedBy: req.user._id,
          },
        },
        upsert: true,
      },
    }));

    const result = await Attendance.bulkWrite(bulkOps);

    res.status(200).json({
      message: `Daily attendance for ${date} successfully recorded.`,
      matchedCount: result.matchedCount,
      upsertedCount: result.upsertedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

// 4. GET MONTHLY ATTENDANCE SUMMARY FOR ADMIN CALENDAR (Admin only)
const getMonthSummary = async (req, res, next) => {
  try {
    const today = getTodayString();
    const currentYearMonth = today.slice(0, 7); // "YYYY-MM"
    const targetMonth = req.query.month || currentYearMonth;

    if (!/^\d{4}-\d{2}$/.test(targetMonth)) {
      return res.status(400).json({ message: "Month format must be YYYY-MM" });
    }

    const records = await Attendance.aggregate([
      {
        $match: {
          date: { $regex: new RegExp(`^${targetMonth}`) },
        },
      },
      {
        $group: {
          _id: "$date",
          total: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] },
          },
          absent: {
            $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] },
          },
          leave: {
            $sum: { $cond: [{ $eq: ["$status", "Leave"] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          date: "$_id",
          total: 1,
          present: 1,
          absent: 1,
          leave: 1,
          percentage: {
            $cond: [
              { $gt: ["$total", 0] },
              { $round: [{ $multiply: [{ $divide: ["$present", "$total"] }, 100] }, 0] },
              0,
            ],
          },
        },
      },
      { $sort: { date: 1 } },
    ]);

    const daysMap = {};
    records.forEach((r) => {
      daysMap[r.date] = r;
    });

    res.status(200).json({
      month: targetMonth,
      days: daysMap,
      daysList: records,
    });
  } catch (error) {
    next(error);
  }
};

// 5. SEED INITIAL ATTENDANCE IF EMPTY (Self-healing demo helper)
const seedAttendanceIfEmpty = async () => {
  try {
    const count = await Attendance.estimatedDocumentCount();
    if (count > 0) return;

    const students = await Student.find({});
    if (!students || students.length === 0) return;

    console.log(`[ATTENDANCE] Seeding initial 14 days attendance for ${students.length} students...`);

    const now = new Date();
    const ops = [];

    // Seed past 14 days up to today
    for (let d = 13; d >= 0; d--) {
      const pastDate = new Date(now);
      pastDate.setDate(now.getDate() - d);
      const dateStr = pastDate.toISOString().slice(0, 10);

      students.forEach((s, idx) => {
        // Pseudo-random deterministic distribution based on roll number & date
        const hash = (idx * 31 + d * 17) % 100;
        let status = "Present";
        if (hash >= 94) {
          status = "Absent";
        } else if (hash === 93) {
          status = "Leave";
        }

        ops.push({
          date: dateStr,
          student: s._id,
          rollNo: s.Rollno,
          status,
          remarks: status === "Leave" ? "Permitted home leave" : "",
        });
      });
    }

    await Attendance.insertMany(ops, { ordered: false });
    console.log(`[ATTENDANCE] Seeded ${ops.length} attendance records successfully.`);
  } catch (err) {
    console.error("[ATTENDANCE] Seeding error:", err.message);
  }
};

module.exports = {
  getMyAttendance,
  getAttendanceByDate,
  saveDailyAttendance,
  getMonthSummary,
  seedAttendanceIfEmpty,
};
