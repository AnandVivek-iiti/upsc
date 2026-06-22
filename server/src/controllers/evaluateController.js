const {
  evaluateAnswer: callAIClient,
  CHAT_SYSTEM_INSTRUCTION,
  extractMemory,
  runMentorChat,
  isAnyProviderAvailable,
} = require("../config/ai-client");
const { UserData } = require("../models/UserData");
const trackEvent = require("../utils/trackEvent");
const MAX_HISTORY_MESSAGES = 60;

const MAX_THREADS = 50;

const MEMORY_EXTRACTION_EVERY_N_TURNS = 3;
const PROGRESS_QUERY_PATTERN =
  /\b(my progress|my streak|how am i doing|weak (area|topic|subject)s?|where (do|should) i (focus|improve)|study plan|revision plan|my (score|performance)|am i ready|target year|how far am i)\b/i;


function buildStudentContext(user, userData, currentMessage) {
  const isProgressQuery = PROGRESS_QUERY_PATTERN.test(currentMessage || "");
  if (!isProgressQuery) return "";

  const lines = [];

  if (user?.target_year) lines.push(`Target exam year: ${user.target_year}`);
  if (typeof user?.streak === "number" && user.streak > 0) {
    lines.push(`Current study streak: ${user.streak} day(s)`);
  }

  // ── Syllabus progress + weakest modules ───────────────────────────────────
  const sp = userData?.syllabus_progress || {};
  let total = 0,
    count = 0;
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
    lines.push(
      `Overall syllabus progress: ${Math.round(total / count)}% across ${count} modules`,
    );
  }
  if (weak.length > 0) {
    weak.sort((a, b) => a.progress - b.progress);
    const top = weak
      .slice(0, 5)
      .map((w) => `${w.paper} → ${w.modName} (${w.progress}%)`)
      .join(", ");
    lines.push(`Weakest syllabus areas right now: ${top}`);
  }

  // ── Recent Mains evaluation performance ───────────────────────────────────
  const answers = Array.isArray(userData?.answers) ? userData.answers : [];
  if (answers.length > 0) {
    const scores = answers
      .map((a) => {
        try {
          const ev =
            typeof a.evaluation === "string"
              ? JSON.parse(a.evaluation)
              : a.evaluation;
          return typeof ev?.score === "number" ? ev.score : null;
        } catch {
          return null;
        }
      })
      .filter((s) => s !== null);
    if (scores.length > 0) {
      const avg = (scores.reduce((s, n) => s + n, 0) / scores.length).toFixed(
        1,
      );
      lines.push(
        `Mains answers evaluated so far: ${answers.length} (average score ${avg}/10)`,
      );
    }
  }

  // ── Durable facts distilled from past chats (see extractMemory) ──────────
  const memory = Array.isArray(userData?.mentor_memory)
    ? userData.mentor_memory
    : [];
  if (memory.length > 0) {
    lines.push(
      `Notable things to remember about this student: ${memory.slice(0, 15).join("; ")}`,
    );
  }

  if (lines.length === 0) return "";
  return `\n\n## Student Context (the student asked about their own progress — use this data to answer factually and specifically; do not add encouragement or commentary beyond the data itself)\n${lines.map((l) => `- ${l}`).join("\n")}`;
}

/**
 * Turns the first user message of a thread into a short title, ChatGPT-style.
 */
function deriveTitle(text) {
  const clean = (text || "").trim().replace(/\s+/g, " ");
  if (!clean) return "New chat";
  const words = clean.split(" ").slice(0, 8).join(" ");
  return words.length < clean.length ? `${words}…` : words;
}


function migrateLegacyChat(userData) {
  const existingThreads = Array.isArray(userData.mentor_threads)
    ? userData.mentor_threads
    : [];
  const legacy = Array.isArray(userData.mentor_chat)
    ? userData.mentor_chat
    : [];

  if (existingThreads.length > 0 || legacy.length === 0) {
    return { threads: existingThreads, migrated: false };
  }

  const firstUserMsg =
    legacy.find((m) => m.role === "user")?.content || "Earlier conversation";
  const migratedThread = {
    id: `thr_legacy_${Date.now()}`,
    title: deriveTitle(firstUserMsg),
    messages: legacy,
    createdAt: legacy[0]?.at || new Date().toISOString(),
    updatedAt: legacy[legacy.length - 1]?.at || new Date().toISOString(),
  };

  userData.mentor_threads = [migratedThread];
  userData.mentor_chat = [];
  userData.changed("mentor_threads", true);
  userData.changed("mentor_chat", true);

  return { threads: [migratedThread], migrated: true };
}

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

Paper: ${paper || "GS2"}
Word Count: ${wordCount} words

**Question:**
${question.trim()}

**Student's Answer:**
${answer.trim()}

Please evaluate this answer according to your mentor framework. Be specific about which UPSC keywords, constitutional articles, government reports, committee names, or data points are missing. The student has an engineering background, so they think analytically but may lack humanities-specific terminology and UPSC answer-writing conventions.`;

    console.log(`[Evaluation] Processing for user: ${req.user.id}`);

    const { result, provider } = await callAIClient(evalPrompt, paper || "GS2");
      const userData = await UserData.findOne({
      where: { user_id: req.user.id },
    });
    if (userData) {
      const answers = Array.isArray(userData.answers)
        ? [...userData.answers]
        : [];
      answers.push({
        id: `ans_${Date.now()}`,
        date: new Date().toISOString(),
        paper: paper || "GS",
        question: question.trim(),
        answer: answer.trim(),
        evaluation: JSON.stringify(result),
        word_count: wordCount,
      });
      userData.answers = answers;
      userData.changed("answers", true);
      await userData.save();
    }

    trackEvent(req.user.id, "answer_evaluated", "AI Evaluator", {
      subject: paper || "GS2",
      score: result?.score ?? null,
    }).catch(() => {});

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


const chat = async (req, res, next) => {
  try {
    const { message, context_hint, thread_id } = req.body;

    if (!message?.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "Message is required." });
    }

    if (!isAnyProviderAvailable()) {
      return res.status(503).json({
        success: false,
        error: "Chat service is temporarily offline.",
      });
    }

    // ── Load (or seed) this user's persisted record ───────────────────────────
    let userData = await UserData.findOne({ where: { user_id: req.user.id } });
    if (!userData) userData = await UserData.seedForUser(req.user.id);

    const { threads: migratedThreads } = migrateLegacyChat(userData);
    let threads = migratedThreads;

    let thread = thread_id ? threads.find((t) => t.id === thread_id) : null;
    if (!thread) {
      thread = {
        id: `thr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title: deriveTitle(message),
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      threads = [thread, ...threads];
    }

    // Only pulls in personal stats when the question is actually about the
    // student's own progress — see buildStudentContext for the gate.
    const contextBlock = buildStudentContext(req.user, userData, message);
    const pageBlock = context_hint
      ? `\n\nThe student is currently in this section of the app: "${context_hint}". Only reference this if directly relevant to the question.`
      : "";

    // Same multi-provider fallback chain (OpenRouter → Gemini → Groq) as the
    // Mains evaluator and Notes actions, instead of calling Gemini directly —
    // this is what lets a Gemini rate limit fall through to another model
    // instead of surfacing a raw 429 straight to the student.
    const systemInstruction = CHAT_SYSTEM_INSTRUCTION + contextBlock + pageBlock;
    const { response: responseText, provider } = await runMentorChat(
      systemInstruction,
      thread.messages,
      message.trim(),
    );

    // ── Persist both turns onto this thread, capped so it can't grow forever ─
    const now = new Date().toISOString();
    thread.messages = [
      ...thread.messages,
      { role: "user", content: message.trim(), at: now },
      { role: "assistant", content: responseText, at: now },
    ].slice(-MAX_HISTORY_MESSAGES);
    thread.updatedAt = now;

    // Bump this thread to the front (most-recently-used) and cap thread count
    threads = [thread, ...threads.filter((t) => t.id !== thread.id)]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, MAX_THREADS);

    userData.mentor_threads = threads;
    userData.changed("mentor_threads", true);
    await userData.save();

    trackEvent(req.user.id, "mentor_open", "AI Mentor").catch(() => {});

  const userTurnCount = thread.messages.filter(
      (m) => m.role === "user",
    ).length;
    if (userTurnCount % MEMORY_EXTRACTION_EVERY_N_TURNS === 0) {
      const turnText = `Student: ${message.trim()}\nMentor: ${responseText}`;
      extractMemory(
        Array.isArray(userData.mentor_memory) ? userData.mentor_memory : [],
        turnText,
      )
        .then(async (updatedMemory) => {
          const fresh = await UserData.findOne({
            where: { user_id: req.user.id },
          });
          if (!fresh) return;
          fresh.mentor_memory = updatedMemory;
          fresh.changed("mentor_memory", true);
          await fresh.save();
        })
        .catch((e) =>
          console.warn(
            "[Memory Extraction] background save failed:",
            e.message,
          ),
        );
    }

    return res.status(200).json({
      success: true,
      response: responseText,
      thread_id: thread.id,
      title: thread.title,
    });
  } catch (err) {
    console.error("Chat engine fault:", err);
    next(err);
  }
};

const listChatThreads = async (req, res, next) => {
  try {
    const userData = await UserData.findOne({
      where: { user_id: req.user.id },
    });
    if (!userData) return res.status(200).json({ success: true, threads: [] });

    const { threads, migrated } = migrateLegacyChat(userData);
    if (migrated) await userData.save();

    const summary = threads
      .slice()
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .map((t) => ({
        id: t.id,
        title: t.title,
        updatedAt: t.updatedAt,
        message_count: t.messages.length,
      }));

    return res.status(200).json({ success: true, threads: summary });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/evaluate/chat-threads/:id
 * Full message list for one saved chat.
 */
const getChatThread = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userData = await UserData.findOne({
      where: { user_id: req.user.id },
    });
    const threads = userData?.mentor_threads || [];
    const thread = threads.find((t) => t.id === id);

    if (!thread) {
      return res.status(404).json({ success: false, error: "Chat not found." });
    }

    return res.status(200).json({ success: true, thread });
  } catch (err) {
    next(err);
  }
};

const deleteChatThread = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userData = await UserData.findOne({
      where: { user_id: req.user.id },
    });
    if (userData) {
      userData.mentor_threads = (userData.mentor_threads || []).filter(
        (t) => t.id !== id,
      );
      userData.changed("mentor_threads", true);
      await userData.save();
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  evaluateAnswer,
  chat,
  listChatThreads,
  getChatThread,
  deleteChatThread,
};