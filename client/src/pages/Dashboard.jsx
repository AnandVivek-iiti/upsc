import {
  Clock,
  TrendingUp,
  CheckCircle,
  Plus,
  BookMarked,
  Brain,
  Newspaper,
  PenLine,
  ListChecks,
  BarChart2,
  X,
  Flame,
  Target,
  Play,
  Pause,
  RotateCcw,
  Timer,
  Cloud,
  CloudOff,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { SYLLABUS, PAPER_ORDER, getPct } from "../data/syllabusData";
import AuthGate from "../components/ui/AuthGate";
import timerStore from "../hooks/timerStore";
import QuestionStatsPanel from "../components/QuestionStatsPanel";
import { AvatarCircle } from "./ProfilePage";

// ─── Tiny helpers ──────────────────────────────────────────────────────────────
function todayKey() {
  return new Date().toISOString().split("T")[0];
}
function secsToHours(secs) {
  return parseFloat((secs / 3600).toFixed(2));
}
function fmtTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─── StudyTimer ────────────────────────────────────────────────────────────────
// Subscribes to timerStore (a module-level singleton) so the interval keeps
// ticking even when the user navigates to another page and this component
// unmounts. On remount it simply reads the current store state — no restart.
function StudyTimer({ onLogHours, onSynced, targetHours = 8, serverHours = 0 }) {
  // Initialise directly from the singleton so we never show stale values
  const [elapsed, setElapsed] = useState(timerStore.elapsed);
  const [running, setRunning] = useState(timerStore.running);
  const [syncState, setSyncState] = useState("idle");
  const lastSyncRef = { current: serverHours };

  // ── Subscribe to store ticks ──────────────────────────────────────────────
  // The subscription fires every second while running and on start/pause/reset.
  // Returning the unsubscribe fn cleans up without stopping the store interval.
  useEffect(() => {
    // Immediately sync state in case the timer was already running
    setElapsed(timerStore.elapsed);
    setRunning(timerStore.running);

    const unsub = timerStore.subscribe(({ elapsed: e, running: r }) => {
      setElapsed(e);
      setRunning(r);
    });
    return unsub;
  }, []);

  // ── Seed from server once (only if localStorage has nothing yet today) ────
  useEffect(() => {
    timerStore.seedFromServer(serverHours);
    if (serverHours > 0) {
      lastSyncRef.current = serverHours;
      onSynced?.(serverHours);
    }
  }, [serverHours]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync to backend ───────────────────────────────────────────────────────
  const syncToServer = useCallback(
    async (secs) => {
      const hours = secsToHours(secs);
      if (hours === lastSyncRef.current) return;
      lastSyncRef.current = hours;
      setSyncState("syncing");
      try {
        await onLogHours(hours, "Timer session");
        setSyncState("synced");
        onSynced?.(hours);
        setTimeout(() => setSyncState("idle"), 2500);
      } catch {
        setSyncState("error");
        setTimeout(() => setSyncState("idle"), 3000);
      }
    },
    [onLogHours, onSynced],
  );

  // ── Sync on tab hide / close ──────────────────────────────────────────────
  useEffect(() => {
    const onHide = () => {
      if (timerStore.running) syncToServer(timerStore.elapsed);
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [syncToServer]);

  // ── Controls ──────────────────────────────────────────────────────────────
  const handleStart = () => timerStore.start();
  const handlePause = () => {
    timerStore.pause();
    syncToServer(timerStore.elapsed);
  };
  const handleReset = () => timerStore.reset();

  // ── Derived display values ────────────────────────────────────────────────
  const TARGET_SECS = targetHours * 3600;
  const progress    = Math.min(elapsed / TARGET_SECS, 1);
  const R           = 54;
  const CIRC        = 2 * Math.PI * R;
  const dashOffset  = CIRC * (1 - progress);
  const ringColor   = running ? "#4ade80" : elapsed > 0 ? "#C9A84C" : "#374151";
  const statusLabel = running ? "Studying" : elapsed > 0 ? "Paused" : "Not started";
  const statusColor = running ? "#4ade80" : elapsed > 0 ? "#C9A84C" : "#6b7280";
  const leftSecs    = Math.max(0, TARGET_SECS - elapsed);

  return (
    <div className="glass-panel p-4 sm:p-5">
      {/* Header row */}
      <div className="flex items-center gap-2 mb-4">
        <Timer size={14} className="text-accent-gold" />
        <h3 className="text-sm font-display font-semibold text-text-primary">Study Timer</h3>

        {/* Sync indicator */}
        <span className="flex items-center gap-1 ml-2">
          {syncState === "syncing" && <Cloud size={11} className="text-text-muted animate-pulse" />}
          {syncState === "synced"  && <Cloud size={11} className="text-accent-green" />}
          {syncState === "error"   && <CloudOff size={11} className="text-red-400" />}
          <span
            className={`text-[10px] font-mono ${
              syncState === "synced" ? "text-accent-green"
              : syncState === "error" ? "text-red-400"
              : "text-text-muted"
            }`}
          >
            {syncState === "syncing" ? "saving…"
             : syncState === "synced" ? "saved"
             : syncState === "error"  ? "sync failed"
             : ""}
          </span>
        </span>

        {/* Status badge */}
        <span
          className="label-tag ml-auto"
          style={{
            color: statusColor,
            borderColor: `${statusColor}40`,
            background: `${statusColor}15`,
          }}
        >
          {statusLabel}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Circular progress ring */}
        <div className="relative shrink-0" style={{ width: 140, height: 140 }}>
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle
              cx="70" cy="70" r={R}
              fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"
            />
            <circle
              cx="70" cy="70" r={R}
              fill="none"
              stroke={ringColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 70 70)"
              style={{ transition: "stroke-dashoffset 1s linear, stroke 0.4s" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-xl font-bold text-text-primary tabular-nums">
              {fmtTime(elapsed)}
            </span>
            <span className="text-[10px] font-mono text-text-muted mt-0.5">
              {secsToHours(elapsed)}h studied
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 flex-1 w-full">
          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Today",  val: `${secsToHours(elapsed)}h` },
              { label: "Target", val: `${targetHours}h` },
              { label: "Left",   val: `${secsToHours(leftSecs)}h` },
            ].map(({ label, val }) => (
              <div key={label} className="bg-bg-muted rounded-lg p-2 text-center">
                <p className="text-[10px] font-mono text-text-muted uppercase">{label}</p>
                <p className="text-sm font-display font-bold text-text-primary mt-0.5">{val}</p>
              </div>
            ))}
          </div>

          {/* Hour blocks */}
          <div>
            <p className="text-[10px] font-mono text-text-muted mb-1.5 uppercase tracking-wider">
              Hours completed
            </p>
            <div className="flex gap-1">
              {Array.from({ length: targetHours }, (_, i) => {
                const filled  = elapsed >= (i + 1) * 3600;
                const partial = !filled && elapsed > i * 3600;
                const pct     = partial ? ((elapsed - i * 3600) / 3600) * 100 : 0;
                return (
                  <div key={i} className="relative h-5 rounded overflow-hidden bg-bg-muted flex-1">
                    {filled && (
                      <div className="absolute inset-0 bg-accent-green/70 rounded" />
                    )}
                    {partial && (
                      <div
                        className="absolute inset-y-0 left-0 rounded"
                        style={{
                          width: `${pct}%`,
                          background: running ? "#4ade80aa" : "#C9A84Caa",
                        }}
                      />
                    )}
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono text-text-muted z-10">
                      {i + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            {!running ? (
              <button
                onClick={handleStart}
                className="btn-primary flex items-center gap-1.5 flex-1 justify-center"
              >
                <Play size={13} fill="currentColor" />
                {elapsed > 0 ? "Resume" : "Start"}
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="flex items-center gap-1.5 flex-1 justify-center px-4 py-2 rounded-lg text-sm font-medium bg-accent-gold/15 text-accent-gold border border-accent-gold/30 hover:bg-accent-gold/25 transition-colors"
              >
                <Pause size={13} fill="currentColor" />
                Pause &amp; Save
              </button>
            )}
            <button
              onClick={handleReset}
              className="btn-ghost border border-bg-border flex items-center gap-1.5 px-3"
              title="Reset timer for today"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── StudyChart ────────────────────────────────────────────────────────────────
function StudyChart({ logs = [], targetHours = 8 }) {
  const [view, setView] = useState("weekly");

  const getHoursForDate = (dateStr) => {
    const serverHours = logs.find((l) => l.date === dateStr)?.hours || 0;
    if (dateStr !== todayKey()) return serverHours;
    try {
      const t = JSON.parse(
        localStorage.getItem(`upsc-timer-${dateStr}`) || "{}",
      );
      return Math.max(serverHours, secsToHours(t.elapsed || 0));
    } catch {
      return serverHours;
    }
  };

  const weeklyData = (() => {
    const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const dateStr = d.toISOString().split("T")[0];
      return {
        label:   DAY_NAMES[d.getDay()],
        hours:   getHoursForDate(dateStr),
        isToday: i === 6,
      };
    });
  })();

  const monthlyData = (() => {
    const today = new Date();
    const weeks = [];
    for (let w = 4; w >= 0; w--) {
      const days = Array.from({ length: 7 }, (_, d) => {
        const day = new Date(today);
        day.setDate(today.getDate() - w * 7 + d - 6);
        return day;
      }).filter((d) => d <= today);

      if (days.length === 0) continue;

      const start = days[0];
      const label = `${String(start.getDate()).padStart(2, "0")}/${String(
        start.getMonth() + 1,
      ).padStart(2, "0")}`;
      const total = parseFloat(
        days
          .reduce(
            (s, d) => s + getHoursForDate(d.toISOString().split("T")[0]),
            0,
          )
          .toFixed(1),
      );
      weeks.push({
        label,
        total,
        weekTarget: targetHours * days.length,
        isCurrent: w === 0,
      });
    }
    return weeks;
  })();

  const weeklyMax  = Math.max(targetHours, ...weeklyData.map((d) => d.hours), 0.1);
  const monthlyMax = Math.max(...monthlyData.map((d) => d.total), targetHours * 7, 0.1);

  return (
    <div className="glass-panel p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-accent-green" />
          <h3 className="text-sm font-display font-semibold text-text-primary">
            {view === "weekly" ? "Weekly Hours" : "Monthly Overview"}
          </h3>
        </div>
        <div className="flex items-center bg-bg-muted rounded-lg p-0.5 gap-0.5">
          {[
            ["weekly", "7D"],
            ["monthly", "30D"],
          ].map(([v, lbl]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all ${
                view === v
                  ? "bg-accent-gold/20 text-accent-gold border border-accent-gold/30"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {view === "weekly" ? (
        <div className="space-y-2">
          <div className="flex items-end gap-1 sm:gap-1.5 h-24">
            {weeklyData.map(({ label, hours, isToday }) => {
              const pct = (hours / weeklyMax) * 100;
              const met = hours >= targetHours;
              return (
                <div key={label} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] font-mono text-text-muted tabular-nums h-3">
                    {hours > 0 ? `${hours}h` : ""}
                  </span>
                  <div
                    className="w-full relative flex flex-col justify-end"
                    style={{ height: 60 }}
                  >
                    <div
                      className={`w-full rounded-t transition-all duration-500 ${
                        isToday
                          ? "bg-accent-gold"
                          : met
                          ? "bg-accent-green/70"
                          : hours > 0
                          ? "bg-accent-blue/50"
                          : "bg-bg-muted"
                      }`}
                      style={{ height: `${Math.max(pct, hours > 0 ? 6 : 2)}%` }}
                    />
                    <div
                      className="absolute w-full border-t border-dashed border-text-muted/30 pointer-events-none"
                      style={{ bottom: `${(targetHours / weeklyMax) * 100}%` }}
                    />
                  </div>
                  <span
                    className={`text-[9px] sm:text-[10px] font-mono ${
                      isToday ? "text-accent-gold" : "text-text-muted"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-mono text-text-muted">
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-sm bg-accent-gold" /> Today
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-sm bg-accent-green/70" /> Target met
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-sm bg-accent-blue/50" /> Partial
            </span>
            <span className="ml-auto">Target: {targetHours}h/day</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {monthlyData.map(({ label, total, weekTarget, isCurrent }) => {
            const pct = (total / monthlyMax) * 100;
            const met = total >= weekTarget;
            return (
              <div key={label} className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono ${
                        isCurrent ? "text-accent-gold" : "text-text-secondary"
                      }`}
                    >
                      w/o {label}
                    </span>
                    {isCurrent && (
                      <span className="label-tag text-accent-gold border-accent-gold/30 bg-accent-gold/10">
                        now
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono text-text-muted">{total}h</span>
                    {met && <CheckCircle size={10} className="text-accent-green" />}
                  </div>
                </div>
                <div className="h-2.5 bg-bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isCurrent
                        ? "bg-accent-gold"
                        : met
                        ? "bg-accent-green/70"
                        : total > 0
                        ? "bg-accent-blue/50"
                        : "bg-bg-muted"
                    }`}
                    style={{ width: `${Math.max(pct, total > 0 ? 2 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
          <p className="text-[10px] font-mono text-text-muted">
            Weekly target: {targetHours}h/day × days in week
          </p>
        </div>
      )}
    </div>
  );
}

// ─── StatCard ──────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, accent = false, iconColor }) {
  return (
    <div
      className={`glass-panel p-3 sm:p-4 flex flex-col gap-1 sm:gap-1.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-gold/30 ${
        accent ? "border-accent-gold/30 bg-accent-gold/5" : ""
      }`}
    >
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Icon
          size={13}
          style={{ color: iconColor }}
          className={!iconColor ? (accent ? "text-accent-gold" : "text-text-secondary") : undefined}
        />
        <span className="text-[10px] sm:text-xs font-mono text-text-muted uppercase tracking-wider leading-tight">
          {label}
        </span>
      </div>
      <p
        className={`text-xl sm:text-2xl font-display font-bold ${
          accent ? "text-accent-gold" : "text-text-primary"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-[10px] sm:text-xs text-text-secondary">{sub}</p>}
    </div>
  );
}

// ─── RevisionQueue ─────────────────────────────────────────────────────────────
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
          Mark topics as "done" or "needs revision" in Syllabus Tracker.
        </p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {dueItems.map(({ paper, module, status }) => (
            <div
              key={`${paper}-${module}`}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-bg-muted hover:bg-bg-border transition-colors"
            >
              <BookMarked size={12} className="text-text-muted shrink-0" />
              <span className="text-xs text-text-secondary font-body flex-1 truncate min-w-0">
                {module}
              </span>
              <span
                className={`label-tag shrink-0 ${
                  status === "revision"
                    ? "text-orange-400 border-orange-400/30 bg-orange-400/10"
                    : "text-accent-green border-accent-green/30 bg-accent-green/10"
                }`}
              >
                {status === "revision" ? "revise" : "done"}
              </span>
              <span className="text-[10px] font-mono text-text-muted shrink-0 hidden sm:inline">
                {paper}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TodayPlanner ──────────────────────────────────────────────────────────────
function TodayPlanner() {
  const SK = `upsc-tasks-${todayKey()}`;
  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SK) || "[]");
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const save = (next) => {
    setTasks(next);
    localStorage.setItem(SK, JSON.stringify(next));
  };
  const add = () => {
    if (!input.trim()) return;
    save([...tasks, { text: input.trim(), done: false }]);
    setInput("");
  };

  const done = tasks.filter((t) => t.done).length;
  return (
    <div className="glass-panel p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks size={14} className="text-accent-gold" />
          <h3 className="text-sm font-display font-semibold text-text-primary">Today's Tasks</h3>
        </div>
        {tasks.length > 0 && (
          <span className="text-[11px] font-mono text-text-muted">
            {done}/{tasks.length}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
          }}
          placeholder="Add a task for today..."
          className="flex-1 min-w-0 bg-bg-muted border border-bg-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-gold/50 transition-colors"
        />
        <button onClick={add} className="btn-primary flex items-center gap-1 px-3">
          <Plus size={14} />
        </button>
      </div>
      {tasks.length === 0 ? (
        <p className="text-xs text-text-muted font-mono">
          No tasks yet. Add your study goals for today.
        </p>
      ) : (
        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
          {tasks.map((t, i) => (
            <div key={i} className="flex items-center gap-2 group">
              <button
                onClick={() =>
                  save(tasks.map((x, j) => (j === i ? { ...x, done: !x.done } : x)))
                }
                className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
                  t.done
                    ? "bg-accent-green border-accent-green/60"
                    : "border-bg-border hover:border-accent-gold/40"
                }`}
              >
                {t.done && <CheckCircle size={10} className="text-white" />}
              </button>
              <span
                className={`text-xs flex-1 min-w-0 ${
                  t.done ? "line-through text-text-muted" : "text-text-secondary"
                }`}
              >
                {t.text}
              </span>
              <button
                onClick={() => save(tasks.filter((_, j) => j !== i))}
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

// ─── CurrentAffairsLog ─────────────────────────────────────────────────────────
const CA_CATS = [
  "Polity",
  "Economy",
  "Environment",
  "Science & Tech",
  "International",
  "Society",
  "Security",
  "Geography",
];

function CurrentAffairsLog() {
  const SK = "upsc-ca-log";
  const [entries, setEntries] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SK) || "[]");
    } catch {
      return [];
    }
  });
  const [topic, setTopic]   = useState("");
  const [cat, setCat]       = useState(CA_CATS[0]);
  const [adding, setAdding] = useState(false);

  const save = (next) => {
    setEntries(next);
    localStorage.setItem(SK, JSON.stringify(next));
  };
  const add = () => {
    if (!topic.trim()) return;
    save([{ topic: topic.trim(), category: cat, date: todayKey() }, ...entries]);
    setTopic("");
    setAdding(false);
  };

  return (
    <div className="glass-panel p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper size={14} className="text-accent-blue" />
          <h3 className="text-sm font-display font-semibold text-text-primary">Current Affairs</h3>
        </div>
        <button
          onClick={() => setAdding((v) => !v)}
          className="btn-ghost border border-bg-border text-xs"
        >
          {adding ? "Cancel" : "+ Add"}
        </button>
      </div>
      {adding && (
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="bg-bg-muted border border-bg-border rounded-lg px-2 py-1.5 text-text-primary text-xs focus:outline-none focus:border-accent-gold/50"
          >
            {CA_CATS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input
            autoFocus
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") add();
            }}
            placeholder="Topic / headline..."
            className="flex-1 min-w-0 bg-bg-muted border border-bg-border rounded-lg px-3 py-1.5 text-text-primary text-sm focus:outline-none focus:border-accent-gold/50"
          />
          <button onClick={add} className="btn-primary text-xs">
            Save
          </button>
        </div>
      )}
      {entries.length === 0 ? (
        <p className="text-xs text-text-muted font-mono">Log news topics you've covered today.</p>
      ) : (
        <div className="space-y-1.5">
          {entries.slice(0, 6).map((e, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="label-tag text-accent-blue border-accent-blue/30 bg-accent-blue/10 shrink-0 hidden sm:inline">
                {e.category}
              </span>
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

// ─── AnswerWritingTracker ──────────────────────────────────────────────────────
function AnswerWritingTracker() {
  const SK = "upsc-answer-log";
  const PAPERS = ["Essay", "GS1", "GS2", "GS3", "GS4", "Optional"];
  const [logs, setLogs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SK) || "[]");
    } catch {
      return [];
    }
  });
  const [q, setQ]           = useState("");
  const [paper, setPaper]   = useState("GS1");
  const [adding, setAdding] = useState(false);

  const save = (next) => {
    setLogs(next);
    localStorage.setItem(SK, JSON.stringify(next));
  };
  const add = () => {
    if (!q.trim()) return;
    save([{ question: q.trim(), paper, date: todayKey(), wordCount: 0 }, ...logs]);
    setQ("");
    setAdding(false);
  };

  const thisWeek = logs.filter((l) => (new Date() - new Date(l.date)) / 86400000 <= 7).length;
  return (
    <div className="glass-panel p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PenLine size={14} className="text-accent-purple" />
          <h3 className="text-sm font-display font-semibold text-text-primary">Answer Writing</h3>
          <span className="label-tag text-accent-purple border-accent-purple/30 bg-accent-purple/10">
            {thisWeek}/wk
          </span>
        </div>
        <button
          onClick={() => setAdding((v) => !v)}
          className="btn-ghost border border-bg-border text-xs"
        >
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
            {PAPERS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <input
            autoFocus
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") add();
            }}
            placeholder="Question or topic answered..."
            className="flex-1 min-w-0 bg-bg-muted border border-bg-border rounded-lg px-3 py-1.5 text-text-primary text-sm focus:outline-none focus:border-accent-gold/50"
          />
          <button onClick={add} className="btn-primary text-xs">
            Save
          </button>
        </div>
      )}
      {logs.length === 0 ? (
        <p className="text-xs text-text-muted font-mono">
          Track every answer you write. Aim for 2–3 daily.
        </p>
      ) : (
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {logs.slice(0, 5).map((l, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="label-tag text-accent-purple border-accent-purple/30 bg-accent-purple/10 shrink-0">
                {l.paper}
              </span>
              <span className="text-text-secondary flex-1 truncate min-w-0">{l.question}</span>
              <span className="font-mono text-text-muted shrink-0 hidden sm:inline">{l.date}</span>
            </div>
          ))}
          {logs.length > 5 && (
            <p className="text-[11px] font-mono text-text-muted">
              +{logs.length - 5} more answers
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── PaperProgress ─────────────────────────────────────────────────────────────
function PaperProgress({ syllabusData }) {
  const rows = [];
  for (const stage of ["prelims", "mains"]) {
    const stagePapers = syllabusData?.[stage];
    if (!stagePapers) continue;
    for (const paperKey of PAPER_ORDER[stage]) {
      const meta      = SYLLABUS[stage][paperKey];
      const userPaper = stagePapers[paperKey];
      if (!meta || !userPaper) continue;
      rows.push({
        label: meta.label.split("—")[1]?.trim() || meta.label,
        color: meta.color,
        pct: getPct(userPaper.modules),
      });
    }
  }
  return (
    <div className="glass-panel p-4 space-y-3">
      <div className="flex items-center gap-2">
        <BarChart2 size={14} className="text-accent-gold" />
        <h3 className="text-sm font-display font-semibold text-text-primary">Paper Coverage</h3>
      </div>
      {rows.length === 0 ? (
        <p className="text-xs text-text-muted font-mono py-2">
          Mark progress in Syllabus Tracker to see coverage.
        </p>
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

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard({
  userData,
  todayHours: serverTodayHours,
  weekAvgHours,
  overallProgress,
  onLogHours,
  user,
  onNavigateAuth,
  onNavigateProfile,
}) {
  if (!user) return <AuthGate feature="Dashboard" onNavigateAuth={onNavigateAuth} />;

  const [timerHours, setTimerHours] = useState(() => {
    try {
      const t = JSON.parse(
        localStorage.getItem(`upsc-timer-${todayKey()}`) || "{}",
      );
      return secsToHours(t.elapsed || 0);
    } catch {
      return 0;
    }
  });

  const serverHoursNum = parseFloat(serverTodayHours) || 0;
  const todayHours     = Math.max(serverHoursNum, timerHours);
  const targetHours    = userData?.profile?.daily_target_hours || 8;
  const streak         = userData?.profile?.streak || 0;
  const longestStreak  = userData?.profile?.longest_streak || 0;
  const totalAnswers   = userData?.answers?.length || 0;
  const syllabusData   = userData?.syllabus || null;
  const dailyLogs      = userData?.daily_logs || [];
  const userName       = userData?.profile?.name || user?.name || "";

  return (
    <div className="overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-5 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="font-display font-bold text-lg sm:text-xl text-text-primary">
            Command Center
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Progress, revision, and daily momentum.
          </p>
        </div>

        {/* Profile button — visible on both mobile and desktop */}
        {userName && (
          <button
            onClick={onNavigateProfile}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-bg-border bg-bg-surface hover:border-accent-gold/30 hover:bg-bg-muted transition-all duration-150 group"
            title="View profile"
          >
            <AvatarCircle name={userName} size="sm" />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-text-primary leading-tight truncate max-w-[120px]">
                {userName}
              </p>
              <p className="text-[10px] font-mono text-text-muted group-hover:text-accent-gold transition-colors">
                View profile
              </p>
            </div>
          </button>
        )}
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        <StatCard
          icon={Clock}
          label="Today"
          value={`${todayHours}h`}
          sub={`Target: ${targetHours}h`}
          accent={todayHours >= targetHours}
        />
        <StatCard icon={TrendingUp} label="7-Day Avg" value={`${weekAvgHours}h`} sub="Per day" />
        <StatCard
          icon={Flame}
          label="Streak"
          value={`${streak}d`}
          sub={`Best: ${longestStreak}d`}
          iconColor="#fb923c"
        />
        <StatCard icon={BookMarked} label="Answers" value={totalAnswers} sub="Written" />
        <StatCard
          icon={BarChart2}
          label="Coverage"
          value={`${Math.round(overallProgress)}%`}
          sub="Syllabus"
          iconColor="#C9A84C"
        />
        <StatCard
          icon={Target}
          label="GS1 Done"
          value={`${getPct(syllabusData?.mains?.GS1?.modules || {})}%`}
          sub="GS1 modules"
          iconColor="#4ade80"
        />
      </div>

      {/* ── Overall progress bar ── */}
      <div className="glass-panel p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-text-secondary uppercase tracking-wider">
            Overall Coverage
          </span>
          <span className="text-sm font-display font-bold text-text-primary">
            {Math.round(overallProgress)}%
          </span>
        </div>
        <div className="h-2 bg-bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-gold to-yellow-400 rounded-full transition-all duration-700"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <p className="text-xs text-text-muted font-mono">
          {overallProgress < 10
            ? "Day one. The journey begins."
            : overallProgress < 40
            ? "Foundation phase. Keep the momentum."
            : overallProgress < 70
            ? "Solid coverage. Depth work begins now."
            : "Advanced stage. Revision and PYQ analysis."}
        </p>
      </div>

      {/* ── Question Stats ── */}
      <QuestionStatsPanel />

      {/* ── Study Timer (persists across view changes via timerStore) ── */}
      <StudyTimer
        onLogHours={onLogHours}
        onSynced={setTimerHours}
        targetHours={targetHours}
        serverHours={serverHoursNum}
      />

      {/* ── Tasks + Current Affairs ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TodayPlanner />
        <CurrentAffairsLog />
      </div>

      {/* ── Answer Writing + Revision Queue ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <AnswerWritingTracker />
        <RevisionQueue syllabusData={syllabusData} />
      </div>

      {/* ── Study Chart + Paper Coverage ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <StudyChart logs={dailyLogs} targetHours={targetHours} />
        <PaperProgress syllabusData={syllabusData} />
      </div>

    </div>
  );
}