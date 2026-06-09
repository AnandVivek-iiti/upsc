// // ai-client.js
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

// ── SAMPLE ANSWER GENERATOR (offline fallback) ──────────────────────────────
// Called when all API providers are unavailable/failing.
// Generates a realistic, structured UPSC evaluation based on the answer text.
function generateSampleEvaluation(userPrompt) {
  // Extract question, answer, paper from the prompt text
  const paperMatch = userPrompt.match(/Paper:\s*(.+)/);
  const wcMatch    = userPrompt.match(/Word Count:\s*(\d+)/);
  const paper      = paperMatch ? paperMatch[1].trim() : "General Studies";
  const wordCount  = wcMatch    ? parseInt(wcMatch[1]) : 100;

  // Score heuristic: rough scoring based on answer length
  const rawScore = wordCount < 80  ? 3
                 : wordCount < 150 ? 4
                 : wordCount < 250 ? 5
                 : wordCount < 350 ? 6
                 : 7;

  const scoreRationales = {
    3: "The answer is very brief and lacks the depth expected in a UPSC Mains response. Critical dimensions — constitutional, analytical, and examples — are absent.",
    4: "The answer provides a basic outline but misses nuanced arguments, relevant data points, and the multi-dimensional approach UPSC examiners reward.",
    5: "A decent attempt with some structure, but the answer needs sharper keywords, stronger data anchors, and a clearer 'way forward' to score in the 6–7 range.",
    6: "A good attempt with reasonable coverage. Targeted improvements in analytical depth, constitutional references, and a stronger conclusion would push this to 7+.",
    7: "A solid answer with good structure. Add specific committee reports, statistical data, and a forward-looking policy recommendation to reach topper standard.",
  };

  // Paper-specific keyword banks
  const keywordBank = {
    GS1: {
      present: ["historical context", "socio-cultural dimensions"],
      missing: ["Preamble values", "constitutional morality", "syncretic traditions", "demographic dividend", "geo-strategic significance"],
      bonus: ["civilizational continuity", "epistemic framework"],
    },
    GS2: {
      present: ["governance", "constitutional provisions"],
      missing: ["Article 356", "cooperative federalism", "separation of powers", "judicial review", "directive principles"],
      bonus: ["Sarkaria Commission", "Punchhi Commission", "NCRWC recommendations"],
    },
    GS3: {
      present: ["economic growth", "policy framework"],
      missing: ["fiscal consolidation", "monetary policy transmission", "MSME ecosystem", "PLI scheme", "green hydrogen mission"],
      bonus: ["Economic Survey 2024", "India@2047 vision", "Viksit Bharat"],
    },
    GS4: {
      present: ["ethical considerations", "public duty"],
      missing: ["probity in governance", "emotional intelligence", "conflict of interest", "Nolan principles", "Gandhi's talisman"],
      bonus: ["2nd ARC recommendations", "Santhanam Committee"],
    },
    Essay: {
      present: ["introduction", "body paragraphs"],
      missing: ["philosophical underpinning", "multidimensional analysis", "global context", "historical perspective", "way forward"],
      bonus: ["interdisciplinary approach", "dialectical reasoning"],
    },
  };

  const kw = keywordBank[paper] || keywordBank["GS2"];

  const topperAnswerByPaper = {
    GS1: `India's civilizational history offers a unique template of plurality and synthesis. The question demands a multi-dimensional analysis spanning historical, geographical, and socio-cultural lenses.

From a historical perspective, India's development trajectory has been shaped by both endogenous traditions and exogenous influences — from the Vedic synthesis to the Bhakti-Sufi movements, colonial modernity to post-independence nation-building. This layered evolution distinguishes India's path from linear Western models of development.

Geographically, India's peninsular position, monsoonal dependence, and Himalayan watershed create unique structural imperatives for resource governance. The Indo-Gangetic Plain, home to ~40% of the population, exemplifies the tension between demographic concentration and ecological carrying capacity.

Sociologically, the interplay of caste, class, gender, and religion continues to mediate access to resources and opportunities. Constitutional safeguards (Articles 15, 16, 46) and affirmative action policies reflect the state's commitment to bridging structural inequities rooted in historical hierarchies.

Way Forward: A holistic approach integrating cultural preservation with sustainable development, strengthening decentralized governance (73rd/74th Amendments), and investing in human capital development aligned with India's demographic dividend is imperative.

The path ahead requires moving from 'growth-centric' to 'development-centric' frameworks — where economic progress is measured by human flourishing and ecological sustainability, not merely GDP metrics.`,

    GS2: `India's constitutional democracy rests on the foundational pillars of separation of powers, federalism, and judicial independence. The question demands a nuanced analysis of institutional design, functional efficacy, and reform imperatives.

Constitutionally, Articles 74, 75, 163, and 164 establish the contours of executive accountability, while Articles 124–147 and 214–231 define judicial independence. The 42nd Amendment (1976) and its partial reversal by the 44th Amendment (1978) reflect the ongoing tension between parliamentary supremacy and constitutional governance.

From a governance perspective, the Sarkaria Commission (1983) and Punchhi Commission (2010) recommendations on Centre-State relations remain partially implemented, with cooperative federalism gaining renewed emphasis under schemes like NITI Aayog and the Finance Commission framework (Article 280).

The judicial enforcement of Fundamental Rights has evolved significantly — from A.K. Gopalan (1950) to Maneka Gandhi (1978) to Puttaswamy (2017) — expanding the 'due process' doctrine that aligns India closer to substantive constitutionalism over procedural legalism.

Challenges: Political interference in constitutional bodies, delay in judicial appointments (NJAC struck down in 2015), and opacity in electoral funding (Electoral Bonds scheme, now struck down in 2024) reflect systemic vulnerabilities.

Way Forward: Strengthening the Election Commission's functional autonomy, expediting judicial appointments via a transparent collegium-plus-executive mechanism, and implementing the 2nd ARC recommendations on civil service reforms are essential for governance integrity.

India's democratic resilience lies not in institutional perfection but in the adaptive capacity of its constitutional culture.`,

    GS3: `India's developmental trajectory sits at the intersection of structural transformation, technological disruption, and ecological constraints. A topper-standard answer must integrate economic, scientific, and security dimensions.

Economically, India's $3.7 trillion economy (2024) faces the dual challenge of sustaining 7%+ growth while ensuring inclusive development. The 'K-shaped recovery' post-COVID, rising MSME stress, and the informal sector's absorption capacity (employing ~90% of the workforce) demand structural reforms beyond macroeconomic stability.

On infrastructure, the PM Gati Shakti National Master Plan and the National Infrastructure Pipeline (₹111 lakh crore by 2025) signal a paradigm shift from project-based to network-based infrastructure development, with multiplier effects across logistics, manufacturing, and exports.

Technologically, India's digital public infrastructure — UPI, Aadhaar, ONDC — represents a globally replicable model of democratizing financial access. India Stack's open architecture has enabled 90+ crore Jan Dhan accounts, directly enabling Direct Benefit Transfers worth ₹38 lakh crore (2014–2024).

Security-Economy Nexus: Left-wing extremism (LWE), now confined to 25 districts (from 126 in 2010), reflects the linkage between developmental deficit and security challenges. SAMADHAN strategy integrates CRPF deployment with aspirational district development.

Way Forward: Accelerating PLI scheme outcomes, expanding green hydrogen production targets (5 MMT by 2030), and leveraging AI/semiconductor manufacturing under the India Semiconductor Mission are critical for the next growth phase.

India's ₹100 lakh crore economy by 2030 vision requires not just capital investment but institutional reform — in land, labour, and regulatory architecture.`,

    GS4: `The ethical dimensions of public administration lie at the heart of good governance. This question demands an examination of the interface between personal values, institutional integrity, and public trust.

Foundational values in public service — as articulated by the Nolan Committee (UK, 1995) and adapted by India's 2nd ARC — include selflessness, integrity, objectivity, accountability, openness, honesty, and leadership. These are not aspirational ideals but operational frameworks for daily administrative decision-making.

In the case presented, the civil servant faces a classic 'role morality' versus 'personal morality' dilemma. The Kantian categorical imperative — to act only according to principles one could will to become universal law — would demand transparency and resistance to unethical orders. Simultaneously, the consequentialist perspective would evaluate the net harm vs. benefit of compliance versus defiance.

Emotional Intelligence (EQ), as theorized by Goleman (1995), is indispensable here. A civil servant with high EQ would (a) recognize the emotional weight of the situation, (b) regulate personal frustration, (c) empathize with affected stakeholders, and (d) exercise social skills to build coalitions for ethical outcomes.

Practical Course of Action: Document concerns formally, escalate through proper channels (CVC, CAT), invoke whistleblower protection (Whistle Blowers Protection Act, 2014), and if ordered to act against law, invoke the civil servant's right to seek written orders under CCS Conduct Rules.

Gandhi's talisman remains the most practical ethical compass: "Recall the face of the poorest and weakest person and ask whether the step you contemplate is going to be of any use to them."

Integrity is not a luxury of good times — it is the load-bearing wall of democratic governance.`,

    Essay: `[Sample Essay Framework — AIR Standard]

Introduction: Begin with a philosophical hook — a paradox, a quote, or a striking contemporary fact that frames the essay's central tension.

Thesis Statement: Clearly articulate the essay's central argument in 2-3 sentences. A UPSC essay must have a spine — a clear position that is defended, not just described.

Body — Dimension 1 (Historical/Philosophical): Situate the theme in historical context. Use specific examples, movements, or thinkers. Avoid vague generalities.

Body — Dimension 2 (Contemporary/Empirical): Ground the essay in current data, policy, and case studies. India-specific examples must be supplemented with global context.

Body — Dimension 3 (Critical Analysis): Acknowledge counter-arguments and tensions. A top-scoring essay engages with complexity rather than presenting a one-sided narrative.

Way Forward: Concrete, actionable recommendations or a synthesizing vision. Avoid clichés like "holistic approach needed."

Conclusion: Return to the opening theme with a transformed perspective. The conclusion must feel earned — not like a summary but like a resolution.

Note: This is a structural framework. Your actual answer should weave these dimensions organically, not as separate sections.`,
  };

  const topperAnswer = topperAnswerByPaper[paper] || topperAnswerByPaper["GS2"];

  return {
    score: rawScore,
    score_rationale: scoreRationales[rawScore] || scoreRationales[5],
    keywords: {
      present: kw.present,
      missing: kw.missing,
      bonus:   kw.bonus,
    },
    structure: {
      intro: {
        rating: wordCount > 100 ? "Adequate" : "Weak",
        comment: wordCount > 100
          ? "Your introduction sets the context but lacks a crisp definitional hook that UPSC examiners reward. Consider opening with a constitutional provision, a report quote, or a striking statistic."
          : "Introduction is too brief. Frame the issue with historical/constitutional context in 3–4 sentences.",
      },
      body: {
        rating: wordCount > 200 ? "Adequate" : "Weak",
        comment: wordCount > 200
          ? "Body paragraphs cover the topic but need sharper thematic segmentation — each paragraph should open with a clear topic sentence and close with a mini-inference."
          : "Body lacks multidimensional analysis. Expand with political, economic, social, and technological dimensions as applicable.",
      },
      way_forward: {
        rating: wordCount > 250 ? "Adequate" : "Missing",
        comment: "Way forward should be specific and actionable — cite specific schemes (PM Gati Shakti, SAMADHAN), committees (Sarkaria, Punchhi), or legislative frameworks. Avoid generic recommendations.",
      },
      conclusion: {
        rating: wordCount > 200 ? "Adequate" : "Weak",
        comment: "Conclusion should synthesize rather than summarize. End with a forward-looking statement that ties the answer's core argument to India's constitutional vision or development goals.",
      },
    },
    strengths: [
      {
        point: "Demonstrates awareness of the core issue and attempts a structured response.",
        quote: "",
      },
      {
        point: "Answer shows analytical thinking — a strength to build upon with UPSC-specific vocabulary.",
        quote: "",
      },
    ],
    weaknesses: [
      {
        point: "Missing specific constitutional articles, committee names, and government schemes that examiners look for.",
        fix: `For ${paper}, always include at least 2–3 specific references: articles, landmark judgments, or data from Economic Survey / India Year Book.`,
      },
      {
        point: "Answer lacks the 'Way Forward' dimension which carries significant examiner weight.",
        fix: "Dedicate the final 60–80 words to concrete, policy-linked recommendations.",
      },
      {
        point: "Vocabulary is general rather than domain-specific. UPSC power-words are missing.",
        fix: "Study the missing keywords above and practice incorporating them naturally in sentences.",
      },
    ],
    topper_comparison: {
      what_topper_does_differently: [
        "Opens with a definitional/constitutional hook, not a general statement",
        "Uses specific data points from recent government reports (Economic Survey, NCRB, NSO)",
        "Structures body around clear dimensions: historical, contemporary, institutional, global",
        "Cites specific committees, commissions, and their recommendations",
        "Closes with a synthesizing vision tied to constitutional values",
      ],
      constitutional_statutory_references: kw.missing.slice(0, 3),
      data_points_missing: [
        "Latest Census / NFHS data (as applicable)",
        "India ranking in relevant global indices",
        "Specific scheme outlay / outcome metrics",
      ],
    },
    topper_answer: topperAnswer,
    priority_actions: [
      `Build a ${paper}-specific keyword bank: memorize 30–40 power-words with usage examples`,
      "Practice the 5-part structure: Hook → Context → Multi-dimensional Body → Way Forward → Synthesis",
      "Read one topper answer daily from IASbaba / Insights on India to internalize the writing pattern",
    ],
  };
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
          temperature: 0.3,
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

  // ── PROVIDER 4: Groq Cloud ──
  {
    name: "Groq",
    isAvailable: () => !!process.env.GROQ_API_KEY,
    call: async (userPrompt) => {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

      try {
        const response = await groq.chat.completions.create({
          model: "llama-3.3-70b-specdec",
          max_tokens: 3000,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM_INSTRUCTION },
            { role: "user", content: userPrompt },
          ],
        });
        return safeJSONParse(response.choices[0].message.content);
      } catch (err) {
        if (err.status === 400 && err.message.includes("json_validate_failed")) {
          console.log("[AI Client] Groq strict schema rejected, attempting recovery...");
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
];

async function evaluateAnswer(userPrompt) {
  const availableProviders = providers.filter((p) => p.isAvailable());

  // ── Try all live providers first ──────────────────────────────────────────
  if (availableProviders.length > 0) {
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
    console.warn("[AI Client] All providers failed. Falling back to sample evaluation.");
    console.warn("[AI Client] Provider errors:", errors.join(" | "));
  } else {
    console.warn("[AI Client] No API keys configured. Using sample evaluation.");
  }

  // ── Fallback: deterministic sample evaluation ─────────────────────────────
  // This ensures the UI always works even when all external APIs are down.
  const sampleResult = generateSampleEvaluation(userPrompt);
  return { result: sampleResult, provider: "Sample (AI providers unavailable)" };
}

module.exports = { evaluateAnswer, SYSTEM_INSTRUCTION };