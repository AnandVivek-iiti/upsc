
import { useState } from "react";
import ExplanationBox from "./ExplanationBox";
// ── ROBUST MATCHTABLE (handles malformed pipe tables) ─────────────────────────
function MatchTable({ dataString }) {
  if (!dataString) return null;

  const lines = dataString
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.startsWith("|") && !l.includes("---")); // skip separator rows

  if (lines.length === 0) return null;

  const rows = lines.map(line => {
    const cells = line.split("|").map(cell => cell.trim());
    if (cells[0] === "") cells.shift();
    if (cells[cells.length - 1] === "") cells.pop();
    return cells;
  });

  if (rows.length === 0) return null;
  const header = rows[0];
  const columnCount = header.length;
  const normalizedRows = rows.map(row => {
    if (row.length === columnCount) return row;
    if (row.length < columnCount) {
      return [...row, ...Array(columnCount - row.length).fill("")];
    }
    return row.slice(0, columnCount);
  });

  const bodyRows = normalizedRows.slice(1);

  const cellStyle = (isHeader = false) => ({
    padding: "clamp(6px, 2.5vw, 10px) clamp(8px, 3vw, 12px)",
    fontSize: isHeader ? "clamp(9px, 3vw, 11px)" : "clamp(11px, 3.5vw, 13px)",
    fontFamily: isHeader ? "'DM Mono', monospace" : "'DM Sans', sans-serif",
    fontWeight: isHeader ? 700 : 400,
    color: isHeader ? "var(--text-muted)" : "var(--text-primary)",
    letterSpacing: isHeader ? "0.05em" : 0,
    textAlign: "left",
    borderBottom: "0.5px solid var(--bg-border)",
    verticalAlign: "top",
    lineHeight: 1.5,
  });

  return (
    <div
      style={{
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        borderRadius: 10,
        border: "0.5px solid var(--bg-border)",
        margin: "12px 0",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--bg-muted)" }}>
            {header.map((cell, i) => (
              <th key={i} style={cellStyle(true)}>
                {cell || " "}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, ri) => (
            <tr
              key={ri}
              style={{
                background: ri % 2 === 0 ? "transparent" : "var(--bg-muted)",
              }}
            >
              {row.map((cell, ci) => (
                <td key={ci} style={cellStyle(false)}>
                  {cell || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
// ── QUESTION TEXT RENDERER (responsive, better readability) ──────────────────
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
          fontSize: "clamp(14px, 4.5vw, 16px)",
          fontWeight: 500,
          color: "var(--text-primary)",
          lineHeight: 1.7,
        }}
      >
        {before.join("\n").trim() && (
          <div style={{ whiteSpace: "pre-wrap", marginBottom: 8 }}>
            {before.join("\n").trim()}
          </div>
        )}
        <MatchTable dataString={tableLines.join("\n")} />
        {after.join("\n").trim() && (
          <div style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>
            {after.join("\n").trim()}
          </div>
        )}
      </div>
    );
  }

  // Detect numbered statement list format
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
          fontSize: "clamp(14px, 4.5vw, 16px)",
          fontWeight: 500,
          color: "var(--text-primary)",
          lineHeight: 1.7,
        }}
      >
        {intro.join("\n").trim() && (
          <div style={{ whiteSpace: "pre-wrap", marginBottom: 12 }}>
            {intro.join("\n").trim()}
          </div>
        )}
        {parts.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              margin: "8px 0",
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
                    gap: 12,
                    padding: "clamp(8px, 3vw, 12px) clamp(10px, 3.5vw, 14px)",
                    background: "var(--bg-muted)",
                    borderRadius: 10,
                    border: "0.5px solid var(--bg-border)",
                    borderLeft: `2px solid ${accentColor}66`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "clamp(11px, 3.5vw, 12px)",
                      fontWeight: 700,
                      color: accentColor,
                      flexShrink: 0,
                      minWidth: 24,
                      paddingTop: 1,
                    }}
                  >
                    {marker}
                  </span>
                  <span
                    style={{
                      fontSize: "clamp(13px, 4vw, 14px)",
                      color: "var(--text-primary)",
                      lineHeight: 1.65,
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
        fontSize: "clamp(14px, 4.5vw, 16px)",
        fontWeight: 500,
        color: "var(--text-primary)",
        lineHeight: 1.7,
        whiteSpace: "pre-wrap",
      }}
    >
      {text}
    </div>
  );
}

// ── OPTION ITEM (larger touch target, better contrast) ───────────────────────
function OptionItem({ opt, state, accentColor, onClick }) {
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
        gap: 14,
        alignItems: "flex-start",
        padding: "clamp(10px, 3.5vw, 14px) clamp(12px, 4vw, 16px)",
        borderRadius: 10,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.15s",
        marginBottom: 8,
        fontFamily: "'DM Sans', sans-serif",
        minHeight: 48,
        ...current,
      }}
    >
      <span
        style={{
          fontSize: "clamp(12px, 4vw, 13px)",
          fontWeight: 700,
          fontFamily: "'DM Mono', monospace",
          color: marker.color,
          minWidth: 22,
          paddingTop: 2,
          flexShrink: 0,
          transition: "color 0.15s",
        }}
      >
        {marker.text}
      </span>
      <span
        style={{
          fontSize: "clamp(13px, 4.5vw, 14px)",
          lineHeight: 1.6,
          color: "inherit",
        }}
      >
        {opt.text}
      </span>
    </div>
  );
}

// ── BADGES (responsive fonts, subtle colors) ─────────────────────────────────
const DIFF_COLORS = {
  Easy: { bg: "rgba(52,211,153,0.12)", text: "#34d399", border: "rgba(52,211,153,0.3)" },
  Medium: { bg: "rgba(251,191,36,0.12)", text: "#eab308", border: "rgba(251,191,36,0.3)" },
  Hard: { bg: "rgba(248,113,113,0.12)", text: "#f87171", border: "rgba(248,113,113,0.3)" },
};

function DiffBadge({ difficulty }) {
  const d = DIFF_COLORS[difficulty];
  if (!d) return null;
  return (
    <span
      style={{
        fontSize: "clamp(9px, 3vw, 10px)",
        padding: "2px 10px",
        borderRadius: 20,
        background: d.bg,
        color: d.text,
        border: `0.5px solid ${d.border}`,
        fontFamily: "'DM Mono', monospace",
        fontWeight: 600,
        letterSpacing: "0.05em",
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
        fontSize: "clamp(9px, 3vw, 10px)",
        padding: "2px 10px",
        borderRadius: 20,
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

function SubtopicBadge({ text }) {
  if (!text) return null;
  return (
    <span
      style={{
        fontSize: "clamp(9px, 3vw, 10px)",
        padding: "2px 10px",
        borderRadius: 20,
        background: "var(--bg-muted)",
        color: "var(--text-muted)",
        border: "0.5px solid var(--bg-border)",
        fontFamily: "'DM Mono', monospace",
        maxWidth: 220,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
      title={text}
    >
      {text}
    </span>
  );
}

// ── CORRECT ANSWER BANNER (soft, readable) ───────────────────────────────────
function CorrectBanner({ correctOption, options }) {
  const opt = (options || []).find((o) => o.id === correctOption);
  if (!opt) return null;
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        flexWrap: "wrap",
        padding: "clamp(8px, 3vw, 10px) clamp(12px, 4vw, 16px)",
        background: "rgba(52,211,153,0.06)",
        border: "0.5px solid rgba(52,211,153,0.25)",
        borderRadius: 10,
        marginBottom: 8,
      }}
    >
      <span
        style={{
          fontSize: "clamp(10px, 3.5vw, 11px)",
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
          fontSize: "clamp(11px, 3.5vw, 12px)",
          fontFamily: "'DM Mono', monospace",
          color: "#6ee7b7",
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {correctOption}
      </span>
      <span
        style={{
          fontSize: "clamp(12px, 4vw, 13px)",
          color: "var(--text-secondary)",
          fontFamily: "'DM Sans', sans-serif",
          flex: 1,
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
  );
}

// ── ACTION ROW (responsive buttons, larger touch area) ───────────────────────
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
        padding: "clamp(8px, 3vw, 12px) clamp(14px, 4vw, 20px) clamp(12px, 4vw, 16px)",
        display: "flex",
        gap: 10,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <button
        onClick={onToggleAnswer}
        style={{
          fontSize: "clamp(11px, 4vw, 12px)",
          padding: "8px 18px",
          minHeight: 40,
          borderRadius: 30,
          border: `0.5px solid ${accentColor}`,
          background: showAnswer ? `${accentColor}22` : "transparent",
          color: accentColor,
          cursor: "pointer",
          fontWeight: 600,
          transition: "all 0.15s",
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
            fontSize: "clamp(11px, 4vw, 12px)",
            padding: "8px 14px",
            minHeight: 40,
            borderRadius: 30,
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
            fontSize: "clamp(11px, 3.5vw, 12px)",
            color: isCorrect ? "#6ee7b7" : "#fca5a5",
            fontWeight: 700,
            fontFamily: "'DM Mono', monospace",
          }}
        >
          {isCorrect ? "✓ Correct" : `✗ Answer: ${correctOption}`}
        </span>
      )}
    </div>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export default function QuestionRenderer({ q, index, accentColor = "#4F8EF7" }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(false);

  if (!q) return null;

  const isRevealed = showAnswer || selected !== null;
  const isCorrect = selected === q.correctOption;

  function getOptionState(optId) {
    if (!isRevealed) return selected === optId ? "selected" : "idle";
    if (optId === q.correctOption) return "correct";
    if (selected === optId) return "wrong";
    return "dimmed";
  }

  function handleOptionClick(optId) {
    if (isRevealed) return;
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
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: hovered ? "var(--shadow-md)" : "var(--shadow-sm)",
        transition: "box-shadow 0.2s",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "clamp(14px, 4vw, 18px) clamp(14px, 4vw, 20px) 12px",
          borderBottom: "0.5px solid var(--bg-border)",
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
        }}
      >
        <QBadge index={index} accentColor={accentColor} />
        <QuestionTextRenderer text={q.questionText} accentColor={accentColor} />
      </div>

      {/* Metadata row */}
      <div
        style={{
          padding: "6px clamp(14px, 4vw, 20px)",
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
          borderBottom: "0.5px solid var(--bg-border)",
        }}
      >
        <YearBadge year={q.year} />
        <DiffBadge difficulty={q.difficulty} />
        <SubtopicBadge text={q.subTopic} />
      </div>

      {/* Options */}
      <div style={{ padding: "12px clamp(14px, 4vw, 20px) 4px" }}>
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

      {/* Answer banner (if revealed without explanation) */}
      {isRevealed && !showAnswer && (
        <div style={{ padding: "0 clamp(14px, 4vw, 20px) 6px" }}>
          <CorrectBanner correctOption={q.correctOption} options={q.options} />
        </div>
      )}

      {/* Action row */}
      <ActionRow
        showAnswer={showAnswer}
        onToggleAnswer={() => setShowAnswer((v) => !v)}
        selected={selected}
        onReset={handleReset}
        isCorrect={isCorrect}
        correctOption={q.correctOption}
        accentColor={accentColor}
      />

      {/* Explanation (uses existing ExplanationBox, already responsive) */}
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