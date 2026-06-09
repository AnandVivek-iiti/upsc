/**
 * ExplanationBox.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * UPSC PYQ — Central Explanation Rendering Engine
 *
 * Handles ALL known explanation patterns from the data corpus:
 *   1. Statement N is CORRECT/INCORRECT: ...          (Statement-type)
 *   2. Row N (Label): ...                             (Row/Column-type, colon + parens)
 *   3. Relationship N is CORRECT/INCORRECT — ...      (Relationship-type, em-dash)
 *   4. Project/Point N — Label is CORRECT/INCORRECT  (Project/point-type, em-dash first)
 *   5. Option A/B is CORRECT/INCORRECT: ...           (Option-type)
 *   6. Plain narrative paragraphs                     (No markers)
 *   7. "Therefore,/Hence,/Thus," terminal summaries   (Conclusion-type)
 *
 * Props:
 *   text        {string}  — raw explanation string from data
 *   accentColor {string}  — subject accent hex, e.g. "#4F8EF7"
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── MASTER TOKENIZER ──────────────────────────────────────────────────────────
//
// Splits raw text into labeled segments. The regex is carefully ordered so that
// more-specific patterns win over general ones, and nested parens/colons inside
// labels do NOT cause false splits.
//
// Capture groups:
//   [1] = optional leading "(N.)" numbering from some sources (ignored in label)
//   [2] = full matched prefix including status word  ← used to derive label + status
//
// Pattern anatomy (left to right priority):
//   A. "Statement I/II/1/2 is CORRECT/INCORRECT"  (colon or em-dash follows)
//   B. "Relationship 1 is CORRECT/INCORRECT"      (colon or em-dash follows)
//   C. "Option A is CORRECT/INCORRECT"            (colon or em-dash follows)
//   D. "Row/Column/Pair/Point/Project N (…) is CORRECT/INCORRECT"
//   E. "Row/Column/Pair N (…):"                   (no status word, parenthetical label)
//   F. "Project/Point N — Label text is CORRECT/INCORRECT"   (em-dash, status at end)
//   G. "A./B./C./D. Label — text"                 (lettered list items in match-type)

const BLOCK_REGEX =
  /(?:^|\n\n?|\. )(?:\(\d+\)\s*)?((?:Statement|Relationship|Option|Row|Column|Pair|Point|Project|Claim|Premise|Assertion)\s+(?:[IVX]+|\d+|[A-D])\s*(?:\([^)]*\))?\s*(?:—|–|--)?\s*(?:[^:—\n]{0,60}?)?\s*(?:is\s+(?:CORRECT|INCORRECT|correct|incorrect))?\s*[:—–])/gi;

// Simpler sequential splitter used as the main engine
const SEQ_TOKEN_RE =
  /(?=(?:Statement|Relationship|Option|Row|Column|Pair|Point|Project|Claim|Assertion|Premise)\s+(?:[IVX]+|\d+|[A-D])\b)/gi;

// Terminal conclusion detector
const CONCLUSION_RE = /^(Therefore|Hence|Thus|So|Consequently|In conclusion|It follows that)[,\s]/i;

// Status word extractor — finds CORRECT/INCORRECT in a header segment
const STATUS_RE = /\b(CORRECT|INCORRECT|correct|incorrect)\b/i;

// Clean label extractor — strips status words, colons, dashes, extra spaces
function extractLabel(raw) {
  return raw
    .replace(/\b(is\s+)?(CORRECT|INCORRECT|correct|incorrect)\b/gi, "")
    .replace(/[:\—–\-]+\s*$/, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function extractStatus(raw) {
  const m = STATUS_RE.exec(raw);
  if (!m) return null;
  return m[1].toUpperCase(); // "CORRECT" | "INCORRECT"
}

// ── PARSE ENGINE ──────────────────────────────────────────────────────────────

function parseExplanation(text) {
  if (!text || typeof text !== "string") return [];

  const trimmed = text.trim();

  // ── Phase 1: isolate trailing conclusion sentence ──────────────────────────
  // "Therefore, only X is correct." is always the last sentence.
  let mainText = trimmed;
  let conclusionText = null;

  const sentenceEnds = trimmed.match(/[.!?]\s+[A-Z]/g);
  if (sentenceEnds) {
    // Walk from end to find first sentence starting with a conclusion keyword
    const sentences = trimmed.split(/(?<=[.!?])\s+(?=[A-Z])/);
    const lastIdx = sentences.length - 1;
    if (CONCLUSION_RE.test(sentences[lastIdx])) {
      conclusionText = sentences[lastIdx];
      mainText = sentences.slice(0, lastIdx).join(" ");
    }
  } else if (CONCLUSION_RE.test(trimmed)) {
    conclusionText = trimmed;
    mainText = "";
  }

  // ── Phase 2: detect if text has sequential markers ─────────────────────────
  const hasMarkers = SEQ_TOKEN_RE.test(mainText);
  SEQ_TOKEN_RE.lastIndex = 0; // reset regex state after .test()

  const blocks = [];

  if (!hasMarkers) {
    // ── Plain narrative — render as paragraph(s) ──────────────────────────
    const paragraphs = mainText.split(/\n{2,}/).filter((p) => p.trim());
    paragraphs.forEach((para) => {
      blocks.push({ type: "narrative", content: para.trim() });
    });
  } else {
    // ── Sequential parsing ────────────────────────────────────────────────
    // Split on keyword boundaries while keeping the keyword in the segment
    const parts = mainText.split(SEQ_TOKEN_RE).filter((p) => p.trim());

    parts.forEach((segment) => {
      const seg = segment.trim();
      if (!seg) return;

      // Detect the header line vs body content
      // Header = everything up to the first colon or em-dash that follows the label
      // We look for the pattern: "Keyword N (optional-parens) [is STATUS] [:—]"
      const headerMatch = seg.match(
        /^((?:Statement|Relationship|Option|Row|Column|Pair|Point|Project|Claim|Assertion|Premise)\s+(?:[IVX]+|\d+|[A-D])(?:\s*\([^)]*\))?(?:\s*—\s*[^:—\n]{0,60}?)?\s*(?:is\s+(?:CORRECT|INCORRECT|correct|incorrect))?\s*[:—–])/i
      );

      if (headerMatch) {
        const rawHeader = headerMatch[1];
        const body = seg.slice(rawHeader.length).trim();
        const label = extractLabel(rawHeader);
        const status = extractStatus(rawHeader) || extractStatus(body.slice(0, 80));

        // If status was in body (e.g. "Relationship 1 — ... is CORRECT"), strip it from body start
        const cleanBody = body.replace(/^is\s+(CORRECT|INCORRECT)\s*/i, "").replace(/^[.:\s—–]+/, "").trim();

        blocks.push({
          type: "sequential",
          label,
          status: status,
          content: cleanBody,
        });
      } else {
        // Fallback: treat as continuation narrative
        blocks.push({ type: "narrative", content: seg });
      }
    });
  }

  // ── Phase 3: append conclusion block ──────────────────────────────────────
  if (conclusionText) {
    blocks.push({ type: "conclusion", content: conclusionText });
  }

  // Guard: if nothing parsed (edge case), return whole text as narrative
  if (blocks.length === 0) {
    blocks.push({ type: "narrative", content: trimmed });
  }

  return blocks;
}

// ── STATUS BADGE ──────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  if (!status) return null;
  const isCorrect = status === "CORRECT";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.08em",
        padding: "2px 7px",
        borderRadius: 4,
        fontFamily: "'DM Mono', monospace",
        background: isCorrect ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.12)",
        color: isCorrect ? "#6ee7b7" : "#fca5a5",
        border: `0.5px solid ${isCorrect ? "rgba(52,211,153,0.35)" : "rgba(248,113,113,0.35)"}`,
        flexShrink: 0,
        userSelect: "none",
        textTransform: "uppercase",
      }}
    >
      {isCorrect ? "✓" : "✗"} {status}
    </span>
  );
}

// ── SEQUENTIAL BLOCK CARD ─────────────────────────────────────────────────────

function SequentialCard({ block, accentColor, index }) {
  const isCorrect = block.status === "CORRECT";
  const isIncorrect = block.status === "INCORRECT";

  const borderColor = isCorrect
    ? "rgba(52,211,153,0.3)"
    : isIncorrect
    ? "rgba(248,113,113,0.25)"
    : "var(--bg-border)";

  const bgColor = isCorrect
    ? "rgba(52,211,153,0.04)"
    : isIncorrect
    ? "rgba(248,113,113,0.04)"
    : "var(--bg-muted)";

  const leftAccent = isCorrect
    ? "#34d399"
    : isIncorrect
    ? "#f87171"
    : accentColor;

  return (
    <div
      style={{
        background: bgColor,
        border: `0.5px solid ${borderColor}`,
        borderLeft: `3px solid ${leftAccent}`,
        borderRadius: 8,
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 7,
        transition: "all 0.15s",
      }}
    >
      {/* Card Header: label + badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            fontFamily: "'DM Mono', monospace",
            color: leftAccent,
            letterSpacing: "0.04em",
            flexShrink: 0,
          }}
        >
          {block.label}
        </span>
        {block.status && <StatusBadge status={block.status} />}
      </div>

      {/* Body content */}
      {block.content && (
        <p
          style={{
            margin: 0,
            fontSize: 13,
            lineHeight: 1.7,
            color: "var(--text-secondary)",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {block.content}
        </p>
      )}
    </div>
  );
}

// ── NARRATIVE BLOCK ───────────────────────────────────────────────────────────

function NarrativeBlock({ content, accentColor }) {
  return (
    <div
      style={{
        background: "var(--bg-muted)",
        border: "0.5px solid var(--bg-border)",
        borderRadius: 8,
        borderLeft: `3px solid ${accentColor}33`,
        padding: "12px 14px",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 13,
          lineHeight: 1.75,
          color: "var(--text-secondary)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {content}
      </p>
    </div>
  );
}

// ── CONCLUSION BLOCK ──────────────────────────────────────────────────────────

function ConclusionBlock({ content, accentColor }) {
  return (
    <div
      style={{
        background: `${accentColor}0d`,
        border: `0.5px solid ${accentColor}33`,
        borderRadius: 8,
        padding: "11px 14px",
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontFamily: "'DM Mono', monospace",
          color: accentColor,
          fontWeight: 700,
          letterSpacing: "0.06em",
          paddingTop: 2,
          flexShrink: 0,
          userSelect: "none",
        }}
      >
        ∴
      </span>
      <p
        style={{
          margin: 0,
          fontSize: 13,
          lineHeight: 1.7,
          color: "var(--text-primary)",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500,
        }}
      >
        {content}
      </p>
    </div>
  );
}

// ── LAYOUT GRID ───────────────────────────────────────────────────────────────
// Sequential cards get a 2-column grid on wide screens.
// Narrative + conclusion always span full width.

function BlockGrid({ children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 8,
      }}
    >
      {children}
    </div>
  );
}

// ── SUMMARY ROW ───────────────────────────────────────────────────────────────
// Shows X Correct / Y Incorrect pill count at top if we have sequential blocks

function SummaryRow({ blocks, accentColor }) {
  const seq = blocks.filter((b) => b.type === "sequential");
  if (seq.length < 2) return null;

  const correctCount = seq.filter((b) => b.status === "CORRECT").length;
  const incorrectCount = seq.filter((b) => b.status === "INCORRECT").length;
  const unknownCount = seq.filter((b) => !b.status).length;

  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        alignItems: "center",
        flexWrap: "wrap",
        marginBottom: 10,
      }}
    >
      <span
        style={{
          fontSize: 10,
          color: "var(--text-muted)",
          fontFamily: "'DM Mono', monospace",
          letterSpacing: "0.06em",
          marginRight: 2,
        }}
      >
        ANALYSIS
      </span>
      {correctCount > 0 && (
        <span
          style={{
            fontSize: 10,
            padding: "2px 8px",
            borderRadius: 12,
            background: "rgba(52,211,153,0.12)",
            color: "#6ee7b7",
            border: "0.5px solid rgba(52,211,153,0.3)",
            fontFamily: "'DM Mono', monospace",
            fontWeight: 600,
          }}
        >
          ✓ {correctCount} Correct
        </span>
      )}
      {incorrectCount > 0 && (
        <span
          style={{
            fontSize: 10,
            padding: "2px 8px",
            borderRadius: 12,
            background: "rgba(248,113,113,0.12)",
            color: "#fca5a5",
            border: "0.5px solid rgba(248,113,113,0.3)",
            fontFamily: "'DM Mono', monospace",
            fontWeight: 600,
          }}
        >
          ✗ {incorrectCount} Incorrect
        </span>
      )}
      {unknownCount > 0 && (
        <span
          style={{
            fontSize: 10,
            padding: "2px 8px",
            borderRadius: 12,
            background: "var(--bg-muted)",
            color: "var(--text-muted)",
            border: "0.5px solid var(--bg-border)",
            fontFamily: "'DM Mono', monospace",
            fontWeight: 600,
          }}
        >
          ~ {unknownCount} Neutral
        </span>
      )}
    </div>
  );
}

// ── SOURCES ROW ───────────────────────────────────────────────────────────────

function SourcesRow({ sources }) {
  if (!sources || sources.length === 0) return null;
  return (
    <div
      style={{
        marginTop: 12,
        paddingTop: 10,
        borderTop: "0.5px solid var(--bg-border)",
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        alignItems: "center",
      }}
    >
      <span
        style={{
          fontSize: 9,
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
          style={{
            fontSize: 10,
            padding: "2px 8px",
            borderRadius: 4,
            background: "var(--bg-muted)",
            border: "0.5px solid var(--bg-border)",
            color: "var(--text-muted)",
            fontFamily: "'DM Mono', monospace",
          }}
          title={src.chapter || ""}
        >
          {src.name}
        </span>
      ))}
    </div>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────

/**
 * ExplanationBox
 *
 * @param {string}   text        — raw explanation string
 * @param {string}   accentColor — subject hex color
 * @param {Array}    sources     — optional array of {name, chapter} objects
 */
export default function ExplanationBox({ text, accentColor = "#4F8EF7", sources }) {
  if (!text) return null;

  const blocks = parseExplanation(text);

  // Separate sequential vs non-sequential for layout decisions
  const seqBlocks = blocks.filter((b) => b.type === "sequential");
  const hasSeqBlocks = seqBlocks.length > 0;

  return (
    <div
      style={{
        borderTop: "0.5px solid var(--bg-border)",
        padding: "16px 20px 18px",
        background: "var(--bg-base)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
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
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: accentColor,
            fontFamily: "'DM Mono', monospace",
            textTransform: "uppercase",
          }}
        >
          Explanation
        </span>
      </div>

      {/* Summary pills */}
      {hasSeqBlocks && <SummaryRow blocks={blocks} accentColor={accentColor} />}

      {/* Render blocks */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(() => {
          // Group consecutive sequential blocks for grid layout
          const rendered = [];
          let seqBuffer = [];

          const flushBuffer = (key) => {
            if (seqBuffer.length > 0) {
              rendered.push(
                <BlockGrid key={`grid-${key}`}>
                  {seqBuffer.map((b, i) => (
                    <SequentialCard
                      key={i}
                      block={b}
                      accentColor={accentColor}
                      index={i}
                    />
                  ))}
                </BlockGrid>
              );
              seqBuffer = [];
            }
          };

          blocks.forEach((block, idx) => {
            if (block.type === "sequential") {
              seqBuffer.push(block);
            } else {
              flushBuffer(idx);
              if (block.type === "conclusion") {
                rendered.push(
                  <ConclusionBlock
                    key={idx}
                    content={block.content}
                    accentColor={accentColor}
                  />
                );
              } else {
                rendered.push(
                  <NarrativeBlock
                    key={idx}
                    content={block.content}
                    accentColor={accentColor}
                  />
                );
              }
            }
          });

          flushBuffer("end");
          return rendered;
        })()}
      </div>

      {/* Sources */}
      <SourcesRow sources={sources} />
    </div>
  );
}