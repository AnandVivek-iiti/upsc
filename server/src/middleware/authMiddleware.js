const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: "Not authorized — no token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findByPk(decoded.id, {
  attributes: { exclude: ["password"] }, 
});  if (!user) {
      return res.status(401).json({ success: false, error: "User belonging to this token no longer exists." });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, error: "Session expired. Please log in again." });
    }
    return res.status(401).json({ success: false, error: "Invalid token. Authorization denied." });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, error: "Access denied — admin privileges required." });
  }
  next();
};

module.exports = { protect, adminOnly };