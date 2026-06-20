// ─── QuestionStats.jsx with Filled Donut + Subject Pie+Table + Topic Table ──

import { useMemo, useState, useEffect } from "react";
import {
  Target,
  CheckCircle2,
  XCircle,
  Ban,
  BookMarked,
  ListChecks,
  Trash2,
  Info,
  PieChart as PieChartIcon,
  Table,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
} from "lucide-react";
import { useQuestionAttempts } from "../hooks/useQuestionAttempts";

// ─── Palette ──────────────────────────────────────────────────────────────
const P = {
  correct:  { solid: "#34d399", dim: "rgba(52,211,153,0.12)" },
  wrong:    { solid: "#f87171", dim: "rgba(248,113,113,0.12)" },
  skipped:  { solid: "#94a3b8", dim: "rgba(148,163,184,0.10)" },
  gold:     { solid: "#fbbf24", dim: "rgba(251,191,36,0.12)" },
  blue:     { solid: "#3b82f6", dim: "rgba(59,130,246,0.12)" },
  purple:   { solid: "#8b5cf6", dim: "rgba(139,92,246,0.12)" },
  indigo:   { solid: "#6366f1", dim: "rgba(99,102,241,0.12)" },
  pink:     { solid: "#ec4899", dim: "rgba(236,72,153,0.12)" },
  teal:     { solid: "#14b8a6", dim: "rgba(20,184,166,0.12)" },
  orange:   { solid: "#f97316", dim: "rgba(249,115,22,0.12)" },
  rose:     { solid: "#f43f5e", dim: "rgba(244,63,94,0.12)" },
  cyan:     { solid: "#06b6d4", dim: "rgba(6,182,212,0.12)" },
  lime:     { solid: "#84cc16", dim: "rgba(132,204,22,0.12)" },
};

// 30 distinct colors for pie chart - professional palette
const PIE_COLORS = [
  "#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899", "#14b8a6",
  "#f97316", "#ef4444", "#06b6d4", "#84cc16", "#8b5cf6",
  "#f472b6", "#22d3ee", "#a3e635", "#fb923c", "#818cf8",
  "#34d399", "#fbbf24", "#f87171", "#60a5fa", "#a78bfa",
  "#2dd4bf", "#e879f9", "#fb7185", "#facc15", "#4ade80",
  "#c084fc", "#38bdf8", "#fb923c", "#34d399", "#f472b6"
];

const SERIF = "'Playfair Display', Georgia, serif";
const SANS = "'DM Sans', sans-serif";
const MONO = "'DM Mono', monospace";

// ─── useGrow ─────────────────────────────────────────────────────────────
function useGrow(delay = 80) {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGrown(true), delay);
    return () => clearTimeout(t);
  }, []);
  return grown;
}

// ─── Filled Donut Ring ────────────────────────────────────────────────────
function FilledDonutRing({ correct, wrong, skipped, accuracy, size = 168 }) {
  const grown = useGrow(100);
  const total = correct + wrong + skipped || 1;
  const R = (size / 2) - 19;
  const CIRC = 2 * Math.PI * R;
  const cx = size / 2, cy = size / 2;

  const correctPct = correct / total;
  const wrongPct = wrong / total;
  const skippedPct = skipped / total;

  // Calculate filled arcs
  let currentAngle = 0;

  const segments = [
    { label: "Correct", count: correct, pct: correctPct, color: P.correct.solid },
    { label: "Wrong", count: wrong, pct: wrongPct, color: P.wrong.solid },
    { label: "Skipped", count: skipped, pct: skippedPct, color: P.skipped.solid },
  ].filter(s => s.count > 0);

  return (
    <div style={{ width: "100%", maxWidth: size, margin: "0 auto", position: "relative", aspectRatio: "1 / 1", flexShrink: 0 }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--bg-muted)" strokeWidth={14} />

        {/* Filled segments */}
        {segments.map((seg, i) => {
          const angle = seg.pct * 360;
          const startAngle = currentAngle - 90;
          currentAngle += angle;
          const endAngle = currentAngle - 90;

          const startRad = startAngle * Math.PI / 180;
          const endRad = endAngle * Math.PI / 180;

          const x1 = cx + R * Math.cos(startRad);
          const y1 = cy + R * Math.sin(startRad);
          const x2 = cx + R * Math.cos(endRad);
          const y2 = cy + R * Math.sin(endRad);

          const largeArc = angle > 180 ? 1 : 0;

          // For very small slices, use stroke approach
          const pathData = angle < 1 ? null : `
            M ${cx} ${cy}
            L ${x1} ${y1}
            A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}
            Z
          `;

          // For very small slices, use stroke dasharray
          if (angle < 1 && seg.pct > 0) {
            const dashLength = seg.pct * CIRC;
            return (
              <circle
                key={seg.label}
                cx={cx}
                cy={cy}
                r={R}
                fill="none"
                stroke={seg.color}
                strokeWidth={14}
                strokeDasharray={`${dashLength} ${CIRC - dashLength}`}
                strokeDashoffset={-startAngle / 360 * CIRC}
                transform={`rotate(-90 ${cx} ${cy})`}
                style={{
                  transition: "stroke-dasharray 0.9s cubic-bezier(0.34,1.56,0.64,1), stroke-dashoffset 0.9s cubic-bezier(0.34,1.56,0.64,1)",
                  opacity: grown ? 1 : 0,
                }}
              />
            );
          }

          return pathData ? (
            <path
              key={seg.label}
              d={pathData}
              fill={seg.color}
              style={{
                transition: "opacity 0.9s cubic-bezier(0.34,1.56,0.64,1)",
                opacity: grown ? 1 : 0,
              }}
            />
          ) : null;
        })}

        {/* Center circle */}
        <circle
          cx={cx}
          cy={cy}
          r={R * 0.28}
          fill="var(--bg-surface)"
          stroke="var(--bg-border)"
          strokeWidth={1.5}
          style={{
            transition: "all 0.3s ease",
          }}
        />
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={16}
          fontWeight={700}
          fill="var(--text-primary)"
          fontFamily={SERIF}
        >
          {accuracy}%
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={8}
          fill="var(--text-muted)"
          fontFamily={MONO}
          letterSpacing="0.5"
        >
          ACCURACY
        </text>
      </svg>
    </div>
  );
}

// ─── BreakdownRow ──────────────────────────────────────────────────────────
function BreakdownRow({ color, label, pct, pctLabel, countLabel, delay = 0 }) {
  const grown = useGrow(delay + 220);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, color: "var(--text-secondary)", fontFamily: SANS }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, boxShadow: `0 0 5px ${color}90`, flexShrink: 0 }} />
          {label}
        </span>
        <span style={{ display: "flex", alignItems: "baseline", gap: 7, fontFamily: MONO, flexShrink: 0 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color }}>{pctLabel}</span>
          <span style={{ fontSize: 9.5, color: "var(--text-muted)" }}>{countLabel}</span>
        </span>
      </div>
      <div style={{ height: 5, borderRadius: 6, background: "var(--bg-muted)", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: grown ? `${pct}%` : "0%",
          background: `linear-gradient(90deg, ${color}cc, ${color})`,
          borderRadius: 6,
          transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)",
        }} />
      </div>
    </div>
  );
}

// ─── Subject Pie Chart ──────────────────────────────────────────────────
function SubjectPieChart({ data, total, onSegmentClick, selectedSegment }) {
  const grown = useGrow(200);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (data.length === 0 || total === 0) return null;

  const size = 320;
  const R = (size / 2) - 10;
  const cx = size / 2, cy = size / 2;

  const sortedData = [...data].sort((a, b) => b.count - a.count);

  let cumulativeAngle = 0;
  const segments = sortedData.map((d, i) => {
    const pct = d.count / total;
    const angle = pct * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    const isSelected = selectedSegment === d.label;
    const isHovered = hoveredIndex === i;

    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (cumulativeAngle - 90) * Math.PI / 180;

    const x1 = cx + R * Math.cos(startRad);
    const y1 = cy + R * Math.sin(startRad);
    const x2 = cx + R * Math.cos(endRad);
    const y2 = cy + R * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const pathData = `
      M ${cx} ${cy}
      L ${x1} ${y1}
      A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}
      Z
    `;

    const midAngle = (startAngle + cumulativeAngle) / 2;
    const midRad = (midAngle - 90) * Math.PI / 180;
    const labelR = R * 0.65;
    const labelX = cx + labelR * Math.cos(midRad);
    const labelY = cy + labelR * Math.sin(midRad);

    return {
      ...d,
      pct,
      angle,
      startAngle,
      endAngle: cumulativeAngle,
      pathData,
      color: PIE_COLORS[i % PIE_COLORS.length],
      isSelected,
      isHovered,
      index: i,
      labelX,
      labelY,
    };
  });

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 12,
      width: "100%",
    }}>
      <div style={{
        position: "relative",
        width: size,
        height: size,
        maxWidth: "100%",
        aspectRatio: "1 / 1",
      }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
          {segments.map((seg) => (
            <g key={seg.label}>
              <path
                d={seg.pathData}
                fill={seg.color}
                stroke={seg.isSelected ? "#ffffff" : seg.isHovered ? "#ffffff" : "var(--bg-surface)"}
                strokeWidth={seg.isSelected ? 3 : seg.isHovered ? 2 : 0.5}
                style={{
                  cursor: "pointer",
                  transition: "opacity 0.2s ease, stroke-width 0.2s ease",
                  opacity: grown ? 1 : 0,
                  filter: seg.isSelected ? `drop-shadow(0 0 20px ${seg.color}88)` :
                          seg.isHovered ? `drop-shadow(0 0 12px ${seg.color}55)` : "none",
                }}
                onMouseEnter={() => setHoveredIndex(seg.index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSegmentClick(seg.label)}
              />
              {seg.pct > 0.03 && (
                <text
                  x={seg.labelX}
                  y={seg.labelY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={seg.pct > 0.07 ? 11 : 9}
                  fontWeight={seg.isSelected ? 700 : 600}
                  fill="#ffffff"
                  fontFamily={MONO}
                  style={{
                    pointerEvents: "none",
                    transition: "all 0.2s ease",
                    textShadow: "0 1px 8px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.6)",
                    opacity: grown ? 1 : 0,
                  }}
                >
                  {Math.round(seg.pct * 100)}%
                </text>
              )}
            </g>
          ))}

          <circle
            cx={cx}
            cy={cy}
            r={R * 0.28}
            fill="var(--bg-surface)"
            stroke="var(--bg-border)"
            strokeWidth={1.5}
          />
          <text
            x={cx}
            y={cy - 4}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={16}
            fontWeight={700}
            fill="var(--text-primary)"
            fontFamily={SERIF}
          >
            {total}
          </text>
          <text
            x={cx}
            y={cy + 14}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={8}
            fill="var(--text-muted)"
            fontFamily={MONO}
            letterSpacing="0.5"
          >
            TOTAL
          </text>
        </svg>
      </div>

      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "4px 10px",
        justifyContent: "center",
        maxWidth: size,
        padding: "0 4px",
        maxHeight: 100,
        overflowY: "auto",
      }}>
        {segments.map((seg) => (
          <span
            key={seg.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 9,
              fontFamily: MONO,
              color: seg.isSelected ? "var(--text-primary)" : "var(--text-muted)",
              padding: "2px 6px",
              borderRadius: 4,
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: seg.isSelected ? `${seg.color}22` : "transparent",
              border: seg.isSelected ? `1px solid ${seg.color}44` : "1px solid transparent",
            }}
            onClick={() => onSegmentClick(seg.label)}
          >
            <span style={{
              width: 10,
              height: 10,
              borderRadius: 3,
              background: seg.color,
              flexShrink: 0,
              border: "0.5px solid rgba(255,255,255,0.1)",
            }} />
            <span style={{ maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {seg.label}
            </span>
            <span style={{ color: "var(--text-muted)", opacity: 0.5, fontSize: 8 }}>
              {Math.round(seg.pct * 100)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Enhanced Data Table with More Filters ──────────────────────────────────
function EnhancedDataTable({ data, total, viewType }) {
  const [sortField, setSortField] = useState("count");
  const [sortDirection, setSortDirection] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [minAccuracy, setMinAccuracy] = useState(0);
  const [minAttempts, setMinAttempts] = useState(0);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    let result = data;

    // Search filter
    if (searchTerm.trim()) {
      result = result.filter(d =>
        d.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Min accuracy filter
    if (minAccuracy > 0) {
      result = result.filter(d => {
        const attempted = d.correct + d.wrong;
        if (attempted === 0) return false;
        const acc = (d.correct / attempted) * 100;
        return acc >= minAccuracy;
      });
    }

    // Min attempts filter
    if (minAttempts > 0) {
      result = result.filter(d => d.count >= minAttempts);
    }

    return result;
  }, [data, searchTerm, minAccuracy, minAttempts]);

  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    sorted.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });
    return sorted;
  }, [filteredData, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const SortableHeader = ({ field, label, align = "right" }) => (
    <th
      onClick={() => handleSort(field)}
      style={{
        padding: "10px 12px",
        fontSize: 11,
        fontFamily: MONO,
        fontWeight: 700,
        color: "var(--text-muted)",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        textAlign: align,
        cursor: "pointer",
        borderBottom: "2px solid var(--bg-border)",
        whiteSpace: "nowrap",
        transition: "color 0.2s ease",
        userSelect: "none",
      }}
    >
      {label} {sortField === field ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}
    </th>
  );

  return (
    <div style={{ width: "100%" }}>
      {/* Filters */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 10,
        marginBottom: 14,
        padding: "14px 16px",
        background: "var(--bg-muted)",
        borderRadius: 10,
        border: "1px solid var(--bg-border)",
      }}>
        <div style={{ position: "relative" }}>
          <Search size={14} style={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)",
            opacity: 0.5,
          }} />
          <input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={`Search ${viewType.toLowerCase()}...`}
            style={{
              width: "100%",
              padding: "7px 10px 7px 32px",
              fontSize: 12,
              fontFamily: SANS,
              background: "var(--bg-surface)",
              border: "1px solid var(--bg-border)",
              borderRadius: 8,
              color: "var(--text-primary)",
              outline: "none",
              transition: "all 0.2s ease",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: MONO }}>Min Acc:</span>
          <input
            type="number"
            min="0"
            max="100"
            value={minAccuracy}
            onChange={(e) => {
              setMinAccuracy(Math.min(100, Math.max(0, Number(e.target.value) || 0)));
              setCurrentPage(1);
            }}
            style={{
              width: 60,
              padding: "6px 8px",
              fontSize: 12,
              fontFamily: MONO,
              background: "var(--bg-surface)",
              border: "1px solid var(--bg-border)",
              borderRadius: 8,
              color: "var(--text-primary)",
              outline: "none",
              textAlign: "center",
            }}
          />
          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>%</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: MONO }}>Min Qs:</span>
          <input
            type="number"
            min="0"
            value={minAttempts}
            onChange={(e) => {
              setMinAttempts(Math.max(0, Number(e.target.value) || 0));
              setCurrentPage(1);
            }}
            style={{
              width: 60,
              padding: "6px 8px",
              fontSize: 12,
              fontFamily: MONO,
              background: "var(--bg-surface)",
              border: "1px solid var(--bg-border)",
              borderRadius: 8,
              color: "var(--text-primary)",
              outline: "none",
              textAlign: "center",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
          <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: MONO }}>Rows:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{
              padding: "6px 10px",
              fontSize: 11,
              fontFamily: MONO,
              background: "var(--bg-surface)",
              border: "1px solid var(--bg-border)",
              borderRadius: 8,
              color: "var(--text-primary)",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value={5}>5</option>
            <option value={8}>8</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{
        overflowX: "auto",
        borderRadius: 12,
        border: "1px solid var(--bg-border)",
        background: "var(--bg-surface)",
      }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 12,
        }}>
          <thead>
            <tr>
              <SortableHeader field="label" label={viewType} align="left" />
              <SortableHeader field="count" label="Total" />
              <SortableHeader field="correct" label="✓" />
              <SortableHeader field="wrong" label="✗" />
              <SortableHeader field="skipped" label="⊘" />
              <th style={{
                padding: "10px 12px",
                fontSize: 11,
                fontFamily: MONO,
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                textAlign: "right",
                borderBottom: "2px solid var(--bg-border)",
                whiteSpace: "nowrap",
              }}>
                Accuracy
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={6} style={{
                  padding: "32px",
                  textAlign: "center",
                  color: "var(--text-muted)",
                  fontFamily: MONO,
                  fontSize: 12,
                }}>
                  No {viewType.toLowerCase()}s match your filters
                </td>
              </tr>
            ) : (
              paginatedData.map((d, i) => {
                const attempted = d.correct + d.wrong;
                const acc = attempted > 0 ? Math.round((d.correct / attempted) * 100) : 0;
                const accColor = acc >= 70 ? P.correct.solid : acc >= 50 ? P.gold.solid : P.wrong.solid;
                const color = PIE_COLORS[(sortedData.indexOf(d)) % PIE_COLORS.length];

                return (
                  <tr
                    key={d.label}
                    style={{
                      borderBottom: i < paginatedData.length - 1 ? "1px solid var(--bg-border)" : "none",
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-muted)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{
                      padding: "10px 12px",
                      color: "var(--text-primary)",
                      fontWeight: 500,
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}>
                      <span style={{
                        width: 10,
                        height: 10,
                        borderRadius: 4,
                        background: color,
                        flexShrink: 0,
                        display: "inline-block",
                      }} />
                      <span style={{ wordBreak: "break-word" }}>{d.label}</span>
                    </td>
                    <td style={{
                      padding: "10px 12px",
                      textAlign: "right",
                      fontFamily: MONO,
                      color: "var(--text-secondary)",
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      {d.count}
                    </td>
                    <td style={{
                      padding: "10px 12px",
                      textAlign: "right",
                      fontFamily: MONO,
                      color: P.correct.solid,
                      fontWeight: 600,
                      fontSize: 12,
                    }}>
                      {d.correct}
                    </td>
                    <td style={{
                      padding: "10px 12px",
                      textAlign: "right",
                      fontFamily: MONO,
                      color: P.wrong.solid,
                      fontWeight: 600,
                      fontSize: 12,
                    }}>
                      {d.wrong}
                    </td>
                    <td style={{
                      padding: "10px 12px",
                      textAlign: "right",
                      fontFamily: MONO,
                      color: P.skipped.solid,
                      fontWeight: 600,
                      fontSize: 12,
                    }}>
                      {d.skipped}
                    </td>
                    <td style={{
                      padding: "10px 12px",
                      textAlign: "right",
                      fontFamily: MONO,
                      fontWeight: 700,
                      color: accColor,
                      fontSize: 12,
                    }}>
                      {attempted > 0 ? `${acc}%` : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 12,
          flexWrap: "wrap",
          gap: 8,
        }}>
          <span style={{
            fontSize: 10.5,
            fontFamily: MONO,
            color: "var(--text-muted)",
          }}>
            {sortedData.length} {viewType.toLowerCase()}s · Page {currentPage} of {totalPages}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: "6px 14px",
                fontSize: 10.5,
                fontFamily: MONO,
                background: "var(--bg-muted)",
                border: "1px solid var(--bg-border)",
                borderRadius: 8,
                color: currentPage === 1 ? "var(--text-muted)" : "var(--text-primary)",
                cursor: currentPage === 1 ? "default" : "pointer",
                opacity: currentPage === 1 ? 0.4 : 1,
                transition: "all 0.2s ease",
              }}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: "6px 14px",
                fontSize: 10.5,
                fontFamily: MONO,
                background: "var(--bg-muted)",
                border: "1px solid var(--bg-border)",
                borderRadius: 8,
                color: currentPage === totalPages ? "var(--text-muted)" : "var(--text-primary)",
                cursor: currentPage === totalPages ? "default" : "pointer",
                opacity: currentPage === totalPages ? 0.4 : 1,
                transition: "all 0.2s ease",
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── YearAreaChart ──────────────────────────────────────────────────────────
function YearAreaChart({ byYear }) {
  const grown = useGrow(300);
  const years = Object.keys(byYear).sort((a, b) => Number(a) - Number(b)).slice(-14);
  if (years.length < 2) return null;

  const W = 640, H = 140, PAD = { t: 16, b: 30, l: 34, r: 10 };
  const inner = { w: W - PAD.l - PAD.r, h: H - PAD.t - PAD.b };

  const maxTotal = Math.max(...years.map(y => byYear[y].total), 1);
  const pts = years.map((y, i) => ({
    x: PAD.l + (i / (years.length - 1)) * inner.w,
    yTotal: PAD.t + inner.h - (byYear[y].total / maxTotal) * inner.h,
    yCorrect: PAD.t + inner.h - (byYear[y].correct / maxTotal) * inner.h,
    year: y,
    total: byYear[y].total,
    correct: byYear[y].correct,
  }));

  const bottom = PAD.t + inner.h;

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.yTotal}`).join(" ");
  const areaPath = `${linePath} L${pts[pts.length - 1].x},${bottom} L${pts[0].x},${bottom} Z`;
  const cLinePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.yCorrect}`).join(" ");
  const cAreaPath = `${cLinePath} L${pts[pts.length - 1].x},${bottom} L${pts[0].x},${bottom} Z`;

  const showAll = years.length <= 8;
  const labelStep = Math.max(1, Math.ceil(years.length / 7));

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible", display: "block" }}>
      <defs>
        <linearGradient id="qAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={P.blue.solid} stopOpacity={grown ? 0.22 : 0} />
          <stop offset="100%" stopColor={P.blue.solid} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="qCorrectGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={P.correct.solid} stopOpacity={grown ? 0.32 : 0} />
          <stop offset="100%" stopColor={P.correct.solid} stopOpacity="0" />
        </linearGradient>
        <clipPath id="qGrow">
          <rect x={PAD.l} y={PAD.t} width={grown ? inner.w : 0} height={inner.h}
            style={{ transition: "width 1s cubic-bezier(0.22,1,0.36,1)" }} />
        </clipPath>
      </defs>

      {[0, 0.5, 1].map(f => (
        <line key={f}
          x1={PAD.l} x2={PAD.l + inner.w}
          y1={PAD.t + inner.h * (1 - f)} y2={PAD.t + inner.h * (1 - f)}
          stroke="var(--bg-border)" strokeWidth={0.5} strokeDasharray="3 3"
        />
      ))}

      <path d={areaPath} fill="url(#qAreaGrad)" clipPath="url(#qGrow)" />
      <path d={linePath} fill="none" stroke={P.blue.solid} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" clipPath="url(#qGrow)" />

      <path d={cAreaPath} fill="url(#qCorrectGrad)" clipPath="url(#qGrow)" />
      <path d={cLinePath} fill="none" stroke={P.correct.solid} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" clipPath="url(#qGrow)" />

      {grown && pts.map((p, i) => (
        <g key={p.year}>
          <circle cx={p.x} cy={p.yTotal} r={3} fill={P.blue.solid} style={{ opacity: grown ? 1 : 0, transition: `opacity 0.4s ${i * 40}ms` }} />
          <circle cx={p.x} cy={p.yCorrect} r={2.5} fill={P.correct.solid} style={{ opacity: grown ? 1 : 0, transition: `opacity 0.4s ${i * 40 + 100}ms` }} />
        </g>
      ))}

      {pts.map((p, i) => {
        if (!showAll && i % labelStep !== 0 && i !== pts.length - 1) return null;
        return (
          <text key={p.year} x={p.x} y={H - 8} textAnchor="middle"
            fill="var(--text-muted)" fontSize={9.5} fontFamily={MONO} fontWeight={600}>
            {p.year}
          </text>
        );
      })}

      <text x={PAD.l - 6} y={PAD.t + 4} textAnchor="end"
        fill="var(--text-muted)" fontSize={8.5} fontFamily={MONO}>
        {maxTotal}
      </text>
    </svg>
  );
}

// ─── StatTile ──────────────────────────────────────────────────────────────
function StatTile({ icon: Icon, value, label, color, sub, delay = 0 }) {
  const grown = useGrow(delay + 60);
  return (
    <div style={{
      background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: 16,
      padding: "18px 18px 16px", borderTop: `3px solid ${color}`,
      boxShadow: "var(--shadow-sm)", position: "relative", overflow: "hidden",
      opacity: grown ? 1 : 0, transform: grown ? "translateY(0)" : "translateY(10px)",
      transition: "opacity 0.5s ease, transform 0.5s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        {Icon && <Icon size={14} style={{ color, opacity: 0.9 }} />}
        <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: MONO, letterSpacing: 0.6, textTransform: "uppercase" }}>
          {label}
        </span>
      </div>
      <div style={{
        fontSize: 30, fontWeight: 800, lineHeight: 1, fontFamily: SERIF,
        background: `linear-gradient(135deg, var(--text-primary), ${color})`,
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
      }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 10, color, marginTop: 6, fontFamily: MONO, opacity: 0.85 }}>{sub}</div>}
    </div>
  );
}

// ─── SectionCard ──────────────────────────────────────────────────────────
function SectionCard({ title, accent, right, note, children, style = {} }) {
  return (
    <div style={{
      background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: 18,
      padding: "24px 24px 26px", boxShadow: "var(--shadow-sm)", ...style,
    }}>
      {(title || right) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: note ? 8 : 20, flexWrap: "wrap" }}>
          {title && (
            <div style={{
              fontSize: 15, fontWeight: 600, color: "var(--text-primary)",
              fontFamily: SERIF, display: "flex", alignItems: "center", gap: 10,
            }}>
              {accent && <span style={{ width: 4, height: 16, borderRadius: 2, background: accent, display: "inline-block", boxShadow: `0 0 8px ${accent}80` }} />}
              {title}
            </div>
          )}
          {right && (
            <span style={{ fontSize: 11, fontFamily: MONO, color: "var(--text-muted)" }}>{right}</span>
          )}
        </div>
      )}
      {note && (
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: MONO, marginBottom: 20, opacity: 0.85, lineHeight: 1.6 }}>
          {note}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Legend Dot ───────────────────────────────────────────────────────────
function LegendDot({ color, label }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)", fontFamily: MONO }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color, display: "inline-block" }} />
      {label}
    </span>
  );
}

// ─── Filter Chip ──────────────────────────────────────────────────────────
function Chip({ label, active, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 11, padding: "6px 14px", borderRadius: 20, cursor: "pointer",
        fontFamily: MONO, fontWeight: active ? 700 : 500, whiteSpace: "nowrap",
        transition: "all 0.2s ease",
        border: active ? `1px solid ${color}` : "1px solid var(--bg-border)",
        background: active ? `${color}18` : "transparent",
        color: active ? color : "var(--text-muted)",
        boxShadow: active ? `0 2px 8px ${color}25` : "none",
      }}
    >
      {label}
    </button>
  );
}

function FilterRow({ rowLabel, options, active, onPick, colorFor }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      <span style={{
        fontSize: 10, color: "var(--text-muted)", fontFamily: MONO, minWidth: 60,
        fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8,
      }}>
        {rowLabel}
      </span>
      {options.map((opt) => (
        <Chip
          key={opt}
          label={opt}
          active={active === opt}
          color={opt === "All" ? P.purple.solid : (colorFor ? colorFor(opt) : P.purple.solid)}
          onClick={() => onPick(opt)}
        />
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────
export default function QuestionStats() {
  const { attempts, clearAttempts } = useQuestionAttempts();
  const [showLog, setShowLog] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [viewMode, setViewMode] = useState("subjects");

  // ── Attempt Log filters ──
  const [sourceFilter, setSourceFilter] = useState("All");
  const [paperFilter, setPaperFilter] = useState("All");
  const [resultFilter, setResultFilter] = useState("All");
  const [diffFilter, setDiffFilter] = useState("All");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [search, setSearch] = useState("");

  // ── derived stats ──
  const total = attempts.length;
  const correct = attempts.filter(a => a.result === "correct").length;
  const wrong = attempts.filter(a => a.result === "wrong").length;
  const skipped = attempts.filter(a => a.result === "skipped").length;
  const graded = correct + wrong;
  const accuracy = graded > 0 ? Math.round((correct / graded) * 100) : 0;

  const pyqCount = attempts.filter(a => a.source !== "Test").length;
  const testCount = attempts.filter(a => a.source === "Test").length;

  const diffBreakdown = useMemo(() => {
    const map = {
      Easy: { correct: 0, wrong: 0, skipped: 0, total: 0 },
      Medium: { correct: 0, wrong: 0, skipped: 0, total: 0 },
      Hard: { correct: 0, wrong: 0, skipped: 0, total: 0 },
    };
    attempts.forEach(a => {
      const d = a.difficulty || "Medium";
      if (!map[d]) map[d] = { correct: 0, wrong: 0, skipped: 0, total: 0 };
      map[d].total++;
      if (a.result === "correct") map[d].correct++;
      else if (a.result === "wrong") map[d].wrong++;
      else map[d].skipped++;
    });
    return map;
  }, [attempts]);

  const byYear = useMemo(() => {
    const map = {};
    attempts.forEach(a => {
      if (!a.year) return;
      if (!map[a.year]) map[a.year] = { total: 0, correct: 0 };
      map[a.year].total++;
      if (a.result === "correct") map[a.year].correct++;
    });
    return map;
  }, [attempts]);

  const yearMeta = useMemo(() => {
    const entries = Object.entries(byYear);
    if (!entries.length) return null;
    let peak = entries[0];
    for (const e of entries) if (e[1].total > peak[1].total) peak = e;
    return { yearsTracked: entries.length, peakYear: peak[0], peakTotal: peak[1].total };
  }, [byYear]);

  // ── Subject and Topic data ──
  const subjectData = useMemo(() => {
    const map = {};
    attempts.forEach(a => {
      const s = a.subject || "Unknown";
      if (!map[s]) map[s] = { correct: 0, wrong: 0, skipped: 0 };
      if (a.result === "correct") map[s].correct++;
      else if (a.result === "wrong") map[s].wrong++;
      else map[s].skipped++;
    });
    return Object.entries(map)
      .map(([label, d]) => ({
        label,
        ...d,
        count: d.correct + d.wrong + d.skipped
      }))
      .sort((a, b) => b.count - a.count);
  }, [attempts]);

  const topicData = useMemo(() => {
    const map = {};
    attempts.forEach(a => {
      const t = a.topic || "Unknown";
      if (!map[t]) map[t] = { correct: 0, wrong: 0, skipped: 0 };
      if (a.result === "correct") map[t].correct++;
      else if (a.result === "wrong") map[t].wrong++;
      else map[t].skipped++;
    });
    return Object.entries(map)
      .map(([label, d]) => ({
        label,
        ...d,
        count: d.correct + d.wrong + d.skipped
      }))
      .sort((a, b) => b.count - a.count);
  }, [attempts]);

  const currentData = viewMode === "subjects" ? subjectData : topicData;
  const currentLabel = viewMode === "subjects" ? "Subject" : "Topic";

  const subjectOptions = useMemo(() => ["All", ...new Set(attempts.map(a => a.subject).filter(Boolean))], [attempts]);
  const paperOptions = useMemo(() => ["All", ...new Set(attempts.map(a => a.paper).filter(Boolean))], [attempts]);

  const filteredLog = useMemo(() => {
    return attempts.filter(a => {
      if (sourceFilter !== "All") {
        const src = a.source === "Test" ? "Test" : "PYQ";
        if (src !== sourceFilter) return false;
      }
      if (paperFilter !== "All" && a.paper !== paperFilter) return false;
      if (resultFilter !== "All" && a.result !== resultFilter) return false;
      if (diffFilter !== "All" && (a.difficulty || "Medium") !== diffFilter) return false;
      if (subjectFilter !== "All" && a.subject !== subjectFilter) return false;
      if (search.trim()) {
        const s = search.trim().toLowerCase();
        const hay = `${a.questionText || ""} ${a.topic || ""} ${a.subject || ""} ${a.testTitle || ""}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [attempts, sourceFilter, paperFilter, resultFilter, diffFilter, subjectFilter, search]);

  const visibleLog = filteredLog.slice(0, 60);

  // ── Empty state ──
  if (total === 0) {
    return (
      <div style={{
        fontFamily: SANS, maxWidth: 900, margin: "0 auto",
        padding: "60px 20px", color: "var(--text-primary)", textAlign: "center",
      }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>📊</div>
        <div style={{ fontSize: 24, fontWeight: 600, fontFamily: SERIF, marginBottom: 10 }}>
          No Attempts Yet
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: MONO, lineHeight: 1.8, maxWidth: 440, margin: "0 auto" }}>
          Answer questions in Topic-wise PYQs or take a Test Series.
          <br />Every answer gets tracked here automatically.
        </div>
      </div>
    );
  }

  const diffOrder = ["Easy", "Medium", "Hard"];
  const diffDotColor = { Easy: P.correct.solid, Medium: P.gold.solid, Hard: P.wrong.solid };
  const resultDotColor = { correct: P.correct.solid, wrong: P.wrong.solid, skipped: P.skipped.solid };

  return (
    <div style={{ fontFamily: SANS, width: "100%", color: "var(--text-primary)" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 30, fontWeight: 600, fontFamily: SERIF, lineHeight: 1.15 }}>
            Practice Analytics
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6, fontFamily: MONO }}>
            {total} attempts tracked · PYQs + all test series
          </div>
        </div>
        <button
          onClick={() => {
            if (window.confirm("Clear all attempt history? This cannot be undone.")) {
              clearAttempts();
              setSelectedSegment(null);
            }
          }}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 11, padding: "8px 18px", borderRadius: 10,
            border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.06)",
            color: "#fca5a5", cursor: "pointer", fontFamily: MONO, fontWeight: 500,
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(248,113,113,0.12)"; e.currentTarget.style.borderColor = "rgba(248,113,113,0.5)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(248,113,113,0.06)"; e.currentTarget.style.borderColor = "rgba(248,113,113,0.3)"; }}
        >
          <Trash2 size={13} /> Clear History
        </button>
      </div>

      {/* ── How to read this ── */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 10, flexWrap: "wrap",
        background: "var(--bg-muted)", border: "1px solid var(--bg-border)", borderRadius: 12,
        padding: "12px 18px", marginBottom: 20,
      }}>
        <Info size={15} style={{ color: P.blue.solid, marginTop: 2, flexShrink: 0 }} />
        <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, flex: 1, minWidth: 220 }}>
          Every percentage below is <strong style={{ color: "var(--text-primary)" }}>accuracy</strong> — correct ÷ (correct + wrong).
          Skipped questions are counted separately and never affect a percentage.
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", flexShrink: 0 }}>
          <LegendDot color={P.correct.solid} label="Correct" />
          <LegendDot color={P.wrong.solid} label="Wrong" />
          <LegendDot color={P.skipped.solid} label="Skipped" />
        </div>
      </div>

      {/* ── Stat tiles ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 20 }}>
        <StatTile icon={Target} value={total} label="Attempted" color={P.blue.solid} delay={0} />
        <StatTile icon={CheckCircle2} value={correct} label="Correct" color={P.correct.solid} delay={60} sub={`${accuracy}% accuracy`} />
        <StatTile icon={XCircle} value={wrong} label="Wrong" color={P.wrong.solid} delay={120} />
        <StatTile icon={Ban} value={skipped} label="Skipped" color={P.skipped.solid} delay={180} />
        <StatTile icon={BookMarked} value={pyqCount} label="PYQs" color={P.indigo.solid} delay={240} />
        <StatTile icon={ListChecks} value={testCount} label="Tests" color={P.gold.solid} delay={300} />
      </div>

      {/* ── Row A: Outcome split + Accuracy by difficulty ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 18, marginBottom: 18 }}>

        <SectionCard
          title="Outcome Split"
          accent={P.correct.solid}
          right={`${total} total`}
          // note={`Ring = share of all ${total} attempts by outcome · center = accuracy (${correct}÷${graded || 1} graded)`}
        >
          <div style={{ display: "flex", gap: 30, alignItems: "center", flexWrap: "wrap" }}>
            <FilledDonutRing correct={correct} wrong={wrong} skipped={skipped} accuracy={accuracy} />
            <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 16 }}>
              <BreakdownRow
                color={P.correct.solid} label="Correct"
                pct={total ? (correct / total) * 100 : 0}
                pctLabel={`${total ? Math.round((correct / total) * 100) : 0}%`}
                countLabel={`${correct} of ${total}`}
                delay={0}
              />
              <BreakdownRow
                color={P.wrong.solid} label="Wrong"
                pct={total ? (wrong / total) * 100 : 0}
                pctLabel={`${total ? Math.round((wrong / total) * 100) : 0}%`}
                countLabel={`${wrong} of ${total}`}
                delay={60}
              />
              <BreakdownRow
                color={P.skipped.solid} label="Skipped"
                pct={total ? (skipped / total) * 100 : 0}
                pctLabel={`${total ? Math.round((skipped / total) * 100) : 0}%`}
                countLabel={`${skipped} of ${total}`}
                delay={120}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Accuracy by Difficulty"
          accent={P.gold.solid}
          right={`${diffBreakdown.Easy.total + diffBreakdown.Medium.total + diffBreakdown.Hard.total} Qs`}
          note="Each bar = correct ÷ attempted for that difficulty"
        >
          {diffOrder.map((label, i) => (
            <div key={label} style={{ marginBottom: i < diffOrder.length - 1 ? 14 : 0 }}>
              <BreakdownRow
                color={diffDotColor[label]}
                label={label}
                pct={diffBreakdown[label].total ? (diffBreakdown[label].correct / diffBreakdown[label].total) * 100 : 0}
                pctLabel={diffBreakdown[label].total ? `${Math.round((diffBreakdown[label].correct / diffBreakdown[label].total) * 100)}%` : "0%"}
                countLabel={`${diffBreakdown[label].correct}/${diffBreakdown[label].correct + diffBreakdown[label].wrong}`}
                delay={i * 60}
              />
            </div>
          ))}
        </SectionCard>
      </div>

      {/* ── Row B: Year trend ── */}
      {Object.keys(byYear).length >= 2 && (
        <div style={{ marginBottom: 18 }}>
          <SectionCard
            title="Year-wise Attempts"
            accent={P.blue.solid}
            right={yearMeta ? `${yearMeta.yearsTracked} years tracked · peak ${yearMeta.peakYear} (${yearMeta.peakTotal})` : null}
          >
            <YearAreaChart byYear={byYear} />
            <div style={{ display: "flex", gap: 18, marginTop: 14, flexWrap: "wrap" }}>
              <LegendDot color={P.blue.solid} label="Attempted" />
              <LegendDot color={P.correct.solid} label="Correct" />
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── Row C: Subject view (Pie + Table) or Topic view (Table only) ── */}
      {currentData.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <SectionCard
            title={viewMode === "subjects" ? "Subject Performance" : "Topic Performance"}
            accent={viewMode === "subjects" ? P.purple.solid : P.indigo.solid}
            right={viewMode === "subjects"
              ? `${subjectData.length} subjects · ${total} total Qs`
              : `${topicData.length} topics · ${total} total Qs`}
            note={viewMode === "subjects"
              ? "Click a pie segment to highlight it · Table shows detailed subject performance"
              : "Detailed topic-wise breakdown with advanced filters"}
          >
            {/* View toggle */}
            <div style={{
              display: "flex",
              gap: 10,
              marginBottom: 22,
              flexWrap: "wrap",
            }}>
              <button
                onClick={() => {
                  setViewMode("subjects");
                  setSelectedSegment(null);
                }}
                style={{
                  padding: "8px 20px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontFamily: MONO,
                  border: viewMode === "subjects" ? `2px solid ${P.purple.solid}` : "1px solid var(--bg-border)",
                  background: viewMode === "subjects" ? `${P.purple.solid}18` : "transparent",
                  color: viewMode === "subjects" ? P.purple.solid : "var(--text-muted)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontWeight: viewMode === "subjects" ? 700 : 500,
                }}
              >
                <PieChartIcon size={16} /> Subject View
              </button>
              <button
                onClick={() => {
                  setViewMode("topics");
                  setSelectedSegment(null);
                }}
                style={{
                  padding: "8px 20px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontFamily: MONO,
                  border: viewMode === "topics" ? `2px solid ${P.indigo.solid}` : "1px solid var(--bg-border)",
                  background: viewMode === "topics" ? `${P.indigo.solid}18` : "transparent",
                  color: viewMode === "topics" ? P.indigo.solid : "var(--text-muted)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontWeight: viewMode === "topics" ? 700 : 500,
                }}
              >
                <Table size={16} /> Topic Table
              </button>
            </div>

            {/* Content based on view mode */}
            {viewMode === "subjects" ? (
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 24,
                alignItems: "start",
              }}>
                <div>
                  <SubjectPieChart
                    data={subjectData}
                    total={total}
                    onSegmentClick={(label) => setSelectedSegment(selectedSegment === label ? null : label)}
                    selectedSegment={selectedSegment}
                  />
                </div>
                <div>
                  <EnhancedDataTable
                    data={subjectData}
                    total={total}
                    viewType="Subject"
                  />
                </div>
              </div>
            ) : (
              <EnhancedDataTable
                data={topicData}
                total={total}
                viewType="Topic"
              />
            )}
          </SectionCard>
        </div>
      )}

      {/* ── Attempt Log ── */}
      <SectionCard title="Attempt Log" accent={P.blue.solid}>

        {/* Filters */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 12, marginBottom: 20,
          padding: "16px 18px", background: "var(--bg-muted)", borderRadius: 12,
          border: "1px solid var(--bg-border)",
        }}>
          <FilterRow
            rowLabel="Source"
            options={["All", "PYQ", "Test"]}
            active={sourceFilter}
            onPick={setSourceFilter}
            colorFor={(o) => (o === "Test" ? P.gold.solid : P.blue.solid)}
          />

          {paperOptions.length > 1 && (
            <FilterRow
              rowLabel="Paper"
              options={paperOptions}
              active={paperFilter}
              onPick={setPaperFilter}
              colorFor={() => P.indigo.solid}
            />
          )}

          <FilterRow
            rowLabel="Result"
            options={["All", "correct", "wrong", "skipped"]}
            active={resultFilter}
            onPick={setResultFilter}
            colorFor={(o) => resultDotColor[o] || P.purple.solid}
          />

          <FilterRow
            rowLabel="Difficulty"
            options={["All", "Easy", "Medium", "Hard"]}
            active={diffFilter}
            onPick={setDiffFilter}
            colorFor={(o) => diffDotColor[o] || P.purple.solid}
          />

          {subjectOptions.length > 1 && (
            <FilterRow
              rowLabel="Subject"
              options={subjectOptions}
              active={subjectFilter}
              onPick={setSubjectFilter}
              colorFor={() => P.gold.solid}
            />
          )}

          <div style={{ position: "relative", marginTop: 4 }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions, topics, test titles…"
              style={{
                width: "100%", padding: "10px 14px 10px 38px", fontSize: 13,
                background: "var(--bg-surface)", border: "1px solid var(--bg-border)",
                borderRadius: 10, color: "var(--text-primary)", outline: "none",
                fontFamily: SANS, boxSizing: "border-box", transition: "all 0.2s ease",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = P.correct.solid; e.currentTarget.style.boxShadow = `0 0 0 1px ${P.correct.dim}`; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--bg-border)"; e.currentTarget.style.boxShadow = "none"; }}
            />
            <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none", fontSize: 15 }}>
              ⌕
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: MONO }}>
            {filteredLog.length} of {total} attempts match
          </span>
          <button
            onClick={() => setShowLog(v => !v)}
            style={{
              fontSize: 11, padding: "6px 16px", borderRadius: 10, cursor: "pointer",
              border: "1px solid var(--bg-border)", background: "var(--bg-surface)",
              color: "var(--text-secondary)", fontFamily: MONO, fontWeight: 500,
              transition: "all 0.2s",
            }}
          >
            {showLog ? "▲ Hide" : "▼ Show"} ({Math.min(filteredLog.length, 60)})
          </button>
        </div>

        {showLog && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 500, overflowY: "auto", padding: "2px 0" }}>
            {visibleLog.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: 12, fontFamily: MONO }}>
                No attempts match these filters.
              </div>
            ) : visibleLog.map((a, i) => {
              const resultColor = a.result === "correct" ? P.correct.solid : a.result === "wrong" ? P.wrong.solid : P.skipped.solid;
              const resultIcon = a.result === "correct" ? "✓" : a.result === "wrong" ? "✗" : "⊘";
              return (
                <div key={a.id || i} style={{
                  background: "var(--bg-muted)", borderRadius: 10, padding: "12px 16px",
                  borderLeft: `3px solid ${resultColor}`,
                  transition: "transform 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateX(3px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateX(0)"}
                >
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.6, marginBottom: 6, wordBreak: "break-word" }}>
                    {a.questionText?.slice(0, 160)}{a.questionText?.length > 160 ? "…" : ""}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                    {a.source && (
                      <span style={{ fontSize: 10, padding: "2px 10px", borderRadius: 20, background: a.source === "Test" ? "rgba(251,191,36,0.12)" : "rgba(96,165,250,0.12)", color: a.source === "Test" ? P.gold.solid : P.blue.solid, border: `1px solid ${a.source === "Test" ? P.gold.solid : P.blue.solid}30`, fontFamily: MONO, fontWeight: 600 }}>
                        {a.source === "Test" ? "Test Series" : "PYQ"}
                      </span>
                    )}
                    {a.paper && (
                      <span style={{ fontSize: 10, padding: "2px 10px", borderRadius: 20, background: "var(--bg-surface)", color: P.indigo.solid, border: "1px solid var(--bg-border)", fontFamily: MONO, fontWeight: 600 }}>
                        {a.paper}
                      </span>
                    )}
                    {a.subject && (
                      <span style={{ fontSize: 10, padding: "2px 10px", borderRadius: 20, background: "var(--bg-surface)", color: "var(--text-muted)", border: "1px solid var(--bg-border)", fontFamily: MONO }}>
                        {a.subject}
                      </span>
                    )}
                    {a.topic && (
                      <span style={{ fontSize: 10, padding: "2px 10px", borderRadius: 20, background: "var(--bg-surface)", color: "var(--text-muted)", border: "1px solid var(--bg-border)", fontFamily: MONO }}>
                        {a.topic}
                      </span>
                    )}
                    {a.year && (
                      <span style={{ fontSize: 10, padding: "2px 10px", borderRadius: 20, background: "var(--bg-surface)", color: "var(--text-muted)", border: "1px solid var(--bg-border)", fontFamily: MONO, fontWeight: 600 }}>
                        {a.year}
                      </span>
                    )}
                    {a.difficulty && (
                      <span style={{ fontSize: 10, padding: "2px 10px", borderRadius: 20, background: `${diffDotColor[a.difficulty] || P.gold.solid}18`, color: diffDotColor[a.difficulty] || P.gold.solid, border: `1px solid ${diffDotColor[a.difficulty] || P.gold.solid}30`, fontFamily: MONO, fontWeight: 600 }}>
                        {a.difficulty}
                      </span>
                    )}
                    <span style={{ fontSize: 10, padding: "2px 10px", borderRadius: 20, background: `${resultColor}18`, color: resultColor, border: `1px solid ${resultColor}30`, fontFamily: MONO, fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
                      {resultIcon} {a.result}
                    </span>
                    {a.attemptedAt && (
                      <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--text-muted)", fontFamily: MONO, opacity: 0.7 }}>
                        {new Date(a.attemptedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredLog.length > 60 && (
              <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", fontFamily: MONO, padding: "8px 0" }}>
                Showing first 60 of {filteredLog.length} matches — narrow the filters to see more precisely.
              </div>
            )}
          </div>
        )}
        {!showLog && (
          <p style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: MONO, textAlign: "center", margin: 0 }}>
            Click "Show" to browse individual attempts.
          </p>
        )}
      </SectionCard>
    </div>
  );
}