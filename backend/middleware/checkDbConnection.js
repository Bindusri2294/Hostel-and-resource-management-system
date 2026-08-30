const mongoose = require("mongoose");

const checkDbConnection = (req, res, next) => {
  // 1 = connected, 2 = connecting
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message:
        "Database connection unavailable. Please start your local MongoDB service (e.g. 'net start MongoDB' or 'mongod') or provide a valid MONGO_URI string in backend/.env",
    });
  }
  next();
};

module.exports = checkDbConnection;
