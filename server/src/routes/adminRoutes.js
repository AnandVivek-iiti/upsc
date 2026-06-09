const express = require("express");
const router = express.Router();
const {
  getMetrics,
  listUsers,
  getFeatures,
  createFeature,
  updateFeature,
  deleteFeature,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// All admin routes require auth + admin role
router.use(protect, adminOnly);

router.get("/metrics", getMetrics);
router.get("/users", listUsers);

router.get("/features", getFeatures);
router.post("/features", createFeature);
router.patch("/features/:id", updateFeature);
router.delete("/features/:id", deleteFeature);

module.exports = router;