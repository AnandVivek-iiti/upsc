// ─── 404 handler ─────────────────────────────────────────────────────────────
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// ─── Global error handler ─────────────────────────────────────────────────────
const errorHandler = (err, req, res, next) => {
  // Determine status code
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  // JWT errors → return 401 with a clean message
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, error: "Invalid token. Please log in again." });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, error: "Session expired. Please log in again." });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(400).json({
      success: false,
      error: `${field.charAt(0).toUpperCase() + field.slice(1)} already in use.`,
    });
  }

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    const errors = {};
    for (const [field, e] of Object.entries(err.errors)) {
      errors[field] = e.message;
    }
    return res.status(400).json({ success: false, errors, error: "Validation failed." });
  }

  // CORS errors
  if (err.message?.startsWith("CORS policy")) {
    return res.status(403).json({ success: false, error: err.message });
  }

  const isDev = process.env.NODE_ENV !== "production";

  res.status(statusCode).json({
    success: false,
    error: err.message || "Internal server error.",
    ...(isDev && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };