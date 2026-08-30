const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const connectDB = require("./config/db");
const seedAdminAndDemoUsers = require("./config/seed");
const checkDbConnection = require("./middleware/checkDbConnection");
const studentRoutes = require("./routes/studentRoutes");
const authRoutes = require("./routes/authRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve local upload files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Hostel & Resource Management System API is running",
    time: new Date().toISOString(),
  });
});

// API Routes (guarded by DB connection status check)
app.use("/api", checkDbConnection);
app.use("/api/students", studentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  console.log("Initializing database connection...");
  const connected = await connectDB();
  if (connected) {
    await seedAdminAndDemoUsers();
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API endpoints ready at http://localhost:${PORT}/api`);
  });
};

startServer();