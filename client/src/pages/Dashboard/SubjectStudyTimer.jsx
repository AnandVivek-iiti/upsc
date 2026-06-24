import { useState, useEffect, useCallback, useRef } from "react";
import {
  Play, Pause, RotateCcw, Timer, Cloud, CloudOff,
  BookOpen, ChevronDown, ChevronUp, Clock, Edit3,
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
// Single prompt for "today's topic": pick a subject (required) and, optionally,
// a chapter/topic detail. Nothing starts until the student confirms — this is
// the gate that stops the timer ever running without a topic attached, and
// keeps the topic shown in sync with the subject actually being timed.
function SubjectPicker({ initialSubject = null, initialChapter = "", onConfirm, onCancel, confirmLabel = "Start Studying" }) {
  const [selected, setSelected] = useState(initialSubject);
  const [chapter, setChapterInput] = useState(initialChapter);
  const [hovered, setHovered] = useState(null);

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm font-display font-semibold text-text-primary">What are you studying today?</p>
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
          const isSelected = selected === s;
          const isHovered = hovered === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setSelected(s)}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(null)}
              className="flex flex-col items-center justify-center gap-1.5 p-2.5 sm:p-3 rounded-xl border transition-all duration-150 active:scale-95 touch-manipulation"
              style={{
                borderColor: isSelected ? color : isHovered ? color : "var(--bg-border)",
                background: isSelected ? `${color}22` : isHovered ? `${color}15` : "var(--bg-muted)",
                boxShadow: isSelected ? `0 0 0 1px ${color}55` : "none",
              }}
            >
              <span className="text-xl leading-none">{icon}</span>
              <span className="text-[10px] sm:text-[11px] font-mono font-semibold text-center leading-tight" style={{ color: isSelected || isHovered ? color : "var(--text-secondary)" }}>
                {s}
              </span>
            </button>
          );
        })}
      </div>

      {/* Chapter / topic — optional, kept on the same prompt so it's always in sync with the subject */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-[10px] font-mono text-text-muted uppercase tracking-wider">
          <BookOpen size={10} /> Chapter / topic <span className="text-text-muted/60 normal-case">(optional)</span>
        </label>
        <input
          type="text"
          value={chapter}
          onChange={(e) => setChapterInput(e.target.value)}
          placeholder="e.g. Fundamental Rights, Mughal Empire…"
          maxLength={80}
          className="w-full bg-bg-muted border border-bg-border rounded-lg px-3 py-2 text-xs sm:text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-gold/50 transition-colors"
        />
      </div>

      <button
        type="button"
        onClick={() => selected && onConfirm(selected, chapter.trim())}
        disabled={!selected}
        className="btn-primary w-full flex items-center justify-center gap-1.5 text-xs sm:text-sm py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Play size={13} fill="currentColor" /> {confirmLabel}
      </button>
    </div>
  );
}

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

  const subjectTimer = useSubjectTimer({
    userId, onLogHours, onSynced, targetHours, serverHours, dataReady,
  });

  const {
    subject, chapter, phase, error,
    showSubjectPicker, startStudy, pauseStudy, resumeStudy, resetStudy, setPhase,
    todaySessions, todayTimeline,
  } = subjectTimer;

  // Remembers the phase to fall back to if the student cancels out of the
  // picker, so "Cancel" never strands them on the picker screen and never
  // wipes a topic/session that was already in progress.
  const previousPhaseRef = useRef(phase);

  // Opens the subject/topic picker. If a session is currently running, it is
  // paused (and its hours synced) first — this is what keeps "today's topic"
  // and "the subject actually being timed" from ever drifting apart: you can
  // never have a new topic selected while an old one is still silently ticking.
  const openPicker = useCallback(async () => {
    if (phase === "running") {
      await pauseStudy();
      previousPhaseRef.current = "paused";
    } else {
      previousPhaseRef.current = phase;
    }
    showSubjectPicker();
  }, [phase, pauseStudy, showSubjectPicker]);

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
  // timerStore can invoke this independently of pauseStudy() above (e.g. on
  // its own auto-sync). Keeping the note here built from the same
  // subject/chapter means there's no path where an hours-log can show up
  // without today's topic attached.
  useEffect(() => {
    timerStore.setSyncHandler(async (hours) => {
      setSyncState("syncing");
      try {
        const note = subject
          ? (chapter ? `${subject} — ${chapter} session` : `${subject} session`)
          : "Timer session";
        await onLogHours(hours, note);
        setSyncState("synced");
        onSynced?.(hours);
        setTimeout(() => setSyncState("idle"), 2500);
      } catch {
        setSyncState("error");
        setTimeout(() => setSyncState("idle"), 3000);
      }
    });
  }, [onLogHours, onSynced, subject, chapter]);

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
                    : phase === "selecting" ? "Pick today's topic"
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
          <span className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: `${SUBJECT_COLORS[subject]}18`, color: SUBJECT_COLORS[subject], border: `0.5px solid ${SUBJECT_COLORS[subject]}40` }}>
              {SUBJECT_ICONS[subject]} {subject}{chapter ? ` — ${chapter}` : ""}
            </span>
            {phase !== "selecting" && (
              <button
                onClick={openPicker}
                title="Edit today's topic"
                className="flex items-center gap-0.5 text-[10px] font-mono text-text-muted hover:text-accent-gold transition-colors"
              >
                <Edit3 size={10} /> Edit
              </button>
            )}
          </span>
        )}
        <span className="label-tag ml-auto text-[10px] sm:text-xs" style={{ color: statusColor, borderColor: `${statusColor}40`, background: `${statusColor}15` }}>
          {statusLabel}
        </span>
      </div>

      {/* Error banner */}
      {error && <p className="text-[11px] font-mono text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>}

      {/* Subject picker — this is "today's topic": one prompt, then the timer starts */}
      {phase === "selecting" && (
        <SubjectPicker
          initialSubject={subject}
          initialChapter={chapter}
          confirmLabel={subject ? "Update & Continue" : "Start Studying"}
          onConfirm={(selectedSubject, selectedChapter) => startStudy(selectedSubject, selectedChapter)}
          onCancel={() => setPhase(previousPhaseRef.current)}
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
                <button onClick={openPicker} className="btn-primary flex items-center gap-1.5 flex-1 justify-center text-xs sm:text-sm py-2.5">
                  <BookOpen size={13} /> Set Today's Topic &amp; Start
                </button>
              ) : phase === "paused" ? (
                <>
                  <button onClick={resumeStudy} className="btn-primary flex items-center gap-1.5 flex-1 justify-center text-xs sm:text-sm py-2.5">
                    <Play size={13} fill="currentColor" /> Resume {subject}
                  </button>
                  <button onClick={openPicker} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-bg-muted border border-bg-border text-text-muted hover:text-text-primary transition-colors">
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
    </div>
  );
}