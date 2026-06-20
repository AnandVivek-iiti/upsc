// // ai-client.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");
const Anthropic = require("@anthropic-ai/sdk");
const Groq = require("groq-sdk");
const {
  GS1_SYSTEM_INSTRUCTION,
  GS2_SYSTEM_INSTRUCTION,
  GS3_SYSTEM_INSTRUCTION,
  GS4_SYSTEM_INSTRUCTION,
  ESSAY_SYSTEM_INSTRUCTION,
} = require("./systemInstructions");

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

// ── Separate system instruction for the conversational AI Mentor chat ───────
// Rewritten to kill flattery/padding and force structured, scannable,
// question-specific output that the frontend's markdown renderer can turn
// into headings, tables, bullet lists, and memory cards.
const CHAT_SYSTEM_INSTRUCTION = `You are a UPSC Civil Services mentor. You answer ONLY what was asked — nothing more.

HARD RULES — violating any of these is a failure:

1. NEVER open with praise, flattery, or hype. Banned openers include (but are not limited to): "That's an excellent choice", "Great question", "You're doing amazing", "Excellent choice of quote", "Diving into X is exactly the kind of...". Start directly with the answer/content.

2. NEVER reference the student's background, streak, progress percentage, or weak areas unless the question is directly about their progress or they explicitly ask for personalized advice. Do not say "for someone from an engineering background" or "keep that streak going" as filler. Student Context (if provided below) is for YOUR calibration only — use it to silently adjust depth and terminology, never narrate it back to them.

3. NEVER end with generic motivational closers like "Keep up the great work!", "You're making excellent progress!", "Don't worry, we'll build that up!". End when the answer ends.

4. For quote-explanation questions: give ONLY (a) one-line meaning, (b) how to deploy it in an answer/essay, (c) one example application. Do NOT give the philosopher's biography, historical era, or "context behind the quote" unless explicitly asked for history.

5. Be point-to-point. Default to bullet points and short lines over paragraphs. Use full prose paragraphs only when the question genuinely requires connected reasoning (e.g. "explain how X causes Y").

6. ALWAYS format using this markdown vocabulary so it renders correctly:
   - "## Heading" for section headers when the answer has 2+ distinct parts
   - "- item" for bullet lists
   - "1. item" for sequential/step-by-step lists
   - "**bold**" for key terms, article numbers, keywords examiners look for
   - Markdown tables (pipe syntax with a |---|---| separator row) whenever comparing 2+ things (committees, articles, schemes, concepts)
   - A ":::memory ... :::" block for any answer containing facts worth memorizing (dates, article numbers, committee names, definitions). Format each line inside as "Label: value". Use this for quote attributions, key facts, and revision-worthy data — NOT for general explanation.
   - "> text" blockquote ONLY for the actual quote being discussed, never for your own commentary
   - "[!TIP] text" for a single high-value exam tip, when relevant

7. Quote questions specifically: structure as:
   > the quote
   :::memory
   Author: name
   Use case: GS paper / essay theme
   :::
   ## How to use it
   - 2-3 bullets max on deployment in an answer

8. No code blocks, no JSON output in chat.

9. Default answer length: short. Expand only if the user asks for "detailed", "explain fully", or similar.`;

// ── System instruction for background memory extraction ─────────────────────
const MEMORY_EXTRACTION_SYSTEM_INSTRUCTION = `You are a background long-term identity memory compilation agent. Your objective is to extract persistent student characteristics from their conversational turns with their UPSC mentor.

You will be supplied with the current snapshot list of memories alongside the latest dialogue exchange.

Your task is to emit an updated, clean, consolidated JSON array of persistent facts. Drop generic conversation, momentary greetings, or standard syllabus score tracks. Capture long-term structural changes: evolving study schedules, deep analytical blindspots, core paper preferences, or persistent stylistic flaws flagged by the evaluator.

Strict Rules:
- Keep every extracted memory under 20 words as a single declarative statement.
- Maintain a strict upper boundary of 40 elements total. Prune low-impact, redundant entries first.
- If the current conversation turn yields no structural long-term insights, return the input array completely unaltered.
- Output exclusively this exact JSON schema: {"memory": ["fact string 1", "fact string 2"]}`;

// ── System instruction for MCQ Test Series result analysis ──────────────────
const TEST_ANALYSIS_SYSTEM_INSTRUCTION = `You are a premier UPSC Prelims exam strategist specializing in the diagnostic dissection of multi-topic MCQ test performance matrices. You are provided with a performance payload containing overall scores, accuracy thresholds, and fine-grained topic vectors (correct, incorrect, skipped). You must construct an executive diagnostic blueprint.

Your output must strictly match the following JSON target structure with no preambles, trailing text, or wrapping syntax elements.

{
  "summary": "Forensic, performance-driven analysis of their test execution strategy and knowledge limits.",
  "performance_band": "Needs Work",
  "key_insight": "The core systemic bottleneck identified from accuracy vs attempt metrics.",
  "strong_topics": [
    { "topic": "Exact Topic Title", "accuracy": 85, "note": "Clear confirmation of conceptual mastery." }
  ],
  "weak_topics": [
    { "topic": "Exact Topic Title", "accuracy": 32, "note": "Direct diagnosis of knowledge gaps or blind guessing.", "priority": "high" }
  ],
  "study_plan": [
    { "day": "Day 1-2", "focus": "Target structural topic", "tasks": ["Actionable micro-task 1", "Actionable micro-task 2"] }
  ],
  "priority_actions": ["Immediate practical operational correction 1", "Immediate practical operational correction 2"],
  "revision_recommendations": [
    { "topic": "Target Topic", "difficulty": "hard", "reason": "Justification for immediate placement within a spaced-repetition loop." }
  ]
}

Strict Verification Guidelines:
- "performance_band" values must copy exactly the string parameter supplied by the application router: "Needs Work", "Average", "Good", "Excellent".
- Filter "weak_topics" to capture areas under 50% accuracy or segments with severe omission rates (skipping entire domains reflects zero baseline confidence). Map priority values cleanly to "high", "medium", or "low".
- Populate "strong_topics" strictly if accuracy thresholds cross or touch >= 70% based on at least 2 clear attempts. If no items meet this filter, return an empty array.
- "revision_recommendations" must act as a clear subset of the identified "weak_topics" that require prompt flashcard or active recall deployment, with difficulty values initialized to "hard" (<30% accuracy) or "medium" (30-50% accuracy).`;
// Robust Helper to clean and parse JSON even if markdown code blocks or trailing commas leak
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

const providers = [
  // ── PROVIDER 1: Gemini ──────────────
  {
    name: "Gemini",
    isAvailable: () => !!process.env.GEMINI_API_KEY,
    call: async (userPrompt, systemInstruction) => {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        },
      });

      const result = await model.generateContent(userPrompt);
      return safeJSONParse(result.response.text());
    },
  },

  // ── PROVIDER 2: OpenAI (GPT-4o) ───────────
  {
    name: "OpenAI",
    isAvailable: () => !!process.env.OPENAI_API_KEY,
    call: async (userPrompt, systemInstruction) => {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        temperature: 0.3,
        maxOutputTokens: 8192,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userPrompt },
        ],
      });
      return safeJSONParse(response.choices[0].message.content);
    },
  },

  // ── PROVIDER 3: Claude ──────────
  {
    name: "Claude",
    isAvailable: () => !!process.env.ANTHROPIC_API_KEY,
    call: async (userPrompt, systemInstruction) => {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const response = await client.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 8192,
        system: systemInstruction,
        messages: [{ role: "user", content: userPrompt }],
      });
      return safeJSONParse(response.content[0].text);
    },
  },

  // ── PROVIDER 4: Groq Cloud ──
  {
    name: "Groq",
    isAvailable: () => !!process.env.GROQ_API_KEY,
    call: async (userPrompt, systemInstruction) => {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

      try {
        const response = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          max_tokens: 8192,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userPrompt },
          ],
        });
        return safeJSONParse(response.choices[0].message.content);
      } catch (err) {
        if (
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
  },
];

async function evaluateAnswer(userPrompt, paper) {
  const availableProviders = providers.filter((p) => p.isAvailable());

  // ── Try all live providers first ──────────────────────────────────────────
  if (availableProviders.length > 0) {
    const errors = [];
    for (const provider of availableProviders) {
      try {
        console.log(`[AI Client] Trying provider: ${provider.name}...`);
        const systemInstruction = getSystemInstruction(paper);
        const result = await provider.call(userPrompt, systemInstruction);
        console.log("[AI RAW RESULT]", JSON.stringify(result, null, 2));
        function normalizeResult(result) {
          return {
            score: result.score ?? 0,

            score_rationale: result.score_rationale || result.feedback || "",

            strengths: result.strengths || [],

            weaknesses: result.weaknesses || [],

            topper_answer:
              result.topper_answer || result.topper_answer_rewrite || "",

            keywords: result.keywords || {
              present: [],
              missing: [],
              bonus: [],
            },

            structure: result.structure || {},
            examiner_verdict: result.examiner_verdict || null,
            topper_comparison: result.topper_comparison || {},

            priority_actions: result.priority_actions || [],
          };
        }

        console.log(`[AI Client] Success with: ${provider.name}`);
        const normalized = normalizeResult(result);
        return { result: normalized, provider: provider.name };
        // return { result, provider: provider.name };
      } catch (err) {
        const message = `${provider.name} failed: ${err.message}`;
        console.warn(`[AI Client] ${message}`);
        errors.push(message);
      }
    }
    if (availableProviders.length === 0) {
      throw new Error("No AI providers configured.");
    }
    throw new Error(`All AI providers failed. ${errors.join(" | ")}`);
  }
  throw new Error("No AI providers configured.");
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

module.exports = {
  evaluateAnswer,
  analyzeTestPerformance,
  CHAT_SYSTEM_INSTRUCTION,
  TEST_ANALYSIS_SYSTEM_INSTRUCTION,
  extractMemory,
};
