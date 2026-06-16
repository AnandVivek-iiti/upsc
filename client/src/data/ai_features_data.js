/**
 * ai_features_data.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Static data used by all AI features as fallback when the AI API is
 * unavailable, and as seed data for features that don't require dynamic AI.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Past Trends: Topic frequency across UPSC Prelims & Mains (2018-2024) ────
export const PAST_TRENDS = {
  prelims: [
    { topic: "Polity & Governance",        questions: 22, trend: "up",   highlight: "Consistent — always 18-25 Qs" },
    { topic: "Economy",                    questions: 18, trend: "up",   highlight: "Rising — Budget, RBI policies dominate" },
    { topic: "Environment & Ecology",      questions: 17, trend: "up",   highlight: "Rising — Climate, Biodiversity high" },
    { topic: "History (Ancient/Medieval)", questions: 14, trend: "flat", highlight: "Stable — Art & Architecture spiking" },
    { topic: "Science & Technology",       questions: 13, trend: "up",   highlight: "Rising — AI, Space, Biotech new entrants" },
    { topic: "Modern History",             questions: 11, trend: "down", highlight: "Declining — fewer direct Qs, more applied" },
    { topic: "Geography",                  questions: 10, trend: "flat", highlight: "Stable — Physical + Indian focus" },
    { topic: "Current Affairs (IR)",       questions: 9,  trend: "up",   highlight: "Rising — India's foreign policy centrality" },
    { topic: "Art & Culture",              questions: 8,  trend: "up",   highlight: "Rising — UNESCO, GI Tags, Festivals" },
    { topic: "Social Issues",              questions: 5,  trend: "flat", highlight: "Stable — Schemes, Welfare programs" },
  ],
  mains: {
    GS1: [
      { topic: "Indian Society & Culture",      freq: "High",   years: "2018-2024", notes: "2-3 Qs every year" },
      { topic: "Post-Independence Consolidation",freq: "High",  years: "2019-2024", notes: "Integration of states, Emergency" },
      { topic: "World Geography — Natural Hazards",freq: "Medium",years: "2018-2024",notes: "Cyclones, El Nino, glaciers" },
      { topic: "Women Empowerment",             freq: "High",   years: "2018-2024", notes: "Multiple angles — economic, social" },
      { topic: "Urbanization",                  freq: "Medium", years: "2020-2024", notes: "Smart cities, slum, infrastructure" },
    ],
    GS2: [
      { topic: "Federalism & Centre-State",     freq: "High",   years: "2018-2024", notes: "Governor's role, Art 356" },
      { topic: "Judicial Reforms",              freq: "High",   years: "2019-2024", notes: "PIL, Tribunals, Pendency" },
      { topic: "India's Foreign Policy",        freq: "High",   years: "2018-2024", notes: "Neighborhood First, Indo-Pacific" },
      { topic: "Social Justice Schemes",        freq: "High",   years: "2018-2024", notes: "Health, Education, Welfare" },
      { topic: "Parliament & Legislature",      freq: "Medium", years: "2018-2024", notes: "Speaker, Bills, Anti-defection" },
    ],
    GS3: [
      { topic: "Agriculture & Food Security",   freq: "High",   years: "2018-2024", notes: "MSP, PM-KISAN, Natural Farming" },
      { topic: "Infrastructure & Investment",   freq: "High",   years: "2019-2024", notes: "NIP, Gati Shakti, PPP" },
      { topic: "Internal Security & LWE",       freq: "High",   years: "2018-2024", notes: "Naxalism, cybersecurity, border" },
      { topic: "Energy & Environment",          freq: "High",   years: "2020-2024", notes: "Net Zero, Renewables, EV policy" },
      { topic: "Science & Tech in Governance",  freq: "Medium", years: "2021-2024", notes: "AI, DPI, Blockchain, Space" },
    ],
    GS4: [
      { topic: "Case Studies — Civil Service",  freq: "High",   years: "2018-2024", notes: "Ethics in field situations" },
      { topic: "Emotional Intelligence",        freq: "High",   years: "2019-2024", notes: "EQ in administration" },
      { topic: "Philosophical Ethics",          freq: "Medium", years: "2018-2024", notes: "Kant, Bentham, Gandhi" },
      { topic: "Probity in Public Life",        freq: "High",   years: "2018-2024", notes: "Corruption, whistleblowing" },
      { topic: "Corporate & Media Ethics",      freq: "Medium", years: "2020-2024", notes: "CSR, Fake news, Fourth estate" },
    ],
  },
};

// ─── AI Answers: Curated model answers per topic (static fallback) ────────────
export const STATIC_AI_ANSWERS = {
  polity: {
    q: "Critically examine the role of Governors in India's federal structure.",
    paper: "GS2",
    marks: "15M",
    answer: `The office of the Governor — the constitutional head of every state — has been a perennial flashpoint in India's federal architecture, oscillating between constitutional propriety and political partisanship.

**Constitutional Design**
Articles 153–161 vest in the Governor the executive power of the state. The Governor is appointed by the President (Art. 155) on the advice of the Union Cabinet, creating an inbuilt tension: a constitutional head appointed by and reporting to one party may face elected state governments of a rival political dispensation.

**Points of Controversy**
1. *Discretion in government formation:* In hung assemblies (Goa 2017, Karnataka 2018, Manipur 2017), Governors have been accused of partisan invitation of governments — the Supreme Court in S.R. Bommai v. Union of India (1994) largely curbed floor-testing outside the assembly.
2. *Withholding assent to bills:* Art. 200 allows reservation of bills for the President — Tamil Nadu and Kerala Governors' indefinite sitting on bills led the Supreme Court (2023) to hold that Governors must act "as soon as possible."
3. *Prorogation and dismissal of assemblies:* Critics argue the power has been used to engineer political outcomes.

**Commissions' Recommendations**
The Sarkaria Commission (1988) and Punchhi Commission (2010) both recommended that Governors should be appointed in consultation with the Chief Minister, be non-partisan elder statesmen, and that the power to dismiss state governments be exercised only after a floor test.

**Way Forward**
→ Codify time limits for bill assent (maximum 6 months).
→ Make appointment process transparent with a collegium-type committee.
→ Governor must be a genuine elder statesman, not a retiring political figure.

The Governor is at his constitutional best when he acts as a bridge between the Union and the state, not as a gatekeeper for the party at the Centre.`,
  },
  ethics: {
    q: "What does emotional intelligence mean to an administrator facing severe public agitation?",
    paper: "GS4",
    marks: "15M",
    answer: `Emotional Intelligence (EI), defined by Goleman as the ability to identify, assess, and manage one's own emotions and those of others, is not a soft skill but a core administrative competency — never more evident than during public agitation.

**Four Pillars of EI in Crisis Administration**
1. *Self-awareness:* The administrator must recognise personal stress, biases, or fear — suppressing panic and projecting calm even as the situation escalates.
2. *Self-regulation:* Avoiding reactive decision-making. A tear-gas order in the heat of the moment may inflame rather than suppress agitation.
3. *Empathy:* Understanding the legitimate grievances beneath the agitation — farmers, workers, or communities rarely protest without cause. Active listening and visible concern can de-escalate faster than police action.
4. *Social skills:* Ability to communicate clearly, form coalitions with community leaders, and use intermediaries to create face-saving exit ramps for agitators.

**Practical Application**
→ Immediate: Establish communication — hold a public address, acknowledge the grievance, promise time-bound review.
→ Medium-term: Identify community leaders and create a structured dialogue mechanism.
→ Long-term: Address root cause; install a redressal cell to prevent recurrence.

**Case Illustration**
During the 2017 Mandsaur agitation (farmer suicides + protest), district-level administrators who engaged face-to-face with grieving families de-escalated violence far more effectively than those who relied solely on Section 144 orders.

A civil servant with high EI transforms a confrontation into a conversation — and a protest into a policy feedback mechanism. As Kautilya wrote: "The king's happiness lies in the happiness of his subjects."`,
  },
  economy: {
    q: "Explain the concept of 'Jobless Growth' in India and suggest structural reforms.",
    paper: "GS3",
    marks: "15M",
    answer: `Jobless growth — GDP expansion unaccompanied by commensurate employment generation — has emerged as one of India's most pressing structural paradoxes.

**Evidence of Jobless Growth**
- India's GDP grew at ~7% CAGR (2014-2024), yet CMIE data shows employment stagnation with periodic spikes in unemployment touching 8-9% (2020-2022).
- The manufacturing sector's share of GDP has plateaued at ~15% — far below the 25%+ seen in East Asian tiger economies at comparable development stages.
- PLFS 2023 data reveals that most new "employment" is in informal, low-productivity agriculture (reverse-migration post-COVID).

**Structural Causes**
1. *Capital intensity bias:* PLI schemes incentivise capital-intensive sectors (electronics, pharma) over labour-intensive ones.
2. *Labour law rigidity:* The four Labour Codes, while consolidating 29 laws, are yet to be fully implemented, keeping large firms risk-averse on permanent hiring.
3. *Skill mismatch:* NASSCOM estimates 45% of engineering graduates are unemployable as hired. Skill India has numbers but not quality.
4. *MSMEs under stress:* They employ 110 million but remain credit-starved; credit guarantee schemes under-leveraged.

**Way Forward**
→ Immediate: Scale labour-intensive PLI for textiles, leather, toys — direct 20M job potential.
→ Medium-term: Implement Labour Codes uniformly; introduce fixed-term employment with portability.
→ Long-term: District-level employment observatories; integrate NSDC with employer demand data.

**Conclusion**
India must transform from a consumption-led to an investment + export + manufacturing-led growth model to harness its 68-million-strong young workforce before the demographic window closes in 2045.`,
  },
  gs1_society: {
    q: "Assess the impact of globalization on changing family structures in contemporary Indian society.",
    paper: "GS1",
    marks: "15M",
    answer: `Globalization, through the vectors of economic integration, digital connectivity, and cultural diffusion, has fundamentally reshaped the Indian family — once the bedrock of a joint, patriarchal, agrarian social unit.

**Structural Shifts Observed**
1. *Nuclear family ascendancy:* Census 2011 data shows average household size declining from 5.3 (2001) to 4.8, with urban metros showing 3.2 — mirroring Western nuclear patterns.
2. *Dual-income households:* Female Labour Force Participation, though still at ~25% (ILO 2023), is rising in metros — changing power dynamics and household decision-making.
3. *Delayed marriage and parenthood:* Median age at first marriage has risen to 23 (women) and 27 (men) in urban India, driven by career prioritization.
4. *Elder care crisis:* With nuclear families and outmigration, 73 million elderly Indians (2021) face inadequate care — rise of paid care workers and assisted living.

**Cultural Tensions**
The collision between globalised individual aspirations and traditional family obligations creates:
- Inter-generational conflicts over career choices, marriage partners (cross-caste, inter-faith), and lifestyle.
- Mental health consequences — loneliness among the elderly, anxiety among youth navigating dual worlds.

**State Response**
National Policy on Older Persons (1999), though outdated; SAGE (Seniorcare Ageing Growth Engine) portal (2021) tries to bridge formal care market. However, comprehensive elder care legislation remains absent.

**Way Forward**
Globalization need not mean Westernization. India can chart a middle path — flexible families that retain inter-generational solidarity while adapting to economic realities, supported by robust elder care infrastructure and flexible work policies.`,
  },
};

// ─── Revision Topics (spaced repetition seed data) ────────────────────────────
export const REVISION_TOPICS_SEED = [
  {
    topic: "Polity",
    subtopics: ["Governor's Role", "Parliamentary Procedures", "Constitutional Amendments", "Judicial Review", "Federalism"],
    last_trend: "Very High",
    standard_source: "Laxmikanth — Indian Polity",
    tip: "Always quote Articles. Every answer needs 2-3 Article references minimum.",
  },
  {
    topic: "Economy",
    subtopics: ["Monetary Policy", "Fiscal Federalism", "Agriculture & MSP", "Foreign Trade", "Banking Sector"],
    last_trend: "High",
    standard_source: "Economic Survey + Ramesh Singh",
    tip: "Lead with data — GDP %, RBI rate, budget figures. Numbers = credibility.",
  },
  {
    topic: "Environment",
    subtopics: ["Climate Change Conventions", "Biodiversity Hotspots", "Pollution Control", "Disaster Management", "Green Financing"],
    last_trend: "High",
    standard_source: "Shankar IAS + NCERT Class 11 Bio",
    tip: "Link every answer to a Convention, Act, or International target (Paris, SDG, CBD).",
  },
  {
    topic: "History",
    subtopics: ["Bhakti & Sufi Movements", "Mughal Period", "Revolt of 1857", "Gandhi & Congress", "Post-Independence"],
    last_trend: "Medium",
    standard_source: "Old NCERT (Satish Chandra) + Bipin Chandra",
    tip: "Ancient/Medieval: focus on architecture, trade, social reform. Modern: focus on movements and personalities.",
  },
  {
    topic: "International Relations",
    subtopics: ["India's Neighborhood Policy", "Indo-Pacific Strategy", "India-China Relations", "Multilateral Bodies", "Diaspora Policy"],
    last_trend: "High",
    standard_source: "Subrahmanyam Jaishankar — 'The India Way'",
    tip: "Current affairs integration is mandatory. No IR answer without a recent event.",
  },
  {
    topic: "Ethics (GS4)",
    subtopics: ["Philosophical Frameworks", "Emotional Intelligence", "Case Studies", "Civil Service Values", "Whistleblowing"],
    last_trend: "Very High",
    standard_source: "Lexicon by Chronicle IAS + 2nd ARC Report",
    tip: "Always name the ethical theory, name the stakeholders, and propose a clear course of action.",
  },
  {
    topic: "Science & Technology",
    subtopics: ["AI & Machine Learning", "Space Technology (ISRO)", "Biotechnology & GMOs", "Cybersecurity", "Nuclear Energy"],
    last_trend: "Rising",
    standard_source: "The Hindu Science + PIB + SCIENCE REPORTER",
    tip: "Link science to governance — policy frameworks, regulations, and India's position globally.",
  },
  {
    topic: "Agriculture",
    subtopics: ["Irrigation & Water Management", "Organic Farming", "Crop Insurance", "MSP Debate", "Land Reforms"],
    last_trend: "High",
    standard_source: "Economic Survey Agriculture Chapter + NABARD Reports",
    tip: "Always quote a scheme by name with its target/achievement. Data without a scheme name is weak.",
  },
];

// ─── AI Syllabus Tracker: topic to syllabus module mapping ────────────────────
export const TOPIC_TO_MODULE = {
  "History":               { stage: "prelims", paper: "GS1", module: "History of India & Indian National Movement" },
  "Modern History":        { stage: "prelims", paper: "GS1", module: "History of India & Indian National Movement" },
  "Ancient History":       { stage: "prelims", paper: "GS1", module: "History of India & Indian National Movement" },
  "Art & Culture":         { stage: "prelims", paper: "GS1", module: "Current Events" },
  "Geography":             { stage: "prelims", paper: "GS1", module: "Indian & World Geography" },
  "Polity":                { stage: "prelims", paper: "GS1", module: "Indian Polity & Governance" },
  "Economy":               { stage: "prelims", paper: "GS1", module: "Economic & Social Development" },
  "Environment":           { stage: "prelims", paper: "GS1", module: "Environment, Ecology & Climate Change" },
  "Science & Technology":  { stage: "prelims", paper: "GS1", module: "General Science" },
  "Social Issues":         { stage: "prelims", paper: "GS1", module: "Economic & Social Development" },
  "IR":                    { stage: "prelims", paper: "GS1", module: "Current Events" },
  "Comprehension":         { stage: "prelims", paper: "CSAT", module: "Comprehension" },
  "Reasoning":             { stage: "prelims", paper: "CSAT", module: "General Mental Ability" },
  "Maths":                 { stage: "prelims", paper: "CSAT", module: "Basic Numeracy" },
  "Indian Society":        { stage: "mains",   paper: "GS1", module: "Indian Society" },
  "Culture":               { stage: "mains",   paper: "GS1", module: "Art and Culture" },
  "Indian Polity":         { stage: "mains",   paper: "GS2", module: "Indian Constitution and Polity" },
  "Governance":            { stage: "mains",   paper: "GS2", module: "Government Policies and Interventions" },
  "Social Justice":        { stage: "mains",   paper: "GS2", module: "Social Justice" },
  "International Relations":{ stage: "mains",  paper: "GS2", module: "International Relations" },
  "Agriculture":           { stage: "mains",   paper: "GS3", module: "Agriculture" },
  "Internal Security":     { stage: "mains",   paper: "GS3", module: "Internal Security" },
  "Disaster Management":   { stage: "mains",   paper: "GS3", module: "Disaster Management" },
  "Ethics":                { stage: "mains",   paper: "GS4", module: "Ethics and Human Interface" },
};

// ─── Static evaluations per paper (used when AI API fails) ────────────────────
export const STATIC_EVALS = {
  GS1: {
    score: 6,
    score_rationale: "Your answer demonstrates basic understanding but lacks historical depth, specific examples, and multi-dimensional analysis expected at UPSC Mains level.",
    keywords: {
      present: ["historical", "society", "cultural"],
      missing: ["primary sources", "colonial impact", "socio-economic", "comparative analysis", "periodization"],
      bonus: [],
    },
    structure: {
      intro: { rating: "Adequate", comment: "Context established but lacks a compelling hook or clear thesis." },
      body: { rating: "Weak", comment: "Arguments are linear. Use a thematic framework — political, economic, social, cultural dimensions." },
      way_forward: { rating: "Missing", comment: "No recommendations or forward-looking statements included." },
      conclusion: { rating: "Adequate", comment: "Conclusion present but generic. Tie it back to contemporary relevance." },
    },
    strengths: [{ point: "Basic factual accuracy maintained throughout the answer." }],
    weaknesses: [
      { point: "Lacks specific dates, data points, or committee names.", fix: "Add at least 2–3 specific references (e.g., Acts, Reports, Articles)." },
      { point: "No maps, diagrams, or flowcharts suggested.", fix: "Mention 'as shown in the diagram' and sketch a rough diagram." },
    ],
    topper_comparison: {
      what_topper_does_differently: [
        "Opens with a quote or a striking statistic to set the tone",
        "Uses sub-headings to create a clear visual structure",
        "Provides at least one contemporary parallel or recent event link",
      ],
      constitutional_statutory_references: ["Art. 51A (Fundamental Duties)", "UNESCO Heritage"],
      data_points_missing: ["NITI Aayog report", "Census 2011 data"],
    },
    topper_answer: `Introduction: [Set context with a historical hook or quote]\n\nHistorical Background: The phenomenon dates to [specific period], shaped by [key forces — political, economic, colonial].\n\nMulti-dimensional Analysis:\n• Political dimension: [Argument with evidence]\n• Economic dimension: [Argument with data]\n• Social-cultural dimension: [Argument with example]\n\nCritical Evaluation: While [strength of the topic], it also [limitation/challenge].\n\nContemporary Relevance: In today's context, [link to current policy/event].\n\nWay Forward: [3 actionable recommendations]\n\nConclusion: [Forward-looking statement connecting past to present]`,
    priority_actions: [
      "Practice UPSC 2024 GS1 paper answers with 150-word limit",
      "Build a fact-sheet of key Acts, Articles, and data for this topic",
      "Read EPW articles for contemporary analysis perspective",
    ],
  },
  GS2: {
    score: 6,
    score_rationale: "Answer covers basics but misses constitutional provisions, landmark judgments, and governance data expected in UPSC GS2.",
    keywords: {
      present: ["governance", "policy", "constitutional"],
      missing: ["Articles", "landmark judgments", "committee recommendations", "international comparison", "federalism"],
      bonus: [],
    },
    structure: {
      intro: { rating: "Adequate", comment: "Decent opening, but should directly define the constitutional/governance dimension." },
      body: { rating: "Adequate", comment: "Covers the issue but lacks the depth of constitutional provisions and case laws." },
      way_forward: { rating: "Weak", comment: "Way forward is vague. Use the format: immediate, medium-term, long-term reforms." },
      conclusion: { rating: "Adequate", comment: "Ties up but doesn't propose systemic change." },
    },
    strengths: [{ point: "Identifies core governance issue correctly." }],
    weaknesses: [
      { point: "No Articles or constitutional provisions cited.", fix: "Every GS2 answer needs at least 2-3 Article references." },
      { point: "No landmark SC/HC judgments referenced.", fix: "Add relevant case: Kesavananda Bharati, Vishaka, Maneka Gandhi, etc." },
    ],
    topper_comparison: {
      what_topper_does_differently: [
        "Uses a 3-tier structure: Constitutional → Statutory → Institutional analysis",
        "Quotes specific committee reports (ARC, Punchhi, Sarkaria)",
        "Provides international best practice comparison (UK, USA, Germany)",
      ],
      constitutional_statutory_references: ["Art. 356", "Art. 21", "Art. 32", "RTI Act 2005"],
      data_points_missing: ["DARPG report", "Transparency International ranking", "PRS Legislative data"],
    },
    topper_answer: `Introduction: [Constitutional/statutory framing — cite relevant Article]\n\nConstitutional Framework: [Article X states... / As per the constitutional design...]\n\nCurrent Challenges:\n• [Challenge 1 with data/example]\n• [Challenge 2 with case reference]\n\nCommittee Recommendations: [ARC / Punchhi / relevant committee]\n\nJudicial Pronouncements: [Key SC judgment and its holding]\n\nWay Forward:\n→ Immediate: [Reform 1]\n→ Medium-term: [Reform 2]\n→ Long-term: [Reform 3]\n\nConclusion: [Systemic reform vision]`,
    priority_actions: [
      "Make a one-page cheat sheet of Articles 1-395 for quick reference",
      "Solve 5 UPSC GS2 previous year questions per week with timer",
      "Read Laxmikanth for polity and India's Foreign Policy by JN Dixit for IR",
    ],
  },
  GS3: {
    score: 6,
    score_rationale: "Answer addresses the topic but lacks data-backed analysis, policy frameworks, and current affairs integration expected in GS3.",
    keywords: {
      present: ["economy", "development", "policy"],
      missing: ["GDP data", "scheme names", "budget allocation", "committee report", "technology framework"],
      bonus: [],
    },
    structure: {
      intro: { rating: "Adequate", comment: "Opens with the issue but doesn't quantify the problem's scale." },
      body: { rating: "Adequate", comment: "Arguments present but thin on data. GS3 demands numbers, reports, schemes." },
      way_forward: { rating: "Weak", comment: "Generic recommendations. Need specific policy measures with timelines." },
      conclusion: { rating: "Adequate", comment: "Decent close but should reference national targets (Viksit Bharat 2047, etc.)." },
    },
    strengths: [{ point: "Conceptual understanding of the economic/scientific issue is sound." }],
    weaknesses: [
      { point: "No specific government schemes or budget figures cited.", fix: "Add 2-3 scheme names with their targets (PM-KUSUM, PLI scheme, etc.)." },
      { point: "No data from Economic Survey or RBI.", fix: "Structure answer as: current status → gap → solution → governance framework." },
    ],
    topper_comparison: {
      what_topper_does_differently: [
        "Uses a cause-effect-solution framework backed by data",
        "References Economic Survey, RBI Reports, CAG findings",
        "Incorporates recent Budget/policy announcements",
      ],
      constitutional_statutory_references: ["FRBM Act", "Competition Act", "IT Act 2000"],
      data_points_missing: ["Economic Survey 2024-25", "World Bank data", "NITI Aayog Strategy document"],
    },
    topper_answer: `Introduction: [Data-led opening — quote GDP figure, growth rate, or policy target]\n\nCurrent Status: As per [Economic Survey/RBI Report], India's [metric] stands at [X].\n\nKey Challenges:\n1. [Structural challenge + data]\n2. [Policy gap + example]\n\nGovernment Initiatives:\n• [Scheme 1 + budget outlay]\n• [Scheme 2 + impact data]\n\nWay Forward:\n→ Short-term: [Specific reform]\n→ Medium-term: [Systemic change]\n→ Long-term: [Structural shift]\n\nConclusion: Aligned with Viksit Bharat 2047 / SDG Goal X, India must...`,
    priority_actions: [
      "Read Economic Survey Summary and key highlights chapter",
      "Maintain a scheme-tracker with objectives, targets, and current status",
      "Practice answer-writing with 200-word limit and include at least 2 data points",
    ],
  },
  GS4: {
    score: 6,
    score_rationale: "Identifies the ethical dilemma but lacks structured philosophical grounding and doesn't fully explore all stakeholder perspectives.",
    keywords: {
      present: ["ethics", "integrity", "values"],
      missing: ["consequentialism", "deontology", "virtue ethics", "emotional intelligence", "stakeholder analysis"],
      bonus: [],
    },
    structure: {
      intro: { rating: "Adequate", comment: "Identifies the dilemma but should frame it using ethical theory." },
      body: { rating: "Weak", comment: "Arguments lack philosophical depth. Use Kant, Rawls, or Indian value systems." },
      way_forward: { rating: "Missing", comment: "No concrete course of action proposed. GS4 demands a clear decision with justification." },
      conclusion: { rating: "Adequate", comment: "Moral stance visible but not philosophically grounded." },
    },
    strengths: [{ point: "Correctly identifies the conflict between official duty and moral responsibility." }],
    weaknesses: [
      { point: "Doesn't apply ethical frameworks (deontology vs consequentialism).", fix: "State: 'From a deontological perspective... however, a consequentialist approach...' then choose." },
      { point: "No reference to civil service values or Nolan Committee principles.", fix: "Reference: Selflessness, Integrity, Objectivity, Accountability, Openness, Honesty, Leadership." },
    ],
    topper_comparison: {
      what_topper_does_differently: [
        "Uses ethical frameworks (Kant, Bentham, Gandhi) explicitly",
        "Lists all stakeholders and analyses their interests",
        "Proposes a clear, actionable course of action with rationale",
      ],
      constitutional_statutory_references: ["Art. 311 (civil service protections)", "Whistle Blowers Act", "AIS Rules"],
      data_points_missing: ["Nolan Committee 7 principles", "2nd ARC report on Ethics in Governance"],
    },
    topper_answer: `Introduction: This situation presents a conflict between [Value A] and [Value B].\n\nEthical Dimensions:\n• Deontological: Duty demands [X]; however, moral law (Kant's categorical imperative) suggests [Y]\n• Consequentialist: Weighing outcomes — [Stakeholder A] benefits from [Action X]\n• Virtue Ethics: A person of integrity would [action]\n\nStakeholder Analysis:\n1. [Primary stakeholder — interest — impact]\n2. [Secondary stakeholder — interest — impact]\n\nCourse of Action:\n→ Immediate: [Specific action with rationale]\n→ Procedural: [Escalation path]\n→ Systemic: [Institutional reform]\n\nConclusion: Guided by the Nolan principles of [X] and [Y], the ethical choice is [decision].`,
    priority_actions: [
      "Master the 7 Nolan Principles and 6 ARC pillars of ethics in governance",
      "Practice 3 case studies per week using the stakeholder-analysis framework",
      "Read 'Ethics in Governance' (2nd ARC) — Chapter 4 on public service values",
    ],
  },
  Essay: {
    score: 6,
    score_rationale: "Essay shows coherent thinking but lacks philosophical depth, literary references, and the multi-dimensional analysis UPSC expects.",
    keywords: {
      present: ["society", "development", "challenges"],
      missing: ["philosophical framework", "historical parallels", "contemporary data", "literary quote", "global perspective"],
      bonus: [],
    },
    structure: {
      intro: { rating: "Adequate", comment: "Introduction is functional but not captivating. Essays need a literary or philosophical hook." },
      body: { rating: "Adequate", comment: "Content present but organised linearly. Use multi-dimensional approach: historical → contemporary → philosophical → futuristic." },
      way_forward: { rating: "Adequate", comment: "Present but needs more specific action points." },
      conclusion: { rating: "Weak", comment: "Conclusion is abrupt. Essays must end with a memorable, inspiring thought." },
    },
    strengths: [{ point: "Clear central argument maintained throughout." }],
    weaknesses: [
      { point: "No literary or philosophical quotes to anchor the essay.", fix: "Open and close with a quote from Tagore, Gandhi, Nehru, or relevant thinkers." },
      { point: "Lacks data and contemporary examples.", fix: "Add at least 2 data points and 2 recent events." },
    ],
    topper_comparison: {
      what_topper_does_differently: [
        "Uses a metaphorical opening that ties the title to a broader human truth",
        "Weaves 3-4 disciplines (philosophy, science, sociology, economics) into the narrative",
        "Ends with a vision statement for India or humanity",
      ],
      constitutional_statutory_references: [],
      data_points_missing: ["UN SDG data", "World Happiness Report", "India Human Development Report"],
    },
    topper_answer: `Opening Quote/Metaphor: "[Relevant quote from thinker/poet]"\n\nPhilosophical Grounding: At its core, this question asks us to examine [fundamental human value/tension].\n\nHistorical Dimension: Through history, [phenomenon] has manifested as [example 1], [example 2].\n\nContemporary Reality: Today, [data point] reveals [current state].\n\nGlobal vs. Indian Perspective: While the West approaches [topic] through [framework], India's tradition offers [alternative].\n\nCritical Analysis: Yet we must not romanticize. [Limitation or dark side of the topic].\n\nWay Forward: The path forward requires [Action 1], [Action 2], and above all, [Core value].\n\nConclusion: [Memorable ending — full circle to opening quote, or a vision statement]`,
    priority_actions: [
      "Build a quote-bank of 50 quotes across themes: democracy, justice, technology, society",
      "Practice writing essay outlines (not full essays) for 10 different topics",
      "Read 'Essay Writing for UPSC' by Arjun Singh — focus on structure and transitions",
    ],
  },
};