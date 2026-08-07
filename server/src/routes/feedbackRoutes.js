const express = require("express");
const router = express.Router();
const { submitFeedback, getAdminStats, getAdminList, deleteFeedback } = require("../controllers/feedbackController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", submitFeedback);

router.get("/admin/stats", protect, adminOnly, getAdminStats);
router.get("/admin/list", protect, adminOnly, getAdminList);
router.delete("/admin/:id", protect, adminOnly, deleteFeedback);

module.exports = router;