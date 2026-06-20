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
import { useState, useEffect } from "react";
import { SYLLABUS, PAPER_ORDER, getPct } from "../data/PYQs/syllabusData";
import AuthGate from "../components/ui/AuthGate";
import timerStore from "../hooks/timerStore";
import QuestionStatsPanel from "../components/QuestionStats";
import { AvatarCircle } from "./ProfilePage";
import AIRevisionPanel from "./AI/AIRevisionPanel";
import { getISTDateString, getISTDay } from "../utils/dateUtils";

// ─── Tiny helpers ──────────────────────────────────────────────────────────────
function todayKey() {
  return getISTDateString();
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

// ─── Modern chart palette ────────────────────────────────────────────────────
// Shared across StudyChart / PaperProgress / StudyTimer so every "chart" in the
// dashboard reads as part of the same visual language.
const CHART_COLORS = {
  goalMet:    { solid: "#10b981", grad: "linear-gradient(180deg, #34d399 0%, #059669 100%)", glow: "rgba(16,185,129,0.4)" },
  inProgress: { solid: "#6366f1", grad: "linear-gradient(180deg, #818cf8 0%, #4f46e5 100%)", glow: "rgba(99,102,241,0.4)" },
  today:      { solid: "#f59e0b", grad: "linear-gradient(180deg, #fcd34d 0%, #d97706 100%)", glow: "rgba(245,158,11,0.45)" },
  best:       { solid: "#ec4899", grad: "linear-gradient(180deg, #f472b6 0%, #db2777 100%)", glow: "rgba(236,72,153,0.4)" },
};

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
function StudyTimer({ onLogHours, onSynced, targetHours = 8, serverHours = 0, dataReady = false, userId = null }) {
  // Initialise directly from the singleton so we never show stale values
  const [elapsed, setElapsed] = useState(timerStore.elapsed);
  const [running, setRunning] = useState(timerStore.running);
  const [remote, setRemote] = useState(timerStore.remote);
  const [syncState, setSyncState] = useState("idle");
  const [isCompact, setIsCompact] = useState(false);
  const [ringGrown, setRingGrown] = useState(false);

  // ── Responsive breakpoint detection ─────────────────────────────────────────
  useEffect(() => {
    const checkSize = () => setIsCompact(window.innerWidth < 380);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  // ── Grow the ring + hour blocks in from zero on first paint ────────────────
  useEffect(() => {
    const t = setTimeout(() => setRingGrown(true), 150);
    return () => clearTimeout(t);
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

  // ── Scope the singleton to this user (resets local state on user switch) ──
  useEffect(() => {
    timerStore.setUser(userId);
  }, [userId]);
  useEffect(() => {
    timerStore.setSyncHandler(async (hours) => {
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
    });
  }, [onLogHours, onSynced]);

  useEffect(() => {
    if (!dataReady) return;
    timerStore.hydrate(serverHours);
    timerStore.autoStart();
  }, [dataReady, serverHours]);

  // ── Controls ──────────────────────────────────────────────────────────────
  const handleStart = () => timerStore.start();
  const handlePause = () => timerStore.pause();
  const handleReset = () => timerStore.reset();

  // ── Derived display values ────────────────────────────────────────────────
  const TARGET_SECS = targetHours * 3600;
  const progress    = Math.min(elapsed / TARGET_SECS, 1);
  const R           = isCompact ? 45 : 54;
  const SVG_SIZE    = isCompact ? 110 : 140;
  const CIRC        = 2 * Math.PI * R;
  const displayProgress = ringGrown ? progress : 0;
  const dashOffset  = CIRC * (1 - displayProgress);
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
              style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.4s" }}
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
                  <div
                    key={i}
                    className="relative h-4 sm:h-5 rounded overflow-hidden bg-bg-muted flex-1 transition-all duration-500 ease-out"
                    style={{
                      opacity: ringGrown ? 1 : 0,
                      transform: ringGrown ? "scaleY(1)" : "scaleY(0.4)",
                      transitionDelay: `${i * 40}ms`,
                    }}
                  >
                    {filled && (
                      <div
                        className="absolute inset-0 rounded"
                        style={{ background: CHART_COLORS.goalMet.grad }}
                      />
                    )}
                    {partial && (
                      <div
                        className="absolute inset-y-0 left-0 rounded"
                        style={{
                          width: `${pct}%`,
                          background: running ? CHART_COLORS.goalMet.grad : CHART_COLORS.today.grad,
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
function StudyChart({ logs = [], targetHours = 8 }) {
  const [view, setView] = useState("weekly");
  const [isMobile, setIsMobile] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);
  const [yearOffset, setYearOffset] = useState(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (view !== "monthly") setMonthOffset(0);
    if (view !== "yearly") setYearOffset(0);
  }, [view]);

  // ── "Grow in" animation — replays whenever the view or navigated period
  // changes, so bars/cells always feel alive rather than just popping in. ─────
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    setGrown(false);
    const t = setTimeout(() => setGrown(true), 60);
    return () => clearTimeout(t);
  }, [view, monthOffset, yearOffset]);

  const getHoursForDate = (dateStr) => {
    const serverHours = logs.find((l) => l.date === dateStr)?.hours || 0;
    if (dateStr === todayKey()) {
      const liveHours = parseFloat((timerStore.elapsed / 3600).toFixed(2));
      return Math.max(serverHours, liveHours);
    }
    return serverHours;
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

  const todayStr = todayKey();
  const [todayY, todayM] = todayStr.split("-").map(Number);

  const viewedMonth = new Date(todayY, todayM - 1 + monthOffset, 1);
  const viewYear  = viewedMonth.getFullYear();
  const viewMonth = viewedMonth.getMonth();
  const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstWeekday = viewedMonth.getDay();

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

  const viewedYear    = todayY + yearOffset;
  const isCurrentYear = yearOffset === 0;

  const elapsedDays   = monthDays.filter((d) => !d.isFuture);
  const studiedCount  = elapsedDays.filter((d) => d.studied).length;
  const metCount      = elapsedDays.filter((d) => d.met).length;
  const monthTotal    = parseFloat(elapsedDays.reduce((s, d) => s + d.hours, 0).toFixed(1));
  const monthAvg      = studiedCount ? parseFloat((monthTotal / studiedCount).toFixed(1)) : 0;

  // ── Weekly axis scale ───────────────────────────────────────────────────────
  const dataMax  = Math.max(...weeklyData.map((d) => d.hours), 0);
  const scaleMax = Math.max(targetHours, Math.ceil(dataMax) || 1);
  const TICKS    = 5;
  const ticks = Array.from({ length: TICKS }, (_, i) =>
    parseFloat((scaleMax * (1 - i / (TICKS - 1))).toFixed(1))
  );
  const AXIS_W = "w-7 sm:w-8";

  // ── Weekly summary stats (mirrors the monthly summary cards) ────────────────
  const weekStudiedCount = weeklyData.filter((d) => d.hours > 0).length;
  const weekMetCount     = weeklyData.filter((d) => d.hours >= targetHours).length;
  const weekTotal        = parseFloat(weeklyData.reduce((s, d) => s + d.hours, 0).toFixed(1));
  const weekAvg          = weekStudiedCount ? parseFloat((weekTotal / weekStudiedCount).toFixed(1)) : 0;

  const weekStats = [
    { label: "Total",    val: `${weekTotal}h`,                          icon: Clock,       color: "#C9A84C" },
    { label: "Days Hit", val: `${weekMetCount}/${weeklyData.length}`,   icon: CheckCircle, color: "#22c55e" },
    { label: "Avg/Day",  val: `${weekAvg}h`,                            icon: TrendingUp,  color: "#3b82f6" },
  ];

  // ── Monthly summary card styling (mirrors the weekly chart's accent colors) ─
  const monthStats = [
    { label: "Total",    val: `${monthTotal}h`,                     icon: Clock,       color: "#C9A84C" },
    { label: "Days Hit", val: `${metCount}/${elapsedDays.length}`,  icon: CheckCircle, color: "#22c55e" },
    { label: "Avg/Day",  val: `${monthAvg}h`,                       icon: TrendingUp,  color: "#3b82f6" },
  ];

  // ── Yearly data — totals per month for the navigated year ───────────────────
  const yearlyData = (() => {
    const MONTH_FULL = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const serverTodayHours    = logs.find((l) => l.date === todayStr)?.hours || 0;
    const liveTodayHours      = parseFloat((timerStore.elapsed / 3600).toFixed(2));
    const effectiveTodayHours = Math.max(serverTodayHours, liveTodayHours);

    return Array.from({ length: 12 }, (_, m) => {
      const monthPrefix = `${viewedYear}-${pad2(m + 1)}`;
      let total = logs
        .filter((l) => l.date && l.date.startsWith(monthPrefix))
        .reduce((s, l) => s + (l.hours || 0), 0);

      const isCurrentMonthCell = viewedYear === todayY && m === todayM - 1;
      if (isCurrentMonthCell) {
        // logs already include today's server-saved hours; swap in the live value
        total = total - serverTodayHours + effectiveTodayHours;
      }

      const isFuture = viewedYear > todayY || (viewedYear === todayY && m > todayM - 1);

      return {
        label: MONTH_FULL[m],
        short: isMobile ? MONTH_FULL[m].slice(0, 1) : MONTH_FULL[m].slice(0, 3),
        hours: isFuture ? 0 : parseFloat(Math.max(total, 0).toFixed(1)),
        isCurrent: isCurrentMonthCell,
        isFuture,
      };
    });
  })();

  const elapsedMonths      = yearlyData.filter((d) => !d.isFuture);
  const studiedMonthsCount = elapsedMonths.filter((d) => d.hours > 0).length;
  const yearTotal = parseFloat(elapsedMonths.reduce((s, d) => s + d.hours, 0).toFixed(1));
  const bestMonth = elapsedMonths.reduce(
    (best, d) => (d.hours > best.hours ? d : best),
    { hours: 0, label: "—" }
  );
  const yearAvg = studiedMonthsCount ? parseFloat((yearTotal / studiedMonthsCount).toFixed(1)) : 0;

  const yearStats = [
    { label: "Total",      val: `${yearTotal}h`,                                                      icon: Clock,       color: "#C9A84C" },
    { label: "Best Month", val: bestMonth.hours > 0 ? `${bestMonth.label} · ${bestMonth.hours}h` : "—", icon: Flame,       color: "#ec4899" },
    { label: "Avg/Month",  val: `${yearAvg}h`,                                                          icon: TrendingUp,  color: "#3b82f6" },
  ];

  // ── Yearly axis scale ────────────────────────────────────────────────────────
  const yearDataMax  = Math.max(...yearlyData.map((d) => d.hours), 0);
  const yearScaleMax = Math.max(Math.ceil(yearDataMax / 5) * 5, 5);
  const yearTicks = Array.from({ length: TICKS }, (_, i) =>
    parseFloat((yearScaleMax * (1 - i / (TICKS - 1))).toFixed(1))
  );

  return (
    <div className="glass-panel p-3 sm:p-4 space-y-2.5 sm:space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <TrendingUp size={14} className="text-accent-green shrink-0" />
          <h3 className="text-xs sm:text-sm font-display font-semibold text-text-primary truncate">
            {view === "weekly"
              ? (isMobile ? "5-Day Hours" : "Weekly Hours")
              : view === "monthly"
              ? monthLabel
              : `${viewedYear} Overview`}
          </h3>
        </div>
        <div className="flex items-center bg-bg-muted rounded-lg p-0.5 gap-0.5 shrink-0">
          {[
            ["weekly", isMobile ? "5D" : "7D"],
            ["monthly", "Month"],
            ["yearly", "Year"],
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
        <div className="space-y-1.5">
          <div className="flex">
            <div className={`${AXIS_W} shrink-0 flex flex-col justify-between h-36 sm:h-44 pr-1 sm:pr-1.5 text-right`}>
              {ticks.map((t) => (
                <span key={t} className="text-[9px] sm:text-[10px] font-mono text-text-muted leading-none">
                  {t}h
                </span>
              ))}
            </div>
            <div className="relative flex-1 h-36 sm:h-44 border-l border-b border-bg-border">
              {ticks.slice(0, -1).map((t) => (
                <div
                  key={t}
                  className="absolute left-0 right-0 border-t border-bg-border/50"
                  style={{ top: `${((scaleMax - t) / scaleMax) * 100}%` }}
                />
              ))}
              <div className="absolute inset-0 flex items-end px-1 sm:px-2">
                {weeklyData.map(({ label, hours, isToday }, i) => {
                  const met = hours >= targetHours;
                  const pct = Math.min((hours / scaleMax) * 100, 100);
                  const palette = isToday ? CHART_COLORS.today : met ? CHART_COLORS.goalMet : CHART_COLORS.inProgress;
                  return (
                    <div key={label} className="flex-1 h-full flex items-end justify-center">
                      {hours > 0 && (
                        <div
                          title={`${hours}h`}
                          className="w-full max-w-[28px] sm:max-w-[34px] rounded-t-md transition-all duration-700 ease-out"
                          style={{
                            height: `${grown ? Math.max(pct, 4) : 0}%`,
                            background: palette.grad,
                            boxShadow: `0 2px 10px ${palette.glow}`,
                            transitionDelay: `${i * 60}ms`,
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex">
            <div className={`${AXIS_W} shrink-0`} />
            <div className="flex-1 flex px-1 sm:px-2">
              {weeklyData.map(({ label, isToday }) => (
                <span
                  key={label}
                  className={`flex-1 text-center text-[9px] sm:text-[11px] font-mono ${
                    isToday ? "text-accent-gold font-bold" : "text-text-muted"
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-1 text-[9px] sm:text-[10px] font-mono text-text-muted pt-1">
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-sm" style={{ background: CHART_COLORS.goalMet.grad }} /> Goal met
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-sm" style={{ background: CHART_COLORS.inProgress.grad }} /> In progress
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-sm" style={{ background: CHART_COLORS.today.grad }} /> Today
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-sm bg-bg-muted border border-bg-border" /> Target left
            </span>
          </div>

          {/* Week summary — same accent-tinted cards as the monthly/yearly views */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-1">
            {weekStats.map(({ label, val, icon: Icon, color }, i) => (
              <div
                key={label}
                className="rounded-lg p-2.5 sm:p-3.5 text-center flex flex-col items-center justify-center gap-1 sm:gap-1.5 transition-all duration-500 ease-out"
                style={{
                  background: `${color}14`,
                  border: `1px solid ${color}30`,
                  opacity: grown ? 1 : 0,
                  transform: grown ? "translateY(0)" : "translateY(10px)",
                  transitionDelay: `${i * 90}ms`,
                }}
              >
                <div className="flex items-center gap-1">
                  <Icon size={11} style={{ color }} />
                  <span
                    className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider font-semibold"
                    style={{ color }}
                  >
                    {label}
                  </span>
                </div>
                <p className="text-lg sm:text-2xl font-display font-bold text-text-primary leading-none">
                  {val}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : view === "monthly" ? (
        <div className="space-y-2.5 sm:space-y-3">
          {/* Month navigation — pill bar, matches the weekly view-toggle weight */}
          <div className="flex items-center justify-between bg-bg-muted rounded-lg p-1 sm:p-1.5">
            <button
              onClick={() => setMonthOffset((o) => o - 1)}
              className="p-1.5 sm:p-2 rounded-md border border-transparent hover:border-accent-gold/30 hover:bg-bg-surface transition-colors"
              title="Previous month"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-xs sm:text-sm font-display font-semibold text-text-primary">
              {isCurrentMonth ? "This month" : monthLabel}
            </span>
            <button
              onClick={() => setMonthOffset((o) => Math.min(0, o + 1))}
              disabled={isCurrentMonth}
              className={`p-1.5 sm:p-2 rounded-md border border-transparent transition-colors ${
                isCurrentMonth ? "opacity-30 cursor-not-allowed" : "hover:border-accent-gold/30 hover:bg-bg-surface"
              }`}
              title="Next month"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Month summary — accent-tinted, icon + bold value, fills the card */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {monthStats.map(({ label, val, icon: Icon, color }, i) => (
              <div
                key={label}
                className="rounded-lg p-2.5 sm:p-3.5 text-center flex flex-col items-center justify-center gap-1 sm:gap-1.5 transition-all duration-500 ease-out"
                style={{
                  background: `${color}14`,
                  border: `1px solid ${color}30`,
                  opacity: grown ? 1 : 0,
                  transform: grown ? "translateY(0)" : "translateY(10px)",
                  transitionDelay: `${i * 90}ms`,
                }}
              >
                <div className="flex items-center gap-1">
                  <Icon size={11} style={{ color }} />
                  <span
                    className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider font-semibold"
                    style={{ color }}
                  >
                    {label}
                  </span>
                </div>
                <p className="text-lg sm:text-2xl font-display font-bold text-text-primary leading-none">
                  {val}
                </p>
              </div>
            ))}
          </div>

          {/* Weekday header */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <span key={i} className="text-[9px] sm:text-[11px] font-mono text-text-muted">
                {d}
              </span>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {Array.from({ length: firstWeekday }, (_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {monthDays.map((d, i) => {
              const palette = d.isToday
                ? CHART_COLORS.today
                : d.met
                ? CHART_COLORS.goalMet
                : d.studied
                ? CHART_COLORS.inProgress
                : null;
              return (
                <div
                  key={d.dateStr}
                  title={d.isFuture ? "" : `${d.dateStr} — ${d.hours}h studied`}
                  className={`aspect-square rounded-lg sm:rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all duration-500 ease-out ${
                    d.isFuture
                      ? "border-transparent bg-transparent"
                      : palette
                      ? "border-transparent"
                      : "border-gray-600/30 bg-gray-700/20"
                  }`}
                  style={{
                    background: palette ? palette.grad : undefined,
                    boxShadow: palette ? `0 2px 8px ${palette.glow}` : undefined,
                    opacity: d.isFuture || grown ? 1 : 0,
                    transform: d.isFuture || grown ? "scale(1)" : "scale(0.5)",
                    transitionDelay: `${Math.min(i, 30) * 12}ms`,
                  }}
                >
                  <span
                    className={`text-[11px] sm:text-sm font-mono leading-none font-bold ${
                      d.isFuture
                        ? "text-text-muted/30"
                        : palette
                        ? "text-white"
                        : "text-text-secondary"
                    }`}
                  >
                    {d.day}
                  </span>
                  {!d.isFuture && d.hours > 0 && (
                    <span
                      className={`text-[9px] sm:text-[11px] font-mono leading-none ${
                        palette ? "text-white/85" : "text-text-muted"
                      }`}
                    >
                      {d.hours}h
                    </span>
                  )}
                  {d.met && <CheckCircle size={9} className="text-white sm:w-3 sm:h-3" />}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 text-[9px] sm:text-[10px] font-mono text-text-muted">
            <span className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-sm" style={{ background: CHART_COLORS.goalMet.grad }} /> Goal met
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-sm" style={{ background: CHART_COLORS.inProgress.grad }} /> Studied
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-sm" style={{ background: CHART_COLORS.today.grad }} /> Today
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-sm bg-gray-700/20 border border-gray-600/30" /> No study
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5 sm:space-y-3">
          {/* Year navigation — same pill bar weight as week/month toggles */}
          <div className="flex items-center justify-between bg-bg-muted rounded-lg p-1 sm:p-1.5">
            <button
              onClick={() => setYearOffset((o) => o - 1)}
              className="p-1.5 sm:p-2 rounded-md border border-transparent hover:border-accent-gold/30 hover:bg-bg-surface transition-colors"
              title="Previous year"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-xs sm:text-sm font-display font-semibold text-text-primary">
              {isCurrentYear ? "This year" : viewedYear}
            </span>
            <button
              onClick={() => setYearOffset((o) => Math.min(0, o + 1))}
              disabled={isCurrentYear}
              className={`p-1.5 sm:p-2 rounded-md border border-transparent transition-colors ${
                isCurrentYear ? "opacity-30 cursor-not-allowed" : "hover:border-accent-gold/30 hover:bg-bg-surface"
              }`}
              title="Next year"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Year summary */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {yearStats.map(({ label, val, icon: Icon, color }, i) => (
              <div
                key={label}
                className="rounded-lg p-2.5 sm:p-3.5 text-center flex flex-col items-center justify-center gap-1 sm:gap-1.5 transition-all duration-500 ease-out"
                style={{
                  background: `${color}14`,
                  border: `1px solid ${color}30`,
                  opacity: grown ? 1 : 0,
                  transform: grown ? "translateY(0)" : "translateY(10px)",
                  transitionDelay: `${i * 90}ms`,
                }}
              >
                <div className="flex items-center gap-1">
                  <Icon size={11} style={{ color }} />
                  <span
                    className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider font-semibold"
                    style={{ color }}
                  >
                    {label}
                  </span>
                </div>
                <p className="text-base sm:text-2xl font-display font-bold text-text-primary leading-none truncate max-w-full">
                  {val}
                </p>
              </div>
            ))}
          </div>

          {/* Bar chart — 12 months */}
          <div className="flex">
            <div className={`${AXIS_W} shrink-0 flex flex-col justify-between h-36 sm:h-44 pr-1 sm:pr-1.5 text-right`}>
              {yearTicks.map((t) => (
                <span key={t} className="text-[9px] sm:text-[10px] font-mono text-text-muted leading-none">
                  {t}h
                </span>
              ))}
            </div>
            <div className="relative flex-1 h-36 sm:h-44 border-l border-b border-bg-border">
              {yearTicks.slice(0, -1).map((t) => (
                <div
                  key={t}
                  className="absolute left-0 right-0 border-t border-bg-border/50"
                  style={{ top: `${((yearScaleMax - t) / yearScaleMax) * 100}%` }}
                />
              ))}
              <div className="absolute inset-0 flex items-end px-1 sm:px-2">
                {yearlyData.map((d, i) => {
                  const pct = Math.min((d.hours / yearScaleMax) * 100, 100);
                  const isBest = bestMonth.hours > 0 && d.label === bestMonth.label && !d.isCurrent;
                  const palette = d.isCurrent
                    ? CHART_COLORS.today
                    : isBest
                    ? CHART_COLORS.best
                    : CHART_COLORS.inProgress;
                  return (
                    <div key={i} className="flex-1 h-full flex items-end justify-center">
                      {!d.isFuture && d.hours > 0 && (
                        <div
                          title={`${d.label}: ${d.hours}h`}
                          className="w-full max-w-[16px] sm:max-w-[22px] rounded-t-md transition-all duration-700 ease-out"
                          style={{
                            height: `${grown ? Math.max(pct, 4) : 0}%`,
                            background: palette.grad,
                            boxShadow: `0 2px 10px ${palette.glow}`,
                            transitionDelay: `${i * 50}ms`,
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex">
            <div className={`${AXIS_W} shrink-0`} />
            <div className="flex-1 flex px-1 sm:px-2">
              {yearlyData.map((d, i) => (
                <span
                  key={i}
                  className={`flex-1 text-center text-[9px] sm:text-[11px] font-mono ${
                    d.isCurrent ? "text-accent-gold font-bold" : "text-text-muted"
                  }`}
                >
                  {d.short}
                </span>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-1 text-[9px] sm:text-[10px] font-mono text-text-muted pt-1">
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-sm" style={{ background: CHART_COLORS.inProgress.grad }} /> Monthly hours
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-sm" style={{ background: CHART_COLORS.best.grad }} /> Best month
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-sm" style={{ background: CHART_COLORS.today.grad }} /> Current month
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
// ─── StatCard ──────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, accent = false, iconColor, delay = 0 }) {
  // Grows in (fade + slide-up) shortly after mount, staggered by `delay`, so the
  // whole stat row feels like it's "filling in" when the dashboard opens.
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGrown(true), 120 + delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`glass-panel p-2.5 sm:p-4 flex flex-col gap-0.5 sm:gap-1.5 transition-all duration-500 ease-out active:scale-95 sm:hover:-translate-y-0.5 sm:hover:border-accent-gold/30 cursor-default ${
        accent ? "border-accent-gold/30 bg-accent-gold/5" : ""
      }`}
      style={{
        opacity: grown ? 1 : 0,
        transform: grown ? "translateY(0)" : "translateY(10px)",
      }}
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

  // ── Grow the bars in from zero on first paint ───────────────────────────────
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGrown(true), 120);
    return () => clearTimeout(t);
  }, []);

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
        <div className="space-y-2.5">
          {rows.map(({ label, color, pct }, i) => (
            <div key={label} className="space-y-1">
              <div className="flex justify-between items-center gap-2">
                <span className="text-[11px] sm:text-xs text-text-secondary truncate max-w-[65%] sm:max-w-[70%]">
                  {label}
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono text-text-muted shrink-0">{pct}%</span>
              </div>
              <div className="h-2 bg-bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all ease-out"
                  style={{
                    width: grown ? `${pct}%` : "0%",
                    background: `linear-gradient(90deg, ${color}cc, ${color})`,
                    boxShadow: pct > 0 ? `0 0 8px ${color}66` : "none",
                    transitionDuration: "900ms",
                    transitionDelay: `${i * 110}ms`,
                  }}
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

  const [timerHours, setTimerHours] = useState(0);

  const [isMobile, setIsMobile] = useState(false);
  const [progressGrown, setProgressGrown] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ── Grow the overall coverage bar in from zero on first paint ───────────────
  useEffect(() => {
    const t = setTimeout(() => setProgressGrown(true), 200);
    return () => clearTimeout(t);
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
          delay={0}
        />
        <StatCard icon={TrendingUp} label="7-Day Avg" value={`${weekAvgHours}h`} sub="Per day" delay={60} />
        <StatCard
          icon={Flame}
          label="Streak"
          value={`${streak}d`}
          sub={`Best: ${longestStreak}d`}
          iconColor="#fb923c"
          delay={120}
        />
        <StatCard icon={BookMarked} label="Answers" value={totalAnswers} sub="Written" delay={180} />
        <StatCard
          icon={BarChart2}
          label="Coverage"
          value={`${Math.round(overallProgress)}%`}
          sub="Syllabus"
          iconColor="#C9A84C"
          delay={240}
        />
        <StatCard
          icon={Target}
          label="GS1 Done"
          value={`${getPct(syllabusData?.mains?.GS1?.modules || {})}%`}
          sub="GS1 modules"
          iconColor="#4ade80"
          delay={300}
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
        <div className="h-2.5 bg-bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-gold to-yellow-400 rounded-full transition-all ease-out"
            style={{
              width: progressGrown ? `${overallProgress}%` : "0%",
              boxShadow: "0 0 10px rgba(201,168,76,0.5)",
              transitionDuration: "1100ms",
            }}
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
<br/>
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
        dataReady={!!userData}
        userId={userId}
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
              <StudyChart logs={dailyLogs} targetHours={targetHours} />
            </CollapsibleSection>
            <CollapsibleSection title="Paper Coverage" icon={BarChart2} defaultOpen={false}>
              <PaperProgress syllabusData={syllabusData} />
            </CollapsibleSection>
          </>
        ) : (
          <>
            <StudyChart logs={dailyLogs} targetHours={targetHours} />
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