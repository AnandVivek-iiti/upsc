/**
 * LandingHero — UPSC Mentor landing page hero section.
 * Matches the existing glass-panel / accent-gold token system.
 * Supports light and dark mode via CSS custom properties.
 *
 * Usage:
 *   <LandingHero onSignUp={() => setView("signup")} onSignIn={() => setView("signin")} />
 */

import { useState, useEffect } from "react";
import {
  BookOpen, Brain, BarChart2, Clock, ArrowRight,
  CheckCircle2, Sun, Moon, Zap, Shield, Repeat2
} from "lucide-react";

/* ─────────────────────────────────────────────
   Token System — mirrors existing CSS variables
   ───────────────────────────────────────────── */
const TOKENS = {
  dark: {
    bgBase:        "#0d0f14",
    bgSurface:     "#13161e",
    bgMuted:       "#1a1e28",
    bgBorder:      "rgba(255,255,255,0.08)",
    textPrimary:   "#f0f2f7",
    textSecondary: "#9aa3b8",
    textMuted:     "#5c6478",
    accentGold:    "#e8b94f",
    accentGoldDim: "rgba(232,185,79,0.12)",
    accentGoldBorder: "rgba(232,185,79,0.22)",
    glass:         "rgba(255,255,255,0.03)",
    glassBorder:   "rgba(255,255,255,0.07)",
  },
  light: {
    bgBase:        "#f5f6f9",
    bgSurface:     "#ffffff",
    bgMuted:       "#eef0f5",
    bgBorder:      "rgba(0,0,0,0.08)",
    textPrimary:   "#0d0f14",
    textSecondary: "#4a5268",
    textMuted:     "#8e96aa",
    accentGold:    "#c49a28",
    accentGoldDim: "rgba(196,154,40,0.10)",
    accentGoldBorder: "rgba(196,154,40,0.25)",
    glass:         "rgba(255,255,255,0.70)",
    glassBorder:   "rgba(0,0,0,0.07)",
  },
};

/* ─────────────────────────────────────────────
   Feature pill data
   ───────────────────────────────────────────── */
const FEATURES = [
  { icon: BookOpen,  label: "Track syllabus" },
  { icon: Brain,     label: "Evaluate answers" },
  { icon: BarChart2, label: "Audit notes" },
  { icon: Clock,     label: "Practice PYQs" },
  { icon: Zap,       label: "Take tests" },
  { icon: Repeat2,   label: "Monitor revision" },
];

/* ─────────────────────────────────────────────
   Trust signals
   ───────────────────────────────────────────── */
const TRUST = [
  { icon: Shield,     text: "No payment required" },
  { icon: Repeat2,    text: "Everything syncs automatically" },
  { icon: CheckCircle2, text: "Multi-provider AI, always online" },
];

/* ─────────────────────────────────────────────
   Google wordmark SVG (inline, no external fetch)
   ───────────────────────────────────────────── */
function GoogleIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Main Component
   ───────────────────────────────────────────── */
export default function LandingHero({ onSignUp, onSignIn }) {
  const [isDark, setIsDark] = useState(true);
  const t = TOKENS[isDark ? "dark" : "light"];

  /* Inject CSS custom properties onto :root so child components
     using the same token names stay in sync */
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-accent-gold",        t.accentGold);
    root.style.setProperty("--color-accent-gold-dim",    t.accentGoldDim);
    root.style.setProperty("--color-accent-gold-border", t.accentGoldBorder);
    root.style.setProperty("--color-bg-base",    t.bgBase);
    root.style.setProperty("--color-bg-surface", t.bgSurface);
    root.style.setProperty("--color-bg-muted",   t.bgMuted);
    root.style.setProperty("--color-bg-border",  t.bgBorder);
    root.style.setProperty("--color-text-primary",   t.textPrimary);
    root.style.setProperty("--color-text-secondary", t.textSecondary);
    root.style.setProperty("--color-text-muted",     t.textMuted);
  }, [isDark, t]);

  /* ── Styles as objects (avoids Tailwind dependency) ── */
  const s = {
    page: {
      minHeight: "100vh",
      background: t.bgBase,
      fontFamily: "'Inter', system-ui, sans-serif",
      transition: "background 0.25s, color 0.25s",
      color: t.textPrimary,
      display: "flex",
      flexDirection: "column",
    },

    /* top bar */
    topBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "1rem 1.5rem",
      borderBottom: `1px solid ${t.bgBorder}`,
    },
    wordmark: {
      fontFamily: "'Georgia', serif",
      fontSize: "1.05rem",
      fontWeight: 600,
      letterSpacing: "0.02em",
      color: t.textPrimary,
    },
    wordmarkAccent: {
      color: t.accentGold,
    },
    themeBtn: {
      background: t.bgMuted,
      border: `1px solid ${t.bgBorder}`,
      borderRadius: "8px",
      width: "34px",
      height: "34px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      color: t.textMuted,
      transition: "color 0.2s, background 0.2s",
    },

    /* hero layout */
    hero: {
      flex: 1,
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "3rem",
      maxWidth: "1080px",
      margin: "0 auto",
      padding: "4rem 2rem 5rem",
      alignItems: "center",
    },

    /* left col */
    eyebrow: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      background: t.accentGoldDim,
      border: `1px solid ${t.accentGoldBorder}`,
      borderRadius: "100px",
      padding: "3px 10px",
      fontSize: "11px",
      fontFamily: "monospace",
      letterSpacing: "0.12em",
      color: t.accentGold,
      textTransform: "uppercase",
      marginBottom: "1.25rem",
    },
    headline: {
      fontSize: "clamp(2rem, 4vw, 2.85rem)",
      fontFamily: "'Georgia', serif",
      fontWeight: 700,
      lineHeight: 1.18,
      color: t.textPrimary,
      marginBottom: "1rem",
    },
    headlineAccent: {
      color: t.accentGold,
    },
    subtext: {
      fontSize: "1rem",
      color: t.textSecondary,
      lineHeight: 1.65,
      maxWidth: "420px",
      marginBottom: "2rem",
    },

    /* feature pills grid */
    pillsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "8px",
      marginBottom: "2.5rem",
    },
    pill: {
      display: "flex",
      alignItems: "center",
      gap: "7px",
      background: t.bgMuted,
      border: `1px solid ${t.bgBorder}`,
      borderRadius: "8px",
      padding: "7px 10px",
      fontSize: "12px",
      color: t.textSecondary,
    },

    /* trust row */
    trustRow: {
      display: "flex",
      flexDirection: "column",
      gap: "7px",
    },
    trustItem: {
      display: "flex",
      alignItems: "center",
      gap: "7px",
      fontSize: "12px",
      color: t.textMuted,
    },

    /* right col — auth card */
    card: {
      background: t.glass,
      border: `1px solid ${t.glassBorder}`,
      borderRadius: "20px",
      overflow: "hidden",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      position: "relative",
    },
    cardTopStripe: {
      height: "2px",
      background: `linear-gradient(90deg, ${t.accentGold}, rgba(232,185,79,0.3), transparent)`,
    },
    cardBody: {
      padding: "2rem 1.75rem",
    },
    cardHeadline: {
      fontSize: "1.25rem",
      fontFamily: "'Georgia', serif",
      fontWeight: 700,
      color: t.textPrimary,
      marginBottom: "0.35rem",
    },
    cardSub: {
      fontSize: "13px",
      color: t.textSecondary,
      marginBottom: "1.75rem",
      lineHeight: 1.5,
    },

    /* primary CTA */
    btnPrimary: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      background: t.accentGold,
      color: isDark ? "#0d0f14" : "#ffffff",
      border: "none",
      borderRadius: "10px",
      padding: "13px 0",
      fontSize: "14px",
      fontWeight: 700,
      cursor: "pointer",
      letterSpacing: "0.02em",
      marginBottom: "12px",
      transition: "opacity 0.15s",
    },

    /* Google CTA */
    btnGoogle: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "9px",
      background: t.bgMuted,
      color: t.textSecondary,
      border: `1px solid ${t.bgBorder}`,
      borderRadius: "10px",
      padding: "12px 0",
      fontSize: "13.5px",
      fontWeight: 500,
      cursor: "pointer",
      transition: "background 0.15s",
      marginBottom: "1.5rem",
    },

    divider: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginBottom: "1.5rem",
    },
    dividerLine: {
      flex: 1,
      height: "1px",
      background: t.bgBorder,
    },
    dividerText: {
      fontSize: "11px",
      color: t.textMuted,
      fontFamily: "monospace",
      letterSpacing: "0.08em",
    },

    /* sign-in link */
    signInRow: {
      textAlign: "center",
      fontSize: "12.5px",
      color: t.textMuted,
    },
    signInLink: {
      color: t.accentGold,
      cursor: "pointer",
      fontWeight: 600,
      background: "none",
      border: "none",
      fontSize: "12.5px",
      padding: 0,
      marginLeft: "4px",
      textDecoration: "none",
    },

    /* card info strip */
    infoStrip: {
      marginTop: "1.5rem",
      background: t.bgMuted,
      border: `1px solid ${t.bgBorder}`,
      borderRadius: "10px",
      padding: "12px 14px",
    },
    infoStripItems: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    infoStripItem: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "12px",
      color: t.textSecondary,
    },
  };

  return (
    <div style={s.page}>

      {/* ── Top bar ── */}
      <header style={s.topBar}>
        <span style={s.wordmark}>
          UPSC <span style={s.wordmarkAccent}>Mentor</span>
        </span>
        <button
          style={s.themeBtn}
          onClick={() => setIsDark(d => !d)}
          aria-label="Toggle theme"
        >
          {isDark
            ? <Sun size={15} />
            : <Moon size={15} />}
        </button>
      </header>

      {/* ── Hero ── */}
      <main style={s.hero}>

        {/* Left ── copy */}
        <div>
          <div style={s.eyebrow}>
            <Zap size={10} />
            The serious aspirant's workspace
          </div>

          <h1 style={s.headline}>
            The Preparation Workspace<br />
            For <span style={s.headlineAccent}>Serious Aspirants</span>
          </h1>

          <p style={s.subtext}>
            Everything a CSE candidate needs — syllabus tracking, AI answer
            evaluation, PYQ practice, mock tests, and a conversational mentor
            — in one place. Everything syncs automatically.
          </p>

          {/* Feature pills */}
          <div style={s.pillsGrid}>
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} style={s.pill}>
                <Icon size={13} color={t.accentGold} />
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Trust */}
          <div style={s.trustRow}>
            {TRUST.map(({ icon: Icon, text }) => (
              <div key={text} style={s.trustItem}>
                <Icon size={12} color={t.accentGold} style={{ flexShrink: 0 }} />
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Right ── auth card */}
        <div style={s.card}>
          <div style={s.cardTopStripe} />
          <div style={s.cardBody}>

            <p style={s.cardHeadline}>Start preparing today</p>
            <p style={s.cardSub}>
              Free account — tracks your syllabus, practice, and progress
              from day one.
            </p>

            {/* Primary CTA */}
            <button
              style={s.btnPrimary}
              onClick={onSignUp}
              onMouseOver={e => e.currentTarget.style.opacity = "0.88"}
              onMouseOut={e => e.currentTarget.style.opacity = "1"}
            >
              🚀 Create Free Account
              <ArrowRight size={14} />
            </button>

            {/* Divider */}
            <div style={s.divider}>
              <div style={s.dividerLine} />
              <span style={s.dividerText}>or</span>
              <div style={s.dividerLine} />
            </div>

            {/* Google */}
            <button
              style={s.btnGoogle}
              onClick={onSignUp}
              onMouseOver={e => e.currentTarget.style.background = t.bgBorder}
              onMouseOut={e => e.currentTarget.style.background = t.bgMuted}
            >
              <GoogleIcon size={16} />
              Continue with Google
            </button>

            {/* Sign in */}
            <div style={s.signInRow}>
              Already have an account?
              <button style={s.signInLink} onClick={onSignIn}>
                Sign In
              </button>
            </div>

            {/* Info strip */}
            <div style={s.infoStrip}>
              <div style={s.infoStripItems}>
                <div style={s.infoStripItem}>
                  <CheckCircle2 size={12} color={t.accentGold} style={{ flexShrink: 0 }} />
                  5 AI answer evaluations daily — free
                </div>
                <div style={s.infoStripItem}>
                  <CheckCircle2 size={12} color={t.accentGold} style={{ flexShrink: 0 }} />
                  Full PYQ bank · Test series · AI Mentor chat
                </div>
                <div style={s.infoStripItem}>
                  <CheckCircle2 size={12} color={t.accentGold} style={{ flexShrink: 0 }} />
                  Installable as a PWA — works like a native app
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>

    </div>
  );
}