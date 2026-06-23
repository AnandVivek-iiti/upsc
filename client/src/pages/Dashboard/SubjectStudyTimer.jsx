import { useState, useEffect, useCallback } from "react";
import {
  Play, Pause, RotateCcw, Timer, Cloud, CloudOff,
  BookOpen, ChevronDown, ChevronUp, Clock, TrendingUp,
} from "lucide-react";
import timerStore from "../../hooks/timerStore";
import { useSubjectTimer, UPSC_SUBJECTS, SUBJECT_COLORS, SUBJECT_ICONS } from "../../hooks/useSubjectTimer";
import UserTimeline from "../../components/ui/UserTimeline";

// ─── Formatters ───────────────────────────────────────────────────────────────
function fmtTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
function fmtHM(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

// ─── SubjectPicker ────────────────────────────────────────────────────────────
function SubjectPicker({ onSelect, onCancel }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm font-display font-semibold text-text-primary">What are you studying?</p>
        {onCancel && (
          <button onClick={onCancel} className="text-xs font-mono text-text-muted hover:text-text-primary transition-colors">
            Cancel
          </button>
        )}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {UPSC_SUBJECTS.map((s) => {
          const color = SUBJECT_COLORS[s];
          const icon = SUBJECT_ICONS[s];
          const isHovered = hovered === s;
          return (
            <button
              key={s}
              onClick={() => onSelect(s)}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(null)}
              className="flex flex-col items-center justify-center gap-1.5 p-2.5 sm:p-3 rounded-xl border transition-all duration-150 active:scale-95 touch-manipulation"
              style={{
                borderColor: isHovered ? color : "var(--bg-border)",
                background: isHovered ? `${color}15` : "var(--bg-muted)",
              }}
            >
              <span className="text-xl leading-none">{icon}</span>
              <span className="text-[10px] sm:text-[11px] font-mono font-semibold text-center leading-tight" style={{ color: isHovered ? color : "var(--text-secondary)" }}>
                {s}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── SessionHistory ──────────────────────────────────────────────────────────
function SessionHistory({ sessions }) {
  const [expanded, setExpanded] = useState(false);
  if (!sessions?.length) {
    return <p className="text-[11px] font-mono text-text-muted py-1">No sessions recorded today yet.</p>;
  }
  const shown = expanded ? sessions : sessions.slice(0, 3);
  return (
    <div className="space-y-1.5">
      {shown.map((s, i) => {
        const color = SUBJECT_COLORS[s.subject] || "#94a3b8";
        const icon = SUBJECT_ICONS[s.subject] || "📚";
        const timeStr = new Date(Number(s.started_at || s.start_time)).toLocaleTimeString("en-IN", {
          hour: "2-digit", minute: "2-digit", hour12: true,
        });
        return (
          <div key={s.id || i} className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg" style={{ background: `${color}08`, border: `0.5px solid ${color}25` }}>
            <span className="text-sm leading-none">{icon}</span>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-text-primary">{s.subject}</span>
              <span className="text-[10px] font-mono text-text-muted ml-1.5">{timeStr}</span>
            </div>
            <span className="text-xs font-mono font-bold shrink-0" style={{ color }}>{s.display || fmtHM(s.duration_seconds || 0)}</span>
          </div>
        );
      })}
      {sessions.length > 3 && (
        <button onClick={() => setExpanded((v) => !v)} className="flex items-center gap-1 text-[10px] font-mono text-text-muted hover:text-text-primary transition-colors">
          {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          {expanded ? "Show less" : `+${sessions.length - 3} more`}
        </button>
      )}
    </div>
  );
}

// ─── SubjectDistribution ─────────────────────────────────────────────────────
function SubjectDistribution({ analytics, loading }) {
  if (loading) {
    return (
      <div className="space-y-2 animate-pulse">
        {[70, 50, 35, 20].map((w, i) => <div key={i} className="h-5 bg-bg-muted rounded" style={{ width: `${w}%` }} />)}
      </div>
    );
  }
  const dist = analytics?.distribution || [];
  if (!dist.length) {
    return <p className="text-[11px] font-mono text-text-muted py-1">Start studying to see your subject breakdown.</p>;
  }
  const maxSecs = dist[0]?.total_seconds || 1;
  return (
    <div className="space-y-2">
      {dist.slice(0, 7).map((row) => {
        const color = SUBJECT_COLORS[row.subject] || "#94a3b8";
        const icon = SUBJECT_ICONS[row.subject] || "📚";
        const barWidth = `${(row.total_seconds / maxSecs) * 100}%`;
        return (
          <div key={row.subject} className="space-y-0.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm leading-none">{icon}</span>
                <span className="text-[11px] sm:text-xs text-text-secondary truncate">{row.subject}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono text-text-muted">{row.percentage}%</span>
                <span className="text-[11px] font-mono font-bold" style={{ color }}>{row.display}</span>
              </div>
            </div>
            <div className="h-1.5 bg-bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: barWidth, background: `linear-gradient(90deg, ${color}bb, ${color})`, boxShadow: `0 0 5px ${color}44` }} />
            </div>
          </div>
        );
      })}
      {dist.length > 7 && <p className="text-[10px] font-mono text-text-muted">+{dist.length - 7} more subjects</p>}
    </div>
  );
}

// ─── SubjectInsights ─────────────────────────────────────────────────────────
function SubjectInsights({ analytics }) {
  if (!analytics) return null;
  const { insights, total_hours } = analytics;
  if (!insights?.most_studied && !insights?.least_studied) return null;
  const most = insights.most_studied;
  const least = insights.least_studied;
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {most && (
          <div className="rounded-xl p-2.5 sm:p-3 space-y-0.5" style={{ background: `${SUBJECT_COLORS[most.subject]}12`, border: `0.5px solid ${SUBJECT_COLORS[most.subject]}30` }}>
            <p className="text-[9px] font-mono uppercase tracking-wider text-text-muted">Most Studied</p>
            <p className="text-xs font-medium text-text-primary leading-tight">{SUBJECT_ICONS[most.subject]} {most.subject}</p>
            <p className="text-sm font-display font-bold" style={{ color: SUBJECT_COLORS[most.subject] }}>{most.display}</p>
          </div>
        )}
        {least && (
          <div className="rounded-xl p-2.5 sm:p-3 space-y-0.5" style={{ background: `${SUBJECT_COLORS[least.subject]}08`, border: `0.5px solid ${SUBJECT_COLORS[least.subject]}20` }}>
            <p className="text-[9px] font-mono uppercase tracking-wider text-text-muted">Least Studied</p>
            <p className="text-xs font-medium text-text-primary leading-tight">{SUBJECT_ICONS[least.subject]} {least.subject}</p>
            <p className="text-sm font-display font-bold" style={{ color: SUBJECT_COLORS[least.subject] }}>{least.display}</p>
          </div>
        )}
      </div>
      {(insights.this_week?.[0] || insights.this_month?.[0]) && (
        <div className="grid grid-cols-2 gap-2">
          {insights.this_week?.[0] && (() => {
            const w = insights.this_week[0];
            const c = SUBJECT_COLORS[w.subject] || "#C9A84C";
            return (
              <div className="rounded-xl p-2.5 space-y-0.5" style={{ background: `${c}0a`, border: `0.5px solid ${c}20` }}>
                <p className="text-[9px] font-mono uppercase text-text-muted">This Week Top</p>
                <p className="text-xs font-medium text-text-primary">{SUBJECT_ICONS[w.subject]} {w.subject}</p>
                <p className="text-xs font-mono font-bold" style={{ color: c }}>{w.display}</p>
              </div>
            );
          })()}
          {insights.this_month?.[0] && (() => {
            const m = insights.this_month[0];
            const c = SUBJECT_COLORS[m.subject] || "#C9A84C";
            return (
              <div className="rounded-xl p-2.5 space-y-0.5" style={{ background: `${c}0a`, border: `0.5px solid ${c}20` }}>
                <p className="text-[9px] font-mono uppercase text-text-muted">This Month Top</p>
                <p className="text-xs font-medium text-text-primary">{SUBJECT_ICONS[m.subject]} {m.subject}</p>
                <p className="text-xs font-mono font-bold" style={{ color: c }}>{m.display}</p>
              </div>
            );
          })()}
        </div>
      )}
      <div className="flex items-center justify-between px-1 pt-0.5">
        <span className="text-[10px] font-mono text-text-muted">Lifetime total</span>
        <span className="text-xs font-mono font-bold text-accent-gold">{total_hours}h</span>
      </div>
    </div>
  );
}

// ─── Main SubjectStudyTimer ─────────────────────────────────────────────────
export default function SubjectStudyTimer({
  onLogHours,
  onSynced,
  targetHours = 8,
  serverHours = 0,
  dataReady = false,
  userId = null,
}) {
  const [elapsed, setElapsed] = useState(timerStore.elapsed);
  const [running, setRunning] = useState(timerStore.running);
  const [syncState, setSyncState] = useState("idle");
  const [ringGrown, setRingGrown] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDistribution, setShowDistribution] = useState(true); // ✅ default open

  const subjectTimer = useSubjectTimer({
    userId, onLogHours, onSynced, targetHours, serverHours, dataReady,
  });

  const {
    subject, phase, error,
    showSubjectPicker, startStudy, pauseStudy, resumeStudy, resetStudy,
    todaySessions, todayTimeline, analytics, analyticsLoading, fetchAnalytics,
  } = subjectTimer;

  // ── Mirror timerStore ────────────────────────────────────────────────────
  useEffect(() => {
    setElapsed(timerStore.elapsed);
    setRunning(timerStore.running);
    return timerStore.subscribe(({ elapsed: e, running: r }) => {
      setElapsed(e);
      setRunning(r);
    });
  }, []);

  // ── Responsive ──────────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsCompact(window.innerWidth < 380);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Ring entrance animation ─────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setRingGrown(true), 150);
    return () => clearTimeout(t);
  }, []);

  // ── Bind userId to timerStore ──────────────────────────────────────────
  useEffect(() => { timerStore.setUser(userId); }, [userId]);

  // ── Register sync handler ───────────────────────────────────────────────
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

  // ── Hydrate on data ready ──────────────────────────────────────────────
  useEffect(() => {
    if (!dataReady) return;
    timerStore.hydrate(serverHours);
    const savedId = sessionStorage.getItem("upsc_active_session_id");
    if (savedId && timerStore.elapsed > 0) timerStore.autoStart();
  }, [dataReady, serverHours]);


  // ── Ring geometry ────────────────────────────────────────────────────────
  const TARGET_SECS = targetHours * 3600;
  const progress = Math.min(elapsed / TARGET_SECS, 1);
  const R = isCompact ? 45 : 54;
  const SVG_SIZE = isCompact ? 110 : 140;
  const CIRC = 2 * Math.PI * R;
  const dashOffset = CIRC * (1 - (ringGrown ? progress : 0));
  const leftSecs = Math.max(0, TARGET_SECS - elapsed);

  const subjectColor = subject
    ? (SUBJECT_COLORS[subject] || "var(--accent-gold)")
    : (running ? "#4ade80" : elapsed > 0 ? "var(--accent-gold)" : "#374151");
  const ringColor = running ? subjectColor : elapsed > 0 ? "var(--accent-gold)" : "#374151";

  const statusLabel = phase === "running"   ? (subject ? `Studying ${subject}` : "Studying")
                    : phase === "paused"    ? "Paused"
                    : phase === "selecting" ? "Pick a subject"
                    : "Ready to study";
  const statusColor = phase === "running"   ? "#4ade80"
                    : phase === "paused"    ? "var(--accent-gold)"
                    : "var(--text-muted)";

  const todayTotalSecs = todaySessions.reduce((t, s) => t + (s.duration_seconds || 0), 0);

  return (
    <div className="glass-panel p-3 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 flex-wrap">
        <Timer size={14} className="text-accent-gold shrink-0" />
        <h3 className="text-sm font-display font-semibold text-text-primary">Study Timer</h3>
        <span className="flex items-center gap-1 ml-1 sm:ml-2">
          {syncState === "syncing" && <Cloud size={11} className="text-text-muted animate-pulse" />}
          {syncState === "synced"  && <Cloud size={11} className="text-accent-green" />}
          {syncState === "error"   && <CloudOff size={11} className="text-red-400" />}
          <span className={`text-[10px] font-mono hidden sm:inline ${syncState === "synced" ? "text-accent-green" : syncState === "error" ? "text-red-400" : "text-text-muted"}`}>
            {syncState === "syncing" ? "saving…" : syncState === "synced" ? "saved" : syncState === "error" ? "sync failed" : ""}
          </span>
        </span>
        {subject && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: `${SUBJECT_COLORS[subject]}18`, color: SUBJECT_COLORS[subject], border: `0.5px solid ${SUBJECT_COLORS[subject]}40` }}>
            {SUBJECT_ICONS[subject]} {subject}
          </span>
        )}
        <span className="label-tag ml-auto text-[10px] sm:text-xs" style={{ color: statusColor, borderColor: `${statusColor}40`, background: `${statusColor}15` }}>
          {statusLabel}
        </span>
      </div>

      {/* Error banner */}
      {error && <p className="text-[11px] font-mono text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>}

      {/* Subject picker */}
      {phase === "selecting" && (
        <SubjectPicker
          onSelect={startStudy}
          onCancel={() => {
            subjectTimer.setSubject(null);
            if (!timerStore.running && timerStore.elapsed === 0) {
              subjectTimer.setSubject(null);
            }
          }}
        />
      )}

      {/* Ring + controls */}
      {phase !== "selecting" && (
        <div className={`flex ${isCompact ? "flex-col" : "flex-col sm:flex-row"} items-center gap-4 sm:gap-6`}>
          <div className="relative shrink-0" style={{ width: SVG_SIZE, height: SVG_SIZE }}>
            <svg width={SVG_SIZE} height={SVG_SIZE} viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}>
              <circle cx={SVG_SIZE/2} cy={SVG_SIZE/2} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle cx={SVG_SIZE/2} cy={SVG_SIZE/2} r={R} fill="none" stroke={ringColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={dashOffset} transform={`rotate(-90 ${SVG_SIZE/2} ${SVG_SIZE/2})`} style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.16,1,0.3,1), stroke 0.4s" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {subject && <span className="text-2xl mb-0.5">{SUBJECT_ICONS[subject]}</span>}
              <span className={`font-mono font-bold text-text-primary tabular-nums ${isCompact ? "text-base" : "text-xl"}`}>{fmtTime(elapsed)}</span>
              <span className="text-[10px] font-mono text-text-muted mt-0.5">{fmtHM(elapsed)} studied</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 sm:gap-3 flex-1 w-full">
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {[
                { label: "Today", val: fmtHM(elapsed) },
                { label: "Target", val: `${targetHours}h` },
                { label: "Left", val: fmtHM(leftSecs) },
              ].map(({ label, val }) => (
                <div key={label} className="bg-bg-muted rounded-lg p-1.5 sm:p-2 text-center">
                  <p className="text-[9px] sm:text-[10px] font-mono text-text-muted uppercase">{label}</p>
                  <p className="text-xs sm:text-sm font-display font-bold text-text-primary mt-0.5">{val}</p>
                </div>
              ))}
            </div>

            {/* Hour blocks */}
            <div>
              <p className="text-[10px] font-mono text-text-muted mb-1.5 uppercase tracking-wider">Hours completed</p>
              <div className="flex gap-0.5 sm:gap-1">
                {Array.from({ length: Math.min(targetHours, isCompact ? 8 : targetHours) }, (_, i) => {
                  const filled = elapsed >= (i + 1) * 3600;
                  const partial = !filled && elapsed > i * 3600;
                  const pct = partial ? ((elapsed - i * 3600) / 3600) * 100 : 0;
                  const fillColor = subject ? (SUBJECT_COLORS[subject] || "#10b981") : "#10b981";
                  return (
                    <div key={i} className="relative h-4 sm:h-5 rounded overflow-hidden bg-bg-muted flex-1 transition-all duration-500 ease-out" style={{ opacity: ringGrown ? 1 : 0, transform: ringGrown ? "scaleY(1)" : "scaleY(0.4)", transitionDelay: `${i * 40}ms` }}>
                      {filled && <div className="absolute inset-0 rounded" style={{ background: `linear-gradient(180deg, ${fillColor}99 0%, ${fillColor} 100%)` }} />}
                      {partial && <div className="absolute inset-y-0 left-0 rounded" style={{ width: `${pct}%`, background: running ? `linear-gradient(180deg, ${fillColor}aa 0%, ${fillColor} 100%)` : "linear-gradient(180deg, #fcd34d 0%, #d97706 100%)" }} />}
                      <span className="absolute inset-0 flex items-center justify-center text-[8px] sm:text-[9px] font-mono text-text-muted z-10">{i + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              {phase === "idle" ? (
                <button onClick={showSubjectPicker} className="btn-primary flex items-center gap-1.5 flex-1 justify-center text-xs sm:text-sm py-2.5">
                  <BookOpen size={13} /> What are you studying?
                </button>
              ) : phase === "paused" ? (
                <>
                  <button onClick={resumeStudy} className="btn-primary flex items-center gap-1.5 flex-1 justify-center text-xs sm:text-sm py-2.5">
                    <Play size={13} fill="currentColor" /> Resume {subject}
                  </button>
                  <button onClick={showSubjectPicker} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-bg-muted border border-bg-border text-text-muted hover:text-text-primary transition-colors">
                    Switch
                  </button>
                </>
              ) : (
                <button onClick={pauseStudy} className="flex items-center gap-1.5 flex-1 justify-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium bg-accent-gold/15 text-accent-gold border border-accent-gold/30 hover:bg-accent-gold/25 transition-colors">
                  <Pause size={13} fill="currentColor" /> Pause &amp; Save
                </button>
              )}
              <button onClick={resetStudy} className="btn-ghost border border-bg-border flex items-center justify-center px-2 sm:px-3 py-2 sm:py-2.5" title="Reset timer">
                <RotateCcw size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Today's sessions */}
      {todaySessions.length > 0 && phase !== "selecting" && (
        <div className="pt-1 border-t border-bg-border/50">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => setShowHistory((v) => !v)} className="flex items-center gap-1.5 text-[11px] font-mono text-text-muted hover:text-text-primary transition-colors">
              <Clock size={11} /> Today's Sessions ({todaySessions.length}) {showHistory ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>
            <span className="text-[10px] font-mono text-text-muted">{fmtHM(todayTotalSecs)} total</span>
          </div>
          {showHistory && <UserTimeline events={todayTimeline} compact />}
        </div>
      )}

      {/* Subject distribution – always open */}
      <div className="pt-1 border-t border-bg-border/50">
        <button
          onClick={() => {
            setShowDistribution((v) => !v);
            if (!showDistribution) fetchAnalytics("lifetime");
          }}
          className="flex items-center justify-between w-full text-[11px] font-mono text-text-muted hover:text-text-primary transition-colors"
        >
          <span className="flex items-center gap-1.5"><TrendingUp size={11} /> Subject Study Hours</span>
          {showDistribution ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        </button>
        {showDistribution && (
          <div className="mt-3 space-y-4">
            <SubjectDistribution analytics={analytics} loading={analyticsLoading} />
            <SubjectInsights analytics={analytics} />
          </div>
        )}
      </div>
    </div>
  );
}