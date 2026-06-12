/**
 * Topicwise.jsx — Mobile‑first, fully integrated with all Mains PYQ data
 * ─────────────────────────────────────────────────────────────────────────────
 * Uses actual imports:
 *   - mainsGS1Data, mainsGS2Data, mainsGS3Data, (mainsGS4Data) from 2025
 *   - mainsGS1Data24, mainsGS2Data24, mainsGS3Data24, mainsGS4Data24 from 2024
 * Merges both years for each GS paper, groups by `subject` field.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useCallback, useMemo } from "react";
import MatchTable from "../components/ui/MatchTable";
import ExplanationBox from "../components/ui/ExplanationBox";
import MainsQuestionCard from "../components/ui/MainsQuestionCard";
import { useRevisionQueue } from "../hooks/useRevisionQueue";
import { getMainsPaperLink } from "../data/Mains_papers";
import { useQuestionAttempts } from "../hooks/useQuestionAttempts";

// ─── PRELIMS DATA IMPORTS ─────────────────────────────────────────────────────
import reasoningCSATData from "../data/Subjectwise/pre/CSAT/reasoningCSATData";
import ComprehensionPYQData from "../data/Subjectwise/pre/CSAT/ComprehensionPYQData";
import MathsData from "../data/Subjectwise/pre/CSAT/Maths";
import HistoryData from "../data/Subjectwise/pre/GS/History";
import ModernHistoryData from "../data/Subjectwise/pre/GS/Modernhistory";
import PolityData from "../data/Subjectwise/pre/GS/Polity";
import EconomyData from "../data/Subjectwise/pre/GS/Economy";
import GeographyData from "../data/Subjectwise/pre/GS/Geography";
import EnvEcologyData from "../data/Subjectwise/pre/GS/envEcology";
import SciTechData from "../data/Subjectwise/pre/GS/scienceTechnologyPYQData";
import ArtCultureData from "../data/Subjectwise/pre/GS/artCulturePYQData";
import SocialIssuesData from "../data/Subjectwise/pre/GS/Socialissues";
import IRYData from "../data/Subjectwise/pre/GS/irypyq";

// ─── MAINS DATA IMPORTS (2025) ────────────────────────────────────────────────
import mainsGS1Data from "../data/Subjectwise/mains/2025/GS1";
import mainsGS2Data from "../data/Subjectwise/mains/2025/GS2";
import mainsGS3Data from "../data/Subjectwise/mains/2025/GS3";
// import mainsGS4Data from "../data/Subjectwise/mains/2025/GS4"; // uncomment when available

// ─── MAINS DATA IMPORTS (2024) ────────────────────────────────────────────────
import mainsGS1Data24 from "../data/Subjectwise/mains/2024/GS1";
import mainsGS2Data24 from "../data/Subjectwise/mains/2024/GS2";
import mainsGS3Data24 from "../data/Subjectwise/mains/2024/GS3";
import mainsGS4Data24 from "../data/Subjectwise/mains/2024/GS4";

// ─── UTILITY: COMBINE MULTIPLE YEAR ARRAYS ────────────────────────────────────
const combineData = (...arrays) => arrays.flat().filter(Boolean);

// ─── COMBINED MAINS DATA (2025 + 2024) ────────────────────────────────────────
const allGS1 = combineData(mainsGS1Data, mainsGS1Data24);
const allGS2 = combineData(mainsGS2Data, mainsGS2Data24);
const allGS3 = combineData(mainsGS3Data, mainsGS3Data24);
const allGS4 = combineData(mainsGS4Data24 /*, mainsGS4Data */);

// ─── SUBJECT COLOR MAPS FOR EACH GS PAPER ─────────────────────────────────────
const GS1_SUBJECT_COLORS = {
  History: "#c084fc",
  Culture: "#f472b6",
  Society: "#34d399",
  Geography: "#60a5fa",
  "Indian Society": "#34d399",
  "Art & Culture": "#fcd34d",
  "Post-independence consolidation": "#f97316",
};

const GS2_SUBJECT_COLORS = {
  "Indian Polity": "#4F8EF7",
  "International Relations": "#a78bfa",
  Governance: "#34d399",
  "Social Justice": "#f472b6",
  Constitution: "#4F8EF7",
  "Pressure Groups": "#f97316",
};

const GS3_SUBJECT_COLORS = {
  Economy: "#4F8EF7",
  Agriculture: "#fcd34d",
  "Science & Technology": "#a78bfa",
  Environment: "#6ee7b7",
  "Internal Security": "#f97316",
  "Disaster Management": "#fb923c",
  "Economic Development": "#34d399",
};

const GS4_SUBJECT_COLORS = {
  Ethics: "#f472b6",
  Integrity: "#c084fc",
  Aptitude: "#34d399",
  "Case Studies": "#f97316",
  "Emotional Intelligence": "#60a5fa",
};

// ─── GROUPING FUNCTION (preserves colors via map argument) ────────────────────
function groupMainsDataBySubject(data, colorMap = {}) {
  const map = {};
  (data || []).forEach((q) => {
    const subj = q.subject || "General";
    if (!map[subj]) {
      map[subj] = {
        label: subj,
        color: colorMap[subj] || "#a1a1aa",
        data: [],
        isMains: true,
      };
    }
    map[subj].data.push(q);
  });
  return map;
}

// ─── SUBJECT REGISTRY (full Prelims + Mains) ──────────────────────────────────
const SUBJECT_REGISTRY = {
  prelims: {
    label: "Prelims",
    papers: {
      GS: {
        label: "GS Paper I",
        color: "#4F8EF7",
        subjects: {
          History: { label: "Ancient & Medieval History", data: HistoryData, color: "#c084fc" },
          ModernHistory: { label: "Modern History", data: ModernHistoryData, color: "#f472b6" },
          Polity: { label: "Polity & Governance", data: PolityData, color: "#4F8EF7" },
          Economy: { label: "Economy", data: EconomyData, color: "#34d399" },
          Geography: { label: "Geography", data: GeographyData, color: "#60a5fa" },
          EnvEcology: { label: "Environment & Ecology", data: EnvEcologyData, color: "#6ee7b7" },
          SciTech: { label: "Science & Technology", data: SciTechData, color: "#f9a8d4" },
          ArtCulture: { label: "Art & Culture", data: ArtCultureData, color: "#fcd34d" },
          SocialIssues: { label: "Social Issues", data: SocialIssuesData, color: "#fb923c" },
          IRY: { label: "IR & Current Affairs", data: IRYData, color: "#a78bfa" },
        },
      },
      CSAT: {
        label: "CSAT Paper II",
        color: "#f97316",
        subjects: {
          Reasoning: { label: "Logical Reasoning", data: reasoningCSATData, color: "#f97316" },
          Comprehension: { label: "Reading Comprehension", data: ComprehensionPYQData, color: "#fb923c" },
          Maths: { label: "Quantitative Aptitude", data: MathsData, color: "#fbbf24" },
        },
      },
    },
  },
  mains: {
    label: "Mains",
    papers: {
      GS1: {
        label: "GS Paper I",
        color: "#4F8EF7",
        isMains: true,
        subjects: groupMainsDataBySubject(allGS1, GS1_SUBJECT_COLORS),
      },
      GS2: {
        label: "GS Paper II",
        color: "#34d399",
        isMains: true,
        subjects: groupMainsDataBySubject(allGS2, GS2_SUBJECT_COLORS),
      },
      GS3: {
        label: "GS Paper III",
        color: "#f97316",
        isMains: true,
        subjects: groupMainsDataBySubject(allGS3, GS3_SUBJECT_COLORS),
      },
      GS4: {
        label: "GS Paper IV",
        color: "#a78bfa",
        isMains: true,
        subjects: groupMainsDataBySubject(allGS4, GS4_SUBJECT_COLORS),
      },
    },
  },
};

// ─── STYLE / DIFF META (unchanged) ────────────────────────────────────────────
const STYLE_META = {
  analytical_reasoning: { label: "Analytical", bg: "rgba(79,142,247,0.12)", text: "#93c5fd", border: "rgba(79,142,247,0.3)" },
  syllogism_logic: { label: "Syllogism", bg: "rgba(167,139,250,0.12)", text: "#c4b5fd", border: "rgba(167,139,250,0.3)" },
  critical_reasoning: { label: "Critical", bg: "rgba(52,211,153,0.12)", text: "#6ee7b7", border: "rgba(52,211,153,0.3)" },
  series_coding: { label: "Series/Code", bg: "rgba(251,191,36,0.12)", text: "#fcd34d", border: "rgba(251,191,36,0.3)" },
};
const DIFF_META = {
  Easy: { bg: "rgba(52,211,153,0.12)", text: "#6ee7b7", border: "rgba(52,211,153,0.3)" },
  Medium: { bg: "rgba(251,191,36,0.12)", text: "#fcd34d", border: "rgba(251,191,36,0.3)" },
  Hard: { bg: "rgba(248,113,113,0.12)", text: "#fca5a5", border: "rgba(248,113,113,0.3)" },
};

// ─── UTILITIES (extract metadata) ─────────────────────────────────────────────
const getYears = (d) => [...new Set((d || []).map((q) => q.year))].sort((a, b) => b - a);
const getTopics = (d) => [...new Set((d || []).map((q) => q.topic).filter(Boolean))].sort();
const getStyleTags = (d) => [...new Set((d || []).map((q) => q.styleTag).filter(Boolean))];
const getDifficulties = (d) => [...new Set((d || []).map((q) => q.difficulty).filter(Boolean))];
const getMarksOptions = (d) => [...new Set((d || []).map((q) => q.marks).filter(Boolean))].sort((a, b) => b - a);
const getDirectives = (d) => [...new Set((d || []).map((q) => q.directive).filter(Boolean))].sort();

// ─── GLOBAL RESPONSIVE STYLES (injected once) ─────────────────────────────────
const GLOBAL_STYLES = `
  .tw-root { box-sizing: border-box; }
  .tw-root *, .tw-root *::before, .tw-root *::after { box-sizing: inherit; }
  .tw-scroll-row { display: flex; gap: 6px; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; padding-bottom: 2px; }
  .tw-scroll-row::-webkit-scrollbar { display: none; }
  .tw-tab-bar { display: flex; width: 100%; border: 0.5px solid var(--bg-border); border-radius: 10px; overflow: hidden; }
  .tw-tab-bar button { flex: 1; min-height: 44px; border: none; cursor: pointer; transition: background 0.15s, color 0.15s; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; }
  .tw-stage-bar { display: flex; width: 100%; border: 0.5px solid var(--bg-border); border-radius: 10px; overflow: hidden; margin-bottom: 16px; }
  .tw-stage-bar button { flex: 1; min-height: 48px; border: none; cursor: pointer; transition: background 0.15s, color 0.15s; font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 500; text-transform: capitalize; }
  .tw-stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 20px; }
  @media (min-width: 480px) { .tw-stats-grid { grid-template-columns: repeat(4, 1fr); } }
  .tw-top-bar { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
  @media (min-width: 560px) { .tw-top-bar { flex-direction: row; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; } }
  .tw-top-count { display: flex; align-items: baseline; gap: 8px; }
  @media (min-width: 560px) { .tw-top-count { flex-direction: column; align-items: flex-end; gap: 2px; } }
  .tw-card-pad { padding: 12px; }
  .tw-card-padx { padding-left: 12px; padding-right: 12px; }
  @media (min-width: 480px) { .tw-card-pad { padding: 16px 20px; } .tw-card-padx { padding-left: 20px; padding-right: 20px; } }
  .tw-page { padding: 16px 12px 40px; }
  @media (min-width: 480px) { .tw-page { padding: 24px 16px 48px; } }
  @media (min-width: 768px) { .tw-page { padding: 32px 24px 64px; } }
  .tw-option { display: flex; gap: 12px; align-items: flex-start; padding: 12px; border-radius: 8px; cursor: pointer; transition: background 0.15s, border-color 0.15s; margin-bottom: 6px; min-height: 48px; font-family: 'DM Sans', sans-serif; -webkit-tap-highlight-color: transparent; user-select: none; }
  @media (min-width: 480px) { .tw-option { padding: 10px 14px; } }
  .tw-filter-row { display: flex; align-items: center; gap: 6px; }
  .tw-filter-label { font-size: 10px; color: var(--text-muted); font-family: 'DM Mono', monospace; flex-shrink: 0; width: 40px; }
  .tw-filter-chips { display: flex; gap: 5px; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; flex: 1; padding-bottom: 2px; }
  .tw-filter-chips::-webkit-scrollbar { display: none; }
  .tw-paper-header { display: flex; align-items: center; gap: 12px; padding: 14px 12px; cursor: pointer; user-select: none; min-height: 60px; -webkit-tap-highlight-color: transparent; }
  @media (min-width: 480px) { .tw-paper-header { padding: 18px 20px; } }
  .tw-subject-tabs { display: flex; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; border-bottom: 0.5px solid var(--bg-border); padding: 0 4px; }
  .tw-subject-tabs::-webkit-scrollbar { display: none; }
  .tw-subject-tabs button { padding: 10px 14px; flex-shrink: 0; background: transparent; border: none; cursor: pointer; white-space: nowrap; transition: color 0.15s; font-family: 'DM Sans', sans-serif; font-size: 13px; min-height: 44px; }
  .tw-qtext { font-size: 14px; font-weight: 500; color: var(--text-primary); line-height: 1.7; word-break: break-word; overflow-wrap: anywhere; }
`;

function GlobalStyles() { return <style>{GLOBAL_STYLES}</style>; }

// ─── MICRO COMPONENTS (Chip, Tag, YearBadge, StatCard, PinButton) ─────────────
function Chip({ label, active, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 11, padding: "5px 12px", borderRadius: 20, flexShrink: 0,
        border: active ? `0.5px solid ${color}` : "0.5px solid var(--bg-border)",
        background: active ? `${color}22` : "transparent",
        color: active ? color : "var(--text-muted)",
        cursor: "pointer", fontWeight: active ? 600 : 400, whiteSpace: "nowrap",
        transition: "all .15s", fontFamily: "'DM Mono', monospace",
        minHeight: 30, WebkitTapHighlightColor: "transparent",
      }}
    >
      {label}
    </button>
  );
}

function Tag({ label, meta }) {
  if (!meta) return null;
  return (
    <span style={{
      fontSize: 10, padding: "2px 8px", borderRadius: 20,
      border: `0.5px solid ${meta.border}`, background: meta.bg, color: meta.text,
      fontWeight: 500, whiteSpace: "nowrap", fontFamily: "'DM Mono', monospace",
      flexShrink: 0,
    }}>
      {meta.label || label}
    </span>
  );
}

function YearBadge({ year }) {
  if (!year) return null;
  return (
    <span style={{
      fontSize: 10, padding: "2px 8px", borderRadius: 4,
      border: "0.5px solid var(--bg-border)", background: "var(--bg-muted)",
      color: "var(--text-muted)", fontFamily: "'DM Mono', monospace",
      letterSpacing: "0.04em", fontWeight: 600, flexShrink: 0,
    }}>
      {year}
    </span>
  );
}

function StatCard({ value, label, color }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 3,
      padding: "12px 8px",
      background: "var(--bg-surface)",
      border: "0.5px solid var(--bg-border)",
      borderTop: `3px solid ${color}`,
      borderRadius: 10,
      boxShadow: "var(--shadow-sm)",
    }}>
      <span style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1, fontFamily: "'Playfair Display', Georgia, serif" }}>
        {value}
      </span>
      <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", textAlign: "center" }}>
        {label}
      </span>
    </div>
  );
}

function PinButton({ pinned, onClick }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      title={pinned ? "Unpin" : "Pin to revision"}
      style={{
        fontSize: 16, width: 36, height: 36, borderRadius: 8, flexShrink: 0,
        border: pinned ? "0.5px solid #fbbf24" : "0.5px solid var(--bg-border)",
        background: pinned ? "rgba(251,191,36,0.15)" : "transparent",
        color: pinned ? "#fbbf24" : "var(--text-muted)",
        cursor: "pointer", transition: "all .15s", lineHeight: 1,
        display: "flex", alignItems: "center", justifyContent: "center",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {pinned ? "📌" : "📍"}
    </button>
  );
}

// ─── FILTER PANEL (collapsible on mobile) ─────────────────────────────────────
function FilterPanel({ children, accentColor }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          width: "100%", padding: "9px 12px",
          background: "var(--bg-surface)", border: "0.5px solid var(--bg-border)",
          borderRadius: open ? "8px 8px 0 0" : 8,
          color: "var(--text-muted)", cursor: "pointer",
          fontFamily: "'DM Mono', monospace", fontSize: 11,
          fontWeight: 600, letterSpacing: "0.06em",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <span style={{ color: accentColor }}>⊞</span>
        <span>FILTERS</span>
        <span style={{ marginLeft: "auto", transition: "transform 0.2s", display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
      </button>
      {open && (
        <div style={{
          border: "0.5px solid var(--bg-border)", borderTop: "none",
          borderRadius: "0 0 8px 8px",
          padding: "10px 12px",
          background: "var(--bg-muted)",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── PRELIMS QUESTION CARD ────────────────────────────────────────────────────
function QuestionCard({ q, index, accentColor, revQueue, subjectMeta, onCorrect, recordAttempt, attemptedIds }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selected, setSelected] = useState(null);
  const qId = q._id || q.id || `q-${index}`;
  const solved = attemptedIds?.has(qId);
  const pinned = revQueue.isPinned(qId);
  const styleMeta = STYLE_META[q.styleTag];
  const diffMeta = DIFF_META[q.difficulty];
  const isCorrect = selected === q.correctOption;
  const isRevealed = showAnswer || selected !== null;

  function getOptionStyle(id) {
    const base = { border: "0.5px solid var(--bg-border)", background: "var(--bg-muted)", color: "var(--text-primary)" };
    if (!isRevealed) return selected === id ? { border: `0.5px solid ${accentColor}`, background: `${accentColor}18`, color: "var(--text-primary)" } : base;
    if (id === q.correctOption) return { border: "0.5px solid rgba(52,211,153,0.5)", background: "rgba(52,211,153,0.08)", color: "#6ee7b7" };
    if (selected === id) return { border: "0.5px solid rgba(248,113,113,0.5)", background: "rgba(248,113,113,0.08)", color: "#fca5a5" };
    return { ...base, opacity: 0.45 };
  }
  function getMarker(id) {
    if (!isRevealed) return { text: id, color: "var(--text-muted)" };
    if (id === q.correctOption) return { text: "✓", color: "#6ee7b7" };
    if (selected === id) return { text: "✗", color: "#fca5a5" };
    return { text: id, color: "var(--text-muted)" };
  }

  return (
    <div style={{
      background: solved ? "rgba(52,211,153,0.03)" : "var(--bg-surface)",
      border: "0.5px solid var(--bg-border)", borderLeft: `3px solid ${accentColor}`,
      borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow-sm)",
      ...(pinned ? { outline: "1px solid rgba(251,191,36,0.4)" } : {}),
    }}>
      <div className="tw-card-pad" style={{ borderBottom: "0.5px solid var(--bg-border)", display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: accentColor, fontFamily: "'DM Mono', monospace", flexShrink: 0, paddingTop: 2 }}>
          Q{index + 1}
          {solved && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#6ee7b7", display: "inline-block" }} />}
        </div>
        <div className="tw-qtext" style={{ flex: 1 }}>
          {(() => {
            const text = q.questionText || "";
            if (text.includes("|")) {
              const lines = text.split("\n");
              const before = [], table = [], after = [];
              let inTable = false;
              lines.forEach(l => {
                if (l.trim().startsWith("|")) { inTable = true; table.push(l); }
                else if (inTable) after.push(l);
                else before.push(l);
              });
              return (
                <>
                  {before.join("\n").trim() && <div style={{ marginBottom: 6, wordBreak: "break-word" }}>{before.join("\n").trim()}</div>}
                  <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}><MatchTable dataString={table.join("\n")} /></div>
                  {after.join("\n").trim() && <div style={{ marginTop: 6 }}>{after.join("\n").trim()}</div>}
                </>
              );
            }
            return <span>{text}</span>;
          })()}
        </div>
        <PinButton pinned={pinned} onClick={() => revQueue.toggle({ ...q, _id: qId }, subjectMeta)} />
      </div>
      <div className="tw-card-padx" style={{ paddingTop: 8, paddingBottom: 8, display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center", borderBottom: "0.5px solid var(--bg-border)" }}>
        <YearBadge year={q.year} />
        {styleMeta && <Tag label={q.styleTag} meta={styleMeta} />}
        {diffMeta && <Tag label={q.difficulty} meta={diffMeta} />}
        {q.subTopic && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, border: "0.5px solid var(--bg-border)", background: "var(--bg-muted)", color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={q.subTopic}>{q.subTopic}</span>}
      </div>
      <div className="tw-card-padx" style={{ paddingTop: 12, paddingBottom: 4 }}>
        {(q.options || []).map(opt => {
          const marker = getMarker(opt.id);
          return (
            <div key={opt.id} className="tw-option" style={getOptionStyle(opt.id)} onClick={() => {
              if (isRevealed) return;
              setSelected(opt.id);
              const result = opt.id === q.correctOption ? "correct" : "wrong";
              recordAttempt?.({ id: qId, questionText: q.questionText, topic: q.topic, subTopic: q.subTopic, difficulty: q.difficulty, year: q.year }, result, { subject: subjectMeta?.subject, paper: subjectMeta?.paper });
              if (result === "correct" && onCorrect) onCorrect(q.topic, q.subTopic);
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: marker.color, minWidth: 18, fontFamily: "'DM Mono', monospace", paddingTop: 1, flexShrink: 0 }}>{marker.text}</span>
              <span style={{ fontSize: 13, lineHeight: 1.6, wordBreak: "break-word", flex: 1 }}>{opt.text}</span>
            </div>
          );
        })}
      </div>
      <div className="tw-card-padx" style={{ paddingTop: 10, paddingBottom: 14, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={() => setShowAnswer(v => !v)} style={{ fontSize: 12, padding: "8px 16px", borderRadius: 8, minHeight: 36, border: `0.5px solid ${accentColor}`, background: showAnswer ? `${accentColor}22` : "transparent", color: accentColor, cursor: "pointer", fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>{showAnswer ? "Hide Explanation" : "Show Explanation"}</button>
        {selected !== null && <button onClick={() => { setSelected(null); setShowAnswer(false); }} style={{ fontSize: 12, padding: "8px 12px", borderRadius: 8, minHeight: 36, border: "0.5px solid var(--bg-border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Reset</button>}
        {selected !== null && <span style={{ fontSize: 11, color: isCorrect ? "#6ee7b7" : "#fca5a5", fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>{isCorrect ? "✓ Correct" : `✗ Ans: ${q.correctOption}`}</span>}
      </div>
      {showAnswer && q.explanation && <ExplanationBox text={q.explanation} accentColor={accentColor} sources={q.sources} />}
    </div>
  );
}

// ─── MAINS SUBJECT PANEL ──────────────────────────────────────────────────────
function MainsSubjectPanel({ subject, accentColor }) {
  const rawData = subject.data || [];
  const [yearFilter, setYearFilter] = useState("All");
  const [topicFilter, setTopicFilter] = useState("All");
  const [marksFilter, setMarksFilter] = useState("All");
  const [directiveFilter, setDirectiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  const years = useMemo(() => getYears(rawData), [rawData]);
  const topics = useMemo(() => getTopics(rawData), [rawData]);
  const marksOpts = useMemo(() => getMarksOptions(rawData), [rawData]);
  const directives = useMemo(() => getDirectives(rawData), [rawData]);

  const filtered = useMemo(() => rawData.filter(q => {
    if (yearFilter !== "All" && String(q.year) !== String(yearFilter)) return false;
    if (topicFilter !== "All" && q.topic !== topicFilter) return false;
    if (marksFilter !== "All" && String(q.marks) !== String(marksFilter)) return false;
    if (directiveFilter !== "All" && q.directive !== directiveFilter) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      if (!q.questionText?.toLowerCase().includes(s) && !q.topic?.toLowerCase().includes(s) && !q.subTopic?.toLowerCase().includes(s) && !q.idealAnswer?.toLowerCase().includes(s)) return false;
    }
    return true;
  }), [rawData, yearFilter, topicFilter, marksFilter, directiveFilter, search]);

  const clearFilters = () => { setYearFilter("All"); setTopicFilter("All"); setMarksFilter("All"); setDirectiveFilter("All"); setSearch(""); };

  return (
    <div>
      <div className="tw-stats-grid">
        <StatCard value={rawData.length} label="Questions" color={accentColor} />
        <StatCard value={topics.length} label="Topics" color="var(--accent-gold)" />
        <StatCard value={rawData.filter(q => q.marks === 15).length} label="15-Mark" color="#fcd34d" />
        <StatCard value={rawData.filter(q => q.marks === 10).length} label="10-Mark" color="#93c5fd" />
      </div>
      <div style={{ position: "relative", marginBottom: 10 }}>
        <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions, topics…" style={{ width: "100%", padding: "10px 14px 10px 36px", fontSize: 13, background: "var(--bg-surface)", border: "0.5px solid var(--bg-border)", borderRadius: 10, color: "var(--text-primary)", outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = accentColor} onBlur={e => e.target.style.borderColor = "var(--bg-border)"} />
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 14, pointerEvents: "none" }}>⌕</span>
      </div>
      <FilterPanel accentColor={accentColor}>
        {years.length > 1 && <div className="tw-filter-row"><span className="tw-filter-label">YEAR</span><div className="tw-filter-chips"><Chip label="All" active={yearFilter === "All"} color={accentColor} onClick={() => setYearFilter("All")} />{years.map(y => <Chip key={y} label={String(y)} active={yearFilter === String(y)} color={accentColor} onClick={() => setYearFilter(String(y))} />)}</div></div>}
        {topics.length > 1 && <div className="tw-filter-row"><span className="tw-filter-label">TOPIC</span><div className="tw-filter-chips"><Chip label="All" active={topicFilter === "All"} color={accentColor} onClick={() => setTopicFilter("All")} />{topics.map(t => <Chip key={t} label={t} active={topicFilter === t} color={accentColor} onClick={() => setTopicFilter(t)} />)}</div></div>}
        {marksOpts.length > 1 && <div className="tw-filter-row"><span className="tw-filter-label">MARKS</span><div className="tw-filter-chips"><Chip label="All" active={marksFilter === "All"} color={accentColor} onClick={() => setMarksFilter("All")} />{marksOpts.map(m => <Chip key={m} label={`${m}M`} active={marksFilter === String(m)} color={accentColor} onClick={() => setMarksFilter(String(m))} />)}</div></div>}
        {directives.length > 1 && <div className="tw-filter-row"><span className="tw-filter-label">STYLE</span><div className="tw-filter-chips"><Chip label="All" active={directiveFilter === "All"} color={accentColor} onClick={() => setDirectiveFilter("All")} />{directives.map(d => <Chip key={d} label={d} active={directiveFilter === d} color={accentColor} onClick={() => setDirectiveFilter(d)} />)}</div></div>}
      </FilterPanel>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12, fontFamily: "'DM Mono', monospace", display: "flex", alignItems: "center", gap: 10, paddingBottom: 12, borderBottom: "0.5px solid var(--bg-border)" }}>
        <span>{filtered.length} of {rawData.length}</span>
        {filtered.length !== rawData.length && <button onClick={clearFilters} style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, border: "0.5px solid var(--bg-border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>Clear</button>}
      </div>
      <div style={{ marginBottom: 14, padding: "9px 12px", borderRadius: 8, background: `${accentColor}0a`, border: `0.5px solid ${accentColor}25`, fontSize: 12, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", lineHeight: 1.5 }}>💡 <strong style={{ color: accentColor }}>Hints</strong> → plan &nbsp;·&nbsp; <strong style={{ color: accentColor }}>Practice</strong> → draft &nbsp;·&nbsp; <strong style={{ color: accentColor }}>Model Answer</strong> → compare</div>
      {filtered.length === 0 ? (
        <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 13, fontFamily: "'DM Mono', monospace", background: "var(--bg-surface)", border: "0.5px solid var(--bg-border)", borderRadius: 12 }}>No questions match the filters.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{filtered.map((q, i) => <MainsQuestionCard key={q._id || i} q={q} index={i} accentColor={subject.color || accentColor} />)}</div>
      )}
    </div>
  );
}

// ─── PRELIMS SUBJECT PANEL ────────────────────────────────────────────────────
function SubjectPanel({ subject, subjectKey, accentColor, revQueue, onTopicComplete, paperLabel, recordAttempt, attemptedIds }) {
  const rawData = subject.data || [];
  const [yearFilter, setYearFilter] = useState("All");
  const [topicFilter, setTopicFilter] = useState("All");
  const [styleFilter, setStyleFilter] = useState("All");
  const [diffFilter, setDiffFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [pinnedOnly, setPinnedOnly] = useState(false);

  const years = useMemo(() => getYears(rawData), [rawData]);
  const topics = useMemo(() => getTopics(rawData), [rawData]);
  const styles = useMemo(() => getStyleTags(rawData), [rawData]);
  const diffs = useMemo(() => getDifficulties(rawData), [rawData]);

  const filtered = useMemo(() => rawData.filter((q, i) => {
    if (yearFilter !== "All" && String(q.year) !== String(yearFilter)) return false;
    if (topicFilter !== "All" && q.topic !== topicFilter) return false;
    if (styleFilter !== "All" && q.styleTag !== styleFilter) return false;
    if (diffFilter !== "All" && q.difficulty !== diffFilter) return false;
    if (pinnedOnly && !revQueue.isPinned(q._id || q.id || `q-${i}`)) return false;
    if (search.trim()) { const s = search.toLowerCase(); if (!q.questionText?.toLowerCase().includes(s) && !q.topic?.toLowerCase().includes(s) && !q.subTopic?.toLowerCase().includes(s)) return false; }
    return true;
  }), [rawData, yearFilter, topicFilter, styleFilter, diffFilter, search, pinnedOnly, revQueue]);

  const totalQ = rawData.length;
  const subjectMeta = { subject: subject.label, paper: paperLabel };
  const pinnedCount = rawData.filter((q, i) => revQueue.isPinned(q._id || q.id || `q-${i}`)).length;
  const clearFilters = () => { setYearFilter("All"); setTopicFilter("All"); setStyleFilter("All"); setDiffFilter("All"); setSearch(""); setPinnedOnly(false); };

  return (
    <div>
      <div className="tw-stats-grid">
        <StatCard value={totalQ} label="Questions" color={accentColor} />
        <StatCard value={years.length} label="Years" color="var(--accent-blue)" />
        <StatCard value={rawData.filter(q => q.difficulty === "Easy").length} label="Easy" color="var(--accent-green)" />
        <StatCard value={rawData.filter(q => q.difficulty === "Hard").length} label="Hard" color="#f87171" />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "stretch" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions…" style={{ width: "100%", padding: "10px 14px 10px 36px", fontSize: 13, background: "var(--bg-surface)", border: "0.5px solid var(--bg-border)", borderRadius: 10, color: "var(--text-primary)", outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box", height: "100%" }} onFocus={e => e.target.style.borderColor = accentColor} onBlur={e => e.target.style.borderColor = "var(--bg-border)"} />
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 14, pointerEvents: "none" }}>⌕</span>
        </div>
        <button onClick={() => setPinnedOnly(v => !v)} style={{ fontSize: 11, padding: "0 12px", borderRadius: 10, flexShrink: 0, border: pinnedOnly ? "0.5px solid #fbbf24" : "0.5px solid var(--bg-border)", background: pinnedOnly ? "rgba(251,191,36,0.15)" : "transparent", color: pinnedOnly ? "#fbbf24" : "var(--text-muted)", cursor: "pointer", fontFamily: "'DM Mono', monospace", minHeight: 42 }}>📌{pinnedCount > 0 ? ` ${pinnedCount}` : ""}</button>
      </div>
      <FilterPanel accentColor={accentColor}>
        {years.length > 1 && <div className="tw-filter-row"><span className="tw-filter-label">YEAR</span><div className="tw-filter-chips"><Chip label="All" active={yearFilter === "All"} color={accentColor} onClick={() => setYearFilter("All")} />{years.map(y => <Chip key={y} label={String(y)} active={yearFilter === String(y)} color={accentColor} onClick={() => setYearFilter(String(y))} />)}</div></div>}
        {topics.length > 1 && <div className="tw-filter-row"><span className="tw-filter-label">TOPIC</span><div className="tw-filter-chips"><Chip label="All" active={topicFilter === "All"} color={accentColor} onClick={() => setTopicFilter("All")} />{topics.map(t => <Chip key={t} label={t} active={topicFilter === t} color={accentColor} onClick={() => setTopicFilter(t)} />)}</div></div>}
        {styles.length > 1 && <div className="tw-filter-row"><span className="tw-filter-label">TYPE</span><div className="tw-filter-chips"><Chip label="All" active={styleFilter === "All"} color={accentColor} onClick={() => setStyleFilter("All")} />{styles.map(s => <Chip key={s} label={STYLE_META[s]?.label || s} active={styleFilter === s} color={accentColor} onClick={() => setStyleFilter(s)} />)}</div></div>}
        {diffs.length > 1 && <div className="tw-filter-row"><span className="tw-filter-label">DIFF</span><div className="tw-filter-chips"><Chip label="All" active={diffFilter === "All"} color={accentColor} onClick={() => setDiffFilter("All")} />{["Easy","Medium","Hard"].filter(d => diffs.includes(d)).map(d => <Chip key={d} label={d} active={diffFilter === d} color={accentColor} onClick={() => setDiffFilter(d)} />)}</div></div>}
      </FilterPanel>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12, fontFamily: "'DM Mono', monospace", display: "flex", alignItems: "center", gap: 10, paddingBottom: 12, borderBottom: "0.5px solid var(--bg-border)" }}>
        <span>{filtered.length} of {totalQ}</span>
        {filtered.length !== totalQ && <button onClick={clearFilters} style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, border: "0.5px solid var(--bg-border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>Clear</button>}
      </div>
      {filtered.length === 0 ? (
        <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 13, fontFamily: "'DM Mono', monospace", background: "var(--bg-surface)", border: "0.5px solid var(--bg-border)", borderRadius: 12 }}>{pinnedOnly ? "No pinned questions here yet." : "No questions match the filters."}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{filtered.map((q, i) => <QuestionCard key={q._id || i} q={q} index={i} accentColor={accentColor} revQueue={revQueue} subjectMeta={subjectMeta} recordAttempt={recordAttempt} attemptedIds={attemptedIds} onCorrect={onTopicComplete ? topic => onTopicComplete(topic, paperLabel) : undefined} />)}</div>
      )}
    </div>
  );
}

// ─── MAINS PAPER LINKS ────────────────────────────────────────────────────────
const MAINS_YEARS = [2024,2023,2022,2021,2020,2019,2018,2017,2016,2015,2014,2013,2012,2011];
const PAPER_ID_MAP = { GS1:"gs1", GS2:"gs2", GS3:"gs3", GS4:"gs4", Essay:"essay" };

function MainsPaperLinks({ paperId }) {
  const pid = PAPER_ID_MAP[paperId] || paperId.toLowerCase();
  const color = { GS1:"#4F8EF7", GS2:"#34d399", GS3:"#f97316", GS4:"#a78bfa", Essay:"#f472b6" }[paperId] || "#a78bfa";
  return (
    <div style={{ padding: "16px 12px" }}>
      <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", marginBottom: 12 }}>Subject-wise questions coming soon · Official papers below</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {MAINS_YEARS.map(year => {
          const url = getMainsPaperLink(year, pid);
          return <a key={year} href={url || "https://www.upsc.gov.in"} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, padding: "7px 13px", borderRadius: 8, border: url ? `0.5px solid ${color}` : "0.5px solid var(--bg-border)", background: url ? `${color}12` : "transparent", color: url ? color : "var(--text-muted)", textDecoration: "none", fontFamily: "'DM Mono', monospace", display: "inline-flex", alignItems: "center", gap: 3, minHeight: 36 }}>{year} {url ? "↗" : "—"}</a>;
        })}
      </div>
    </div>
  );
}

// ─── PAPER ACCORDION ──────────────────────────────────────────────────────────
function PaperSection({ paperId, paper, isOpen, onToggle, revQueue, onTopicComplete, recordAttempt, attemptedIds }) {
  const [activeSubject, setActiveSubject] = useState(null);
  const subjectEntries = Object.entries(paper.subjects || {});
  const isMains = !!paper.isMains;

  const handleToggle = useCallback(() => {
    onToggle();
    if (!isOpen && subjectEntries.length > 0 && !activeSubject) setActiveSubject(subjectEntries[0][0]);
  }, [isOpen, onToggle, subjectEntries, activeSubject]);

  const totalQuestions = useMemo(() => subjectEntries.reduce((s, [,sub]) => s + (sub.data?.length || 0), 0), [subjectEntries]);

  return (
    <div style={{ background: "var(--bg-surface)", border: "0.5px solid var(--bg-border)", borderRadius: 14, overflow: "hidden", boxShadow: isOpen ? "var(--shadow-md)" : "var(--shadow-sm)" }}>
      <div className="tw-paper-header" onClick={handleToggle}>
        <div style={{ width: 11, height: 11, borderRadius: "50%", background: paper.color, flexShrink: 0, boxShadow: `0 0 6px ${paper.color}60` }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {paper.label}
            {isMains && totalQuestions > 0 && <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 4, background: `${paper.color}15`, color: paper.color, border: `0.5px solid ${paper.color}40`, fontFamily: "'DM Mono', monospace" }}>LIVE</span>}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, fontFamily: "'DM Mono', monospace" }}>{subjectEntries.length} subjects · {totalQuestions} questions</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 4 }}>{subjectEntries.slice(0,4).map(([,s]) => <div key={s.label} style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, opacity: 0.8 }} />)}</div>
          <span style={{ fontSize: 18, color: "var(--text-muted)", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform .2s", display: "inline-block", lineHeight: 1 }}>›</span>
        </div>
      </div>
      {isOpen && (
        <div style={{ borderTop: "0.5px solid var(--bg-border)" }}>
          {subjectEntries.length === 0 ? (
            <MainsPaperLinks paperId={paperId} />
          ) : (
            <>
              <div className="tw-subject-tabs">
                {subjectEntries.map(([key, s]) => {
                  const isActive = activeSubject === key;
                  return <button key={key} onClick={() => setActiveSubject(key)} style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? s.color : "var(--text-muted)", borderBottom: isActive ? `2px solid ${s.color}` : "2px solid transparent", marginBottom: -1 }}>{s.label}<span style={{ marginLeft: 5, fontSize: 10, fontFamily: "'DM Mono', monospace", opacity: 0.7 }}>({s.data?.length || 0})</span></button>;
                })}
              </div>
              {activeSubject && paper.subjects[activeSubject] && (
                <div style={{ padding: "16px 12px 24px" }}>
                  {isMains ? <MainsSubjectPanel subject={paper.subjects[activeSubject]} accentColor={paper.subjects[activeSubject].color || paper.color} paperLabel={paper.label} /> : <SubjectPanel subject={paper.subjects[activeSubject]} subjectKey={activeSubject} accentColor={paper.subjects[activeSubject].color || paper.color} revQueue={revQueue} onTopicComplete={onTopicComplete} paperLabel={paper.label} recordAttempt={recordAttempt} attemptedIds={attemptedIds} />}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── REVISION QUEUE PANEL ─────────────────────────────────────────────────────
function RevisionQueuePanel({ revQueue }) {
  const { queue, unpin, clearQueue } = revQueue;
  const [filter, setFilter] = useState("All");
  const subjects = useMemo(() => ["All", ...new Set(queue.map(q => q.subject).filter(Boolean))], [queue]);
  const filtered = filter === "All" ? queue : queue.filter(q => q.subject === filter);
  if (queue.length === 0) return <div style={{ padding: "60px 16px", textAlign: "center" }}><div style={{ fontSize: 32, marginBottom: 12 }}>📌</div><div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", fontFamily: "'Playfair Display', Georgia, serif", marginBottom: 6 }}>No pinned questions</div><div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>Pin important questions to add them here.</div></div>;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}><div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>{queue.length} question{queue.length !== 1 ? "s" : ""} pinned</div><button onClick={() => { if (confirm("Clear all pinned questions?")) clearQueue(); }} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 8, border: "0.5px solid rgba(248,113,113,0.4)", background: "transparent", color: "#fca5a5", cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>Clear All</button></div>
      {subjects.length > 2 && <div className="tw-scroll-row" style={{ marginBottom: 14 }}>{subjects.map(s => <Chip key={s} label={s} active={filter === s} color="#fbbf24" onClick={() => setFilter(s)} />)}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{filtered.map((q, i) => <div key={q._id || i} style={{ background: "var(--bg-surface)", border: "0.5px solid rgba(251,191,36,0.3)", borderRadius: 12, padding: "12px 14px" }}><div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}><div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.6, marginBottom: 8, wordBreak: "break-word" }}>{q.questionText?.slice(0, 200)}{q.questionText?.length > 200 ? "…" : ""}</div><div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}><YearBadge year={q.year} />{q.subject && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "0.5px solid rgba(251,191,36,0.3)", fontFamily: "'DM Mono', monospace" }}>{q.subject}</span>}{q.topic && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "var(--bg-muted)", color: "var(--text-muted)", border: "0.5px solid var(--bg-border)", fontFamily: "'DM Mono', monospace" }}>{q.topic}</span>}{DIFF_META[q.difficulty] && <Tag label={q.difficulty} meta={DIFF_META[q.difficulty]} />}</div></div><button onClick={() => unpin(q._id || q.id)} style={{ fontSize: 13, width: 32, height: 32, borderRadius: 6, border: "0.5px solid var(--bg-border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button></div>{q.correctOption && <div style={{ marginTop: 8, fontSize: 11, color: "#6ee7b7", fontFamily: "'DM Mono', monospace" }}>Ans: {q.correctOption}</div>}</div>)}</div>
    </div>
  );
}

// ─── MAIN TOPICWISE COMPONENT ─────────────────────────────────────────────────
export default function Topicwise({ onSyllabusUpdate }) {
  const [stage, setStage] = useState("prelims");
  const [openPapers, setOpenPapers] = useState({ GS: true });
  const [activeTab, setActiveTab] = useState("browse");
  const { recordAttempt, attemptedIds } = useQuestionAttempts({ onSyllabusUpdate });
  const revQueue = useRevisionQueue();

  const togglePaper = useCallback(id => setOpenPapers(prev => ({ ...prev, [id]: !prev[id] })), []);
  const currentPapers = SUBJECT_REGISTRY[stage]?.papers || {};
  const paperOrder = Object.keys(currentPapers);

  const allData = useMemo(() => {
    const entries = [];
    Object.values(currentPapers).forEach(paper => Object.values(paper.subjects || {}).forEach(subj => (subj.data || []).forEach(q => entries.push(q))));
    return entries;
  }, [currentPapers]);

  const totalQ = allData.length;
  const yearCount = useMemo(() => new Set(allData.map(q => q.year)).size, [allData]);
  const isMains = stage === "mains";
  const statsData = isMains
    ? [["Total", totalQ, "var(--accent-blue)"], ["15-Mark", allData.filter(q => q.marks === 15).length, "#fcd34d"], ["10-Mark", allData.filter(q => q.marks === 10).length, "#93c5fd"], ["Years", yearCount, "var(--accent-gold)"]]
    : [["Total", totalQ, "var(--accent-blue)"], ["Easy", allData.filter(q => q.difficulty === "Easy").length, "var(--accent-green)"], ["Medium", allData.filter(q => q.difficulty === "Medium").length, "var(--accent-gold)"], ["Hard", allData.filter(q => q.difficulty === "Hard").length, "#f87171"]];

  return (
    <div className="tw-root tw-page" style={{ maxWidth: 1152, margin: "0 auto", fontFamily: "'DM Sans', system-ui, sans-serif", color: "var(--text-primary)" }}>
      <GlobalStyles />
      <div className="tw-top-bar">
        <div><div style={{ fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.2, fontFamily: "'Playfair Display', Georgia, serif" }}>Topic-wise PYQs</div><div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, fontFamily: "'DM Mono', monospace" }}>Previous Year Questions · Subject-wise</div><div className="tw-scroll-row" style={{ marginTop: 10 }}><span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, background: "var(--status-prog-bg)", color: "var(--status-prog-text)", border: "0.5px solid var(--status-prog-border)", fontWeight: 500, fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>UPSC CSE · Prelims + Mains</span><span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, background: "var(--status-done-bg)", color: "var(--status-done-text)", border: "0.5px solid var(--status-done-border)", fontWeight: 500, fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>2011 – 2026</span>{revQueue.queue.length > 0 && <span onClick={() => setActiveTab("revision")} style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "0.5px solid rgba(251,191,36,0.3)", fontWeight: 500, fontFamily: "'DM Mono', monospace", cursor: "pointer", flexShrink: 0 }}>📌 {revQueue.queue.length} pinned</span>}</div></div>
        <div className="tw-top-count"><div style={{ fontSize: "clamp(36px, 9vw, 52px)", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1, fontFamily: "'Playfair Display', Georgia, serif" }}>{totalQ}</div><div><div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>questions</div><div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>{yearCount} years</div></div></div>
      </div>
      <div className="tw-stats-grid">{statsData.map(([l, v, c]) => <StatCard key={l} value={v} label={l} color={c} />)}</div>
      <div className="tw-tab-bar" style={{ marginBottom: 16, boxShadow: "var(--shadow-sm)" }}>{[["browse", "Browse PYQs"], ["revision", `Revision${revQueue.queue.length > 0 ? ` (${revQueue.queue.length})` : ""}`]].map(([id, label]) => <button key={id} onClick={() => setActiveTab(id)} style={{ fontWeight: activeTab === id ? 600 : 400, background: activeTab === id ? "var(--text-primary)" : "transparent", color: activeTab === id ? "var(--bg-base)" : "var(--text-secondary)" }}>{label}</button>)}</div>
      {activeTab === "revision" ? <RevisionQueuePanel revQueue={revQueue} /> : (
        <>
          <div className="tw-stage-bar" style={{ boxShadow: "var(--shadow-sm)" }}>{["prelims", "mains"].map(s => <button key={s} onClick={() => { setStage(s); setOpenPapers({}); }} style={{ fontWeight: stage === s ? 600 : 400, background: stage === s ? "var(--text-primary)" : "transparent", color: stage === s ? "var(--bg-base)" : "var(--text-secondary)" }}>{s}</button>)}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{paperOrder.map(paperId => { const paper = currentPapers[paperId]; if (!paper) return null; return <PaperSection key={paperId} paperId={paperId} paper={paper} recordAttempt={recordAttempt} attemptedIds={attemptedIds} isOpen={!!openPapers[paperId]} onToggle={() => togglePaper(paperId)} revQueue={revQueue} onTopicComplete={() => {}} />; })}</div>
        </>
      )}
      <div style={{ marginTop: 32, paddingTop: 16, borderTop: "0.5px solid var(--bg-border)", textAlign: "center" }}><div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>Examination Notice No. 05/2026-CSE · Union Public Service Commission</div></div>
    </div>
  );
}