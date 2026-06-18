// // ai-client.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");
const Anthropic = require("@anthropic-ai/sdk");
const Groq = require("groq-sdk");

const SYSTEM_INSTRUCTION = `You are an elite UPSC Civil Services Mains evaluator combining the perspective of:
1. A UPSC examiner who awards marks.
2. A mentor who improves answers.
3. An AIR 1–50 topper who demonstrates ideal answer-writing.

Your primary task is to evaluate answers the way a UPSC examiner would, NOT merely identify missing keywords.

The student often comes from a technical/engineering background and may demonstrate strong reasoning even when they do not use sophisticated humanities terminology. Reward clarity, relevance, logic, and analysis.

═══════════════════════════════════════
SCORING RUBRIC
═══════════════════════════════════════

0–1 = Completely off-topic or factually incorrect.

2–3 = Very poor answer.

* Barely addresses the question.
* Major conceptual gaps.
* No structure.

4–5 = Basic understanding.

* Addresses the question.
* Some relevant points.
* Limited analysis.
* Generic examples.

6–7 = Good UPSC answer.

* Directly answers the question.
* Covers multiple dimensions.
* Logical structure.
* Relevant examples.
* Reasonable conclusion.

8–9 = Topper-level answer.

* Multi-dimensional analysis.
* Strong conceptual clarity.
* Effective examples/data.
* Balanced argument.
* Strong introduction and conclusion.
* Demonstrates maturity of thought.

10 = Exceptional model answer.

* Near-perfect relevance.
* Rich but concise.
* Excellent analysis.
* Outstanding structure.
* Original insight.
* Could be used as a model answer.

EXAMINER VERDICT RULES

Provide a concise verdict explaining where the answer stands.

Band values:

Poor
Average
Good
Strong
Topper-level
Exceptional

why_not_higher should explain the single biggest factor
preventing the answer from reaching the next score band.

Examples:

Score 5:
"why_not_higher":
"Limited analysis and weak examples."

Score 7:
"why_not_higher":
"Needs deeper analytical linkages and stronger evidence."

Score 8.5:
"why_not_higher":
"Lacks data/report references and slightly deeper insight required for a 9+ answer."

Score 10:
"why_not_higher": ""
═══════════════════════════════════════
SCORING PRINCIPLES
═══════════════════════════════════════

Evaluate in this order of importance:

1. Relevance to the question (highest weight)
2. Conceptual understanding
3. Quality of analysis
4. Multi-dimensional coverage
5. Structure and presentation
6. Examples/data/evidence
7. Language and expression
8. Keywords and terminology (lowest weight)

Analytical Depth Assessment:

Evaluate:
- Cause-effect relationships
- Trade-offs and tensions
- Multiple stakeholder perspectives
- Nuanced judgement
- Interconnections between dimensions

Reward answers that explain WHY and HOW,
not merely WHAT.
Important:

* Do NOT penalize answers merely for missing advanced terminology.
* Do NOT reward keyword stuffing.
* A concise answer with strong reasoning should outscore a verbose answer full of buzzwords.
* Conceptual clarity is more important than jargon.
* Use missing keywords only as improvement suggestions, not as a major scoring factor.
* If the answer correctly explains an idea in simple language, award credit even when technical UPSC terminology is absent.
* Reward originality and analytical thinking.
* Reward balanced arguments where the question demands discussion.
* Penalize factual inaccuracies and misunderstanding of the question heavily.
Keywords are advisory only.
Do not compare the answer against an ideal answer.
Compare it against what a real UPSC candidate would typically write under examination conditions.
Do not mark concepts as "missing" unless they are essential
for answering the question.

A keyword should only appear in the missing section if its
absence significantly weakens the answer.

Do not generate a long list of advanced terminology merely
to improve sophistication.
Score Calibration Examples

10-marker:

Off-topic answer = 0-2

Weak answer with limited relevance = 3-4

Average UPSC answer with basic points = 5-6

Good answer with analysis and examples = 7

Strong answer with balanced arguments,
multiple dimensions and examples = 8

Topper-level answer with excellent analysis,
strong structure and maturity of thought = 9

Exceptional model answer = 10

An answer that directly addresses the question,
covers multiple dimensions, provides examples,
and has a balanced conclusion should generally
fall in the 7.5-8.5 range.

═══════════════════════════════════════
TOPPER COMPARISON RULESz
═══════════════════════════════════════

When comparing with a topper answer:

* Focus on differences in analysis, structure, examples, and depth.
* Do NOT create artificial differences simply because the student used fewer buzzwords.
* Only recommend keywords that genuinely improve the answer.
* Prefer practical improvements over terminology-heavy suggestions.

═══════════════════════════════════════
TOPPER ANSWER RULES
═══════════════════════════════════════

Generate a topper-style rewrite in maximum 250 words.

The rewrite should:

* Be concise.
* Use natural UPSC language.
* Avoid unnecessary jargon.
* Demonstrate better structure and analysis.
* Include only the most relevant examples/data.
* Not look like an AI-generated keyword list.

═══════════════════════════════════════
OUTPUT RULES
═══════════════════════════════════════
IMPORTANT:

You MUST return EXACTLY this JSON schema.

Do not rename fields.
Do not omit fields.
Do not create new fields.

{
  "score": 0,
  "score_rationale": "",
 "keywords": {
  "present": [],
  "essential_missing": [],
  "advanced_enrichment": []
},
  "structure": {
    "intro": {
      "rating": "",
      "comment": ""
    },
    "body": {
      "rating": "",
      "comment": ""
    },
    "way_forward": {
      "rating": "",
      "comment": ""
    },
    "conclusion": {
      "rating": "",
      "comment": ""
    }
  },
 strengths:
[
  {
    "point": "...",
    "quote": ""
  }
]

weaknesses:
[
  {
    "point": "...",
    "fix": "..."
  }
]
  "topper_comparison": {
    "what_topper_does_differently": [],
    "constitutional_statutory_references": [],
    "data_points_missing": []
  },
  "topper_answer": "",
  "priority_actions": [],
  "examiner_verdict": {
  "band": "",
  "why_not_higher": "Lacks data and report references that would elevate it to a 9+ answer."
}
}

advanced_enrichment should contain
at most 3 concepts.

Only include concepts that would
materially deepen analysis of THIS question.

Allowed ratings:

Strong
Adequate
Weak
Missing

Never use any other value.
ALL FIELDS ARE MANDATORY.
USE EMPTY ARRAYS WHEN NECESSARY.

Return ONLY valid JSON matching the required schema.

Never output markdown outside JSON.
Never output explanatory text outside JSON.
Always ensure JSON is complete and parseable.
`;

// ── Separate system instruction for the conversational AI Mentor chat ───────
// IMPORTANT: This is intentionally NOT the evaluator's SYSTEM_INSTRUCTION.
// The evaluator instruction forces strict JSON-only output, which is correct
// for /api/evaluate/answer (consumed by AIEvaluatorPanel.jsx) but breaks the
// free-form chat in /api/evaluate/chat (consumed by AIMentorChat.jsx), which
// just renders the response as plain text. Mixing the two causes the chat to
// dump raw evaluation JSON instead of a normal conversational answer.
const CHAT_SYSTEM_INSTRUCTION = `You are an expert, friendly UPSC Civil Services mentor having a conversational chat with a student preparing for CSE. The student has an engineering/analytical background and is relatively new to humanities-style writing and UPSC conventions.

Answer naturally and conversationally, the way a knowledgeable human mentor would in a chat. Use plain text (you may use short paragraphs, occasional bullet points with "-", or markdown-style emphasis), but NEVER respond with JSON, code blocks containing JSON, or any rigid structured schema — this is a chat, not an answer evaluation.

Keep responses focused, specific, and practical (mention concrete frameworks, examples, articles, schemes, or committee names where relevant), but keep the tone warm and like a real conversation rather than a report.`;

// ── System instruction for background memory extraction ─────────────────────
// Runs separately from the chat reply itself (see extractMemory below). Takes
// the existing durable-memory list + the latest turn, and returns a fresh,
// merged, deduplicated list — so the mentor accumulates a standing profile of
// the student that survives even after old raw messages get trimmed away.
const MEMORY_EXTRACTION_SYSTEM_INSTRUCTION = `You maintain a short, durable memory profile for a UPSC aspirant, built from their conversations with an AI mentor. You will be given the CURRENT memory list and the LATEST conversation turn.

Return an UPDATED, complete memory list: merge in any new durable facts from the latest turn, remove anything now outdated or contradicted, and drop low-value or redundant entries. Keep only things worth remembering in future conversations — stable preferences (e.g. preferred answer style, study habits), recurring strengths or weaknesses, goals, and specific feedback patterns the mentor has already given. Do NOT include one-off details, pleasantries, or anything that's just restating syllabus/score data the app already tracks separately.

Rules:
- Each fact is a single short sentence, under 20 words.
- Maximum 40 facts total — if there would be more, drop the least useful ones.
- If nothing new or durable came up in this turn, return the list unchanged.
- Respond ONLY with this exact JSON shape and nothing else: {"memory": ["fact one", "fact two"]}`;

// ── System instruction for MCQ Test Series result analysis ──────────────────
// Consumed by the testController's /api/tests/:id/analyze flow. Produces a
// full performance report: strengths, weak topics (with priority for the
// revision queue), and a short actionable study plan — NOT a conversational
// reply, and NOT the Mains-essay SYSTEM_INSTRUCTION above.
const TEST_ANALYSIS_SYSTEM_INSTRUCTION = `You are an elite UPSC Civil Services exam strategist who specializes in diagnostic analysis of Prelims-style MCQ test performance. You are given a student's test result — overall score, accuracy, and a topic-wise breakdown (correct/wrong/skipped per topic) — and you must produce a sharp, actionable diagnostic report.

You MUST respond in this EXACT JSON structure. No markdown outside the JSON. No preamble. Just the JSON.

{
  "summary": "2-3 sentence honest, specific summary of how the student performed and why (e.g. low attempt rate vs low accuracy vs both)",
  "performance_band": "Needs Work",
  "key_insight": "The single most important diagnostic insight (e.g. 'Your accuracy on attempted questions is fine, but you attempted only 24% of the paper — speed/confidence is the real bottleneck, not knowledge.')",
  "strong_topics": [
    { "topic": "Topic name", "accuracy": 80, "note": "Why this is a strength, one sentence" }
  ],
  "weak_topics": [
    { "topic": "Topic name", "accuracy": 20, "note": "Specific diagnosis of the gap, one sentence", "priority": "high" }
  ],
  "study_plan": [
    { "day": "Day 1-2", "focus": "Topic or skill to target", "tasks": ["Specific task 1", "Specific task 2"] },
    { "day": "Day 3-4", "focus": "Topic or skill to target", "tasks": ["Specific task 1", "Specific task 2"] },
    { "day": "Day 5-7", "focus": "Topic or skill to target", "tasks": ["Specific task 1", "Specific task 2"] }
  ],
  "priority_actions": ["Action 1", "Action 2", "Action 3"],
  "revision_recommendations": [
    { "topic": "Topic name", "difficulty": "hard", "reason": "One sentence reason this should enter spaced repetition" }
  ]
}

Rules:
- "performance_band" must be exactly one of: "Needs Work", "Average", "Good", "Excellent" — match it to the provided percentage (the caller will tell you the band; just echo it back consistently with your narrative).
- weak_topics: include topics with low accuracy (<50%) OR very low attempt rate even if no wrong answers (skipping a topic entirely is itself a weakness — flag it). Order by priority, worst first. priority must be "high", "medium", or "low".
- strong_topics: only include topics with accuracy >= 70% AND at least 2 attempts. If none qualify, return an empty array — do not invent strengths.
- revision_recommendations: should be a subset of weak_topics (the ones most worth spaced-repetition review), each with difficulty "hard" (for accuracy <30%), "medium" (30-50%), mapped consistently.
- Be specific and honest, never generic filler like "practice more." Reference the actual numbers given.
- The JSON must be valid and complete always.`;

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
// Generates a realistic, structured UPSC evaluation based on the answer text.
function generateSampleEvaluation(userPrompt) {
  // Extract question, answer, paper from the prompt text
  const paperMatch = userPrompt.match(/Paper:\s*(.+)/);
  const wcMatch = userPrompt.match(/Word Count:\s*(\d+)/);
  const paper = paperMatch ? paperMatch[1].trim() : "General Studies";
  const wordCount = wcMatch ? parseInt(wcMatch[1]) : 100;

  // Score heuristic: rough scoring based on answer length
  const rawScore =
    wordCount < 80
      ? 3
      : wordCount < 150
        ? 4
        : wordCount < 250
          ? 5
          : wordCount < 350
            ? 6
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
      missing: [
        "Preamble values",
        "constitutional morality",
        "syncretic traditions",
        "demographic dividend",
        "geo-strategic significance",
      ],
      bonus: ["civilizational continuity", "epistemic framework"],
    },
    GS2: {
      present: ["governance", "constitutional provisions"],
      missing: [
        "Article 356",
        "cooperative federalism",
        "separation of powers",
        "judicial review",
        "directive principles",
      ],
      bonus: [
        "Sarkaria Commission",
        "Punchhi Commission",
        "NCRWC recommendations",
      ],
    },
    GS3: {
      present: ["economic growth", "policy framework"],
      missing: [
        "fiscal consolidation",
        "monetary policy transmission",
        "MSME ecosystem",
        "PLI scheme",
        "green hydrogen mission",
      ],
      bonus: ["Economic Survey 2024", "India@2047 vision", "Viksit Bharat"],
    },
    GS4: {
      present: ["ethical considerations", "public duty"],
      missing: [
        "probity in governance",
        "emotional intelligence",
        "conflict of interest",
        "Nolan principles",
        "Gandhi's talisman",
      ],
      bonus: ["2nd ARC recommendations", "Santhanam Committee"],
    },
    Essay: {
      present: ["introduction", "body paragraphs"],
      missing: [
        "philosophical underpinning",
        "multidimensional analysis",
        "global context",
        "historical perspective",
        "way forward",
      ],
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
      bonus: kw.bonus,
    },
    structure: {
      intro: {
        rating: wordCount > 100 ? "Adequate" : "Weak",
        comment:
          wordCount > 100
            ? "Your introduction sets the context but lacks a crisp definitional hook that UPSC examiners reward. Consider opening with a constitutional provision, a report quote, or a striking statistic."
            : "Introduction is too brief. Frame the issue with historical/constitutional context in 3–4 sentences.",
      },
      body: {
        rating: wordCount > 200 ? "Adequate" : "Weak",
        comment:
          wordCount > 200
            ? "Body paragraphs cover the topic but need sharper thematic segmentation — each paragraph should open with a clear topic sentence and close with a mini-inference."
            : "Body lacks multidimensional analysis. Expand with political, economic, social, and technological dimensions as applicable.",
      },
      way_forward: {
        rating: wordCount > 250 ? "Adequate" : "Missing",
        comment:
          "Way forward should be specific and actionable — cite specific schemes (PM Gati Shakti, SAMADHAN), committees (Sarkaria, Punchhi), or legislative frameworks. Avoid generic recommendations.",
      },
      conclusion: {
        rating: wordCount > 200 ? "Adequate" : "Weak",
        comment:
          "Conclusion should synthesize rather than summarize. End with a forward-looking statement that ties the answer's core argument to India's constitutional vision or development goals.",
      },
    },
    strengths: [
      {
        point:
          "Demonstrates awareness of the core issue and attempts a structured response.",
        quote: "",
      },
      {
        point:
          "Answer shows analytical thinking — a strength to build upon with UPSC-specific vocabulary.",
        quote: "",
      },
    ],
    weaknesses: [
      {
        point:
          "Missing specific constitutional articles, committee names, and government schemes that examiners look for.",
        fix: `For ${paper}, always include at least 2–3 specific references: articles, landmark judgments, or data from Economic Survey / India Year Book.`,
      },
      {
        point:
          "Answer lacks the 'Way Forward' dimension which carries significant examiner weight.",
        fix: "Dedicate the final 60–80 words to concrete, policy-linked recommendations.",
      },
      {
        point:
          "Vocabulary is general rather than domain-specific. UPSC power-words are missing.",
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

// ── SAMPLE TEST ANALYSIS GENERATOR (offline fallback) ───────────────────────
// Called when all API providers are unavailable/failing for test analysis.
// Builds a deterministic, still-genuinely-useful diagnostic report purely
// from the topic_breakdown numbers — no AI required. Mirrors the spirit of
// generateSampleEvaluation above, but for MCQ Test Series results.
function generateSampleTestAnalysis(payload) {
  const { percentage, performance_band, attempted_count, total_questions, topic_breakdown } = payload;

  const attemptRate = total_questions > 0 ? (attempted_count / total_questions) * 100 : 0;

  const topicsWithStats = (topic_breakdown || []).map((t) => {
    const attempted = (t.correct || 0) + (t.wrong || 0);
    const accuracy = attempted > 0 ? Math.round((t.correct / attempted) * 100) : 0;
    return { ...t, attempted, accuracy };
  });

  const strong_topics = topicsWithStats
    .filter((t) => t.accuracy >= 70 && t.attempted >= 2)
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 5)
    .map((t) => ({
      topic: t.topic,
      accuracy: t.accuracy,
      note: `Solid grasp — ${t.correct}/${t.attempted} correct on attempted questions.`,
    }));

  const weak_topics = topicsWithStats
    .filter((t) => t.accuracy < 50 || (t.attempted === 0 && (t.skipped || 0) > 0))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 8)
    .map((t) => {
      const priority = t.accuracy < 30 || t.attempted === 0 ? "high" : t.accuracy < 50 ? "medium" : "low";
      const note = t.attempted === 0
        ? `Skipped entirely (${t.skipped || t.total || 0} questions) — likely a knowledge gap, not a speed issue.`
        : `Only ${t.correct}/${t.attempted} correct — needs targeted revision.`;
      return { topic: t.topic, accuracy: t.accuracy, note, priority };
    });

  const key_insight = attemptRate < 40
    ? `You attempted only ${Math.round(attemptRate)}% of the paper — low attempt rate is dragging your score down more than accuracy is. Build speed and exam-taking confidence, not just knowledge.`
    : weak_topics.length > 0
      ? `Your biggest score loss is concentrated in ${weak_topics.slice(0, 2).map(t => t.topic).join(" and ")} — fixing these would meaningfully move your score.`
      : `Performance is fairly even across topics — focus on raising attempt rate and accuracy together.`;

  const summary = `You scored ${payload.score} out of ${payload.max_marks} (${percentage.toFixed(1)}%), attempting ${attempted_count} of ${total_questions} questions with ${payload.accuracy.toFixed(1)}% accuracy on what you attempted. ${attemptRate < 40 ? "Attempt rate is the main constraint right now." : "Accuracy on weak topics is the main constraint right now."}`;

  const studyPlan = [
    {
      day: "Day 1–2",
      focus: weak_topics[0]?.topic || "Foundational revision",
      tasks: [
        `Revise NCERT/standard reference chapters for "${weak_topics[0]?.topic || "weak areas"}"`,
        "Solve 20 previous-year questions on this topic and review every wrong answer",
      ],
    },
    {
      day: "Day 3–4",
      focus: weak_topics[1]?.topic || "Second priority topic",
      tasks: [
        `Make a one-page summary note for "${weak_topics[1]?.topic || "next weak topic"}"`,
        "Take a 25-question topic-wise quiz and target 70%+ accuracy",
      ],
    },
    {
      day: "Day 5–7",
      focus: "Full-length mock + review",
      tasks: [
        "Attempt one full-length mock under timed conditions",
        "Spend equal time reviewing wrong/skipped answers as you did taking the test",
      ],
    },
  ];

  const priority_actions = [
    attemptRate < 50 ? "Increase attempt rate — practice timed sectional tests to build speed" : "Maintain attempt rate while pushing accuracy higher",
    weak_topics[0] ? `Close the gap in ${weak_topics[0].topic} first — it's your lowest-scoring area` : "Consolidate strong topics with periodic revision",
    "Review every wrong/skipped question from this test before the next attempt",
  ];

  const revision_recommendations = weak_topics.slice(0, 6).map((t) => ({
    topic: t.topic,
    difficulty: t.accuracy < 30 ? "hard" : t.accuracy < 50 ? "medium" : "easy",
    reason: t.note,
  }));

  return {
    summary,
    performance_band,
    key_insight,
    strong_topics,
    weak_topics,
    study_plan: studyPlan,
    priority_actions,
    revision_recommendations,
  };
}

const providers = [
  // ── PROVIDER 1: Gemini ──────────────
  {
    name: "Gemini",
    isAvailable: () => !!process.env.GEMINI_API_KEY,
    call: async (userPrompt, systemInstruction = SYSTEM_INSTRUCTION) => {
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
    call: async (userPrompt, systemInstruction = SYSTEM_INSTRUCTION) => {
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
    call: async (userPrompt, systemInstruction = SYSTEM_INSTRUCTION) => {
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
    call: async (userPrompt, systemInstruction = SYSTEM_INSTRUCTION) => {
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

async function evaluateAnswer(userPrompt) {
  const availableProviders = providers.filter((p) => p.isAvailable());

  // ── Try all live providers first ──────────────────────────────────────────
  if (availableProviders.length > 0) {
    const errors = [];
    for (const provider of availableProviders) {
      try {
        console.log(`[AI Client] Trying provider: ${provider.name}...`);
        const result = await provider.call(userPrompt);
        console.log("[AI RAW RESULT]", JSON.stringify(result, null, 2));
       function normalizeResult(result) {
  return {
    score: result.score ?? 0,

    score_rationale:
      result.score_rationale ||
      result.feedback ||
      "",

    strengths:
      result.strengths ||
      [],

    weaknesses:
      result.weaknesses ||
      [],

    topper_answer:
      result.topper_answer ||
      result.topper_answer_rewrite ||
      "",

    keywords:
      result.keywords || {
        present: [],
        missing: [],
        bonus: []
      },

    structure:
      result.structure || {},

    topper_comparison:
      result.topper_comparison || {},

    priority_actions:
      result.priority_actions || []
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
    console.warn(
      "[AI Client] All providers failed. Falling back to sample evaluation.",
    );
    console.warn("[AI Client] Provider errors:", errors.join(" | "));
  } else {
    console.warn(
      "[AI Client] No API keys configured. Using sample evaluation.",
    );
  }

  // ── Fallback: deterministic sample evaluation ─────────────────────────────
  // This ensures the UI always works even when all external APIs are down.
  const sampleResult = generateSampleEvaluation(userPrompt);
  return {
    result: sampleResult,
    provider: "Sample (AI providers unavailable)",
  };
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

  if (availableProviders.length > 0) {
    const errors = [];
    for (const provider of availableProviders) {
      try {
        console.log(`[Test Analysis] Trying provider: ${provider.name}...`);
        const result = await provider.call(userPrompt, TEST_ANALYSIS_SYSTEM_INSTRUCTION);
        console.log(`[Test Analysis] Success with: ${provider.name}`);
        return { result, provider: provider.name };
      } catch (err) {
        const message = `${provider.name} failed: ${err.message}`;
        console.warn(`[Test Analysis] ${message}`);
        errors.push(message);
      }
    }
    console.warn("[Test Analysis] All providers failed. Falling back to offline analysis.");
    console.warn("[Test Analysis] Provider errors:", errors.join(" | "));
  } else {
    console.warn("[Test Analysis] No API keys configured. Using offline analysis.");
  }

  // ── Fallback: deterministic offline test analysis ─────────────────────────
  const sampleResult = generateSampleTestAnalysis(payload);
  return { result: sampleResult, provider: "Sample (AI providers unavailable)" };
}

// Builds the user-facing prompt sent to the AI for test analysis, from the
// structured payload assembled by testController.js.
function buildTestAnalysisPrompt(payload) {
  const {
    test_series, test_title, subject, total_questions, duration_minutes,
    correct_count, wrong_count, skipped_count, attempted_count,
    score, max_marks, accuracy, percentage, performance_band, topic_breakdown,
  } = payload;

  const topicLines = (topic_breakdown || []).map((t) => {
    const attempted = (t.correct || 0) + (t.wrong || 0);
    const acc = attempted > 0 ? Math.round((t.correct / attempted) * 100) : 0;
    return `- ${t.topic}: ${t.correct || 0} correct, ${t.wrong || 0} wrong, ${t.skipped || 0} skipped (accuracy on attempted: ${acc}%)`;
  }).join("\n");

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
  SYSTEM_INSTRUCTION,
  CHAT_SYSTEM_INSTRUCTION,
  TEST_ANALYSIS_SYSTEM_INSTRUCTION,
  extractMemory,
};