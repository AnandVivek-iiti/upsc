// import React from "react";

export default function MatchTable({ dataString }) {
  if (!dataString) return null;

  const lines = dataString
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.startsWith("|") && !l.includes("---"));

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
    if (row.length < columnCount) return [...row, ...Array(columnCount - row.length).fill("")];
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
        width: "100%",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        marginTop: 12,
        marginBottom: 16,
        border: "0.5px solid var(--bg-border)",
        borderRadius: 8,
        background: "var(--bg-muted)",
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