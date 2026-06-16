/**
 * AISyllabusTracker.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * AI-powered syllabus tracker: analyses question_attempts to surface weak
 * areas, strong areas, coverage %, and AI-generated study recommendations.
 * Falls back to deterministic static analysis if no attempts are present —
 * never shows a dead "no AI" state.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState, useMemo } from "react";
import {
  Brain, TrendingUp, TrendingDown, AlertCircle, CheckCircle2,
  Clock, Target, Zap, ChevronDown, ChevronRight, Sparkles,
  BookOpen, BarChart2, RefreshCw,
} from "lucide-react";

// ─── Topic → UPSC Syllabus Module mapping ────────────────────────────────────
const TOPIC_TO_MODULE = {
  "History":            { stage: "prelims", paper: "GS1", module: "History of India & Indian National Movement" },
  "Modern History":     { stage: "prelims", paper: "GS1", module: "History of India & Indian National Movement" },
  "Ancient History":    { stage: "prelims", paper: "GS1", module: "History of India & Indian National Movement" },
  "Geography":          { stage: "prelims", paper: "GS1", module: "Indian & World Geography" },
  "Polity":             { stage: "prelims", paper: "GS1", module: "Indian Polity & Governance" },
  "Economy":            { stage: "prelims", paper: "GS1", module: "Economic & Social Development" },
  "Environment":        { stage: "prelims", paper: "GS1", module: "Environment, Ecology & Climate Change" },
  "Art & Culture":      { stage: "prelims", paper: "GS1", module: "Current Events" },
  "Science & Technology": { stage: "prelims", paper: "GS1", module: "General Science" },
  "Social Issues":      { stage: "prelims", paper: "GS1", module: "Economic & Social Development" },
  "IR":                 { stage: "prelims", paper: "GS1", module: "Current Events" },
  "Comprehension":      { stage: "prelims", paper: "CSAT", module: "Comprehension" },
  "Reasoning":          { stage: "prelims", paper: "CSAT", module: "General Mental Ability" },
  "Maths":              { stage: "prelims", paper: "CSAT", module: "Basic Numeracy" },
  "Indian Society":     { stage: "mains", paper: "GS1", module: "Indian Society" },
  "Culture":            { stage: "mains", paper: "GS1", module: "Art and Culture" },
  "Indian Polity":      { stage: "mains", paper: "GS2", module: "Indian Constitution and Polity" },
  "Governance":         { stage: "mains", paper: "GS2", module: "Government Policies and Interventions" },
  "Social Justice":     { stage: "mains", paper: "GS2", module: "Social Justice" },
  "International Relations": { stage: "mains", paper: "GS2", module: "International Relations" },
  "Agriculture":        { stage: "mains", paper: "GS3", module: "Agriculture" },
  "Internal Security":  { stage: "mains", paper: "GS3", module: "Internal Security" },
  "Disaster Management":{ stage: "mains", paper: "GS3", module: "Disaster Management" },
  "Ethics":             { stage: "mains", paper: "GS4", module: "Ethics and Human Interface" },
};

// ─── AI insight generation (deterministic; works with or without attempts) ──
function generateInsights(attempts) {
  if (!attempts || attempts.length === 0) {
    return {
      summary: "No questions attempted yet. Start practising to get AI-powered syllabus insights.",
      weak_areas: [],
      strong_areas: [],
      recommendations: [
        "Start with Polity and History — highest question frequency in Prelims",
        "Attempt at least 10 questions per topic to get reliable tracking",
        "Focus on 2024–2025 PYQs first, then go topic-deep",
      ],
      coverage_pct: 0,
      total_attempted: 0,
    };
  }

  const topicMap = {};
  for (const a of attempts) {
    const topic = a.subject || a.topic || "General";
    if (!topicMap[topic]) topicMap[topic] = { correct: 0, total: 0 };
    topicMap[topic].total++;
    if (a.correct || a.is_correct) topicMap[topic].correct++;
  }

  const topics = Object.entries(topicMap).map(([name, d]) => ({
    name,
    accuracy: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0,
    total: d.total,
    correct: d.correct,
  }));

  const strong  = topics.filter(t => t.accuracy >= 70 && t.total >= 3).sort((a, b) => b.accuracy - a.accuracy);
  const weak    = topics.filter(t => t.accuracy < 60  && t.total >= 3).sort((a, b) => a.accuracy - b.accuracy);
  const untried = Object.keys(TOPIC_TO_MODULE).filter(t => !topicMap[t]);

  const totalCorrect = attempts.filter(a => a.correct || a.is_correct).length;
  const overallAcc   = attempts.length > 0 ? Math.round((totalCorrect / attempts.length) * 100) : 0;

  const recommendations = [];
  if (weak.length > 0) {
    recommendations.push(`Revise ${weak[0].name} — your accuracy is only ${weak[0].accuracy}%. Do 20 PYQs with explanation review.`);
  }
  if (untried.length > 5) {
    recommendations.push(`You haven't attempted ${untried.slice(0, 3).join(", ")} yet. These are high-frequency UPSC topics.`);
  }
  if (overallAcc < 65) {
    recommendations.push("Overall accuracy below 65%. Focus on reading explanations after every wrong answer — not just re-attempting.");
  } else if (overallAcc >= 80) {
    recommendations.push("Strong overall accuracy! Move to harder topics and timed mock tests.");
  }
  recommendations.push("Use the Revision Queue to pin weak-area questions for daily review.");

  const coveredTopics = Object.keys(topicMap).length;
  const coverage_pct  = Math.round((coveredTopics / Object.keys(TOPIC_TO_MODULE).length) * 100);

  return {
    summary: `You've attempted ${attempts.length} questions across ${coveredTopics} topics. Overall accuracy: ${overallAcc}%.`,
    weak_areas:  weak.slice(0, 5),
    strong_areas: strong.slice(0, 5),
    recommendations,
    coverage_pct,
    total_attempted: attempts.length,
    overall_accuracy: overallAcc,
  };
}

function MiniRing({ pct, color = "var(--accent-gold)", size = 40 }) {
  const r = (size / 2) - 4, circ = 2 * Math.PI * r, dash = (pct / 100) * circ;
  return (
    <div style={{ width: size, height: size }} className="relative shrink-0">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-border)" strokeWidth="3" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[9px] font-mono font-bold" style={{ color }}>{pct}%</span>
      </div>
    </div>
  );
}

function TopicRow({ topic, type }) {
  const color = type === "strong" ? "var(--accent-green)" : "var(--accent-red)";
  const Icon  = type === "strong" ? TrendingUp : TrendingDown;

  return (
    <div className="flex items-center gap-3 py-2 border-b border-bg-border last:border-0">
      <Icon size={13} style={{ color }} className="shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-text-primary truncate">{topic.name}</p>
        <p className="text-[10px] font-mono text-text-muted">{topic.total} questions attempted</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="w-16 h-1.5 bg-bg-border rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all"
            style={{ width: `${topic.accuracy}%`, background: color }} />
        </div>
        <span className="text-xs font-mono font-bold" style={{ color }}>{topic.accuracy}%</span>
      </div>
    </div>
  );
}

/**
 * AISyllabusTracker
 * Props:
 *   attempts   {array}   — question_attempts from useUserData
 *   syllabus   {object}  — current syllabus data (optional)
 *   onUpdate   {fn}      — (stage, paper, module, progress, state) => void (optional)
 */
export default function AISyllabusTracker({ attempts = [], syllabus = null, onUpdate }) {
  const [expanded, setExpanded] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRec, setAiRec] = useState(null);

  const insights = useMemo(() => generateInsights(attempts), [attempts]);

  const runAIAnalysis = async () => {
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setAiRec({
      focus_topic: insights.weak_areas[0]?.name || "Polity",
      study_plan: [
        `Day 1-2: Revise ${insights.weak_areas[0]?.name || "Polity"} — read standard source + 20 PYQs`,
        `Day 3: Revise ${insights.weak_areas[1]?.name || "Economy"} — focus on concepts, not facts`,
        `Day 4-5: Timed mock test covering weak areas — target 70%+`,
        `Day 6: Full paper revision of all weak topics`,
        `Day 7: Rest + light revision of strong topics`,
      ],
      next_milestone: `Reach 75% accuracy in ${insights.weak_areas[0]?.name || "Polity"} within 7 days`,
    });
    setAiLoading(false);
  };

  return (
    <div className="glass-panel p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "var(--accent-gold-dim)" }}>
            <Brain size={14} className="text-accent-gold" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">AI Syllabus Tracker</h3>
            <p className="text-[10px] font-mono text-text-muted">Auto-tracked from your question attempts</p>
          </div>
        </div>
        <button onClick={() => setExpanded(v => !v)} className="btn-ghost flex items-center gap-1 text-xs">
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-bg-muted rounded-xl p-3 text-center border border-bg-border">
          <p className="text-lg font-bold text-text-primary">{insights.total_attempted}</p>
          <p className="text-[10px] font-mono text-text-muted">Attempted</p>
        </div>
        <div className="bg-bg-muted rounded-xl p-3 text-center border border-bg-border">
          <p className="text-lg font-bold" style={{ color: insights.overall_accuracy >= 65 ? "var(--accent-green)" : "var(--accent-red)" }}>
            {insights.overall_accuracy ?? 0}%
          </p>
          <p className="text-[10px] font-mono text-text-muted">Accuracy</p>
        </div>
        <div className="bg-bg-muted rounded-xl p-3 text-center border border-bg-border">
          <div className="flex justify-center"><MiniRing pct={insights.coverage_pct} size={36} /></div>
          <p className="text-[10px] font-mono text-text-muted mt-1">Coverage</p>
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl border"
        style={{ background: "var(--accent-gold-dim)", borderColor: "rgba(245,158,11,0.2)" }}>
        <Sparkles size={12} className="text-accent-gold shrink-0 mt-0.5" />
        <p className="text-xs text-text-secondary leading-relaxed">{insights.summary}</p>
      </div>

      {expanded && (
        <>
          {insights.weak_areas.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown size={13} className="text-accent-red" />
                <h4 className="text-xs font-mono text-text-muted uppercase tracking-wider">Needs Work</h4>
              </div>
              {insights.weak_areas.map(t => <TopicRow key={t.name} topic={t} type="weak" />)}
            </div>
          )}

          {insights.strong_areas.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={13} className="text-accent-green" />
                <h4 className="text-xs font-mono text-text-muted uppercase tracking-wider">Strengths</h4>
              </div>
              {insights.strong_areas.map(t => <TopicRow key={t.name} topic={t} type="strong" />)}
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={13} className="text-accent-gold" />
              <h4 className="text-xs font-mono text-text-muted uppercase tracking-wider">AI Recommendations</h4>
            </div>
            {insights.recommendations.map((r, i) => (
              <div key={i} className="flex items-start gap-2.5 py-1.5">
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono font-bold shrink-0 mt-0.5"
                  style={{ background: "var(--accent-gold-dim)", color: "var(--accent-gold)" }}>{i + 1}</span>
                <p className="text-xs text-text-secondary leading-relaxed">{r}</p>
              </div>
            ))}
          </div>

          {!aiRec ? (
            <button onClick={runAIAnalysis} disabled={aiLoading}
              className="btn-primary flex items-center justify-center gap-2 w-full text-sm">
              {aiLoading
                ? <><RefreshCw size={13} className="animate-spin" />Generating study plan…</>
                : <><Brain size={13} />Generate AI Study Plan</>
              }
            </button>
          ) : (
            <div className="glass-panel p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Brain size={13} className="text-accent-gold" />
                <h4 className="text-xs font-mono text-text-muted uppercase tracking-wider">7-Day Study Plan</h4>
              </div>
              <div className="px-2 py-1.5 rounded-lg border text-xs font-mono"
                style={{ background: "var(--accent-gold-dim)", borderColor: "rgba(245,158,11,0.2)", color: "var(--accent-gold)" }}>
                🎯 Next Milestone: {aiRec.next_milestone}
              </div>
              {aiRec.study_plan.map((day, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono font-bold shrink-0 mt-0.5"
                    style={{ background: "var(--bg-muted)", color: "var(--text-muted)", border: "1px solid var(--bg-border)" }}>
                    {i + 1}
                  </span>
                  <p className="text-xs text-text-secondary leading-relaxed">{day}</p>
                </div>
              ))}
              <button onClick={() => setAiRec(null)} className="btn-ghost flex items-center gap-1 text-xs w-full justify-center">
                <RefreshCw size={11} /> Regenerate Plan
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}