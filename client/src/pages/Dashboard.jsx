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
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { SYLLABUS, PAPER_ORDER, getPct } from "../data/syllabusData";
import AuthGate from "../components/ui/AuthGate";
import timerStore, { getUserTimerHours } from "../hooks/timerStore";
import QuestionStatsPanel from "../components/QuestionStats";
import { AvatarCircle } from "./ProfilePage";
import AIRevisionPanel from "../components/ui/AIRevisionPanel";
import { getISTDateString, getISTDay } from "../utils/dateUtils";

// ─── Tiny helpers ──────────────────────────────────────────────────────────────
function todayKey() {
  return getISTDateString();
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
// Formats seconds as "1h 28m" (or "28m" if under an hour) for display cards
function fmtHM(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
function pad2(n) {
  return String(n).padStart(2, "0");
}

// ─── Collapsible Section Wrapper ───────────────────────────────────────────────
function CollapsibleSection({ title, icon: Icon, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="glass-panel overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className="text-accent-gold" />}
          <h3 className="text-sm font-display font-semibold text-text-primary text-left">
            {title}
          </h3>
        </div>
        {isOpen ? (
          <ChevronUp size={16} className="text-text-muted shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-text-muted shrink-0" />
        )}
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="px-3 sm:px-4 pb-3 sm:pb-4">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── StudyTimer ────────────────────────────────────────────────────────────────
// Subscribes to timerStore (a module-level singleton) so the interval keeps
// ticking even when the user navigates to another page and this component
// unmounts. On remount it simply reads the current store state — no restart.
function StudyTimer({ onLogHours, onSynced, targetHours = 8, serverHours = 0 }) {
  // Initialise directly from the singleton so we never show stale values
  const [elapsed, setElapsed] = useState(timerStore.elapsed);
  const [running, setRunning] = useState(timerStore.running);
  const [remote, setRemote] = useState(timerStore.remote);
  const [syncState, setSyncState] = useState("idle");
  const [isCompact, setIsCompact] = useState(false);
  const lastSyncRef = { current: serverHours };

  // ── Responsive breakpoint detection ─────────────────────────────────────────
  useEffect(() => {
    const checkSize = () => setIsCompact(window.innerWidth < 380);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  // ── Subscribe to store ticks ──────────────────────────────────────────────
  useEffect(() => {
    // Immediately sync state in case the timer was already running
    setElapsed(timerStore.elapsed);
    setRunning(timerStore.running);

    const unsub = timerStore.subscribe(({ elapsed: e, running: r, remote: rm }) => {
      setElapsed(e);
      setRunning(r);
      if (rm) setRemote(rm);
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
  const R           = isCompact ? 45 : 54;
  const SVG_SIZE    = isCompact ? 110 : 140;
  const CIRC        = 2 * Math.PI * R;
  const dashOffset  = CIRC * (1 - progress);
  const ringColor   = running ? "#4ade80" : elapsed > 0 ? "#C9A84C" : "#374151";
  const statusLabel = running ? "Studying" : elapsed > 0 ? "Paused" : "Not started";
  const statusColor = running ? "#4ade80" : elapsed > 0 ? "#C9A84C" : "#6b7280";
  const leftSecs    = Math.max(0, TARGET_SECS - elapsed);

  return (
    <div className="glass-panel p-3 sm:p-5">
      {/* Header row */}
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Timer size={14} className="text-accent-gold shrink-0" />
        <h3 className="text-sm font-display font-semibold text-text-primary">Study Timer</h3>

        {/* Sync indicator */}
        <span className="flex items-center gap-1 ml-1 sm:ml-2">
          {syncState === "syncing" && <Cloud size={11} className="text-text-muted animate-pulse" />}
          {syncState === "synced"  && <Cloud size={11} className="text-accent-green" />}
          {syncState === "error"   && <CloudOff size={11} className="text-red-400" />}
          <span
            className={`text-[10px] font-mono hidden sm:inline ${
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

        {/* Cross-device live indicator */}
        {remote.active && (
          <span className="label-tag text-[10px] sm:text-xs text-accent-blue border-accent-blue/30 bg-accent-blue/10 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
            Studying on another device — {fmtHM(remote.elapsed)}
          </span>
        )}

        {/* Status badge */}
        <span
          className="label-tag ml-auto text-[10px] sm:text-xs"
          style={{
            color: statusColor,
            borderColor: `${statusColor}40`,
            background: `${statusColor}15`,
          }}
        >
          {statusLabel}
        </span>
      </div>

      <div className={`flex ${isCompact ? 'flex-col' : 'flex-col sm:flex-row'} items-center gap-4 sm:gap-6`}>
        {/* Circular progress ring */}
        <div className="relative shrink-0" style={{ width: SVG_SIZE, height: SVG_SIZE }}>
          <svg width={SVG_SIZE} height={SVG_SIZE} viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}>
            <circle
              cx={SVG_SIZE/2} cy={SVG_SIZE/2} r={R}
              fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"
            />
            <circle
              cx={SVG_SIZE/2} cy={SVG_SIZE/2} r={R}
              fill="none"
              stroke={ringColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${SVG_SIZE/2} ${SVG_SIZE/2})`}
              style={{ transition: "stroke-dashoffset 1s linear, stroke 0.4s" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-mono font-bold text-text-primary tabular-nums ${isCompact ? 'text-lg' : 'text-xl'}`}>
              {fmtTime(elapsed)}
            </span>
            <span className="text-[10px] font-mono text-text-muted mt-0.5">
              {fmtHM(elapsed)} studied
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 sm:gap-3 flex-1 w-full">
          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {[
              { label: "Today",  val: fmtHM(elapsed) },
              { label: "Target", val: `${targetHours}h` },
              { label: "Left",   val: fmtHM(leftSecs) },
            ].map(({ label, val }) => (
              <div key={label} className="bg-bg-muted rounded-lg p-1.5 sm:p-2 text-center">
                <p className="text-[9px] sm:text-[10px] font-mono text-text-muted uppercase">{label}</p>
                <p className="text-xs sm:text-sm font-display font-bold text-text-primary mt-0.5">{val}</p>
              </div>
            ))}
          </div>

          {/* Hour blocks */}
          <div>
            <p className="text-[10px] font-mono text-text-muted mb-1 sm:mb-1.5 uppercase tracking-wider">
              Hours completed
            </p>
            <div className="flex gap-0.5 sm:gap-1">
              {Array.from({ length: Math.min(targetHours, isCompact ? 8 : targetHours) }, (_, i) => {
                const filled  = elapsed >= (i + 1) * 3600;
                const partial = !filled && elapsed > i * 3600;
                const pct     = partial ? ((elapsed - i * 3600) / 3600) * 100 : 0;
                return (
                  <div key={i} className="relative h-4 sm:h-5 rounded overflow-hidden bg-bg-muted flex-1">
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
                    <span className="absolute inset-0 flex items-center justify-center text-[8px] sm:text-[9px] font-mono text-text-muted z-10">
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
                className="btn-primary flex items-center gap-1.5 flex-1 justify-center text-xs sm:text-sm py-2.5"
              >
                <Play size={13} fill="currentColor" />
                {elapsed > 0 ? "Resume" : "Start"}
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="flex items-center gap-1.5 flex-1 justify-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium bg-accent-gold/15 text-accent-gold border border-accent-gold/30 hover:bg-accent-gold/25 transition-colors"
              >
                <Pause size={13} fill="currentColor" />
                Pause &amp; Save
              </button>
            )}
            <button
              onClick={handleReset}
              className="btn-ghost border border-bg-border flex items-center justify-center px-2 sm:px-3 py-2 sm:py-2.5"
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
function StudyChart({ logs = [], targetHours = 8, userId = null }) {
  const [view, setView] = useState("weekly");
  const [isMobile, setIsMobile] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0); // 0 = current month, -1 = prev, ...

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Reset to the current month whenever the chart is switched back to weekly,
  // so re-opening monthly view later doesn't silently resume on an old month.
  useEffect(() => {
    if (view === "weekly") setMonthOffset(0);
  }, [view]);

  const getHoursForDate = (dateStr) => {
    const serverHours = logs.find((l) => l.date === dateStr)?.hours || 0;
    // For today, prefer live store value over saved localStorage (most accurate)
    if (dateStr === todayKey()) {
      const liveHours = parseFloat((timerStore.elapsed / 3600).toFixed(2));
      const savedHours = getUserTimerHours(userId, dateStr);
      return Math.max(serverHours, liveHours, savedHours);
    }
    const localHours = getUserTimerHours(userId, dateStr);
    return Math.max(serverHours, localHours);
  };

  const weeklyData = (() => {
    const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    return Array.from({ length: isMobile ? 5 : 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - ((isMobile ? 4 : 6) - i));
      const dateStr = getISTDateString(d);
      return {
        label:   DAY_NAMES[getISTDay(d)].substring(0, isMobile ? 2 : 3),
        hours:   getHoursForDate(dateStr),
        isToday: i === (isMobile ? 4 : 6),
      };
    });
  })();

  // ── Monthly calendar — every day gets its own visible cell, nothing is ─────
  // summed into a week anymore. Built straight from Y/M/D parts (no Date
  // round-tripping for the date strings), so it can't drift across timezones.
  const todayStr = todayKey(); // "YYYY-MM-DD" in IST
  const [todayY, todayM] = todayStr.split("-").map(Number);

  const viewedMonth = new Date(todayY, todayM - 1 + monthOffset, 1);
  const viewYear  = viewedMonth.getFullYear();
  const viewMonth = viewedMonth.getMonth(); // 0-indexed
  const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstWeekday = viewedMonth.getDay(); // 0=Sun .. 6=Sat

  const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum   = i + 1;
    const dateStr  = `${viewYear}-${pad2(viewMonth + 1)}-${pad2(dayNum)}`;
    const isFuture = dateStr > todayStr;
    const hours    = isFuture ? 0 : getHoursForDate(dateStr);
    return {
      day: dayNum,
      dateStr,
      hours,
      isToday: dateStr === todayStr,
      isFuture,
      met:     !isFuture && hours >= targetHours,
      studied: !isFuture && hours > 0,
    };
  });

  const monthLabel     = viewedMonth.toLocaleString("en-US", { month: "long", year: "numeric" });
  const isCurrentMonth = monthOffset === 0;

  const elapsedDays   = monthDays.filter((d) => !d.isFuture);
  const studiedCount  = elapsedDays.filter((d) => d.studied).length;
  const metCount      = elapsedDays.filter((d) => d.met).length;
  const monthTotal    = parseFloat(elapsedDays.reduce((s, d) => s + d.hours, 0).toFixed(1));
  const monthAvg      = studiedCount ? parseFloat((monthTotal / studiedCount).toFixed(1)) : 0;

  const weeklyMax = Math.max(targetHours, ...weeklyData.map((d) => d.hours), 0.1);

  return (
    <div className="glass-panel p-3 sm:p-4 space-y-2.5 sm:space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <TrendingUp size={14} className="text-accent-green shrink-0" />
          <h3 className="text-xs sm:text-sm font-display font-semibold text-text-primary truncate">
            {view === "weekly" ? "Weekly Hours" : monthLabel}
          </h3>
        </div>
        <div className="flex items-center bg-bg-muted rounded-lg p-0.5 gap-0.5 shrink-0">
          {[
            ["weekly", isMobile ? "5D" : "7D"],
            ["monthly", "Month"],
          ].map(([v, lbl]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-mono transition-all ${
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
          <div className="flex items-end gap-0.5 sm:gap-1.5 h-20 sm:h-24">
            {weeklyData.map(({ label, hours, isToday }) => {
              const pct = (hours / weeklyMax) * 100;
              const met = hours >= targetHours;
              return (
                <div key={label} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[8px] sm:text-[9px] font-mono text-text-muted tabular-nums h-3">
                    {hours > 0 ? `${hours}h` : ""}
                  </span>
                  <div
                    className="w-full relative flex flex-col justify-end"
                    style={{ height: 50 }}
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
                    className={`text-[8px] sm:text-[10px] font-mono ${
                      isToday ? "text-accent-gold" : "text-text-muted"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 text-[9px] sm:text-[10px] font-mono text-text-muted">
            <span className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-sm bg-accent-gold" /> Today
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-sm bg-accent-green/70" /> Met
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-sm bg-accent-blue/50" /> Partial
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5 sm:space-y-3">
          {/* Month navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMonthOffset((o) => o - 1)}
              className="btn-ghost border border-bg-border p-1 sm:p-1.5 rounded-lg hover:border-accent-gold/30 transition-colors"
              title="Previous month"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-[10px] sm:text-[11px] font-mono text-text-muted">
              {isCurrentMonth ? "This month" : monthLabel}
            </span>
            <button
              onClick={() => setMonthOffset((o) => Math.min(0, o + 1))}
              disabled={isCurrentMonth}
              className={`btn-ghost border border-bg-border p-1 sm:p-1.5 rounded-lg transition-colors ${
                isCurrentMonth ? "opacity-30 cursor-not-allowed" : "hover:border-accent-gold/30"
              }`}
              title="Next month"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Month summary */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {[
              { label: "Total",   val: `${monthTotal}h` },
              { label: "Days hit", val: `${metCount}/${elapsedDays.length}` },
              { label: "Avg/day", val: `${monthAvg}h` },
            ].map(({ label, val }) => (
              <div key={label} className="bg-bg-muted rounded-lg p-1.5 sm:p-2 text-center">
                <p className="text-[9px] sm:text-[10px] font-mono text-text-muted uppercase">{label}</p>
                <p className="text-xs sm:text-sm font-display font-bold text-text-primary mt-0.5">{val}</p>
              </div>
            ))}
          </div>

          {/* Weekday header */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <span key={i} className="text-[8px] sm:text-[10px] font-mono text-text-muted">
                {d}
              </span>
            ))}
          </div>

          {/* Calendar grid — one visible cell per day, never aggregated */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {Array.from({ length: firstWeekday }, (_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {monthDays.map((d) => (
              <div
                key={d.dateStr}
                title={d.isFuture ? "" : `${d.dateStr} — ${d.hours}h studied`}
                className={`aspect-square rounded-md sm:rounded-lg flex flex-col items-center justify-center gap-0.5 border transition-colors ${
                  d.isToday
                    ? "border-accent-gold bg-accent-gold/15"
                    : d.isFuture
                    ? "border-transparent bg-transparent"
                    : d.met
                    ? "border-accent-green/40 bg-accent-green/15"
                    : d.studied
                    ? "border-accent-blue/30 bg-accent-blue/10"
                    : "border-bg-border/50 bg-bg-muted/60"
                }`}
              >
                <span
                  className={`text-[9px] sm:text-[11px] font-mono leading-none ${
                    d.isToday
                      ? "text-accent-gold font-bold"
                      : d.isFuture
                      ? "text-text-muted/30"
                      : "text-text-secondary"
                  }`}
                >
                  {d.day}
                </span>
                {!d.isFuture && d.hours > 0 && (
                  <span className="text-[7px] sm:text-[9px] font-mono text-text-muted leading-none">
                    {d.hours}h
                  </span>
                )}
                {d.met && <CheckCircle size={8} className="text-accent-green sm:w-2.5 sm:h-2.5" />}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 text-[9px] sm:text-[10px] font-mono text-text-muted">
            <span className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-sm border border-accent-gold bg-accent-gold/15" /> Today
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-sm border border-accent-green/40 bg-accent-green/15" /> Target met
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-sm border border-accent-blue/30 bg-accent-blue/10" /> Studied
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-sm border border-bg-border/50 bg-bg-muted/60" /> No study
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── StatCard ──────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, accent = false, iconColor }) {
  return (
    <div
      className={`glass-panel p-2.5 sm:p-4 flex flex-col gap-0.5 sm:gap-1.5 transition-all duration-300 active:scale-95 sm:hover:-translate-y-0.5 sm:hover:border-accent-gold/30 cursor-default ${
        accent ? "border-accent-gold/30 bg-accent-gold/5" : ""
      }`}
    >
      <div className="flex items-center gap-1 sm:gap-2">
        <Icon
          size={12}
          style={{ color: iconColor }}
          className={`shrink-0 ${!iconColor ? (accent ? "text-accent-gold" : "text-text-secondary") : ''}`}
        />
        <span className="text-[9px] sm:text-xs font-mono text-text-muted uppercase tracking-wider leading-tight truncate">
          {label}
        </span>
      </div>
      <p
        className={`text-lg sm:text-2xl font-display font-bold leading-tight ${
          accent ? "text-accent-gold" : "text-text-primary"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-[9px] sm:text-xs text-text-secondary truncate">{sub}</p>}
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
    <div className="glass-panel p-3 sm:p-4 space-y-2.5 sm:space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks size={14} className="text-accent-gold shrink-0" />
          <h3 className="text-xs sm:text-sm font-display font-semibold text-text-primary">Today's Tasks</h3>
        </div>
        {tasks.length > 0 && (
          <span className="text-[10px] sm:text-[11px] font-mono text-text-muted">
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
          placeholder="Add a task..."
          className="flex-1 min-w-0 bg-bg-muted border border-bg-border rounded-lg px-2.5 sm:px-3 py-2 text-text-primary text-xs sm:text-sm focus:outline-none focus:border-accent-gold/50 transition-colors"
        />
        <button onClick={add} className="btn-primary flex items-center gap-1 px-3 py-2">
          <Plus size={14} />
        </button>
      </div>
      {tasks.length === 0 ? (
        <p className="text-[11px] sm:text-xs text-text-muted font-mono">
          No tasks yet. Add your study goals for today.
        </p>
      ) : (
        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
          {tasks.map((t, i) => (
            <div key={i} className="flex items-center gap-2 group py-1">
              <button
                onClick={() =>
                  save(tasks.map((x, j) => (j === i ? { ...x, done: !x.done } : x)))
                }
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
                  t.done
                    ? "bg-accent-green border-accent-green/60"
                    : "border-bg-border hover:border-accent-gold/40"
                }`}
              >
                {t.done && <CheckCircle size={10} className="text-white" />}
              </button>
              <span
                className={`text-[11px] sm:text-xs flex-1 min-w-0 leading-tight ${
                  t.done ? "line-through text-text-muted" : "text-text-secondary"
                }`}
              >
                {t.text}
              </span>
              <button
                onClick={() => save(tasks.filter((_, j) => j !== i))}
                className="opacity-0 group-hover:opacity-60 hover:opacity-100 text-text-muted hover:text-red-400 transition-all shrink-0 p-0.5"
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
    <div className="glass-panel p-3 sm:p-4 space-y-2.5 sm:space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper size={14} className="text-accent-blue shrink-0" />
          <h3 className="text-xs sm:text-sm font-display font-semibold text-text-primary">Current Affairs</h3>
        </div>
        <button
          onClick={() => setAdding((v) => !v)}
          className="btn-ghost border border-bg-border text-[11px] sm:text-xs px-2.5 py-1.5"
        >
          {adding ? "Cancel" : "+ Add"}
        </button>
      </div>
      {adding && (
        <div className="flex flex-col gap-2">
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="bg-bg-muted border border-bg-border rounded-lg px-2 py-1.5 text-text-primary text-xs focus:outline-none focus:border-accent-gold/50 w-full sm:w-auto"
          >
            {CA_CATS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              autoFocus
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") add();
              }}
              placeholder="Topic / headline..."
              className="flex-1 min-w-0 bg-bg-muted border border-bg-border rounded-lg px-2.5 sm:px-3 py-1.5 text-text-primary text-xs sm:text-sm focus:outline-none focus:border-accent-gold/50"
            />
            <button onClick={add} className="btn-primary text-xs px-3">
              Save
            </button>
          </div>
        </div>
      )}
      {entries.length === 0 ? (
        <p className="text-[11px] sm:text-xs text-text-muted font-mono">Log news topics you've covered today.</p>
      ) : (
        <div className="space-y-1.5">
          {entries.slice(0, 6).map((e, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px] sm:text-xs py-1">
              <span className="label-tag text-[10px] sm:text-xs text-accent-blue border-accent-blue/30 bg-accent-blue/10 shrink-0 hidden sm:inline">
                {e.category}
              </span>
              <span className="text-text-secondary flex-1 truncate min-w-0">{e.topic}</span>
              <span className="font-mono text-text-muted shrink-0 text-[10px] sm:text-xs">{e.date}</span>
            </div>
          ))}
          {entries.length > 6 && (
            <p className="text-[10px] sm:text-[11px] font-mono text-text-muted">+{entries.length - 6} more</p>
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
    <div className="glass-panel p-3 sm:p-4 space-y-2.5 sm:space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PenLine size={14} className="text-accent-purple shrink-0" />
          <h3 className="text-xs sm:text-sm font-display font-semibold text-text-primary">Answer Writing</h3>
          <span className="label-tag text-[10px] sm:text-xs text-accent-purple border-accent-purple/30 bg-accent-purple/10">
            {thisWeek}/wk
          </span>
        </div>
        <button
          onClick={() => setAdding((v) => !v)}
          className="btn-ghost border border-bg-border text-[11px] sm:text-xs px-2.5 py-1.5"
        >
          {adding ? "Cancel" : "+ Log"}
        </button>
      </div>
      {adding && (
        <div className="flex flex-col gap-2">
          <select
            value={paper}
            onChange={(e) => setPaper(e.target.value)}
            className="bg-bg-muted border border-bg-border rounded-lg px-2 py-1.5 text-text-primary text-xs focus:outline-none focus:border-accent-gold/50 w-full sm:w-auto"
          >
            {PAPERS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              autoFocus
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") add();
              }}
              placeholder="Question or topic answered..."
              className="flex-1 min-w-0 bg-bg-muted border border-bg-border rounded-lg px-2.5 sm:px-3 py-1.5 text-text-primary text-xs sm:text-sm focus:outline-none focus:border-accent-gold/50"
            />
            <button onClick={add} className="btn-primary text-xs px-3">
              Save
            </button>
          </div>
        </div>
      )}
      {logs.length === 0 ? (
        <p className="text-[11px] sm:text-xs text-text-muted font-mono">
          Track every answer you write. Aim for 2–3 daily.
        </p>
      ) : (
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {logs.slice(0, 5).map((l, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px] sm:text-xs py-1">
              <span className="label-tag text-[10px] sm:text-xs text-accent-purple border-accent-purple/30 bg-accent-purple/10 shrink-0">
                {l.paper}
              </span>
              <span className="text-text-secondary flex-1 truncate min-w-0">{l.question}</span>
              <span className="font-mono text-text-muted shrink-0 text-[10px] sm:text-xs">{l.date}</span>
            </div>
          ))}
          {logs.length > 5 && (
            <p className="text-[10px] sm:text-[11px] font-mono text-text-muted">
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
    <div className="glass-panel p-3 sm:p-4 space-y-2.5 sm:space-y-3">
      <div className="flex items-center gap-2">
        <BarChart2 size={14} className="text-accent-gold shrink-0" />
        <h3 className="text-xs sm:text-sm font-display font-semibold text-text-primary">Paper Coverage</h3>
      </div>
      {rows.length === 0 ? (
        <p className="text-[11px] sm:text-xs text-text-muted font-mono py-2">
          Mark progress in Syllabus Tracker to see coverage.
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map(({ label, color, pct }) => (
            <div key={label} className="space-y-1">
              <div className="flex justify-between items-center gap-2">
                <span className="text-[11px] sm:text-xs text-text-secondary truncate max-w-[65%] sm:max-w-[70%]">
                  {label}
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono text-text-muted shrink-0">{pct}%</span>
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
  isLoggedIn = false,
  onNavigateAuth,
  onNavigateProfile,
}) {
  // Derive stable user ID for scoping timer data
  const userId = user?.id || user?._id || null;
  if (!user) return <AuthGate feature="Dashboard" onNavigateAuth={onNavigateAuth} />;

  const [timerHours, setTimerHours] = useState(() => {
    return getUserTimerHours(userId, todayKey());
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
    <div className="overflow-y-auto p-2 sm:p-4 md:p-6 space-y-2 sm:space-y-4 md:space-y-5 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-1 sticky top-0 bg-bg-base/95 backdrop-blur-sm z-10 py-2 sm:py-0">
        <div className="min-w-0">
          <h2 className="font-display font-bold text-base sm:text-lg md:text-xl text-text-primary truncate">
            Command Center
          </h2>
          <p className="text-[10px] sm:text-xs text-text-secondary mt-0.5 hidden sm:block">
            Progress, revision, and daily momentum.
          </p>
        </div>

        {/* Profile button — responsive */}
        {userName && (
          <button
            onClick={onNavigateProfile}
            className="flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-bg-border bg-bg-surface hover:border-accent-gold/30 hover:bg-bg-muted transition-all duration-150 group shrink-0 ml-2"
            title="View profile"
          >
            <AvatarCircle name={userName} size="sm" />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-text-primary leading-tight truncate max-w-[100px] md:max-w-[120px]">
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-2 md:gap-3">
        <StatCard
          icon={Clock}
          label="Today"
          value={fmtHM(Math.round(todayHours * 3600))}
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
      <div className="glass-panel p-3 sm:p-4 space-y-1.5 sm:space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-mono text-text-secondary uppercase tracking-wider">
            Overall Coverage
          </span>
          <span className="text-sm sm:text-base font-display font-bold text-text-primary">
            {Math.round(overallProgress)}%
          </span>
        </div>
        <div className="h-2 bg-bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-gold to-yellow-400 rounded-full transition-all duration-700"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <p className="text-[10px] sm:text-xs text-text-muted font-mono">
          {overallProgress < 10
            ? "Day one. The journey begins."
            : overallProgress < 40
            ? "Foundation phase. Keep the momentum."
            : overallProgress < 70
            ? "Solid coverage. Depth work begins now."
            : "Advanced stage. Revision and PYQ analysis."}
        </p>
      </div>

      {/* ── Question Stats (conditionally collapsible on mobile) ── */}
      {isMobile ? (
        <CollapsibleSection title="Question Statistics" defaultOpen={false}>
          <QuestionStatsPanel />
        </CollapsibleSection>
      ) : (
        <QuestionStatsPanel />
      )}

      {/* ── Study Timer (persists across view changes via timerStore) ── */}
      <StudyTimer
        onLogHours={onLogHours}
        onSynced={setTimerHours}
        targetHours={targetHours}
        serverHours={serverHoursNum}
      />

      {/* ── Tasks + Current Affairs ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
        {isMobile ? (
          <>
            <CollapsibleSection title="Today's Tasks" icon={ListChecks} defaultOpen={true}>
              <TodayPlanner />
            </CollapsibleSection>
            <CollapsibleSection title="Current Affairs" icon={Newspaper} defaultOpen={false}>
              <CurrentAffairsLog />
            </CollapsibleSection>
          </>
        ) : (
          <>
            <TodayPlanner />
            <CurrentAffairsLog />
          </>
        )}
      </div>

      {/* ── Answer Writing ── */}
      {isMobile ? (
        <CollapsibleSection title="Answer Writing" icon={PenLine} defaultOpen={false}>
          <AnswerWritingTracker />
        </CollapsibleSection>
      ) : (
        <AnswerWritingTracker />
      )}

      {/* ── Study Chart + Paper Coverage ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
        {isMobile ? (
          <>
            <CollapsibleSection title="Study Chart" icon={TrendingUp} defaultOpen={false}>
              <StudyChart logs={dailyLogs} targetHours={targetHours} userId={userId} />
            </CollapsibleSection>
            <CollapsibleSection title="Paper Coverage" icon={BarChart2} defaultOpen={false}>
              <PaperProgress syllabusData={syllabusData} />
            </CollapsibleSection>
          </>
        ) : (
          <>
            <StudyChart logs={dailyLogs} targetHours={targetHours} userId={userId} />
            <PaperProgress syllabusData={syllabusData} />
          </>
        )}
      </div>

      {/* ── AI Spaced Repetition (real backend) ── */}
      {isMobile ? (
        <CollapsibleSection title="AI Revision Queue" icon={Brain} defaultOpen={false}>
          <AIRevisionPanel isLoggedIn={isLoggedIn} compact={true} />
        </CollapsibleSection>
      ) : (
        <AIRevisionPanel isLoggedIn={isLoggedIn} />
      )}

    </div>
  );
}