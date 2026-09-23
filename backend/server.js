const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const seedAdminAndDemoUsers = require("./config/seed");
const studentRoutes = require("./routes/studentRoutes");
const roomRoutes = require("./routes/roomRoutes");
const allocationRoutes = require("./routes/allocationRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
const mongoose = require("mongoose");

app.get("/api/images/:filename", async (req, res) => {
  try {
    if (!mongoose.connection.db) {
      return res.status(500).json({ message: "Database not connected yet" });
    }
    const db = mongoose.connection.db;
    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: "feedbackImages",
    });

    const file = await bucket.find({ filename: req.params.filename }).toArray();
    if (!file || file.length === 0) {
      return res.status(404).json({ message: "Image not found" });
    }

    res.set("Content-Type", file[0].contentType);
    const downloadStream = bucket.openDownloadStreamByName(req.params.filename);
    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: "Error fetching image", error: error.message });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Hostel Management System API is running" });
});

app.use("/api/students", studentRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/allocations", allocationRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/auth", authRoutes);
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  await seedAdminAndDemoUsers();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();