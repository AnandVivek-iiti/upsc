import { useState, useEffect } from "react";
import { X, Star, CheckCircle2 } from "lucide-react";
import { submitFeedback } from "../utils/api";

const FEATURE_MAP = {
  notes_auditor: "notes_auditor",
  ai_mentor: "ai_mentor",
  study_session: "study_timer",
};

export default function FeedbackModal({ isLoggedIn, user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    rating: 0,
    useful: "",
    confusing: "",
    improvement: "",
    wouldRecommend: null,
    allowReply: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const checkTriggers = () => {
      const notesCount = parseInt(localStorage.getItem("feedback_notes_auditor") || "0");
      const mentorCount = parseInt(localStorage.getItem("feedback_ai_mentor") || "0");
      const studyDone = localStorage.getItem("feedback_study_session_completed") === "true";

      let trigger = null;
      if (notesCount >= 3) trigger = "notes_auditor";
      else if (mentorCount >= 5) trigger = "ai_mentor";
      else if (studyDone) trigger = "study_session";

      if (trigger && !localStorage.getItem(`feedback_shown_${trigger}`)) {
        setForm((prev) => ({ ...prev, feature: trigger }));
        setIsOpen(true);
        localStorage.setItem(`feedback_shown_${trigger}`, "true");
      }
    };

    const timer = setTimeout(checkTriggers, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.incrementFeedbackCounter = (type) => {
      const key = `feedback_${type}`;
      const current = parseInt(localStorage.getItem(key) || "0");
      localStorage.setItem(key, String(current + 1));
    };
    window.completeStudySession = () => {
      localStorage.setItem("feedback_study_session_completed", "true");
    };
    return () => {
      delete window.incrementFeedbackCounter;
      delete window.completeStudySession;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        rating: form.rating,
        feature: form.feature || "general",
        feedbackText: `Useful: ${form.useful}\nConfusing: ${form.confusing}\nImprovement: ${form.improvement}`,
        wouldRecommend: form.wouldRecommend,
        allowReply: form.allowReply,
        trigger: "in_app_modal",
        metadata: {
          useful: form.useful,
          confusing: form.confusing,
          improvement: form.improvement,
        },
      };
      await submitFeedback(payload);
      setStep(1);
    } catch (err) {
      console.error("Feedback submit error:", err);
      alert("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-bg-surface border border-bg-border rounded-2xl max-w-lg w-full shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border">
          <h2 className="text-lg font-display font-semibold text-text-primary">
            {step === 0 ? "Quick Question" : "Thank You!"}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg hover:bg-bg-muted transition-colors"
          >
            <X size={18} className="text-text-muted" />
          </button>
        </div>

        <div className="p-6">
          {step === 0 ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm text-text-secondary">
                We'd love to hear from you – your feedback helps us build a better workspace.
              </p>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  How likely are you to recommend UPSC Mentor to a friend?
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, rating: r }))}
                      className={`p-2 rounded-lg border transition-all ${
                        form.rating >= r
                          ? "border-accent-gold bg-accent-gold/10 text-accent-gold"
                          : "border-bg-border text-text-muted hover:border-text-muted"
                      }`}
                    >
                      <Star size={20} fill={form.rating >= r ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  1. What did you find most useful?
                </label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 bg-bg-muted border border-bg-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-gold/50"
                  placeholder="I liked the AI Mentor because..."
                  value={form.useful}
                  onChange={(e) => setForm((prev) => ({ ...prev, useful: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  2. What confused you?
                </label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 bg-bg-muted border border-bg-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-gold/50"
                  placeholder="The syllabus tracker felt..."
                  value={form.confusing}
                  onChange={(e) => setForm((prev) => ({ ...prev, confusing: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  3. What feature should be improved?
                </label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 bg-bg-muted border border-bg-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-gold/50"
                  placeholder="I wish the notes auditor..."
                  value={form.improvement}
                  onChange={(e) => setForm((prev) => ({ ...prev, improvement: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Would you recommend UPSC Mentor to another aspirant?
                </label>
                <div className="flex gap-3">
                  {["Yes", "No", "Maybe"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          wouldRecommend:
                            opt === "Yes" ? true : opt === "No" ? false : null,
                        }))
                      }
                      className={`px-4 py-2 rounded-xl border text-sm transition-all ${
                        (opt === "Yes" && form.wouldRecommend === true) ||
                        (opt === "No" && form.wouldRecommend === false) ||
                        (opt === "Maybe" && form.wouldRecommend === null)
                          ? "border-accent-gold bg-accent-gold/10 text-accent-gold"
                          : "border-bg-border text-text-muted hover:border-text-muted"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.allowReply}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, allowReply: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-bg-border text-accent-gold focus:ring-accent-gold/20"
                />
                You can reply to this feedback if you'd like (optional)
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 btn-ghost text-center"
                >
                  Not Now
                </button>
                <button
                  type="submit"
                  disabled={submitting || form.rating === 0}
                  className="flex-1 btn-primary text-center flex items-center justify-center gap-2"
                >
                  {submitting ? <span className="animate-spin">⏳</span> : "Send Feedback"}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8 space-y-3">
              <div className="w-16 h-16 rounded-full bg-accent-green/10 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} className="text-accent-green" />
              </div>
              <h3 className="text-xl font-display font-semibold text-text-primary">
                Thanks for your feedback!
              </h3>
              <p className="text-sm text-text-secondary max-w-sm mx-auto">
                Your input helps us make UPSC Mentor better for everyone. We read every single response.
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="btn-primary px-8 mx-auto mt-4"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
