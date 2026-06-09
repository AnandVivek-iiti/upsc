import React from "react";

export default function MatchTable({ dataString }) {
  if (!dataString) return null;

  // Split lines and filter out empty or markdown separator rows (e.g., |---|---|)
  const lines = dataString
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && !line.includes("---"));

  if (lines.length < 1) return null;

  // Helper to extract clean cells from a pipeline row
  const extractCells = (line) =>
    line
      .split("|")
      .map((cell) => cell.trim())
      .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

  const headers = extractCells(lines[0]);
  const rows = lines.slice(1).map((line) => extractCells(line));

  return (
    <div
      style={{
        width: "100%",
        overflowX: "auto",
        marginTop: 12,
        marginBottom: 16,
        border: "0.5px solid var(--bg-border)",
        borderRadius: 8,
        background: "var(--bg-muted)",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "left",
          fontSize: 13,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <thead>
          <tr style={{ borderBottom: "0.5px solid var(--bg-border)" }}>
            {headers.map((header, idx) => (
              <th
                key={idx}
                style={{
                  padding: "10px 14px",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  fontSize: 11,
                  fontFamily: "'DM Mono', monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              style={{
                borderBottom:
                  rowIdx !== rows.length - 1
                    ? "0.5px solid var(--bg-border)"
                    : "none",
              }}
            >
              {row.map((cell, cellIdx) => (
                <td
                  key={cellIdx}
                  style={{
                    padding: "10px 14px",
                    color:
                      cellIdx === 0
                        ? "var(--text-muted)"
                        : "var(--text-primary)",
                    fontWeight: cellIdx === 0 ? 600 : 400,
                  }}
                >
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