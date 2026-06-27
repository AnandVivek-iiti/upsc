const express = require("express");
const router = express.Router();
const {
  evaluateAnswer,
  chat,
  listChatThreads,
  getChatThread,
  deleteChatThread,
  explainPrelimQuestion,
} = require("../controllers/evaluateController");
const { protect } = require("../middleware/authMiddleware");
const { evaluateLimiter } = require("../middleware/rateLimiter");
router.post("/answer", protect, evaluateLimiter, evaluateAnswer);
router.post("/prelim-explain", protect, evaluateLimiter, explainPrelimQuestion);
router.post("/chat", protect, chat);
router.get("/chat-threads", protect, listChatThreads);
router.get("/chat-threads/:id", protect, getChatThread);
router.delete("/chat-threads/:id", protect, deleteChatThread);

module.exports = router;