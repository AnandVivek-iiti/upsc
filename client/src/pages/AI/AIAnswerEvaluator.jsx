/**
 * AIAnswerEvaluator.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Embeddable AI answer evaluator. Used inside the AI Features hub (and can be
 * reused from MainsGrind / Topicwise via the initialQuestion prop).
 * Falls back to a static, structured sample evaluation if the AI API is
 * unavailable so the feature never shows a dead end.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState, useCallback } from "react";
import {
  Send, Cpu, FileText, Copy, CheckCheck, AlertTriangle,
  BookOpen, Zap, TrendingUp, TrendingDown, Award, Target,
  Key, User, Star, ArrowRight, CheckCircle2, XCircle,
  Minus, ChevronRight, Sparkles, PenLine, ChevronDown, RefreshCw,
} from "lucide-react";

// ─── Static fallback evaluations per paper (used when AI API fails) ─────────
const STATIC_EVALS = {
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
      { point: "No maps, diagrams, or flowcharts suggested for GS1 geography/history questions.", fix: "Mention 'as shown in the diagram' and sketch a rough diagram in the margin." },
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
    topper_answer: `Introduction: [Set context with a historical hook or quote]\n\nHistorical Background: The phenomenon dates to [specific period], shaped by [key forces — political, economic, colonial].\n\nMulti-dimensional Analysis:\n• Political dimension: [Argument with evidence]\n• Economic dimension: [Argument with data]\n• Social-cultural dimension: [Argument with example]\n\nCritical Evaluation: While [strength of the topic], it also [limitation/challenge], as evidenced by [case study].\n\nContemporary Relevance: In today's context, [link to current policy/event].\n\nWay Forward: [3 actionable recommendations]\n\nConclusion: [Forward-looking statement connecting past to present]`,
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
    topper_answer: `Introduction: [Constitutional/statutory framing — cite relevant Article]\n\nConstitutional Framework: [Article X states... / As per the constitutional design...]\n\nCurrent Challenges:\n• [Challenge 1 with data/example]\n• [Challenge 2 with case reference]\n• [Challenge 3 with comparative context]\n\nCommittee Recommendations: [ARC / Punchhi / relevant committee]\n\nJudicial Pronouncements: [Key SC judgment and its holding]\n\nInternational Comparison: [Country model and lesson]\n\nWay Forward:\n→ Immediate: [Reform 1]\n→ Medium-term: [Reform 2]\n→ Long-term: [Reform 3]\n\nConclusion: [Systemic reform vision]`,
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
      { point: "Science/tech questions need the innovation → deployment → governance pipeline.", fix: "Structure answer as: current status → gap → solution → governance framework." },
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
    topper_answer: `Introduction: [Data-led opening — quote GDP figure, growth rate, or policy target]\n\nCurrent Status: As per [Economic Survey/RBI Report], India's [metric] stands at [X], reflecting [challenge/opportunity].\n\nKey Challenges:\n1. [Structural challenge + data]\n2. [Policy gap + example]\n3. [Implementation bottleneck + case]\n\nGovernment Initiatives:\n• [Scheme 1 + budget outlay]\n• [Scheme 2 + impact data]\n• [Policy framework]\n\nInternational Best Practice: [Country] achieved [result] through [mechanism].\n\nWay Forward:\n→ Short-term: [Specific reform]\n→ Medium-term: [Systemic change]\n→ Long-term: [Structural shift]\n\nConclusion: Aligned with Viksit Bharat 2047 / SDG Goal X, India must...`,
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
    topper_answer: `Introduction: This situation presents a conflict between [Value A] and [Value B], testing the civil servant's ethical compass.\n\nEthical Dimensions:\n• Deontological: Duty demands [X]; however, moral law (Kant's categorical imperative) suggests [Y]\n• Consequentialist: Weighing outcomes — [Stakeholder A] would benefit from [Action X], while [Stakeholder B] faces [Risk]\n• Virtue Ethics: A person of integrity would [action], as Gandhian trusteeship demands [principle]\n\nStakeholder Analysis:\n1. [Primary stakeholder — interest — impact]\n2. [Secondary stakeholder — interest — impact]\n3. [Public interest — constitutional mandate]\n\nCourse of Action:\n→ Immediate: [Specific action with rationale]\n→ Procedural: [Escalation path]\n→ Systemic: [Institutional reform to prevent recurrence]\n\nConclusion: Guided by the Nolan principles of [X] and [Y], the ethical choice is [decision] because it upholds both constitutional duty and moral responsibility.`,
    priority_actions: [
      "Master the 7 Nolan Principles and 6 ARC pillars of ethics in governance",
      "Practice 3 case studies per week using the stakeholder-analysis framework",
      "Read 'Ethics in Governance' (2nd ARC) — Chapter 4 on public service values",
    ],
  },
  Essay: {
    score: 6,
    score_rationale: "Essay shows coherent thinking but lacks philosophical depth, literary references, and the multi-dimensional analysis UPSC expects at 125/250 marks.",
    keywords: {
      present: ["society", "development", "challenges"],
      missing: ["philosophical framework", "historical parallels", "contemporary data", "literary quote", "global perspective"],
      bonus: [],
    },
    structure: {
      intro: { rating: "Adequate", comment: "Introduction is functional but not captivating. Essays need a literary or philosophical hook." },
      body: { rating: "Adequate", comment: "Content present but organised linearly. Use a multi-dimensional approach: historical → contemporary → philosophical → futuristic." },
      way_forward: { rating: "Adequate", comment: "Present but needs more specific action points and hope-driven narrative." },
      conclusion: { rating: "Weak", comment: "Conclusion is abrupt. Essays must end with a memorable, inspiring thought." },
    },
    strengths: [{ point: "Clear central argument maintained throughout." }],
    weaknesses: [
      { point: "No literary or philosophical quotes to anchor the essay.", fix: "Open and close with a quote from Tagore, Gandhi, Nehru, or relevant thinkers." },
      { point: "Lacks data and contemporary examples.", fix: "Add at least 2 data points and 2 recent events to anchor your argument in reality." },
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
    topper_answer: `Opening Quote/Metaphor: "[Relevant quote from thinker/poet]"\n\nPhilosophical Grounding: At its core, this question asks us to examine [fundamental human value/tension]. [Philosopher X] argued that [insight], while [Philosopher Y]'s perspective offers [counterpoint].\n\nHistorical Dimension: Through history, [phenomenon] has manifested as [example 1], [example 2], revealing [pattern].\n\nContemporary Reality: Today, [data point] reveals [current state]. The paradox of [Topic] is perhaps most visible in [current event/trend].\n\nGlobal vs. Indian Perspective: While the West approaches [topic] through [framework], India's civilizational tradition offers [alternative lens] — rooted in [concept].\n\nCritical Analysis: Yet we must not romanticize. [Limitation or dark side of the topic] demands honest reckoning.\n\nWay Forward: The path forward requires [Action 1], [Action 2], and above all, [Core value/commitment].\n\nConclusion: [Memorable ending — full circle to opening quote, or a vision statement for the future]`,
    priority_actions: [
      "Build a quote-bank of 50 quotes across themes: democracy, justice, technology, society",
      "Practice writing essay outlines (not full essays) for 10 different topics",
      "Read 'Essay Writing for UPSC' by Arjun Singh — focus on structure and transitions",
    ],
  },
};

const RATING_CONFIG = {
  Strong:   { color: "var(--accent-green)", bg: "var(--accent-green-dim)", icon: CheckCircle2 },
  Adequate: { color: "var(--accent-gold)",  bg: "var(--accent-gold-dim)",  icon: Minus },
  Weak:     { color: "var(--accent-red)",   bg: "var(--accent-red-dim)",   icon: TrendingDown },
  Missing:  { color: "var(--accent-red)",   bg: "var(--accent-red-dim)",   icon: XCircle },
};

function ScoreRing({ score }) {
  const r = 36, circ = 2 * Math.PI * r, dash = ((score / 10) * 100 / 100) * circ;
  const color = score >= 7 ? "var(--accent-green)" : score >= 5 ? "var(--accent-gold)" : "var(--accent-red)";
  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
        <circle cx="44" cy="44" r={r} fill="none" stroke="var(--bg-border)" strokeWidth="6" />
        <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold text-xl" style={{ color }}>{score}</span>
        <span className="text-[10px] font-mono text-text-muted">/10</span>
      </div>
    </div>
  );
}

function KeyChip({ word, type }) {
  const s = {
    present: { bg: "var(--accent-green-dim)", color: "var(--accent-green)", border: "rgba(16,185,129,0.25)" },
    missing: { bg: "var(--accent-red-dim)",   color: "var(--accent-red)",   border: "rgba(239,68,68,0.25)" },
    bonus:   { bg: "var(--accent-gold-dim)",  color: "var(--accent-gold)",  border: "rgba(245,158,11,0.25)" },
  }[type];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {type === "present" && <CheckCircle2 size={9} />}
      {type === "missing" && <XCircle size={9} />}
      {type === "bonus"   && <Star size={9} />}
      {word}
    </span>
  );
}

function StructureBar({ label, rating, comment }) {
  const cfg = RATING_CONFIG[rating] || RATING_CONFIG.Weak;
  const Icon = cfg.icon;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-bg-border last:border-0">
      <div className="flex items-center gap-1.5 w-28 shrink-0 pt-0.5">
        <Icon size={12} style={{ color: cfg.color }} />
        <span className="text-xs font-mono text-text-muted">{label}</span>
      </div>
      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0"
        style={{ background: cfg.bg, color: cfg.color }}>{rating}</span>
      <p className="text-xs text-text-secondary leading-relaxed flex-1">{comment}</p>
    </div>
  );
}

function EvalResult({ data, isStatic }) {
  const [topperOpen, setTopperOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(data.topper_answer || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      {isStatic && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border"
          style={{ background: "var(--accent-gold-dim)", borderColor: "rgba(245,158,11,0.3)" }}>
          <AlertTriangle size={11} style={{ color: "var(--accent-gold)" }} className="shrink-0" />
          <p className="text-[11px] font-mono" style={{ color: "var(--accent-gold)" }}>
            AI provider unavailable — showing structured sample evaluation.
          </p>
        </div>
      )}

      {/* Score */}
      <div className="glass-panel p-4 flex items-center gap-4">
        <ScoreRing score={data.score} />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-1">Examiner Score</p>
          <p className="text-sm text-text-primary leading-relaxed">{data.score_rationale}</p>
        </div>
      </div>

      {/* Keywords */}
      <div className="glass-panel p-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <Key size={13} className="text-accent-gold" />
          <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider">Keyword Analysis</h3>
        </div>
        {data.keywords.present?.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-mono text-text-muted flex items-center gap-1">
              <CheckCircle2 size={9} className="text-accent-green" /> Used ({data.keywords.present.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.keywords.present.map(k => <KeyChip key={k} word={k} type="present" />)}
            </div>
          </div>
        )}
        {data.keywords.bonus?.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-mono text-text-muted">Bonus</p>
            <div className="flex flex-wrap gap-1.5">
              {data.keywords.bonus.map(k => <KeyChip key={k} word={k} type="bonus" />)}
            </div>
          </div>
        )}
        {data.keywords.missing?.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-mono text-text-muted flex items-center gap-1">
              <XCircle size={9} className="text-accent-red" /> Missing ({data.keywords.missing.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.keywords.missing.map(k => <KeyChip key={k} word={k} type="missing" />)}
            </div>
          </div>
        )}
      </div>

      {/* Structure */}
      <div className="glass-panel p-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText size={13} className="text-accent-gold" />
          <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider">Structure Breakdown</h3>
        </div>
        {Object.entries({
          "Introduction": data.structure.intro,
          "Body / Arguments": data.structure.body,
          "Way Forward": data.structure.way_forward,
          "Conclusion": data.structure.conclusion,
        }).map(([label, s]) => s && (
          <StructureBar key={label} label={label} rating={s.rating} comment={s.comment} />
        ))}
      </div>

      {/* Strengths + Weaknesses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="glass-panel p-4 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={13} className="text-accent-green" />
            <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider">Strengths</h3>
          </div>
          {data.strengths?.map((s, i) => (
            <p key={i} className="text-xs text-text-primary leading-relaxed">{s.point}</p>
          ))}
        </div>
        <div className="glass-panel p-4 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={13} className="text-accent-red" />
            <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider">Weaknesses</h3>
          </div>
          {data.weaknesses?.map((w, i) => (
            <div key={i} className="space-y-1">
              <p className="text-xs text-text-primary leading-relaxed">{w.point}</p>
              {w.fix && (
                <div className="flex items-start gap-1.5">
                  <ArrowRight size={10} className="text-accent-gold shrink-0 mt-0.5" />
                  <p className="text-[11px] font-mono" style={{ color: "var(--accent-gold)" }}>{w.fix}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Topper comparison */}
      {data.topper_comparison && (
        <div className="glass-panel p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Award size={13} className="text-accent-gold" />
            <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider">Topper vs Your Answer</h3>
          </div>
          {data.topper_comparison.what_topper_does_differently?.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono text-text-muted">What toppers do differently</p>
              {data.topper_comparison.what_topper_does_differently.map((d, i) => (
                <div key={i} className="flex items-start gap-2">
                  <ChevronRight size={11} className="text-accent-gold shrink-0 mt-0.5" />
                  <p className="text-xs text-text-secondary">{d}</p>
                </div>
              ))}
            </div>
          )}
          {data.topper_comparison.constitutional_statutory_references?.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono text-text-muted">References to add</p>
              <div className="flex flex-wrap gap-1.5">
                {data.topper_comparison.constitutional_statutory_references.map((r, i) => (
                  <span key={i} className="text-[11px] font-mono px-2 py-0.5 rounded-full"
                    style={{ background: "var(--accent-purple-dim)", color: "var(--accent-purple)", border: "1px solid rgba(139,92,246,0.2)" }}>
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}
          {data.topper_comparison.data_points_missing?.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono text-text-muted">Data points to add</p>
              <div className="flex flex-wrap gap-1.5">
                {data.topper_comparison.data_points_missing.map((d, i) => (
                  <span key={i} className="text-[11px] font-mono px-2 py-0.5 rounded-full"
                    style={{ background: "var(--accent-blue-dim)", color: "var(--accent-blue)", border: "1px solid rgba(59,130,246,0.2)" }}>
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Topper answer */}
      {data.topper_answer && (
        <div>
          <button onClick={() => setTopperOpen(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 border"
            style={{
              background: topperOpen ? "var(--accent-gold-dim)" : "var(--bg-muted)",
              borderColor: topperOpen ? "rgba(245,158,11,0.3)" : "var(--bg-border)",
            }}>
            <div className="flex items-center gap-2">
              <PenLine size={13} className="text-accent-gold" />
              <span className="text-sm font-semibold text-text-primary">Topper's Model Answer</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{ background: "var(--accent-gold-dim)", color: "var(--accent-gold)" }}>
                AIR 1–10 Standard
              </span>
            </div>
            <ChevronDown size={14} className={`text-text-muted transition-transform duration-300 ${topperOpen ? "rotate-180" : ""}`} />
          </button>
          {topperOpen && (
            <div className="glass-panel mt-2 p-5">
              <div className="flex justify-end mb-3">
                <button onClick={copy} className="btn-ghost flex items-center gap-1.5 text-xs">
                  {copied ? <CheckCheck size={11} className="text-accent-green" /> : <Copy size={11} />}
                  {copied ? "Copied!" : "Copy answer"}
                </button>
              </div>
              {data.topper_answer.split("\n").filter(Boolean).map((para, i) => (
                <p key={i} className="text-sm text-text-primary leading-8 mb-3 last:mb-0">{para}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Priority actions */}
      {data.priority_actions?.length > 0 && (
        <div className="glass-panel p-4 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={13} className="text-accent-gold" />
            <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider">Priority Actions</h3>
          </div>
          {data.priority_actions.map((a, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-bg-border last:border-0">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0"
                style={{ background: "var(--accent-gold-dim)", color: "var(--accent-gold)" }}>{i + 1}</span>
              <p className="text-sm text-text-primary leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * AIAnswerEvaluator — embeddable in any page.
 * Props:
 *   initialQuestion {string}  — pre-filled question text
 *   initialPaper    {string}  — GS1/GS2/GS3/GS4/Essay
 *   evaluateAnswerFn {fn}     — api.evaluateAnswer (optional; falls back to static)
 *   compact         {bool}    — slim layout for sidebar panels
 */
export default function AIAnswerEvaluator({
  initialQuestion = "",
  initialPaper = "GS2",
  evaluateAnswerFn = null,
  compact = false,
}) {
  const PAPERS = ["GS1", "GS2", "GS3", "GS4", "Essay"];

  const [question, setQuestion] = useState(initialQuestion);
  const [answer,   setAnswer]   = useState("");
  const [paper,    setPaper]    = useState(initialPaper);
  const [loading,  setLoading]  = useState(false);
  const [evalData, setEvalData] = useState(null);
  const [isStatic, setIsStatic] = useState(false);
  const [error,    setError]    = useState(null);
  const [stream,   setStream]   = useState("");

  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;

  const handleEvaluate = useCallback(async () => {
    if (!question.trim()) { setError("Please enter the question first."); return; }
    if (wordCount < 20)   { setError("Write at least 20 words before evaluating."); return; }

    setError(null);
    setEvalData(null);
    setStream("");
    setLoading(true);
    setIsStatic(false);

    if (evaluateAnswerFn) {
      let full = "";
      try {
        await evaluateAnswerFn(
          { question, answer, paper },
          (chunk) => { full += chunk; setStream(full); },
          (final) => {
            try {
              const parsed = typeof final === "string" ? JSON.parse(final) : final;
              setEvalData(parsed.data || parsed);
              setIsStatic(!!(parsed.provider_used?.includes("Sample")));
            } catch {
              const match = full.match(/\{[\s\S]*\}/);
              if (match) { try { setEvalData(JSON.parse(match[0])); } catch {} }
            }
            setLoading(false);
          }
        );
      } catch (e) {
        // Fall back to static
        setEvalData(STATIC_EVALS[paper] || STATIC_EVALS.GS2);
        setIsStatic(true);
        setLoading(false);
      }
    } else {
      // No API function provided — use static fallback directly
      await new Promise(r => setTimeout(r, 1200));
      setEvalData(STATIC_EVALS[paper] || STATIC_EVALS.GS2);
      setIsStatic(true);
      setLoading(false);
    }
  }, [question, answer, paper, wordCount, evaluateAnswerFn]);

  const reset = () => {
    setAnswer(""); setEvalData(null); setError(null); setStream(""); setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Paper selector */}
      {!compact && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider mr-1">Paper:</span>
          {PAPERS.map(p => (
            <button key={p} onClick={() => setPaper(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${paper === p ? "font-semibold" : "text-text-muted hover:text-text-secondary hover:bg-bg-muted"}`}
              style={paper === p ? { background: "var(--accent-gold)", color: "var(--bg-base)" } : {}}>
              {p}
            </button>
          ))}
          <button onClick={reset} className="ml-auto btn-ghost flex items-center gap-1 text-xs">
            <RefreshCw size={11} /> Reset
          </button>
        </div>
      )}

      {/* Question */}
      <div>
        <label className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-1 block">Question</label>
        <textarea value={question} onChange={e => setQuestion(e.target.value)}
          placeholder="Paste or type the Mains question here…" rows={compact ? 2 : 3}
          className="w-full bg-bg-muted border border-bg-border rounded-xl px-3 py-2.5 text-sm text-text-primary
                     focus:outline-none focus:border-accent-gold/40 transition-colors placeholder:text-text-muted resize-none" />
      </div>

      {/* Answer */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Your Answer</label>
          <span className={`text-xs font-mono ${wordCount >= 250 ? "text-accent-green" : wordCount >= 100 ? "text-yellow-400" : "text-text-muted"}`}>
            {wordCount}w {wordCount < 100 ? "• too short" : wordCount < 200 ? "• 10M range" : wordCount < 300 ? "• 15M range" : "• good"}
          </span>
        </div>
        <textarea value={answer} onChange={e => setAnswer(e.target.value)}
          placeholder={`Write your ${paper} answer here.\n\nStructure: Introduction → Body → Way Forward → Conclusion\n150–200w for 10M | 250–300w for 15M`}
          rows={compact ? 6 : 10}
          className="w-full bg-bg-base border border-bg-border rounded-xl px-3 py-2.5 text-sm text-text-primary
                     focus:outline-none focus:border-accent-gold/40 transition-colors placeholder:text-text-muted/50 resize-none" />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertTriangle size={12} className="text-red-400 shrink-0" />
          <p className="text-xs font-mono text-red-400">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button onClick={handleEvaluate} disabled={loading || wordCount < 5}
        className="btn-primary flex items-center justify-center gap-2 w-full">
        {loading
          ? <><Cpu size={14} className="animate-spin" />Evaluating…</>
          : <><Sparkles size={14} />Evaluate with AI</>
        }
      </button>

      {/* Loading state */}
      {loading && !evalData && (
        <div className="glass-panel p-6 flex flex-col items-center gap-3">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-accent-gold/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-t-accent-gold border-accent-gold/10 animate-spin" />
            <Cpu size={16} className="absolute inset-0 m-auto text-accent-gold" />
          </div>
          <p className="text-sm font-semibold text-text-primary">Mentor is analysing…</p>
          {stream && <p className="text-[11px] font-mono text-text-muted text-center max-w-xs">{stream.slice(-200)}</p>}
        </div>
      )}

      {/* Results */}
      {evalData && <EvalResult data={evalData} isStatic={isStatic} />}
    </div>
  );
}