/**
 * AIFeatures.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Central AI hub. Four tabs:
 *  1. AI Answer Evaluator   — evaluate your Mains answers with AI
 *  2. AI Syllabus Tracker   — weakness/strength analysis from attempts
 *  3. AI Revision Topics    — spaced repetition queue
 *  4. Past Trends           — topic frequency across years
 *
 * No slider. No "workspace" metaphor. Clean tabbed layout.
 * Each tab uses real Anthropic API via fetch and falls back to static data.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState, useMemo, useCallback } from "react";
import {
  Brain, PenLine, BookOpen, TrendingUp, TrendingDown,
  Target, Zap, Sparkles, ChevronDown, ChevronRight,
  CheckCircle2, XCircle, Minus, Copy, CheckCheck,
  AlertTriangle, Key, FileText, Award, Star, ArrowRight,
  RefreshCw, Cpu, BarChart2, Calendar, Clock, Flame,
  RotateCcw, Pin,
} from "lucide-react";
import {
  STATIC_EVALS, PAST_TRENDS, STATIC_AI_ANSWERS,
  REVISION_TOPICS_SEED, TOPIC_TO_MODULE,
} from "../data/ai_features_data";

// ─────────────────────────────────────────────────────────────────────────────
// Shared utilities
// ─────────────────────────────────────────────────────────────────────────────

function callAnthropicAPI(systemPrompt, userMessage) {
  return fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 1 — AI Answer Evaluator
// ─────────────────────────────────────────────────────────────────────────────

const RATING_CFG = {
  Strong:   { color: "var(--accent-green)", bg: "var(--accent-green-dim)", Icon: CheckCircle2 },
  Adequate: { color: "var(--accent-gold)",  bg: "var(--accent-gold-dim)",  Icon: Minus },
  Weak:     { color: "var(--accent-red)",   bg: "var(--accent-red-dim)",   Icon: TrendingDown },
  Missing:  { color: "var(--accent-red)",   bg: "var(--accent-red-dim)",   Icon: XCircle },
};

function ScoreRing({ score }) {
  const r = 36, circ = 2 * Math.PI * r;
  const dash = ((score / 10)) * circ;
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
  const cfg = RATING_CFG[rating] || RATING_CFG.Weak;
  const { Icon } = cfg;
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
        {data.keywords?.present?.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-mono text-text-muted flex items-center gap-1">
              <CheckCircle2 size={9} className="text-accent-green" /> Used ({data.keywords.present.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.keywords.present.map(k => <KeyChip key={k} word={k} type="present" />)}
            </div>
          </div>
        )}
        {data.keywords?.missing?.length > 0 && (
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
        {data.structure && Object.entries({
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

      {/* Topper model answer */}
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

function AnswerEvaluatorTab() {
  const PAPERS = ["GS1", "GS2", "GS3", "GS4", "Essay"];
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [paper, setPaper] = useState("GS2");
  const [loading, setLoading] = useState(false);
  const [evalData, setEvalData] = useState(null);
  const [isStatic, setIsStatic] = useState(false);
  const [error, setError] = useState(null);

  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;

  const handleEvaluate = useCallback(async () => {
    if (!question.trim()) { setError("Please enter the question first."); return; }
    if (wordCount < 20)   { setError("Write at least 20 words before evaluating."); return; }

    setError(null); setEvalData(null); setLoading(true); setIsStatic(false);

    try {
      const systemPrompt = `You are an expert UPSC Mains evaluator. Evaluate the given answer and return ONLY valid JSON (no markdown, no backticks) in this exact shape:
{
  "score": <1-10>,
  "score_rationale": "<2-3 sentence assessment>",
  "keywords": {
    "present": ["<keyword>"],
    "missing": ["<keyword>"],
    "bonus": ["<keyword>"]
  },
  "structure": {
    "intro": { "rating": "<Strong|Adequate|Weak|Missing>", "comment": "<text>" },
    "body": { "rating": "<Strong|Adequate|Weak|Missing>", "comment": "<text>" },
    "way_forward": { "rating": "<Strong|Adequate|Weak|Missing>", "comment": "<text>" },
    "conclusion": { "rating": "<Strong|Adequate|Weak|Missing>", "comment": "<text>" }
  },
  "strengths": [{ "point": "<text>" }],
  "weaknesses": [{ "point": "<text>", "fix": "<text>" }],
  "topper_comparison": {
    "what_topper_does_differently": ["<text>"],
    "constitutional_statutory_references": ["<ref>"],
    "data_points_missing": ["<text>"]
  },
  "topper_answer": "<full model answer>",
  "priority_actions": ["<action>"]
}`;

      const res = await callAnthropicAPI(
        systemPrompt,
        `Paper: ${paper}\n\nQuestion: ${question}\n\nCandidate Answer:\n${answer}`
      );

      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setEvalData(parsed);
      setIsStatic(false);
    } catch {
      setEvalData(STATIC_EVALS[paper] || STATIC_EVALS.GS2);
      setIsStatic(true);
    } finally {
      setLoading(false);
    }
  }, [question, answer, paper, wordCount]);

  const reset = () => { setAnswer(""); setEvalData(null); setError(null); setLoading(false); };

  return (
    <div className="flex flex-col gap-4">
      {/* Paper selector */}
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

      {/* Question */}
      <div>
        <label className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-1 block">Question</label>
        <textarea value={question} onChange={e => setQuestion(e.target.value)}
          placeholder="Paste or type the Mains question here…" rows={3}
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
          rows={10}
          className="w-full bg-bg-base border border-bg-border rounded-xl px-3 py-2.5 text-sm text-text-primary
                     focus:outline-none focus:border-accent-gold/40 transition-colors placeholder:text-text-muted/50 resize-none" />
      </div>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertTriangle size={12} className="text-red-400 shrink-0" />
          <p className="text-xs font-mono text-red-400">{error}</p>
        </div>
      )}

      <button onClick={handleEvaluate} disabled={loading || wordCount < 5}
        className="btn-primary flex items-center justify-center gap-2 w-full">
        {loading
          ? <><Cpu size={14} className="animate-spin" />Evaluating…</>
          : <><Sparkles size={14} />Evaluate with AI</>
        }
      </button>

      {loading && (
        <div className="glass-panel p-6 flex flex-col items-center gap-3">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-accent-gold/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-t-accent-gold border-accent-gold/10 animate-spin" />
            <Cpu size={16} className="absolute inset-0 m-auto text-accent-gold" />
          </div>
          <p className="text-sm font-semibold text-text-primary">Mentor is analysing…</p>
        </div>
      )}

      {evalData && <EvalResult data={evalData} isStatic={isStatic} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 2 — AI Syllabus Tracker
// ─────────────────────────────────────────────────────────────────────────────

function generateInsights(attempts) {
  if (!attempts || attempts.length === 0) {
    return {
      summary: "No questions attempted yet. Start practising to get AI-powered syllabus insights.",
      weak_areas: [], strong_areas: [],
      recommendations: [
        "Start with Polity and History — highest question frequency in Prelims",
        "Attempt at least 10 questions per topic to get reliable tracking",
        "Focus on 2024–2025 PYQs first, then go topic-deep",
      ],
      coverage_pct: 0, total_attempted: 0, overall_accuracy: 0,
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
    name, accuracy: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0,
    total: d.total, correct: d.correct,
  }));

  const strong = topics.filter(t => t.accuracy >= 70 && t.total >= 3).sort((a, b) => b.accuracy - a.accuracy);
  const weak   = topics.filter(t => t.accuracy < 60  && t.total >= 3).sort((a, b) => a.accuracy - b.accuracy);
  const untried = Object.keys(TOPIC_TO_MODULE).filter(t => !topicMap[t]);

  const totalCorrect = attempts.filter(a => a.correct || a.is_correct).length;
  const overallAcc = attempts.length > 0 ? Math.round((totalCorrect / attempts.length) * 100) : 0;

  const recommendations = [];
  if (weak.length > 0) recommendations.push(`Revise ${weak[0].name} — your accuracy is only ${weak[0].accuracy}%. Do 20 PYQs with explanation review.`);
  if (untried.length > 5) recommendations.push(`You haven't attempted ${untried.slice(0, 3).join(", ")} yet. These are high-frequency UPSC topics.`);
  if (overallAcc < 65) recommendations.push("Overall accuracy below 65%. Focus on reading explanations after every wrong answer — not just re-attempting.");
  else if (overallAcc >= 80) recommendations.push("Strong overall accuracy! Move to harder topics and timed mock tests.");
  recommendations.push("Use the Revision Queue tab to see topics due for review today.");

  return {
    summary: `You've attempted ${attempts.length} questions across ${Object.keys(topicMap).length} topics. Overall accuracy: ${overallAcc}%.`,
    weak_areas: weak.slice(0, 5), strong_areas: strong.slice(0, 5),
    recommendations,
    coverage_pct: Math.round((Object.keys(topicMap).length / Object.keys(TOPIC_TO_MODULE).length) * 100),
    total_attempted: attempts.length, overall_accuracy: overallAcc,
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
          <div className="h-full rounded-full transition-all" style={{ width: `${topic.accuracy}%`, background: color }} />
        </div>
        <span className="text-xs font-mono font-bold" style={{ color }}>{topic.accuracy}%</span>
      </div>
    </div>
  );
}

function SyllabusTrackerTab({ attempts }) {
  const [aiPlan, setAiPlan] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const insights = useMemo(() => generateInsights(attempts), [attempts]);

  const generateAIPlan = async () => {
    setAiLoading(true);
    try {
      const res = await callAnthropicAPI(
        "You are a UPSC study coach. Based on the student's performance data, generate a 7-day study plan. Return ONLY valid JSON (no markdown): { \"focus_topic\": \"<topic>\", \"next_milestone\": \"<text>\", \"study_plan\": [\"Day 1: ...\", \"Day 2: ...\", ...7 items] }",
        `Student data: ${JSON.stringify({ weak: insights.weak_areas, strong: insights.strong_areas, coverage: insights.coverage_pct, accuracy: insights.overall_accuracy })}`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      setAiPlan(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch {
      setAiPlan({
        focus_topic: insights.weak_areas[0]?.name || "Polity",
        next_milestone: `Reach 75% accuracy in ${insights.weak_areas[0]?.name || "Polity"} within 7 days`,
        study_plan: [
          `Day 1-2: Revise ${insights.weak_areas[0]?.name || "Polity"} — read standard source + 20 PYQs`,
          `Day 3: Revise ${insights.weak_areas[1]?.name || "Economy"} — focus on concepts, not facts`,
          "Day 4-5: Timed mock test covering weak areas — target 70%+",
          "Day 6: Full paper revision of all weak topics",
          "Day 7: Rest + light revision of strong topics",
        ],
      });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats row */}
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

      <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl border"
        style={{ background: "var(--accent-gold-dim)", borderColor: "rgba(245,158,11,0.2)" }}>
        <Sparkles size={12} className="text-accent-gold shrink-0 mt-0.5" />
        <p className="text-xs text-text-secondary leading-relaxed">{insights.summary}</p>
      </div>

      {insights.weak_areas.length > 0 && (
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown size={13} className="text-accent-red" />
            <h4 className="text-xs font-mono text-text-muted uppercase tracking-wider">Needs Work</h4>
          </div>
          {insights.weak_areas.map(t => <TopicRow key={t.name} topic={t} type="weak" />)}
        </div>
      )}

      {insights.strong_areas.length > 0 && (
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={13} className="text-accent-green" />
            <h4 className="text-xs font-mono text-text-muted uppercase tracking-wider">Strengths</h4>
          </div>
          {insights.strong_areas.map(t => <TopicRow key={t.name} topic={t} type="strong" />)}
        </div>
      )}

      <div className="glass-panel p-4 space-y-1.5">
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

      {!aiPlan ? (
        <button onClick={generateAIPlan} disabled={aiLoading}
          className="btn-primary flex items-center justify-center gap-2 w-full text-sm">
          {aiLoading
            ? <><RefreshCw size={13} className="animate-spin" />Generating study plan…</>
            : <><Brain size={13} />Generate AI 7-Day Study Plan</>
          }
        </button>
      ) : (
        <div className="glass-panel p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain size={13} className="text-accent-gold" />
              <h4 className="text-xs font-mono text-text-muted uppercase tracking-wider">7-Day Study Plan</h4>
            </div>
            <button onClick={() => setAiPlan(null)} className="btn-ghost flex items-center gap-1 text-xs">
              <RefreshCw size={11} /> Redo
            </button>
          </div>
          <div className="px-2 py-1.5 rounded-lg border text-xs font-mono"
            style={{ background: "var(--accent-gold-dim)", borderColor: "rgba(245,158,11,0.2)", color: "var(--accent-gold)" }}>
            🎯 Next Milestone: {aiPlan.next_milestone}
          </div>
          {aiPlan.study_plan?.map((day, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono font-bold shrink-0 mt-0.5"
                style={{ background: "var(--bg-muted)", color: "var(--text-muted)", border: "1px solid var(--bg-border)" }}>
                {i + 1}
              </span>
              <p className="text-xs text-text-secondary leading-relaxed">{day}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 3 — AI Revision Topics (Spaced Repetition)
// ─────────────────────────────────────────────────────────────────────────────

const INTERVALS = { again: 1, hard: 3, good: 7, easy: 14 };

function daysSince(dateStr) {
  if (!dateStr) return 999;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function computeQueue(attempts) {
  if (!attempts || attempts.length === 0) return { due: [], upcoming: [], overdue: [] };

  const topicMap = {};
  for (const a of attempts) {
    const topic = a.subject || a.topic || "General";
    if (!topicMap[topic]) topicMap[topic] = { name: topic, total: 0, correct: 0, lastAttempted: a.attempted_at || a.date || null };
    const t = topicMap[topic];
    t.total++;
    if (a.correct || a.is_correct) t.correct++;
    const aDate = a.attempted_at || a.date;
    if (!t.lastAttempted || (aDate && new Date(aDate) > new Date(t.lastAttempted))) t.lastAttempted = aDate;
  }

  const topics = Object.values(topicMap).map(t => {
    const accuracy = t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0;
    const days = daysSince(t.lastAttempted);
    const interval = accuracy < 40 ? INTERVALS.again : accuracy < 60 ? INTERVALS.hard : accuracy < 80 ? INTERVALS.good : INTERVALS.easy;
    return { ...t, accuracy, days, interval, daysOverdue: days - interval };
  });

  return {
    overdue:  topics.filter(t => t.daysOverdue > 3).sort((a, b) => b.daysOverdue - a.daysOverdue),
    due:      topics.filter(t => t.daysOverdue >= 0 && t.daysOverdue <= 3).sort((a, b) => a.accuracy - b.accuracy),
    upcoming: topics.filter(t => t.daysOverdue < 0).sort((a, b) => b.daysOverdue - a.daysOverdue),
  };
}

function RevTopicCard({ topic, type }) {
  const [done, setDone] = useState(false);
  const typeStyle = {
    overdue:  { label: "Overdue",   color: "var(--accent-red)" },
    due:      { label: "Due Today", color: "var(--accent-gold)" },
    upcoming: { label: "Upcoming",  color: "var(--text-muted)" },
  }[type];
  const daysText = type === "overdue" ? `${topic.daysOverdue}d overdue`
    : type === "due" ? "due today"
    : `in ${Math.abs(topic.daysOverdue)}d`;

  return (
    <div className={`flex items-center gap-3 py-2.5 border-b border-bg-border last:border-0 transition-opacity ${done ? "opacity-40" : ""}`}>
      <button onClick={() => setDone(v => !v)}
        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all border ${
          done ? "bg-accent-green border-accent-green/50" : "border-bg-border hover:border-accent-gold/50"
        }`}>
        {done && <CheckCircle2 size={11} className="text-white" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-text-primary truncate">{topic.name}</p>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full shrink-0"
            style={{ background: `${typeStyle.color}20`, color: typeStyle.color }}>
            {typeStyle.label}
          </span>
        </div>
        <p className="text-[10px] font-mono text-text-muted mt-0.5">{topic.total} Qs · {topic.accuracy}% accuracy · {daysText}</p>
      </div>
      <div className="shrink-0 w-12">
        <div className="w-full h-1 bg-bg-border rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{
            width: `${topic.accuracy}%`,
            background: topic.accuracy >= 70 ? "var(--accent-green)" : topic.accuracy >= 50 ? "var(--accent-gold)" : "var(--accent-red)",
          }} />
        </div>
      </div>
    </div>
  );
}

function RevisionQueueTab({ attempts }) {
  const [aiTips, setAiTips] = useState({});
  const [loadingTip, setLoadingTip] = useState(null);
  const queue = useMemo(() => computeQueue(attempts), [attempts]);
  const hasData = queue.overdue.length + queue.due.length + queue.upcoming.length > 0;

  const getAITip = async (topicName) => {
    setLoadingTip(topicName);
    try {
      const res = await callAnthropicAPI(
        "You are a UPSC study coach. In 2-3 sentences, give a specific revision tip for this topic. Be concrete — mention a source, an approach, or a specific sub-topic to focus on. Keep it under 50 words.",
        `UPSC topic to revise: ${topicName}`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      setAiTips(v => ({ ...v, [topicName]: text }));
    } catch {
      const seed = REVISION_TOPICS_SEED.find(t => t.topic.toLowerCase() === topicName.toLowerCase());
      setAiTips(v => ({ ...v, [topicName]: seed?.tip || `Focus on recent PYQs for ${topicName}. Review the standard source and practice 10 questions with explanations.` }));
    } finally {
      setLoadingTip(null);
    }
  };

  if (!hasData) {
    return (
      <div className="space-y-4">
        <div className="glass-panel p-6 text-center space-y-3">
          <Brain size={32} className="mx-auto text-text-muted opacity-40" />
          <p className="text-sm text-text-secondary">No attempts yet. Start solving questions to build your revision queue.</p>
        </div>
        <div className="glass-panel p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={13} className="text-accent-gold" />
            <h4 className="text-xs font-mono text-text-muted uppercase tracking-wider">Suggested Revision Order (Standard)</h4>
          </div>
          {REVISION_TOPICS_SEED.slice(0, 6).map((t, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-bg-border last:border-0">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0"
                style={{ background: "var(--accent-gold-dim)", color: "var(--accent-gold)" }}>{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-text-primary">{t.topic}</p>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full shrink-0"
                    style={{ background: "var(--accent-blue-dim)", color: "var(--accent-blue)" }}>
                    {t.last_trend}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-text-muted mt-0.5">{t.standard_source}</p>
                {aiTips[t.topic] ? (
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">{aiTips[t.topic]}</p>
                ) : (
                  <button onClick={() => getAITip(t.topic)} disabled={loadingTip === t.topic}
                    className="flex items-center gap-1 text-[11px] font-mono mt-1 transition-colors"
                    style={{ color: "var(--accent-gold)" }}>
                    {loadingTip === t.topic ? <><RefreshCw size={10} className="animate-spin" />Getting tip…</> : <><Sparkles size={10} />AI Revision Tip</>}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {queue.overdue.length > 0 && (
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={13} className="text-accent-red" />
            <h4 className="text-xs font-mono text-text-muted uppercase tracking-wider">Overdue ({queue.overdue.length})</h4>
          </div>
          {queue.overdue.map(t => <RevTopicCard key={t.name} topic={t} type="overdue" />)}
        </div>
      )}

      {queue.due.length > 0 && (
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={13} className="text-accent-gold" />
            <h4 className="text-xs font-mono text-text-muted uppercase tracking-wider">Due Today ({queue.due.length})</h4>
          </div>
          {queue.due.map(t => <RevTopicCard key={t.name} topic={t} type="due" />)}
        </div>
      )}

      {queue.upcoming.length > 0 && (
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={13} className="text-text-muted" />
            <h4 className="text-xs font-mono text-text-muted uppercase tracking-wider">Upcoming ({queue.upcoming.length})</h4>
          </div>
          {queue.upcoming.slice(0, 5).map(t => <RevTopicCard key={t.name} topic={t} type="upcoming" />)}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 4 — Past Trends
// ─────────────────────────────────────────────────────────────────────────────

function PastTrendsTab() {
  const [stage, setStage] = useState("prelims");
  const [mainsGS, setMainsGS] = useState("GS2");
  const [aiInsight, setAiInsight] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const getAiInsight = async (topic) => {
    setAiLoading(topic);
    try {
      const res = await callAnthropicAPI(
        "You are a UPSC expert. In 3-4 sentences, explain why this topic is important for UPSC CSE, what specific sub-areas to focus on, and a recent angle/current affairs link. Be specific and actionable. Under 80 words.",
        `UPSC topic: ${topic}`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAiInsight({ topic, text: data.content?.map(b => b.text || "").join("") || "" });
    } catch {
      setAiInsight({ topic, text: `${topic} is a high-frequency area in UPSC. Focus on current affairs integration, PYQ patterns, and standard sources. Revise recent government policies and international developments related to this topic.` });
    } finally {
      setAiLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Stage toggle */}
      <div className="flex gap-2">
        {["prelims", "mains"].map(s => (
          <button key={s} onClick={() => setStage(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-all ${
              stage === s ? "font-semibold" : "text-text-muted hover:text-text-secondary hover:bg-bg-muted"
            }`}
            style={stage === s ? { background: "var(--accent-gold)", color: "var(--bg-base)" } : {}}>
            {s}
          </button>
        ))}
      </div>

      {stage === "prelims" ? (
        <div className="glass-panel p-4 space-y-1">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 size={13} className="text-accent-gold" />
            <h4 className="text-xs font-mono text-text-muted uppercase tracking-wider">Prelims GS1 — Topic Frequency (2018–2024 avg)</h4>
          </div>
          {PAST_TRENDS.prelims.map((item, i) => (
            <div key={i} className="py-2.5 border-b border-bg-border last:border-0">
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-[10px] font-mono text-text-muted w-4 shrink-0">{i + 1}</span>
                <p className="text-sm font-medium text-text-primary flex-1">{item.topic}</p>
                <div className="flex items-center gap-1 shrink-0">
                  {item.trend === "up"   && <TrendingUp size={11} className="text-accent-green" />}
                  {item.trend === "down" && <TrendingDown size={11} className="text-accent-red" />}
                  {item.trend === "flat" && <Minus size={11} className="text-text-muted" />}
                  <span className="text-xs font-mono font-bold text-text-primary">{item.questions}Q</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-5">
                <div className="flex-1 h-1.5 bg-bg-border rounded-full overflow-hidden">
                  <div className="h-full rounded-full"
                    style={{
                      width: `${(item.questions / 22) * 100}%`,
                      background: item.trend === "up" ? "var(--accent-green)" : item.trend === "down" ? "var(--accent-red)" : "var(--accent-gold)",
                    }} />
                </div>
                <p className="text-[10px] font-mono text-text-muted">{item.highlight}</p>
              </div>
              <div className="ml-5 mt-1">
                {aiInsight?.topic === item.topic ? (
                  <p className="text-[11px] text-text-secondary leading-relaxed mt-1">{aiInsight.text}</p>
                ) : (
                  <button onClick={() => getAiInsight(item.topic)} disabled={aiLoading === item.topic}
                    className="flex items-center gap-1 text-[11px] font-mono mt-0.5 transition-colors"
                    style={{ color: "var(--accent-gold)" }}>
                    {aiLoading === item.topic ? <><RefreshCw size={9} className="animate-spin" />Loading…</> : <><Sparkles size={9} />AI Insight</>}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {/* GS paper selector */}
          <div className="flex gap-1.5 flex-wrap">
            {["GS1", "GS2", "GS3", "GS4"].map(gs => (
              <button key={gs} onClick={() => setMainsGS(gs)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                  mainsGS === gs ? "font-semibold" : "text-text-muted hover:text-text-secondary hover:bg-bg-muted"
                }`}
                style={mainsGS === gs ? { background: "var(--accent-gold)", color: "var(--bg-base)" } : {}}>
                {gs}
              </button>
            ))}
          </div>

          <div className="glass-panel p-4 space-y-1">
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 size={13} className="text-accent-gold" />
              <h4 className="text-xs font-mono text-text-muted uppercase tracking-wider">Mains {mainsGS} — High-Frequency Topics</h4>
            </div>
            {(PAST_TRENDS.mains[mainsGS] || []).map((item, i) => (
              <div key={i} className="py-2.5 border-b border-bg-border last:border-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[10px] font-mono text-text-muted w-4 shrink-0">{i + 1}</span>
                  <p className="text-sm font-medium text-text-primary flex-1">{item.topic}</p>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full shrink-0"
                    style={{
                      background: item.freq === "High" ? "var(--accent-green-dim)" : item.freq === "Rising" ? "var(--accent-gold-dim)" : "var(--bg-muted)",
                      color: item.freq === "High" ? "var(--accent-green)" : item.freq === "Rising" ? "var(--accent-gold)" : "var(--text-muted)",
                    }}>
                    {item.freq}
                  </span>
                </div>
                <div className="ml-5">
                  <p className="text-[10px] font-mono text-text-muted">{item.years} · {item.notes}</p>
                  {aiInsight?.topic === item.topic ? (
                    <p className="text-[11px] text-text-secondary leading-relaxed mt-1">{aiInsight.text}</p>
                  ) : (
                    <button onClick={() => getAiInsight(item.topic)} disabled={aiLoading === item.topic}
                      className="flex items-center gap-1 text-[11px] font-mono mt-0.5 transition-colors"
                      style={{ color: "var(--accent-gold)" }}>
                      {aiLoading === item.topic ? <><RefreshCw size={9} className="animate-spin" />Loading…</> : <><Sparkles size={9} />AI Insight</>}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 5 — AI Answers Library
// ─────────────────────────────────────────────────────────────────────────────

function AIAnswersTab() {
  const [selected, setSelected] = useState("polity");
  const [aiAnswer, setAiAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const entry = STATIC_AI_ANSWERS[selected];

  const regenerate = async () => {
    setLoading(true); setAiAnswer(null);
    try {
      const res = await callAnthropicAPI(
        `You are an expert UPSC Mains answer writer. Write a complete model answer for the given question at AIR 1-10 standard. Include bold headings (**text**), clear structure (Introduction, Body with sub-headings, Way Forward, Conclusion), data points, Articles/Acts/Committee names where relevant. Aim for 300 words for 15M questions.`,
        `Paper: ${entry.paper}\nMarks: ${entry.marks}\nQuestion: ${entry.q}`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      setAiAnswer(text);
    } catch {
      setAiAnswer(null);
    } finally {
      setLoading(false);
    }
  };

  const displayAnswer = aiAnswer || entry.answer;

  const copy = () => {
    navigator.clipboard.writeText(displayAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Topic selector */}
      <div className="flex flex-wrap gap-2">
        {Object.entries({ polity: "Polity (GS2)", ethics: "Ethics (GS4)", economy: "Economy (GS3)", gs1_society: "Society (GS1)" }).map(([k, label]) => (
          <button key={k} onClick={() => { setSelected(k); setAiAnswer(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              selected === k ? "font-semibold" : "text-text-muted hover:text-text-secondary hover:bg-bg-muted"
            }`}
            style={selected === k ? { background: "var(--accent-gold)", color: "var(--bg-base)" } : {}}>
            {label}
          </button>
        ))}
      </div>

      {/* Question card */}
      <div className="glass-panel p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded"
            style={{ background: "var(--accent-blue-dim)", color: "var(--accent-blue)" }}>{entry.paper}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded"
            style={{ background: "var(--accent-gold-dim)", color: "var(--accent-gold)" }}>{entry.marks}</span>
        </div>
        <p className="text-sm font-medium text-text-primary leading-relaxed">{entry.q}</p>
      </div>

      {/* Answer */}
      <div className="glass-panel p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenLine size={13} className="text-accent-gold" />
            <h4 className="text-xs font-mono text-text-muted uppercase tracking-wider">
              {aiAnswer ? "AI Generated Answer" : "Curated Model Answer"}
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copy} className="btn-ghost flex items-center gap-1 text-xs">
              {copied ? <CheckCheck size={11} className="text-accent-green" /> : <Copy size={11} />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button onClick={regenerate} disabled={loading}
              className="btn-ghost flex items-center gap-1 text-xs">
              {loading ? <><Cpu size={11} className="animate-spin" />Generating…</> : <><Sparkles size={11} />AI Rewrite</>}
            </button>
          </div>
        </div>
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-2 border-accent-gold/20 animate-ping" />
              <div className="absolute inset-2 rounded-full border-2 border-t-accent-gold border-accent-gold/10 animate-spin" />
            </div>
            <p className="text-xs font-mono text-text-muted">Writing model answer…</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayAnswer.split("\n").filter(Boolean).map((para, i) => {
              const isBold = para.startsWith("**") && para.includes("**");
              if (isBold) {
                const text = para.replace(/\*\*/g, "");
                return <p key={i} className="text-sm font-semibold text-text-primary mt-3">{text}</p>;
              }
              return <p key={i} className="text-sm text-text-primary leading-7">{para}</p>;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main AIFeatures page
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "evaluator",  label: "Answer Evaluator", icon: PenLine,    desc: "AI grades your Mains answers" },
  { id: "tracker",    label: "Syllabus Tracker",  icon: Brain,      desc: "Weakness/strength analysis" },
  { id: "revision",   label: "Revision Queue",    icon: RotateCcw,  desc: "Spaced repetition planner" },
  { id: "trends",     label: "Past Trends",       icon: TrendingUp, desc: "Topic frequency 2018–2024" },
  { id: "answers",    label: "AI Answers",         icon: BookOpen,   desc: "Model answers library" },
];

export default function AIFeatures({ serverAttempts = [] }) {
  const [activeTab, setActiveTab] = useState("evaluator");

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-6 space-y-5">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "var(--accent-gold-dim)", border: "1px solid rgba(245,158,11,0.2)" }}>
          <Sparkles size={17} className="text-accent-gold" />
        </div>
        <div>
          <h1 className="font-display text-lg font-semibold text-text-primary">AI Features</h1>
          <p className="text-[11px] font-mono text-text-muted">Powered by Claude · Falls back to curated data offline</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="overflow-x-auto -mx-3 px-3">
        <div className="flex gap-1 min-w-max pb-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
                  active ? "font-semibold" : "text-text-muted hover:text-text-secondary hover:bg-bg-muted"
                }`}
                style={active ? { background: "var(--accent-gold-dim)", color: "var(--accent-gold)", border: "1px solid rgba(245,158,11,0.2)" } : {}}>
                <Icon size={12} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "evaluator" && <AnswerEvaluatorTab />}
        {activeTab === "tracker"   && <SyllabusTrackerTab attempts={serverAttempts} />}
        {activeTab === "revision"  && <RevisionQueueTab attempts={serverAttempts} />}
        {activeTab === "trends"    && <PastTrendsTab />}
        {activeTab === "answers"   && <AIAnswersTab />}
      </div>
    </div>
  );
}