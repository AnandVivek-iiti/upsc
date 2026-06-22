const express = require("express");
const router = express.Router();
const {
  getMetrics,
  listUsers,
  getFunnel,
  getFeatureAnalytics,
  getActivity,
  getRetention,
  recordEvent,
  deleteUser,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// All admin routes require auth + admin role
router.use(protect, adminOnly);

router.get("/metrics",   getMetrics);
router.get("/users",     listUsers);
router.get("/funnel",    getFunnel);
router.get("/features",  getFeatureAnalytics);
router.get("/activity",  getActivity);
router.get("/retention", getRetention);
router.post("/events",   recordEvent);
router.delete("/users/:id", deleteUser);
module.exports = router;