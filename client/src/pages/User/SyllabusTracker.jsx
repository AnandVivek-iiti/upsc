import {
  SYLLABUS,
  PAPER_ORDER,
  STATUSES,
  STATUS_META,
  getPct,
  deepClone,
  getAllModules,
} from "../../data/PYQs/syllabusData";
import { useState, useCallback, useEffect } from "react";
import AIMentorChat from "../AI/AIMentorChat";
import AIRevisionPanel from "../AI/AIRevisionPanel";

// ─── StatusBadge ─────────────────────────────────────────────────────────────

function StatusBadge({ status, onClick }) {
  const meta = STATUS_META[status];
  return (
    <button
      onClick={onClick}
      title="Click to change status"
      style={{
        fontSize: 11,
        padding: "3px 10px",
        borderRadius: 20,
        border: `0.5px solid ${meta.borderVar}`,
        background: meta.bgVar,
        color: meta.textVar,
        cursor: "pointer",
        fontWeight: 500,
        whiteSpace: "nowrap",
        transition: "opacity .15s",
        fontFamily: "inherit",
      }}
    >
      {meta.label}
    </button>
  );
}

// ─── StatusIcon ──────────────────────────────────────────────────────────────

function StatusIcon({ status, onClick }) {
  const icons = {
    pending:  { symbol: "○", color: "var(--text-muted)" },
    progress: { symbol: "◑", color: "var(--accent-blue)" },
    revision: { symbol: "↻", color: "var(--accent-gold)" },
    done:     { symbol: "✓", color: "var(--accent-green)" },
  };
  const { symbol, color } = icons[status] || icons.pending;
  return (
    <span
      onClick={onClick}
      title="Click to cycle status"
      style={{ color, fontSize: 18, cursor: "pointer", flexShrink: 0, lineHeight: 1, userSelect: "none" }}
    >
      {symbol}
    </span>
  );
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────

function ProgressBar({ value, color, height = 6, className = "" }) {
  return (
    <div
      className={`st-progress-track ${className}`}
      style={{
        flex: 1,
        height,
        background: "var(--bg-muted)",
        borderRadius: 999,
        overflow: "hidden",
        minWidth: 0,
      }}
    >
      <div
        className="st-progress-fill"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          height: "100%",
          background: color,
          borderRadius: 999,
          transition: "width .4s ease",
        }}
      />
    </div>
  );
}

// ─── MiniStatCard ─────────────────────────────────────────────────────────────

function MiniStatCard({ value, label, accent }) {
  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "0.5px solid var(--bg-border)",
      borderRadius: 12,
      padding: "16px 12px",
      textAlign: "center",
      borderTop: `3px solid ${accent}`,
      boxShadow: "var(--shadow-sm)",
      minWidth: 0,
    }}>
      <div className="st-stat-value" style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1, fontFamily: "'Playfair Display', Georgia, serif" }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 5, fontFamily: "'DM Mono', monospace" }}>
        {label}
      </div>
    </div>
  );
}

// ─── ModuleRow ────────────────────────────────────────────────────────────────

function ModuleRow({ name, mod, color, onCycleStatus, onSetProgress }) {
  const [editing,  setEditing]  = useState(false);
  const [tempVal,  setTempVal]  = useState(mod.progress);
  const [hovered,  setHovered]  = useState(false);

  function commitEdit() {
    const val = Math.max(0, Math.min(100, parseInt(tempVal) || 0));
    onSetProgress(val);
    setEditing(false);
  }

  return (
    <div
      className="st-module-row"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        padding: "14px 20px",
        borderBottom: "0.5px solid var(--bg-border)",
        background: hovered ? "var(--bg-muted)" : "transparent",
        transition: "background .12s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="st-module-main" style={{ display: "flex", alignItems: "flex-start", gap: 14, flex: 1, minWidth: 0 }}>
        <StatusIcon status={mod.status} onClick={onCycleStatus} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", marginBottom: 6 }}>{name}</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
            {(mod.topics || []).map((t) => (
              <span key={t} style={{
                fontSize: 10,
                padding: "2px 8px",
                background: "var(--bg-muted)",
                color: "var(--text-muted)",
                borderRadius: 20,
                border: "0.5px solid var(--bg-border)",
                fontFamily: "'DM Mono', monospace",
              }}>
                {t}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ProgressBar value={mod.progress} color={color} height={6} />
            <span style={{
              fontSize: 12,
              color: "var(--text-muted)",
              minWidth: 34,
              textAlign: "right",
              fontVariantNumeric: "tabular-nums",
              fontFamily: "'DM Mono', monospace",
            }}>
              {mod.progress}%
            </span>
          </div>
        </div>
      </div>

      <div className="st-module-actions" style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, paddingTop: 2 }}>
        <StatusBadge status={mod.status} onClick={onCycleStatus} />
        {editing ? (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input
              type="number"
              min={0}
              max={100}
              value={tempVal}
              autoFocus
              onChange={(e) => setTempVal(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter")  commitEdit();
                if (e.key === "Escape") setEditing(false);
              }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 52,
                padding: "4px 6px",
                borderRadius: 6,
                border: "1px solid var(--bg-border)",
                background: "var(--bg-surface)",
                color: "var(--text-primary)",
                fontSize: 12,
                fontFamily: "'DM Mono', monospace",
              }}
            />
            <button
              onClick={commitEdit}
              style={{
                padding: "4px 8px",
                borderRadius: 6,
                border: "none",
                background: color,
                color: "#fff",
                fontSize: 11,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >✓</button>
          </div>
        ) : (
          <button
            onClick={() => { setTempVal(mod.progress); setEditing(true); }}
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              border: "0.5px solid var(--bg-border)",
              background: "transparent",
              color: "var(--text-muted)",
              fontSize: 11,
              cursor: "pointer",
              fontFamily: "'DM Mono', monospace",
            }}
          >
            Edit %
          </button>
        )}
      </div>
    </div>
  );
}

// ─── PaperCard ────────────────────────────────────────────────────────────────

function PaperCard({ paperId, paper, isOpen, onToggle, onCycleStatus, onSetProgress }) {
  const pct   = getPct(paper.modules);
  const mods  = Object.entries(paper.modules);
  const done  = mods.filter(([, m]) => m.status === "done").length;

  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "0.5px solid var(--bg-border)",
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: "var(--shadow-sm)",
    }}>
      {/* Paper header */}
      <button
        onClick={onToggle}
        className="st-paper-header"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "16px 20px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: paper.color, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="st-paper-label" style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", fontFamily: "'Playfair Display', serif" }}>
            {paper.label}
          </div>
          {paper.subtitle && (
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, fontFamily: "'DM Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {paper.subtitle}
            </div>
          )}
        </div>
        <div className="st-paper-meta" style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>
              {pct}%
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", marginTop: 2, whiteSpace: "nowrap" }}>
              {done}/{mods.length} done
            </div>
          </div>
          <div className="st-paper-circle" style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: `conic-gradient(${paper.color} ${pct}%, var(--bg-muted) 0)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--bg-surface)" }} />
          </div>
          <span style={{ fontSize: 16, color: "var(--text-muted)", transition: "transform .2s", transform: isOpen ? "rotate(180deg)" : "none", flexShrink: 0 }}>
            ▾
          </span>
        </div>
      </button>

      {/* Progress bar */}
      <div style={{ padding: "0 20px 12px" }}>
        <ProgressBar value={pct} color={paper.color} height={8} />
      </div>

      {/* Module rows */}
      {isOpen && (
        <div style={{ borderTop: "0.5px solid var(--bg-border)" }}>
          {mods.map(([modName, mod]) => (
            <ModuleRow
              key={modName}
              name={modName}
              mod={mod}
              color={paper.color}
              onCycleStatus={() => onCycleStatus(paperId, modName)}
              onSetProgress={(val) => onSetProgress(paperId, modName, val)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── StageCoverageBar ─────────────────────────────────────────────────────────

function StageCoverageBar({ label, papers, paperOrder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>
        {label}
      </div>
      <div style={{ display: "flex", height: 10, borderRadius: 8, overflow: "hidden", gap: 2 }}>
        {paperOrder.map((id) => {
          const p   = papers[id];
          if (!p) return null;
          const pct    = getPct(p.modules);
          const weight = 100 / paperOrder.length;
          return (
            <div key={id} style={{ width: `${weight}%`, height: "100%", background: "var(--bg-muted)", position: "relative" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: p.color, transition: "width .5s" }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", marginTop: 6, flexWrap: "wrap", rowGap: 4 }}>
        {paperOrder.map((id) => {
          const p = papers[id];
          if (!p) return null;
          return (
            <div key={id} style={{ flex: "1 1 auto", minWidth: 44, display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: p.color }} />
              <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>{id}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main SyllabusTracker Component ──────────────────────────────────────────

export default function SyllabusTracker({ userData, onUpdateProgress, isLoggedIn = false }) {
  const [data,       setData]       = useState(deepClone(SYLLABUS));
  const [stage,      setStage]      = useState("prelims");
  const [openPapers, setOpenPapers] = useState({ GS1: true });

  useEffect(() => {
    if (userData?.syllabus) {
      setData(deepClone(userData.syllabus));
    }
  }, [userData?.syllabus]);

  const togglePaper = useCallback((id) => {
    setOpenPapers((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const cycleStatus = useCallback((stage_, paperId, modName) => {
    setData((prev) => {
      const next = deepClone(prev);
      const mod  = next[stage_][paperId].modules[modName];
      const idx  = STATUSES.indexOf(mod.status);
      mod.status = STATUSES[(idx + 1) % STATUSES.length];
      if (mod.status === "done")     mod.progress = 100;
      else if (mod.status === "pending")  mod.progress = 0;
      else if (mod.status === "revision" && mod.progress === 100) mod.progress = 70;
      onUpdateProgress?.(stage_, paperId, modName, mod.progress, mod.status);
      return next;
    });
  }, [onUpdateProgress]);

  const setProgress = useCallback((stage_, paperId, modName, val) => {
    setData((prev) => {
      const next = deepClone(prev);
      const mod  = next[stage_][paperId].modules[modName];
      mod.progress = Math.max(0, Math.min(100, val));
      if (mod.progress === 100)      mod.status = "done";
      else if (mod.progress === 0)   mod.status = "pending";
      else if (mod.status === "pending" || mod.status === "done") mod.status = "progress";
      onUpdateProgress?.(stage_, paperId, modName, mod.progress, mod.status);
      return next;
    });
  }, [onUpdateProgress]);

  const allMods       = [...getAllModules(data, "prelims"), ...getAllModules(data, "mains")];
  const totalMods     = allMods.length;
  const overall       = totalMods ? Math.round(allMods.reduce((s, m) => s + m.progress, 0) / totalMods) : 0;
  const countDone     = allMods.filter((m) => m.status === "done").length;
  const countProgress = allMods.filter((m) => m.status === "progress").length;
  const countRevision = allMods.filter((m) => m.status === "revision").length;
  const countPending  = allMods.filter((m) => m.status === "pending").length;

  const currentPapers = data[stage];
  const currentOrder  = PAPER_ORDER[stage];

  return (
    <div className="st-root" style={{
      fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      maxWidth: 1152,
      width: "100%",
      margin: "0 auto",
      padding: "32px 24px",
      color: "var(--text-primary)",
      boxSizing: "border-box",
    }}>
      <style>{`
        .st-root { box-sizing: border-box; }
        .st-root *, .st-root *::before, .st-root *::after { box-sizing: border-box; }

        /* Progress bar – default heights */
        .st-progress-track {
          background: var(--bg-muted);
          border-radius: 999px;
          overflow: hidden;
          height: 6px; /* fallback, overridden by inline style */
        }
        .st-progress-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.4s ease;
        }

        @media (max-width: 640px) {
          .st-root { padding: 16px 12px !important; }
          .st-topbar { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; margin-bottom: 24px !important; }
          .st-topbar-right { text-align: left !important; width: 100%; }
          .st-title { font-size: 22px !important; }
          .st-overall { font-size: 38px !important; }
          .st-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
          .st-coverage-box { padding: 16px 14px !important; }
          .st-stage-tabs { width: 100% !important; }
          .st-stage-tab-btn { flex: 1 !important; padding: 8px 10px !important; font-size: 15px !important; }
          .st-paper-header { padding: 12px 14px !important; gap: 10px !important; }
          .st-paper-meta { gap: 8px !important; }
          .st-paper-circle { display: none !important; }
          .st-module-row { flex-direction: column !important; gap: 8px !important; padding: 12px 14px !important; }
          .st-module-actions { width: 100% !important; justify-content: space-between !important; padding-top: 0 !important; }
          .st-ai-grid { grid-template-columns: 1fr !important; }

          /* Make progress bars thicker on mobile */
          .st-progress-track {
            height: 10px !important;  /* override inline height for all tracks */
          }
          .st-progress-track .st-progress-fill {
            height: 100% !important;
          }
        }

        @media (max-width: 420px) {
          .st-title { font-size: 19px !important; }
          .st-overall { font-size: 32px !important; }
          .st-stat-value { font-size: 20px !important; }
          .st-paper-label { font-size: 13.5px !important; }
        }
      `}</style>

      {/* ── Top Bar ── */}
      <div className="st-topbar" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 32,
        gap: 24,
        flexWrap: "wrap",
      }}>
        <div style={{ minWidth: 0 }}>
          <div className="st-title" style={{
            fontSize: 28,
            fontWeight: 600,
            color: "var(--text-primary)",
            lineHeight: 1.15,
            fontFamily: "'Playfair Display', Georgia, serif",
          }}>
            UPSC CSE 2027
          </div>
          <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4, fontFamily: "'DM Mono', monospace" }}>
            Syllabus Tracker
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 11, padding: "3px 10px", borderRadius: 20,
              background: "var(--status-prog-bg)", color: "var(--status-prog-text)",
              border: "0.5px solid var(--status-prog-border)", fontWeight: 500,
              fontFamily: "'DM Mono', monospace",
            }}>
              Prelims: 5 May 2027
            </span>
            <span style={{
              fontSize: 11, padding: "3px 10px", borderRadius: 20,
              background: "var(--status-done-bg)", color: "var(--status-done-text)",
              border: "0.5px solid var(--status-done-border)", fontWeight: 500,
              fontFamily: "'DM Mono', monospace",
            }}>
              Notice: 04.02.2027
            </span>
          </div>
        </div>
        <div className="st-topbar-right" style={{ textAlign: "right", flexShrink: 0 }}>
          <div className="st-overall" style={{
            fontSize: 52,
            fontWeight: 900,
            color: "var(--text-primary)",
            lineHeight: 1,
            fontFamily: "'Playfair Display', Georgia, serif",
          }}>
            {overall}%
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, fontFamily: "'DM Mono', monospace" }}>
            overall coverage
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, fontFamily: "'DM Mono', monospace" }}>
            {countDone} of {totalMods} modules done
          </div>
        </div>
      </div>

      {/* ── Mini stats ── */}
      <div className="st-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
        <MiniStatCard value={countDone}     label="Done"           accent="var(--accent-green)" />
        <MiniStatCard value={countProgress} label="In progress"    accent="var(--accent-blue)"  />
        <MiniStatCard value={countRevision} label="Needs revision" accent="var(--accent-gold)"  />
        <MiniStatCard value={countPending}  label="Not started"    accent="var(--bg-border)"    />
      </div>

      {/* ── Coverage bars ── */}
      <div className="st-coverage-box" style={{
        background: "var(--bg-surface)",
        border: "0.5px solid var(--bg-border)",
        borderRadius: 14,
        padding: "20px 24px",
        marginBottom: 24,
        boxShadow: "var(--shadow-sm)",
      }}>
        <StageCoverageBar label="Prelims coverage" papers={data.prelims} paperOrder={PAPER_ORDER.prelims} />
        <StageCoverageBar label="Mains coverage"   papers={data.mains}   paperOrder={PAPER_ORDER.mains}   />
      </div>

      {/* ── Stage tabs ── */}
      <div className="st-stage-tabs" style={{
        display: "flex",
        border: "0.5px solid var(--bg-border)",
        borderRadius: 10,
        overflow: "hidden",
        width: "fit-content",
        marginBottom: 20,
        boxShadow: "var(--shadow-sm)",
      }}>
        {["prelims", "mains"].map((s) => (
          <button
            key={s}
            className="st-stage-tab-btn"
            onClick={() => setStage(s)}
            style={{
              padding: "9px 28px",
              fontSize: 18,
              fontWeight: stage === s ? 600 : 400,
              background: stage === s ? "var(--text-primary)" : "transparent",
              color: stage === s ? "var(--bg-base)" : "var(--text-secondary)",
              border: "none",
              cursor: "pointer",
              transition: "all .15s",
              textTransform: "capitalize",
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "0.02em",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── Papers ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {currentOrder.map((paperId) => {
          const paper = currentPapers[paperId];
          if (!paper) return null;
          return (
            <PaperCard
              key={paperId}
              paperId={paperId}
              paper={paper}
              isOpen={!!openPapers[paperId]}
              onToggle={() => togglePaper(paperId)}
              onCycleStatus={(pid, modName) => cycleStatus(stage, pid, modName)}
              onSetProgress={(pid, modName, val) => setProgress(stage, pid, modName, val)}
            />
          );
        })}
      </div>

      {/* ── AI Revision + Mentor Chat ── */}
      <div className="st-ai-grid" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 16,
        marginTop: 24,
      }}>
        <AIRevisionPanel isLoggedIn={isLoggedIn} compact={true} />
      </div>

      {/* ── Footer ── */}
      <div style={{
        marginTop: 32,
        paddingTop: 20,
        borderTop: "0.5px solid var(--bg-border)",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
          Examination Notice No. 05/2026-CSE · Union Public Service Commission
        </div>
      </div>
    </div>
  );
}