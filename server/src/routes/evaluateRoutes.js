const express = require("express");
const router = express.Router();
const { evaluateAnswer, chat } = require("../controllers/evaluateController");
const { protect } = require("../middleware/authMiddleware");
const { evaluateLimiter } = require("../middleware/rateLimiter");

// protect runs before evaluateLimiter so req.user is available for keying
router.post("/answer", protect, evaluateLimiter, evaluateAnswer);
router.post("/chat", protect, chat);

module.exports = router;