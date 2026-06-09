import { useState, useCallback, useMemo } from "react";

// ─── DATA REGISTRY ────────────────────────────────────────────────────────────
// Add new subject data files here as you build them out.
// Each entry: { label, paper, subject, color, getData: () => import(...) }
// For now we inline the data references so the file is self-contained.
import MatchTable from "../components/MatchTable";
import QuestionRenderer from "../components/QuestionRenderer";
import ExplanationBox from "../components/ExplanationBox";
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

// ─── SUBJECT REGISTRY ─────────────────────────────────────────────────────────

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
      GS1: { label: "GS Paper I", color: "#4F8EF7", subjects: {} },
      GS2: { label: "GS Paper II", color: "#34d399", subjects: {} },
      GS3: { label: "GS Paper III", color: "#f97316", subjects: {} },
      GS4: { label: "GS Paper IV", color: "#a78bfa", subjects: {} },
    },
  },
};

// ─── STYLE TAG META ───────────────────────────────────────────────────────────

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

// ─── UTILITIES ────────────────────────────────────────────────────────────────

function getYears(data) {
  return [...new Set((data || []).map((q) => q.year))].sort((a, b) => b - a);
}

function getTopics(data) {
  return [...new Set((data || []).map((q) => q.topic).filter(Boolean))].sort();
}

function getStyleTags(data) {
  return [...new Set((data || []).map((q) => q.styleTag).filter(Boolean))];
}

function getDifficulties(data) {
  return [...new Set((data || []).map((q) => q.difficulty).filter(Boolean))];
}

// ─── MICRO COMPONENTS ────────────────────────────────────────────────────────

function Chip({ label, active, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 11,
        padding: "4px 12px",
        borderRadius: 20,
        border: active ? `0.5px solid ${color}` : "0.5px solid var(--bg-border)",
        background: active ? `${color}22` : "transparent",
        color: active ? color : "var(--text-muted)",
        cursor: "pointer",
        fontWeight: active ? 600 : 400,
        whiteSpace: "nowrap",
        transition: "all .15s",
        fontFamily: "'DM Mono', monospace",
        letterSpacing: "0.03em",
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
      fontSize: 10,
      padding: "2px 8px",
      borderRadius: 20,
      border: `0.5px solid ${meta.border}`,
      background: meta.bg,
      color: meta.text,
      fontWeight: 500,
      whiteSpace: "nowrap",
      fontFamily: "'DM Mono', monospace",
    }}>
      {meta.label || label}
    </span>
  );
}

function YearBadge({ year }) {
  return (
    <span style={{
      fontSize: 10,
      padding: "2px 8px",
      borderRadius: 4,
      border: "0.5px solid var(--bg-border)",
      background: "var(--bg-muted)",
      color: "var(--text-muted)",
      fontFamily: "'DM Mono', monospace",
      letterSpacing: "0.04em",
      fontWeight: 600,
    }}>
      {year}
    </span>
  );
}

function StatPill({ value, label, color }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 2,
      padding: "10px 18px",
      background: "var(--bg-surface)",
      border: "0.5px solid var(--bg-border)",
      borderTop: `2px solid ${color}`,
      borderRadius: 10,
      minWidth: 64,
      boxShadow: "var(--shadow-sm)",
    }}>
      <span style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1, fontFamily: "'Playfair Display', Georgia, serif" }}>
        {value}
      </span>
      <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
        {label}
      </span>
    </div>
  );
}

// ─── QUESTION CARD ────────────────────────────────────────────────────────────

function QuestionCard({ q, index, accentColor }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(false);

  const styleMeta = STYLE_META[q.styleTag];
  const diffMeta = DIFF_META[q.difficulty];

  const isCorrect = selected === q.correctOption;
  const isRevealed = showAnswer || selected !== null;

  function getOptionStyle(id) {
    const base = {
      display: "flex",
      gap: 12,
      alignItems: "flex-start",
      padding: "10px 14px",
      borderRadius: 8,
      border: "0.5px solid var(--bg-border)",
      background: "var(--bg-muted)",
      cursor: "pointer",
      transition: "all .15s",
      marginBottom: 6,
      fontFamily: "'DM Sans', sans-serif",
    };
    if (!isRevealed) {
      return {
        ...base,
        ...(selected === id
          ? { border: `0.5px solid ${accentColor}`, background: `${accentColor}18` }
          : {}),
      };
    }
    if (id === q.correctOption) {
      return { ...base, border: "0.5px solid rgba(52,211,153,0.5)", background: "rgba(52,211,153,0.08)", color: "#6ee7b7" };
    }
    if (selected === id && id !== q.correctOption) {
      return { ...base, border: "0.5px solid rgba(248,113,113,0.5)", background: "rgba(248,113,113,0.08)", color: "#fca5a5" };
    }
    return { ...base, opacity: 0.5 };
  }

  function getOptionMarker(id) {
    if (!isRevealed) return { text: id, color: "var(--text-muted)" };
    if (id === q.correctOption) return { text: "✓", color: "#6ee7b7" };
    if (selected === id) return { text: "✗", color: "#fca5a5" };
    return { text: id, color: "var(--text-muted)" };
  }

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "0.5px solid var(--bg-border)",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: hovered ? "var(--shadow-md)" : "var(--shadow-sm)",
        transition: "box-shadow .2s",
        borderLeft: `3px solid ${accentColor}`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Card Header */}
      <div style={{
        padding: "16px 20px 12px",
        borderBottom: "0.5px solid var(--bg-border)",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
      }}>
        <div style={{
          fontSize: 12,
          fontWeight: 700,
          color: accentColor,
          fontFamily: "'DM Mono', monospace",
          minWidth: 28,
          paddingTop: 2,
        }}>
          Q{index + 1}
        </div>
        <div style={{ flex: 1 }}>
          {(() => {
            const text = q.questionText || ""; // Fallback if questionText is undefined

            // Check if text has inline table details safely
            if (typeof text === "string" && text.includes("|")) {
              const parts = text.split("\n");
              const normalTextBefore = [];
              const tableLines = [];
              const normalTextAfter = [];

              let reachedTable = false;
              let leftTable = false;

              parts.forEach((line) => {
                if (line.trim().startsWith("|")) {
                  reachedTable = true;
                  tableLines.push(line);
                } else if (reachedTable) {
                  leftTable = true;
                  normalTextAfter.push(line);
                } else {
                  normalTextBefore.push(line);
                }
              });

              return (
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.65 }}>
                  <div style={{ whiteSpace: "pre-wrap", marginBottom: 6 }}>{normalTextBefore.join("\n")}</div>
                  <MatchTable dataString={tableLines.join("\n")} />
                  <div style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>{normalTextAfter.join("\n")}</div>
                </div>
              );
            }

            // Default rendering if no table layout exists
            return (
              <div style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--text-primary)",
                lineHeight: 1.65,
                whiteSpace: "pre-wrap",
              }}>
                {text}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Tags Row */}
      <div style={{
        padding: "10px 20px",
        display: "flex",
        gap: 6,
        flexWrap: "wrap",
        alignItems: "center",
        borderBottom: "0.5px solid var(--bg-border)",
      }}>
        <YearBadge year={q.year} />
        {styleMeta && <Tag label={q.styleTag} meta={styleMeta} />}
        {diffMeta && <Tag label={q.difficulty} meta={diffMeta} />}
        {q.subTopic && (
          <span style={{
            fontSize: 10,
            padding: "2px 8px",
            borderRadius: 20,
            border: "0.5px solid var(--bg-border)",
            background: "var(--bg-muted)",
            color: "var(--text-muted)",
            fontFamily: "'DM Mono', monospace",
          }}>
            {q.subTopic}
          </span>
        )}
      </div>

      {/* Options */}
      <div style={{ padding: "14px 20px" }}>
        {(q.options || []).map((opt) => {
          const marker = getOptionMarker(opt.id);
          return (
            <div
              key={opt.id}
              style={getOptionStyle(opt.id)}
              onClick={() => { if (!isRevealed) setSelected(opt.id); }}
            >
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: marker.color,
                minWidth: 18,
                fontFamily: "'DM Mono', monospace",
                paddingTop: 1,
                transition: "color .15s",
              }}>
                {marker.text}
              </span>
              <span style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.55 }}>
                {opt.text}
              </span>
            </div>
          );
        })}
      </div>

      {/* Action Row */}
      <div style={{
        padding: "10px 20px 16px",
        display: "flex",
        gap: 8,
        alignItems: "center",
        flexWrap: "wrap",
      }}>
        <button
          onClick={() => setShowAnswer((v) => !v)}
          style={{
            fontSize: 12,
            padding: "6px 16px",
            borderRadius: 8,
            border: `0.5px solid ${accentColor}`,
            background: showAnswer ? `${accentColor}22` : "transparent",
            color: accentColor,
            cursor: "pointer",
            fontWeight: 500,
            transition: "all .15s",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {showAnswer ? "Hide Explanation" : "Show Explanation"}
        </button>
        {selected !== null && (
          <button
            onClick={() => { setSelected(null); setShowAnswer(false); }}
            style={{
              fontSize: 12,
              padding: "6px 14px",
              borderRadius: 8,
              border: "0.5px solid var(--bg-border)",
              background: "transparent",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Reset
          </button>
        )}
        {selected !== null && (
          <span style={{
            fontSize: 11,
            color: isCorrect ? "#6ee7b7" : "#fca5a5",
            fontWeight: 600,
            fontFamily: "'DM Mono', monospace",
          }}>
            {isCorrect ? "✓ Correct" : `✗ Answer: ${q.correctOption}`}
          </span>
        )}
      </div>

      {/* Explanation Panel */}
      {showAnswer && q.explanation && (
        <ExplanationBox
          text={q.explanation}
          accentColor={accentColor}
          sources={q.sources}
        />
      )}
    </div>
  );
}

// ─── SUBJECT PANEL ────────────────────────────────────────────────────────────

function SubjectPanel({ subject, subjectKey, accentColor }) {
  const rawData = subject.data || [];

  // Filter state
  const [yearFilter, setYearFilter] = useState("All");
  const [topicFilter, setTopicFilter] = useState("All");
  const [styleFilter, setStyleFilter] = useState("All");
  const [diffFilter, setDiffFilter] = useState("All");
  const [search, setSearch] = useState("");

  const years = useMemo(() => getYears(rawData), [rawData]);
  const topics = useMemo(() => getTopics(rawData), [rawData]);
  const styles = useMemo(() => getStyleTags(rawData), [rawData]);
  const diffs = useMemo(() => getDifficulties(rawData), [rawData]);

  const filtered = useMemo(() => {
    return rawData.filter((q) => {
      if (yearFilter !== "All" && String(q.year) !== String(yearFilter)) return false;
      if (topicFilter !== "All" && q.topic !== topicFilter) return false;
      if (styleFilter !== "All" && q.styleTag !== styleFilter) return false;
      if (diffFilter !== "All" && q.difficulty !== diffFilter) return false;
      if (search.trim()) {
        const s = search.toLowerCase();
        if (
          !q.questionText?.toLowerCase().includes(s) &&
          !q.topic?.toLowerCase().includes(s) &&
          !q.subTopic?.toLowerCase().includes(s)
        ) return false;
      }
      return true;
    });
  }, [rawData, yearFilter, topicFilter, styleFilter, diffFilter, search]);

  // Stats
  const totalQ = rawData.length;
  const easyCount = rawData.filter((q) => q.difficulty === "Easy").length;
  const hardCount = rawData.filter((q) => q.difficulty === "Hard").length;
  const yearCount = years.length;

  return (
    <div>
      {/* Subject Stats Row */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        <StatPill value={totalQ} label="Questions" color={accentColor} />
        <StatPill value={yearCount} label="Years" color="var(--accent-blue)" />
        <StatPill value={easyCount} label="Easy" color="var(--accent-green)" />
        <StatPill value={hardCount} label="Hard" color="#f87171" />
        <StatPill value={topics.length} label="Topics" color="var(--accent-gold)" />
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16, position: "relative" }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions, topics…"
          style={{
            width: "100%",
            padding: "9px 14px 9px 36px",
            fontSize: 13,
            background: "var(--bg-surface)",
            border: "0.5px solid var(--bg-border)",
            borderRadius: 10,
            color: "var(--text-primary)",
            outline: "none",
            fontFamily: "'DM Sans', sans-serif",
            boxSizing: "border-box",
            transition: "border-color .15s",
          }}
          onFocus={(e) => (e.target.style.borderColor = accentColor)}
          onBlur={(e) => (e.target.style.borderColor = "var(--bg-border)")}
        />
        <span style={{
          position: "absolute", left: 12, top: "50%",
          transform: "translateY(-50%)",
          color: "var(--text-muted)", fontSize: 14, pointerEvents: "none",
        }}>⌕</span>
      </div>

      {/* Filter Chips */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {/* Years */}
        {years.length > 1 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", minWidth: 38 }}>YEAR</span>
            <Chip label="All" active={yearFilter === "All"} color={accentColor} onClick={() => setYearFilter("All")} />
            {years.map((y) => (
              <Chip key={`year-${y}`} label={String(y)} active={yearFilter === String(y)} color={accentColor}
                onClick={() => setYearFilter(String(y))} />
            ))}
          </div>
        )}
        {/* Topics */}
        {topics.length > 1 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", minWidth: 38 }}>TOPIC</span>
            <Chip label="All" active={topicFilter === "All"} color={accentColor} onClick={() => setTopicFilter("All")} />
            {topics.map((t) => (
              <Chip key={`topic-${t}`} label={t} active={topicFilter === t} color={accentColor}
                onClick={() => setTopicFilter(t)} />
            ))}
          </div>
        )}
        {/* Style Tags */}
        {styles.length > 1 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", minWidth: 38 }}>TYPE</span>
            <Chip label="All" active={styleFilter === "All"} color={accentColor} onClick={() => setStyleFilter("All")} />
            {styles.map((s) => {
              const meta = STYLE_META[s];
              return (
                <Chip key={`style-${s}`} label={meta?.label || s} active={styleFilter === s} color={accentColor}
                  onClick={() => setStyleFilter(s)} />
              );
            })}
          </div>
        )}
        {/* Difficulty */}
        {diffs.length > 1 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", minWidth: 38 }}>DIFF</span>
            <Chip label="All" active={diffFilter === "All"} color={accentColor} onClick={() => setDiffFilter("All")} />
            {["Easy", "Medium", "Hard"].filter((d) => diffs.includes(d)).map((d) => (
              <Chip key={`diff-${d}`} label={d} active={diffFilter === d} color={accentColor}
                onClick={() => setDiffFilter(d)} />
            ))}
          </div>
        )}
      </div>

      {/* Result count */}
      <div style={{
        fontSize: 11, color: "var(--text-muted)", marginBottom: 14,
        fontFamily: "'DM Mono', monospace",
        paddingBottom: 12, borderBottom: "0.5px solid var(--bg-border)",
      }}>
        {filtered.length} of {totalQ} questions
        {filtered.length !== totalQ && (
          <button
            onClick={() => {
              setYearFilter("All"); setTopicFilter("All");
              setStyleFilter("All"); setDiffFilter("All"); setSearch("");
            }}
            style={{
              marginLeft: 12, fontSize: 10, padding: "2px 8px", borderRadius: 20,
              border: "0.5px solid var(--bg-border)", background: "transparent",
              color: "var(--text-muted)", cursor: "pointer", fontFamily: "'DM Mono', monospace",
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Question Cards */}
      {filtered.length === 0 ? (
        <div style={{
          padding: "48px 24px", textAlign: "center",
          color: "var(--text-muted)", fontSize: 14,
          fontFamily: "'DM Mono', monospace",
          background: "var(--bg-surface)",
          border: "0.5px solid var(--bg-border)",
          borderRadius: 14,
        }}>
          No questions match the current filters.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((q, i) => (
            <QuestionCard key={q._id || i} q={q} index={i} accentColor={accentColor} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PAPER ACCORDION ─────────────────────────────────────────────────────────

function PaperSection({ paperId, paper, isOpen, onToggle }) {
  const [activeSubject, setActiveSubject] = useState(null);
  const subjectEntries = Object.entries(paper.subjects || {});

  // Auto-select first subject when paper opens
  const handleToggle = useCallback(() => {
    onToggle();
    if (!isOpen && subjectEntries.length > 0 && !activeSubject) {
      setActiveSubject(subjectEntries[0][0]);
    }
  }, [isOpen, onToggle, subjectEntries, activeSubject]);

  const totalQuestions = useMemo(() =>
    subjectEntries.reduce((sum, [, s]) => sum + (s.data?.length || 0), 0),
    [subjectEntries]);

  const [headerHovered, setHeaderHovered] = useState(false);

  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "0.5px solid var(--bg-border)",
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: isOpen ? "var(--shadow-md)" : "var(--shadow-sm)",
      transition: "box-shadow .2s",
    }}>
      {/* Paper Header */}
      <div
        onClick={handleToggle}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "18px 20px",
          cursor: "pointer",
          userSelect: "none",
          background: headerHovered ? "var(--bg-muted)" : "transparent",
          transition: "background .12s",
        }}
        onMouseEnter={() => setHeaderHovered(true)}
        onMouseLeave={() => setHeaderHovered(false)}
      >
        <div style={{
          width: 12, height: 12, borderRadius: "50%",
          background: paper.color, flexShrink: 0,
          boxShadow: `0 0 8px ${paper.color}60`,
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
            {paper.label}
          </div>
          <div style={{
            fontSize: 12, color: "var(--text-muted)", marginTop: 2,
            fontFamily: "'DM Mono', monospace",
          }}>
            {subjectEntries.length} subjects · {totalQuestions} questions
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {subjectEntries.slice(0, 4).map(([, s]) => (
              <div key={s.label} style={{
                width: 8, height: 8, borderRadius: "50%",
                background: s.color, opacity: 0.8,
              }} />
            ))}
            {subjectEntries.length > 4 && (
              <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
                +{subjectEntries.length - 4}
              </span>
            )}
          </div>
          <span style={{
            fontSize: 16, color: "var(--text-muted)",
            transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform .2s",
            display: "inline-block",
          }}>›</span>
        </div>
      </div>

      {/* Subject Tabs + Content */}
      {isOpen && (
        <div style={{ borderTop: "0.5px solid var(--bg-border)" }}>
          {subjectEntries.length === 0 ? (
            <div style={{
              padding: "40px 24px", textAlign: "center",
              color: "var(--text-muted)", fontSize: 13,
              fontFamily: "'DM Mono', monospace",
            }}>
              Questions coming soon — stay tuned.
            </div>
          ) : (
            <>
              {/* Subject Tab Bar */}
              <div style={{
                display: "flex",
                gap: 0,
                overflowX: "auto",
                borderBottom: "0.5px solid var(--bg-border)",
                padding: "0 8px",
              }}>
                {subjectEntries.map(([key, s]) => {
                  const isActive = activeSubject === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveSubject(key)}
                      style={{
                        padding: "12px 18px",
                        fontSize: 13,
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? s.color : "var(--text-muted)",
                        background: "transparent",
                        border: "none",
                        borderBottom: isActive ? `2px solid ${s.color}` : "2px solid transparent",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "all .15s",
                        fontFamily: "'DM Sans', sans-serif",
                        marginBottom: -1,
                      }}
                    >
                      {s.label}
                      <span style={{
                        marginLeft: 6,
                        fontSize: 10,
                        color: isActive ? s.color : "var(--text-muted)",
                        fontFamily: "'DM Mono', monospace",
                        opacity: 0.75,
                      }}>
                        ({s.data?.length || 0})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Subject Panel */}
              {activeSubject && paper.subjects[activeSubject] && (
                <div style={{ padding: "20px 20px 24px" }}>
                  <SubjectPanel
                    key={activeSubject}
                    subjectKey={activeSubject}
                    subject={paper.subjects[activeSubject]}
                    accentColor={paper.subjects[activeSubject].color || paper.color}
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

// ─── MAIN TOPICWISE COMPONENT ─────────────────────────────────────────────────

export default function Topicwise() {
  const [stage, setStage] = useState("prelims");
  const [openPapers, setOpenPapers] = useState({ GS: true });

  const togglePaper = useCallback((id) => {
    setOpenPapers((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const currentStage = SUBJECT_REGISTRY[stage];
  const currentPapers = currentStage?.papers || {};
  const paperOrder = Object.keys(currentPapers);

  // Global stats
  const allData = useMemo(() => {
    const entries = [];
    Object.values(currentPapers).forEach((paper) => {
      Object.values(paper.subjects || {}).forEach((subj) => {
        (subj.data || []).forEach((q) => entries.push(q));
      });
    });
    return entries;
  }, [currentPapers]);

  const totalQ = allData.length;
  const easyCount = allData.filter((q) => q.difficulty === "Easy").length;
  const medCount = allData.filter((q) => q.difficulty === "Medium").length;
  const hardCount = allData.filter((q) => q.difficulty === "Hard").length;
  const yearCount = useMemo(() => new Set(allData.map((q) => q.year)).size, [allData]);

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      maxWidth: 1152,
      width: "100%",
      margin: "0 auto",
      padding: "32px 24px",
      color: "var(--text-primary)",
    }}>

      {/* ── Top Bar ── */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 32,
        gap: 24,
      }}>
        <div>
          <div style={{
            fontSize: 28,
            fontWeight: 600,
            color: "var(--text-primary)",
            lineHeight: 1.15,
            fontFamily: "'Playfair Display', Georgia, serif",
          }}>
            Topic-wise PYQs
          </div>
          <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4, fontFamily: "'DM Mono', monospace" }}>
            Previous Year Questions · Subject-wise
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 11, padding: "3px 10px", borderRadius: 20,
              background: "var(--status-prog-bg)", color: "var(--status-prog-text)",
              border: "0.5px solid var(--status-prog-border)", fontWeight: 500,
              fontFamily: "'DM Mono', monospace",
            }}>
              UPSC CSE · Prelims + Mains
            </span>
            <span style={{
              fontSize: 11, padding: "3px 10px", borderRadius: 20,
              background: "var(--status-done-bg)", color: "var(--status-done-text)",
              border: "0.5px solid var(--status-done-border)", fontWeight: 500,
              fontFamily: "'DM Mono', monospace",
            }}>
              2011 – 2026
            </span>
          </div>
        </div>

        {/* Global stat */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{
            fontSize: 52,
            fontWeight: 900,
            color: "var(--text-primary)",
            lineHeight: 1,
            fontFamily: "'Playfair Display', Georgia, serif",
          }}>
            {totalQ}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, fontFamily: "'DM Mono', monospace" }}>
            total questions
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, fontFamily: "'DM Mono', monospace" }}>
            across {yearCount} year{yearCount !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* ── Mini Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
        <div style={{
          background: "var(--bg-surface)", border: "0.5px solid var(--bg-border)",
          borderRadius: 12, padding: "16px 12px", textAlign: "center",
          borderTop: "3px solid var(--accent-blue)", boxShadow: "var(--shadow-sm)",
        }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1, fontFamily: "'Playfair Display', Georgia, serif" }}>{totalQ}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 5, fontFamily: "'DM Mono', monospace" }}>Total PYQs</div>
        </div>
        <div style={{
          background: "var(--bg-surface)", border: "0.5px solid var(--bg-border)",
          borderRadius: 12, padding: "16px 12px", textAlign: "center",
          borderTop: "3px solid var(--accent-green)", boxShadow: "var(--shadow-sm)",
        }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1, fontFamily: "'Playfair Display', Georgia, serif" }}>{easyCount}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 5, fontFamily: "'DM Mono', monospace" }}>Easy</div>
        </div>
        <div style={{
          background: "var(--bg-surface)", border: "0.5px solid var(--bg-border)",
          borderRadius: 12, padding: "16px 12px", textAlign: "center",
          borderTop: "3px solid var(--accent-gold)", boxShadow: "var(--shadow-sm)",
        }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1, fontFamily: "'Playfair Display', Georgia, serif" }}>{medCount}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 5, fontFamily: "'DM Mono', monospace" }}>Medium</div>
        </div>
        <div style={{
          background: "var(--bg-surface)", border: "0.5px solid var(--bg-border)",
          borderRadius: 12, padding: "16px 12px", textAlign: "center",
          borderTop: "3px solid #f87171", boxShadow: "var(--shadow-sm)",
        }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1, fontFamily: "'Playfair Display', Georgia, serif" }}>{hardCount}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 5, fontFamily: "'DM Mono', monospace" }}>Hard</div>
        </div>
      </div>

      {/* ── Stage Tabs ── */}
      <div style={{
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
            onClick={() => { setStage(s); setOpenPapers({}); }}
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

      {/* ── Paper Sections ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {paperOrder.map((paperId) => {
          const paper = currentPapers[paperId];
          if (!paper) return null;
          return (
            <PaperSection
              key={paperId}
              paperId={paperId}
              paper={paper}
              isOpen={!!openPapers[paperId]}
              onToggle={() => togglePaper(paperId)}
            />
          );
        })}
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