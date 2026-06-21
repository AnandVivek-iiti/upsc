const express = require("express");
const router = express.Router();
const {
  evaluateAnswer,
  chat,
  listChatThreads,
  getChatThread,
  deleteChatThread,
} = require("../controllers/evaluateController");
const { protect } = require("../middleware/authMiddleware");
const { evaluateLimiter } = require("../middleware/rateLimiter");

// protect runs before evaluateLimiter so req.user is available for keying
router.post("/answer", protect, evaluateLimiter, evaluateAnswer);
router.post("/chat", protect, chat);
router.get("/chat-threads", protect, listChatThreads);
router.get("/chat-threads/:id", protect, getChatThread);
router.delete("/chat-threads/:id", protect, deleteChatThread);

module.exports = router;