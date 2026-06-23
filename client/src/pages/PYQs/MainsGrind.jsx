
import { useState, useMemo, useCallback } from "react";
import { Library, PenSquare, Archive } from "lucide-react";
import ResourceLibrary from "../User/ResourceLibrary";
import AddCustomQuestion from "../../components/QuestionStats";
import AIMentorChat from "../AI/AIMentorChat";
import { useRevisionQueue } from "../../hooks/useRevisionQueue";
import { useQuestionAttempts } from "../../hooks/useQuestionAttempts";

// ─── UI COMPONENTS ─────────────────────────────────────────────────────────────
import MatchTable from "../../components/ui/MatchTable";
import ExplanationBox from "../../components/ui/ExplanationBox";
import MainsQuestionCard from "../../components/ui/MainsQuestionCard";

// ─── MAINS DATA IMPORTS (2025 + 2024) ─────────────────────────────────────────
import mainsGS1Data from "../../data/Subjectwise/mains/2025/GS1";
import mainsGS2Data from "../../data/Subjectwise/mains/2025/GS2";
import mainsGS3Data from "../../data/Subjectwise/mains/2025/GS3";
import mainsGS4Data from "../../data/Subjectwise/mains/2025/GS4";
import mainsGS1Data24 from "../../data/Subjectwise/mains/2024/GS1";
import mainsGS2Data24 from "../../data/Subjectwise/mains/2024/GS2";
import mainsGS3Data24 from "../../data/Subjectwise/mains/2024/GS3";
import mainsGS4Data24 from "../../data/Subjectwise/mains/2024/GS4";

// ─── UTILITIES ────────────────────────────────────────────────────────────────
const combineData = (...arrays) => arrays.flat().filter(Boolean);
const getYears = d => [...new Set((d || []).map(q => q.year))].sort((a, b) => b - a);
const getTopics = d => [...new Set((d || []).map(q => q.topic).filter(Boolean))].sort();
const getMarksOptions = d => [...new Set((d || []).map(q => q.marks).filter(Boolean))].sort((a, b) => b - a);
const getDirectives = d => [...new Set((d || []).map(q => q.directive).filter(Boolean))].sort();

// ─── COMBINED DATA ────────────────────────────────────────────────────────────
const allGS1 = combineData(mainsGS1Data, mainsGS1Data24);
const allGS2 = combineData(mainsGS2Data, mainsGS2Data24);
const allGS3 = combineData(mainsGS3Data, mainsGS3Data24);
const allGS4 = combineData(mainsGS4Data24, mainsGS4Data);

// ─── SUBJECT COLOR MAPS ──────────────────────────────────────────────────────
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

// ─── GROUP MAINS DATA BY SUBJECT ─────────────────────────────────────────────
function groupMainsDataBySubject(data, colorMap = {}) {
  const map = {};
  (data || []).forEach(q => {
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

// ─── MAINS PAPERS DEFINITION ─────────────────────────────────────────────────
const MAINS_PAPERS = {
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
};

// ─── STYLE / DIFF META ──────────────────────────────────────────────────────
const STYLE_META = {
  analytical_reasoning: {
    label: "Analytical",
    bg: "rgba(79,142,247,0.12)",
    text: "#93c5fd",
    border: "rgba(79,142,247,0.3)",
  },
  syllogism_logic: {
    label: "Syllogism",
    bg: "rgba(167,139,250,0.12)",
    text: "#c4b5fd",
    border: "rgba(167,139,250,0.3)",
  },
  critical_reasoning: {
    label: "Critical",
    bg: "rgba(52,211,153,0.12)",
    text: "#6ee7b7",
    border: "rgba(52,211,153,0.3)",
  },
  series_coding: {
    label: "Series/Code",
    bg: "rgba(251,191,36,0.12)",
    text: "#fcd34d",
    border: "rgba(251,191,36,0.3)",
  },
};
const DIFF_META = {
  Easy: { bg: "rgba(52,211,153,0.12)", text: "#6ee7b7", border: "rgba(52,211,153,0.3)" },
  Medium: { bg: "rgba(251,191,36,0.12)", text: "#fcd34d", border: "rgba(251,191,36,0.3)" },
  Hard: { bg: "rgba(248,113,113,0.12)", text: "#fca5a5", border: "rgba(248,113,113,0.3)" },
};

// ─── GLOBAL RESPONSIVE STYLES ─────────────────────────────────────────────────
const GLOBAL_CSS = `
  .tw-root, .tw-root *, .tw-root *::before, .tw-root *::after { box-sizing: border-box; }
  .tw-page { padding: 14px 12px 48px; }
  @media (min-width: 480px)  { .tw-page { padding: 20px 16px 56px; } }
  @media (min-width: 768px)  { .tw-page { padding: 32px 24px 64px; } }
  .tw-cp { padding-left: 12px; padding-right: 12px; }
  @media (min-width: 480px) { .tw-cp { padding-left: 20px; padding-right: 20px; } }
  .tw-cpb { padding: 12px 12px; }
  @media (min-width: 480px) { .tw-cpb { padding: 16px 20px; } }
  .tw-paper-hdr {
    display: flex; align-items: center; gap: 12px;
    padding: 13px 12px; cursor: pointer;
    user-select: none; min-height: 58px;
    -webkit-tap-highlight-color: transparent;
  }
  @media (min-width: 480px) { .tw-paper-hdr { padding: 18px 20px; } }
  .tw-topbar {
    display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;
  }
  @media (min-width: 560px) {
    .tw-topbar {
      flex-direction: row; justify-content: space-between;
      align-items: flex-start; margin-bottom: 28px;
    }
  }
  .tw-count-block { display: flex; align-items: baseline; gap: 8px; }
  @media (min-width: 560px) {
    .tw-count-block { flex-direction: column; align-items: flex-end; gap: 1px; }
  }
  .tw-stats {
    display: grid; grid-template-columns: repeat(2, 1fr);
    gap: 8px; margin-bottom: 18px;
  }
  @media (min-width: 480px) { .tw-stats { grid-template-columns: repeat(4, 1fr); } }
  .tw-tabbar {
    display: flex; width: 100%;
    border: 0.5px solid var(--bg-border); border-radius: 10px; overflow: hidden;
    box-shadow: var(--shadow-sm); margin-bottom: 14px;
  }
  .tw-tabbar button {
    flex: 1; min-height: 44px; border: none; cursor: pointer;
    transition: background 0.15s, color 0.15s;
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    -webkit-tap-highlight-color: transparent;
  }
  .tw-stagebar {
    display: flex; width: 100%;
    border: 0.5px solid var(--bg-border); border-radius: 10px; overflow: hidden;
    box-shadow: var(--shadow-sm); margin-bottom: 14px;
  }
  .tw-stagebar button {
    flex: 1; min-height: 48px; border: none; cursor: pointer;
    transition: background 0.15s, color 0.15s;
    font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 500;
    text-transform: capitalize; letter-spacing: 0.02em;
    -webkit-tap-highlight-color: transparent;
  }
  .tw-hscroll {
    display: flex; gap: 5px;
    overflow-x: auto; -webkit-overflow-scrolling: touch;
    scrollbar-width: none; padding-bottom: 2px;
  }
  .tw-hscroll::-webkit-scrollbar { display: none; }
  .tw-subj-tabs {
    display: flex; overflow-x: auto;
    -webkit-overflow-scrolling: touch; scrollbar-width: none;
    border-bottom: 0.5px solid var(--bg-border); padding: 0 4px;
  }
  .tw-subj-tabs::-webkit-scrollbar { display: none; }
  .tw-subj-tabs button {
    padding: 10px 14px; flex-shrink: 0;
    background: transparent; border: none; cursor: pointer;
    white-space: nowrap; transition: color 0.15s;
    font-family: 'DM Sans', sans-serif; font-size: 13px; min-height: 44px;
    -webkit-tap-highlight-color: transparent;
  }
  .tw-opt {
    display: flex; gap: 10px; align-items: flex-start;
    padding: 11px 12px; border-radius: 8px; cursor: pointer;
    transition: background 0.12s, border-color 0.12s;
    margin-bottom: 6px; min-height: 48px;
    font-family: 'DM Sans', sans-serif;
    -webkit-tap-highlight-color: transparent; user-select: none;
    border: 0.5px solid var(--bg-border);
  }
  @media (min-width: 480px) { .tw-opt { padding: 10px 14px; gap: 12px; } }
  .tw-qtext {
    font-size: 14px; font-weight: 500;
    color: var(--text-primary); line-height: 1.7;
    word-break: break-word; overflow-wrap: anywhere;
    flex: 1;
  }
  .tw-frow { display: flex; align-items: center; gap: 6px; }
  .tw-flabel {
    font-size: 10px; color: var(--text-muted);
    font-family: 'DM Mono', monospace;
    flex-shrink: 0; width: 40px;
  }
  .tw-fchips {
    display: flex; gap: 5px; overflow-x: auto;
    -webkit-overflow-scrolling: touch; scrollbar-width: none;
    flex: 1; padding-bottom: 2px;
  }
  .tw-fchips::-webkit-scrollbar { display: none; }
  .tw-panel-pad { padding: 14px 12px 24px; }
  @media (min-width: 480px) { .tw-panel-pad { padding: 18px 20px 28px; } }
`;
function GlobalStyles() {
  return <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />;
}

// ─── MICRO COMPONENTS ─────────────────────────────────────────────────────────
function Chip({ label, active, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 11,
        padding: "5px 11px",
        borderRadius: 20,
        flexShrink: 0,
        border: active ? `0.5px solid ${color}` : "0.5px solid var(--bg-border)",
        background: active ? `${color}22` : "transparent",
        color: active ? color : "var(--text-muted)",
        cursor: "pointer",
        fontWeight: active ? 600 : 400,
        whiteSpace: "nowrap",
        fontFamily: "'DM Mono', monospace",
        letterSpacing: "0.03em",
        minHeight: 30,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {label}
    </button>
  );
}

function Tag({ label, meta }) {
  if (!meta) return null;
  return (
    <span
      style={{
        fontSize: 10,
        padding: "2px 8px",
        borderRadius: 20,
        flexShrink: 0,
        border: `0.5px solid ${meta.border}`,
        background: meta.bg,
        color: meta.text,
        fontWeight: 500,
        whiteSpace: "nowrap",
        fontFamily: "'DM Mono', monospace",
      }}
    >
      {meta.label || label}
    </span>
  );
}

function YearBadge({ year }) {
  if (!year) return null;
  return (
    <span
      style={{
        fontSize: 10,
        padding: "2px 8px",
        borderRadius: 4,
        flexShrink: 0,
        border: "0.5px solid var(--bg-border)",
        background: "var(--bg-muted)",
        color: "var(--text-muted)",
        fontFamily: "'DM Mono', monospace",
        letterSpacing: "0.04em",
        fontWeight: 600,
      }}
    >
      {year}
    </span>
  );
}

function StatCard({ value, label, color }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        padding: "12px 8px",
        background: "var(--bg-surface)",
        border: "0.5px solid var(--bg-border)",
        borderTop: `3px solid ${color}`,
        borderRadius: 10,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <span
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: "var(--text-primary)",
          lineHeight: 1,
          fontFamily: "'Playfair Display', Georgia, serif",
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: 10,
          color: "var(--text-muted)",
          fontFamily: "'DM Mono', monospace",
          textAlign: "center",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function PinButton({ pinned, onClick }) {
  return (
    <button
      onClick={e => {
        e.stopPropagation();
        onClick();
      }}
      title={pinned ? "Unpin" : "Pin to revision"}
      style={{
        fontSize: 15,
        width: 36,
        height: 36,
        borderRadius: 8,
        flexShrink: 0,
        border: pinned ? "0.5px solid #fbbf24" : "0.5px solid var(--bg-border)",
        background: pinned ? "rgba(251,191,36,0.15)" : "transparent",
        color: pinned ? "#fbbf24" : "var(--text-muted)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {pinned ? "📌" : "📍"}
    </button>
  );
}

// ─── FILTER PANEL ─────────────────────────────────────────────────────────────
function FilterPanel({ children, accentColor, count, total }) {
  const [open, setOpen] = useState(false);
  const isFiltered = count !== total;
  return (
    <div style={{ marginBottom: 12 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          padding: "9px 12px",
          minHeight: 40,
          background: "var(--bg-surface)",
          border: isFiltered ? `0.5px solid ${accentColor}66` : "0.5px solid var(--bg-border)",
          borderRadius: open ? "8px 8px 0 0" : 8,
          color: "var(--text-muted)",
          cursor: "pointer",
          fontFamily: "'DM Mono', monospace",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.05em",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <span style={{ color: isFiltered ? accentColor : "var(--text-muted)" }}>⊞</span>
        <span style={{ color: isFiltered ? accentColor : "var(--text-muted)" }}>
          FILTERS {isFiltered ? `· ${count}/${total}` : ""}
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 12,
            transition: "transform 0.2s",
            display: "inline-block",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▾
        </span>
      </button>
      {open && (
        <div
          style={{
            border: "0.5px solid var(--bg-border)",
            borderTop: "none",
            borderRadius: "0 0 8px 8px",
            padding: "10px 12px",
            background: "var(--bg-muted)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ─── MAINS SUBJECT PANEL ──────────────────────────────────────────────────────
function MainsSubjectPanel({ subject, accentColor, paperLabel, recordAttempt, attemptedIds, isLoggedIn }) {
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

  const filtered = useMemo(
    () =>
      rawData.filter(q => {
        if (yearFilter !== "All" && String(q.year) !== String(yearFilter)) return false;
        if (topicFilter !== "All" && q.topic !== topicFilter) return false;
        if (marksFilter !== "All" && String(q.marks) !== String(marksFilter)) return false;
        if (directiveFilter !== "All" && q.directive !== directiveFilter) return false;
        if (search.trim()) {
          const s = search.toLowerCase();
          if (
            !q.questionText?.toLowerCase().includes(s) &&
            !q.topic?.toLowerCase().includes(s) &&
            !q.subTopic?.toLowerCase().includes(s) &&
            !q.idealAnswer?.toLowerCase().includes(s)
          )
            return false;
        }
        return true;
      }),
    [rawData, yearFilter, topicFilter, marksFilter, directiveFilter, search]
  );

  const clearAll = () => {
    setYearFilter("All");
    setTopicFilter("All");
    setMarksFilter("All");
    setDirectiveFilter("All");
    setSearch("");
  };

  return (
    <div>
      {/* Stats */}
      <div className="tw-stats">
        <StatCard value={rawData.length} label="Questions" color={accentColor} />
        <StatCard value={topics.length} label="Topics" color="var(--accent-gold)" />
        <StatCard value={rawData.filter(q => q.marks === 15).length} label="15-Mark" color="#fcd34d" />
        <StatCard value={rawData.filter(q => q.marks === 10).length} label="10-Mark" color="#93c5fd" />
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 10 }}>
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search questions, topics…"
          style={{
            width: "100%",
            padding: "10px 14px 10px 36px",
            fontSize: 13,
            background: "var(--bg-surface)",
            border: "0.5px solid var(--bg-border)",
            borderRadius: 10,
            color: "var(--text-primary)",
            outline: "none",
            fontFamily: "'DM Sans', sans-serif",
          }}
          onFocus={e => (e.target.style.borderColor = accentColor)}
          onBlur={e => (e.target.style.borderColor = "var(--bg-border)")}
        />
        <span
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)",
            fontSize: 14,
            pointerEvents: "none",
          }}
        >
          ⌕
        </span>
      </div>

      {/* Collapsible filters */}
      <FilterPanel accentColor={accentColor} count={filtered.length} total={rawData.length}>
        {years.length > 1 && (
          <div className="tw-frow">
            <span className="tw-flabel">YEAR</span>
            <div className="tw-fchips">
              <Chip
                label="All"
                active={yearFilter === "All"}
                color={accentColor}
                onClick={() => setYearFilter("All")}
              />
              {years.map(y => (
                <Chip
                  key={y}
                  label={String(y)}
                  active={yearFilter === String(y)}
                  color={accentColor}
                  onClick={() => setYearFilter(String(y))}
                />
              ))}
            </div>
          </div>
        )}
        {topics.length > 1 && (
          <div className="tw-frow">
            <span className="tw-flabel">TOPIC</span>
            <div className="tw-fchips">
              <Chip
                label="All"
                active={topicFilter === "All"}
                color={accentColor}
                onClick={() => setTopicFilter("All")}
              />
              {topics.map(t => (
                <Chip
                  key={t}
                  label={t}
                  active={topicFilter === t}
                  color={accentColor}
                  onClick={() => setTopicFilter(t)}
                />
              ))}
            </div>
          </div>
        )}
        {marksOpts.length > 1 && (
          <div className="tw-frow">
            <span className="tw-flabel">MARKS</span>
            <div className="tw-fchips">
              <Chip
                label="All"
                active={marksFilter === "All"}
                color={accentColor}
                onClick={() => setMarksFilter("All")}
              />
              {marksOpts.map(m => (
                <Chip
                  key={m}
                  label={`${m}M`}
                  active={marksFilter === String(m)}
                  color={accentColor}
                  onClick={() => setMarksFilter(String(m))}
                />
              ))}
            </div>
          </div>
        )}
        {directives.length > 1 && (
          <div className="tw-frow">
            <span className="tw-flabel">STYLE</span>
            <div className="tw-fchips">
              <Chip
                label="All"
                active={directiveFilter === "All"}
                color={accentColor}
                onClick={() => setDirectiveFilter("All")}
              />
              {directives.map(d => (
                <Chip
                  key={d}
                  label={d}
                  active={directiveFilter === d}
                  color={accentColor}
                  onClick={() => setDirectiveFilter(d)}
                />
              ))}
            </div>
          </div>
        )}
        {filtered.length !== rawData.length && (
          <button
            onClick={clearAll}
            style={{
              alignSelf: "flex-start",
              fontSize: 10,
              padding: "4px 10px",
              borderRadius: 20,
              border: "0.5px solid var(--bg-border)",
              background: "transparent",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontFamily: "'DM Mono', monospace",
            }}
          >
            Clear filters
          </button>
        )}
      </FilterPanel>

      {/* Count */}
      <div
        style={{
          fontSize: 11,
          color: "var(--text-muted)",
          marginBottom: 12,
          fontFamily: "'DM Mono', monospace",
          paddingBottom: 10,
          borderBottom: "0.5px solid var(--bg-border)",
        }}
      >
        {filtered.length} of {rawData.length} questions
      </div>

      {/* Tip */}
      <div
        style={{
          marginBottom: 12,
          padding: "9px 12px",
          borderRadius: 8,
          background: `${accentColor}0a`,
          border: `0.5px solid ${accentColor}25`,
          fontSize: 12,
          color: "var(--text-muted)",
          fontFamily: "'DM Mono', monospace",
          lineHeight: 1.55,
        }}
      >
        💡 <strong style={{ color: accentColor }}>Hints</strong> → plan &nbsp;·&nbsp;{" "}
        <strong style={{ color: accentColor }}>Practice</strong> → draft &nbsp;·&nbsp;{" "}
        <strong style={{ color: accentColor }}>Model Answer</strong> → compare &nbsp;·&nbsp;{" "}
        <strong style={{ color: accentColor }}>✓ Mark</strong> → syncs to Syllabus Tracker
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div
          style={{
            padding: "40px 16px",
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: 13,
            fontFamily: "'DM Mono', monospace",
            background: "var(--bg-surface)",
            border: "0.5px solid var(--bg-border)",
            borderRadius: 12,
          }}
        >
          No questions match the filters.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((q, i) => {
            const qId = q._id || q.id || `mq-${i}`;
            const isDone = attemptedIds?.has(qId);
            const subMeta = { subject: subject.label, paper: paperLabel };
            return (
              <div key={qId} style={{ position: "relative" }}>
                <MainsQuestionCard
                  q={q}
                  index={i}
                  accentColor={subject.color || accentColor}
                  paper={paperLabel}
                  isLoggedIn={isLoggedIn}
                />
                {/* Attempt tracker strip */}
                {recordAttempt && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: 8,
                      padding: "6px 14px 10px",
                      borderTop: "0.5px solid var(--bg-border)",
                      marginTop: -1,
                    }}
                  >
                    {isDone && (
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--accent-green)",
                          fontFamily: "'DM Mono', monospace",
                        }}
                      >
                        ✓ Practiced
                      </span>
                    )}
                    <button
                      onClick={() =>
                        recordAttempt(
                          {
                            id: qId,
                            questionText: q.questionText,
                            topic: q.topic,
                            subTopic: q.subTopic,
                            difficulty: q.difficulty,
                            year: q.year,
                          },
                          isDone ? "skipped" : "attempted",
                          subMeta
                        )
                      }
                      style={{
                        fontSize: 11,
                        padding: "4px 12px",
                        borderRadius: 20,
                        cursor: "pointer",
                        border: isDone ? "0.5px solid var(--bg-border)" : `0.5px solid ${accentColor}`,
                        background: isDone ? "transparent" : `${accentColor}18`,
                        color: isDone ? "var(--text-muted)" : accentColor,
                        fontFamily: "'DM Mono', monospace",
                        fontWeight: 500,
                        transition: "all .15s",
                      }}
                    >
                      {isDone ? "Undo" : "✓ Mark Practiced"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── PAPER SECTION ──────────────────────────────────────────────────────────
function PaperSection({ paperId, paper, isOpen, onToggle, recordAttempt, attemptedIds, isLoggedIn }) {
  const [activeSubject, setActiveSubject] = useState(null);
  const subjectEntries = Object.entries(paper.subjects || {});
  const totalQ = useMemo(
    () => subjectEntries.reduce((s, [, sub]) => s + (sub.data?.length || 0), 0),
    [subjectEntries]
  );

  // Auto-select first subject when opening
  const handleToggle = useCallback(() => {
    onToggle();
    if (!isOpen && subjectEntries.length > 0 && !activeSubject) {
      setActiveSubject(subjectEntries[0][0]);
    }
  }, [isOpen, onToggle, subjectEntries, activeSubject]);

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "0.5px solid var(--bg-border)",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: isOpen ? "var(--shadow-md)" : "var(--shadow-sm)",
      }}
    >
      {/* Header */}
      <div className="tw-paper-hdr" onClick={handleToggle}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: paper.color,
            flexShrink: 0,
            boxShadow: `0 0 6px ${paper.color}60`,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            {paper.label}
            {totalQ > 0 && (
              <span
                style={{
                  fontSize: 9,
                  padding: "1px 6px",
                  borderRadius: 4,
                  background: `${paper.color}15`,
                  color: paper.color,
                  border: `0.5px solid ${paper.color}40`,
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                LIVE
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              marginTop: 2,
              fontFamily: "'DM Mono', monospace",
            }}
          >
            {subjectEntries.length} subjects · {totalQ} questions
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 4 }}>
            {subjectEntries.slice(0, 4).map(([, s]) => (
              <div
                key={s.label}
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: s.color,
                  opacity: 0.8,
                }}
              />
            ))}
          </div>
          <span
            style={{
              fontSize: 18,
              color: "var(--text-muted)",
              lineHeight: 1,
              transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform .2s",
              display: "inline-block",
            }}
          >
            ›
          </span>
        </div>
      </div>

      {/* Content */}
      {isOpen && (
        <div style={{ borderTop: "0.5px solid var(--bg-border)" }}>
          {subjectEntries.length === 0 ? (
            // Fallback: show static paper links (but we have subjects for GS1-4)
            <div style={{ padding: "14px 12px" }}>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  fontFamily: "'DM Mono', monospace",
                  marginBottom: 12,
                }}
              >
                Subject-wise questions coming soon · Official papers below
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011].map(year => {
                  // We don't import getMainsPaperLink here; we can skip or use a fallback.
                  // Since we have subject data, this fallback is rarely used.
                  return (
                    <a
                      key={year}
                      href="#"
                      style={{
                        fontSize: 12,
                        padding: "7px 12px",
                        borderRadius: 8,
                        minHeight: 36,
                        border: "0.5px solid var(--bg-border)",
                        background: "transparent",
                        color: "var(--text-muted)",
                        textDecoration: "none",
                        fontFamily: "'DM Mono', monospace",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      {year}
                    </a>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {/* Subject tabs */}
              <div className="tw-subj-tabs">
                {subjectEntries.map(([key, s]) => {
                  const isActive = activeSubject === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveSubject(key)}
                      style={{
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? s.color : "var(--text-muted)",
                        borderBottom: isActive ? `2px solid ${s.color}` : "2px solid transparent",
                        marginBottom: -1,
                      }}
                    >
                      {s.label}
                      <span
                        style={{
                          marginLeft: 5,
                          fontSize: 10,
                          fontFamily: "'DM Mono', monospace",
                          opacity: 0.7,
                        }}
                      >
                        ({s.data?.length || 0})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active subject content */}
              {activeSubject && paper.subjects[activeSubject] && (
                <div className="tw-panel-pad">
                  <MainsSubjectPanel
                    key={activeSubject}
                    subject={paper.subjects[activeSubject]}
                    accentColor={paper.subjects[activeSubject].color || paper.color}
                    paperLabel={paper.label}
                    recordAttempt={recordAttempt}
                    attemptedIds={attemptedIds}
                    isLoggedIn={isLoggedIn}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── REVISION QUEUE PANEL ──────────────────────────────────────────────────────
function RevisionQueuePanel({ revQueue }) {
  const { queue, unpin, clearQueue } = revQueue;
  const [filter, setFilter] = useState("All");

  const subjects = useMemo(
    () => ["All", ...new Set(queue.map(q => q.subject).filter(Boolean))],
    [queue]
  );
  const filtered = filter === "All" ? queue : queue.filter(q => q.subject === filter);

  if (queue.length === 0) {
    return (
      <div style={{ padding: "60px 16px", textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📌</div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "var(--text-primary)",
            fontFamily: "'Playfair Display', Georgia, serif",
            marginBottom: 6,
          }}
        >
          No pinned questions
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
          Pin questions while browsing to add them here.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
          {queue.length} question{queue.length !== 1 ? "s" : ""} pinned
        </div>
        <button
          onClick={() => {
            if (confirm("Clear all pinned questions?")) clearQueue();
          }}
          style={{
            fontSize: 11,
            padding: "5px 12px",
            borderRadius: 8,
            border: "0.5px solid rgba(248,113,113,0.4)",
            background: "transparent",
            color: "#fca5a5",
            cursor: "pointer",
            fontFamily: "'DM Mono', monospace",
          }}
        >
          Clear All
        </button>
      </div>

      {subjects.length > 2 && (
        <div className="tw-hscroll" style={{ marginBottom: 12 }}>
          {subjects.map(s => (
            <Chip
              key={s}
              label={s}
              active={filter === s}
              color="#fbbf24"
              onClick={() => setFilter(s)}
            />
          ))}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((q, i) => (
          <div
            key={q._id || i}
            style={{
              background: "var(--bg-surface)",
              border: "0.5px solid rgba(251,191,36,0.3)",
              borderRadius: 12,
              padding: "12px 14px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text-primary)",
                    lineHeight: 1.6,
                    marginBottom: 8,
                    wordBreak: "break-word",
                  }}
                >
                  {q.questionText?.slice(0, 200)}
                  {q.questionText?.length > 200 ? "…" : ""}
                </div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  <YearBadge year={q.year} />
                  {q.subject && (
                    <span
                      style={{
                        fontSize: 10,
                        padding: "2px 8px",
                        borderRadius: 20,
                        background: "rgba(251,191,36,0.1)",
                        color: "#fbbf24",
                        border: "0.5px solid rgba(251,191,36,0.3)",
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {q.subject}
                    </span>
                  )}
                  {q.topic && (
                    <span
                      style={{
                        fontSize: 10,
                        padding: "2px 8px",
                        borderRadius: 20,
                        background: "var(--bg-muted)",
                        color: "var(--text-muted)",
                        border: "0.5px solid var(--bg-border)",
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {q.topic}
                    </span>
                  )}
                  {DIFF_META[q.difficulty] && (
                    <Tag label={q.difficulty} meta={DIFF_META[q.difficulty]} />
                  )}
                </div>
              </div>
              <button
                onClick={() => unpin(q._id || q.id)}
                style={{
                  fontSize: 13,
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  border: "0.5px solid var(--bg-border)",
                  background: "transparent",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>
            {q.correctOption && (
              <div
                style={{
                  marginTop: 8,
                  fontSize: 11,
                  color: "#6ee7b7",
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                Ans: {q.correctOption}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function MainsGrind({
  onSyllabusUpdate,
  onBulkSyllabusUpdate = null,
  serverAttempts = [],
  isLoggedIn = false,
}) {
  const [activeTab, setActiveTab] = useState("practice");
  const [practiceTab, setPracticeTab] = useState("browse");
  const [openPapers, setOpenPapers] = useState({ GS1: true });

  const { recordAttempt, attemptedIds } = useQuestionAttempts({ onSyllabusUpdate, serverAttempts });
  const revQueue = useRevisionQueue();

  const togglePaper = useCallback(id => setOpenPapers(prev => ({ ...prev, [id]: !prev[id] })), []);

  const allData = useMemo(() => {
    const entries = [];
    Object.values(MAINS_PAPERS).forEach(paper => {
      Object.values(paper.subjects || {}).forEach(subj => {
        (subj.data || []).forEach(q => entries.push(q));
      });
    });
    return entries;
  }, []);

  const totalQ = allData.length;
  const yearCount = useMemo(() => new Set(allData.map(q => q.year)).size, [allData]);

  const statsData = [
    ["Total", totalQ, "var(--accent-blue)"],
    ["15-Mark", allData.filter(q => q.marks === 15).length, "#fcd34d"],
    ["10-Mark", allData.filter(q => q.marks === 10).length, "#93c5fd"],
    ["Years", yearCount, "var(--accent-gold)"],
  ];

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      <GlobalStyles />
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* ── Header ── */}
        <header className="rounded-3xl border border-bg-border bg-bg-surface/90 p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-accent-gold">Mains Grind</p>
              <h1 className="mt-1 font-display text-2xl font-bold text-text-primary">
                Interactive Mains Practice
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-text-secondary">
                Subject‑wise PYQs with directive mapping, marks distribution, and model answer hints for GS1–4.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-muted">
                {totalQ} questions · {yearCount} years
              </span>
            </div>
          </div>
        </header>

        {/* ── Tabs ── */}
        <section className="rounded-3xl border border-bg-border bg-bg-surface/90 p-5 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "practice", label: "Practice", icon: Archive },
              { id: "resources", label: "Resources", icon: Library },
              { id: "myqs", label: "My Questions", icon: PenSquare },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                  activeTab === id
                    ? "border-accent-gold/30 bg-accent-gold/10 text-accent-gold"
                    : "border-bg-border bg-bg-muted text-text-secondary hover:border-accent-gold/20 hover:text-text-primary"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* ── Practice Tab ── */}
          {activeTab === "practice" && (
            <>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                  {[
                    ["browse", "Browse PYQs"],
                    ["revision", `Revision${revQueue.queue.length > 0 ? ` (${revQueue.queue.length})` : ""}`],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPracticeTab(id)}
                      className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                        practiceTab === id
                          ? "border-accent-gold/30 bg-accent-gold/10 text-accent-gold"
                          : "border-bg-border bg-bg-surface text-text-secondary hover:border-accent-gold/20 hover:text-text-primary"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <br/>
                <br/>
                <br/>
                <span className="text-sm text-text-muted">
                  {allData.length} questions across {yearCount} years
                </span>
              </div>

              {practiceTab === "revision" ? (
                <RevisionQueuePanel revQueue={revQueue} />
              ) : (
                <>
                  {/* Stats */}
                  <div className="tw-stats">
                    {statsData.map(([l, v, c]) => (
                      <StatCard key={l} value={v} label={l} color={c} />
                    ))}
                  </div>

                  {/* Paper accordions */}
                  <div className="mt-4 flex flex-col gap-4">
                    {Object.entries(MAINS_PAPERS).map(([paperId, paper]) => (
                      <PaperSection
                        key={paperId}
                        paperId={paperId}
                        paper={paper}
                        isOpen={!!openPapers[paperId]}
                        onToggle={() => togglePaper(paperId)}
                        recordAttempt={recordAttempt}
                        attemptedIds={attemptedIds}
                        isLoggedIn={isLoggedIn}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* ── Resources Tab ── */}
          {activeTab === "resources" && <ResourceLibrary />}

          {/* ── My Questions Tab ── */}
          {activeTab === "myqs" && (
            <div className="mt-5">
              <AddCustomQuestion
                storageKey="mains-custom-qs"
                defaultPaper="GS Paper I"
                paperOptions={[
                  "Essay",
                  "GS I",
                  "GS II",
                  "GS III",
                  "GS IV",
                  "Optional I",
                  "Optional II",
                  "Hindi (Qualifying)",
                  "English (Qualifying)",
                ]}
                accentColor="var(--accent-gold)"
              />
            </div>
          )}
        </section>

        {/* ── AI Mentor Chat ── */}
        <AIMentorChat
          contextHint="I'm practising UPSC Mains long-answer questions"
          isLoggedIn={isLoggedIn}
          compact={true}
        />
      </div>
    </div>
  );
}