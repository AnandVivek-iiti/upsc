const express = require("express");
const router = express.Router();
const { evaluateAnswer, chat, getChatHistory, clearChatHistory } = require("../controllers/evaluateController");
const { protect } = require("../middleware/authMiddleware");
const { evaluateLimiter } = require("../middleware/rateLimiter");

// protect runs before evaluateLimiter so req.user is available for keying
router.post("/answer", protect, evaluateLimiter, evaluateAnswer);
router.post("/chat", protect, chat);
router.get("/chat-history", protect, getChatHistory);
router.delete("/chat-history", protect, clearChatHistory);

module.exports = router;