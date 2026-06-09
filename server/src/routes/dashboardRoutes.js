const express = require("express");
const router = express.Router();
const {
  getUserData,
  updateModuleProgress,
  logStudyHours,
  getSpacedRepetition,
  addSpacedRepetition,
} = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

// All dashboard routes require authentication
router.use(protect);

router.get("/", getUserData);
router.patch("/syllabus/:stage/:paper/:module", updateModuleProgress);
router.post("/daily-log", logStudyHours);
router.get("/spaced-repetition", getSpacedRepetition);
router.post("/spaced-repetition", addSpacedRepetition);

module.exports = router;