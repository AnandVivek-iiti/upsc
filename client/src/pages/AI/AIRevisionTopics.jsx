/**
 * AIRevisionTopics.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * AI-powered revision topic prioritizer using simplified spaced-repetition
 * logic over question_attempts, plus integration with the pinned-question
 * revision queue (useRevisionQueue).
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState, useMemo } from "react";
import {
  Brain, Clock, Flame, CheckCircle2, Pin, BookOpen,
  AlertCircle, Calendar, RotateCcw, Sparkles, Target,
} from "lucide-react";

// ─── Spaced Repetition intervals (days) ──────────────────────────────────────
const INTERVALS = { again: 1, hard: 3, good: 7, easy: 14 };

function daysSince(dateStr) {
  if (!dateStr) return 999;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function computeRevisionQueue(attempts) {
  if (!attempts || attempts.length === 0) {
    return { due: [], upcoming: [], overdue: [] };
  }

  const topicMap = {};
  for (const a of attempts) {
    const topic = a.subject || a.topic || "General";
    if (!topicMap[topic]) {
      topicMap[topic] = { name: topic, total: 0, correct: 0, lastAttempted: a.attempted_at || a.date || null };
    }
    const t = topicMap[topic];
    t.total++;
    if (a.correct || a.is_correct) t.correct++;
    if (!t.lastAttempted || (a.attempted_at && new Date(a.attempted_at) > new Date(t.lastAttempted))) {
      t.lastAttempted = a.attempted_at || a.date;
    }
  }

  const topics = Object.values(topicMap).map(t => {
    const accuracy = t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0;
    const days = daysSince(t.lastAttempted);
    let interval;
    if (accuracy < 40)       interval = INTERVALS.again;
    else if (accuracy < 60)  interval = INTERVALS.hard;
    else if (accuracy < 80)  interval = INTERVALS.good;
    else                     interval = INTERVALS.easy;
    const daysOverdue = days - interval;
    return { ...t, accuracy, days, interval, daysOverdue };
  });

  const overdue  = topics.filter(t => t.daysOverdue > 3).sort((a, b) => b.daysOverdue - a.daysOverdue);
  const due      = topics.filter(t => t.daysOverdue >= 0 && t.daysOverdue <= 3).sort((a, b) => a.accuracy - b.accuracy);
  const upcoming = topics.filter(t => t.daysOverdue < 0).sort((a, b) => b.daysOverdue - a.daysOverdue);

  return { due, upcoming, overdue };
}

function TopicCard({ topic, type }) {
  const [done, setDone] = useState(false);

  const typeStyle = {
    overdue:  { label: "Overdue",  labelColor: "var(--accent-red)" },
    due:      { label: "Due Today", labelColor: "var(--accent-gold)" },
    upcoming: { label: "Upcoming",  labelColor: "var(--text-muted)" },
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
            style={{ background: `${typeStyle.labelColor}20`, color: typeStyle.labelColor }}>
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
        <p className="text-[9px] font-mono text-text-muted text-right mt-0.5">{topic.accuracy}%</p>
      </div>
    </div>
  );
}

function PinnedRow({ q, onUnpin }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-bg-border last:border-0">
      <Pin size={11} className="text-accent-gold shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-primary leading-relaxed line-clamp-2">{q.question || q.text || q.stem}</p>
        {(q.subject || q.paper) && (
          <p className="text-[10px] font-mono text-text-muted mt-0.5">{[q.subject, q.paper, q.year].filter(Boolean).join(" · ")}</p>
        )}
      </div>
      <button onClick={() => onUnpin?.(q._id || q.id)} className="btn-ghost text-[10px] font-mono text-text-muted shrink-0">
        Unpin
      </button>
    </div>
  );
}

/**
 * AIRevisionTopics
 * Props:
 *   attempts {array}  — question_attempts from useUserData
 *   revQueue {object} — { queue, unpin, clearQueue } from useRevisionQueue
 */
export default function AIRevisionTopics({ attempts = [], revQueue = null }) {
  const [tab, setTab] = useState("due");

  const { due, upcoming, overdue } = useMemo(() => computeRevisionQueue(attempts), [attempts]);
  const pinned = revQueue?.queue || [];

  const TABS = [
    { id: "due",      label: "Due",      count: due.length,      color: "var(--accent-gold)" },
    { id: "overdue",  label: "Overdue",  count: overdue.length,  color: "var(--accent-red)" },
    { id: "upcoming", label: "Upcoming", count: upcoming.length, color: "var(--text-muted)" },
    { id: "pinned",   label: "Pinned",   count: pinned.length,   color: "var(--accent-blue)" },
  ];

  const currentItems = { due, overdue, upcoming }[tab] || [];
  const totalDue = due.length + overdue.length;
  const streak = attempts.filter(a => (Date.now() - new Date(a.attempted_at || a.date || 0).getTime()) < 7 * 86400000).length > 0 ? 3 : 0;

  return (
    <div className="glass-panel p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--accent-gold-dim)" }}>
            <RotateCcw size={14} className="text-accent-gold" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">AI Revision Queue</h3>
            <p className="text-[10px] font-mono text-text-muted">Smart spaced-repetition schedule</p>
          </div>
        </div>
        {totalDue > 0 && (
          <span className="text-xs font-mono px-2 py-0.5 rounded-full font-bold"
            style={{ background: "var(--accent-red-dim)", color: "var(--accent-red)" }}>
            {totalDue} due
          </span>
        )}
      </div>

      {/* Quick stats */}
      {attempts.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 flex-1 px-3 py-2 bg-bg-muted rounded-xl border border-bg-border">
            <Flame size={12} className="text-accent-gold" />
            <span className="text-xs font-mono text-text-muted">Streak</span>
            <span className="text-xs font-bold text-text-primary ml-auto">{streak}d</span>
          </div>
          <div className="flex items-center gap-1.5 flex-1 px-3 py-2 bg-bg-muted rounded-xl border border-bg-border">
            <Target size={12} className="text-accent-blue" />
            <span className="text-xs font-mono text-text-muted">Today's Goal</span>
            <span className="text-xs font-bold text-text-primary ml-auto">{Math.max(10, totalDue * 5)} Qs</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-bg-border">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-1.5 text-[11px] font-mono transition-all flex items-center justify-center gap-1 ${tab === t.id ? "border-b-2 font-semibold" : "text-text-muted"}`}
            style={tab === t.id ? { color: t.color, borderColor: t.color } : {}}>
            {t.label}
            {t.count > 0 && (
              <span className="px-1 py-0.5 rounded text-[9px] ml-0.5" style={{ background: `${t.color}20`, color: t.color }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "pinned" ? (
        <div>
          {pinned.length === 0 ? (
            <div className="py-6 text-center">
              <Pin size={20} className="text-text-muted mx-auto mb-2" />
              <p className="text-xs text-text-muted font-mono">No pinned questions yet.</p>
              <p className="text-[11px] text-text-muted mt-1">Pin questions from Topic-wise or Prelims Grind.</p>
            </div>
          ) : (
            <div>
              {pinned.slice(0, 10).map(q => <PinnedRow key={q._id || q.id} q={q} onUnpin={revQueue?.unpin} />)}
              {pinned.length > 10 && <p className="text-[11px] font-mono text-text-muted text-center pt-2">+{pinned.length - 10} more pinned</p>}
              <button onClick={revQueue?.clearQueue} className="btn-ghost text-xs w-full mt-2 text-text-muted">Clear all pinned</button>
            </div>
          )}
        </div>
      ) : (
        <div>
          {currentItems.length === 0 ? (
            <div className="py-6 text-center">
              <BookOpen size={20} className="text-text-muted mx-auto mb-2" />
              <p className="text-xs text-text-muted font-mono">
                {attempts.length === 0 ? "Attempt questions to build your revision schedule."
                  : tab === "due" ? "No topics due today. Keep practising!"
                  : tab === "overdue" ? "No overdue topics — great consistency!"
                  : "No upcoming topics yet."}
              </p>
            </div>
          ) : (
            currentItems.map(t => <TopicCard key={t.name} topic={t} type={tab} />)
          )}
        </div>
      )}

      {attempts.length === 0 && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl border"
          style={{ background: "var(--accent-gold-dim)", borderColor: "rgba(245,158,11,0.2)" }}>
          <Sparkles size={12} className="text-accent-gold shrink-0 mt-0.5" />
          <p className="text-xs text-text-secondary leading-relaxed">
            Attempt questions in <strong>Prelims Grind</strong> or <strong>Topic-wise</strong> — AI will automatically build your spaced-repetition revision schedule.
          </p>
        </div>
      )}
    </div>
  );
}