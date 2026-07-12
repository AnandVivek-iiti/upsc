import { useState, useMemo, useEffect } from "react";
import { X, CheckCircle2, ListChecks } from "lucide-react";
import { SUBJECT_SYLLABUS_MAP, SUBJECT_COLORS, SUBJECT_ICONS } from "../../hooks/useSubjectTimer";

function fmtDuration(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h === 0 && m === 0) return "under a minute";
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
function buildStageGroups(mappings, syllabusData, stage) {
  const stageMappings = mappings.filter((m) => m.stage === stage);
  if (stageMappings.length === 0) return { status: "unmapped", groups: [] };

  const groups = [];
  for (const { paper, module } of stageMappings) {
    const modData = syllabusData?.[stage]?.[paper]?.modules?.[module];
    if (!modData) continue;
    const topics = modData.topics || [];
    const completedTopics = modData.completedTopics || [];
    const remaining = topics.filter((t) => !completedTopics.includes(t));
    if (remaining.length === 0) continue;
    groups.push({
      key: `${stage}|${paper}|${module}`,
      stage, paper, module,
      label: module,
      remaining,
      totalTopics: topics.length,
      completedTopics,
      currentStatus: modData.status || "pending",
    });
  }
  return { status: groups.length === 0 ? "complete" : "groups", groups };
}

function buildGroups(subject, syllabusData) {
  const mappings = SUBJECT_SYLLABUS_MAP[subject] || [];
  return {
    prelims: buildStageGroups(mappings, syllabusData, "prelims"),
    mains: buildStageGroups(mappings, syllabusData, "mains"),
  };
}

const EMPTY_STAGE = { status: "unmapped", groups: [] };

function remainingCount(stageData) {
  return stageData.groups.reduce((sum, g) => sum + g.remaining.length, 0);
}

// Renders one stage's block inside the checklist: a header, then either a
// "not applicable" note, an "all caught up" note, or the actual checkboxes.
function StageSection({ stageLabel, stageData, subject, color, checked, onToggle }) {
  const { status, groups } = stageData;
  return (
    <div className="space-y-2.5">
      {status === "unmapped" ? (
        <p className="text-xs font-mono text-text-muted/70 italic pl-0.5">
          Not applicable for {subject}.
        </p>
      ) : status === "complete" ? (
        <div className="flex items-center gap-1.5 pl-0.5">
          <CheckCircle2 size={13} className="text-accent-green shrink-0" />
          <p className="text-xs font-mono text-text-muted">
            Everything mapped to {subject} in {stageLabel} is already marked covered.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((g) => (
            <div key={g.key} className="space-y-1.5">
              <p className="flex items-center gap-1.5 text-[11px] font-mono text-text-muted uppercase tracking-wider">
                <ListChecks size={11} /> {g.label}
              </p>
              <div className="space-y-1">
                {g.remaining.map((topic) => {
                  const id = `${g.key}::${topic}`;
                  const isChecked = checked.has(id);
                  return (
                    <label
                      key={id}
                      className="flex items-start gap-2 p-2 rounded-lg cursor-pointer hover:bg-bg-muted transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggle(g.key, topic)}
                        className="mt-0.5 shrink-0 accent-current"
                        style={{ accentColor: color }}
                      />
                      <span className="text-xs sm:text-sm text-text-secondary leading-snug">{topic}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SyllabusSyncModal({
  open,
  subject,
  durationSeconds = 0,
  syllabusData,
  onConfirm,   // ({ updates, note }) => Promise|void
  onSkip,
}) {
  const [checked, setChecked] = useState(() => new Set());
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeStage, setActiveStage] = useState("prelims");

  const { prelims, mains } = useMemo(
    () => (open ? buildGroups(subject, syllabusData) : { prelims: EMPTY_STAGE, mains: EMPTY_STAGE }),
    [open, subject, syllabusData]
  );
  // Flat view across both stages - handleConfirm and the "nothing mapped at
  // all" empty state don't care which stage a group came from.
  const groups = useMemo(() => [...prelims.groups, ...mains.groups], [prelims, mains]);
  useEffect(() => {
    if (open) {
      setChecked(new Set());
      setNote("");
      setSubmitting(false);
      // Default to whichever tab actually has something to show - e.g. Ethics/
      // Essay/Optional have nothing under Prelims, so open straight on Mains
      // instead of greeting the student with a "not applicable" tab.
      setActiveStage(prelims.status === "unmapped" && mains.status !== "unmapped" ? "mains" : "prelims");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, subject]);

  if (!open) return null;

  const color = SUBJECT_COLORS[subject] || "var(--accent-gold)";
  const icon = SUBJECT_ICONS[subject] || "📚";
  const hasAnything = checked.size > 0 || note.trim().length > 0;

  const toggleTopic = (groupKey, topic) => {
    const id = `${groupKey}::${topic}`;
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleConfirm = async () => {
    if (!hasAnything || submitting) return;
    setSubmitting(true);

    const updates = [];
    for (const g of groups) {
      const newlyChecked = g.remaining.filter((t) => checked.has(`${g.key}::${t}`));
      if (newlyChecked.length === 0) continue;

      const newCompletedTopics = [...g.completedTopics, ...newlyChecked];
      const progress = Math.round((newCompletedTopics.length / g.totalTopics) * 100);
      const state = progress === 100 ? "done" : (g.currentStatus === "pending" ? "progress" : g.currentStatus);

      updates.push({
        stage: g.stage,
        paper: g.paper,
        module: g.module,
        progress,
        state,
        completedTopics: newCompletedTopics,
      });
    }

    try {
      await onConfirm?.({ updates, note: note.trim() });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full sm:max-w-lg max-h-[85vh] flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-4 sm:p-5 border-b border-bg-border/50">
          <div className="flex items-start gap-2.5">
            <span className="text-xl leading-none mt-0.5">{icon}</span>
            <div>
              <h3 className="text-sm sm:text-base font-display font-semibold text-text-primary">
                What did you cover in {subject}?
              </h3>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                You studied <span style={{ color }} className="font-mono font-semibold">{subject}</span> for{" "}
                <span className="font-mono font-semibold text-text-secondary">{fmtDuration(durationSeconds)}</span>.
                Pick what you actually covered so your tracker stays accurate — nothing updates until you confirm.
              </p>
            </div>
          </div>
          <button onClick={onSkip} className="p-1 rounded-lg hover:bg-bg-muted text-text-muted hover:text-text-primary transition-colors shrink-0" title="Close">
            <X size={16} />
          </button>
        </div>

        {/* Stage tabs - Prelims / Mains switched, not stacked */}
        <div className="flex gap-1 px-4 sm:px-5 pt-3 border-b border-bg-border/50">
          {[
            { key: "prelims", label: "Prelims", data: prelims },
            { key: "mains", label: "Mains", data: mains },
          ].map((tab) => {
            const count = remainingCount(tab.data);
            const isActive = activeStage === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveStage(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-display font-semibold border-b-2 transition-colors ${
                  isActive
                    ? "text-text-primary"
                    : "text-text-muted border-transparent hover:text-text-secondary"
                }`}
                style={isActive ? { borderColor: color, color } : undefined}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-bg-muted text-text-muted"
                    style={isActive ? { color, backgroundColor: `${color}1a` } : undefined}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Checklist - only the active stage's content is shown */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          <StageSection
            stageLabel={activeStage === "prelims" ? "Prelims" : "Mains"}
            stageData={activeStage === "prelims" ? prelims : mains}
            subject={subject}
            color={color}
            checked={checked}
            onToggle={toggleTopic}
          />

          {/* Free-text fallback */}
          <div className="space-y-1.5 pt-2 border-t border-bg-border/50">
            <label className="text-[11px] font-mono text-text-muted">
              Didn't cover any of these? Add a quick note instead:
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Revised previous year's Ethics case studies"
              maxLength={500}
              rows={2}
              className="w-full bg-bg-muted border border-bg-border rounded-lg px-3 py-2 text-xs sm:text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-gold/50 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 sm:p-5 border-t border-bg-border/50">
          <button
            onClick={onSkip}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-medium bg-bg-muted border border-bg-border text-text-muted hover:text-text-primary transition-colors disabled:opacity-50"
          >
            Skip this time
          </button>
          <button
            onClick={handleConfirm}
            disabled={!hasAnything || submitting}
            className="flex-1 btn-primary py-2.5 text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Updating…" : "Update Tracker →"}
          </button>
        </div>
      </div>
    </div>
  );
}