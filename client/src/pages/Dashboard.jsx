import {
  Clock,
  TrendingUp,
  Zap,
  CheckCircle,
  Plus,
  ChevronRight,
  BookMarked,
  Brain,
  AlertCircle,
  Newspaper,
  PenLine,
  ListChecks,
  BarChart2,
  X,
  Flame,
  Target,
} from "lucide-react";
import { useState } from "react";
import { SYLLABUS, PAPER_ORDER, getPct } from "../data/syllabusData";
import AuthGate from "../components/AuthGate";

// ─── StatCard ────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, accent = false, iconColor }) {
  return (
    <div className={`glass-panel p-3 sm:p-4 flex flex-col gap-1 sm:gap-1.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-gold/30 ${accent ? "border-accent-gold/30 bg-accent-gold/5" : ""}`}>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Icon size={13} style={{ color: iconColor }} className={!iconColor ? (accent ? "text-accent-gold" : "text-text-secondary") : undefined} />
        <span className="text-[10px] sm:text-xs font-mono text-text-muted uppercase tracking-wider leading-tight">{label}</span>
      </div>
      <p className={`text-xl sm:text-2xl font-display font-bold ${accent ? "text-accent-gold" : "text-text-primary"}`}>{value}</p>
      {sub && <p className="text-[10px] sm:text-xs text-text-secondary">{sub}</p>}
    </div>
  );
}

// ─── HoursLogger ─────────────────────────────────────────
function HoursLogger({ onLog, todayHours }) {
  const [hours, setHours] = useState(todayHours);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!hours || hours < 0) return;
    setSaving(true);
    try {
      await onLog(parseFloat(hours), notes);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-panel p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Clock size={14} className="text-accent-blue" />
        <h3 className="text-sm font-display font-semibold text-text-primary">Log Today's Hours</h3>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative sm:w-28">
          <input
            type="number"
            min="0"
            max="16"
            step="0.5"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-full bg-bg-muted border border-bg-border rounded-lg px-3 py-2 text-text-primary font-mono text-sm focus:outline-none focus:border-accent-gold/50 transition-colors"
            placeholder="0.0"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted font-mono">hrs</span>
        </div>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="flex-1 bg-bg-muted border border-bg-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-gold/50 transition-colors"
          placeholder="Topics covered (optional)"
        />
        <button
          onClick={handleSave}
          disabled={saving || !hours}
          className="btn-primary flex items-center justify-center gap-1.5 whitespace-nowrap"
        >
          {saved ? <CheckCircle size={14} /> : <Plus size={14} />}
          {saving ? "Saving…" : saved ? "Saved!" : "Log"}
        </button>
      </div>
    </div>
  );
}

// ─── WeeklyBar ────────────────────────────────────────────
function WeeklyBar({ logs = [], targetHours = 8 }) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const log = logs.find((l) => l.date === dateStr);
    return { day: days[d.getDay()], hours: log?.hours || 0, isToday: i === 6 };
  });

  const maxH = Math.max(targetHours, ...weekData.map((d) => d.hours));

  return (
    <div className="glass-panel p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-accent-green" />
          <h3 className="text-sm font-display font-semibold text-text-primary">Weekly Hours</h3>
        </div>
        <span className="text-xs font-mono text-text-muted">Target: {targetHours}h/day</span>
      </div>
      <div className="flex items-end gap-1 sm:gap-1.5 h-20">
        {weekData.map(({ day, hours, isToday }) => {
          const pct = maxH > 0 ? (hours / maxH) * 100 : 0;
          return (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full relative flex flex-col justify-end" style={{ height: "60px" }}>
                <div
                  className={`w-full rounded-t transition-all duration-500 ${isToday ? "bg-accent-gold"
                      : hours >= targetHours ? "bg-accent-green/60"
                        : hours > 0 ? "bg-accent-blue/40"
                          : "bg-bg-muted"
                    }`}
                  style={{ height: `${Math.max(pct, hours > 0 ? 8 : 3)}%` }}
                />
                <div
                  className="absolute w-full border-t border-dashed border-text-muted/30"
                  style={{ bottom: `${(targetHours / maxH) * 100}%` }}
                />
              </div>
              <span className={`text-[9px] sm:text-[10px] font-mono ${isToday ? "text-accent-gold" : "text-text-muted"}`}>{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── RevisionQueue ────────────────────────────────────────
function RevisionQueue({ syllabusData }) {
  const dueItems = [];

  for (const stage of ["prelims", "mains"]) {
    const stagePapers = syllabusData?.[stage];
    if (!stagePapers) continue;
    for (const [paperKey, paper] of Object.entries(SYLLABUS[stage])) {
      const userPaper = stagePapers[paperKey];
      if (!userPaper) continue;
      for (const [modName, mod] of Object.entries(userPaper.modules)) {
        if (mod.status === "done" || mod.status === "revision") {
          dueItems.push({
            paper: paper.label.replace("Paper ", "P").split("—")[0].trim(),
            module: modName,
            status: mod.status,
            progress: mod.progress,
          });
        }
      }
    }
  }

  return (
    <div className="glass-panel p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Brain size={14} className="text-accent-purple" />
        <h3 className="text-sm font-display font-semibold text-text-primary">Revision Queue</h3>
        {dueItems.length > 0 && (
          <span className="label-tag text-accent-purple border-accent-purple/30 bg-accent-purple/10 ml-auto">
            {dueItems.length} due
          </span>
        )}
      </div>
      {dueItems.length === 0 ? (
        <p className="text-xs text-text-muted font-mono py-2">
          Mark topics as "done" or "needs revision" in the Syllabus Tracker to populate the queue.
        </p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {dueItems.map(({ paper, module, status, progress }) => (
            <div
              key={`${paper}-${module}`}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-bg-muted hover:bg-bg-border transition-colors cursor-pointer group"
            >
              <BookMarked size={12} className="text-text-muted shrink-0" />
              <span className="text-xs text-text-secondary font-body flex-1 truncate min-w-0">{module}</span>
              <span className={`label-tag shrink-0 ${status === "revision"
                  ? "text-orange-400 border-orange-400/30 bg-orange-400/10"
                  : "text-accent-green border-accent-green/30 bg-accent-green/10"
                }`}>
                {status === "revision" ? "revise" : "done"}
              </span>
              <span className="text-[10px] font-mono text-text-muted shrink-0 hidden sm:inline">{paper}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TodayPlanner ─────────────────────────────────────────
function TodayPlanner() {
  const storageKey = `upsc-tasks-${new Date().toISOString().split("T")[0]}`;
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { return []; }
  });
  const [input, setInput] = useState("");

  const save = (next) => {
    setTasks(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const add = () => {
    if (!input.trim()) return;
    save([...tasks, { text: input.trim(), done: false }]);
    setInput("");
  };

  const toggle = (i) => save(tasks.map((t, idx) => idx === i ? { ...t, done: !t.done } : t));
  const remove = (i) => save(tasks.filter((_, idx) => idx !== i));
  const done = tasks.filter((t) => t.done).length;

  return (
    <div className="glass-panel p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks size={14} className="text-accent-gold" />
          <h3 className="text-sm font-display font-semibold text-text-primary">Today's Tasks</h3>
        </div>
        {tasks.length > 0 && (
          <span className="text-[11px] font-mono text-text-muted">{done}/{tasks.length}</span>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") add(); }}
          placeholder="Add a task for today..."
          className="flex-1 min-w-0 bg-bg-muted border border-bg-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-gold/50 transition-colors"
        />
        <button onClick={add} className="btn-primary flex items-center gap-1 px-3"><Plus size={14} /></button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-xs text-text-muted font-mono">No tasks yet. Add your study goals for today.</p>
      ) : (
        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
          {tasks.map((t, i) => (
            <div key={i} className="flex items-center gap-2 group">
              <button
                onClick={() => toggle(i)}
                className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${t.done ? "bg-accent-green border-accent-green/60" : "border-bg-border hover:border-accent-gold/40"}`}
              >
                {t.done && <CheckCircle size={10} className="text-white" />}
              </button>
              <span className={`text-xs flex-1 min-w-0 ${t.done ? "line-through text-text-muted" : "text-text-secondary"}`}>
                {t.text}
              </span>
              <button
                onClick={() => remove(i)}
                className="opacity-0 group-hover:opacity-60 hover:opacity-100 text-text-muted hover:text-red-400 transition-all shrink-0"
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CurrentAffairsLog ────────────────────────────────────
const CA_CATEGORIES = ["Polity", "Economy", "Environment", "Science & Tech", "International", "Society", "Security", "Geography"];

function CurrentAffairsLog() {
  const storageKey = "upsc-ca-log";
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { return []; }
  });
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState(CA_CATEGORIES[0]);
  const [adding, setAdding] = useState(false);

  const save = (next) => {
    setEntries(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const add = () => {
    if (!topic.trim()) return;
    save([{ topic: topic.trim(), category, date: new Date().toISOString().split("T")[0] }, ...entries]);
    setTopic("");
    setAdding(false);
  };

  const recent = entries.slice(0, 6);

  return (
    <div className="glass-panel p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper size={14} className="text-accent-blue" />
          <h3 className="text-sm font-display font-semibold text-text-primary">Current Affairs</h3>
        </div>
        <button onClick={() => setAdding((v) => !v)} className="btn-ghost border border-bg-border text-xs">
          {adding ? "Cancel" : "+ Add"}
        </button>
      </div>

      {adding && (
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-bg-muted border border-bg-border rounded-lg px-2 py-1.5 text-text-primary text-xs focus:outline-none focus:border-accent-gold/50"
          >
            {CA_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input
            autoFocus
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") add(); }}
            placeholder="Topic / headline..."
            className="flex-1 min-w-0 bg-bg-muted border border-bg-border rounded-lg px-3 py-1.5 text-text-primary text-sm focus:outline-none focus:border-accent-gold/50"
          />
          <button onClick={add} className="btn-primary text-xs">Save</button>
        </div>
      )}

      {entries.length === 0 ? (
        <p className="text-xs text-text-muted font-mono">Log news topics you've covered today.</p>
      ) : (
        <div className="space-y-1.5">
          {recent.map((e, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="label-tag text-accent-blue border-accent-blue/30 bg-accent-blue/10 shrink-0 hidden sm:inline">{e.category}</span>
              <span className="text-text-secondary flex-1 truncate min-w-0">{e.topic}</span>
              <span className="font-mono text-text-muted shrink-0">{e.date}</span>
            </div>
          ))}
          {entries.length > 6 && (
            <p className="text-[11px] font-mono text-text-muted">+{entries.length - 6} more</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── AnswerWritingTracker ─────────────────────────────────
function AnswerWritingTracker() {
  const storageKey = "upsc-answer-log";
  const [logs, setLogs] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { return []; }
  });
  const [question, setQuestion] = useState("");
  const [paper, setPaper] = useState("GS1");
  const [adding, setAdding] = useState(false);

  const paperOptions = ["Essay", "GS1", "GS2", "GS3", "GS4", "Optional"];

  const save = (next) => {
    setLogs(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const add = () => {
    if (!question.trim()) return;
    save([{ question: question.trim(), paper, date: new Date().toISOString().split("T")[0], wordCount: 0 }, ...logs]);
    setQuestion("");
    setAdding(false);
  };

  const thisWeek = logs.filter((l) => {
    const diff = (new Date() - new Date(l.date)) / 86400000;
    return diff <= 7;
  }).length;

  return (
    <div className="glass-panel p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PenLine size={14} className="text-accent-purple" />
          <h3 className="text-sm font-display font-semibold text-text-primary">Answer Writing</h3>
          <span className="label-tag text-accent-purple border-accent-purple/30 bg-accent-purple/10">{thisWeek}/wk</span>
        </div>
        <button onClick={() => setAdding((v) => !v)} className="btn-ghost border border-bg-border text-xs">
          {adding ? "Cancel" : "+ Log"}
        </button>
      </div>

      {adding && (
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={paper}
            onChange={(e) => setPaper(e.target.value)}
            className="bg-bg-muted border border-bg-border rounded-lg px-2 py-1.5 text-text-primary text-xs focus:outline-none focus:border-accent-gold/50"
          >
            {paperOptions.map((p) => <option key={p}>{p}</option>)}
          </select>
          <input
            autoFocus
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") add(); }}
            placeholder="Question or topic answered..."
            className="flex-1 min-w-0 bg-bg-muted border border-bg-border rounded-lg px-3 py-1.5 text-text-primary text-sm focus:outline-none focus:border-accent-gold/50"
          />
          <button onClick={add} className="btn-primary text-xs">Save</button>
        </div>
      )}

      {logs.length === 0 ? (
        <p className="text-xs text-text-muted font-mono">Track every answer you write. Aim for 2–3 daily.</p>
      ) : (
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {logs.slice(0, 5).map((l, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="label-tag text-accent-purple border-accent-purple/30 bg-accent-purple/10 shrink-0">{l.paper}</span>
              <span className="text-text-secondary flex-1 truncate min-w-0">{l.question}</span>
              <span className="font-mono text-text-muted shrink-0 hidden sm:inline">{l.date}</span>
            </div>
          ))}
          {logs.length > 5 && (
            <p className="text-[11px] font-mono text-text-muted">+{logs.length - 5} more answers</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── PaperProgress ────────────────────────────────────────
function PaperProgress({ syllabusData }) {
  const rows = [];

  for (const stage of ["prelims", "mains"]) {
    const stagePapers = syllabusData?.[stage];
    if (!stagePapers) continue;
    for (const paperKey of PAPER_ORDER[stage]) {
      const meta = SYLLABUS[stage][paperKey];
      const userPaper = stagePapers[paperKey];
      if (!meta || !userPaper) continue;
      const pct = getPct(userPaper.modules);
      rows.push({ label: meta.label.split("—")[1]?.trim() || meta.label, color: meta.color, pct });
    }
  }

  return (
    <div className="glass-panel p-4 space-y-3">
      <div className="flex items-center gap-2">
        <BarChart2 size={14} className="text-accent-gold" />
        <h3 className="text-sm font-display font-semibold text-text-primary">Paper Coverage</h3>
      </div>
      {rows.length === 0 ? (
        <p className="text-xs text-text-muted font-mono py-2">Mark progress in the Syllabus Tracker to see coverage here.</p>
      ) : (
        <div className="space-y-2">
          {rows.map(({ label, color, pct }) => (
            <div key={label} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-secondary truncate max-w-[70%]">{label}</span>
                <span className="text-[11px] font-mono text-text-muted">{pct}%</span>
              </div>
              <div className="h-1.5 bg-bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────
export default function Dashboard({ userData, todayHours, weekAvgHours, overallProgress, onLogHours, user, onNavigateAuth }) {
  if (!user) return <AuthGate feature="Dashboard" onNavigateAuth={onNavigateAuth} />;
  const dailyLogs = userData?.daily_logs || [];
  const targetHours = userData?.profile?.daily_target_hours || 8;
  const streak = userData?.profile?.streak || 0;
  const longestStreak = userData?.profile?.longest_streak || 0;
  const totalAnswers = userData?.answers?.length || 0;
  const hoursGap = Math.max(0, targetHours - todayHours).toFixed(1);
  // syllabusData from server is shaped { prelims: {...}, mains: {...} }
  const syllabusData = userData?.syllabus || null;

  return (
    <div className="overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-5 animate-fade-in">

      {/* ── Section header (no date — already in Hero) */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="font-display font-bold text-lg sm:text-xl text-text-primary">Command Center</h2>
          <p className="text-xs text-text-secondary mt-0.5">Progress, revision, and daily momentum.</p>
        </div>
        <div className="flex items-center gap-2">
          {todayHours < targetHours ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
              <AlertCircle size={12} className="text-orange-400" />
              <span className="text-xs font-mono text-orange-400">{hoursGap}h remaining</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-green/10 border border-accent-green/20">
              <CheckCircle size={12} className="text-accent-green" />
              <span className="text-xs font-mono text-accent-green">Target met!</span>
            </div>
          )}
        </div>
      </div>

      {/* ── 6 stat cards — single source of truth ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        <StatCard icon={Clock}   label="Today"    value={`${todayHours}h`}       sub={`Target: ${targetHours}h`} accent={todayHours >= targetHours} />
        <StatCard icon={TrendingUp} label="7-Day Avg" value={`${weekAvgHours}h`} sub="Per day" />
        <StatCard icon={Flame}   label="Streak"   value={`${streak}d`}           sub={`Best: ${longestStreak}d`} iconColor="#fb923c" />
        <StatCard icon={BookMarked} label="Answers" value={totalAnswers}          sub="Written" />
        <StatCard icon={BarChart2} label="Coverage" value={`${Math.round(overallProgress)}%`} sub="Syllabus" iconColor="#C9A84C" />
        <StatCard icon={Target}  label="GS1 Done" value={`${getPct(syllabusData?.mains?.GS1?.modules || {})}%`} sub="GS1 modules" iconColor="#4ade80" />
      </div>

      {/* ── Overall progress bar */}
      <div className="glass-panel p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-text-secondary uppercase tracking-wider">Overall Coverage</span>
          <span className="text-sm font-display font-bold text-text-primary">{Math.round(overallProgress)}%</span>
        </div>
        <div className="h-2 bg-bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-gold to-yellow-400 rounded-full transition-all duration-700"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <p className="text-xs text-text-muted font-mono">
          {overallProgress < 10 ? "Day one. The journey begins."
            : overallProgress < 40 ? "Foundation phase. Keep the momentum."
              : overallProgress < 70 ? "Solid coverage. Depth work begins now."
                : "Advanced stage. Revision and PYQ analysis."}
        </p>
      </div>

      {/* ── Today's planner + Current Affairs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TodayPlanner />
        <CurrentAffairsLog />
      </div>

      {/* ── Answer writing + Revision queue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <AnswerWritingTracker />
        <RevisionQueue syllabusData={syllabusData} />
      </div>

      {/* ── Weekly bar + Paper-wise progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <WeeklyBar logs={dailyLogs} targetHours={targetHours} />
        <PaperProgress syllabusData={syllabusData} />
      </div>

      {/* ── Hours logger */}
      <HoursLogger onLog={onLogHours} todayHours={todayHours} />
    </div>
  );
}