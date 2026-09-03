const mongoose = require("mongoose");

let mongoMemoryServer = null;

const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hostel_db";
    
    // Attempt standard connection first
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[DB] Connected to MongoDB: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.log("[DB] Local MongoDB not detected. Starting embedded MongoDB server...");
    
    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();

      await mongoose.connect(memoryUri);
      console.log(`[DB] Connected to Embedded MongoDB at: ${memoryUri}`);
      console.log("[DB] Ready to process requests!");
      return true;
    } catch (memError) {
      console.error("[DB] Failed to start embedded MongoDB:", memError.message);
      return false;
    }
  }
};

module.exports = connectDB;