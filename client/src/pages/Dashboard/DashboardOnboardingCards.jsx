/**
 * DashboardOnboardingCards v2 — Progressive preparation journey.
 *
 * This replaces the flat 6-card list with a 5-stage milestones system that
 * mirrors the actual UPSC preparation sequence, not generic SaaS onboarding.
 *
 * Stages:
 *   1. Foundation  — Set exam year, study goal, complete syllabus setup
 *   2. Consistency — Log first session, maintain 3-day streak, log 5 hours
 *   3. Practice    — Attempt first PYQ, complete 20 PYQs, take first mock
 *   4. Improvement — Write first answer, audit first notes, use AI Mentor
 *   5. Revision    — Review weak topics, clear revision queue
 *
 * How it works:
 * - Every milestone derives its "done" state from the same props already
 *   available in Dashboard.jsx (userData, todayHours, overallProgress).
 *   No new API calls introduced.
 * - Completed stages collapse into a done badge; the active stage expands
 *   to show its individual milestones.
 * - Each milestone has a dismiss button so users aren't permanently trapped.
 * - If ALL milestones across all stages are done, the component returns null
 *   (no clutter for established users).
 * - The component remembers dismissed milestones via localStorage.
 *
 * Usage (inside Dashboard.jsx, near the top of the page):
 *
 *   <DashboardOnboardingCards
 *     userData={userData}
 *     todayHours={todayHours}
 *     overallProgress={overallProgress}
 *     onNavigate={onNavigate}
 *   />
 */

import { useState } from "react";
import {
  Calendar, Target, ClipboardList,
  Clock, Flame, TrendingUp,
  BookOpen, BarChart2, FlaskConical,
  PenLine, FileSearch, Brain,
  RotateCcw, CheckCircle2,
  ArrowRight, ChevronDown, ChevronUp, X, CheckCheck,
} from "lucide-react";

/* ─── Stage + milestone definitions ─────────────────────────────────────── */
const STAGES = [
  {
    id: "foundation",
    label: "Foundation",
    color: "blue",
    description: "Set up your preparation workspace.",
    milestones: [
      {
        id: "set-exam-year",
        icon: Calendar,
        title: "Set your exam year",
        text: "Go to Profile and set your target exam date so your countdown and pacing are correct.",
        view: "profile",
        isDone: ({ userData }) => !!(userData?.profile?.examDate),
      },
      {
        id: "set-study-goal",
        icon: Target,
        title: "Set a daily study goal",
        text: "Set how many hours you plan to study each day — this powers your timer target and weekly chart.",
        view: "profile",
        isDone: ({ userData }) => (userData?.profile?.daily_target_hours || 0) > 0,
      },
      {
        id: "syllabus-setup",
        icon: ClipboardList,
        title: "Start your syllabus setup",
        text: "Open Syllabus Tracker and mark what you've already covered so your progress bars start accurate.",
        view: "syllabus",
        isDone: ({ overallProgress }) => (overallProgress || 0) > 0,
      },
    ],
  },
  {
    id: "consistency",
    label: "Consistency",
    color: "gold",
    description: "Build a daily study habit.",
    milestones: [
      {
        id: "first-session",
        icon: Clock,
        title: "Log your first study session",
        text: "Open the Study Timer on the dashboard and complete one focused block of study time.",
        view: "dashboard",
        isDone: ({ todayHours }) => (todayHours || 0) > 0,
      },
      {
        id: "three-day-streak",
        icon: Flame,
        title: "Maintain a 3-day streak",
        text: "Study for 3 consecutive days. Your streak counter is shown in the sidebar and Command Center.",
        view: "dashboard",
        isDone: ({ userData }) => (userData?.profile?.streak || 0) >= 3,
      },
      {
        id: "five-hours-total",
        icon: TrendingUp,
        title: "Log your first 5 study hours",
        text: "Reach 5 total hours of logged study time across any subject.",
        view: "dashboard",
        isDone: ({ userData }) => {
          const logs = userData?.daily_logs || [];
          const total = logs.reduce((sum, l) => sum + (l.hours || 0), 0);
          return total >= 5;
        },
      },
    ],
  },
  {
    id: "practice",
    label: "Practice",
    color: "purple",
    description: "Test yourself with PYQs and mock tests.",
    milestones: [
      {
        id: "first-pyq",
        icon: BookOpen,
        title: "Attempt your first PYQ",
        text: "Open Topic-wise Practice and attempt a few questions to see how the format works.",
        view: "pre",
        isDone: ({ userData }) => (userData?.question_attempts?.length || 0) > 0,
      },
      {
        id: "twenty-pyqs",
        icon: BarChart2,
        title: "Complete 20 PYQ attempts",
        text: "20 attempts gives the analytics engine enough data to identify your first weak areas.",
        view: "pre",
        isDone: ({ userData }) => (userData?.question_attempts?.length || 0) >= 20,
      },
      {
        id: "first-mock",
        icon: FlaskConical,
        title: "Take your first mock test",
        text: "A full timed test, scored exactly the way UPSC scores it. Weak topics auto-queue for revision.",
        view: "test-series",
        isDone: ({ userData }) =>
          (userData?.test_attempts?.length || 0) > 0 ||
          (userData?.testAttempts?.length || 0) > 0,
      },
    ],
  },
  {
    id: "improvement",
    label: "Improvement",
    color: "pink",
    description: "Use AI tools to write better and revise smarter.",
    milestones: [
      {
        id: "first-answer",
        icon: PenLine,
        title: "Write your first Mains answer",
        text: "Submit one answer in Mains Grind and see what AI feedback looks like. Score, strengths, and a topper rewrite.",
        view: "mains",
        isDone: ({ userData }) => (userData?.answers?.length || 0) > 0,
      },
      {
        id: "first-audit",
        icon: FileSearch,
        title: "Audit your first set of notes",
        text: "Paste notes into the Notes Auditor and get gaps, memory traps, and improved notes instantly.",
        view: "notes",
        isDone: ({ userData }) => (userData?.note_audits?.length || 0) > 0,
      },
      {
        id: "ai-mentor",
        icon: Brain,
        title: "Ask the AI Mentor a question",
        text: "Open the AI Mentor and ask it anything — a concept, current affairs angle, or strategy question.",
        view: "ai-mentor",
        isDone: ({ userData }) => (userData?.mentor_sessions?.length || 0) > 0,
      },
    ],
  },
  {
    id: "revision",
    label: "Revision",
    color: "green",
    description: "Make sure nothing you've studied gets forgotten.",
    milestones: [
      {
        id: "review-weak-topics",
        icon: RotateCcw,
        title: "Review your first weak topics",
        text: "Once a mock or PYQ session flags weak areas, open the Revision Queue and start reviewing them.",
        view: "dashboard",
        isDone: ({ userData }) =>
          (userData?.spaced_repetition?.length || 0) > 0 ||
          (userData?.revision_queue?.length || 0) > 0,
      },
      {
        id: "clear-revision-queue",
        icon: CheckCheck,
        title: "Clear your revision queue once",
        text: "Work through all due topics in the Revision Queue at least one time.",
        view: "dashboard",
        isDone: ({ userData }) => {
          const queue = userData?.revision_queue || userData?.spaced_repetition || [];
          return queue.length > 0 && queue.every((item) => item.reviewed || item.status === "done");
        },
      },
    ],
  },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function getStageState(stage, ctx, dismissed) {
  const milestones = stage.milestones.map((m) => ({
    ...m,
    done: m.isDone(ctx),
    dismissed: dismissed.has(m.id),
  }));
  const totalDone = milestones.filter((m) => m.done || m.dismissed).length;
  const allDone = totalDone === milestones.length;
  return { milestones, allDone, totalDone };
}

/* ─── Stage header ───────────────────────────────────────────────────────── */
function StageHeader({ stage, state, isOpen, onToggle }) {
  const { allDone, totalDone, milestones } = state;
  const pct = Math.round((totalDone / milestones.length) * 100);

  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
      style={{
        background: allDone
          ? `var(--accent-${stage.color}-dim)`
          : isOpen
          ? "var(--bg-surface)"
          : "var(--bg-muted)",
        borderColor: allDone
          ? `color-mix(in srgb, var(--accent-${stage.color}) 40%, transparent)`
          : isOpen
          ? `var(--accent-${stage.color})`
          : "var(--bg-border)",
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        {allDone ? (
          <CheckCircle2
            size={16}
            style={{ color: `var(--accent-${stage.color})`, flexShrink: 0 }}
          />
        ) : (
          <div
            className="w-4 h-4 rounded-full border-2 shrink-0"
            style={{ borderColor: `var(--accent-${stage.color})` }}
          />
        )}
        <div className="min-w-0 text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-primary">{stage.label}</span>
            <span
              className="text-[10px] font-mono"
              style={{ color: `var(--accent-${stage.color})` }}
            >
              {totalDone}/{milestones.length}
            </span>
          </div>
          <p className="text-xs text-text-muted hidden sm:block">{stage.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        {/* Mini progress bar */}
        <div className="w-16 h-1.5 rounded-full bg-bg-muted hidden sm:block">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: `var(--accent-${stage.color})`,
            }}
          />
        </div>
        {isOpen ? (
          <ChevronUp size={15} className="text-text-muted" />
        ) : (
          <ChevronDown size={15} className="text-text-muted" />
        )}
      </div>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   Main component
   ════════════════════════════════════════════════════════════════════════════ */
export default function DashboardOnboardingCards({
  userData,
  todayHours = 0,
  overallProgress = 0,
  onNavigate,
}) {
  /* Persistent dismissed set */
  const [dismissed, setDismissed] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("upsc-dismissed-milestones") || "[]"));
    } catch {
      return new Set();
    }
  });

  const dismiss = (id) => {
    setDismissed((prev) => {
      const next = new Set(prev).add(id);
      try {
        localStorage.setItem("upsc-dismissed-milestones", JSON.stringify([...next]));
      } catch { /* non-fatal */ }
      return next;
    });
  };

  /* Which stage is open (default: first incomplete stage) */
  const ctx = { userData, todayHours, overallProgress };

  const stageStates = STAGES.map((s) => getStageState(s, ctx, dismissed));
  const firstIncomplete = stageStates.findIndex((s) => !s.allDone);

  const [openStage, setOpenStage] = useState(
    firstIncomplete >= 0 ? firstIncomplete : 0
  );

  /* If every milestone across every stage is done/dismissed, hide the panel */
  const totalMilestones = STAGES.reduce((s, st) => s + st.milestones.length, 0);
  const totalDoneOrDismissed = stageStates.reduce((sum, s) => {
    return sum + s.milestones.filter((m) => m.done || m.dismissed).length;
  }, 0);

  if (totalDoneOrDismissed === totalMilestones) return null;

  /* Overall progress */
  const overallPct = Math.round((totalDoneOrDismissed / totalMilestones) * 100);

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-text-muted">
            Preparation Journey
          </h3>
          <p className="text-[10px] text-text-muted mt-0.5">
            {totalDoneOrDismissed} of {totalMilestones} milestones complete
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 rounded-full bg-bg-muted hidden sm:block">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${overallPct}%`,
                background: "var(--accent-gold)",
                boxShadow: "0 0 8px rgba(201,168,76,0.4)",
              }}
            />
          </div>
          <span className="text-xs font-mono text-accent-gold">{overallPct}%</span>
        </div>
      </div>

      {/* Stages */}
      <div className="space-y-2">
        {STAGES.map((stage, stageIndex) => {
          const state = stageStates[stageIndex];
          const isOpen = openStage === stageIndex;

          return (
            <div key={stage.id}>
              <StageHeader
                stage={stage}
                state={state}
                isOpen={isOpen}
                onToggle={() => setOpenStage(isOpen ? -1 : stageIndex)}
              />

              {/* Milestone cards */}
              {isOpen && !state.allDone && (
                <div className="mt-2 grid sm:grid-cols-3 gap-2 pl-0">
                  {state.milestones
                    .filter((m) => !m.done && !m.dismissed)
                    .map((m) => {
                      const Icon = m.icon;
                      return (
                        <div
                          key={m.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => onNavigate?.(m.view)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") onNavigate?.(m.view);
                          }}
                          className="elevated-panel p-4 relative cursor-pointer transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
                        >
                          <button
                            onClick={(e) => { e.stopPropagation(); dismiss(m.id); }}
                            aria-label="Dismiss milestone"
                            className="absolute top-2.5 right-2.5 w-6 h-6 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-muted transition-colors"
                          >
                            <X size={12} />
                          </button>

                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5"
                            style={{ background: `var(--accent-${stage.color}-dim)` }}
                          >
                            <Icon size={14} style={{ color: `var(--accent-${stage.color})` }} />
                          </div>

                          <p className="text-sm font-semibold mb-1 pr-5 leading-snug">{m.title}</p>
                          <p className="text-xs text-text-secondary leading-relaxed mb-2.5">{m.text}</p>

                          <span
                            className="inline-flex items-center gap-1 text-xs font-medium"
                            style={{ color: `var(--accent-${stage.color})` }}
                          >
                            Start
                            <ArrowRight size={11} />
                          </span>
                        </div>
                      );
                    })}

                  {/* Already-done milestones in this stage — show as quiet done badges */}
                  {state.milestones
                    .filter((m) => m.done)
                    .map((m) => {
                      const Icon = m.icon;
                      return (
                        <div
                          key={m.id}
                          className="elevated-panel p-4 opacity-50"
                          style={{ background: `var(--accent-${stage.color}-dim)` }}
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle2
                              size={14}
                              style={{ color: `var(--accent-${stage.color})` }}
                            />
                            <p className="text-xs font-semibold text-text-secondary line-through">
                              {m.title}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Stage fully done — compact done state */}
              {isOpen && state.allDone && (
                <div
                  className="mt-2 rounded-xl p-3 flex items-center gap-2"
                  style={{ background: `var(--accent-${stage.color}-dim)` }}
                >
                  <CheckCircle2 size={14} style={{ color: `var(--accent-${stage.color})` }} />
                  <p className="text-xs text-text-secondary">
                    All {stage.label.toLowerCase()} milestones complete.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}