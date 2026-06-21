const router = require("express").Router();
const controller = require("../controllers/notesController");
const { protect } = require("../middleware/authMiddleware");
const { evaluateLimiter } = require("../middleware/rateLimiter");
console.log("✅ notesRoutes loaded");
router.post("/improve", protect, evaluateLimiter, controller.improveNotes);
router.post("/mistakes", protect, evaluateLimiter, controller.findMistakes);
router.post("/revision", protect, evaluateLimiter, controller.revisionNotes);
router.post("/mains", protect, evaluateLimiter, controller.mainsFormat);
router.get("/ping", (req, res) => {
  res.json({ ok: true });
});
module.exports = router;