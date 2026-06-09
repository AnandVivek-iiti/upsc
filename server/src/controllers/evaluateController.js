const { evaluateAnswer: callAIClient, SYSTEM_INSTRUCTION } = require("../config/ai-client");
const { UserData } = require("../models/UserData");
const { GoogleGenerativeAI } = require("@google/generative-ai");

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
 * Conversational UPSC mentor chat via Gemini.
 */
const chat = async (req, res, next) => {
  try {
    const { message, history } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ success: false, error: "Message is required." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        error: "Chat service is temporarily offline.",
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const geminiHistory = (history || []).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const chatSession = model.startChat({ history: geminiHistory });
    const result      = await chatSession.sendMessage(message.trim());
    const responseText = result.response.text();

    return res.status(200).json({ success: true, response: responseText });
  } catch (err) {
    console.error("Chat engine fault:", err);
    next(err);
  }
};

module.exports = { evaluateAnswer, chat };