/**
 * MainsQuestionCard.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * UPSC Mains — Long-Answer Question Card
 *
 * Improvements:
 *   - Larger, responsive fonts (clamp + rem fallback)
 *   - Better text contrast (softer secondary text, readable headings)
 *   - Mobile-friendly padding & button wrap
 *   - Word count progress bar compact on small screens
 *   - Consistent spacing
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import AIEvaluatorPanel from "./AIEvaluatorPanel";

// ── DIRECTIVE BADGE (softer, readable colors) ────────────────────────────────

const DIRECTIVE_META = {
  Examine: { bg: "rgba(79,142,247,0.12)", text: "#4F8EF7", border: "rgba(79,142,247,0.3)" },
  Discuss: { bg: "rgba(52,211,153,0.1)", text: "#2bae6b", border: "rgba(52,211,153,0.3)" },
  "Critically Evaluate": { bg: "rgba(248,113,113,0.1)", text: "#e5484d", border: "rgba(248,113,113,0.3)" },
  Explain: { bg: "rgba(167,139,250,0.1)", text: "#8b5cf6", border: "rgba(167,139,250,0.3)" },
  Analyse: { bg: "rgba(251,191,36,0.1)", text: "#eab308", border: "rgba(251,191,36,0.3)" },
  Analyze: { bg: "rgba(251,191,36,0.1)", text: "#eab308", border: "rgba(251,191,36,0.3)" },
  Elucidate: { bg: "rgba(251,191,36,0.1)", text: "#eab308", border: "rgba(251,191,36,0.3)" },
  Elaborate: { bg: "rgba(96,165,250,0.1)", text: "#3b82f6", border: "rgba(96,165,250,0.3)" },
  Comment: { bg: "rgba(244,114,182,0.1)", text: "#ec4899", border: "rgba(244,114,182,0.3)" },
  Compare: { bg: "rgba(34,211,238,0.1)", text: "#06b6d4", border: "rgba(34,211,238,0.3)" },
  How: { bg: "rgba(52,211,153,0.1)", text: "#2bae6b", border: "rgba(52,211,153,0.3)" },
  default: { bg: "rgba(120,120,140,0.1)", text: "#8b8b9b", border: "rgba(120,120,140,0.25)" },
};

function getDirectiveMeta(directive) {
  if (!directive) return DIRECTIVE_META.default;
  const key = Object.keys(DIRECTIVE_META).find(k =>
    directive.toLowerCase().includes(k.toLowerCase())
  );
  return DIRECTIVE_META[key || "default"];
}

function DirectiveBadge({ directive }) {
  if (!directive) return null;
  const meta = getDirectiveMeta(directive);
  return (
    <span
      style={{
        fontSize: "clamp(9px, 3vw, 11px)",
        padding: "2px 10px",
        borderRadius: 12,
        background: meta.bg,
        color: meta.text,
        border: `0.5px solid ${meta.border}`,
        fontFamily: "'DM Mono', monospace",
        fontWeight: 600,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {directive}
    </span>
  );
}

// ── MARKS + WORD LIMIT BADGES (subtle, readable) ─────────────────────────────

function MarksBadge({ marks }) {
  if (!marks) return null;
  const color = marks >= 15 ? "#eab308" : "#3b82f6";
  const bg = marks >= 15 ? "rgba(234,179,8,0.1)" : "rgba(59,130,246,0.1)";
  const border = marks >= 15 ? "rgba(234,179,8,0.3)" : "rgba(59,130,246,0.25)";
  return (
    <span
      style={{
        fontSize: "clamp(9px, 3vw, 11px)",
        padding: "2px 10px",
        borderRadius: 12,
        background: bg,
        color,
        border: `0.5px solid ${border}`,
        fontFamily: "'DM Mono', monospace",
        fontWeight: 600,
        letterSpacing: "0.05em",
      }}
    >
      {marks}M
    </span>
  );
}

function WordLimitBadge({ wordLimit }) {
  if (!wordLimit) return null;
  return (
    <span
      style={{
        fontSize: "clamp(9px, 3vw, 11px)",
        padding: "2px 10px",
        borderRadius: 12,
        background: "var(--bg-muted)",
        color: "var(--text-muted)",
        border: "0.5px solid var(--bg-border)",
        fontFamily: "'DM Mono', monospace",
        fontWeight: 500,
      }}
    >
      ~{wordLimit}w
    </span>
  );
}

function YearBadge({ year }) {
  if (!year) return null;
  return (
    <span
      style={{
        fontSize: "clamp(9px, 3vw, 11px)",
        padding: "2px 10px",
        borderRadius: 12,
        background: "var(--bg-muted)",
        color: "var(--text-muted)",
        border: "0.5px solid var(--bg-border)",
        fontFamily: "'DM Mono', monospace",
        fontWeight: 500,
      }}
    >
      {year}
    </span>
  );
}

// ── KEY POINTS SECTION (softer contrast, larger text) ────────────────────────

function KeyPointsPanel({ keyPoints, accentColor }) {
  if (!keyPoints || keyPoints.length === 0) return null;
  return (
    <div
      style={{
        borderTop: "0.5px solid var(--bg-border)",
        padding: "clamp(12px, 3vw, 16px) clamp(14px, 4vw, 20px)",
        background: `${accentColor}06`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span
          style={{
            width: 3,
            height: 14,
            borderRadius: 2,
            background: accentColor,
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: "clamp(10px, 3.5vw, 12px)",
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: accentColor,
            fontFamily: "'DM Mono', monospace",
            textTransform: "uppercase",
          }}
        >
          Answer Hints
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {keyPoints.map((point, i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span
              style={{
                fontSize: "clamp(10px, 3.5vw, 12px)",
                fontFamily: "'DM Mono', monospace",
                color: `${accentColor}cc`,
                flexShrink: 0,
                paddingTop: 2,
                minWidth: 24,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              style={{
                fontSize: "clamp(12px, 4vw, 14px)",
                lineHeight: 1.65,
                color: "var(--text-secondary)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {point}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── IDEAL ANSWER RENDERER (larger body text, clean sections) ─────────────────

function parseIdealAnswer(text) {
  if (!text || typeof text !== "string") return [];
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const sections = [];
  let currentSection = null;

  const isSectionHeader = (line) =>
    /^[A-Z][^a-z]{0,4}[A-Za-z\s,&\-()]+:$/.test(line) ||
    /^\d+\.\s+[A-Z]/.test(line) ||
    /^[A-Z][A-Za-z\s]+—/.test(line);

  lines.forEach((line) => {
    if (isSectionHeader(line)) {
      if (currentSection) sections.push(currentSection);
      currentSection = { header: line, body: [] };
    } else if (currentSection) {
      currentSection.body.push(line);
    } else {
      if (!sections[0]?.isIntro) {
        sections.unshift({ isIntro: true, header: null, body: [] });
      }
      sections[0].body.push(line);
    }
  });
  if (currentSection) sections.push(currentSection);
  if (sections.length === 0) sections.push({ header: null, body: lines });
  return sections;
}

function IdealAnswerPanel({ idealAnswer, accentColor }) {
  if (!idealAnswer) return null;
  const sections = parseIdealAnswer(idealAnswer);

  return (
    <div
      style={{
        borderTop: "0.5px solid var(--bg-border)",
        padding: "clamp(14px, 4vw, 18px) clamp(14px, 4vw, 20px)",
        background: "var(--bg-base)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span
          style={{
            width: 3,
            height: 16,
            borderRadius: 2,
            background: accentColor,
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: "clamp(10px, 3.5vw, 12px)",
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: accentColor,
            fontFamily: "'DM Mono', monospace",
            textTransform: "uppercase",
          }}
        >
          Model Answer
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sections.map((sec, idx) => (
          <div
            key={idx}
            style={{
              background: "var(--bg-surface)",
              border: "0.5px solid var(--bg-border)",
              borderLeft: `3px solid ${sec.header ? accentColor : `${accentColor}66`}`,
              borderRadius: 10,
              padding: "clamp(10px, 3vw, 14px) clamp(12px, 4vw, 16px)",
            }}
          >
            {sec.header && (
              <div
                style={{
                  fontSize: "clamp(12px, 4vw, 14px)",
                  fontWeight: 700,
                  color: accentColor,
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: "0.02em",
                  marginBottom: sec.body.length > 0 ? 8 : 0,
                }}
              >
                {sec.header}
              </div>
            )}
            {sec.body.length > 0 && (
              <div
                style={{
                  fontSize: "clamp(13px, 4.5vw, 15px)",
                  lineHeight: 1.75,
                  color: "var(--text-primary)",
                  fontFamily: "'DM Sans', sans-serif",
                  whiteSpace: "pre-wrap",
                }}
              >
                {sec.body.join("\n")}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SOURCES ROW ───────────────────────────────────────────────────────────────

function SourcesRow({ sources }) {
  if (!sources || sources.length === 0) return null;
  return (
    <div
      style={{
        padding: "10px clamp(14px, 4vw, 20px) 14px",
        borderTop: "0.5px solid var(--bg-border)",
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "center",
      }}
    >
      <span
        style={{
          fontSize: "clamp(9px, 3vw, 10px)",
          fontFamily: "'DM Mono', monospace",
          color: "var(--text-muted)",
          letterSpacing: "0.08em",
        }}
      >
        SOURCES
      </span>
      {sources.map((src, i) => (
        <span
          key={i}
          title={src.chapter || ""}
          style={{
            fontSize: "clamp(10px, 3.5vw, 11px)",
            padding: "2px 10px",
            borderRadius: 20,
            background: "var(--bg-muted)",
            border: "0.5px solid var(--bg-border)",
            color: "var(--text-muted)",
            fontFamily: "'DM Mono', monospace",
          }}
        >
          {src.name}
        </span>
      ))}
    </div>
  );
}

// ── WORD COUNT PROGRESS (mobile‑friendly) ─────────────────────────────────────

function WordCountProgress({ wordLimit, currentCount, accentColor }) {
  if (!wordLimit) return null;
  const pct = Math.min(100, Math.round((currentCount / wordLimit) * 100));
  const overLimit = currentCount > wordLimit;
  const barColor = overLimit ? "#f87171" : pct > 85 ? "#eab308" : accentColor;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 100 }}>
      <div
        style={{
          flex: 1,
          height: 3,
          borderRadius: 2,
          background: "var(--bg-border)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: barColor,
            borderRadius: 2,
            transition: "width 0.2s, background 0.2s",
          }}
        />
      </div>
      <span
        style={{
          fontSize: "clamp(9px, 3vw, 10px)",
          fontFamily: "'DM Mono', monospace",
          color: overLimit ? "#fca5a5" : "var(--text-muted)",
          whiteSpace: "nowrap",
        }}
      >
        {currentCount}/{wordLimit}
      </span>
    </div>
  );
}

// ── PRACTICE TEXTAREA (larger font, responsive) ───────────────────────────────

function PracticeBox({ wordLimit, accentColor, question, paper, isLoggedIn }) {
  const [value, setValue] = useState("");
  const wordCount = value.trim() === "" ? 0 : value.trim().split(/\s+/).length;

  return (
    <div
      style={{
        borderTop: "0.5px solid var(--bg-border)",
        padding: "clamp(12px, 3vw, 16px) clamp(14px, 4vw, 20px)",
        background: "var(--bg-base)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 3,
              height: 12,
              borderRadius: 2,
              background: accentColor,
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: "clamp(10px, 3.5vw, 12px)",
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: accentColor,
              fontFamily: "'DM Mono', monospace",
              textTransform: "uppercase",
            }}
          >
            Practice Answer
          </span>
        </div>
        <WordCountProgress wordLimit={wordLimit} currentCount={wordCount} accentColor={accentColor} />
      </div>
      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={`Write your answer here… (target ~${wordLimit || 150} words)`}
        rows={6}
        style={{
          width: "100%",
          padding: "clamp(10px, 3vw, 12px)",
          fontSize: "clamp(13px, 4vw, 14px)",
          lineHeight: 1.7,
          fontFamily: "'DM Sans', sans-serif",
          background: "var(--bg-surface)",
          border: "0.5px solid var(--bg-border)",
          borderRadius: 10,
          color: "var(--text-primary)",
          resize: "vertical",
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.15s",
        }}
        onFocus={e => (e.target.style.borderColor = accentColor)}
        onBlur={e => (e.target.style.borderColor = "var(--bg-border)")}
      />
      <AIEvaluatorPanel
        question={question || ""}
        paper={paper || "GS2"}
        answer={value}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────

/**
 * MainsQuestionCard – larger, responsive, readable
 */
export default function MainsQuestionCard({ q, index, accentColor = "#34d399", paper, isLoggedIn }) {
  const [showIdealAnswer, setShowIdealAnswer] = useState(false);
  const [showPractice, setShowPractice] = useState(false);
  const [showKeyPoints, setShowKeyPoints] = useState(false);
  const [hovered, setHovered] = useState(false);

  if (!q) return null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--bg-surface)",
        border: "0.5px solid var(--bg-border)",
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: hovered ? "var(--shadow-md)" : "var(--shadow-sm)",
        transition: "box-shadow 0.2s",
      }}
    >
      {/* Question Header – larger font */}
      <div
        style={{
          padding: "clamp(14px, 4vw, 18px) clamp(14px, 4vw, 20px)",
          borderBottom: "0.5px solid var(--bg-border)",
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div
          style={{
            fontSize: "clamp(12px, 4vw, 14px)",
            fontWeight: 700,
            color: accentColor,
            fontFamily: "'DM Mono', monospace",
            minWidth: 32,
            paddingTop: 2,
            flexShrink: 0,
          }}
        >
          Q{index + 1}
        </div>
        <div
          style={{
            flex: 1,
            fontSize: "clamp(15px, 5vw, 17px)",
            fontWeight: 500,
            color: "var(--text-primary)",
            lineHeight: 1.7,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {q.questionText}
        </div>
      </div>

      {/* Metadata Row */}
      <div
        style={{
          padding: "8px clamp(14px, 4vw, 20px)",
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
          borderBottom: "0.5px solid var(--bg-border)",
        }}
      >
        <YearBadge year={q.year} />
        <MarksBadge marks={q.marks} />
        <WordLimitBadge wordLimit={q.wordLimit} />
        {q.directive && <DirectiveBadge directive={q.directive} />}
        {q.subTopic && (
          <span
            title={q.subTopic}
            style={{
              fontSize: "clamp(9px, 3vw, 11px)",
              padding: "2px 10px",
              borderRadius: 12,
              background: "var(--bg-muted)",
              color: "var(--text-muted)",
              border: "0.5px solid var(--bg-border)",
              fontFamily: "'DM Mono', monospace",
              maxWidth: 220,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {q.subTopic}
          </span>
        )}
      </div>

      {/* Expandable Panels */}
      {showKeyPoints && <KeyPointsPanel keyPoints={q.keyPoints} accentColor={accentColor} />}
      {showPractice && (
        <PracticeBox
          wordLimit={q.wordLimit}
          accentColor={accentColor}
          question={q.questionText}
          paper={paper}
          isLoggedIn={isLoggedIn}
        />
      )}
      {showIdealAnswer && <IdealAnswerPanel idealAnswer={q.idealAnswer} accentColor={accentColor} />}
      {showIdealAnswer && <SourcesRow sources={q.sources} />}

      {/* Action Buttons – Responsive wrap, larger touch targets */}
      <div
        style={{
          padding: "clamp(10px, 3vw, 12px) clamp(14px, 4vw, 20px) 16px",
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {q.keyPoints && q.keyPoints.length > 0 && (
          <button
            onClick={() => setShowKeyPoints(v => !v)}
            style={{
              fontSize: "clamp(11px, 4vw, 12px)",
              padding: "7px 16px",
              borderRadius: 30,
              border: `0.5px solid ${accentColor}66`,
              background: showKeyPoints ? `${accentColor}18` : "transparent",
              color: showKeyPoints ? accentColor : "var(--text-muted)",
              cursor: "pointer",
              fontWeight: 600,
              transition: "all 0.15s",
              fontFamily: "'DM Sans', sans-serif",
              minHeight: 40,
            }}
          >
            {showKeyPoints ? "Hide Hints" : "💡 Hints"}
          </button>
        )}

        <button
          onClick={() => setShowPractice(v => !v)}
          style={{
            fontSize: "clamp(11px, 4vw, 12px)",
            padding: "7px 16px",
            borderRadius: 30,
            border: `0.5px solid ${accentColor}66`,
            background: showPractice ? `${accentColor}18` : "transparent",
            color: showPractice ? accentColor : "var(--text-muted)",
            cursor: "pointer",
            fontWeight: 600,
            transition: "all 0.15s",
            fontFamily: "'DM Sans', sans-serif",
            minHeight: 40,
          }}
        >
          {showPractice ? "Close Draft" : "✏️ Practice"}
        </button>

        {q.idealAnswer && (
          <button
            onClick={() => setShowIdealAnswer(v => !v)}
            style={{
              fontSize: "clamp(11px, 4vw, 12px)",
              padding: "7px 18px",
              borderRadius: 30,
              border: `0.5px solid ${accentColor}`,
              background: showIdealAnswer ? `${accentColor}22` : "transparent",
              color: accentColor,
              cursor: "pointer",
              fontWeight: 700,
              transition: "all 0.15s",
              fontFamily: "'DM Sans', sans-serif",
              minHeight: 40,
            }}
          >
            {showIdealAnswer ? "Hide Answer" : "Model Answer"}
          </button>
        )}

        {q.marks && (
          <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
            <span
              style={{
                fontSize: "clamp(10px, 3.5vw, 11px)",
                color: "var(--text-muted)",
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {q.marks} marks · {q.wordLimit} words
            </span>
          </div>
        )}
      </div>
    </div>
  );
}