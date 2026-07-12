import {
  SYLLABUS,
  PAPER_ORDER,
  STATUSES,
  STATUS_META,
  getPct,
  deepClone,
  getAllModules,
} from "../../data/PYQs/syllabusData";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Search, RotateCcw, CheckCheck, Loader2, Cloud, CloudOff, X, Check, Circle, CircleDot,Clock, CheckCircle2, Minus, Plus as PlusIcon } from "lucide-react";
import AIRevisionPanel from "../AI/AIRevisionPanel";

const STAGE_KEY = "upsc-syllabus-stage";
const FLUSH_DELAY = 900;

function formatExamDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((d - today) / 86400000);
}

function moduleMatches(name, mod, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  if (name.toLowerCase().includes(q)) return true;
  return (mod.topics || []).some((t) => t.toLowerCase().includes(q));
}

function highlightMatch(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span style={{ background: "var(--accent-gold-dim)", color: "var(--accent-gold)", borderRadius: 2 }}>
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}

// ─── StatusBadge ───

function StatusBadge({ status, onClick }) {
  const meta = STATUS_META[status];
  return (
    <button
      onClick={onClick}
      title="Click to change status"
      className="st-tap whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium font-body transition-opacity hover:opacity-80"
      style={{ borderColor: meta.borderVar, background: meta.bgVar, color: meta.textVar }}
    >
      {meta.label}
    </button>
  );
}

// ─── StatusIcon ───

function StatusIcon({ status, onClick }) {
  const icons = {
    pending:  { Icon: Circle,        color: "var(--text-muted)" },
    progress: { Icon: Clock,     color: "var(--accent-blue)" },
    revision: { Icon: RotateCcw,     color: "var(--accent-gold)" },
    done:     { Icon: CheckCircle2,  color: "var(--accent-green)" },
  };
  const { Icon, color } = icons[status] || icons.pending;
  return (
    <button
      type="button"
      onClick={onClick}
      title="Click to cycle status"
      className="st-tap flex-shrink-0 flex items-center justify-center"
      style={{ color, background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
    >
      <Icon size={18} strokeWidth={2} />
    </button>
  );
}

// ─── ProgressBar ───

function ProgressBar({ value, color, height = 6 }) {
  return (
    <div className="st-progress-track min-w-0 flex-1" style={{ height }}>
      <div
        className="st-progress-fill h-full"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}
      />
    </div>
  );
}

// ─── MiniStatCard ───

function MiniStatCard({ value, label, accent }) {
  return (
    <div
      className="min-w-0 rounded-xl border border-bg-border bg-bg-surface px-3 py-4 text-center shadow-[var(--shadow-sm)]"
      style={{ borderTop: `3px solid ${accent}` }}
    >
      <div className="st-stat-value font-display text-[28px] font-bold leading-none text-text-primary">
        {value}
      </div>
      <div className="mt-[5px] font-mono text-[11px] text-text-muted">{label}</div>
    </div>
  );
}

// ─── SaveIndicator ───

function SaveIndicator({ state }) {
  if (state === "idle") return null;
  const map = {
    pending: { icon: <CloudOff size={13} />, label: "Unsaved changes", cls: "text-text-muted" },
    saving: { icon: <Loader2 size={13} className="animate-spin" />, label: "Saving…", cls: "text-[var(--accent-blue)]" },
    saved: { icon: <Cloud size={13} />, label: "Saved", cls: "text-[var(--accent-green)]" },
    error: { icon: <CloudOff size={13} />, label: "Sync failed — retrying", cls: "text-[var(--accent-red)]" },
  };
  const cfg = map[state];
  if (!cfg) return null;
  return (
    <div key={state} className={`animate-fade-in flex items-center gap-1.5 font-mono text-[11px] ${cfg.cls}`}>
      {cfg.icon}
      <span>{cfg.label}</span>
    </div>
  );
}

// ─── ModuleRow ───

function ModuleRow({ name, mod, color, query, onCycleStatus, onSetProgress, onToggleTopic, onSetAllTopics }) {
  const [editing, setEditing] = useState(false);
  const [tempVal, setTempVal] = useState(mod.progress);
  const rowId = `st-module-${name.replace(/\s+/g, "-")}`;
  const completedTopics = mod.completedTopics || [];
  const topics = mod.topics || [];

  function commitEdit(val) {
    onSetProgress(Math.max(0, Math.min(100, val)));
  }

  return (
    <div
      id={rowId}
      className="st-module-row flex items-start gap-3.5 border-b border-bg-border px-5 py-3.5 transition-colors hover:bg-bg-muted"
    >
      <div className="st-module-main flex min-w-0 flex-1 items-start gap-3.5">
        <StatusIcon status={mod.status} onClick={onCycleStatus} />

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-sm font-medium text-text-primary">{name}</span>
            {topics.length > 0 && (
              <span className="rounded-full bg-bg-muted px-1.5 py-0.5 font-mono text-[9px] text-text-muted shrink-0">
                {completedTopics.length}/{topics.length} topics
              </span>
            )}
          </div>

          {topics.length > 0 && (
            <div className="mb-1 flex flex-wrap gap-1">
              {topics.map((t) => {
                const done = completedTopics.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onToggleTopic(t)}
                    title={done ? "Click to mark topic not done" : "Click to mark topic done"}
                    aria-pressed={done}
                    className={`st-tap inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] transition-colors ${
                      done
                        ? "border-[var(--status-done-border)] bg-[var(--status-done-bg)] text-[var(--status-done-text)]"
                        : "border-bg-border bg-bg-muted text-text-muted hover:border-[var(--accent-gold)]/40 hover:text-text-secondary"
                    }`}
                  >
                    {done && <Check size={9} className="shrink-0" />}
                    <span className={done ? "line-through decoration-1" : ""}>{highlightMatch(t, query)}</span>
                  </button>
                );
              })}
            </div>
          )}

          {topics.length > 1 && (
            <div className="mb-2 flex items-center gap-2.5 font-mono text-[10px]">
              <button
                type="button"
                onClick={() => onSetAllTopics(topics)}
                className="text-text-muted hover:text-[var(--accent-gold)] transition-colors"
              >
                Check all
              </button>
              <span className="text-bg-border">·</span>
              <button
                type="button"
                onClick={() => onSetAllTopics([])}
                className="text-text-muted hover:text-[var(--accent-red)] transition-colors"
              >
                Clear
              </button>
            </div>
          )}

          <div className="flex items-center gap-2.5">
            <ProgressBar value={mod.progress} color={color} height={6} />
            <span className="min-w-[34px] text-right font-mono text-xs tabular-nums text-text-muted">
              {mod.progress}%
            </span>
          </div>
        </div>
      </div>

      <div className="st-module-actions flex flex-shrink-0 items-center gap-2 pt-0.5">
        <StatusBadge status={mod.status} onClick={onCycleStatus} />
        {editing ? (
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => { const v = Math.max(0, mod.progress - 10); setTempVal(v); commitEdit(v); }}
              className="st-tap flex h-6 w-6 items-center justify-center rounded-md border border-bg-border text-text-muted hover:text-text-primary"
              title="-10%"
            >
              <Minus size={11} />
            </button>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={tempVal}
              autoFocus
              onChange={(e) => { const v = Number(e.target.value); setTempVal(v); commitEdit(v); }}
              onKeyDown={(e) => { if (e.key === "Escape" || e.key === "Enter") setEditing(false); }}
              className="w-20 accent-[var(--accent-gold)]"
              style={{ accentColor: color }}
            />
            <span className="w-9 text-right font-mono text-[11px] tabular-nums text-text-secondary">{tempVal}%</span>
            <button
              onClick={() => { const v = Math.min(100, mod.progress + 10); setTempVal(v); commitEdit(v); }}
              className="st-tap flex h-6 w-6 items-center justify-center rounded-md border border-bg-border text-text-muted hover:text-text-primary"
              title="+10%"
            >
              <PlusIcon size={11} />
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-md px-1.5 py-1 font-body text-[11px]"
              style={{ background: color, color: "#fff" }}
            >
              <Check size={11} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setTempVal(mod.progress);
              setEditing(true);
            }}
            className="rounded-md border border-bg-border px-2.5 py-1 font-mono text-[11px] text-text-muted"
          >
            Edit %
          </button>
        )}
      </div>
    </div>
  );
}

// ─── PaperCard ───

function PaperCard({ paperId, paper, isOpen, query, onToggle, onCycleStatus, onSetProgress, onToggleTopic, onSetAllTopics, onBulkStatus }) {
  const pct = getPct(paper.modules);
  const allMods = Object.entries(paper.modules);
  const mods = allMods.filter(([name, mod]) => moduleMatches(name, mod, query));
  const done = allMods.filter(([, m]) => m.status === "done").length;
  const forcedOpen = !!query && mods.length > 0;

  if (query && mods.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-bg-border bg-bg-surface shadow-[var(--shadow-sm)]">
      <button
        onClick={onToggle}
        className="st-paper-header st-tap flex w-full items-center gap-3.5 px-5 py-4 text-left"
      >
        <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: paper.color }} />
        <div className="min-w-0 flex-1">
          <div className="st-paper-label font-display text-[15px] font-semibold text-text-primary">
            {paper.label}
          </div>
          {paper.subtitle && (
            <div className="mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[11px] text-text-muted">
              {paper.subtitle}
            </div>
          )}
        </div>
        <div className="st-paper-meta flex flex-shrink-0 items-center gap-3">
          <div className="text-right">
            <div className="font-display text-xl font-bold leading-none text-text-primary">{pct}%</div>
            <div className="mt-0.5 whitespace-nowrap font-mono text-[10px] text-text-muted">
              {done}/{allMods.length} done
            </div>
          </div>
          <div
            className="st-paper-circle flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full"
            style={{ background: `conic-gradient(${paper.color} ${pct}%, var(--bg-muted) 0)` }}
          >
            <div className="h-9 w-9 rounded-full bg-bg-surface" />
          </div>
          <span
            className="flex-shrink-0 text-base text-text-muted transition-transform duration-200"
            style={{ transform: isOpen || forcedOpen ? "rotate(180deg)" : "none" }}
          >
            ▾
          </span>
        </div>
      </button>

      <div className="px-5 pb-3">
        <ProgressBar value={pct} color={paper.color} height={8} />
      </div>

      {(isOpen || forcedOpen) && (
        <div className="border-t border-bg-border">
          <div className="st-bulk-actions flex flex-wrap items-center gap-2 border-b border-bg-border bg-bg-muted px-5 py-2">
            <button
              onClick={() => onBulkStatus("done")}
              className="st-tap flex items-center gap-1 rounded-md border border-bg-border px-2 py-1 font-mono text-[10px] text-text-secondary hover:text-text-primary"
            >
              <CheckCheck size={12} /> Mark all done
            </button>
            <button
              onClick={() => onBulkStatus("pending")}
              className="st-tap flex items-center gap-1 rounded-md border border-bg-border px-2 py-1 font-mono text-[10px] text-text-secondary hover:text-text-primary"
            >
              <RotateCcw size={12} /> Reset all
            </button>
          </div>
          {mods.map(([modName, mod], i) => (
            <div key={modName} className="animate-fade-in" style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}>
              <ModuleRow
                name={modName}
                mod={mod}
                color={paper.color}
                query={query}
                onCycleStatus={() => onCycleStatus(paperId, modName)}
                onSetProgress={(val) => onSetProgress(paperId, modName, val)}
                onToggleTopic={(topic) => onToggleTopic(paperId, modName, topic)}
                onSetAllTopics={(topicsArr) => onSetAllTopics(paperId, modName, topicsArr)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── StageCoverageBar ───

const PAPER_SHORT_LABEL = {
  OptionalSubject: "Optional",
  QualifyingLang: "Qual. Lang",
};

function StageCoverageBar({ label, papers, paperOrder }) {
  return (
    <div className="mb-3.5">
      <div className="mb-1.5 font-mono text-[11px] text-text-muted">{label}</div>
      <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-lg">
        {paperOrder.map((id) => {
          const p = papers[id];
          if (!p) return null;
          const pct = getPct(p.modules);
          const weight = 100 / paperOrder.length;
          return (
            <div key={id} className="relative h-full bg-bg-muted" style={{ width: `${weight}%` }}>
              <div className="h-full transition-[width] duration-500" style={{ width: `${pct}%`, background: p.color }} />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1.5">
        {paperOrder.map((id) => {
          const p = papers[id];
          if (!p) return null;
          return (
            <div key={id} className="st-legend-item inline-flex items-center gap-1 whitespace-nowrap">
              <div className="h-[7px] w-[7px] flex-shrink-0 rounded-full" style={{ background: p.color }} />
              <span className="font-mono text-[10px] text-text-muted">{PAPER_SHORT_LABEL[id] || id}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── FocusNextCard ───

function FocusNextCard({ focus, onOpen }) {
  if (!focus) return null;
  return (
    <button
      onClick={onOpen}
      className="st-tap animate-slide-up mb-5 flex w-full items-center justify-between gap-3 rounded-2xl border border-bg-border bg-bg-surface px-5 py-3.5 text-left shadow-[var(--shadow-sm)] transition-colors hover:bg-bg-muted"
    >
      <div className="min-w-0">
        <div className="font-mono text-[10px] uppercase tracking-wide text-text-muted">Focus next · {focus.label}</div>
        <div className="mt-0.5 truncate text-sm font-medium text-text-primary">{focus.modName}</div>
      </div>
      <span className="flex-shrink-0 font-mono text-[11px] text-[var(--accent-gold)]">Open →</span>
    </button>
  );
}

// ─── Main SyllabusTracker Component ───

export default function SyllabusTracker({
  userData,
  onUpdateProgress,
  onBulkUpdateProgress,
  isLoggedIn = false,
  error,
  onNavigateProfile,
}) {
  const [data, setData] = useState(deepClone(SYLLABUS));
  const [stage, setStage] = useState(() => {
    if (typeof window === "undefined") return "prelims";
    return localStorage.getItem(STAGE_KEY) || "prelims";
  });
  const [openPapers, setOpenPapers] = useState({ GS1: true });
  const [query, setQuery] = useState("");
  const [saveState, setSaveState] = useState("idle");

  const pendingRef = useRef(new Map());
  const timerRef = useRef(null);
  const cbRef = useRef({});
  cbRef.current = { bulk: onBulkUpdateProgress, single: onUpdateProgress };

  useEffect(() => {
    if (userData?.syllabus) {
      setData(deepClone(userData.syllabus));
    }
  }, [userData?.syllabus]);

  useEffect(() => {
    localStorage.setItem(STAGE_KEY, stage);
  }, [stage]);

  useEffect(() => {
    if (error) setSaveState("error");
  }, [error]);

  const flushNow = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (pendingRef.current.size === 0) return;
    const updates = Array.from(pendingRef.current.values());
    pendingRef.current.clear();
    setSaveState("saving");
    const run = cbRef.current.bulk
      ? cbRef.current.bulk(updates)
      : Promise.all(updates.map((u) => cbRef.current.single?.(u.stage, u.paper, u.module, u.progress, u.state, u.completedTopics)));
    Promise.resolve(run).then(() => {
      setSaveState("saved");
      setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 1800);
    });
  }, []);

  useEffect(() => () => flushNow(), [flushNow]);

  const queueChange = useCallback(
    (entry) => {
      pendingRef.current.set(`${entry.stage}|${entry.paper}|${entry.module}`, entry);
      setSaveState("pending");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flushNow, FLUSH_DELAY);
    },
    [flushNow]
  );

  const togglePaper = useCallback((id) => {
    setOpenPapers((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // Targeted, structural-sharing update: clones only the touched
  // stage -> paper -> modules path and returns the new module object.
  // Every other stage/paper/module keeps its original reference, so this
  // is O(modules in one paper) instead of a JSON deep-clone of the whole
  // syllabus (all stages, all papers, all modules) on every single tap -
  // which is what ran here before, on the app's most-used interaction.
  function withModule(prev, stage_, paperId, modName, mutate) {
    const paper = prev[stage_][paperId];
    const mod = { ...paper.modules[modName] };
    mutate(mod);
    const next = {
      ...prev,
      [stage_]: {
        ...prev[stage_],
        [paperId]: { ...paper, modules: { ...paper.modules, [modName]: mod } },
      },
    };
    return { next, mod };
  }

  const cycleStatus = useCallback(
    (stage_, paperId, modName) => {
      setData((prev) => {
        const { next, mod } = withModule(prev, stage_, paperId, modName, (m) => {
          const idx = STATUSES.indexOf(m.status);
          m.status = STATUSES[(idx + 1) % STATUSES.length];
          if (m.status === "done") { m.progress = 100; m.completedTopics = [...(m.topics || [])]; }
          else if (m.status === "pending") { m.progress = 0; m.completedTopics = []; }
          else if (m.status === "revision" && m.progress === 100) m.progress = 70;
        });
        queueChange({ stage: stage_, paper: paperId, module: modName, progress: mod.progress, state: mod.status, completedTopics: mod.completedTopics });
        return next;
      });
    },
    [queueChange]
  );

  const setProgress = useCallback(
    (stage_, paperId, modName, val) => {
      setData((prev) => {
        const { next, mod } = withModule(prev, stage_, paperId, modName, (m) => {
          m.progress = Math.max(0, Math.min(100, val));
          if (m.progress === 100) { m.status = "done"; m.completedTopics = [...(m.topics || [])]; }
          else if (m.progress === 0) { m.status = "pending"; m.completedTopics = []; }
          else if (m.status === "pending" || m.status === "done") m.status = "progress";
        });
        queueChange({ stage: stage_, paper: paperId, module: modName, progress: mod.progress, state: mod.status, completedTopics: mod.completedTopics });
        return next;
      });
    },
    [queueChange]
  );

  // Toggling an individual topic tag recomputes the module's progress/status
  // from how many of its topics are checked off, and keeps completedTopics
  // in sync so the tags always reflect what's actually saved.
  const toggleTopic = useCallback(
    (stage_, paperId, modName, topic) => {
      setData((prev) => {
        const { next, mod } = withModule(prev, stage_, paperId, modName, (m) => {
          const set = new Set(m.completedTopics || []);
          if (set.has(topic)) set.delete(topic);
          else set.add(topic);
          m.completedTopics = (m.topics || []).filter((t) => set.has(t));
          const total = (m.topics || []).length || 1;
          m.progress = Math.round((m.completedTopics.length / total) * 100);
          if (m.progress === 100) m.status = "done";
          else if (m.progress === 0) m.status = "pending";
          else m.status = "progress";
        });
        queueChange({ stage: stage_, paper: paperId, module: modName, progress: mod.progress, state: mod.status, completedTopics: mod.completedTopics });
        return next;
      });
    },
    [queueChange]
  );

  // "Check all" / "Clear" per module - sets completedTopics to the full
  // topic list or to empty in one shot, same recompute rules as toggleTopic.
  const setAllTopics = useCallback(
    (stage_, paperId, modName, topicsArr) => {
      setData((prev) => {
        const { next, mod } = withModule(prev, stage_, paperId, modName, (m) => {
          m.completedTopics = [...topicsArr];
          const total = (m.topics || []).length || 1;
          m.progress = Math.round((m.completedTopics.length / total) * 100);
          if (m.progress === 100) m.status = "done";
          else if (m.progress === 0) m.status = "pending";
          else m.status = "progress";
        });
        queueChange({ stage: stage_, paper: paperId, module: modName, progress: mod.progress, state: mod.status, completedTopics: mod.completedTopics });
        return next;
      });
    },
    [queueChange]
  );

  const bulkSetPaper = useCallback(
    (stage_, paperId, status) => {
      setData((prev) => {
        const paper = prev[stage_][paperId];
        const nextModules = {};
        for (const [modName, mod] of Object.entries(paper.modules)) {
          const nextMod = {
            ...mod,
            status,
            progress: status === "done" ? 100 : status === "pending" ? 0 : mod.progress,
            completedTopics: status === "done" ? [...(mod.topics || [])] : status === "pending" ? [] : (mod.completedTopics || []),
          };
          nextModules[modName] = nextMod;
          queueChange({ stage: stage_, paper: paperId, module: modName, progress: nextMod.progress, state: nextMod.status, completedTopics: nextMod.completedTopics });
        }
        return {
          ...prev,
          [stage_]: { ...prev[stage_], [paperId]: { ...paper, modules: nextModules } },
        };
      });
      flushNow();
    },
    [queueChange, flushNow]
  );

  const allMods = [...getAllModules(data, "prelims"), ...getAllModules(data, "mains")];
  const totalMods = allMods.length;
  const overall = totalMods ? Math.round(allMods.reduce((s, m) => s + m.progress, 0) / totalMods) : 0;
  const countDone = allMods.filter((m) => m.status === "done").length;
  const countProgress = allMods.filter((m) => m.status === "progress").length;
  const countRevision = allMods.filter((m) => m.status === "revision").length;
  const countPending = allMods.filter((m) => m.status === "pending").length;

  const focusNext = useMemo(() => {
    const scan = (statusWanted, label) => {
      for (const stage_ of ["prelims", "mains"]) {
        for (const paperId of PAPER_ORDER[stage_]) {
          const paper = data[stage_]?.[paperId];
          if (!paper) continue;
          for (const [modName, mod] of Object.entries(paper.modules)) {
            if (mod.status === statusWanted) return { stage: stage_, paperId, modName, label };
          }
        }
      }
      return null;
    };
    return scan("revision", "needs revision") || scan("pending", "not started yet");
  }, [data]);

  const openFocusNext = () => {
    if (!focusNext) return;
    setQuery("");
    setStage(focusNext.stage);
    setOpenPapers((prev) => ({ ...prev, [focusNext.paperId]: true }));
    setTimeout(() => {
      const el = document.getElementById(`st-module-${focusNext.modName.replace(/\s+/g, "-")}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
  };

  const currentPapers = data[stage];
  const currentOrder = PAPER_ORDER[stage];

  const targetYear = userData?.profile?.target_year || userData?.profile?.targetYear || null;
  const examDateRaw = userData?.profile?.examDate || null;
  const examDateFormatted = formatExamDate(examDateRaw);
  const daysLeft = daysUntil(examDateRaw);

  return (
    <div className="st-root mx-auto box-border w-full max-w-[1152px] px-6 py-8 font-body text-text-primary">
      <style>{`
        .st-root { box-sizing: border-box; }
        .st-root *, .st-root *::before, .st-root *::after { box-sizing: border-box; }
        .st-progress-track { background: var(--bg-muted); border-radius: 999px; overflow: hidden; height: 6px; }
        .st-progress-fill { border-radius: 999px; transition: width .4s ease; }
        .st-tap { transition: transform .12s ease; }
        .st-tap:active { transform: scale(0.96); }
        @media (max-width: 640px) {
          .st-root { padding: 16px 12px !important; }
          .st-topbar { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; margin-bottom: 24px !important; }
          .st-topbar-right { text-align: left !important; width: 100%; }
          .st-title { font-size: 22px !important; }
          .st-overall { font-size: 38px !important; }
          .st-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
          .st-coverage-box { padding: 16px 14px !important; }
          .st-controls-row { flex-direction: column !important; align-items: stretch !important; }
          .st-stage-tabs { width: 100% !important; }
          .st-stage-tab-btn { flex: 1 !important; padding: 8px 10px !important; font-size: 15px !important; }
          .st-search-wrap { width: 100% !important; max-width: none !important; }
          .st-paper-header { padding: 12px 14px !important; gap: 10px !important; }
          .st-paper-meta { gap: 8px !important; }
          .st-paper-circle { display: none !important; }
          .st-bulk-actions { padding: 8px 14px !important; }
          .st-module-row { flex-direction: column !important; gap: 8px !important; padding: 12px 14px !important; }
          .st-module-actions { width: 100% !important; justify-content: space-between !important; padding-top: 0 !important; }
          .st-ai-grid { grid-template-columns: 1fr !important; }
          .st-progress-track { height: 10px !important; }
          .st-legend-item { font-size: 9px !important; }
        }
        @media (max-width: 420px) {
          .st-title { font-size: 19px !important; }
          .st-overall { font-size: 32px !important; }
          .st-stat-value { font-size: 20px !important; }
          .st-paper-label { font-size: 13.5px !important; }
        }
      `}</style>

      {/* ── Top Bar ── */}
      <div className="st-topbar mb-8 flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="st-title font-display text-[28px] font-semibold leading-tight text-text-primary">
            UPSC CSE{targetYear ? ` ${targetYear}` : ""}
          </div>
          <div className="mt-1 font-mono text-sm text-text-muted">Syllabus Tracker</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {examDateFormatted ? (
              <>
                <span className="rounded-full border border-[var(--status-prog-border)] bg-[var(--status-prog-bg)] px-2.5 py-1 font-mono text-[11px] font-medium text-[var(--status-prog-text)]">
                  Exam: {examDateFormatted}
                </span>
                {daysLeft !== null && (
                  <span
                    className="rounded-full border px-2.5 py-1 font-mono text-[11px] font-medium"
                    style={
                      daysLeft >= 0
                        ? { background: "var(--status-done-bg)", color: "var(--status-done-text)", borderColor: "var(--status-done-border)" }
                        : { background: "var(--status-pend-bg)", color: "var(--status-pend-text)", borderColor: "var(--status-pend-border)" }
                    }
                  >
                    {daysLeft >= 0 ? `${daysLeft} days left` : "Exam date passed"}
                  </span>
                )}
              </>
            ) : (
              <button
                onClick={onNavigateProfile}
                className="rounded-full border border-[var(--accent-gold)] bg-transparent px-2.5 py-1 font-mono text-[11px] font-medium text-[var(--accent-gold)] hover:bg-[var(--accent-gold-dim)]"
              >
                Set your exam date →
              </button>
            )}
          </div>
        </div>
        <div className="st-topbar-right flex-shrink-0 text-right">
          <div className="st-overall font-display text-[52px] font-black leading-none text-text-primary">{overall}%</div>
          <div className="mt-1 font-mono text-xs text-text-muted">overall coverage</div>
          <div className="mt-0.5 font-mono text-xs text-text-muted">
            {countDone} of {totalMods} modules done
          </div>
          <div className="mt-2 flex justify-end">
            <SaveIndicator state={saveState} />
          </div>
        </div>
      </div>

      <FocusNextCard focus={focusNext} onOpen={openFocusNext} />

      {/* ── Mini stats ── */}
      <div className="st-stats-grid mb-6 grid grid-cols-4 gap-2.5">
        <MiniStatCard value={countDone} label="Done" accent="var(--accent-green)" />
        <MiniStatCard value={countProgress} label="In progress" accent="var(--accent-blue)" />
        <MiniStatCard value={countRevision} label="Needs revision" accent="var(--accent-gold)" />
        <MiniStatCard value={countPending} label="Not started" accent="var(--bg-border)" />
      </div>

      {/* ── Coverage bars ── */}
      <div className="st-coverage-box mb-6 rounded-2xl border border-bg-border bg-bg-surface px-6 py-5 shadow-[var(--shadow-sm)]">
        <StageCoverageBar label="Prelims coverage" papers={data.prelims} paperOrder={PAPER_ORDER.prelims} />
        <StageCoverageBar label="Mains coverage" papers={data.mains} paperOrder={PAPER_ORDER.mains} />
      </div>

      {/* ── Stage tabs + search ── */}
      <div className="st-controls-row mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="st-stage-tabs flex w-fit overflow-hidden rounded-[10px] border border-bg-border shadow-[var(--shadow-sm)]">
          {["prelims", "mains"].map((s) => (
            <button
              key={s}
              className="st-stage-tab-btn st-tap px-7 py-[9px] font-body text-lg capitalize tracking-[0.02em] transition-colors"
              style={{
                fontWeight: stage === s ? 600 : 400,
                background: stage === s ? "var(--text-primary)" : "transparent",
                color: stage === s ? "var(--bg-base)" : "var(--text-secondary)",
              }}
              onClick={() => setStage(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="st-search-wrap relative w-72 max-w-full">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search modules or topics…"
            className="w-full rounded-lg border border-bg-border bg-bg-surface py-2 pl-8 pr-8 font-mono text-xs text-text-primary outline-none transition-shadow placeholder:text-text-muted focus:ring-2 focus:ring-[var(--accent-gold)]"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="st-tap absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Papers ── */}
      <div key={stage} className="flex flex-col gap-3">
        {currentOrder.map((paperId, i) => {
          const paper = currentPapers[paperId];
          if (!paper) return null;
          return (
            <div key={paperId} className="animate-slide-up" style={{ animationDelay: `${Math.min(i, 6) * 45}ms` }}>
              <PaperCard
                paperId={paperId}
                paper={paper}
                isOpen={!!openPapers[paperId]}
                query={query}
                onToggle={() => togglePaper(paperId)}
                onCycleStatus={(pid, modName) => cycleStatus(stage, pid, modName)}
                onSetProgress={(pid, modName, val) => setProgress(stage, pid, modName, val)}
                onToggleTopic={(pid, modName, topic) => toggleTopic(stage, pid, modName, topic)}
                onSetAllTopics={(pid, modName, topicsArr) => setAllTopics(stage, pid, modName, topicsArr)}
                onBulkStatus={(status) => bulkSetPaper(stage, paperId, status)}
              />
            </div>
          );
        })}
      </div>

      {/* ── AI Revision + Mentor Chat ── */}
      <div className="st-ai-grid mt-6 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        <AIRevisionPanel isLoggedIn={isLoggedIn} compact={true} />
      </div>

      {/* ── Footer ── */}
      <div className="mt-8 border-t border-bg-border pt-5 text-center">
        <div className="font-mono text-[11px] text-text-muted">
          Examination Notice No. 05/2026-CSE · Union Public Service Commission
        </div>
      </div>
    </div>
  );
}