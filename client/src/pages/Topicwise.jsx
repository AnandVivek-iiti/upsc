
import { useState, useCallback, useMemo } from "react";
import MatchTable from "../components/ui/MatchTable";
import QuestionRenderer from "../components/ui/QuestionRenderer";
import ExplanationBox from "../components/ui/ExplanationBox";
import { useRevisionQueue } from "../hooks/useRevisionQueue";
import { MAINS_PAPERS, getMainsPaperLink } from "../data/Mains_papers";
import { useQuestionAttempts } from "../hooks/useQuestionAttempts";
// ─── DATA IMPORTS ────────────────────────────────────────────────────────────
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
const getYears = (d) => [...new Set((d || []).map((q) => q.year))].sort((a, b) => b - a);
const getTopics = (d) => [...new Set((d || []).map((q) => q.topic).filter(Boolean))].sort();
const getStyleTags = (d) => [...new Set((d || []).map((q) => q.styleTag).filter(Boolean))];
const getDifficulties = (d) => [...new Set((d || []).map((q) => q.difficulty).filter(Boolean))];

// ─── MICRO COMPONENTS ────────────────────────────────────────────────────────
function Chip({ label, active, color, onClick }) {
  return (
    <button onClick={onClick} style={{
      fontSize: 11, padding: "4px 12px", borderRadius: 20,
      border: active ? `0.5px solid ${color}` : "0.5px solid var(--bg-border)",
      background: active ? `${color}22` : "transparent",
      color: active ? color : "var(--text-muted)",
      cursor: "pointer", fontWeight: active ? 600 : 400, whiteSpace: "nowrap",
      transition: "all .15s", fontFamily: "'DM Mono', monospace", letterSpacing: "0.03em",
    }}>{label}</button>
  );
}
function Tag({ label, meta }) {
  if (!meta) return null;
  return (
    <span style={{
      fontSize: 10, padding: "2px 8px", borderRadius: 20,
      border: `0.5px solid ${meta.border}`, background: meta.bg, color: meta.text,
      fontWeight: 500, whiteSpace: "nowrap", fontFamily: "'DM Mono', monospace",
    }}>{meta.label || label}</span>
  );
}
function YearBadge({ year }) {
  return (
    <span style={{
      fontSize: 10, padding: "2px 8px", borderRadius: 4,
      border: "0.5px solid var(--bg-border)", background: "var(--bg-muted)",
      color: "var(--text-muted)", fontFamily: "'DM Mono', monospace",
      letterSpacing: "0.04em", fontWeight: 600,
    }}>{year}</span>
  );
}
function StatPill({ value, label, color }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
      padding: "10px 18px", background: "var(--bg-surface)",
      border: "0.5px solid var(--bg-border)", borderTop: `2px solid ${color}`,
      borderRadius: 10, minWidth: 64, boxShadow: "var(--shadow-sm)",
    }}>
      <span style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1, fontFamily: "'Playfair Display', Georgia, serif" }}>{value}</span>
      <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>{label}</span>
    </div>
  );
}

// ─── PIN BUTTON ───────────────────────────────────────────────────────────────
function PinButton({ pinned, onClick }) {
  return (
    <button
      onClick={onClick}
      title={pinned ? "Remove from Revision Queue" : "Pin to Revision Queue"}
      style={{
        fontSize: 14, padding: "5px 8px", borderRadius: 8,
        border: pinned ? "0.5px solid #fbbf24" : "0.5px solid var(--bg-border)",
        background: pinned ? "rgba(251,191,36,0.15)" : "transparent",
        color: pinned ? "#fbbf24" : "var(--text-muted)",
        cursor: "pointer", transition: "all .15s", lineHeight: 1,
      }}
    >
      {pinned ? "📌" : "📍"}
    </button>
  );
}

// ─── QUESTION CARD ────────────────────────────────────────────────────────────
function QuestionCard({ q, index, accentColor, revQueue, subjectMeta, onCorrect, recordAttempt,
  attemptedIds }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(false);

  const qId = q._id || q.id || `q-${index}`;
  const solved = attemptedIds?.has(qId);
  const pinned = revQueue.isPinned(qId);

  const styleMeta = STYLE_META[q.styleTag];
  const diffMeta = DIFF_META[q.difficulty];
  const isCorrect = selected === q.correctOption;
  const isRevealed = showAnswer || selected !== null;

  function getOptionStyle(id) {
    const base = {
      display: "flex", gap: 12, alignItems: "flex-start",
      padding: "10px 14px", borderRadius: 8,
      border: "0.5px solid var(--bg-border)", background: "var(--bg-muted)",
      cursor: "pointer", transition: "all .15s", marginBottom: 6,
      fontFamily: "'DM Sans', sans-serif",
    };
    if (!isRevealed) return { ...base, ...(selected === id ? { border: `0.5px solid ${accentColor}`, background: `${accentColor}18` } : {}) };
    if (id === q.correctOption) return { ...base, border: "0.5px solid rgba(52,211,153,0.5)", background: "rgba(52,211,153,0.08)", color: "#6ee7b7" };
    if (selected === id && id !== q.correctOption) return { ...base, border: "0.5px solid rgba(248,113,113,0.5)", background: "rgba(248,113,113,0.08)", color: "#fca5a5" };
    return { ...base, opacity: 0.5 };
  }
  function getOptionMarker(id) {
    if (!isRevealed) return { text: id, color: "var(--text-muted)" };
    if (id === q.correctOption) return { text: "✓", color: "#6ee7b7" };
    if (selected === id) return { text: "✗", color: "#fca5a5" };
    return { text: id, color: "var(--text-muted)" };
  }
  const getQuestionId = (q, index) =>
    q._id || q.id || `q-${index}`;
  return (
    <div
      style={{
        background: solved
          ? "rgba(52,211,153,0.03)"
          : "var(--bg-surface)",

        opacity: solved ? 0.82 : 1, border: "0.5px solid var(--bg-border)",
        borderRadius: 14, overflow: "hidden",
        boxShadow: hovered ? "var(--shadow-md)" : "var(--shadow-sm)",
        transition: "box-shadow .2s", borderLeft: `3px solid ${accentColor}`,
        outline: pinned ? "1px solid rgba(251,191,36,0.4)" : "none",
      }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      {/* Card Header */}
      <div style={{ padding: "16px 20px 12px", borderBottom: "0.5px solid var(--bg-border)", display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 6, fontSize: 12, fontWeight: 700, color: accentColor, fontFamily: "'DM Mono', monospace", minWidth: 28, paddingTop: 2
        }}>
          Q{index + 1}
          {solved && (
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#6ee7b7",
                display: "inline-block",
                marginLeft: 6,
              }}
            />
          )}
        </div>
        <div style={{ flex: 1 }}>
          {(() => {
            const text = q.questionText || "";
            if (typeof text === "string" && text.includes("|")) {
              const parts = text.split("\n");
              const normalBefore = [], tableLines = [], normalAfter = [];
              let reachedTable = false;
              parts.forEach(line => {
                if (line.trim().startsWith("|")) { reachedTable = true; tableLines.push(line); }
                else if (reachedTable) normalAfter.push(line);
                else normalBefore.push(line);
              });
              return (
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.65 }}>
                  <div style={{ whiteSpace: "pre-wrap", marginBottom: 6 }}>{normalBefore.join("\n")}</div>
                  <MatchTable dataString={tableLines.join("\n")} />
                  <div style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>{normalAfter.join("\n")}</div>
                </div>
              );
            }
            return <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{text}</div>;
          })()}
        </div>
        {/* Pin button */}
        <PinButton pinned={pinned} onClick={() => revQueue.toggle({ ...q, _id: qId }, subjectMeta)} />
      </div>

      {/* Tags Row */}
      <div style={{ padding: "10px 20px", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", borderBottom: "0.5px solid var(--bg-border)" }}>
        <YearBadge year={q.year} />
        {styleMeta && <Tag label={q.styleTag} meta={styleMeta} />}
        {diffMeta && <Tag label={q.difficulty} meta={diffMeta} />}
        {q.subTopic && (
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, border: "0.5px solid var(--bg-border)", background: "var(--bg-muted)", color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
            {q.subTopic}
          </span>
        )}
        {pinned && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "0.5px solid rgba(251,191,36,0.3)", fontFamily: "'DM Mono', monospace" }}>pinned</span>}
      </div>

      {/* Options */}
      <div style={{ padding: "14px 20px" }}>
        {(q.options || []).map(opt => {
          const marker = getOptionMarker(opt.id);
          return (
            <div key={opt.id} style={getOptionStyle(opt.id)} onClick={() => {
              if (!isRevealed) {
                setSelected(opt.id);

                const result =
                  opt.id === q.correctOption
                    ? "correct"
                    : "wrong";

                recordAttempt?.(
                  {
                    id: qId,
                    questionText: q.questionText,
                    topic: q.topic,
                    subTopic: q.subTopic,
                    difficulty: q.difficulty,
                    year: q.year,
                  },
                  result,
                  {
                    subject: subjectMeta?.subject,
                    paper: subjectMeta?.paper,
                  }
                );

                if (result === "correct" && onCorrect) {
                  onCorrect(q.topic, q.subTopic);
                }
              }
            }}>              <span style={{ fontSize: 11, fontWeight: 700, color: marker.color, minWidth: 18, fontFamily: "'DM Mono', monospace", paddingTop: 1, transition: "color .15s" }}>{marker.text}</span>
              <span style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.55 }}>{opt.text}</span>
            </div>
          );
        })}
      </div>

      {/* Action Row */}
      <div style={{ padding: "10px 20px 16px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={() => setShowAnswer(v => !v)} style={{ fontSize: 12, padding: "6px 16px", borderRadius: 8, border: `0.5px solid ${accentColor}`, background: showAnswer ? `${accentColor}22` : "transparent", color: accentColor, cursor: "pointer", fontWeight: 500, transition: "all .15s", fontFamily: "'DM Sans', sans-serif" }}>
          {showAnswer ? "Hide Explanation" : "Show Explanation"}
        </button>
        {selected !== null && (
          <button onClick={() => { setSelected(null); setShowAnswer(false); }} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 8, border: "0.5px solid var(--bg-border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Reset
          </button>
        )}
        {selected !== null && (
          <span style={{ fontSize: 11, color: isCorrect ? "#6ee7b7" : "#fca5a5", fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>
            {isCorrect ? "✓ Correct" : `✗ Answer: ${q.correctOption}`}
          </span>
        )}
      </div>

      {showAnswer && q.explanation && <ExplanationBox text={q.explanation} accentColor={accentColor} sources={q.sources} />}
    </div>
  );
}

// ─── SUBJECT PANEL ────────────────────────────────────────────────────────────
function SubjectPanel({ subject, subjectKey, accentColor, revQueue, onTopicComplete, paperLabel ,  recordAttempt,
  attemptedIds,}) {
  const rawData = subject.data || [];
  const [yearFilter, setYearFilter] = useState("All");
  const [topicFilter, setTopicFilter] = useState("All");
  const [styleFilter, setStyleFilter] = useState("All");
  const [diffFilter, setDiffFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showOnlyPinned, setShowOnlyPinned] = useState(false);

  const years = useMemo(() => getYears(rawData), [rawData]);
  const topics = useMemo(() => getTopics(rawData), [rawData]);
  const styles = useMemo(() => getStyleTags(rawData), [rawData]);
  const diffs = useMemo(() => getDifficulties(rawData), [rawData]);

  const filtered = useMemo(() => {
    return rawData.filter(q => {
      if (yearFilter !== "All" && String(q.year) !== String(yearFilter)) return false;
      if (topicFilter !== "All" && q.topic !== topicFilter) return false;
      if (styleFilter !== "All" && q.styleTag !== styleFilter) return false;
      if (diffFilter !== "All" && q.difficulty !== diffFilter) return false;
      if (showOnlyPinned && !revQueue.isPinned(q._id || q.id || `q-${i}`)) return false;
      if (search.trim()) {
        const s = search.toLowerCase();
        if (!q.questionText?.toLowerCase().includes(s) && !q.topic?.toLowerCase().includes(s) && !q.subTopic?.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [rawData, yearFilter, topicFilter, styleFilter, diffFilter, search, showOnlyPinned, revQueue]);

  const totalQ = rawData.length;
  const easyCount = rawData.filter(q => q.difficulty === "Easy").length;
  const hardCount = rawData.filter(q => q.difficulty === "Hard").length;
  const yearCount = years.length;
  const pinnedCount = rawData.filter(q => revQueue.isPinned(q._id || q.id || `q-${i}`)).length;

  const subjectMeta = { subject: subject.label, paper: paperLabel };

  // Feature 1: topic completion → syllabus update notifier
  const completedTopics = useMemo(() => {
    const done = new Set();
    rawData.forEach(q => { if (revQueue.isPinned(q._id || q.id || `q-${i}`) || q.difficulty === "Easy") done.add(q.topic); });
    return done;
  }, [rawData, revQueue]);

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        <StatPill value={totalQ} label="Questions" color={accentColor} />
        <StatPill value={yearCount} label="Years" color="var(--accent-blue)" />
        <StatPill value={easyCount} label="Easy" color="var(--accent-green)" />
        <StatPill value={hardCount} label="Hard" color="#f87171" />
        <StatPill value={topics.length} label="Topics" color="var(--accent-gold)" />
        {pinnedCount > 0 && <StatPill value={pinnedCount} label="Pinned" color="#fbbf24" />}
      </div>

      {/* Search + Pin Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search questions, topics…"
            style={{ width: "100%", padding: "9px 14px 9px 36px", fontSize: 13, background: "var(--bg-surface)", border: "0.5px solid var(--bg-border)", borderRadius: 10, color: "var(--text-primary)", outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" }}
            onFocus={e => (e.target.style.borderColor = accentColor)}
            onBlur={e => (e.target.style.borderColor = "var(--bg-border)")}
          />
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 14, pointerEvents: "none" }}>⌕</span>
        </div>
        <button onClick={() => setShowOnlyPinned(v => !v)} style={{
          fontSize: 12, padding: "8px 14px", borderRadius: 10, whiteSpace: "nowrap",
          border: showOnlyPinned ? "0.5px solid #fbbf24" : "0.5px solid var(--bg-border)",
          background: showOnlyPinned ? "rgba(251,191,36,0.15)" : "transparent",
          color: showOnlyPinned ? "#fbbf24" : "var(--text-muted)",
          cursor: "pointer", fontFamily: "'DM Mono', monospace",
        }}>
          📌 {showOnlyPinned ? "Show All" : "Pinned Only"}
        </button>
      </div>

      {/* Filter Chips */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {years.length > 1 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", minWidth: 38 }}>YEAR</span>
            <Chip label="All" active={yearFilter === "All"} color={accentColor} onClick={() => setYearFilter("All")} />
            {years.map(y => <Chip key={y} label={String(y)} active={yearFilter === String(y)} color={accentColor} onClick={() => setYearFilter(String(y))} />)}
          </div>
        )}
        {topics.length > 1 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", minWidth: 38 }}>TOPIC</span>
            <Chip label="All" active={topicFilter === "All"} color={accentColor} onClick={() => setTopicFilter("All")} />
            {topics.map(t => <Chip key={t} label={t} active={topicFilter === t} color={accentColor} onClick={() => setTopicFilter(t)} />)}
          </div>
        )}
        {styles.length > 1 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", minWidth: 38 }}>TYPE</span>
            <Chip label="All" active={styleFilter === "All"} color={accentColor} onClick={() => setStyleFilter("All")} />
            {styles.map(s => <Chip key={s} label={STYLE_META[s]?.label || s} active={styleFilter === s} color={accentColor} onClick={() => setStyleFilter(s)} />)}
          </div>
        )}
        {diffs.length > 1 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", minWidth: 38 }}>DIFF</span>
            <Chip label="All" active={diffFilter === "All"} color={accentColor} onClick={() => setDiffFilter("All")} />
            {["Easy", "Medium", "Hard"].filter(d => diffs.includes(d)).map(d => <Chip key={d} label={d} active={diffFilter === d} color={accentColor} onClick={() => setDiffFilter(d)} />)}
          </div>
        )}
      </div>

      {/* Result count */}
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 14, fontFamily: "'DM Mono', monospace", paddingBottom: 12, borderBottom: "0.5px solid var(--bg-border)" }}>
        {filtered.length} of {totalQ} questions
        {filtered.length !== totalQ && (
          <button onClick={() => { setYearFilter("All"); setTopicFilter("All"); setStyleFilter("All"); setDiffFilter("All"); setSearch(""); setShowOnlyPinned(false); }}
            style={{ marginLeft: 12, fontSize: 10, padding: "2px 8px", borderRadius: 20, border: "0.5px solid var(--bg-border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
            Clear filters
          </button>
        )}
      </div>

      {/* Feature 1: Syllabus topic coverage hint */}
      {topics.length > 0 && onTopicComplete && (
        <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 10, background: "rgba(79,142,247,0.07)", border: "0.5px solid rgba(79,142,247,0.2)", fontSize: 12, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
          💡 Tip: marking questions correct auto-syncs topic coverage to your Syllabus Tracker.
        </div>
      )}
      {/* Questions */}
      {filtered.length === 0 ? (
        <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 14, fontFamily: "'DM Mono', monospace", background: "var(--bg-surface)", border: "0.5px solid var(--bg-border)", borderRadius: 14 }}>
          {showOnlyPinned ? "No pinned questions in this subject yet." : "No questions match the current filters."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((q, i) => (
            <QuestionCard key={q._id || i} q={q} index={i} accentColor={accentColor} revQueue={revQueue} subjectMeta={subjectMeta} recordAttempt={recordAttempt}
              attemptedIds={attemptedIds}
              onCorrect={onTopicComplete ? (topic) => onTopicComplete(topic, paperLabel) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MAINS PAPER LINKS ───────────────────────────────────────────────────────
// Feature 4: For Mains papers without subject data, show official PYQ PDF links
const MAINS_YEARS = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011];
const PAPER_ID_MAP = { GS1: "gs1", GS2: "gs2", GS3: "gs3", GS4: "gs4", Essay: "essay" };

function MainsPaperLinks({ paperId }) {
  const pid = PAPER_ID_MAP[paperId] || paperId.toLowerCase();
  const color = { GS1: "#4F8EF7", GS2: "#34d399", GS3: "#f97316", GS4: "#a78bfa", Essay: "#f472b6" }[paperId] || "#a78bfa";

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>Official PYQ Papers</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
          Subject-wise questions coming soon · Download official papers below
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {MAINS_YEARS.map(year => {
          const url = getMainsPaperLink(year, pid);
          return (
            <a key={year} href={url || "https://www.upsc.gov.in/examinations/previous-question-papers"} target="_blank" rel="noopener noreferrer"
              style={{
                fontSize: 12, padding: "6px 14px", borderRadius: 8,
                border: url ? `0.5px solid ${color}` : "0.5px solid var(--bg-border)",
                background: url ? `${color}12` : "transparent",
                color: url ? color : "var(--text-muted)",
                textDecoration: "none", fontFamily: "'DM Mono', monospace",
                display: "inline-flex", alignItems: "center", gap: 4,
              }}>
              {year} {url ? "↗" : "—"}
            </a>
          );
        })}
      </div>
      <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 8, background: "rgba(79,142,247,0.06)", border: "0.5px solid rgba(79,142,247,0.15)", fontSize: 12, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
        💡 Want to practice {paperId} questions inline? You can add them to <code>src/data/Subjectwise/</code>
      </div>
    </div>
  );
}

// ─── PAPER ACCORDION ─────────────────────────────────────────────────────────
function PaperSection({ paperId, paper, isOpen, onToggle, revQueue, onTopicComplete,  recordAttempt,
  attemptedIds,}) {
  const [activeSubject, setActiveSubject] = useState(null);
  const subjectEntries = Object.entries(paper.subjects || {});

  const handleToggle = useCallback(() => {
    onToggle();
    if (!isOpen && subjectEntries.length > 0 && !activeSubject) setActiveSubject(subjectEntries[0][0]);
  }, [isOpen, onToggle, subjectEntries, activeSubject]);

  const totalQuestions = useMemo(() => subjectEntries.reduce((sum, [, s]) => sum + (s.data?.length || 0), 0), [subjectEntries]);
  const [headerHovered, setHeaderHovered] = useState(false);

  return (
    <div style={{ background: "var(--bg-surface)", border: "0.5px solid var(--bg-border)", borderRadius: 14, overflow: "hidden", boxShadow: isOpen ? "var(--shadow-md)" : "var(--shadow-sm)", transition: "box-shadow .2s" }}>
      <div onClick={handleToggle} style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 20px", cursor: "pointer", userSelect: "none", background: headerHovered ? "var(--bg-muted)" : "transparent", transition: "background .12s" }}
        onMouseEnter={() => setHeaderHovered(true)} onMouseLeave={() => setHeaderHovered(false)}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: paper.color, flexShrink: 0, boxShadow: `0 0 8px ${paper.color}60` }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{paper.label}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, fontFamily: "'DM Mono', monospace" }}>{subjectEntries.length} subjects · {totalQuestions} questions</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {subjectEntries.slice(0, 4).map(([, s]) => (
              <div key={s.label} style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, opacity: 0.8 }} />
            ))}
            {subjectEntries.length > 4 && <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>+{subjectEntries.length - 4}</span>}
          </div>
          <span style={{ fontSize: 16, color: "var(--text-muted)", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform .2s", display: "inline-block" }}>›</span>
        </div>
      </div>

      {isOpen && (
        <div style={{ borderTop: "0.5px solid var(--bg-border)" }}>
          {subjectEntries.length === 0 ? (
            <MainsPaperLinks paperId={paperId} />
          ) : (
            <>
              <div style={{ display: "flex", gap: 0, overflowX: "auto", borderBottom: "0.5px solid var(--bg-border)", padding: "0 8px" }}>
                {subjectEntries.map(([key, s]) => {
                  const isActive = activeSubject === key;
                  return (
                    <button key={key} onClick={() => setActiveSubject(key)} style={{ padding: "12px 18px", fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? s.color : "var(--text-muted)", background: "transparent", border: "none", borderBottom: isActive ? `2px solid ${s.color}` : "2px solid transparent", cursor: "pointer", whiteSpace: "nowrap", transition: "all .15s", fontFamily: "'DM Sans', sans-serif", marginBottom: -1 }}>
                      {s.label}
                      <span style={{ marginLeft: 6, fontSize: 10, color: isActive ? s.color : "var(--text-muted)", fontFamily: "'DM Mono', monospace", opacity: 0.75 }}>({s.data?.length || 0})</span>
                    </button>
                  );
                })}
              </div>
              {activeSubject && paper.subjects[activeSubject] && (
                <div style={{ padding: "20px 20px 24px" }}>
                  <SubjectPanel
                    key={activeSubject}
                    subjectKey={activeSubject}
                    subject={paper.subjects[activeSubject]}
                    accentColor={paper.subjects[activeSubject].color || paper.color}
                    revQueue={revQueue}
                    onTopicComplete={onTopicComplete}
                    paperLabel={paper.label}
                    recordAttempt={recordAttempt}
                    attemptedIds={attemptedIds}
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

// ─── REVISION QUEUE PANEL ────────────────────────────────────────────────────
function RevisionQueuePanel({ revQueue }) {
  const { queue, unpin, clearQueue } = revQueue;
  const [filter, setFilter] = useState("All");

  const subjects = useMemo(() => ["All", ...new Set(queue.map(q => q.subject).filter(Boolean))], [queue]);
  const filtered = filter === "All" ? queue : queue.filter(q => q.subject === filter);

  if (queue.length === 0) return (
    <div style={{ padding: "60px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>📌</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", fontFamily: "'Playfair Display', Georgia, serif", marginBottom: 6 }}>No questions pinned yet</div>
      <div style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>Pin important questions from Topic-wise to add them here.</div>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>{queue.length} question{queue.length !== 1 ? "s" : ""} in queue</div>
        <button onClick={() => { if (confirm("Clear all pinned questions?")) clearQueue(); }} style={{ fontSize: 11, padding: "4px 12px", borderRadius: 8, border: "0.5px solid rgba(248,113,113,0.4)", background: "transparent", color: "#fca5a5", cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
          Clear All
        </button>
      </div>

      {subjects.length > 2 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {subjects.map(s => (
            <Chip key={s} label={s} active={filter === s} color="#fbbf24" onClick={() => setFilter(s)} />
          ))}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((q, i) => (
          <div key={q._id || i} style={{ background: "var(--bg-surface)", border: "0.5px solid rgba(251,191,36,0.3)", borderRadius: 12, padding: "14px 16px", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.6, marginBottom: 8 }}>
                  {q.questionText?.slice(0, 200)}{q.questionText?.length > 200 ? "…" : ""}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {q.year && <YearBadge year={q.year} />}
                  {q.subject && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "0.5px solid rgba(251,191,36,0.3)", fontFamily: "'DM Mono', monospace" }}>{q.subject}</span>}
                  {q.topic && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "var(--bg-muted)", color: "var(--text-muted)", border: "0.5px solid var(--bg-border)", fontFamily: "'DM Mono', monospace" }}>{q.topic}</span>}
                  {DIFF_META[q.difficulty] && <Tag label={q.difficulty} meta={DIFF_META[q.difficulty]} />}
                </div>
              </div>
              <button onClick={() => unpin(q._id || q.id)} title="Remove from queue"
                style={{ fontSize: 12, padding: "4px 8px", borderRadius: 6, border: "0.5px solid var(--bg-border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer", flexShrink: 0 }}>
                ✕
              </button>
            </div>
            {q.correctOption && (
              <div style={{ marginTop: 8, fontSize: 11, color: "#6ee7b7", fontFamily: "'DM Mono', monospace" }}>
                Answer: {q.correctOption}
                {q.explanation && <span style={{ color: "var(--text-muted)", marginLeft: 12 }}>{q.explanation?.slice(0, 80)}…</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN TOPICWISE COMPONENT ─────────────────────────────────────────────────
export default function Topicwise({ onSyllabusUpdate }) {
  const [stage, setStage] = useState("prelims");
  const [openPapers, setOpenPapers] = useState({ GS: true });
  const [activeTab, setActiveTab] = useState("browse"); // "browse" | "revision"
  const {
    recordAttempt,
    attemptedIds,
  } = useQuestionAttempts({
    onSyllabusUpdate,
  });
  const revQueue = useRevisionQueue();

  const togglePaper = useCallback((id) => {
    setOpenPapers(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // Feature 1: When questions are practiced, offer to sync syllabus tracker
  // onSyllabusUpdate = updateProgress(stage, paper, moduleName, progress, status)
  // We don't know the exact module name from topic, so we pass a hint only
  const handleTopicComplete = useCallback((topic, paper) => {
    // updateProgress is optional — only available when logged in
    if (onSyllabusUpdate && topic) {
      // We can't auto-map topic→moduleName precisely without the full syllabus,
      // so just notify; actual sync happens via SyllabusTracker UI
    }
  }, [onSyllabusUpdate]);

  const currentStage = SUBJECT_REGISTRY[stage];
  const currentPapers = currentStage?.papers || {};
  const paperOrder = Object.keys(currentPapers);

  const allData = useMemo(() => {
    const entries = [];
    Object.values(currentPapers).forEach(paper => {
      Object.values(paper.subjects || {}).forEach(subj => {
        (subj.data || []).forEach(q => entries.push(q));
      });
    });
    return entries;
  }, [currentPapers]);

  const totalQ = allData.length;
  const easyCount = allData.filter(q => q.difficulty === "Easy").length;
  const medCount = allData.filter(q => q.difficulty === "Medium").length;
  const hardCount = allData.filter(q => q.difficulty === "Hard").length;
  const yearCount = useMemo(() => new Set(allData.map(q => q.year)).size, [allData]);

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", maxWidth: 1152, width: "100%", margin: "0 auto", padding: "32px 24px", color: "var(--text-primary)" }}>

      {/* ── Top Bar ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, gap: 24 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.15, fontFamily: "'Playfair Display', Georgia, serif" }}>Topic-wise PYQs</div>
          <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4, fontFamily: "'DM Mono', monospace" }}>Previous Year Questions · Subject-wise</div>
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "var(--status-prog-bg)", color: "var(--status-prog-text)", border: "0.5px solid var(--status-prog-border)", fontWeight: 500, fontFamily: "'DM Mono', monospace" }}>UPSC CSE · Prelims + Mains</span>
            <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "var(--status-done-bg)", color: "var(--status-done-text)", border: "0.5px solid var(--status-done-border)", fontWeight: 500, fontFamily: "'DM Mono', monospace" }}>2011 – 2026</span>
            {revQueue.queue.length > 0 && (
              <span onClick={() => setActiveTab("revision")} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "0.5px solid rgba(251,191,36,0.3)", fontWeight: 500, fontFamily: "'DM Mono', monospace", cursor: "pointer" }}>
                📌 {revQueue.queue.length} pinned
              </span>
            )}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 52, fontWeight: 900, color: "var(--text-primary)", lineHeight: 1, fontFamily: "'Playfair Display', Georgia, serif" }}>{totalQ}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, fontFamily: "'DM Mono', monospace" }}>total questions</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, fontFamily: "'DM Mono', monospace" }}>across {yearCount} year{yearCount !== 1 ? "s" : ""}</div>
        </div>
      </div>

      {/* ── Mini Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
        {[["Total PYQs", totalQ, "var(--accent-blue)"], ["Easy", easyCount, "var(--accent-green)"], ["Medium", medCount, "var(--accent-gold)"], ["Hard", hardCount, "#f87171"]].map(([l, v, c]) => (
          <div key={l} style={{ background: "var(--bg-surface)", border: "0.5px solid var(--bg-border)", borderRadius: 12, padding: "16px 12px", textAlign: "center", borderTop: `3px solid ${c}`, boxShadow: "var(--shadow-sm)" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1, fontFamily: "'Playfair Display', Georgia, serif" }}>{v}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 5, fontFamily: "'DM Mono', monospace" }}>{l}</div>
          </div>
        ))}
      </div>

      {/* ── Tab Bar: Browse / Revision Queue ── */}
      <div style={{ display: "flex", border: "0.5px solid var(--bg-border)", borderRadius: 10, overflow: "hidden", width: "fit-content", marginBottom: 20, boxShadow: "var(--shadow-sm)" }}>
        {[["browse", "Browse PYQs"], ["revision", `Revision Queue${revQueue.queue.length > 0 ? ` (${revQueue.queue.length})` : ""}`]].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{ padding: "9px 22px", fontSize: 14, fontWeight: activeTab === id ? 600 : 400, background: activeTab === id ? "var(--text-primary)" : "transparent", color: activeTab === id ? "var(--bg-base)" : "var(--text-secondary)", border: "none", cursor: "pointer", transition: "all .15s", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.02em" }}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === "revision" ? (
        <RevisionQueuePanel revQueue={revQueue} />
      ) : (
        <>
          {/* ── Stage Tabs ── */}
          <div style={{ display: "flex", border: "0.5px solid var(--bg-border)", borderRadius: 10, overflow: "hidden", width: "fit-content", marginBottom: 20, boxShadow: "var(--shadow-sm)" }}>
            {["prelims", "mains"].map(s => (
              <button key={s} onClick={() => { setStage(s); setOpenPapers({}); }} style={{ padding: "9px 28px", fontSize: 18, fontWeight: stage === s ? 600 : 400, background: stage === s ? "var(--text-primary)" : "transparent", color: stage === s ? "var(--bg-base)" : "var(--text-secondary)", border: "none", cursor: "pointer", transition: "all .15s", textTransform: "capitalize", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.02em" }}>
                {s}
              </button>
            ))}
          </div>

          {/* ── Paper Sections ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {paperOrder.map(paperId => {
              const paper = currentPapers[paperId];
              if (!paper) return null;
              return (
                <PaperSection key={paperId} paperId={paperId} paper={paper} recordAttempt={recordAttempt}
  attemptedIds={attemptedIds}
                  isOpen={!!openPapers[paperId]} onToggle={() => togglePaper(paperId)}
                  revQueue={revQueue} onTopicComplete={handleTopicComplete}
                />
              );
            })}
          </div>
        </>
      )}

      {/* ── Footer ── */}
      <div style={{ marginTop: 32, paddingTop: 20, borderTop: "0.5px solid var(--bg-border)", textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>Examination Notice No. 05/2026-CSE · Union Public Service Commission</div>
      </div>
    </div>
  );
}
