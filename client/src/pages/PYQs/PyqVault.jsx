import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Archive, Link2, Sparkles, BookOpen, Library, PenSquare } from "lucide-react";
import { useRevisionQueue } from "../../hooks/useRevisionQueue";
import { useQuestionAttempts } from "../../hooks/useQuestionAttempts";
import ResourceLibrary from "../User/ResourceLibrary";
import AddCustomQuestion from "../../components/QuestionStats";
import AIMentorChat from "../AI/AIMentorChat";
import { explainPrelimQuestion } from "../../hooks/useAI";

// ─── MAINS DATA IMPORTS ─────────────────────────────────────────────────────────
import mainsGS1Data from "../../data/Subjectwise/mains/2025/GS1";
import mainsGS2Data from "../../data/Subjectwise/mains/2025/GS2";
import mainsGS3Data from "../../data/Subjectwise/mains/2025/GS3";
import mainsGS4Data from "../../data/Subjectwise/mains/2025/GS4";
import mainsGS1Data24 from "../../data/Subjectwise/mains/2024/GS1";
import mainsGS2Data24 from "../../data/Subjectwise/mains/2024/GS2";
import mainsGS3Data24 from "../../data/Subjectwise/mains/2024/GS3";
import mainsGS4Data24 from "../../data/Subjectwise/mains/2024/GS4";

// ─── PRELIMS DATA IMPORTS ─────────────────────────────────────────────────────
import reasoningCSATData    from "../../data/Subjectwise/pre/CSAT/reasoningCSATData";
import ComprehensionPYQData from "../../data/Subjectwise/pre/CSAT/ComprehensionPYQData";
import MathsData            from "../../data/Subjectwise/pre/CSAT/Maths";
import HistoryData          from "../../data/Subjectwise/pre/GS/History";
import ModernHistoryData    from "../../data/Subjectwise/pre/GS/Modernhistory";
import PolityData           from "../../data/Subjectwise/pre/GS/Polity";
import EconomyData          from "../../data/Subjectwise/pre/GS/Economy";
import GeographyData        from "../../data/Subjectwise/pre/GS/Geography";
import EnvEcologyData       from "../../data/Subjectwise/pre/GS/envEcology";
import SciTechData          from "../../data/Subjectwise/pre/GS/scienceTechnologyPYQData";
import ArtCultureData       from "../../data/Subjectwise/pre/GS/artCulturePYQData";
import SocialIssuesData     from "../../data/Subjectwise/pre/GS/Socialissues";
import IRYData              from "../../data/Subjectwise/pre/GS/irypyq";

// ─── OFFICIAL PDF LINK HELPERS ──────────────────────────────────────────────
import {
  getMainsPaperLink,
  MAINS_LAST_VERIFIED_DATE,
} from "../../data/PYQs/Mains_papers";
import {
  getPrelimsPaperLink,
  PRELIMS_LAST_VERIFIED_DATE,
} from "../../data/PYQs/Prelims_paper";

// ─── UTILITIES ────────────────────────────────────────────────────────────────
const combineData = (...arrays) => arrays.flat().filter(Boolean);
const getYears = d => [...new Set((d || []).map(q => q.year))].sort((a, b) => b - a);
const getTopics = d => [...new Set((d || []).map(q => q.topic).filter(Boolean))].sort();
const getMarksOptions = d => [...new Set((d || []).map(q => q.marks).filter(Boolean))].sort((a, b) => b - a);
const getDirectives = d => [...new Set((d || []).map(q => q.directive).filter(Boolean))].sort();
const getStyleTags = d => [...new Set((d || []).map(q => q.styleTag).filter(Boolean))];
const getDifficulties = d => [...new Set((d || []).map(q => q.difficulty).filter(Boolean))];

// ─── COMBINE MAINS DATA ──────────────────────────────────────────────────────
const allGS1 = combineData(mainsGS1Data, mainsGS1Data24);
const allGS2 = combineData(mainsGS2Data, mainsGS2Data24);
const allGS3 = combineData(mainsGS3Data, mainsGS3Data24);
const allGS4 = combineData(mainsGS4Data24, mainsGS4Data);

// ─── SUBJECT COLOR MAPS (MAINS) ──────────────────────────────────────────────
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

// ─── PRELIMS PAPERS DEFINITION ──────────────────────────────────────────────
const PRELIMS_PAPERS = {
  GS: {
    label: "GS Paper I",
    color: "#4F8EF7",
    subjects: {
      History:       { label: "Ancient & Medieval History", data: HistoryData,        color: "#c084fc" },
      ModernHistory: { label: "Modern History",             data: ModernHistoryData,  color: "#f472b6" },
      Polity:        { label: "Polity & Governance",        data: PolityData,         color: "#4F8EF7" },
      Economy:       { label: "Economy",                    data: EconomyData,        color: "#34d399" },
      Geography:     { label: "Geography",                  data: GeographyData,      color: "#60a5fa" },
      EnvEcology:    { label: "Environment & Ecology",      data: EnvEcologyData,     color: "#6ee7b7" },
      SciTech:       { label: "Science & Technology",       data: SciTechData,        color: "#f9a8d4" },
      ArtCulture:    { label: "Art & Culture",              data: ArtCultureData,     color: "#fcd34d" },
      SocialIssues:  { label: "Social Issues",              data: SocialIssuesData,   color: "#fb923c" },
      IRY:           { label: "IR & Current Affairs",       data: IRYData,            color: "#a78bfa" },
    },
  },
  CSAT: {
    label: "CSAT Paper II",
    color: "#f97316",
    subjects: {
      Reasoning:     { label: "Logical Reasoning",     data: reasoningCSATData,    color: "#f97316" },
      Comprehension: { label: "Reading Comprehension", data: ComprehensionPYQData, color: "#fb923c" },
      Maths:         { label: "Quantitative Aptitude", data: MathsData,            color: "#fbbf24" },
    },
  },
};

// ─── STYLE / DIFF META ──────────────────────────────────────────────────────
const STYLE_META = {
  analytical_reasoning: { label: "Analytical", bg: "rgba(79,142,247,0.12)",  text: "#93c5fd", border: "rgba(79,142,247,0.3)"  },
  syllogism_logic:      { label: "Syllogism",  bg: "rgba(167,139,250,0.12)", text: "#c4b5fd", border: "rgba(167,139,250,0.3)" },
  critical_reasoning:   { label: "Critical",   bg: "rgba(52,211,153,0.12)",  text: "#6ee7b7", border: "rgba(52,211,153,0.3)"  },
  series_coding:        { label: "Series/Code",bg: "rgba(251,191,36,0.12)",  text: "#fcd34d", border: "rgba(251,191,36,0.3)"  },
};
const DIFF_META = {
  Easy:   { bg: "rgba(52,211,153,0.12)",  text: "#6ee7b7", border: "rgba(52,211,153,0.3)"  },
  Medium: { bg: "rgba(251,191,36,0.12)",  text: "#fcd34d", border: "rgba(251,191,36,0.3)"  },
  Hard:   { bg: "rgba(248,113,113,0.12)", text: "#fca5a5", border: "rgba(248,113,113,0.3)" },
};

// ─── CONSTANTS FOR GRIND COMPONENTS ──────────────────────────────────────────
const PRELIMS_PAPER_OPTIONS = [
  { id: "paper-i", label: "GS Paper I (General Studies)" },
  { id: "paper-ii", label: "CSAT Paper II (Aptitude)" },
];
const MAINS_PAPER_OPTIONS = [
  { id: "essay", label: "Essay" },
  { id: "gs1", label: "GS I" },
  { id: "gs2", label: "GS II" },
  { id: "gs3", label: "GS III" },
  { id: "gs4", label: "GS IV" },
  { id: "optional-i", label: "Optional I" },
  { id: "optional-ii", label: "Optional II" },
  { id: "language-i", label: "Hindi (Qualifying)" },
  { id: "language-ii", label: "English (Qualifying)" },
];

const PYQ_CARDS = [
  { year: 2026, chip: "Current Cycle" },
  { year: 2025, chip: "Latest" },
  { year: 2024, chip: "Latest" },
  { year: 2023, chip: "Recent" },
  { year: 2022, chip: "Paper Set" },
  { year: 2021, chip: "Archive" },
  { year: 2020, chip: "Bundle" },
  { year: 2019, chip: "Classic" },
  { year: 2018, chip: "Classic" },
  { year: 2017, chip: "Classic" },
  { year: 2016, chip: "Classic" },
  { year: 2015, chip: "Classic" },
  { year: 2014, chip: "Old Set" },
  { year: 2013, chip: "Old Set" },
  { year: 2012, chip: "Old Set" },
  { year: 2011, chip: "Old Set" },
  { year: 2010, chip: "Old Set" },
  { year: 2009, chip: "Legacy" },
  { year: 2008, chip: "Legacy" },
  { year: 2007, chip: "Legacy" },
  { year: 2006, chip: "Legacy" },
  { year: 2005, chip: "Legacy" },
];

const YEAR_FILTERS = [
  { id: "all", label: "All Years" },
  { id: "latest", label: "Latest 5" },
  { id: "2015", label: "2015-2019" },
  { id: "2010", label: "2010-2014" },
  { id: "2005", label: "2005-2009" },
];

const STORAGE_PREFIX = "upsc-pyqvault-links:";

// ─── MICRO COMPONENTS ─────────────────────────────────────────────────────────
function Chip({ label, active, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full border text-xs font-mono whitespace-nowrap transition ${
        active
          ? "border-accent-gold bg-accent-gold/10 text-accent-gold"
          : "border-bg-border bg-transparent text-text-muted hover:border-accent-gold/20 hover:text-text-primary"
      }`}
      style={active ? { borderColor: color } : {}}
    >
      {label}
    </button>
  );
}

function Tag({ label, meta }) {
  if (!meta) return null;
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium whitespace-nowrap"
      style={{
        border: `0.5px solid ${meta.border}`,
        background: meta.bg,
        color: meta.text,
      }}
    >
      {meta.label || label}
    </span>
  );
}

function YearBadge({ year }) {
  return (
    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-bg-muted border border-bg-border text-text-muted">
      {year}
    </span>
  );
}

function StatCard({ value, label, color }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 p-3 bg-bg-surface border border-bg-border rounded-xl shadow-sm" style={{ borderTopColor: color, borderTopWidth: 3 }}>
      <span className="text-2xl font-bold text-text-primary font-display leading-none">{value}</span>
      <span className="text-[10px] text-text-muted font-mono text-center">{label}</span>
    </div>
  );
}

function PinButton({ pinned, onClick }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`w-8 h-8 rounded flex items-center justify-center transition ${
        pinned ? "bg-yellow-500/15 border border-yellow-500 text-yellow-500" : "border border-bg-border bg-transparent text-text-muted hover:border-accent-gold/30"
      }`}
    >
      {pinned ? "📌" : "📍"}
    </button>
  );
}

function FilterPanel({ children, accentColor, count, total }) {
  const [open, setOpen] = useState(false);
  const isFiltered = count !== total;
  return (
    <div className="mb-3">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-2 w-full px-3 py-2 min-h-[40px] bg-bg-surface border rounded-t-md text-xs font-mono font-semibold transition ${
          isFiltered ? "border-accent-gold/40 text-accent-gold" : "border-bg-border text-text-muted"
        }`}
      >
        <span>⊞</span>
        <span>FILTERS {isFiltered ? `· ${count}/${total}` : ""}</span>
        <span className={`ml-auto transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}>▾</span>
      </button>
      {open && (
        <div className="border border-bg-border border-t-0 rounded-b-md p-3 bg-bg-muted flex flex-col gap-2">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── MAINS QUESTION CARD ──────────────────────────────────────────────────────────
function MainsQuestionCard({ q, index, accentColor, paper, isLoggedIn }) {
  return (
    <div className="border border-bg-border rounded-xl p-3 bg-bg-surface">
      <div className="flex justify-between items-start">
        <div className="font-semibold" style={{ color: accentColor }}>Q{index+1}</div>
        <span className="text-xs text-text-muted">{q.marks} marks · {q.directive || "—"}</span>
      </div>
      <div className="mt-1.5 text-sm leading-relaxed text-text-primary">{q.questionText}</div>
      {q.idealAnswer && (
        <details className="mt-2">
          <summary className="text-xs cursor-pointer" style={{ color: accentColor }}>💡 Model answer hint</summary>
          <div className="text-xs text-text-secondary mt-1 p-2 bg-bg-muted rounded">{q.idealAnswer}</div>
        </details>
      )}
    </div>
  );
}

// ─── AI EXPLANATION HOOK ──────────────────────────────────────────────────────
function useAIExplanation(q, enabled) {
  const [aiExplanation, setAiExplanation] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!enabled || fetchedRef.current) return;
    fetchedRef.current = true;
    setAiLoading(true);
    setAiError(false);

    explainPrelimQuestion({
      questionText: q.questionText,
      options: q.options || [],
      correctOption: q.correctOption,
      explanation: q.explanation || "",
    })
      .then(data => {
        const text = data?.explanation?.trim();
        if (text && text.length > 20) {
          setAiExplanation(text);
        } else {
          setAiError(true);
        }
      })
      .catch(() => setAiError(true))
      .finally(() => setAiLoading(false));
  }, [enabled, q]);

  return { aiExplanation, aiLoading, aiError };
}

// ─── PRELIMS QUESTION CARD ──────────────────────────────────────────────────────────
function PrelimQuestionCard({ q, index, accentColor, revQueue, subjectMeta, onCorrect, recordAttempt, attemptedIds }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selected, setSelected] = useState(null);

  const qId = q._id || q.id || `q-${index}`;
  const solved = attemptedIds?.has(qId);
  const pinned = revQueue.isPinned(qId);

  // Fetch AI explanation only once the user first opens the panel
  const { aiExplanation, aiLoading, aiError } = useAIExplanation(q, showAnswer);

  const styleMeta = STYLE_META[q.styleTag];
  const diffMeta = DIFF_META[q.difficulty];
  const isCorrect = selected === q.correctOption;
  const isRevealed = showAnswer || selected !== null;

  function optStyle(id) {
    if (!isRevealed) {
      return selected === id ? { background: `${accentColor}18`, borderColor: accentColor } : {};
    }
    if (id === q.correctOption) return { background: "rgba(52,211,153,0.08)", borderColor: "rgba(52,211,153,0.5)", color: "#6ee7b7" };
    if (selected === id) return { background: "rgba(248,113,113,0.08)", borderColor: "rgba(248,113,113,0.5)", color: "#fca5a5" };
    return { opacity: 0.45 };
  }

  function marker(id) {
    if (!isRevealed) return { text: id, color: "var(--text-muted)" };
    if (id === q.correctOption) return { text: "✓", color: "#6ee7b7" };
    if (selected === id) return { text: "✗", color: "#fca5a5" };
    return { text: id, color: "var(--text-muted)" };
  }

  return (
    <div className={`border-l-[3px] rounded-xl overflow-hidden border border-bg-border bg-bg-surface shadow-sm ${pinned ? "ring-1 ring-yellow-500/40" : ""}`} style={{ borderLeftColor: accentColor }}>
      <div className="p-4 border-b border-bg-border flex items-start gap-2.5">
        <div className="text-xs font-bold font-mono flex items-center gap-1" style={{ color: accentColor }}>
          Q{index+1}
          {solved && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />}
        </div>
        <div className="text-sm font-medium text-text-primary flex-1">{q.questionText}</div>
        <PinButton pinned={pinned} onClick={() => revQueue.toggle({ ...q, _id: qId }, subjectMeta)} />
      </div>
      <div className="px-4 py-2 flex flex-wrap gap-1 items-center border-b border-bg-border">
        <YearBadge year={q.year} />
        {styleMeta && <Tag label={q.styleTag} meta={styleMeta} />}
        {diffMeta && <Tag label={q.difficulty} meta={diffMeta} />}
        {q.subTopic && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono border border-bg-border bg-bg-muted text-text-muted max-w-[150px] truncate" title={q.subTopic}>
            {q.subTopic}
          </span>
        )}
      </div>
      <div className="px-4 pt-3 pb-1">
        {(q.options || []).map(opt => {
          const m = marker(opt.id);
          return (
            <div
              key={opt.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-bg-border mb-1.5 cursor-pointer transition hover:bg-bg-muted/30"
              style={optStyle(opt.id)}
              onClick={() => {
                if (isRevealed) return;
                setSelected(opt.id);
                const result = opt.id === q.correctOption ? "correct" : "wrong";
                recordAttempt?.(
                  { id: qId, questionText: q.questionText, topic: q.topic, subTopic: q.subTopic, difficulty: q.difficulty, year: q.year },
                  result,
                  { subject: subjectMeta?.subject, paper: subjectMeta?.paper }
                );
                if (result === "correct" && onCorrect) onCorrect(q.topic, q.subTopic);
              }}
            >
              <span className="text-xs font-bold font-mono min-w-[18px]" style={{ color: m.color }}>{m.text}</span>
              <span className="text-sm leading-relaxed flex-1" style={{ color: "inherit" }}>{opt.text}</span>
            </div>
          );
        })}
      </div>
      <div className="px-4 py-3 flex flex-wrap gap-2 items-center">
        <button
          onClick={() => setShowAnswer(v => !v)}
          className={`px-4 py-2 rounded-lg text-xs font-medium border transition ${
            showAnswer ? "border-accent-gold bg-accent-gold/10 text-accent-gold" : "border-accent-gold bg-transparent text-accent-gold hover:bg-accent-gold/5"
          }`}
        >
          {showAnswer ? "Hide Explanation" : "Show Explanation"}
        </button>
        {selected !== null && (
          <button
            onClick={() => { setSelected(null); setShowAnswer(false); }}
            className="px-3 py-2 rounded-lg text-xs border border-bg-border bg-transparent text-text-muted hover:border-accent-gold/30"
          >
            Reset
          </button>
        )}
        {selected !== null && (
          <span className={`text-xs font-mono font-semibold ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
            {isCorrect ? "✓ Correct" : `✗ Ans: ${q.correctOption}`}
          </span>
        )}
      </div>
      {showAnswer && (
        <div className="px-4 pb-3">
          {aiLoading ? (
            <div className="flex items-center gap-2 text-xs text-text-muted font-mono p-3 bg-bg-muted rounded-lg">
              <span className="inline-block w-3 h-3 rounded-full border-2 border-accent-gold border-t-transparent animate-spin" />
              Generating explanation…
            </div>
          ) : aiExplanation ? (
            <div className="text-sm bg-bg-muted p-3 rounded-lg text-text-secondary leading-relaxed">
              {aiExplanation}
            </div>
          ) : aiError && q.explanation ? (
            /* silent static fallback — only shown when AI fails and static text exists */
            <div className="text-sm bg-bg-muted p-3 rounded-lg text-text-secondary leading-relaxed">
              {q.explanation}
            </div>
          ) : aiError ? (
            <div className="text-xs text-text-muted font-mono p-3 bg-bg-muted rounded-lg">
              Explanation unavailable right now.
            </div>
          ) : null}
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

  const clearAll = () => { setYearFilter("All"); setTopicFilter("All"); setMarksFilter("All"); setDirectiveFilter("All"); setSearch(""); };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4">
        <StatCard value={rawData.length} label="Questions" color={accentColor} />
        <StatCard value={topics.length} label="Topics" color="var(--accent-gold)" />
        <StatCard value={rawData.filter(q => q.marks === 15).length} label="15-Mark" color="#fcd34d" />
        <StatCard value={rawData.filter(q => q.marks === 10).length} label="10-Mark" color="#93c5fd" />
      </div>
      <div className="relative mb-3">
        <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions, topics…" className="w-full px-4 py-2.5 pl-9 text-sm bg-bg-surface border border-bg-border rounded-xl text-text-primary outline-none focus:border-accent-gold/50 transition font-sans" />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm pointer-events-none">⌕</span>
      </div>
      <FilterPanel accentColor={accentColor} count={filtered.length} total={rawData.length}>
        {years.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted font-mono w-10 flex-shrink-0">YEAR</span>
            <div className="flex gap-1 overflow-x-auto scrollbar-hide flex-1">
              <Chip label="All" active={yearFilter === "All"} color={accentColor} onClick={() => setYearFilter("All")} />
              {years.map(y => <Chip key={y} label={String(y)} active={yearFilter === String(y)} color={accentColor} onClick={() => setYearFilter(String(y))} />)}
            </div>
          </div>
        )}
        {topics.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted font-mono w-10 flex-shrink-0">TOPIC</span>
            <div className="flex gap-1 overflow-x-auto scrollbar-hide flex-1">
              <Chip label="All" active={topicFilter === "All"} color={accentColor} onClick={() => setTopicFilter("All")} />
              {topics.map(t => <Chip key={t} label={t} active={topicFilter === t} color={accentColor} onClick={() => setTopicFilter(t)} />)}
            </div>
          </div>
        )}
        {marksOpts.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted font-mono w-10 flex-shrink-0">MARKS</span>
            <div className="flex gap-1 overflow-x-auto scrollbar-hide flex-1">
              <Chip label="All" active={marksFilter === "All"} color={accentColor} onClick={() => setMarksFilter("All")} />
              {marksOpts.map(m => <Chip key={m} label={`${m}M`} active={marksFilter === String(m)} color={accentColor} onClick={() => setMarksFilter(String(m))} />)}
            </div>
          </div>
        )}
        {directives.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted font-mono w-10 flex-shrink-0">STYLE</span>
            <div className="flex gap-1 overflow-x-auto scrollbar-hide flex-1">
              <Chip label="All" active={directiveFilter === "All"} color={accentColor} onClick={() => setDirectiveFilter("All")} />
              {directives.map(d => <Chip key={d} label={d} active={directiveFilter === d} color={accentColor} onClick={() => setDirectiveFilter(d)} />)}
            </div>
          </div>
        )}
        {filtered.length !== rawData.length && <button onClick={clearAll} className="self-start text-[10px] px-3 py-1 rounded-full border border-bg-border bg-transparent text-text-muted hover:border-accent-gold/30 font-mono">Clear filters</button>}
      </FilterPanel>
      <div className="text-xs text-text-muted font-mono mb-3 pb-2 border-b border-bg-border">{filtered.length} of {rawData.length} questions</div>
      <div className="space-y-3">
        {filtered.map((q, i) => {
          const qId = q._id || q.id || `mq-${i}`;
          return <MainsQuestionCard key={qId} q={q} index={i} accentColor={accentColor} paper={paperLabel} isLoggedIn={isLoggedIn} />;
        })}
      </div>
    </div>
  );
}

// ─── PRELIMS SUBJECT PANEL ──────────────────────────────────────────────────
function PrelimSubjectPanel({ subject, subjectKey, accentColor, revQueue, onTopicComplete, paperLabel, recordAttempt, attemptedIds }) {
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
    if (search.trim()) {
      const s = search.toLowerCase();
      if (!q.questionText?.toLowerCase().includes(s) && !q.topic?.toLowerCase().includes(s) && !q.subTopic?.toLowerCase().includes(s)) return false;
    }
    return true;
  }), [rawData, yearFilter, topicFilter, styleFilter, diffFilter, search, pinnedOnly, revQueue]);

  const subjectMeta = { subject: subject.label, paper: paperLabel };
  const pinnedCount = rawData.filter((q, i) => revQueue.isPinned(q._id || q.id || `q-${i}`)).length;
  const clearAll = () => { setYearFilter("All"); setTopicFilter("All"); setStyleFilter("All"); setDiffFilter("All"); setSearch(""); setPinnedOnly(false); };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4">
        <StatCard value={rawData.length} label="Questions" color={accentColor} />
        <StatCard value={years.length} label="Years" color="var(--accent-blue)" />
        <StatCard value={rawData.filter(q => q.difficulty === "Easy").length} label="Easy" color="var(--accent-green)" />
        <StatCard value={rawData.filter(q => q.difficulty === "Hard").length} label="Hard" color="#f87171" />
      </div>
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions…" className="w-full px-4 py-2.5 pl-9 text-sm bg-bg-surface border border-bg-border rounded-xl text-text-primary outline-none focus:border-accent-gold/50 transition font-sans" />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm pointer-events-none">⌕</span>
        </div>
        <button onClick={() => setPinnedOnly(v => !v)} className={`px-3 min-h-[42px] rounded-xl border text-xs font-mono transition ${
          pinnedOnly ? "border-yellow-500 bg-yellow-500/15 text-yellow-500" : "border-bg-border bg-transparent text-text-muted hover:border-accent-gold/30"
        }`}>
          📌{pinnedCount > 0 ? ` ${pinnedCount}` : ""}
        </button>
      </div>
      <FilterPanel accentColor={accentColor} count={filtered.length} total={rawData.length}>
        {years.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted font-mono w-10 flex-shrink-0">YEAR</span>
            <div className="flex gap-1 overflow-x-auto scrollbar-hide flex-1">
              <Chip label="All" active={yearFilter === "All"} color={accentColor} onClick={() => setYearFilter("All")} />
              {years.map(y => <Chip key={y} label={String(y)} active={yearFilter === String(y)} color={accentColor} onClick={() => setYearFilter(String(y))} />)}
            </div>
          </div>
        )}
        {topics.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted font-mono w-10 flex-shrink-0">TOPIC</span>
            <div className="flex gap-1 overflow-x-auto scrollbar-hide flex-1">
              <Chip label="All" active={topicFilter === "All"} color={accentColor} onClick={() => setTopicFilter("All")} />
              {topics.map(t => <Chip key={t} label={t} active={topicFilter === t} color={accentColor} onClick={() => setTopicFilter(t)} />)}
            </div>
          </div>
        )}
        {styles.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted font-mono w-10 flex-shrink-0">TYPE</span>
            <div className="flex gap-1 overflow-x-auto scrollbar-hide flex-1">
              <Chip label="All" active={styleFilter === "All"} color={accentColor} onClick={() => setStyleFilter("All")} />
              {styles.map(s => <Chip key={s} label={STYLE_META[s]?.label || s} active={styleFilter === s} color={accentColor} onClick={() => setStyleFilter(s)} />)}
            </div>
          </div>
        )}
        {diffs.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted font-mono w-10 flex-shrink-0">DIFF</span>
            <div className="flex gap-1 overflow-x-auto scrollbar-hide flex-1">
              <Chip label="All" active={diffFilter === "All"} color={accentColor} onClick={() => setDiffFilter("All")} />
              {["Easy","Medium","Hard"].filter(d => diffs.includes(d)).map(d => <Chip key={d} label={d} active={diffFilter === d} color={accentColor} onClick={() => setDiffFilter(d)} />)}
            </div>
          </div>
        )}
        {(filtered.length !== rawData.length || pinnedOnly) && <button onClick={clearAll} className="self-start text-[10px] px-3 py-1 rounded-full border border-bg-border bg-transparent text-text-muted hover:border-accent-gold/30 font-mono">Clear filters</button>}
      </FilterPanel>
      <div className="text-xs text-text-muted font-mono mb-3 pb-2 border-b border-bg-border">{filtered.length} of {rawData.length} questions</div>
      <div className="space-y-3">
        {filtered.map((q, i) => (
          <PrelimQuestionCard
            key={q._id || i} q={q} index={i} accentColor={accentColor}
            revQueue={revQueue} subjectMeta={subjectMeta}
            recordAttempt={recordAttempt} attemptedIds={attemptedIds}
            onCorrect={onTopicComplete ? topic => onTopicComplete(topic, paperLabel) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

// ─── PAPER SECTION (accordion) ─────────────────────────────────────────────
function PaperSection({ paperId, paper, isOpen, onToggle, recordAttempt, attemptedIds, isLoggedIn, revQueue, onTopicComplete }) {
  const [activeSubject, setActiveSubject] = useState(null);
  const subjectEntries = Object.entries(paper.subjects || {});
  const totalQ = useMemo(() => subjectEntries.reduce((s, [, sub]) => s + (sub.data?.length || 0), 0), [subjectEntries]);
  const isMains = paper.isMains;

  const handleToggle = useCallback(() => {
    onToggle();
    if (!isOpen && subjectEntries.length > 0 && !activeSubject) {
      setActiveSubject(subjectEntries[0][0]);
    }
  }, [isOpen, onToggle, subjectEntries, activeSubject]);

  return (
    <div className={`bg-bg-surface border border-bg-border rounded-xl overflow-hidden shadow-sm transition-shadow ${isOpen ? "shadow-md" : "shadow-sm"}`}>
      <div className="flex items-center gap-3 p-4 cursor-pointer select-none" onClick={handleToggle}>
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: paper.color, boxShadow: `0 0 6px ${paper.color}60` }} />
        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold text-text-primary flex items-center gap-1.5 flex-wrap">{paper.label}</div>
          <div className="text-xs text-text-muted font-mono">{subjectEntries.length} subjects · {totalQ} questions</div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex gap-1">
            {subjectEntries.slice(0, 4).map(([, s]) => <div key={s.label} className="w-1.5 h-1.5 rounded-full opacity-80" style={{ background: s.color }} />)}
          </div>
          <span className={`text-text-muted text-lg transition-transform duration-200 ${isOpen ? "rotate-90" : "rotate-0"}`}>›</span>
        </div>
      </div>
      {isOpen && (
        <div className="border-t border-bg-border">
          <div className="flex overflow-x-auto scrollbar-hide border-b border-bg-border px-1">
            {subjectEntries.map(([key, s]) => {
              const isActive = activeSubject === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveSubject(key)}
                  className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap transition border-b-2 ${isActive ? "border-bg-surface text-text-primary" : "border-transparent text-text-muted"}`}
                  style={{ borderBottomColor: isActive ? s.color : undefined }}
                >
                  {s.label} <span className="ml-1 text-[10px] font-mono opacity-70">({s.data?.length || 0})</span>
                </button>
              );
            })}
          </div>
          {activeSubject && paper.subjects[activeSubject] && (
            <div className="p-4">
              {isMains ? (
                <MainsSubjectPanel subject={paper.subjects[activeSubject]} accentColor={paper.subjects[activeSubject].color || paper.color} paperLabel={paper.label} recordAttempt={recordAttempt} attemptedIds={attemptedIds} isLoggedIn={isLoggedIn} />
              ) : (
                <PrelimSubjectPanel subjectKey={activeSubject} subject={paper.subjects[activeSubject]} accentColor={paper.subjects[activeSubject].color || paper.color} revQueue={revQueue} onTopicComplete={onTopicComplete} paperLabel={paper.label} recordAttempt={recordAttempt} attemptedIds={attemptedIds} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── REVISION QUEUE PANEL ──────────────────────────────────────────────────
function RevisionQueuePanel({ revQueue }) {
  const { queue, unpin, clearQueue } = revQueue;
  const [filter, setFilter] = useState("All");
  const subjects = useMemo(() => ["All", ...new Set(queue.map(q => q.subject).filter(Boolean))], [queue]);
  const filtered = filter === "All" ? queue : queue.filter(q => q.subject === filter);

  if (queue.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="text-3xl mb-3">📌</div>
        <div className="text-base font-semibold text-text-primary font-display mb-1.5">No pinned questions</div>
        <div className="text-xs text-text-muted font-mono">Pin questions while browsing to add them here.</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="text-xs text-text-muted font-mono">{queue.length} question{queue.length !== 1 ? "s" : ""} pinned</div>
        <button onClick={() => { if (confirm("Clear all pinned questions?")) clearQueue(); }} className="text-xs px-3 py-1 rounded-lg border border-red-400/30 text-red-400 hover:bg-red-400/5 transition font-mono">Clear All</button>
      </div>
      {subjects.length > 2 && (
        <div className="flex gap-1 overflow-x-auto scrollbar-hide mb-3">
          {subjects.map(s => <Chip key={s} label={s} active={filter === s} color="#fbbf24" onClick={() => setFilter(s)} />)}
        </div>
      )}
      <div className="space-y-2">
        {filtered.map((q, i) => (
          <div key={q._id || i} className="bg-bg-surface border border-yellow-500/30 rounded-xl p-3">
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex-1">
                <div className="text-sm font-medium text-text-primary leading-relaxed mb-2 break-words">
                  {q.questionText?.slice(0, 200)}{q.questionText?.length > 200 ? "…" : ""}
                </div>
                <div className="flex flex-wrap gap-1">
                  <YearBadge year={q.year} />
                  {q.subject && <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-yellow-500/10 text-yellow-500 border border-yellow-500/30">{q.subject}</span>}
                  {q.topic && <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-bg-muted text-text-muted border border-bg-border">{q.topic}</span>}
                  {DIFF_META[q.difficulty] && <Tag label={q.difficulty} meta={DIFF_META[q.difficulty]} />}
                </div>
              </div>
              <button onClick={() => unpin(q._id || q.id)} className="w-8 h-8 rounded-lg border border-bg-border bg-transparent text-text-muted hover:border-accent-gold/30 flex items-center justify-center flex-shrink-0">✕</button>
            </div>
            {q.correctOption && <div className="mt-2 text-xs text-emerald-400 font-mono">Ans: {q.correctOption}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PDF VAULT CONTENT ────────────────────────────────────────────────────
function PdfVaultContent({ activeVaultSection, mainsPaper, setMainsPaper, yearFilter, setYearFilter }) {
  const prelimsYears = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011];
  const mainsYears = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005];
  const visibleMainsYears = useMemo(() => {
    let years = mainsYears;
    if (yearFilter === "latest") years = mainsYears.slice(0, 5);
    else if (yearFilter === "2015") years = mainsYears.filter(y => y >= 2015 && y <= 2019);
    else if (yearFilter === "2010") years = mainsYears.filter(y => y >= 2010 && y <= 2014);
    else if (yearFilter === "2005") years = mainsYears.filter(y => y >= 2005 && y <= 2009);
    return years;
  }, [yearFilter, mainsYears]);

  const prelimsPaperOptions = [
    { id: "paper-i", label: "GS Paper I" },
    { id: "paper-ii", label: "CSAT Paper II" },
  ];
  const mainsPaperOptions = [
    { id: "essay", label: "Essay" },
    { id: "gs1", label: "GS I" },
    { id: "gs2", label: "GS II" },
    { id: "gs3", label: "GS III" },
    { id: "gs4", label: "GS IV" },
    { id: "optional-i", label: "Optional I" },
    { id: "optional-ii", label: "Optional II" },
    { id: "language-i", label: "Hindi (Qualifying)" },
    { id: "language-ii", label: "English (Qualifying)" },
  ];
  const yearFilters = [
    { id: "all", label: "All Years" },
    { id: "latest", label: "Latest 5" },
    { id: "2015", label: "2015-2019" },
    { id: "2010", label: "2010-2014" },
    { id: "2005", label: "2005-2009" },
  ];

  return (
    <div className="space-y-6">
      {activeVaultSection === "prelims" && (
        <>
          {prelimsPaperOptions.map(paper => (
            <div key={paper.id}>
              <h2 className="text-lg font-semibold text-text-primary mb-3">{paper.label}</h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {prelimsYears.map(year => {
                  const link = getPrelimsPaperLink(year, paper.id);
                  return (
                    <article key={year} className="rounded-3xl border border-bg-border bg-bg-surface p-4 shadow-sm hover:border-accent-gold/30 transition">
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-accent-gold/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.25em] text-accent-gold">Year {year}</span>
                        <Sparkles size={13} className="text-accent-gold" />
                      </div>
                      <div className="mt-4 space-y-3 rounded-2xl border border-bg-border bg-bg-muted/70 p-3 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-text-muted"><BookOpen size={12} /> Link status</span>
                          <span className={`h-2.5 w-2.5 rounded-full ${link ? "bg-emerald-500" : "bg-amber-500"}`} />
                        </div>
                        <p className="text-[12px] leading-relaxed text-text-muted">{link ? "Official UPSC PDF available." : "Paper not yet published."}</p>
                        <a href={link || "#"} target="_blank" rel="noopener noreferrer" className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition ${link ? "border-accent-gold/30 bg-accent-gold/5 text-text-primary hover:bg-accent-gold/10" : "border-bg-border bg-bg-muted text-text-muted cursor-not-allowed"}`} onClick={e => !link && e.preventDefault()}>
                          <Link2 size={12} /> {link ? "Open PDF" : "Unavailable"}
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
          <p className="text-xs text-text-muted mt-2">Links last verified: <span className="font-semibold text-text-secondary">{PRELIMS_LAST_VERIFIED_DATE}</span></p>
        </>
      )}
      {activeVaultSection === "mains" && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {mainsPaperOptions.map(paper => (
              <button key={paper.id} type="button" onClick={() => setMainsPaper(paper.id)} className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${mainsPaper === paper.id ? "border-accent-gold/30 bg-accent-gold/10 text-accent-gold" : "border-bg-border bg-bg-surface text-text-secondary hover:border-accent-gold/20 hover:text-text-primary"}`}>
                {paper.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {yearFilters.map(filter => (
              <button key={filter.id} type="button" onClick={() => setYearFilter(filter.id)} className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${yearFilter === filter.id ? "border-accent-gold/30 bg-accent-gold/10 text-accent-gold" : "border-bg-border bg-bg-surface text-text-secondary hover:border-accent-gold/20 hover:text-text-primary"}`}>
                {filter.label}
              </button>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleMainsYears.map(year => {
              const link = getMainsPaperLink(year, mainsPaper);
              return (
                <article key={year} className="rounded-3xl border border-bg-border bg-bg-surface p-4 shadow-sm hover:border-accent-gold/30 transition">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-accent-gold/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.25em] text-accent-gold">Year {year}</span>
                    <Sparkles size={13} className="text-accent-gold" />
                  </div>
                  <div className="mt-4 space-y-3 rounded-2xl border border-bg-border bg-bg-muted/70 p-3 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-text-muted"><BookOpen size={12} /> Link status</span>
                      <span className={`h-2.5 w-2.5 rounded-full ${link ? "bg-emerald-500" : "bg-amber-500"}`} />
                    </div>
                    <p className="text-[12px] leading-relaxed text-text-muted">{link ? "Official UPSC PDF available." : "Paper not yet published."}</p>
                    <a href={link || "#"} target="_blank" rel="noopener noreferrer" className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition ${link ? "border-accent-gold/30 bg-accent-gold/5 text-text-primary hover:bg-accent-gold/10" : "border-bg-border bg-bg-muted text-text-muted cursor-not-allowed"}`} onClick={e => !link && e.preventDefault()}>
                      <Link2 size={12} /> {link ? "Open PDF" : "Unavailable"}
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="text-xs text-text-muted mt-2">Links last verified: <span className="font-semibold text-text-secondary">{MAINS_LAST_VERIFIED_DATE}</span></p>
        </div>
      )}
    </div>
  );
}

// ─── GRID VIEW (Paper selection) ────────────────────────────────────────────
function PaperGrid({ examType, paperOptions, onSelectPaper }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {paperOptions.map((paper, index) => (
        <button
          key={paper.id}
          type="button"
          onClick={() => onSelectPaper(paper.id)}
          className="rounded-3xl border border-bg-border bg-bg-surface p-4 text-left shadow-sm transition duration-150 hover:-translate-y-0.5 hover:border-accent-gold/40 hover:bg-accent-gold/5 hover:shadow-md"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-accent-gold/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.25em] text-accent-gold">
              Paper {index + 1}
            </span>
            <Sparkles size={13} className="text-accent-gold" />
          </div>
          <h2 className="mt-4 font-display text-xl font-semibold text-text-primary">
            {paper.label}
          </h2>
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-bg-border bg-bg-muted/70 px-3 py-2 text-xs text-text-secondary">
            <span>Access Workspace</span>
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── DETAIL VIEW ─────────────────────────────────────────────────────────────
function PaperDetail({
  examType,
  activePaper,
  paperOptions,
  savedLinks,
  yearFilter,
  setYearFilter,
  activeTab,
  setActiveTab,
  onBack,
  isLoggedIn,
  revQueue,
  recordAttempt,
  attemptedIds,
}) {
  const TABS = [
    { id: "pyqs", label: "PYQs", icon: Archive },
    { id: "resources", label: "Resources", icon: Library },
    { id: "myqs", label: "My Questions", icon: PenSquare },
  ];
  const selectedPaper = paperOptions.find(p => p.id === activePaper) || paperOptions[0];
  const getSavedLink = (year) => savedLinks[`${activePaper}-${year}`];
  const getOfficialLink = (year) => {
    if (examType === "prelims") return getPrelimsPaperLink(year, activePaper);
    return getMainsPaperLink(year, activePaper);
  };

  const visibleCards = useMemo(() => {
    let cards = PYQ_CARDS;
    if (yearFilter === "latest") cards = PYQ_CARDS.slice(0, 5);
    else if (yearFilter === "2015") cards = PYQ_CARDS.filter(c => c.year >= 2015 && c.year <= 2019);
    else if (yearFilter === "2010") cards = PYQ_CARDS.filter(c => c.year >= 2010 && c.year <= 2014);
    else if (yearFilter === "2005") cards = PYQ_CARDS.filter(c => c.year >= 2005 && c.year <= 2009);
    return cards;
  }, [yearFilter]);

  const handlePaperClick = (year) => {
    const existing = getSavedLink(year);
    const officialLink = getOfficialLink(year);
    if (existing?.url) { window.open(existing.url, "_blank", "noopener,noreferrer"); return; }
    if (officialLink) { window.open(officialLink, "_blank", "noopener,noreferrer"); return; }
    window.alert(`UPSC has not published a mapped ${selectedPaper.label} link for ${year} yet.`);
  };

  const lastVerified = examType === "prelims" ? PRELIMS_LAST_VERIFIED_DATE : MAINS_LAST_VERIFIED_DATE;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="rounded-3xl border border-bg-border bg-bg-surface/90 p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-accent-gold">PYQ Vault</p>
            <h1 className="mt-1 font-display text-2xl font-bold text-text-primary">
              {selectedPaper.label} workspace
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-text-secondary">
              Year-wise PYQs, resources, and custom questions for {selectedPaper.label}.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-accent-gold/20 bg-accent-gold/10 px-3 py-2 text-xs text-text-secondary">
              <span className="font-semibold text-accent-gold">Verified:</span> {lastVerified}
            </div>
            <button
              type="button"
              onClick={onBack}
              className="rounded-full border border-bg-border bg-bg-muted px-3 py-1.5 text-xs font-semibold text-text-secondary hover:border-accent-gold/30 hover:text-text-primary transition"
            >
              ← Back
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <section className="rounded-3xl border border-bg-border bg-bg-surface/90 p-5 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {TABS.map(({ id, label, icon: Icon }) => (
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

        {/* PYQs Tab */}
        {activeTab === "pyqs" && (
          <>
            <div className="mt-5 rounded-2xl border border-bg-border bg-bg-muted/60 p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Sort by year</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {YEAR_FILTERS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setYearFilter(item.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      yearFilter === item.id
                        ? "border-accent-gold/30 bg-accent-gold/10 text-accent-gold"
                        : "border-bg-border bg-bg-surface text-text-secondary hover:border-accent-gold/20 hover:text-text-primary"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleCards.map((item) => {
                const savedLink = getSavedLink(item.year);
                const officialLink = getOfficialLink(item.year);
                const hasDirectLink = Boolean(savedLink?.url || officialLink);
                return (
                  <article key={item.year} className="rounded-3xl border border-bg-border bg-bg-surface p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-accent-gold/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.25em] text-accent-gold">
                        {item.chip}
                      </span>
                      <Sparkles size={13} className="text-accent-gold" />
                    </div>
                    <h2 className="mt-4 font-display text-xl font-semibold text-text-primary">
                      Year {item.year}
                    </h2>
                    <div className="mt-4 space-y-3 rounded-2xl border border-bg-border bg-bg-muted/70 p-3 text-xs text-text-secondary">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-text-muted">
                          <BookOpen size={12} /> Link status
                        </span>
                        <span className={`h-2.5 w-2.5 rounded-full ${hasDirectLink ? "bg-emerald-500" : "bg-amber-500"}`} />
                      </div>
                      <p className="text-[12px] leading-relaxed text-text-muted">
                        {savedLink?.url
                          ? "A saved link is preserved for this paper-year."
                          : officialLink
                            ? "Open the official UPSC link for this paper-year."
                            : `Waiting for UPSC to publish the ${item.year} paper set.`}
                      </p>
                      <button
                        type="button"
                        onClick={() => handlePaperClick(item.year)}
                        disabled={!hasDirectLink}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-bg-border bg-bg-surface px-3 py-2 text-xs font-semibold text-text-primary transition hover:border-accent-gold/30 hover:bg-accent-gold/5 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Link2 size={12} />
                        {savedLink?.url ? "Open saved link" : officialLink ? "Open paper" : "Link unavailable"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}

        {/* Resources Tab */}
        {activeTab === "resources" && <ResourceLibrary />}

        {/* My Questions Tab */}
        {activeTab === "myqs" && (
          <div className="mt-5">
            <AddCustomQuestion
              storageKey={`${examType}-custom-qs`}
              defaultPaper={selectedPaper.label}
              paperOptions={paperOptions.map(p => p.label)}
              accentColor="var(--accent-gold)"
            />
          </div>
        )}
      </section>

      {/* AI Mentor Chat */}
      <AIMentorChat
        contextHint={`I'm practising UPSC ${examType === "prelims" ? "Prelims MCQs" : "Mains long-answer questions"}`}
        isLoggedIn={isLoggedIn}
        compact={true}
      />
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function PyqVault({
  onSyllabusUpdate,
  onBulkSyllabusUpdate = null,
  serverAttempts = [],
  isLoggedIn = false,
}) {
  // Exam type
  const [examType, setExamType] = useState("prelims");
  // Paper selection & detail mode
  const [activePaper, setActivePaper] = useState(null);
  const [pageMode, setPageMode] = useState("grid"); // "grid" or "detail"
  const [activeTab, setActiveTab] = useState("pyqs");
  const [yearFilter, setYearFilter] = useState("all");

  // Saved links (localStorage)
  const [savedLinks, setSavedLinks] = useState({});
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("upsc-pyqvault-links") || "{}");
      setSavedLinks(stored);
    } catch (error) {
      console.warn("Could not read pyqvault links", error);
    }
  }, []);

  // Hooks
  const { recordAttempt, attemptedIds } = useQuestionAttempts({ onSyllabusUpdate, serverAttempts });
  const revQueue = useRevisionQueue();

  // Paper options based on exam type
  const paperOptions = examType === "prelims" ? PRELIMS_PAPER_OPTIONS : MAINS_PAPER_OPTIONS;

  // Handlers
  const openPaperDetails = (paperId) => {
    setActivePaper(paperId);
    setPageMode("detail");
    setActiveTab("pyqs");
  };

  const goBackToGrid = () => {
    setActivePaper(null);
    setPageMode("grid");
  };

  // Render
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 font-sans text-text-primary animate-fade-in">
      {/* ── Header ── */}
      <header className="rounded-3xl border border-bg-border bg-bg-surface/90 p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-accent-gold">PYQ Vault</p>
            <h1 className="mt-1 font-display text-2xl font-bold text-text-primary">
              Official PDFs for PYQS of last 20 years
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-text-secondary">
              Subject‑wise PYQs, official papers, and custom practice for UPSC Prelims &amp; Mains.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-accent-gold/20 bg-accent-gold/10 px-3 py-2 text-xs text-text-secondary">
              <span className="font-semibold text-accent-gold">Verified:</span>{" "}
              {examType === "prelims" ? PRELIMS_LAST_VERIFIED_DATE : MAINS_LAST_VERIFIED_DATE}
            </div>
            <div className="rounded-full border border-bg-border bg-bg-muted px-3 py-1.5 text-xs font-semibold text-text-secondary">
              {revQueue.queue.length > 0 && `📌 ${revQueue.queue.length}`}
            </div>
          </div>
        </div>
      </header>

      {/* ── PRACTICE ── */}
      <section className="rounded-3xl border border-bg-border bg-bg-surface/90 p-5 shadow-sm space-y-6">
          {/* Exam selector */}
          <div className="flex w-full border border-bg-border rounded-xl overflow-hidden shadow-sm">
            {[
              ["prelims", "Prelims"],
              ["mains", "Mains"],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => {
                  setExamType(id);
                  setActivePaper(null);
                  setPageMode("grid");
                }}
                className={`flex-1 min-h-[48px] border-none cursor-pointer transition font-sans text-base font-medium ${
                  examType === id
                    ? "bg-text-primary text-bg-base"
                    : "bg-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <>
              {pageMode === "grid" ? (
                <PaperGrid
                  examType={examType}
                  paperOptions={paperOptions}
                  onSelectPaper={openPaperDetails}
                />
              ) : (
                <PaperDetail
                  examType={examType}
                  activePaper={activePaper}
                  paperOptions={paperOptions}
                  savedLinks={savedLinks}
                  yearFilter={yearFilter}
                  setYearFilter={setYearFilter}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  onBack={goBackToGrid}
                  isLoggedIn={isLoggedIn}
                  revQueue={revQueue}
                  recordAttempt={recordAttempt}
                  attemptedIds={attemptedIds}
                />
              )}
            </>
        </section>

      {/* ── Footer ── */}
      <footer className="text-center text-[10px] text-text-muted font-mono border-t border-bg-border pt-4">
        Examination Notice No. 05/2026-CSE · Union Public Service Commission
      </footer>
    </div>
  );
}