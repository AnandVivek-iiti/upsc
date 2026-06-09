/**
 * QuestionRenderer.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * UPSC PYQ — Central Question Rendering Component
 *
 * Handles all question formats found in the data corpus:
 *   • Single-correct MCQ          (most GS questions)
 *   • Multi-statement choice      ("Which of the following is/are correct?")
 *   • Matrix / Match-the-List     (questionText contains "|" table markdown)
 *   • Comprehension passage       (passage + sub-question)
 *   • Numeric / Quantitative      (CSAT Maths)
 *
 * Props:
 *   q           {object}  — full question object from data arrays
 *   index       {number}  — display index (0-based → rendered as Q1, Q2…)
 *   accentColor {string}  — hex color for left border + interactive highlights
 *
 * Dependencies:
 *   ExplanationBox  — ./ExplanationBox
 *   MatchTable      — ../components/MatchTable  (existing component)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import ExplanationBox from "./ExplanationBox";

// ── INLINE MATCHTABLE ─────────────────────────────────────────────────────────
// A self-contained fallback if MatchTable isn't available, plus the real import.
// In production, replace this with: import MatchTable from "../components/MatchTable";

function FallbackMatchTable({ dataString }) {
  if (!dataString) return null;

  const lines = dataString
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("|"));

  if (lines.length === 0) return null;

  const parseRow = (line) =>
    line
      .split("|")
      .map((cell) => cell.trim())
      .filter((_, i, arr) => i > 0 && i < arr.length - 1);

  const rows = lines.filter((l) => !l.match(/^\|[-\s|]+\|$/));
  const header = rows[0] ? parseRow(rows[0]) : [];
  const body = rows.slice(1).map(parseRow);

  const cellStyle = (isHeader = false) => ({
    padding: "7px 12px",
    fontSize: isHeader ? 10 : 12,
    fontFamily: isHeader ? "'DM Mono', monospace" : "'DM Sans', sans-serif",
    fontWeight: isHeader ? 700 : 400,
    color: isHeader ? "var(--text-muted)" : "var(--text-primary)",
    letterSpacing: isHeader ? "0.06em" : 0,
    textAlign: "left",
    borderBottom: "0.5px solid var(--bg-border)",
    verticalAlign: "top",
    lineHeight: 1.5,
  });

  return (
    <div
      style={{
        overflowX: "auto",
        borderRadius: 8,
        border: "0.5px solid var(--bg-border)",
        margin: "10px 0",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        {header.length > 0 && (
          <thead>
            <tr style={{ background: "var(--bg-muted)" }}>
              {header.map((h, i) => (
                <th key={i} style={cellStyle(true)}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {body.map((row, ri) => (
            <tr
              key={ri}
              style={{
                background: ri % 2 === 0 ? "transparent" : "var(--bg-muted)",
              }}
            >
              {row.map((cell, ci) => (
                <td key={ci} style={cellStyle(false)}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── QUESTION TEXT RENDERER ────────────────────────────────────────────────────
// Detects markdown tables in questionText and routes to MatchTable.
// Also handles numbered statement lists (renders them as distinct items).

function QuestionTextRenderer({ text, accentColor }) {
  if (!text || typeof text !== "string") return null;

  const hasTable = text.includes("|");

  if (hasTable) {
    const lines = text.split("\n");
    const before = [];
    const tableLines = [];
    const after = [];
    let inTable = false;
    let pastTable = false;

    lines.forEach((line) => {
      if (!inTable && !pastTable && line.trim().startsWith("|")) {
        inTable = true;
      }
      if (inTable && !line.trim().startsWith("|")) {
        inTable = false;
        pastTable = true;
      }
      if (inTable) tableLines.push(line);
      else if (pastTable) after.push(line);
      else before.push(line);
    });

    return (
      <div
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: "var(--text-primary)",
          lineHeight: 1.65,
        }}
      >
        {before.join("\n").trim() && (
          <div style={{ whiteSpace: "pre-wrap", marginBottom: 8 }}>
            {before.join("\n").trim()}
          </div>
        )}
        <FallbackMatchTable dataString={tableLines.join("\n")} />
        {after.join("\n").trim() && (
          <div style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>
            {after.join("\n").trim()}
          </div>
        )}
      </div>
    );
  }

  // Detect numbered statement list format: lines starting with "1." / "I." / "A."
  const stmtLineRe = /^([IVX]+\.|[1-9]\.|[A-D]\.)\s+/;
  const lines = text.split("\n");
  const hasStatements = lines.some((l) => stmtLineRe.test(l.trim()));

  if (hasStatements) {
    const parts = [];
    let intro = [];
    let inStmts = false;
    let outro = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (stmtLineRe.test(trimmed)) {
        inStmts = true;
        parts.push(trimmed);
      } else if (inStmts && trimmed === "") {
        // allow gap
      } else if (inStmts) {
        outro.push(line);
      } else {
        intro.push(line);
      }
    });

    return (
      <div
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: "var(--text-primary)",
          lineHeight: 1.65,
        }}
      >
        {intro.join("\n").trim() && (
          <div style={{ whiteSpace: "pre-wrap", marginBottom: 10 }}>
            {intro.join("\n").trim()}
          </div>
        )}
        {parts.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              margin: "6px 0",
            }}
          >
            {parts.map((stmt, i) => {
              const markerMatch = stmt.match(/^([IVX]+\.|[1-9]\.|[A-D]\.)\s*/);
              const marker = markerMatch ? markerMatch[1] : "";
              const body = stmt.slice(marker.length).trim();
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 10,
                    padding: "7px 12px",
                    background: "var(--bg-muted)",
                    borderRadius: 6,
                    border: "0.5px solid var(--bg-border)",
                    borderLeft: `2px solid ${accentColor}44`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 11,
                      fontWeight: 700,
                      color: accentColor,
                      flexShrink: 0,
                      minWidth: 20,
                      paddingTop: 1,
                    }}
                  >
                    {marker}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--text-primary)",
                      lineHeight: 1.6,
                    }}
                  >
                    {body}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        {outro.join("\n").trim() && (
          <div style={{ whiteSpace: "pre-wrap", marginTop: 10 }}>
            {outro.join("\n").trim()}
          </div>
        )}
      </div>
    );
  }

  // Default plain text
  return (
    <div
      style={{
        fontSize: 14,
        fontWeight: 500,
        color: "var(--text-primary)",
        lineHeight: 1.65,
        whiteSpace: "pre-wrap",
      }}
    >
      {text}
    </div>
  );
}

// ── OPTION ITEM ───────────────────────────────────────────────────────────────

function OptionItem({ opt, state, accentColor, onClick }) {
  // state: "idle" | "selected" | "correct" | "wrong" | "dimmed"
  const styles = {
    idle: {
      border: "0.5px solid var(--bg-border)",
      background: "var(--bg-muted)",
      color: "var(--text-primary)",
    },
    selected: {
      border: `0.5px solid ${accentColor}`,
      background: `${accentColor}18`,
      color: "var(--text-primary)",
    },
    correct: {
      border: "0.5px solid rgba(52,211,153,0.5)",
      background: "rgba(52,211,153,0.08)",
      color: "#6ee7b7",
    },
    wrong: {
      border: "0.5px solid rgba(248,113,113,0.5)",
      background: "rgba(248,113,113,0.08)",
      color: "#fca5a5",
    },
    dimmed: {
      border: "0.5px solid var(--bg-border)",
      background: "transparent",
      color: "var(--text-muted)",
      opacity: 0.45,
    },
  };

  const markerMap = {
    idle: { text: opt.id, color: "var(--text-muted)" },
    selected: { text: opt.id, color: accentColor },
    correct: { text: "✓", color: "#6ee7b7" },
    wrong: { text: "✗", color: "#fca5a5" },
    dimmed: { text: opt.id, color: "var(--text-muted)" },
  };

  const current = styles[state] || styles.idle;
  const marker = markerMap[state] || markerMap.idle;

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: "10px 14px",
        borderRadius: 8,
        cursor: onClick ? "pointer" : "default",
        transition: "all .15s",
        marginBottom: 6,
        fontFamily: "'DM Sans', sans-serif",
        ...current,
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          fontFamily: "'DM Mono', monospace",
          color: marker.color,
          minWidth: 18,
          paddingTop: 1,
          flexShrink: 0,
          transition: "color .15s",
        }}
      >
        {marker.text}
      </span>
      <span style={{ fontSize: 13, lineHeight: 1.55 }}>{opt.text}</span>
    </div>
  );
}

// ── DIFF / TAG BADGE ──────────────────────────────────────────────────────────

const DIFF_COLORS = {
  Easy: { bg: "rgba(52,211,153,0.1)", text: "#6ee7b7", border: "rgba(52,211,153,0.3)" },
  Medium: { bg: "rgba(251,191,36,0.1)", text: "#fcd34d", border: "rgba(251,191,36,0.3)" },
  Hard: { bg: "rgba(248,113,113,0.1)", text: "#fca5a5", border: "rgba(248,113,113,0.3)" },
};

function DiffBadge({ difficulty }) {
  const d = DIFF_COLORS[difficulty];
  if (!d) return null;
  return (
    <span
      style={{
        fontSize: 9,
        padding: "2px 7px",
        borderRadius: 4,
        background: d.bg,
        color: d.text,
        border: `0.5px solid ${d.border}`,
        fontFamily: "'DM Mono', monospace",
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      {difficulty}
    </span>
  );
}

function YearBadge({ year }) {
  if (!year) return null;
  return (
    <span
      style={{
        fontSize: 9,
        padding: "2px 7px",
        borderRadius: 4,
        background: "var(--bg-muted)",
        color: "var(--text-muted)",
        border: "0.5px solid var(--bg-border)",
        fontFamily: "'DM Mono', monospace",
        fontWeight: 600,
        letterSpacing: "0.06em",
      }}
    >
      {year}
    </span>
  );
}

function SubtopicBadge({ text }) {
  if (!text) return null;
  return (
    <span
      style={{
        fontSize: 9,
        padding: "2px 8px",
        borderRadius: 4,
        background: "var(--bg-muted)",
        color: "var(--text-muted)",
        border: "0.5px solid var(--bg-border)",
        fontFamily: "'DM Mono', monospace",
        maxWidth: 200,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        display: "inline-block",
      }}
      title={text}
    >
      {text}
    </span>
  );
}

// ── CORRECT ANSWER BANNER ─────────────────────────────────────────────────────

function CorrectBanner({ correctOption, options }) {
  const opt = (options || []).find((o) => o.id === correctOption);
  if (!opt) return null;
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        padding: "8px 14px",
        background: "rgba(52,211,153,0.07)",
        border: "0.5px solid rgba(52,211,153,0.25)",
        borderRadius: 6,
        marginBottom: 6,
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontFamily: "'DM Mono', monospace",
          color: "#6ee7b7",
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        ✓ ANSWER
      </span>
      <span
        style={{
          fontSize: 11,
          fontFamily: "'DM Mono', monospace",
          color: "#6ee7b7",
          fontWeight: 700,
          flexShrink: 0,
          marginRight: 6,
        }}
      >
        {correctOption}
      </span>
      <span
        style={{
          fontSize: 12,
          color: "var(--text-secondary)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {opt.text}
      </span>
    </div>
  );
}

// ── QUESTION INDEX BADGE ──────────────────────────────────────────────────────

function QBadge({ index, accentColor }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: accentColor,
        fontFamily: "'DM Mono', monospace",
        minWidth: 28,
        paddingTop: 2,
        letterSpacing: "0.04em",
        flexShrink: 0,
      }}
    >
      Q{index + 1}
    </div>
  );
}

// ── ACTION ROW ────────────────────────────────────────────────────────────────

function ActionRow({
  showAnswer,
  onToggleAnswer,
  selected,
  onReset,
  isCorrect,
  correctOption,
  accentColor,
}) {
  return (
    <div
      style={{
        padding: "10px 20px 14px",
        display: "flex",
        gap: 8,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <button
        onClick={onToggleAnswer}
        style={{
          fontSize: 11,
          padding: "6px 16px",
          borderRadius: 8,
          border: `0.5px solid ${accentColor}`,
          background: showAnswer ? `${accentColor}22` : "transparent",
          color: accentColor,
          cursor: "pointer",
          fontWeight: 600,
          transition: "all .15s",
          fontFamily: "'DM Sans', sans-serif",
          letterSpacing: "0.02em",
        }}
      >
        {showAnswer ? "Hide Explanation" : "Show Explanation"}
      </button>

      {selected !== null && (
        <button
          onClick={onReset}
          style={{
            fontSize: 11,
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
        <span
          style={{
            fontSize: 11,
            color: isCorrect ? "#6ee7b7" : "#fca5a5",
            fontWeight: 700,
            fontFamily: "'DM Mono', monospace",
            letterSpacing: "0.04em",
          }}
        >
          {isCorrect ? "✓ Correct" : `✗ Correct answer: ${correctOption}`}
        </span>
      )}
    </div>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────

/**
 * QuestionRenderer
 *
 * @param {object} q            — full question object
 * @param {number} index        — 0-based question index
 * @param {string} accentColor  — subject accent color
 */
export default function QuestionRenderer({ q, index, accentColor = "#4F8EF7" }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(false);

  if (!q) return null;

  const isRevealed = showAnswer || selected !== null;
  const isCorrect = selected === q.correctOption;

  // Determine option state for rendering
  function getOptionState(optId) {
    if (!isRevealed) {
      return selected === optId ? "selected" : "idle";
    }
    if (optId === q.correctOption) return "correct";
    if (selected === optId) return "wrong";
    return "dimmed";
  }

  function handleOptionClick(optId) {
    if (isRevealed) return; // locked once revealed
    setSelected(optId);
  }

  function handleReset() {
    setSelected(null);
    setShowAnswer(false);
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--bg-surface)",
        border: "0.5px solid var(--bg-border)",
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: hovered ? "var(--shadow-md)" : "var(--shadow-sm)",
        transition: "box-shadow .2s",
      }}
    >
      {/* ── Question Header ── */}
      <div
        style={{
          padding: "16px 20px 12px",
          borderBottom: "0.5px solid var(--bg-border)",
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <QBadge index={index} accentColor={accentColor} />
        <QuestionTextRenderer text={q.questionText} accentColor={accentColor} />
      </div>

      {/* ── Metadata Row ── */}
      <div
        style={{
          padding: "8px 20px",
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          alignItems: "center",
          borderBottom: "0.5px solid var(--bg-border)",
        }}
      >
        <YearBadge year={q.year} />
        <DiffBadge difficulty={q.difficulty} />
        <SubtopicBadge text={q.subTopic} />
      </div>

      {/* ── Options ── */}
      <div style={{ padding: "14px 20px 4px" }}>
        {(q.options || []).map((opt) => (
          <OptionItem
            key={opt.id}
            opt={opt}
            state={getOptionState(opt.id)}
            accentColor={accentColor}
            onClick={() => handleOptionClick(opt.id)}
          />
        ))}
      </div>

      {/* ── Answer reveal (if selected before explanation) ── */}
      {isRevealed && !showAnswer && (
        <div style={{ padding: "0 20px 2px" }}>
          <CorrectBanner correctOption={q.correctOption} options={q.options} />
        </div>
      )}

      {/* ── Action Row ── */}
      <ActionRow
        showAnswer={showAnswer}
        onToggleAnswer={() => setShowAnswer((v) => !v)}
        selected={selected}
        onReset={handleReset}
        isCorrect={isCorrect}
        correctOption={q.correctOption}
        accentColor={accentColor}
      />

      {/* ── Explanation Panel ── */}
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
