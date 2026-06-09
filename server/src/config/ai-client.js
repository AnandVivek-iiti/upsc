// ai-client.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");
const Anthropic = require("@anthropic-ai/sdk");
const Groq = require("groq-sdk");

const SYSTEM_INSTRUCTION = `You are an elite UPSC Civil Services Mains evaluator — a composite of the top 10 rankers' mentors and UPSC examiners. You have access to the writing styles, frameworks, and answer patterns of IAS toppers (AIR 1–50) across the last 10 years.

Your student is analytically brilliant (JEE Advanced / NDA cleared) but relatively new to humanities writing. Your job is NOT to just grade — it is to TRANSFORM their answer into something a topper would write, and show them exactly how.

## Output Format
You MUST respond in this EXACT JSON structure. No markdown outside the JSON. No preamble. Just the JSON.

{
  "score": 5,
  "score_rationale": "Explanation here",
  "keywords": { "present": [], "missing": [], "bonus": [] },
  "structure": {
    "intro": { "rating": "Adequate", "comment": "Feedback" },
    "body": { "rating": "Weak", "comment": "Feedback" },
    "way_forward": { "rating": "Missing", "comment": "Feedback" },
    "conclusion": { "rating": "Weak", "comment": "Feedback" }
  },
  "strengths": [{ "point": "Strength", "quote": "quote" }],
  "weaknesses": [{ "point": "Weakness", "fix": "Fix" }],
  "topper_comparison": {
    "what_topper_does_differently": [],
    "constitutional_statutory_references": [],
    "data_points_missing": []
  },
  "topper_answer": "Complete topper standard answer text here...",
  "priority_actions": ["Action 1", "Action 2", "Action 3"]
}

Rules:
- Be brutally honest but constructive. No empty praise.
- Keywords must be specific UPSC power-words.
- The JSON must be valid and complete always.`;

// Robust Helper to clean and parse JSON even if markdown code blocks or trailing commas leak
function safeJSONParse(rawText) {
  let cleanText = rawText.trim();

  // 1. Remove markdown syntax blocks if leaked
  cleanText = cleanText.replace(/```json\s*|```\s*/gi, "");

  // 2. Extract strictly anything between the first '{' and last '}' to strip preambles
  const firstBrace = cleanText.indexOf('{');
  const lastBrace = cleanText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleanText = cleanText.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleanText);
  } catch (e) {
    // 3. Fallback: Strip trailing commas inside arrays/objects before crashing
    try {
      const fixedText = cleanText.replace(/,(\s*[\]}])/g, '$1');
      return JSON.parse(fixedText);
    } catch (innerError) {
      throw new Error(`AI returned malformed structural data. Original text: ${rawText.substring(0, 100)}...`);
    }
  }
}

const providers = [
  // ── PROVIDER 1: Gemini ──────────────
  {
    name: "Gemini",
    isAvailable: () => !!process.env.GEMINI_API_KEY,
    call: async (userPrompt) => {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
          temperature: 0.3, // Lower temperature means stricter adherence to JSON schema
          maxOutputTokens: 3000,
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
    call: async (userPrompt) => {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        temperature: 0.3,
        max_tokens: 3000,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_INSTRUCTION },
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
    call: async (userPrompt) => {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const response = await client.messages.create({
       model: "claude-sonnet-4-5",
        max_tokens: 3000,
        system: SYSTEM_INSTRUCTION,
        messages: [{ role: "user", content: userPrompt }],
      });
      return safeJSONParse(response.content[0].text);
    },
  },
// ── PROVIDER 4: Groq Cloud (Patched Wrapper) ──
  {
    name: "Groq",
    isAvailable: () => !!process.env.GROQ_API_KEY,
    call: async (userPrompt) => {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

      try {
        const response = await groq.chat.completions.create({
          model: "llama-3.3-70b-specdec",
          max_tokens: 3000,
          temperature: 0.2, // Reduced to minimize structural token generation anomalies
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM_INSTRUCTION },
            { role: "user", content: userPrompt },
          ],
        });
        return safeJSONParse(response.choices[0].message.content);
      } catch (err) {
        // Fallback pipeline if Groq's target validation rules fail but payload data exists
        if (err.status === 400 && err.message.includes("json_validate_failed")) {
          console.log("[AI Client] Groq strict schema rejected token layout, attempting recovery string sweep...");

          // Re-running context fetch safely without hard json restriction forcing structural crashes
          const rawResponse = await groq.chat.completions.create({
            model: "llama-3.3-70b-specdec",
            max_tokens: 3000,
            temperature: 0.1,
            messages: [
              { role: "system", content: SYSTEM_INSTRUCTION + "\nEnsure you do not put a square bracket instead of a curly brace when closing objects inside structure fields." },
              { role: "user", content: userPrompt },
            ],
          });
          return safeJSONParse(rawResponse.choices[0].message.content);
        }
        throw err;
      }
    },
  },
  // ── PROVIDER 5: DeepSeek ──────────────
// {
//   name: "DeepSeek",
//   isAvailable: () => !!process.env.DEEPSEEK_API_KEY,
//   call: async (userPrompt) => {
//     const openai = new OpenAI({
//       apiKey: process.env.DEEPSEEK_API_KEY,
//       baseURL: "https://api.deepseek.com",
//     });
//     const response = await openai.chat.completions.create({
//       model: "deepseek-chat",
//       temperature: 0.3,
//       max_tokens: 3000,
//       response_format: { type: "json_object" },
//       messages: [
//         { role: "system", content: SYSTEM_INSTRUCTION },
//         { role: "user", content: userPrompt },
//       ],
//     });
//     return safeJSONParse(response.choices[0].message.content);
//   },
// },
];

async function evaluateAnswer(userPrompt) {
  const availableProviders = providers.filter((p) => p.isAvailable());

  if (availableProviders.length === 0) {
    throw new Error("No API keys found in system configurations.");
  }

  const errors = [];
  for (const provider of availableProviders) {
    try {
      console.log(`[AI Client] Trying provider: ${provider.name}...`);
      const result = await provider.call(userPrompt);
      console.log(`[AI Client] Success with: ${provider.name}`);
      return { result, provider: provider.name };
    } catch (err) {
      const message = `${provider.name} failed: ${err.message}`;
      console.warn(`[AI Client] ${message}`);
      errors.push(message);
    }
  }

  throw new Error(`All providers failed.\n${errors.join("\n")}`);
}

module.exports = { evaluateAnswer, SYSTEM_INSTRUCTION };