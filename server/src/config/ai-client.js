// // ai-client.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");
const Groq = require("groq-sdk");
const {
  GS1_SYSTEM_INSTRUCTION,
  GS2_SYSTEM_INSTRUCTION,
  GS3_SYSTEM_INSTRUCTION,
  GS4_SYSTEM_INSTRUCTION,
  ESSAY_SYSTEM_INSTRUCTION,
} = require("./systemInstructions");
const { TEST_ANALYSIS_SYSTEM_INSTRUCTION } = require("./testInstructions");
const {
  CHAT_SYSTEM_INSTRUCTION,
  MEMORY_EXTRACTION_SYSTEM_INSTRUCTION,
} = require("./mentorInstructions");
const {
  NOTES_IMPROVE_SYSTEM_INSTRUCTION,
  NOTES_MISTAKES_SYSTEM_INSTRUCTION,
  NOTES_REVISION_SYSTEM_INSTRUCTION,
  NOTES_MAINS_SYSTEM_INSTRUCTION,
} = require("./notesInstructions");

function getSystemInstruction(paper) {
  switch ((paper || "").toUpperCase()) {
    case "GS1":
      return GS1_SYSTEM_INSTRUCTION;

    case "GS2":
      return GS2_SYSTEM_INSTRUCTION;

    case "GS3":
      return GS3_SYSTEM_INSTRUCTION;

    case "GS4":
      return GS4_SYSTEM_INSTRUCTION;

    case "ESSAY":
      return ESSAY_SYSTEM_INSTRUCTION;

    default:
      return GS2_SYSTEM_INSTRUCTION;
  }
}


function safeJSONParse(rawText) {
  let cleanText = rawText.trim();

  // 1. Remove markdown syntax blocks if leaked
  cleanText = cleanText.replace(/```json\s*|```\s*/gi, "");

  // 2. Extract strictly anything between the first '{' and last '}' to strip preambles
  const firstBrace = cleanText.indexOf("{");
  const lastBrace = cleanText.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleanText = cleanText.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleanText);
  } catch (e) {
    // 3. Fallback: Strip trailing commas inside arrays/objects before crashing
    try {
      const fixedText = cleanText.replace(/,(\s*[\]}])/g, "$1");
      return JSON.parse(fixedText);
    } catch (innerError) {
      console.log("=== RAW GEMINI RESPONSE ===");
      console.log(rawText);
      console.log("=== END RESPONSE ===");

      if (
        cleanText.includes('"topper_answer"') &&
        !cleanText.includes('"priority_actions"')
      ) {
        console.warn("Output truncated");
      }
    }
  }
}

/**
 * Background memory extraction — given the student's current durable-memory
 * list and the text of the latest chat turn, asks Gemini for a refreshed,
 * merged list. Deliberately low-stakes: any failure just returns the memory
 * unchanged rather than throwing, since this should never block or break the
 * actual chat response.
 */
async function extractMemory(existingMemory, turnText) {
  const current = Array.isArray(existingMemory) ? existingMemory : [];
  if (!process.env.GEMINI_API_KEY) return current;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: MEMORY_EXTRACTION_SYSTEM_INSTRUCTION,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 800,
        responseMimeType: "application/json",
      },
    });

    const prompt = `CURRENT MEMORY:\n${JSON.stringify(current)}\n\nLATEST CONVERSATION TURN:\n${turnText}`;
    const result = await model.generateContent(prompt);
    const parsed = safeJSONParse(result.response.text());

    if (Array.isArray(parsed?.memory)) {
      return parsed.memory
        .filter((f) => typeof f === "string" && f.trim())
        .slice(0, 40);
    }
    return current;
  } catch (err) {
    console.warn("[Memory Extraction] skipped:", err.message);
    return current;
  }
}

// ── SAMPLE ANSWER GENERATOR (offline fallback) ──────────────────────────────
// Called when all API providers are unavailable/failing.

// ── SAMPLE TEST ANALYSIS GENERATOR (offline fallback) ───────────────────────
// Called when all API providers are unavailable/failing for test analysis.
// Builds a deterministic, still-genuinely-useful diagnostic report purely
// from the topic_breakdown numbers — no AI required. Mirrors the spirit of
// generateSampleEvaluation above, but for MCQ Test Series results.

// ── OpenRouter model chain ───────────────────────────────────────────────────
// OpenRouter is the primary provider. It tries a list of models in order —
// free models first (zero marginal cost), then best-quality paid models as
// a quality fallback if every free model fails or returns something unusable.
// Override the whole list via OPENROUTER_MODELS (comma-separated slugs from
// https://openrouter.ai/models) if you want different models or ordering.
const DEFAULT_OPENROUTER_FREE_MODELS = [
  "deepseek/deepseek-chat-v3.1:free",
  "deepseek/deepseek-r1:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen-2.5-72b-instruct:free",
  "google/gemini-2.0-flash-exp:free",
  "mistralai/mistral-small-3.1-24b-instruct:free",
];
const DEFAULT_OPENROUTER_QUALITY_MODELS = [
  "anthropic/claude-sonnet-4.5",
  "openai/gpt-4o",
  "google/gemini-2.5-pro",
];

function getOpenRouterModelChain() {
  if (process.env.OPENROUTER_MODELS) {
    return process.env.OPENROUTER_MODELS.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [...DEFAULT_OPENROUTER_FREE_MODELS, ...DEFAULT_OPENROUTER_QUALITY_MODELS];
}

function getOpenRouterClient() {
  return new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      // Optional but recommended by OpenRouter for analytics/rankings.
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "",
      "X-Title": process.env.OPENROUTER_SITE_NAME || "UPSC AI Mentor",
    },
  });
}

// Builds a plain OpenAI-style chat messages array (system + history + latest
// user turn) — shared by every provider's chatCall so the mentor chat feature
// works the same way regardless of which provider answers.
function toChatMessages(systemInstruction, history, message) {
  const historyMsgs = (history || []).map((m) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: m.content,
  }));
  return [
    { role: "system", content: systemInstruction },
    ...historyMsgs,
    { role: "user", content: message },
  ];
}

const providers = [
  // ── PROVIDER 1: OpenRouter (primary) ────────────────────────────────────
  // Cascades through every model in getOpenRouterModelChain() before giving
  // up — free models first, then best-quality paid models — so a single
  // OpenRouter key behaves like its own internal fallback chain.
  {
    name: "OpenRouter",
    isAvailable: () => !!process.env.OPENROUTER_API_KEY,
    call: async (userPrompt, systemInstruction, mode = "json") => {
      const openrouter = getOpenRouterClient();
      const models = getOpenRouterModelChain();
      const modelErrors = [];

      for (const model of models) {
        try {
          const response = await openrouter.chat.completions.create({
            model,
            temperature: mode === "text" ? 0.4 : 0.3,
            max_tokens: 8192,
            ...(mode === "json" ? { response_format: { type: "json_object" } } : {}),
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: userPrompt },
            ],
          });
          const text = response.choices?.[0]?.message?.content;
          if (!text || !text.trim()) throw new Error("empty response");
          console.log(`[OpenRouter] success with model: ${model}`);
          return mode === "text" ? text : safeJSONParse(text);
        } catch (err) {
          const message = err?.message || String(err);
          console.warn(`[OpenRouter] model "${model}" failed: ${message}`);
          modelErrors.push(`${model}: ${message}`);

          // Some free models reject strict response_format — retry once
          // without it, asking for raw JSON in the prompt instead, before
          // moving on to the next model in the chain.
          if (mode === "json" && /response_format|json_object|json_validate/i.test(message)) {
            try {
              const retryResponse = await openrouter.chat.completions.create({
                model,
                temperature: 0.2,
                max_tokens: 8192,
                messages: [
                  {
                    role: "system",
                    content: `${systemInstruction}\nRespond with ONLY valid raw JSON — no markdown code fences, no commentary before or after.`,
                  },
                  { role: "user", content: userPrompt },
                ],
              });
              const retryText = retryResponse.choices?.[0]?.message?.content;
              if (retryText && retryText.trim()) {
                console.log(`[OpenRouter] recovered with model (loose schema): ${model}`);
                return safeJSONParse(retryText);
              }
            } catch (retryErr) {
              modelErrors.push(`${model} (retry): ${retryErr.message}`);
            }
          }
          // Otherwise just fall through to the next model in the chain.
        }
      }
      throw new Error(`All OpenRouter models failed. ${modelErrors.join(" | ")}`);
    },
    chatCall: async (systemInstruction, history, message) => {
      const openrouter = getOpenRouterClient();
      const models = getOpenRouterModelChain();
      const messages = toChatMessages(systemInstruction, history, message);
      const modelErrors = [];

      for (const model of models) {
        try {
          const response = await openrouter.chat.completions.create({
            model,
            temperature: 0.5,
            max_tokens: 1536,
            messages,
          });
          const text = response.choices?.[0]?.message?.content;
          if (!text || !text.trim()) throw new Error("empty response");
          console.log(`[OpenRouter:Chat] success with model: ${model}`);
          return text;
        } catch (err) {
          const m = err?.message || String(err);
          console.warn(`[OpenRouter:Chat] model "${model}" failed: ${m}`);
          modelErrors.push(`${model}: ${m}`);
        }
      }
      throw new Error(`All OpenRouter models failed. ${modelErrors.join(" | ")}`);
    },
  },

  // ── PROVIDER 2: Gemini (fallback) ───────────────────────────────────────
  {
    name: "Gemini",
    isAvailable: () => !!process.env.GEMINI_API_KEY,
    call: async (userPrompt, systemInstruction, mode = "json") => {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction,
        generationConfig: {
          temperature: mode === "text" ? 0.4 : 0.3,
          maxOutputTokens: 8192,
          ...(mode === "json" ? { responseMimeType: "application/json" } : {}),
        },
      });

      const result = await model.generateContent(userPrompt);
      const text = result.response.text();
      return mode === "text" ? text : safeJSONParse(text);
    },
    chatCall: async (systemInstruction, history, message) => {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction,
        generationConfig: { temperature: 0.5, maxOutputTokens: 1536 },
      });
      const geminiHistory = (history || []).map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));
      const chatSession = model.startChat({ history: geminiHistory });
      const result = await chatSession.sendMessage(message);
      return result.response.text();
    },
  },

  // ── PROVIDER 3: Groq Cloud (fallback) ───────────────────────────────────
  {
    name: "Groq",
    isAvailable: () => !!process.env.GROQ_API_KEY,
    call: async (userPrompt, systemInstruction, mode = "json") => {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const wantsJSON = mode !== "text";

      try {
        const response = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          max_tokens: 8192,
          temperature: wantsJSON ? 0.2 : 0.4,
          ...(wantsJSON ? { response_format: { type: "json_object" } } : {}),
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userPrompt },
          ],
        });
        const text = response.choices[0].message.content;
        return wantsJSON ? safeJSONParse(text) : text;
      } catch (err) {
        if (
          wantsJSON &&
          err.status === 400 &&
          err.message.includes("json_validate_failed")
        ) {
          console.log(
            "[AI Client] Groq strict schema rejected, attempting recovery...",
          );
          const rawResponse = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            max_tokens: 8192,
            temperature: 0.1,
            messages: [
              {
                role: "system",
                content:
                  systemInstruction +
                  "\nEnsure you do not put a square bracket instead of a curly brace when closing objects inside structure fields.",
              },
              { role: "user", content: userPrompt },
            ],
          });
          return safeJSONParse(rawResponse.choices[0].message.content);
        }
        throw err;
      }
    },
    chatCall: async (systemInstruction, history, message) => {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const messages = toChatMessages(systemInstruction, history, message);
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1536,
        temperature: 0.5,
        messages,
      });
      return response.choices[0].message.content;
    },
  },
];

// Lets callers (e.g. the chat endpoint) fail fast with a clean 503 instead of
// going through the full provider loop when nothing is configured at all.
function isAnyProviderAvailable() {
  return providers.some((p) => p.isAvailable());
}

// ── Shared multi-provider runner ─────────────────────────────────────────────
// Every feature (evaluate / test / notes) tries the same provider chain in
// the same order and needs the same try/log/fallback loop — this used to be
// duplicated 2x inline; now it's one function all 3 features call.
async function runWithProviders(userPrompt, systemInstruction, { mode = "json", label = "AI Client" } = {}) {
  const availableProviders = providers.filter((p) => p.isAvailable());
  if (availableProviders.length === 0) {
    throw new Error("No AI providers configured.");
  }

  const errors = [];
  for (const provider of availableProviders) {
    try {
      console.log(`[${label}] Trying provider: ${provider.name}...`);
      const result = await provider.call(userPrompt, systemInstruction, mode);
      console.log(`[${label}] Success with: ${provider.name}`);
      return { result, provider: provider.name };
    } catch (err) {
      const message = `${provider.name} failed: ${err.message}`;
      console.warn(`[${label}] ${message}`);
      errors.push(message);
    }
  }
  throw new Error(`All AI providers failed. ${errors.join(" | ")}`);
}

/**
 * runMentorChat — same provider chain and fallback philosophy as
 * runWithProviders, but for multi-turn conversational chat (the mentor chat
 * feature). Each provider exposes its own chatCall() because Gemini's SDK
 * wants history in its own {role, parts} shape via startChat(), while
 * OpenRouter/Groq just want a flat OpenAI-style messages array — this
 * function hides that difference from the caller.
 *
 * @param {string} systemInstruction
 * @param {{role: string, content: string}[]} history — prior turns in the thread
 * @param {string} message — the new user message
 * @returns {Promise<{ response: string, provider: string }>}
 */
async function runMentorChat(systemInstruction, history, message) {
  const availableProviders = providers.filter((p) => p.isAvailable());
  if (availableProviders.length === 0) {
    throw new Error("No AI providers configured.");
  }

  const errors = [];
  for (const provider of availableProviders) {
    try {
      console.log(`[Mentor Chat] Trying provider: ${provider.name}...`);
      const response = await provider.chatCall(systemInstruction, history, message);
      console.log(`[Mentor Chat] Success with: ${provider.name}`);
      return { response, provider: provider.name };
    } catch (err) {
      const msg = `${provider.name} failed: ${err.message}`;
      console.warn(`[Mentor Chat] ${msg}`);
      errors.push(msg);
    }
  }
  throw new Error(`All AI providers failed. ${errors.join(" | ")}`);
}

// Normalizes the raw evaluator JSON into the exact shape the frontend expects.
function normalizeEvaluation(result) {
  return {
    score: result.score ?? 0,
    score_rationale: result.score_rationale || result.feedback || "",
    strengths: result.strengths || [],
    weaknesses: result.weaknesses || [],
    topper_answer: result.topper_answer || result.topper_answer_rewrite || "",
    keywords: result.keywords || { present: [], missing: [], bonus: [] },
    structure: result.structure || {},
    examiner_verdict: result.examiner_verdict || null,
    topper_comparison: result.topper_comparison || {},
    priority_actions: result.priority_actions || [],
  };
}

async function evaluateAnswer(userPrompt, paper) {
  const systemInstruction = getSystemInstruction(paper);
  const { result, provider } = await runWithProviders(userPrompt, systemInstruction, {
    label: "AI Client",
  });
  console.log("[AI RAW RESULT]", JSON.stringify(result, null, 2));
  return { result: normalizeEvaluation(result), provider };
}

/**
 * analyzeTestPerformance — runs the MCQ Test Series diagnostic AI.
 * Separate from evaluateAnswer (which is for Mains essays) — same provider
 * list and fallback philosophy, but its own system instruction and its own
 * deterministic offline fallback (generateSampleTestAnalysis).
 *
 * @param {object} payload — see buildTestAnalysisPrompt() below for shape.
 * @returns {{ result: object, provider: string }}
 */
async function analyzeTestPerformance(payload) {
  const userPrompt = buildTestAnalysisPrompt(payload);
  const availableProviders = providers.filter((p) => p.isAvailable());
  const errors = [];

  if (availableProviders.length > 0) {
    for (const provider of availableProviders) {
      try {
        console.log(`[Test Analysis] Trying provider: ${provider.name}...`);
        const result = await provider.call(
          userPrompt,
          TEST_ANALYSIS_SYSTEM_INSTRUCTION,
        );
        console.log(`[Test Analysis] Success with: ${provider.name}`);
        return { result, provider: provider.name };
      } catch (err) {
        const message = `${provider.name} failed: ${err.message}`;
        console.warn(`[Test Analysis] ${message}`);
        errors.push(message);
      }
    }
    console.warn(
      "[Test Analysis] All providers failed. Falling back to offline analysis.",
    );
    console.warn("[Test Analysis] Provider errors:", errors.join(" | "));
  } else {
    console.warn(
      "[Test Analysis] No API keys configured. Using offline analysis.",
    );
  }
  throw new Error(
    `All AI providers failed. ${errors.join(" | ") || "No AI providers configured."}`,
  );
}

// Builds the user-facing prompt sent to the AI for test analysis, from the
// structured payload assembled by testController.js.
function buildTestAnalysisPrompt(payload) {
  const {
    test_series,
    test_title,
    subject,
    total_questions,
    duration_minutes,
    correct_count,
    wrong_count,
    skipped_count,
    attempted_count,
    score,
    max_marks,
    accuracy,
    percentage,
    performance_band,
    topic_breakdown,
  } = payload;

  const topicLines = (topic_breakdown || [])
    .map((t) => {
      const attempted = (t.correct || 0) + (t.wrong || 0);
      const acc = attempted > 0 ? Math.round((t.correct / attempted) * 100) : 0;
      return `- ${t.topic}: ${t.correct || 0} correct, ${t.wrong || 0} wrong, ${t.skipped || 0} skipped (accuracy on attempted: ${acc}%)`;
    })
    .join("\n");

  return `**TEST PERFORMANCE ANALYSIS REQUEST**

Test Series: ${test_series}
Test: ${test_title}
Subject: ${subject}
Total Questions: ${total_questions} | Duration: ${duration_minutes} min

**Overall Result:**
Score: ${score} / ${max_marks} (${percentage.toFixed(1)}%)
Performance Band: ${performance_band}
Correct: ${correct_count} | Wrong: ${wrong_count} | Skipped: ${skipped_count} | Attempted: ${attempted_count}/${total_questions}
Accuracy on attempted questions: ${accuracy.toFixed(1)}%

**Topic-wise Breakdown:**
${topicLines || "(no topic breakdown provided)"}

Analyze this performance. Identify genuine strengths, diagnose weak topics with priority for revision, and produce a realistic 7-day study plan targeting the weakest areas first. Be specific and reference the actual numbers above.`;
}

// ── NOTES FEATURE: Improve / Find Mistakes / Revision / Mains Format ────────
// Maps each Notes action id (as used by the frontend AI_ACTIONS list in
// MentorNote.jsx) to its dedicated system instruction from notesInstructions.js.
const NOTES_SYSTEM_INSTRUCTIONS = {
  improve: NOTES_IMPROVE_SYSTEM_INSTRUCTION,
  mistakes: NOTES_MISTAKES_SYSTEM_INSTRUCTION,
  revision: NOTES_REVISION_SYSTEM_INSTRUCTION,
  mains: NOTES_MAINS_SYSTEM_INSTRUCTION,
};

function buildNotesPrompt({ title, topic, content }) {
  return `**STUDENT NOTE**

Title: ${title?.trim() || "(untitled)"}
Topic: ${topic?.trim() || "(unspecified)"}

${content.trim()}`;
}

/**
 * runNotesAction — single entry point for all 4 Notes AI actions (Improve /
 * Find Mistakes / Generate Revision Notes / Convert to Mains Format). Each
 * action gets its own dedicated UPSC-examiner-grade system instruction (see
 * notesInstructions.js) and runs through the same multi-provider fallback
 * chain as the Mains evaluator (Gemini → OpenAI → Claude → Groq). Always
 * requested as plain text/markdown ("mode: text"), never JSON, since every
 * notes instruction is written to output markdown directly — this is what
 * lets "Convert to Mains Format" genuinely regenerate a full topper-standard
 * answer using the model's own UPSC knowledge, not just reformat the note.
 *
 * @param {"improve"|"mistakes"|"revision"|"mains"} actionId
 * @param {{ title?: string, topic?: string, content: string }} payload
 * @returns {Promise<{ result: string, provider: string }>}
 */
async function runNotesAction(actionId, payload) {
  const systemInstruction = NOTES_SYSTEM_INSTRUCTIONS[actionId];
  if (!systemInstruction) {
    throw new Error(`Unknown notes action: "${actionId}"`);
  }

  const content = (payload?.content || "").trim();
  if (content.length < 20) {
    throw new Error("Note content is too short for AI to work with (min 20 characters).");
  }

  const userPrompt = buildNotesPrompt({
    title: payload.title,
    topic: payload.topic,
    content,
  });

  const { result, provider } = await runWithProviders(userPrompt, systemInstruction, {
    mode: "text",
    label: `Notes:${actionId}`,
  });

  return { result, provider };
}

module.exports = {
  evaluateAnswer,
  analyzeTestPerformance,
  runNotesAction,
  CHAT_SYSTEM_INSTRUCTION,
  TEST_ANALYSIS_SYSTEM_INSTRUCTION,
  extractMemory,
};