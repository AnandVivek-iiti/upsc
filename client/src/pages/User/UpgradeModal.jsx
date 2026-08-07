import { useState } from "react";
import { X, Crown, Check, Loader2, Sparkles } from "lucide-react";
import { usePayment } from "../../hooks/usePayment";

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

export default function UpgradeModal({ token, user, onClose, onUpgraded }) {
  const [selected, setSelected] = useState("yearly");
  const { startCheckout, loading, error } = usePayment(token, {
    onSuccess: (subscription) => {
      onUpgraded?.(subscription);
      onClose?.();
    },
  });

  const selectedPlan = PLANS.find((p) => p.id === selected);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-lg relative z-10 p-6 sm:p-8 animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center bg-bg-muted border border-bg-border text-text-muted hover:text-text-primary transition-all active:scale-95"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <Crown size={20} className="text-accent-gold" />
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary">Upgrade to Premium</h2>
        </div>
        <p className="text-sm text-text-muted mb-6">
          Unlock handwritten (Vision) Mains evaluation and higher daily AI limits.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelected(plan.id)}
              className={`relative text-left rounded-2xl p-4 sm:p-5 border transition-all active:scale-95 touch-manipulation
                ${selected === plan.id
                  ? "border-accent-gold bg-accent-gold/10"
                  : "border-bg-border bg-bg-muted hover:border-accent-gold/40"}`}
            >
              {plan.bestValue && (
                <span className="absolute -top-2.5 right-4 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-accent-gold text-black flex items-center gap-1">
                  <Sparkles size={9} /> BEST VALUE
                </span>
              )}
              <p className="text-xs font-mono uppercase tracking-wider text-text-muted mb-1">{plan.label}</p>
              <p className="text-2xl font-bold text-text-primary mb-3">
                {plan.price}
                <span className="text-sm font-mono text-text-muted">{plan.period}</span>
              </p>
              <ul className="space-y-1.5">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-1.5 text-xs text-text-secondary">
                    <Check size={12} className="text-accent-green mt-0.5 shrink-0" />
                    {perk}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {error && <p className="text-xs font-mono text-red-400 mb-4">{error}</p>}

        <button
          onClick={() => startCheckout(selected, user)}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base disabled:opacity-50 touch-manipulation"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Crown size={16} />}
          {loading
            ? "Opening secure checkout…"
            : `Pay with Razorpay  - ${selectedPlan.price}${selectedPlan.period}`}
        </button>

        <p className="text-[10px] font-mono text-text-muted text-center mt-3">
          Secured by Razorpay. One-time payment per period  - no auto-renewal.
        </p>
      </div>
    </div>
  );
}