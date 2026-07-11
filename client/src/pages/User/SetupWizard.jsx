

import { useState } from "react";
import {
  Calendar, Clock, ClipboardList,
  ArrowRight, ArrowLeft, X, Loader2,
} from "lucide-react";
import { SYLLABUS, PAPER_ORDER } from "../../data/PYQs/syllabusData";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => 2025 + i);
const HOUR_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20];
const TOTAL_STEPS = 3;

function authHeaders(token) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export function setupWizardSeenKey(uid) {
  return `upsc_setup_wizard_seen_${uid || "anon"}`;
}

export function hasSeenSetupWizard(uid) {
  try {
    return localStorage.getItem(setupWizardSeenKey(uid)) === "1";
  } catch {
    return true; 
  }
}

function markSetupWizardSeen(uid) {
  try {
    localStorage.setItem(setupWizardSeenKey(uid), "1");
  } catch { /* non-fatal */ }
}

// ─── Shared visual chrome ──────────────────────────────────────────────────

function StepDots({ step }) {
  return (
    <div className="flex items-center justify-center gap-1.5 mb-6">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className="h-1.5 rounded-full transition-all duration-300"
          style={{
            width: i === step ? 24 : 8,
            background: i <= step ? "var(--accent-gold)" : "var(--bg-border)",
          }}
        />
      ))}
    </div>
  );
}

function WizardShell({ step, onSkipAll, children }) {
  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      <div
        className="pointer-events-none fixed top-0 right-0 w-[500px] h-[400px] opacity-[0.08] rounded-full blur-[100px]"
        style={{ background: "var(--accent-gold)", transform: "translate(30%, -30%)" }}
      />
      <div
        className="pointer-events-none fixed bottom-0 left-0 w-[380px] h-[380px] opacity-[0.05] rounded-full blur-[90px]"
        style={{ background: "var(--accent-blue)", transform: "translate(-30%, 30%)" }}
      />

      <button
        onClick={onSkipAll}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono text-text-muted hover:text-text-primary hover:bg-bg-muted transition-colors z-10"
      >
        Skip setup <X size={13} />
      </button>

      <div className="glass-panel w-full max-w-md relative z-0 p-6 sm:p-8 animate-scale-in">
        <StepDots step={step} />
        {children}
      </div>
    </div>
  );
}

function WizardNav({ step, canGoBack, onBack, onSkipStep, onNext, nextLabel, nextDisabled, saving }) {
  return (
    <div className="mt-7 flex items-center justify-between gap-2">
      <button
        onClick={onBack}
        disabled={!canGoBack}
        className="btn-ghost flex items-center gap-1.5 disabled:opacity-0 disabled:pointer-events-none"
      >
        <ArrowLeft size={14} /> Back
      </button>

      <div className="flex items-center gap-2">
        <button onClick={onSkipStep} className="btn-ghost text-xs">
          Skip this
        </button>
        <button
          onClick={onNext}
          disabled={nextDisabled || saving}
          className="btn-primary flex items-center gap-1.5"
        >
          {saving ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <>
              {nextLabel || (step === TOTAL_STEPS - 1 ? "Finish" : "Next")}
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function SetupWizard({ user, token, userData, onUpdateProfile, onBulkUpdateProgress, onRefetch, onComplete }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const currentProfile = userData?.profile || {};

  const [targetYear, setTargetYear] = useState(currentProfile.target_year || 2027);
  const [examDate, setExamDate] = useState(
    currentProfile.examDate ? new Date(currentProfile.examDate).toISOString().split("T")[0] : ""
  );
  const [dailyTarget, setDailyTarget] = useState(currentProfile.daily_target_hours || 4);
  const [baselinePct, setBaselinePct] = useState(0);

  const uid = user?.id || user?._id || null;

  function finishAndClose() {
    markSetupWizardSeen(uid);
    onComplete?.();
  }

  async function persistProfile() {
    if (!token) return;
    const dashRes = await fetch(`${BASE}/dashboard/profile`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify({
        daily_target_hours: Number(dailyTarget),
        target_year: Number(targetYear),
        exam_date: examDate || null,
      }),
    });
    const dashData = await dashRes.json();
    if (!dashRes.ok || !dashData.success) throw new Error(dashData.error || "Could not save your profile.");

    // Keep the sidebar countdown (driven off auth/profile) in sync too -
    // same two-call pattern ProfilePage.jsx uses for the same reason.
    await fetch(`${BASE}/auth/profile`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify({ name: user?.name || "", examDate: examDate || null }),
    }).catch(() => {}); // non-critical for the wizard; ProfilePage remains the source of truth if this hiccups

    onUpdateProfile?.({
      daily_target_hours: Number(dailyTarget),
      target_year: Number(targetYear),
      examDate: examDate || null,
    });
  }

  async function persistBaseline() {
    if (baselinePct <= 0) return;
    const state = baselinePct >= 100 ? "done" : "progress";
    const updates = [];
    for (const [stageId, papers] of Object.entries(SYLLABUS)) {
      for (const paperId of PAPER_ORDER[stageId] || Object.keys(papers)) {
        const paper = papers[paperId];
        if (!paper) continue;
        for (const moduleName of Object.keys(paper.modules)) {
          updates.push({ stage: stageId, paper: paperId, module: moduleName, progress: baselinePct, state });
        }
      }
    }
    if (updates.length) await onBulkUpdateProgress?.(updates);
  }

  async function handleFinish() {
    setSaving(true);
    setError("");
    try {
      await persistProfile();
      await persistBaseline();
      onRefetch?.();
      finishAndClose();
    } catch (e) {
      setError(e.message || "Something went wrong saving your setup - you can always finish this later from Profile.");
      setSaving(false);
    }
  }

  function goNext() {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    } else {
      handleFinish();
    }
  }

  function goBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  function skipThisStep() {
    if (step === 0) { setTargetYear(currentProfile.target_year || 2027); setExamDate(""); }
    if (step === 1) { setDailyTarget(currentProfile.daily_target_hours || 4); }
    if (step === 2) { setBaselinePct(0); }
    goNext();
  }

  return (
    <WizardShell step={step} onSkipAll={finishAndClose}>
      {error && (
        <div className="mb-4 px-3 py-2 rounded-lg text-xs font-mono" style={{ background: "var(--accent-red-dim)", color: "var(--accent-red)" }}>
          {error}
        </div>
      )}

      {step === 0 && (
        <div>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: "var(--accent-blue-dim)" }}>
            <Calendar size={18} style={{ color: "var(--accent-blue)" }} />
          </div>
          <h2 className="font-display text-xl font-semibold text-text-primary mb-1.5">When's your exam?</h2>
          <p className="text-sm text-text-secondary mb-6">
            This sets your countdown and pacing everywhere in the app. You can change it anytime from Profile.
          </p>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-text-muted">Target exam year</label>
              <select
                value={targetYear}
                onChange={(e) => setTargetYear(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-base bg-bg-muted text-text-primary border border-bg-border focus:outline-none focus:ring-2 focus:ring-accent-gold/40"
              >
                {YEAR_OPTIONS.map((y) => <option key={y} value={y}>CSE {y}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-text-muted">Exam date (optional)</label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-base bg-bg-muted text-text-primary border border-bg-border focus:outline-none focus:ring-2 focus:ring-accent-gold/40"
              />
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: "var(--accent-purple-dim)" }}>
            <Clock size={18} style={{ color: "var(--accent-purple)" }} />
          </div>
          <h2 className="font-display text-xl font-semibold text-text-primary mb-1.5">Daily study goal</h2>
          <p className="text-sm text-text-secondary mb-6">
            Powers your timer target on the dashboard and your weekly study chart.
          </p>

          <div className="flex flex-wrap gap-2">
            {HOUR_OPTIONS.map((h) => (
              <button
                key={h}
                onClick={() => setDailyTarget(h)}
                className="px-3.5 py-2 rounded-xl text-sm font-mono border transition-colors"
                style={
                  Number(dailyTarget) === h
                    ? { borderColor: "var(--accent-gold)", background: "var(--accent-gold-dim)", color: "var(--accent-gold)" }
                    : { borderColor: "var(--bg-border)", background: "var(--bg-muted)", color: "var(--text-secondary)" }
                }
              >
                {h}h
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: "var(--accent-green-dim)" }}>
            <ClipboardList size={18} style={{ color: "var(--accent-green)" }} />
          </div>
          <h2 className="font-display text-xl font-semibold text-text-primary mb-1.5">Where are you starting from?</h2>
          <p className="text-sm text-text-secondary mb-6">
            A rough starting point across the whole syllabus, just so your coverage numbers aren't at zero if you've
            already begun. You can fine-tune every module later in the Syllabus Tracker.
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-text-muted">Starting coverage</span>
              <span className="font-display text-2xl font-bold text-text-primary">{baselinePct}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={baselinePct}
              onChange={(e) => setBaselinePct(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: "var(--accent-gold)" }}
            />
            <div className="flex justify-between text-[10px] font-mono text-text-muted">
              <span>Starting fresh</span>
              <span>Well underway</span>
            </div>
          </div>
        </div>
      )}

      <WizardNav
        step={step}
        canGoBack={step > 0}
        onBack={goBack}
        onSkipStep={skipThisStep}
        onNext={goNext}
        nextLabel={step === TOTAL_STEPS - 1 ? "Finish" : undefined}
        saving={saving}
      />
    </WizardShell>
  );
}