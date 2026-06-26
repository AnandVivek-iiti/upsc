const jwt = require("jsonwebtoken");
const User = require("../models/User");
const trackEvent = require("../utils/trackEvent");
if (!global._dayReturnSeen) global._dayReturnSeen = new Map();

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, error: "Not authorized - no token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User belonging to this token no longer exists.",
      });
    }

    req.user = user;

    // ── Fire day_return once per user per calendar day ─────────────────────
    // Uses IST date so the "day" boundary matches the rest of the app.
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset)
      .toISOString()
      .split("T")[0];

    const dedupKey = `${user.id}_${istDate}`;
    if (!global._dayReturnSeen.has(dedupKey)) {
      global._dayReturnSeen.set(dedupKey, true);
      // Prune old keys once the map gets large (> 5000 entries ≈ 5000 active users)
      if (global._dayReturnSeen.size > 5000) {
        const keysToDelete = [];
        for (const k of global._dayReturnSeen.keys()) {
          if (!k.endsWith(istDate)) keysToDelete.push(k);
        }
        keysToDelete.forEach((k) => global._dayReturnSeen.delete(k));
      }
      // Fire-and-forget - never await inside middleware
      trackEvent(user.id, "day_return").catch(() => {});
    }

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Session expired. Please log in again.",
      });
    }
    return res.status(401).json({
      success: false,
      error: "Invalid token. Authorization denied.",
    });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Access denied - admin privileges required.",
    });
  }
  next();
};

module.exports = { protect, adminOnly };