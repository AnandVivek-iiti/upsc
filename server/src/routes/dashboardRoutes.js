const express = require("express");
const router = express.Router();
const {
  getUserData,
  updateModuleProgress,
  bulkUpdateSyllabus,
  logStudyHours,
  updateProfile,
  syncQuestionAttempts,
  getSpacedRepetition,
  addSpacedRepetition,
} = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

// All dashboard routes require authentication
router.use(protect);

router.get("/", getUserData);
router.patch("/profile", updateProfile);

// Syllabus - single module patch + new bulk endpoint
router.patch("/syllabus/:stage/:paper/:module", updateModuleProgress);
router.post("/syllabus/bulk", bulkUpdateSyllabus);

// Daily study log
router.post("/daily-log", logStudyHours);

// Question attempts - server sync for cross-device and profile stats
router.post("/question-attempts", syncQuestionAttempts);

// Spaced repetition
router.get("/spaced-repetition", getSpacedRepetition);
router.post("/spaced-repetition", addSpacedRepetition);

module.exports = router;