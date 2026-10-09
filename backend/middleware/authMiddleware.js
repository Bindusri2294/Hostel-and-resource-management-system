const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Lightweight in-memory auth cache to eliminate redundant Atlas lookups during bursts
const userCache = new Map();
const USER_CACHE_TTL = 30 * 1000; // 30 seconds

const invalidateUserCache = (userId) => {
  if (userId) userCache.delete(String(userId));
};

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const cached = userCache.get(String(decoded.id));
      if (cached && Date.now() - cached.timestamp < USER_CACHE_TTL) {
        req.user = cached.user;
        return next();
      }

      let query = User.findById(decoded.id).select("-password").lean();
      // Admin users do not have a linked student profile — skip redundant population
      if (decoded.role === "Student") {
        query = query.populate("student");
      }

      const user = await query;

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      userCache.set(String(decoded.id), { user, timestamp: Date.now() });
      req.user = user;

      next();
    } catch (error) {
      console.error("Auth middleware error:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user?.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize, invalidateUserCache };
