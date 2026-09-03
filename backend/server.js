const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const studentRoutes = require("./routes/studentRoutes");
const roomRoutes = require("./routes/roomRoutes");
const allocationRoutes = require("./routes/allocationRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const authRoutes = require("./routes/authRoutes");

dotenv.config();
const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Hostel Management System API is running" });
});

app.use("/api/students", studentRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/allocations", allocationRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});