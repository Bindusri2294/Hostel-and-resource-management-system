const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Student = require("../models/student");

const seedAdminAndDemoUsers = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@hostel.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    // 1. Check/Seed Warden Admin Account
    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      await User.create({
        name: "Hostel Warden Admin",
        email: adminEmail.toLowerCase(),
        password: hashedPassword,
        role: "Admin",
      });
      console.log(`[SEED] Admin user account created (${adminEmail})`);
    }

    // 2. Check/Seed Demo Student Account
    const demoStudentEmail = "student@hostel.com";
    const existingStudentUser = await User.findOne({ email: demoStudentEmail });
    if (!existingStudentUser) {
      let demoStudent = await Student.findOne({ rollNo: "2026-CS-01" });
      if (!demoStudent) {
        demoStudent = await Student.create({
          name: "Rahul Sharma",
          rollNo: "2026-CS-01",
          course: "B.Tech Computer Science",
          campus: "Main Campus",
          year: 3,
          roomNo: "B-204",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("student123", salt);

      await User.create({
        name: demoStudent.name,
        email: demoStudentEmail,
        password: hashedPassword,
        role: "Student",
        student: demoStudent._id,
      });
      console.log(`[SEED] Demo Student account created (${demoStudentEmail})`);
    }
  } catch (error) {
    console.error("[SEED] Error seeding default admin/student:", error.message);
  }
};

module.exports = seedAdminAndDemoUsers;
