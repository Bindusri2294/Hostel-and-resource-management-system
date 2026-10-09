const mongoose = require("mongoose");

let mongoMemoryServer = null;

const connectDB = async () => {
  const atlasUri = process.env.MONGO_URI;
  const localUri = "mongodb://127.0.0.1:27017/hostel_db";

  if (atlasUri) {
    try {
      console.log("[DB] Connecting to MongoDB Atlas...");
      const conn = await mongoose.connect(atlasUri, {
        maxPoolSize: 50,
        minPoolSize: 5,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log(`[DB] Connected to MongoDB Atlas: ${conn.connection.host}`);
      return true;
    } catch (error) {
      console.warn("[DB] Could not connect to MongoDB Atlas (IP not whitelisted or network issue):", error.message);
      console.log("[DB] Falling back to local MongoDB:", localUri);
    }
  }

  try {
    const conn = await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[DB] Connected to local MongoDB: ${conn.connection.host}`);
    return true;
  } catch (localErr) {
    console.error("[DB] Failed to connect to local MongoDB:", localErr.message);
    console.log("[DB] Exiting process because database connection is required.");
    process.exit(1);
  }
};

module.exports = connectDB;