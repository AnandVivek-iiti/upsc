// components/QuestionStatsPanel.jsx
// ─── Question Stats Panel ─────────────────────────────────────────────────────
// Import in Dashboard.jsx and render inside the grid.
//
// Usage:
//   import QuestionStatsPanel from "../components/QuestionStatsPanel";
//   <QuestionStatsPanel />
//
// Reads from localStorage ("upsc-question-stats") written by useQuestionStats.
// No props needed — completely self-contained.

import { useState, useMemo } from "react";
import { BarChart2, CheckCircle, XCircle, Target, BookOpen, TrendingUp } from "lucide-react";

const STORAGE_KEY = "upsc-question-stats";

function loadAttempts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}").attempts || [];
  } catch {
    return [];
  }
}

// ── Mini bar ──────────────────────────────────────────────────────────────────
function MiniBar({ correct, wrong, total, color = "#4F8EF7" }) {
  const correctPct = total > 0 ? (correct / total) * 100 : 0;
  const wrongPct   = total > 0 ? (wrong   / total) * 100 : 0;
  return (
    <div className="flex h-2 rounded-full overflow-hidden bg-bg-muted w-full gap-px">
      {correctPct > 0 && (
        <div style={{ width: `${correctPct}%`, background: "#34d399" }} className="transition-all duration-500" />
      )}
      {wrongPct > 0 && (
        <div style={{ width: `${wrongPct}%`, background: "#f87171" }} className="transition-all duration-500" />
      )}
    </div>
  );
}

// ── Radial accuracy ring ──────────────────────────────────────────────────────
function AccuracyRing({ accuracy, size = 64 }) {
  const R    = (size / 2) - 6;
  const CIRC = 2 * Math.PI * R;
  const dash = CIRC * (accuracy / 100);
  const color = accuracy >= 70 ? "#34d399" : accuracy >= 45 ? "#fbbf24" : "#f87171";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
      <circle
        cx={size/2} cy={size/2} r={R}
        fill="none" stroke={color} strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${CIRC - dash}`}
        strokeDashoffset={CIRC / 4}
        style={{ transition: "stroke-dasharray .5s ease" }}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        style={{ fontSize: size * 0.22, fontWeight: 700, fill: color, fontFamily: "'DM Mono', monospace" }}>
        {accuracy}%
      </text>
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function QuestionStatsPanel() {
  const [attempts, setAttempts] = useState(loadAttempts);
  const [view, setView] = useState("overview"); // "overview" | "year" | "subject" | "recent"

  // Refresh from localStorage when panel mounts / tab is focused
  useState(() => {
    const refresh = () => setAttempts(loadAttempts());
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  });

  const summary = useMemo(() => {
    const total   = attempts.length;
    const correct = attempts.filter(a => a.result === "correct").length;
    const wrong   = total - correct;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { total, correct, wrong, accuracy };
  }, [attempts]);

  const diffBreakdown = useMemo(() => {
    const map = { Easy: { correct:0, wrong:0, total:0 }, Medium: { correct:0, wrong:0, total:0 }, Hard: { correct:0, wrong:0, total:0 } };
    for (const a of attempts) {
      const d = a.difficulty || "Medium";
      if (map[d]) { map[d].total++; map[d][a.result]++; }
    }
    return map;
  }, [attempts]);

  const yearBreakdown = useMemo(() => {
    const map = {};
    for (const a of attempts) {
      const y = a.year || "Unknown";
      if (!map[y]) map[y] = { correct:0, wrong:0, total:0 };
      map[y].total++; map[y][a.result]++;
    }
    // Sort by year desc
    return Object.entries(map)
      .sort(([a],[b]) => (b === "Unknown" ? -1 : a === "Unknown" ? 1 : Number(b) - Number(a)))
      .slice(0, 12);
  }, [attempts]);

  const subjectBreakdown = useMemo(() => {
    const map = {};
    for (const a of attempts) {
      const s = a.subject || "Unknown";
      if (!map[s]) map[s] = { correct:0, wrong:0, total:0 };
      map[s].total++; map[s][a.result]++;
    }
    return Object.entries(map).sort(([,a],[,b]) => b.total - a.total).slice(0, 8);
  }, [attempts]);

  const recent = attempts.slice(0, 8);

  const DIFF_META = {
    Easy:   { color: "#34d399", bg: "rgba(52,211,153,0.12)",  label: "Easy"   },
    Medium: { color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  label: "Medium" },
    Hard:   { color: "#f87171", bg: "rgba(248,113,113,0.12)", label: "Hard"   },
  };

  if (attempts.length === 0) {
    return (
      <div className="glass-panel p-4 space-y-3">
        <div className="flex items-center gap-2">
          <BarChart2 size={14} className="text-accent-gold" />
          <h3 className="text-sm font-display font-semibold text-text-primary">Question Analytics</h3>
        </div>
        <div className="py-6 text-center space-y-2">
          <p className="text-2xl">📊</p>
          <p className="text-xs font-mono text-text-muted">
            Start practising questions in Topic-wise<br />to see your performance analytics here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <BarChart2 size={14} className="text-accent-gold" />
          <h3 className="text-sm font-display font-semibold text-text-primary">Question Analytics</h3>
        </div>
        {/* Tab pills */}
        <div className="flex items-center bg-bg-muted rounded-lg p-0.5 gap-0.5">
          {[["overview","Overview"],["year","Year"],["subject","Subject"],["recent","Recent"]].map(([v,lbl]) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono transition-all ${
                view === v
                  ? "bg-accent-gold/20 text-accent-gold border border-accent-gold/30"
                  : "text-text-muted hover:text-text-secondary"
              }`}>{lbl}</button>
          ))}
        </div>
      </div>

      {/* ── Overview ── */}
      {view === "overview" && (
        <div className="space-y-4">
          {/* Top row: ring + 3 stats */}
          <div className="flex items-center gap-4">
            <AccuracyRing accuracy={summary.accuracy} size={72} />
            <div className="grid grid-cols-3 flex-1 gap-2">
              {[
                { label: "Solved",  value: summary.total,   icon: Target,       color: "text-accent-blue"  },
                { label: "Correct", value: summary.correct, icon: CheckCircle,  color: "text-accent-green" },
                { label: "Wrong",   value: summary.wrong,   icon: XCircle,      color: "text-red-400"      },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-bg-muted rounded-xl p-2.5 text-center">
                  <Icon size={12} className={`${color} mx-auto mb-1`} />
                  <p className="text-lg font-display font-bold text-text-primary leading-none">{value}</p>
                  <p className="text-[10px] font-mono text-text-muted mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty breakdown */}
          <div className="space-y-2">
            <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider">By Difficulty</p>
            {Object.entries(DIFF_META).map(([diff, meta]) => {
              const d = diffBreakdown[diff];
              if (d.total === 0) return null;
              const acc = Math.round((d.correct / d.total) * 100);
              return (
                <div key={diff} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ background: meta.color }} />
                      <span className="text-xs text-text-secondary">{meta.label}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono">
                      <span className="text-text-muted">{d.correct}/{d.total}</span>
                      <span style={{ color: meta.color }}>{acc}%</span>
                    </div>
                  </div>
                  <MiniBar correct={d.correct} wrong={d.wrong} total={d.total} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Year breakdown ── */}
      {view === "year" && (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-3">Year-wise Accuracy</p>
          {yearBreakdown.length === 0 ? (
            <p className="text-xs font-mono text-text-muted py-4 text-center">No data yet</p>
          ) : yearBreakdown.map(([year, d]) => {
            const acc = Math.round((d.correct / d.total) * 100);
            const color = acc >= 70 ? "#34d399" : acc >= 45 ? "#fbbf24" : "#f87171";
            return (
              <div key={year} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-text-secondary">{year}</span>
                  <div className="flex items-center gap-3 text-[11px] font-mono">
                    <span className="text-text-muted">{d.total} solved</span>
                    <span className="text-accent-green">{d.correct}✓</span>
                    <span className="text-red-400">{d.wrong}✗</span>
                    <span style={{ color, minWidth: 36, textAlign: "right" }}>{acc}%</span>
                  </div>
                </div>
                <MiniBar correct={d.correct} wrong={d.wrong} total={d.total} />
              </div>
            );
          })}
        </div>
      )}

      {/* ── Subject breakdown ── */}
      {view === "subject" && (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-3">Subject-wise Accuracy</p>
          {subjectBreakdown.length === 0 ? (
            <p className="text-xs font-mono text-text-muted py-4 text-center">No data yet</p>
          ) : subjectBreakdown.map(([subject, d]) => {
            const acc = Math.round((d.correct / d.total) * 100);
            const color = acc >= 70 ? "#34d399" : acc >= 45 ? "#fbbf24" : "#f87171";
            return (
              <div key={subject} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-text-secondary truncate max-w-[55%]">{subject}</span>
                  <div className="flex items-center gap-2 text-[11px] font-mono shrink-0">
                    <span className="text-text-muted">{d.total}</span>
                    <span className="text-accent-green">{d.correct}✓</span>
                    <span style={{ color, minWidth: 30, textAlign: "right" }}>{acc}%</span>
                  </div>
                </div>
                <MiniBar correct={d.correct} wrong={d.wrong} total={d.total} />
              </div>
            );
          })}
        </div>
      )}

      {/* ── Recent attempts ── */}
      {view === "recent" && (
        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-3">Last 8 Attempts</p>
          {recent.length === 0 ? (
            <p className="text-xs font-mono text-text-muted py-4 text-center">No attempts yet</p>
          ) : recent.map((a, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-bg-muted hover:bg-bg-border transition-colors">
              {a.result === "correct"
                ? <CheckCircle size={11} className="text-accent-green shrink-0 mt-0.5" />
                : <XCircle    size={11} className="text-red-400    shrink-0 mt-0.5" />
              }
              <span className="text-xs text-text-secondary flex-1 min-w-0 line-clamp-1">{a.questionText || "Question"}</span>
              <div className="flex items-center gap-1 shrink-0">
                {a.year && <span className="text-[10px] font-mono text-text-muted">{a.year}</span>}
                {a.difficulty && (
                  <span className="text-[10px] font-mono" style={{ color: DIFF_META[a.difficulty]?.color }}>
                    {a.difficulty[0]}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer: total solved badge */}
      <div className="pt-2 border-t border-bg-border flex items-center justify-between">
        <span className="text-[10px] font-mono text-text-muted">{summary.total} questions attempted</span>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-accent-green" />
          <span className="text-[10px] font-mono text-text-muted">{summary.correct} correct</span>
          <span className="inline-block w-2 h-2 rounded-full bg-red-400 ml-1" />
          <span className="text-[10px] font-mono text-text-muted">{summary.wrong} wrong</span>
        </div>
      </div>
    </div>
  );
}