const express = require("express");
const router = express.Router();
const { submitFeedback, getAdminStats, getAdminList } = require("../controllers/feedbackController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", submitFeedback);

// Admin only – stats & list
router.get("/admin/stats", protect, adminOnly, getAdminStats);
router.get("/admin/list", protect, adminOnly, getAdminList);

module.exports = router;