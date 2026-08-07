import { Trophy, PartyPopper, Flame, X } from "lucide-react";

function fmtGoalHM(hoursDecimal) {
  const totalMinutes = Math.max(0, Math.round(hoursDecimal * 60));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export default function GoalModal({
  open,
  variant,
  name,
  targetHours = 0,
  hoursToday = 0,
  onContinue,
  onClose,
}) {
  if (!open) return null;

  const displayName = name?.trim() || "there";
  const remaining = Math.max(0, targetHours - hoursToday);
  const over = Math.max(0, hoursToday - targetHours);
  const isCongrats = variant === "exceeded" || variant === "met";
  const accent = isCongrats ? "var(--accent-green)" : "var(--accent-gold)";
  const accentDim = isCongrats ? "var(--accent-green-dim)" : "var(--accent-gold-dim)";
  const Icon = variant === "exceeded" ? Trophy : variant === "met" ? PartyPopper : Flame;

  const title =
    variant === "exceeded"
      ? `You crushed it, ${displayName}!`
      : variant === "met"
      ? `Nice work, ${displayName}!`
      : `${fmtGoalHM(remaining)} to go, ${displayName}`;

  const message =
    variant === "exceeded"
      ? `You went ${fmtGoalHM(over)} past your ${targetHours}h goal today. That's the kind of day that adds up.`
      : variant === "met"
      ? `You hit your ${targetHours}h goal today. Solid, consistent work.`
      : `You're close. Want to keep the momentum going, or call it a day?`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-sm p-5 sm:p-6 animate-scale-in relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-text-muted hover:text-text-primary transition-colors"
        >
          <X size={16} />
        </button>

        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: accentDim, color: accent }}
        >
          <Icon size={22} />
        </div>

        <h3 className="font-display text-lg sm:text-xl font-semibold text-text-primary mb-1.5">
          {title}
        </h3>
        <p className="text-sm text-text-secondary leading-relaxed mb-5">{message}</p>

        {isCongrats ? (
          <button
            onClick={onClose}
            className="btn-primary w-full"
            style={{ background: accent }}
          >
            Done for today
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-outline flex-1">
              Stop for today
            </button>
            <button onClick={onContinue} className="btn-primary flex-1">
              Continue studying
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
