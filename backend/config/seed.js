const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Student = require("../models/student");
const Room = require("../models/Room");
const Allocation = require("../models/Allocation");
const Fee = require("../models/Fee");

const seedAdminAndDemoUsers = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@hostel.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    // 1. Check/Seed Warden Admin Account
    let existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      existingAdmin = await User.create({
        name: "Hostel Warden Admin",
        email: adminEmail.toLowerCase(),
        password: hashedPassword,
        role: "Admin",
      });
      console.log(`[SEED] Admin user account created (${adminEmail})`);
    }

    // 2. Check/Seed Demo Student Account
    const demoStudentEmail = "student@hostel.com";

    // Find or create the Student record first (shared across both checks below)
    let demoStudent = await Student.findOne({ Rollno: "2026-CS-01" });
    if (!demoStudent) {
      demoStudent = await Student.create({
        Name: "Rahul Sharma",
        Rollno: "2026-CS-01",
        Course: "B.Tech Computer Science",
        Campus: "Main Campus",
        Year: 3,
        Roomno: "B-204",
      });
    }

    const existingStudentUser = await User.findOne({ email: demoStudentEmail });
    if (!existingStudentUser) {
      const salt = await bcrypt.genSalt(10);
      // Default password = roll number (student logs in with rollno as both username & password)
      const hashedPassword = await bcrypt.hash(demoStudent.Rollno, salt);

      await User.create({
        name: demoStudent.Name,
        email: demoStudentEmail,
        password: hashedPassword,
        role: "Student",
        student: demoStudent._id,
      });
      console.log(`[SEED] Demo Student account created (${demoStudentEmail}) — default password: roll number`);
    }

    // 3. Ensure Demo Student has an active room allocation
    const existingAlloc = await Allocation.findOne({
      studentId: demoStudent._id,
      status: "Active",
    });

    if (!existingAlloc) {
      const targetRoom =
        (await Room.findOne({ RoomNo: demoStudent.Roomno })) ||
        (await Room.findOne());

      if (targetRoom) {
        demoStudent.Roomno = targetRoom.RoomNo;
        await demoStudent.save();

        await Allocation.create({
          studentId: demoStudent._id,
          roomId: targetRoom._id,
          status: "Active",
          allocatedDate: new Date(),
        });
        console.log(`[SEED] Demo Student allocated to room ${targetRoom.RoomNo}`);
      }
    }

    // 4. Ensure Demo Student has default fee records
    const existingFeeCount = await Fee.countDocuments({ studentRollno: demoStudent.Rollno });
    if (existingFeeCount === 0) {
      await Fee.create([
        {
          studentRollno: demoStudent.Rollno,
          student: demoStudent._id,
          feeType: "Hostel Fee",
          academicYear: "2025-2026",
          term: "Full Year",
          totalAmount: 45000,
          paidAmount: 45000,
          dueDate: new Date("2026-08-30"),
          status: "Paid",
          remarks: "Annual hostel accommodation fee paid in full",
          createdBy: existingAdmin?._id,
          payments: [
            {
              amount: 45000,
              paidAt: new Date("2026-08-15"),
              paymentMethod: "Bank Transfer",
              receiptNo: "RCP-882140",
              transactionId: "NEFT9823412",
              recordedBy: existingAdmin?._id,
            },
          ],
        },
        {
          studentRollno: demoStudent.Rollno,
          student: demoStudent._id,
          feeType: "Mess Fee",
          academicYear: "2025-2026",
          term: "October 2026",
          totalAmount: 4500,
          paidAmount: 4500,
          dueDate: new Date("2026-10-10"),
          status: "Paid",
          remarks: "Monthly mess dining charges",
          createdBy: existingAdmin?._id,
          payments: [
            {
              amount: 4500,
              paidAt: new Date("2026-10-05"),
              paymentMethod: "Online / UPI",
              receiptNo: "RCP-901124",
              transactionId: "UPI7718293",
              recordedBy: existingAdmin?._id,
            },
          ],
        },
        {
          studentRollno: demoStudent.Rollno,
          student: demoStudent._id,
          feeType: "Mess Fee",
          academicYear: "2025-2026",
          term: "October 2026",
          totalAmount: 250,
          paidAmount: 0,
          dueDate: new Date("2026-11-01"),
          status: "Overdue",
          remarks: "Late mess adjustment balance",
          createdBy: existingAdmin?._id,
          payments: [],
        },
      ]);
      console.log(`[SEED] Demo fee records seeded for ${demoStudent.Rollno}`);
    }
  } catch (error) {
    console.error("[SEED] Error seeding default admin/student/fees:", error.message);
  }
};

module.exports = seedAdminAndDemoUsers;
