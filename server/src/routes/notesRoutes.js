const router = require("express").Router();
const controller = require("../controllers/notesController");
const { protect , adminOnly } = require("../middleware/authMiddleware");
const { evaluateLimiter } = require("../middleware/rateLimiter");

// ─── Note CRUD
router.get("/", protect, controller.listNotes);
router.post("/", protect, controller.createNote);
router.patch("/:id", protect, controller.updateNote);
router.delete("/:id", protect, controller.deleteNote);

// ─── AI actions
router.post("/improve", protect, evaluateLimiter, controller.improveNotes);
router.post("/mistakes", protect, evaluateLimiter, controller.findMistakes);
router.post("/revision", protect, evaluateLimiter, controller.revisionNotes);
router.post("/mains", protect, evaluateLimiter, controller.mainsFormat);
router.post("/extract-image", protect, evaluateLimiter, controller.extractFromImage);

module.exports = router;