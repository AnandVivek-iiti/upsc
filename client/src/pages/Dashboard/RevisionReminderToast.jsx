import { useEffect } from "react";
import { BookOpen, X } from "lucide-react";

export default function RevisionReminderToast({ open, count, onDismiss, onView }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onDismiss, 6000);
    return () => clearTimeout(t);
  }, [open, onDismiss]);

  if (!open) return null;

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[90] w-[calc(100%-2rem)] max-w-sm animate-slide-up">
      <div className="glass-panel p-3.5 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "var(--accent-gold-dim)", color: "var(--accent-gold)" }}
        >
          <BookOpen size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary">
            {count} topic{count === 1 ? "" : "s"} due for revision today
          </p>
          <button
            onClick={onView}
            className="text-xs font-mono text-accent-gold hover:underline mt-0.5"
          >
            Review now
          </button>
        </div>
        <button
          onClick={onDismiss}
          className="text-text-muted hover:text-text-primary transition-colors shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
