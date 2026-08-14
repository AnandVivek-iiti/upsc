import { useState, useEffect, useCallback } from "react";
import {
  Crown, Check, Loader2, Sparkles, ScanEye, Gauge, Bot,
  NotebookPen, BarChart3, Trophy, X,
} from "lucide-react";
import { usePayment } from "../../hooks/usePayment";
import { getProfile } from "../../utils/api";

const PLANS = [
  {
    id: "monthly",
    label: "Monthly",
    price: "₹199",
    period: "/month",
    perks: [
      "Handwritten (Vision) Mains evaluation",
      "Higher daily evaluation & test-analysis limits",
    ],
  },
  {
    id: "yearly",
    label: "Yearly",
    price: "₹2,000",
    period: "/year",
    perks: [
      "Everything in Monthly",
      "Works out to ~₹167/month",
    ],
    bestValue: true,
  },
];

// ── Feature comparison rows - Free vs Premium ────────────────────────────────
const FEATURES = [
  { icon: ScanEye,     label: "Handwritten (Vision) Mains evaluation", free: false, premium: true },
  { icon: Gauge,       label: "Daily Mains evaluations",               free: "10/day", premium: "Higher limit" },
  { icon: Bot,         label: "AI Mentor chat",                        free: true,  premium: true },
  { icon: NotebookPen, label: "AI-powered Notes actions",              free: true,  premium: true },
  { icon: BarChart3,   label: "Test Series AI diagnostics",            free: "20/day", premium: "Higher limit" },
  { icon: Trophy,      label: "Leaderboard visibility",                free: true,  premium: true },
];

function FeatureCell({ value }) {
  if (value === true) return <Check size={16} className="text-accent-green mx-auto" />;
  if (value === false) return <X size={14} className="text-text-muted/50 mx-auto" />;
  return <span className="text-xs font-mono text-text-secondary">{value}</span>;
}

export default function PremiumPlans({ token, user, onUpgraded }) {
  const [selected, setSelected] = useState("yearly");
  const [profile, setProfile] = useState(null);

  // subscription lives on GET /auth/me, not the useUserData() dashboard payload
  const fetchProfile = useCallback(() => {
    if (!token) return;
    getProfile()
      .then((d) => { if (d.success) setProfile(d.user); })
      .catch(() => {});
  }, [token]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const { startCheckout, loading, error } = usePayment(token, {
    onSuccess: (subscription) => {
      setProfile((p) => (p ? { ...p, subscription } : p));
      onUpgraded?.(subscription);
    },
  });

  const sub = profile?.subscription || { tier: "free", isActive: false };
  const selectedPlan = PLANS.find((p) => p.id === selected);

  return (
    <div className="w-full px-4 sm:px-8 md:px-10 lg:px-14 py-6 sm:py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: "var(--accent-gold-dim)" }}>
          <Crown size={20} className="text-accent-gold" />
        </div>
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-semibold text-text-primary leading-tight">Premium Plans</h1>
          <p className="text-xs sm:text-sm text-text-muted">Unlock the full AI mentor experience</p>
        </div>
      </div>

      {sub.isActive && (
        <div className="glass-panel p-4 mt-5 flex items-center gap-3">
          <Crown size={16} className="text-accent-gold shrink-0" />
          <p className="text-sm text-text-primary">
            You're already on <span className="font-semibold">Premium</span>. Thanks for supporting UPSC Mentor!
          </p>
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {PLANS.map((plan) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => setSelected(plan.id)}
            className={`relative text-left rounded-2xl p-5 sm:p-6 border transition-all active:scale-[0.98] touch-manipulation
              ${selected === plan.id
                ? "border-accent-gold bg-accent-gold/10"
                : "border-bg-border bg-bg-muted hover:border-accent-gold/40"}`}
          >
            {plan.bestValue && (
              <span className="absolute -top-2.5 right-5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-accent-gold text-black flex items-center gap-1">
                <Sparkles size={9} /> BEST VALUE
              </span>
            )}
            <p className="text-xs font-mono uppercase tracking-wider text-text-muted mb-1">{plan.label}</p>
            <p className="text-3xl font-bold text-text-primary mb-4">
              {plan.price}
              <span className="text-sm font-mono text-text-muted">{plan.period}</span>
            </p>
            <ul className="space-y-2">
              {plan.perks.map((perk) => (
                <li key={perk} className="flex items-start gap-2 text-sm text-text-secondary">
                  <Check size={14} className="text-accent-green mt-0.5 shrink-0" />
                  {perk}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      {error && <p className="text-xs font-mono text-red-400 mt-4">{error}</p>}

      {!sub.isActive && (
        <button
          onClick={() => startCheckout(selected, user)}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base mt-5 disabled:opacity-50 touch-manipulation"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Crown size={16} />}
          {loading ? "Opening secure checkout…" : `Pay with Razorpay - ${selectedPlan.price}${selectedPlan.period}`}
        </button>
      )}
      <p className="text-[10px] font-mono text-text-muted text-center mt-3">
        Secured by Razorpay. One-time payment per period - no auto-renewal.
      </p>

      {/* Feature comparison table */}
      <div className="glass-panel p-5 sm:p-6 mt-8">
        <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-4">Free vs Premium</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-border">
                <th className="text-left font-mono text-xs uppercase tracking-wide text-text-muted pb-2">Feature</th>
                <th className="text-center font-mono text-xs uppercase tracking-wide text-text-muted pb-2 w-24">Free</th>
                <th className="text-center font-mono text-xs uppercase tracking-wide text-accent-gold pb-2 w-24">Premium</th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map(({ icon: Icon, label, free, premium }) => (
                <tr key={label} className="border-b border-bg-border last:border-0">
                  <td className="py-3 pr-2">
                    <div className="flex items-center gap-2.5">
                      <Icon size={14} className="text-text-muted shrink-0" />
                      <span className="text-text-primary">{label}</span>
                    </div>
                  </td>
                  <td className="py-3 text-center"><FeatureCell value={free} /></td>
                  <td className="py-3 text-center"><FeatureCell value={premium} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}