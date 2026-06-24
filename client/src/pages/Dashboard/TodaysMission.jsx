/**
 * TodaysMission — "What should I do today?" widget for the Dashboard.
 *
 * This is a self-contained component that composes Today's Mission from
 * the same props already flowing through Dashboard.jsx. It sits just below
 * the Command Center stat row so that every logged-in user sees their
 * daily agenda before anything else.
 *
 * Mission items are derived from actual data:
 * - Study target from userData.profile.daily_target_hours (vs todayHours)
 * - Syllabus topic completion from overallProgress
 * - PYQ target from userData.question_attempts (vs a daily PYQ goal)
 * - Revision queue from userData.revision_queue / spaced_repetition
 *
 * If the user has hit all their targets for today, shows a congratulations
 * state instead of an empty card.
 *
 * Also exports:
 * - ImprovedActionHub — reordered Start Studying cards (Practice → Mock →
 *   Answer Eval → Notes Auditor) matching the README's recommended hierarchy.
 *
 * Usage:
 *   import { TodaysMission, ImprovedActionHub } from "./TodaysMission";
 *
 *   // In Dashboard.jsx, replace or supplement ActionHub:
 *   <TodaysMission
 *     userData={userData}
 *     todayHours={todayHours}
 *     overallProgress={overallProgress}
 *     onNavigate={onNavigate}
 *   />
 *   <ImprovedActionHub onNavigate={onNavigate} />
 */

import { useState, useEffect } from "react";
import {
  Clock, BookOpen, FlaskConical, RotateCcw, CheckCircle2,
  Rocket, FileSearch, BookOpenCheck, Target, Flame,
  ChevronRight, Award, ArrowRight,
} from "lucide-react";

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function fmtHM(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/* ─── Build today's mission items ────────────────────────────────────────── */
function buildMission({ userData, todayHours, overallProgress }) {
  const targetHours = userData?.profile?.daily_target_hours || 4;
  const studiedHours = todayHours || 0;
  const studyDone = studiedHours >= targetHours;

  const revisionQueue = userData?.revision_queue || userData?.spaced_repetition || [];
  const dueRevisions = revisionQueue.filter(
    (item) => !item.reviewed && item.status !== "done"
  );

  const attemptsToday = (() => {
    const today = new Date().toISOString().split("T")[0];
    return (userData?.question_attempts || []).filter(
      (a) => (a.date || a.created_at || "").startsWith(today)
    );
  })();

  const pyqTarget = 10;
  const pyqDone = attemptsToday.length >= pyqTarget;

  return [
    {
      id: "study",
      icon: Clock,
      color: "gold",
      label: "Study",
      text: studyDone
        ? `${fmtHM(Math.round(studiedHours * 3600))} studied — target hit`
        : `Study ${targetHours}h today`,
      sub: studyDone ? null : `${fmtHM(Math.round(studiedHours * 3600))} / ${targetHours}h done`,
      done: studyDone,
      pct: Math.min(100, Math.round((studiedHours / targetHours) * 100)),
      view: "dashboard",
    },
    {
      id: "pyq",
      icon: BookOpen,
      color: "purple",
      label: "Practice",
      text: pyqDone
        ? `${attemptsToday.length} PYQs completed today`
        : `Attempt ${pyqTarget} PYQs today`,
      sub: pyqDone ? null : `${attemptsToday.length} / ${pyqTarget} done`,
      done: pyqDone,
      pct: Math.min(100, Math.round((attemptsToday.length / pyqTarget) * 100)),
      view: "pre",
    },
    {
      id: "revision",
      icon: RotateCcw,
      color: "green",
      label: "Revision",
      text: dueRevisions.length === 0
        ? "Revision queue is clear"
        : `Review ${Math.min(dueRevisions.length, 5)} revision topics`,
      sub: dueRevisions.length > 0 ? `${dueRevisions.length} topics due` : null,
      done: dueRevisions.length === 0,
      pct: dueRevisions.length === 0 ? 100 : 0,
      view: "dashboard",
    },
    {
      id: "coverage",
      icon: Target,
      color: "blue",
      label: "Coverage",
      text: overallProgress >= 5
        ? `Syllabus at ${Math.round(overallProgress)}% coverage`
        : "Complete a syllabus module today",
      sub: overallProgress < 5 ? "Open Syllabus Tracker" : null,
      done: overallProgress >= 5,
      pct: Math.min(100, Math.round(overallProgress)),
      view: "syllabus",
    },
  ];
}

/* ════════════════════════════════════════════════════════════════════════════
   TodaysMission
   ════════════════════════════════════════════════════════════════════════════ */
export function TodaysMission({ userData, todayHours = 0, overallProgress = 0, onNavigate }) {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGrown(true), 100);
    return () => clearTimeout(t);
  }, []);

  const items = buildMission({ userData, todayHours, overallProgress });
  const doneCount = items.filter((i) => i.done).length;
  const allDone = doneCount === items.length;
  const overallPct = Math.round((doneCount / items.length) * 100);

  if (allDone) {
    return (
      <div
        className="glass-panel p-4 sm:p-5 flex items-center gap-4"
        style={{ borderColor: "var(--accent-gold)", background: "var(--accent-gold-dim)" }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "var(--accent-gold)", color: "#fff" }}
        >
          <Award size={18} />
        </div>
        <div>
          <p className="font-semibold text-text-primary text-sm sm:text-base">
            Today's mission complete.
          </p>
          <p className="text-xs text-text-secondary mt-0.5">
            All daily targets hit — rest, or go deeper on your weak topics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-3 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame size={14} className="text-accent-gold" />
          <h3 className="text-sm font-display font-bold text-text-primary">Today's Mission</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 rounded-full bg-bg-muted">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: grown ? `${overallPct}%` : "0%",
                background: "var(--accent-gold)",
                boxShadow: "0 0 8px rgba(201,168,76,0.35)",
              }}
            />
          </div>
          <span className="text-xs font-mono text-accent-gold">{doneCount}/{items.length}</span>
        </div>
      </div>

      {/* Mission items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              role={item.done ? "presentation" : "button"}
              tabIndex={item.done ? -1 : 0}
              onClick={() => !item.done && onNavigate?.(item.view)}
              onKeyDown={(e) => {
                if (!item.done && (e.key === "Enter" || e.key === " ")) onNavigate?.(item.view);
              }}
              className={`relative rounded-xl p-3.5 border transition-all duration-200 ${
                item.done ? "" : "cursor-pointer hover:border-opacity-80 active:scale-[0.98]"
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold`}
              style={{
                background: item.done
                  ? `var(--accent-${item.color}-dim)`
                  : "var(--bg-surface)",
                borderColor: item.done
                  ? `color-mix(in srgb, var(--accent-${item.color}) 40%, transparent)`
                  : "var(--bg-border)",
                opacity: grown ? 1 : 0,
                transform: grown ? "translateY(0)" : "translateY(10px)",
                transition: `opacity 0.4s ease ${i * 60}ms, transform 0.4s ease ${i * 60}ms`,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: `var(--accent-${item.color}-dim)` }}
                  >
                    {item.done ? (
                      <CheckCircle2 size={13} style={{ color: `var(--accent-${item.color})` }} />
                    ) : (
                      <Icon size={13} style={{ color: `var(--accent-${item.color})` }} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-mono uppercase tracking-wider mb-0.5`}
                      style={{ color: `var(--accent-${item.color})` }}
                    >
                      {item.label}
                    </p>
                    <p
                      className={`text-sm font-semibold leading-snug ${
                        item.done ? "text-text-secondary line-through opacity-70" : "text-text-primary"
                      }`}
                    >
                      {item.text}
                    </p>
                    {item.sub && (
                      <p className="text-xs text-text-muted mt-0.5">{item.sub}</p>
                    )}
                  </div>
                </div>
                {!item.done && (
                  <ChevronRight
                    size={14}
                    className="text-text-muted shrink-0 mt-1"
                  />
                )}
              </div>

              {/* Progress bar */}
              {!item.done && item.pct > 0 && (
                <div className="mt-2.5 h-1 rounded-full bg-bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: grown ? `${item.pct}%` : "0%",
                      background: `var(--accent-${item.color})`,
                      transitionDelay: `${i * 60 + 300}ms`,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   ImprovedActionHub
   Reordered per README: Practice → Mock → Answer Eval → Notes Auditor
   ════════════════════════════════════════════════════════════════════════════ */
export function ImprovedActionHub({ onNavigate }) {
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setGrown(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Order: 1 Topic-wise Practice, 2 Mock Tests, 3 Answer Evaluation, 4 Notes Auditor
  const actions = [
    {
      icon: BookOpenCheck,
      iconColor: "#34d399",
      gradFrom: "rgba(16,185,129,0.12)",
      gradTo:   "rgba(16,185,129,0.04)",
      border:   "rgba(16,185,129,0.25)",
      glow:     "rgba(16,185,129,0.15)",
      title: "Topic-wise Practice",
      desc: "Practice PYQs topic-wise and automatically update syllabus progress when questions are completed.",
      cta: "Practice Questions",
      view: "pre",
    },
    {
      icon: FlaskConical,
      iconColor: "#f472b6",
      gradFrom: "rgba(236,72,153,0.12)",
      gradTo:   "rgba(236,72,153,0.04)",
      border:   "rgba(236,72,153,0.25)",
      glow:     "rgba(236,72,153,0.15)",
      title: "Mock Test Series",
      desc: "Attempt a timed UPSC test. After completion: analyze performance, identify weak areas, and push weak topics into the AI Revision Queue automatically.",
      cta: "Start Test",
      view: "test-series",
    },
    {
      icon: Rocket,
      iconColor: "#f59e0b",
      gradFrom: "rgba(245,158,11,0.12)",
      gradTo:   "rgba(245,158,11,0.04)",
      border:   "rgba(245,158,11,0.25)",
      glow:     "rgba(245,158,11,0.15)",
      title: "Answer Evaluation",
      desc: "Evaluate your GS/Mains answer in seconds. Get score, strengths, weaknesses, keyword coverage, structural feedback and a topper-style rewritten answer.",
      cta: "Evaluate Answer",
      view: "mains",
    },
    {
      icon: FileSearch,
      iconColor: "#818cf8",
      gradFrom: "rgba(99,102,241,0.12)",
      gradTo:   "rgba(99,102,241,0.04)",
      border:   "rgba(99,102,241,0.25)",
      glow:     "rgba(99,102,241,0.15)",
      title: "Audit Notes",
      desc: "Check gaps in your notes instantly. Get missing points, memory traps, 30-second revision cards and improved notes.",
      cta: "Audit Notes",
      view: "notes",
    },
  ];

  return (
    <div className="glass-panel p-3 sm:p-5 space-y-3 sm:space-y-4">
      <div className="flex items-center gap-2">
        <Rocket size={14} className="text-accent-gold shrink-0" />
        <div>
          <h3 className="text-sm sm:text-base font-display font-bold text-text-primary leading-tight">
            Start Studying
          </h3>
          <p className="text-[10px] sm:text-xs font-mono text-text-muted mt-0.5">
            Choose what you want to work on right now.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        {actions.map(({ icon: Icon, iconColor, gradFrom, gradTo, border, glow, title, desc, cta, view }, i) => (
          <div
            key={title}
            className="relative rounded-xl p-3.5 sm:p-4 flex flex-col gap-2.5 sm:gap-3 cursor-pointer group
                       transition-all duration-300 ease-out hover:-translate-y-0.5 active:scale-[0.98]
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
            tabIndex={0}
            role="button"
            style={{
              background: `linear-gradient(135deg, ${gradFrom} 0%, ${gradTo} 100%)`,
              border: `1px solid ${border}`,
              boxShadow: `0 2px 16px ${glow}`,
              opacity: grown ? 1 : 0,
              transform: grown ? "translateY(0)" : "translateY(14px)",
              transition: `opacity 0.45s ease ${i * 80}ms, transform 0.45s ease ${i * 80}ms, box-shadow 0.2s ease`,
            }}
            onClick={() => onNavigate?.(view)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onNavigate?.(view);
            }}
          >
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${gradFrom}`, border: `1px solid ${border}` }}
            >
              <Icon size={16} style={{ color: iconColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-display font-semibold text-sm sm:text-[15px] text-text-primary mb-1 leading-tight">
                {title}
              </h4>
              <p className="text-[12px] sm:text-xs text-text-secondary leading-relaxed">
                {desc}
              </p>
            </div>
            <div
              className="flex items-center gap-1 text-xs font-semibold mt-auto"
              style={{ color: iconColor }}
            >
              {cta}
              <ArrowRight size={12} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}