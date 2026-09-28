const mongoose = require("mongoose");

let mongoMemoryServer = null;

const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hostel_db";
    
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[DB] Connected to MongoDB Atlas: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error("[DB] Failed to connect to MongoDB Atlas!");
    console.error(error.message);
    console.log("[DB] Exiting process because database connection is required.");
    process.exit(1);
  }
};

module.exports = connectDB;