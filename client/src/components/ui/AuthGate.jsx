/**
 * AuthGate - themed "login to unlock" fallback card.
 * Drop it inside any protected page to gate access gracefully.
 *
 * Usage:
 *   <AuthGate feature="Dashboard" onNavigateAuth={() => setView("auth")} />
 */
import { Lock, Cpu, BarChart2, ArrowRight, BookOpen, Flame } from "lucide-react";

const FEATURE_META = {
  Dashboard: {
    icon: BarChart2,
    headline: "Your personal command centre",
    bullets: [
      "Track study hours & streaks",
      "Syllabus progress at a glance",
      "Spaced-repetition reminders",
      "Smart daily goal logging",
    ],
    badge: "Free with account",
  },
  "AI Workplace": {
    icon: Cpu,
    headline: "AI-powered Mains evaluator",
    bullets: [
      "Instant answer evaluation",
      "Structure & keyword analysis",
      "Score out of 10 with feedback",
      "Sample polished introductions",
    ],
    badge: "Free with account",
  },
};

export default function AuthGate({ feature = "Dashboard", onNavigateAuth }) {
  const meta = FEATURE_META[feature] ?? FEATURE_META["Dashboard"];
  const Icon = meta.icon;

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4 py-12 animate-fade-in">
      {/* Card */}
      <div className="w-full max-w-sm relative">

        {/* Ambient glow */}
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-accent-gold/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative glass-panel rounded-2xl overflow-hidden">

          {/* Top accent stripe */}
          <div className="h-0.5 bg-gradient-to-r from-accent-gold via-amber-300 to-transparent" />

          <div className="px-7 py-8 space-y-6">

            {/* Lock badge */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-accent-gold" />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[.18em] text-text-muted">
                  {feature}
                </p>
                <p className="text-sm font-display font-semibold text-text-primary mt-0.5">
                  {meta.headline}
                </p>
              </div>
            </div>

            {/* Feature bullets */}
            <ul className="space-y-2.5">
              {meta.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-text-secondary">
                  <span className="text-accent-gold mt-0.5 shrink-0 font-mono text-xs">›</span>
                  {b}
                </li>
              ))}
            </ul>

            {/* Divider */}
            <div className="border-t border-bg-border" />

            {/* Lock message */}
            <div className="flex items-center gap-2 bg-bg-muted rounded-xl px-3.5 py-3 border border-bg-border">
              <Lock size={12} className="text-text-muted shrink-0" />
              <p className="text-xs text-text-muted font-mono leading-relaxed">
                Sign in or create a free account to unlock this feature.
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={onNavigateAuth}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
            >
              Sign in / Create account
              <ArrowRight size={14} />
            </button>

            {/* Free badge */}
            <p className="text-center text-[11px] font-mono text-text-muted flex items-center justify-center gap-1.5">
              <Flame size={10} className="text-accent-gold" />
              {meta.badge} - no payment required
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}