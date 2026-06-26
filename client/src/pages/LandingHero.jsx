

import { useEffect, useRef, useState } from "react";
import {
  BookOpen, Brain, BarChart2, Clock, ArrowRight, CheckCircle2, Sun, Moon,
  Zap, Target, Calendar, PenLine, ClipboardList, TrendingUp,
  RotateCcw, GraduationCap, Users, Layers, AlarmClock, Award,
  Flame, MapPin, Command, Activity, FileSearch, Rocket, BookOpenCheck,
  FlaskConical, ChevronRight, Play,
} from "lucide-react";
const SS = {
  commandCenter:    "/assets/Screenshots/screenshot-command-center.png",
  studyAnalytics:   "/assets/Screenshots/screenshot-study-analytics.png",
  practiceAnalytics:"/assets/Screenshots/screenshot-practice-analytics.png",
  revisionQueue:    "/assets/Screenshots/screenshot-revision-queue.png",
  startStudying:    "/assets/Screenshots/screenshot-start-studying.png",
  syllabusTracker:  "/assets/Screenshots/screenshot-syllabus-tracker.png",
  answerEval:       "/assets/Screenshots/screenshot-answer-eval.png",
  subjectPerf:      "/assets/Screenshots/screenshot-subject-perf.png"
};

/* ─── Reveal-on-scroll ───────────────────────────────────────────────────── */
function Reveal({ children, className = "", as: Tag = "div", delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`${className} ${visible ? "animate-rise" : "opacity-0"}`}
      style={visible && delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

/* ─── Section eyebrow ────────────────────────────────────────────────────── */
function Eyebrow({ children, color = "gold" }) {
  return (
    <span
      className="label-tag inline-flex items-center gap-1.5 normal-case tracking-[0.12em] uppercase"
      style={{
        color: `var(--accent-${color})`,
        background: `var(--accent-${color}-dim)`,
        borderColor: `var(--accent-${color})`,
        opacity: 0.95,
      }}
    >
      {children}
    </span>
  );
}

/* ─── Screenshot frame ───────────────────────────────────────────────────────
   Wraps a real product screenshot in a consistent browser-chrome-style frame.
   Falls back to a labelled placeholder if the src hasn't been wired up yet.
   ─────────────────────────────────────────────────────────────────────────── */
function ScreenshotFrame({ src, alt, caption, className = "" }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div className={`${className}`}>
      <div
        className="rounded-xl overflow-hidden border border-bg-border shadow-lg"
        style={{ background: "var(--bg-surface)" }}
      >
        {/* Browser chrome bar */}
        <div
          className="flex items-center gap-1.5 px-3 py-2 border-b border-bg-border"
          style={{ background: "var(--bg-muted)" }}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
          <span className="ml-2 flex-1 h-5 rounded-md bg-bg-border/60 text-[10px] font-mono text-text-muted flex items-center px-2">
            upscbyiitians.com
          </span>
        </div>

        {/* Screenshot image */}
        {!errored ? (
          <div className="relative">
            {!loaded && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: "var(--bg-base)", minHeight: "200px" }}
              >
                <div className="text-center">
                  <div
                    className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center"
                    style={{ background: "var(--accent-gold-dim)" }}
                  >
                    <Activity size={18} style={{ color: "var(--accent-gold)" }} />
                  </div>
                  <p className="text-xs text-text-muted font-mono">{alt}</p>
                </div>
              </div>
            )}
            <img
              src={src}
              alt={alt}
              onLoad={() => setLoaded(true)}
              onError={() => setErrored(true)}
              className="w-full object-cover object-top transition-opacity duration-300"
              style={{ opacity: loaded ? 1 : 0, maxHeight: "420px" }}
            />
          </div>
        ) : (
          /* Placeholder shown when screenshot file isn't deployed yet */
          <div
            className="flex flex-col items-center justify-center gap-3 p-8"
            style={{ background: "var(--bg-base)", minHeight: "220px" }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--accent-gold-dim)" }}
            >
              <Activity size={20} style={{ color: "var(--accent-gold)" }} />
            </div>
            <p className="text-sm font-semibold text-text-primary text-center">{alt}</p>
            <p className="text-xs text-text-muted font-mono text-center max-w-[220px]">
              Screenshot preview - deploy to see the real UI
            </p>
            <span
              className="label-tag text-[10px] font-mono"
              style={{ color: "var(--accent-gold)", background: "var(--accent-gold-dim)", borderColor: "var(--accent-gold)" }}
            >
              {src}
            </span>
          </div>
        )}
      </div>

      {caption && (
        <p className="text-center text-xs text-text-muted mt-2.5 font-mono">{caption}</p>
      )}
    </div>
  );
}

/* ─── Workspace tour section data ────────────────────────────────────────── */
const WORKSPACE_SECTIONS = [
  {
    id: "command-center",
    color: "gold",
    icon: Command,
    eyebrow: "Command Center",
    title: "Your daily preparation overview. Every morning.",
    description:
      "Open UPSC Mentor and know exactly where you stand in under 3 seconds. Exam countdown, streak, syllabus coverage, daily target, and 7-day average - all in one glance.",
    bullets: [
      { label: "Exam Countdown", text: "Days to Prelims and Mains, always visible." },
      { label: "Study Streak", text: "Daily habit tracking to keep you consistent." },
      { label: "Coverage %", text: "Syllabus completion across all GS papers." },
      { label: "Daily Target", text: "Progress toward today's hour goal." },
    ],
    screenshot: SS.commandCenter,
    ssAlt: "Command Center - daily preparation overview",
  },
  {
    id: "study-analytics",
    color: "blue",
    icon: BarChart2,
    eyebrow: "Study Analytics",
    title: "Know exactly where your time is actually going.",
    description:
      "The study timer tags every session to a subject. Over time, you see a clear picture of your coverage - which subjects are getting attention and which are quietly getting skipped.",
    bullets: [
      { label: "Subject Breakdown", text: "Hours per subject, ranked by time spent." },
      { label: "Weekly Chart", text: "Bar chart of daily hours vs target, 7-day view." },
      { label: "Consistency Tracking", text: "Days hit vs days missed, honest and plain." },
      { label: "Paper Coverage", text: "Prelims and Mains coverage side by side." },
    ],
    screenshot: SS.studyAnalytics,
    ssAlt: "Study Analytics - subject hours and weekly chart",
  },
  {
    id: "practice-analytics",
    color: "purple",
    icon: Target,
    eyebrow: "Practice Analytics",
    title: "Stop guessing your weak areas. The data shows them.",
    description:
      "Every PYQ and mock test attempt feeds a live analytics panel. Accuracy by subject, difficulty breakdown, and year-wise performance - so you're revising what actually needs work.",
    bullets: [
      { label: "Accuracy", text: "Correct ÷ attempted, per subject and overall." },
      { label: "Difficulty Breakdown", text: "How you perform across Easy / Medium / Hard." },
      { label: "Year-wise Chart", text: "PYQ attempts plotted against exam years." },
      { label: "Weak Subject Flags", text: "Subjects below threshold flagged automatically." },
    ],
    screenshot: SS.practiceAnalytics,
    ssAlt: "Practice Analytics - accuracy, difficulty, year-wise performance",
  },
  {
    id: "revision-queue",
    color: "green",
    icon: RotateCcw,
    eyebrow: "Revision Queue",
    title: "Never let a completed topic quietly fade from memory.",
    description:
      "Topics you've studied or where you've made mistakes are scheduled for spaced revision automatically. The queue shows what's due today so you review at exactly the right moment.",
    bullets: [
      { label: "Spaced Revision", text: "AI-scheduled review at optimal intervals." },
      { label: "Weak Topic Tracking", text: "Mock and PYQ mistakes go straight into the queue." },
      { label: "Due Today", text: "Clear list of topics that need review right now." },
      { label: "Auto-scheduling", text: "Nothing to configure - it just works." },
    ],
    screenshot: SS.revisionQueue,
    ssAlt: "Revision Queue - spaced review schedule",
  },
  {
    id: "advanced-tools",
    color: "pink",
    icon: Brain,
    eyebrow: "Advanced Preparation",
    title: "AI-powered tools for when you're ready to go deeper.",
    description:
      "Once you're writing answers and testing regularly, these three tools move your preparation to a different level. Not primary tools - but powerful ones.",
    bullets: [
      { label: "Answer Evaluation", text: "Submit any Mains answer. Get score, strengths, weaknesses, and a topper-style rewrite within seconds." },
      { label: "Notes Auditor", text: "Paste your notes. Get gaps, memory traps, 30-second revision cards, and improved notes instantly." },
      { label: "AI Mentor", text: "Ask anything about UPSC - concepts, current affairs, strategy. Context-aware across your preparation history." },
    ],
    screenshot: SS.answerEval,
    ssAlt: "AI Answer Evaluation - score, feedback, topper comparison",
    note: "Advanced tools - most valuable once you are already studying, practising, and writing consistently.",
  },
];

/* ─── Content arrays ─────────────────────────────────────────────────────── */
const PAIN_POINTS = [
  { icon: ClipboardList, text: "Losing track of the syllabus" },
  { icon: AlarmClock,    text: "Inconsistent study habits" },
  { icon: PenLine,       text: "No feedback on your answers" },
  { icon: RotateCcw,     text: "Weak revision planning" },
  { icon: Layers,        text: "Preparation resources scattered everywhere" },
];

const SCATTERED_TOOLS = [
  "Timer App", "Notes App", "PYQ Source", "Mock Test Platform",
  "Answer Evaluation", "Mentorship", "Revision Tracker",
];

const TRUST_ITEMS = [
  { icon: Users,        text: "Built from real UPSC preparation challenges." },
  { icon: GraduationCap, text: "Used by serious UPSC aspirants." },
  { icon: Award,        text: "Trusted by students from IITs and top institutions." },
  { icon: Layers,       text: "Designed to eliminate preparation fragmentation." },
];

/* ─── Screenshot showcase (dashboard overview grid) ─────────────────────── */
const SHOWCASE_SCREENS = [
  { src: SS.commandCenter,     alt: "Dashboard Overview",   caption: "Command Center - your daily mission" },
  { src: SS.studyAnalytics,    alt: "Study Analytics",      caption: "Subject hours + weekly chart" },
  { src: SS.practiceAnalytics, alt: "Practice Analytics",   caption: "Accuracy, difficulty, year-wise" },
  { src: SS.revisionQueue,     alt: "Revision Queue",       caption: "Spaced revision, auto-scheduled" },
  { src: SS.startStudying,     alt: "Start Studying",       caption: "One-click access to every tool" },
  { src: SS.syllabusTracker,   alt: "Syllabus Tracker",     caption: "Full Prelims + Mains coverage map" },
];

/* ════════════════════════════════════════════════════════════════════════════
   Main component
   ════════════════════════════════════════════════════════════════════════════ */
export default function LandingHero({ theme = "light", onToggleTheme, onSignUp, onSignIn }) {
  const isDark = theme === "dark";
  const [activeTourSection, setActiveTourSection] = useState(0);

  return (
    <div className="min-h-[100dvh] w-full font-body text-text-primary">

      {/* ── Top bar ── */}
      <header
        className="sticky top-0 z-40 backdrop-blur-md border-b border-bg-border/80"
        style={{ background: "color-mix(in srgb, var(--bg-base) 82%, transparent)" }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="font-display text-lg sm:text-xl font-semibold">
            UPSC <span className="text-accent-gold">Mentor</span>
          </span>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onToggleTheme}
              aria-label="Toggle theme"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={onSignIn}
              className="hidden sm:inline-flex btn-ghost !px-3 !py-2 !min-h-0 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold rounded-lg"
            >
              Sign In
            </button>
            <button
              onClick={onSignUp}
              className="btn-primary !min-h-0 !py-2.5 !px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      <main>

        {/* ══════════════════════════ HERO ══════════════════════════════════ */}
        <section className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-12 sm:pt-16 pb-12 sm:pb-20">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-14 items-center">

            {/* Copy */}
            <div className="animate-rise">
              <div
                className="label-tag inline-flex items-center gap-1.5 mb-5 normal-case tracking-[0.12em] uppercase text-accent-gold bg-accent-gold-dim"
                style={{ borderColor: "var(--accent-gold)" }}
              >
                <Zap size={11} />
                One workspace for the entire UPSC journey
              </div>

              <h1 className="font-display text-[2rem] sm:text-[2.5rem] lg:text-[2.75rem] font-semibold leading-[1.15] mb-5">
                Your UPSC Preparation<br className="hidden sm:block" />{" "}
                <span className="text-accent-gold">Operating System.</span>
              </h1>

              <p className="text-base sm:text-[1.05rem] text-text-secondary leading-relaxed max-w-[34rem] mb-8">
                Track your syllabus, study with a timer, practice PYQs, take mock tests,
                write answers, audit notes, and revise intelligently - all in one place
                that knows your progress.
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-9">
                <button
                  onClick={onSignUp}
                  className="btn-primary inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
                >
                  Get Started Free
                  <ArrowRight size={15} />
                </button>
                <a
                  href="#workspace-tour"
                  className="btn-outline inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
                >
                  <Play size={13} />
                  See Inside
                </a>
              </div>

              <p className="text-xs text-text-muted">
                Free to start · No payment required · Works on every device
              </p>
            </div>

            {/* Hero screenshot - real Command Center */}
            <Reveal delay={120}>
              <ScreenshotFrame
                src={SS.commandCenter}
                alt="Command Center - your daily preparation overview"
                caption="Your dashboard on any given morning"
              />
            </Reveal>

          </div>
        </section>

        {/* ══════════════════════════ TRUST STRIP ══════════════════════════ */}
        <Reveal as="section" className="border-y border-bg-border">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {TRUST_ITEMS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start sm:items-center gap-2.5">
                <Icon size={15} className="text-accent-gold shrink-0 mt-0.5 sm:mt-0" />
                <span className="text-xs sm:text-[13px] text-text-secondary leading-snug">{text}</span>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ══════════════════════════ REAL PROBLEM ═════════════════════════ */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <Eyebrow color="red">The real problem</Eyebrow>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold mt-4 mb-3">
              Your preparation is scattered across seven different tools.
            </h2>
            <p className="text-text-secondary text-sm sm:text-base">
              Most aspirants aren't failing because they don't work hard enough.
              They're losing hours stitching together tools that were never built to talk to each other.
            </p>
          </Reveal>

          <Reveal className="grid md:grid-cols-2 gap-6 mb-12" delay={100}>
            <div className="elevated-panel p-6 sm:p-8">
              <p className="text-xs font-mono uppercase tracking-wider text-accent-red mb-5">Before UPSC Mentor</p>
              <div className="flex flex-wrap gap-2.5 mb-6">
                {SCATTERED_TOOLS.map((tool, i) => (
                  <span
                    key={tool}
                    className="muted-panel px-3 py-1.5 text-xs text-text-secondary"
                    style={{ transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (1.5 + (i % 3))}deg)` }}
                  >
                    {tool}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-bg-border">
                <span className="text-sm font-semibold text-accent-red">= Fragmented Preparation</span>
              </div>
            </div>
            <div className="glass-panel p-6 sm:p-8 flex flex-col" style={{ borderColor: "var(--accent-gold)" }}>
              <p className="text-xs font-mono uppercase tracking-wider text-accent-gold mb-5">With UPSC Mentor</p>
              <div
                className="flex-1 flex items-center justify-center rounded-xl py-8 mb-6"
                style={{ background: "var(--accent-gold-dim)" }}
              >
                <span className="font-display text-lg sm:text-xl font-semibold text-center px-4">
                  One Unified Workspace
                </span>
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-bg-border">
                <CheckCircle2 size={16} className="text-accent-gold" />
                <span className="text-sm font-semibold text-accent-gold">
                  Everything in one place, all in sync
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3" delay={180}>
            {PAIN_POINTS.map(({ icon: Icon, text }) => (
              <div key={text} className="muted-panel p-4 flex flex-col gap-2.5">
                <Icon size={16} className="text-text-muted" />
                <span className="text-[13px] text-text-secondary leading-snug">{text}</span>
              </div>
            ))}
          </Reveal>
        </section>

        {/* ══════════════════════════ SCREENSHOT SHOWCASE ══════════════════ */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20 border-t border-bg-border">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <Eyebrow color="blue">Real product, real screens</Eyebrow>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold mt-4 mb-3">
              What UPSC Mentor actually looks like.
            </h2>
            <p className="text-text-secondary text-sm sm:text-base">
              No marketing mockups. These are the exact screens you'll use every day.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {SHOWCASE_SCREENS.map((screen, i) => (
              <Reveal key={screen.alt} delay={i * 60}>
                <ScreenshotFrame
                  src={screen.src}
                  alt={screen.alt}
                  caption={screen.caption}
                />
              </Reveal>
            ))}
          </div>
        </section>

        {/* ══════════════════════════ WORKSPACE TOUR ═══════════════════════ */}
        <section
          id="workspace-tour"
          className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24 border-t border-bg-border"
        >
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <Eyebrow color="gold">
              <Command size={11} />
              Inside your workspace
            </Eyebrow>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold mt-4 mb-3">
              Five modules. One continuous preparation journey.
            </h2>
            <p className="text-text-secondary text-sm sm:text-base">
              Each part of UPSC Mentor hands off to the next.
              Together they answer: where am I, what's next, and what do I need to revise?
            </p>
          </Reveal>

          {/* Desktop: tab navigation + large screenshot */}
          <div className="hidden lg:grid lg:grid-cols-[280px_1fr] gap-8">
            {/* Tabs */}
            <div className="space-y-2">
              {WORKSPACE_SECTIONS.map((sec, i) => {
                const Icon = sec.icon;
                const isActive = activeTourSection === i;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveTourSection(i)}
                    className="w-full text-left p-4 rounded-xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
                    style={{
                      background: isActive ? `var(--accent-${sec.color}-dim)` : "var(--bg-surface)",
                      borderColor: isActive ? `var(--accent-${sec.color})` : "var(--bg-border)",
                    }}
                  >
                    <div className="flex items-center gap-2.5 mb-1">
                      <Icon size={14} style={{ color: `var(--accent-${sec.color})` }} />
                      <span
                        className="text-xs font-mono uppercase tracking-wider"
                        style={{ color: `var(--accent-${sec.color})` }}
                      >
                        {sec.eyebrow}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-text-primary leading-snug line-clamp-2">
                      {sec.title}
                    </p>
                    {isActive && (
                      <ChevronRight
                        size={14}
                        className="mt-2"
                        style={{ color: `var(--accent-${sec.color})` }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active panel */}
            {(() => {
              const sec = WORKSPACE_SECTIONS[activeTourSection];
              const Icon = sec.icon;
              return (
                <div className="space-y-5">
                  <div>
                    <Eyebrow color={sec.color}>
                      <Icon size={11} />
                      {sec.eyebrow}
                    </Eyebrow>
                    <h3 className="font-display text-xl sm:text-2xl font-semibold mt-3 mb-2">
                      {sec.title}
                    </h3>
                    <p className="text-text-secondary text-sm sm:text-[15px] leading-relaxed mb-5">
                      {sec.description}
                    </p>
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      {sec.bullets.map((b) => (
                        <div
                          key={b.label}
                          className="rounded-xl p-3.5 border"
                          style={{
                            background: `var(--accent-${sec.color}-dim)`,
                            borderColor: `color-mix(in srgb, var(--accent-${sec.color}) 30%, transparent)`,
                          }}
                        >
                          <p
                            className="text-xs font-semibold mb-0.5"
                            style={{ color: `var(--accent-${sec.color})` }}
                          >
                            {b.label}
                          </p>
                          <p className="text-xs text-text-secondary leading-snug">{b.text}</p>
                        </div>
                      ))}
                    </div>
                    {sec.note && (
                      <p className="text-xs text-text-muted italic border-l-2 pl-3" style={{ borderColor: `var(--accent-${sec.color})` }}>
                        {sec.note}
                      </p>
                    )}
                  </div>
                  <ScreenshotFrame
                    src={sec.screenshot}
                    alt={sec.ssAlt}
                  />
                </div>
              );
            })()}
          </div>

          {/* Mobile: stacked sections */}
          <div className="lg:hidden space-y-16">
            {WORKSPACE_SECTIONS.map((sec) => {
              const Icon = sec.icon;
              return (
                <Reveal key={sec.id}>
                  <div>
                    <Eyebrow color={sec.color}>
                      <Icon size={11} />
                      {sec.eyebrow}
                    </Eyebrow>
                    <h3 className="font-display text-xl font-semibold mt-3 mb-2">
                      {sec.title}
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed mb-5">
                      {sec.description}
                    </p>
                    <ScreenshotFrame
                      src={sec.screenshot}
                      alt={sec.ssAlt}
                      className="mb-5"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {sec.bullets.map((b) => (
                        <div
                          key={b.label}
                          className="rounded-xl p-3 border"
                          style={{
                            background: `var(--accent-${sec.color}-dim)`,
                            borderColor: `color-mix(in srgb, var(--accent-${sec.color}) 30%, transparent)`,
                          }}
                        >
                          <p
                            className="text-xs font-semibold mb-0.5"
                            style={{ color: `var(--accent-${sec.color})` }}
                          >
                            {b.label}
                          </p>
                          <p className="text-xs text-text-secondary leading-snug">{b.text}</p>
                        </div>
                      ))}
                    </div>
                    {sec.note && (
                      <p className="text-xs text-text-muted italic border-l-2 pl-3 mt-4" style={{ borderColor: `var(--accent-${sec.color})` }}>
                        {sec.note}
                      </p>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════ FINAL CTA ════════════════════════════ */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-24">
          <Reveal>
            <div
              className="glass-panel text-center p-8 sm:p-14 relative overflow-hidden"
              style={{ borderColor: "var(--accent-gold)" }}
            >
              <div
                className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-10 blur-3xl"
                style={{ background: "var(--accent-gold)" }}
              />
              <h2 className="font-display text-2xl sm:text-[2rem] font-semibold mb-3 relative z-10">
                Start preparing with a plan, not just effort.
              </h2>
              <p className="text-text-secondary text-sm sm:text-base mb-8 max-w-md mx-auto relative z-10">
                Set your exam year, get your roadmap, and know exactly what to do today.
                It takes less than two minutes to start.
              </p>
              <div className="flex flex-wrap justify-center items-center gap-3 relative z-10">
                <button
                  onClick={onSignUp}
                  className="btn-primary inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
                >
                  Get Started Free
                  <ArrowRight size={15} />
                </button>
                <button
                  onClick={onSignIn}
                  className="btn-ghost focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
                >
                  Already have an account? Sign In
                </button>
              </div>
            </div>
          </Reveal>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-bg-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
          <span className="font-display text-sm font-semibold text-text-secondary">
            UPSC <span className="text-accent-gold">Mentor</span>
          </span>
          <span>One workspace for the entire UPSC journey.</span>
          <span>© {new Date().getFullYear()} UPSC Mentor</span>
        </div>
      </footer>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .animate-rise, .animate-rise * { animation: none !important; transition: none !important; }
        }
      `}</style>
    </div>
  );
}