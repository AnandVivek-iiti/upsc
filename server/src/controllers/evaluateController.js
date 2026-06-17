const { evaluateAnswer: callAIClient, SYSTEM_INSTRUCTION, CHAT_SYSTEM_INSTRUCTION } = require("../config/ai-client");
const { UserData } = require("../models/UserData");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ── Cap how many past messages we feed back into Gemini + store per user ────
// 60 entries ≈ 30 user/assistant turns — enough real memory without letting
// the request payload or the JSONB column grow unbounded forever.
const MAX_HISTORY_MESSAGES = 60;

/**
 * Builds a short "Student Context" block from the user's profile + saved
 * progress, so the mentor already knows the basics (target year, overall
 * progress, weak spots, recent evaluation scores) without being told again
 * every conversation. Returns "" when there isn't enough data yet.
 */
function buildStudentContext(user, userData) {
  const lines = [];

  if (user?.target_year)            lines.push(`Target exam year: ${user.target_year}`);
  if (typeof user?.streak === "number" && user.streak > 0) {
    lines.push(`Current study streak: ${user.streak} day(s)`);
  }

  // ── Syllabus progress + weakest modules ───────────────────────────────────
  const sp = userData?.syllabus_progress || {};
  let total = 0, count = 0;
  const weak = [];
  for (const [stage, papers] of Object.entries(sp)) {
    for (const [paper, modules] of Object.entries(papers || {})) {
      for (const [modName, mod] of Object.entries(modules || {})) {
        const progress = mod?.progress || 0;
        total += progress;
        count += 1;
        if (progress < 40) weak.push({ stage, paper, modName, progress });
      }
    }
  }
  if (count > 0) {
    lines.push(`Overall syllabus progress: ${Math.round(total / count)}% across ${count} modules`);
  }
  if (weak.length > 0) {
    weak.sort((a, b) => a.progress - b.progress);
    const top = weak.slice(0, 5).map(w => `${w.paper} → ${w.modName} (${w.progress}%)`).join(", ");
    lines.push(`Weakest syllabus areas right now: ${top}`);
  }

  // ── Recent Mains evaluation performance ───────────────────────────────────
  const answers = Array.isArray(userData?.answers) ? userData.answers : [];
  if (answers.length > 0) {
    const scores = answers
      .map((a) => {
        try {
          const ev = typeof a.evaluation === "string" ? JSON.parse(a.evaluation) : a.evaluation;
          return typeof ev?.score === "number" ? ev.score : null;
        } catch {
          return null;
        }
      })
      .filter((s) => s !== null);
    if (scores.length > 0) {
      const avg = (scores.reduce((s, n) => s + n, 0) / scores.length).toFixed(1);
      lines.push(`Mains answers evaluated so far: ${answers.length} (average score ${avg}/10)`);
    }
  }

  if (lines.length === 0) return "";
  return `\n\n## Student Context (use this naturally where relevant — don't just list it back)\n${lines.map((l) => `- ${l}`).join("\n")}`;
}

/**
 * POST /api/evaluate/answer
 * Evaluates a UPSC Mains answer via AI and saves metadata to UserData.
 */
const evaluateAnswer = async (req, res, next) => {
  try {
    const { question, answer, paper } = req.body;

    if (!question || question.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: "Question text is required (min 10 characters).",
      });
    }
    if (!answer || answer.trim().length < 20) {
      return res.status(400).json({
        success: false,
        error: "Answer is too short to evaluate (min 20 characters).",
      });
    }

    const wordCount = answer.trim().split(/\s+/).length;

    const evalPrompt = `**MAINS EVALUATION REQUEST**

Paper: ${paper || "General Studies"}
Word Count: ${wordCount} words

**Question:**
${question.trim()}

**Student's Answer:**
${answer.trim()}

Please evaluate this answer according to your mentor framework. Be specific about which UPSC keywords, constitutional articles, government reports, committee names, or data points are missing. The student has an engineering background, so they think analytically but may lack humanities-specific terminology and UPSC answer-writing conventions.`;

    console.log(`[Evaluation] Processing for user: ${req.user.id}`);

    const { result, provider } = await callAIClient(evalPrompt);

    // ── Save evaluation metadata to UserData (Sequelize JSONB) ───────────────
    // req.user.id = UUID string (set by authMiddleware via Sequelize)
    const userData = await UserData.findOne({ where: { user_id: req.user.id } });
    if (userData) {
      const answers = Array.isArray(userData.answers) ? [...userData.answers] : [];
      answers.push({
        id:         `ans_${Date.now()}`,
        date:       new Date().toISOString(),
        paper:      paper || "GS",
        question:   question.trim(),
        answer:     answer.trim(),
        evaluation: JSON.stringify(result),
        word_count: wordCount,
      });
      userData.answers = answers;
      userData.changed("answers", true);
      await userData.save();
    }

    return res.status(200).json({
      success: true,
      provider_used: provider,
      word_count: wordCount,
      data: result,
    });
  } catch (err) {
    console.error("Evaluation pipeline crashed:", err);
    next(err);
  }
};

/**
 * POST /api/evaluate/chat
 * Conversational UPSC mentor chat via Gemini — now backed by persistent,
 * per-user history (UserData.mentor_chat) instead of trusting whatever the
 * browser happens to have in memory. The client may still send an optional
 * `context_hint` (e.g. "I'm practising UPSC Mains long-answer questions")
 * describing which part of the app the student is in — this is folded into
 * the system instruction for this turn only, not stored as a message.
 */
const chat = async (req, res, next) => {
  try {
    const { message, context_hint } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ success: false, error: "Message is required." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        error: "Chat service is temporarily offline.",
      });
    }

    // ── Load (or seed) this user's persisted record ───────────────────────────
    let userData = await UserData.findOne({ where: { user_id: req.user.id } });
    if (!userData) userData = await UserData.seedForUser(req.user.id);

    const persistedHistory = Array.isArray(userData.mentor_chat) ? userData.mentor_chat : [];

    const contextBlock = buildStudentContext(req.user, userData);
    const pageBlock     = context_hint ? `\n\nThe student is currently in this section of the app: "${context_hint}"` : "";

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: CHAT_SYSTEM_INSTRUCTION + contextBlock + pageBlock,
    });

    const geminiHistory = persistedHistory.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const chatSession   = model.startChat({ history: geminiHistory });
    const result        = await chatSession.sendMessage(message.trim());
    const responseText  = result.response.text();

    // ── Persist both turns, capped so the column doesn't grow forever ────────
    const updatedHistory = [
      ...persistedHistory,
      { role: "user",      content: message.trim(), at: new Date().toISOString() },
      { role: "assistant", content: responseText,    at: new Date().toISOString() },
    ].slice(-MAX_HISTORY_MESSAGES);

    userData.mentor_chat = updatedHistory;
    userData.changed("mentor_chat", true);
    await userData.save();

    return res.status(200).json({ success: true, response: responseText, history: updatedHistory });
  } catch (err) {
    console.error("Chat engine fault:", err);
    next(err);
  }
};

/**
 * GET /api/evaluate/chat-history
 * Returns the student's persisted mentor conversation so the frontend can
 * restore it on load instead of starting from a blank chat every time.
 */
const getChatHistory = async (req, res, next) => {
  try {
    const userData = await UserData.findOne({ where: { user_id: req.user.id } });
    return res.status(200).json({ success: true, history: userData?.mentor_chat || [] });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/evaluate/chat-history
 * Wipes the persisted mentor conversation (used by the "Clear" button).
 */
const clearChatHistory = async (req, res, next) => {
  try {
    const userData = await UserData.findOne({ where: { user_id: req.user.id } });
    if (userData) {
      userData.mentor_chat = [];
      userData.changed("mentor_chat", true);
      await userData.save();
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

module.exports = { evaluateAnswer, chat, getChatHistory, clearChatHistory };