const router = require("express").Router();
const controller = require("../controllers/notesController");
const { protect } = require("../middleware/authMiddleware");
const { evaluateLimiter } = require("../middleware/rateLimiter");

// ─── Note CRUD - DB-backed, scoped to the signed-in user ─────────────────────
router.get("/", protect, controller.listNotes);
router.post("/", protect, controller.createNote);
router.patch("/:id", protect, controller.updateNote);
router.delete("/:id", protect, controller.deleteNote);

// ─── AI actions on note content ──────────────────────────────────────────────
router.post("/improve", protect, evaluateLimiter, controller.improveNotes);
router.post("/mistakes", protect, evaluateLimiter, controller.findMistakes);
router.post("/revision", protect, evaluateLimiter, controller.revisionNotes);
router.post("/mains", protect, evaluateLimiter, controller.mainsFormat);

module.exports = router;
