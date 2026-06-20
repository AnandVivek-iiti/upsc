// ─── QuestionStats.jsx — mobile-safe (padding-trick) SVGs, zero shadows,
// ─── pure-rectangle year bars, Result+Difficulty chip filters in BOTH tables ──

import { useMemo, useState, useEffect, useRef } from "react";
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
  Search,
  ArrowRight,
  X,
} from "lucide-react";
import { useQuestionAttempts } from "../hooks/useQuestionAttempts";

// ─── Palette ──────────────────────────────────────────────────────────────
const P = {
  correct:  { solid: "#34d399" },
  wrong:    { solid: "#f87171" },
  skipped:  { solid: "#94a3b8" },
  gold:     { solid: "#fbbf24" },
  blue:     { solid: "#3b82f6" },
  purple:   { solid: "#8b5cf6" },
  indigo:   { solid: "#6366f1" },
};

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

// ─── Filled Donut Ring — mobile-safe square via padding-bottom trick, no shadow ──
function FilledDonutRing({ correct, wrong, skipped, accuracy, size = 148 }) {
  const grown = useGrow(100);
  const total = correct + wrong + skipped || 1;
  const R = (size / 2) - 17;
  const CIRC = 2 * Math.PI * R;
  const cx = size / 2, cy = size / 2;

  let currentAngle = 0;
  const segments = [
    { label: "Correct", count: correct, pct: correct / total, color: P.correct.solid },
    { label: "Wrong", count: wrong, pct: wrong / total, color: P.wrong.solid },
    { label: "Skipped", count: skipped, pct: skipped / total, color: P.skipped.solid },
  ].filter(s => s.count > 0);

  return (
    <div style={{ width: "100%", maxWidth: size, margin: "0 auto", position: "relative", flexShrink: 0, boxShadow: "none" }}>
      <div style={{ width: "100%", paddingBottom: "100%", position: "relative" }}>
        <svg viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", filter: "none", boxShadow: "none" }}>
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--bg-muted)" strokeWidth={13} />

          {segments.map((seg) => {
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
            const pathData = angle < 1 ? null : `M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} Z`;

            if (angle < 1 && seg.pct > 0) {
              const dashLength = seg.pct * CIRC;
              return (
                <circle
                  key={seg.label} cx={cx} cy={cy} r={R} fill="none" stroke={seg.color} strokeWidth={13}
                  strokeDasharray={`${dashLength} ${CIRC - dashLength}`}
                  strokeDashoffset={-startAngle / 360 * CIRC}
                  transform={`rotate(-90 ${cx} ${cy})`}
                  style={{ transition: "stroke-dasharray 0.9s cubic-bezier(0.34,1.56,0.64,1)", opacity: grown ? 1 : 0 }}
                />
              );
            }
            return pathData ? (
              <path key={seg.label} d={pathData} fill={seg.color} style={{ transition: "opacity 0.9s ease", opacity: grown ? 1 : 0 }} />
            ) : null;
          })}

          <circle cx={cx} cy={cy} r={R * 0.3} fill="var(--bg-surface)" stroke="var(--bg-border)" strokeWidth={1} />
          <text x={cx} y={cy - 3} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={700} fill="var(--text-primary)" fontFamily={SERIF}>
            {accuracy}%
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="central" fontSize={8} fill="var(--text-muted)" fontFamily={MONO} letterSpacing="0.5">
            ACCURACY
          </text>
        </svg>
      </div>
    </div>
  );
}

// ─── BreakdownRow ──────────────────────────────────────────────────────────
function BreakdownRow({ color, label, pct, pctLabel, countLabel, delay = 0 }) {
  const grown = useGrow(delay + 220);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--text-secondary)", fontFamily: SANS }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
          {label}
        </span>
        <span style={{ display: "flex", alignItems: "baseline", gap: 7, fontFamily: MONO, flexShrink: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color }}>{pctLabel}</span>
          <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>{countLabel}</span>
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 4, background: "var(--bg-muted)", overflow: "hidden", boxShadow: "none" }}>
        <div style={{ height: "100%", width: grown ? `${pct}%` : "0%", background: color, borderRadius: 4, transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)" }} />
      </div>
    </div>
  );
}

// ─── Subject Pie Chart — mobile-safe square, no glow/drop-shadow on hover ──
function SubjectPieChart({ data, total, onSegmentClick, selectedSegment }) {
  const grown = useGrow(200);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const wrapRef = useRef(null);

  if (data.length === 0 || total === 0) return null;

  const handleMove = (e) => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const size = 300;
  const R = (size / 2) - 8;
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
    const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    return { ...d, pct, pathData, color: PIE_COLORS[i % PIE_COLORS.length], isSelected, isHovered, index: i };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%", overflow: "visible" }}>
      <div
        ref={wrapRef}
        onMouseMove={handleMove}
        style={{ position: "relative", width: "100%", maxWidth: size, overflow: "visible", boxShadow: "none" }}
      >
        <div style={{ width: "100%", paddingBottom: "100%", position: "relative" }}>
          <svg viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
            {segments.map((seg) => {
              const active = seg.isHovered || seg.isSelected;
              return (
                <path
                  key={seg.label}
                  d={seg.pathData}
                  fill={seg.color}
                  stroke={active ? "#ffffff" : "var(--bg-surface)"}
                  strokeWidth={seg.isSelected ? 3 : seg.isHovered ? 2.5 : 0.5}
                  style={{
                    cursor: "pointer",
                    transition: "filter 0.2s ease, stroke-width 0.2s ease, opacity 0.5s ease",
                    opacity: grown ? 1 : 0,
                    // no drop-shadow — brightness/saturate only, this was the glow culprit
                    filter: active ? "brightness(1.18) saturate(1.1)" : "none",
                  }}
                  onMouseEnter={() => setHoveredIndex(seg.index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => onSegmentClick(seg.label)}
                />
              );
            })}
            <circle cx={cx} cy={cy} r={R * 0.28} fill="var(--bg-surface)" stroke="var(--bg-border)" strokeWidth={1} />
            {hoveredIndex !== null ? (
              <>
                <text x={cx} y={cy - 4} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={700} fill={segments[hoveredIndex].color} fontFamily={SERIF}>
                  {Math.round(segments[hoveredIndex].pct * 100)}%
                </text>
                <text x={cx} y={cy + 15} textAnchor="middle" dominantBaseline="central" fontSize={8} fill="var(--text-muted)" fontFamily={MONO} letterSpacing="0.3">
                  {segments[hoveredIndex].label.length > 16 ? `${segments[hoveredIndex].label.slice(0, 15)}…` : segments[hoveredIndex].label}
                </text>
              </>
            ) : (
              <>
                <text x={cx} y={cy - 4} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={700} fill="var(--text-primary)" fontFamily={SERIF}>
                  {total}
                </text>
                <text x={cx} y={cy + 15} textAnchor="middle" dominantBaseline="central" fontSize={8.5} fill="var(--text-muted)" fontFamily={MONO} letterSpacing="0.5">
                  TOTAL
                </text>
              </>
            )}
          </svg>
        </div>

        {hoveredIndex !== null && (
          <div style={{
            position: "absolute", left: tooltipPos.x, top: tooltipPos.y,
            transform: "translate(-50%, -130%)", background: "var(--bg-surface)",
            border: `1px solid ${segments[hoveredIndex].color}`, borderRadius: 8,
            padding: "5px 10px", fontSize: 12, fontFamily: MONO, pointerEvents: "none",
            whiteSpace: "nowrap", zIndex: 5, display: "flex", alignItems: "center", gap: 6,
            boxShadow: "none",
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: segments[hoveredIndex].color, flexShrink: 0 }} />
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{segments[hoveredIndex].label}</span>
            <span style={{ color: segments[hoveredIndex].color, fontWeight: 700 }}>{Math.round(segments[hoveredIndex].pct * 100)}%</span>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 10px", justifyContent: "center", maxWidth: size, padding: "0 4px", maxHeight: 110, overflowY: "auto" }}>
        {segments.map((seg) => (
          <span
            key={seg.label}
            style={{
              display: "flex", alignItems: "center", gap: 4, fontSize: 10.5, fontFamily: MONO,
              color: seg.isSelected ? "var(--text-primary)" : "var(--text-muted)",
              padding: "3px 7px", borderRadius: 4, cursor: "pointer", transition: "all 0.2s ease",
              background: seg.isSelected ? `${seg.color}22` : "transparent",
              border: seg.isSelected ? `1px solid ${seg.color}44` : "1px solid transparent",
            }}
            onClick={() => onSegmentClick(seg.label)}
          >
            <span style={{ width: 10, height: 10, borderRadius: 3, background: seg.color, flexShrink: 0 }} />
            <span style={{ maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{seg.label}</span>
            <span style={{ color: "var(--text-muted)", opacity: 0.6, fontSize: 9.5 }}>{Math.round(seg.pct * 100)}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Chip + FilterRow (used inside BOTH the Subject and Topic tables) ─────
function Chip({ label, active, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 11, padding: "5px 13px", borderRadius: 20, cursor: "pointer",
        fontFamily: MONO, fontWeight: active ? 700 : 500, whiteSpace: "nowrap",
        transition: "all 0.2s ease", boxShadow: "none",
        border: active ? `1px solid ${color}` : "1px solid var(--bg-border)",
        background: active ? `${color}18` : "transparent",
        color: active ? color : "var(--text-muted)",
      }}
    >
      {label}
    </button>
  );
}

function FilterRow({ rowLabel, options, active, onPick, colorFor }) {
  return (
    <div style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
      <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: MONO, minWidth: 56, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.7 }}>
        {rowLabel}
      </span>
      {options.map((opt) => (
        <Chip key={opt} label={opt} active={active === opt} color={opt === "All" ? P.purple.solid : (colorFor ? colorFor(opt) : P.purple.solid)} onClick={() => onPick(opt)} />
      ))}
    </div>
  );
}

// ─── Aggregate helper ───────────────────────────────────────────────────
function aggregateBy(attempts, field) {
  const map = {};
  attempts.forEach(a => {
    const k = a[field] || "Miscellaneous";
    if (!map[k]) map[k] = { correct: 0, wrong: 0, skipped: 0 };
    if (a.result === "correct") map[k].correct++;
    else if (a.result === "wrong") map[k].wrong++;
    else map[k].skipped++;
  });
  return Object.entries(map)
    .map(([label, d]) => ({ label, ...d, count: d.correct + d.wrong + d.skipped }))
    .sort((a, b) => b.count - a.count);
}

// ─── Enhanced Data Table — Result + Difficulty chips live in BOTH tables ──
function EnhancedDataTable({ attempts, field, viewType }) {
  const [sortField, setSortField] = useState("count");
  const [sortDirection, setSortDirection] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [minAccuracy, setMinAccuracy] = useState(0);
  const [minAttempts, setMinAttempts] = useState(0);
  const [resultFilter, setResultFilter] = useState("All");
  const [diffFilter, setDiffFilter] = useState("All");
  const [activeLabel, setActiveLabel] = useState(null);

  const diffDotColor = { Easy: P.correct.solid, Medium: P.gold.solid, Hard: P.wrong.solid };
  const resultDotColor = { correct: P.correct.solid, wrong: P.wrong.solid, skipped: P.skipped.solid };

  const scopedAttempts = useMemo(() => {
    return attempts.filter(a => {
      if (resultFilter !== "All" && a.result !== resultFilter) return false;
      if (diffFilter !== "All" && (a.difficulty || "Medium") !== diffFilter) return false;
      return true;
    });
  }, [attempts, resultFilter, diffFilter]);

  const data = useMemo(() => aggregateBy(scopedAttempts, field), [scopedAttempts, field]);

  const handleSort = (f) => {
    if (sortField === f) setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else { setSortField(f); setSortDirection("desc"); }
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    let result = data;
    if (searchTerm.trim()) result = result.filter(d => d.label.toLowerCase().includes(searchTerm.toLowerCase()));
    if (minAccuracy > 0) {
      result = result.filter(d => {
        const attempted = d.correct + d.wrong;
        if (attempted === 0) return false;
        return (d.correct / attempted) * 100 >= minAccuracy;
      });
    }
    if (minAttempts > 0) result = result.filter(d => d.count >= minAttempts);
    return result;
  }, [data, searchTerm, minAccuracy, minAttempts]);

  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    sorted.sort((a, b) => {
      let aVal = a[sortField], bVal = b[sortField];
      if (typeof aVal === "string") return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });
    return sorted;
  }, [filteredData, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const matchedAttempts = useMemo(() => {
    if (!activeLabel) return [];
    return scopedAttempts.filter(a => (a[field] || "Miscellaneous") === activeLabel);
  }, [scopedAttempts, activeLabel, field]);

  const SortableHeader = ({ field: f, label, align = "right" }) => (
    <th
      onClick={() => handleSort(f)}
      style={{
        padding: "13px 14px", fontSize: 11.5, fontFamily: MONO, fontWeight: 700,
        color: sortField === f ? "var(--text-primary)" : "var(--text-muted)",
        textTransform: "uppercase", letterSpacing: 0.6, textAlign: align,
        cursor: "pointer", whiteSpace: "nowrap", userSelect: "none",
      }}
    >
      {label} <span style={{ opacity: sortField === f ? 1 : 0.35 }}>{sortField === f ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}</span>
    </th>
  );

  return (
    <div style={{ width: "100%" }}>
      {/* ── Chip filters: Result + Difficulty — present in this table no matter which tab calls it ── */}
      <div style={{
        display: "flex", flexDirection: "column", gap: 10, marginBottom: 12,
        padding: "12px 14px", background: "var(--bg-muted)", borderRadius: 12, border: "1px solid var(--bg-border)",
        boxShadow: "none",
      }}>
        <FilterRow rowLabel="Result" options={["All", "correct", "wrong", "skipped"]} active={resultFilter} onPick={(v) => { setResultFilter(v); setCurrentPage(1); }} colorFor={(o) => resultDotColor[o]} />
        <FilterRow rowLabel="Difficulty" options={["All", "Easy", "Medium", "Hard"]} active={diffFilter} onPick={(v) => { setDiffFilter(v); setCurrentPage(1); }} colorFor={(o) => diffDotColor[o]} />
      </div>

      {/* ── Search + numeric filters + rows-per-page ── */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 14, padding: "12px 14px", background: "var(--bg-muted)", borderRadius: 12, border: "1px solid var(--bg-border)", boxShadow: "none" }}>
        <div style={{ position: "relative", flex: "1 1 160px", minWidth: 140 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", opacity: 0.6 }} />
          <input
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder={`Search ${viewType.toLowerCase()}…`}
            style={{ width: "100%", padding: "8px 10px 8px 32px", fontSize: 13, fontFamily: SANS, background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: 9, color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: MONO, whiteSpace: "nowrap" }}>Min Acc</span>
          <input type="number" min="0" max="100" value={minAccuracy} onChange={(e) => { setMinAccuracy(Math.min(100, Math.max(0, Number(e.target.value) || 0))); setCurrentPage(1); }}
            style={{ width: 54, padding: "8px", fontSize: 13, fontFamily: MONO, background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: 9, color: "var(--text-primary)", outline: "none", textAlign: "center" }} />
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>%</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: MONO, whiteSpace: "nowrap" }}>Min Qs</span>
          <input type="number" min="0" value={minAttempts} onChange={(e) => { setMinAttempts(Math.max(0, Number(e.target.value) || 0)); setCurrentPage(1); }}
            style={{ width: 54, padding: "8px", fontSize: 13, fontFamily: MONO, background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: 9, color: "var(--text-primary)", outline: "none", textAlign: "center" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: MONO, whiteSpace: "nowrap" }}>Rows</span>
          <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            style={{ padding: "8px 10px", fontSize: 12.5, fontFamily: MONO, background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: 9, color: "var(--text-primary)", outline: "none", cursor: "pointer" }}>
            <option value={5}>5</option><option value={8}>8</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ overflowX: "auto", borderRadius: 14, border: "1px solid var(--bg-border)", background: "var(--bg-surface)", boxShadow: "none" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 480 }}>
          <thead>
            <tr style={{ background: "var(--bg-muted)" }}>
              <SortableHeader field="label" label={viewType} align="left" />
              <SortableHeader field="count" label="Total" />
              <SortableHeader field="correct" label="Correct" />
              <SortableHeader field="wrong" label="Wrong" />
              <SortableHeader field="skipped" label="Skipped" />
              <th style={{ padding: "13px 14px", fontSize: 11.5, fontFamily: MONO, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.6, textAlign: "right", whiteSpace: "nowrap" }}>Accuracy</th>
              <th style={{ width: 28 }} />
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: "36px", textAlign: "center", color: "var(--text-muted)", fontFamily: MONO, fontSize: 12.5 }}>No {viewType.toLowerCase()}s match your filters</td></tr>
            ) : (
              paginatedData.map((d, i) => {
                const attempted = d.correct + d.wrong;
                const acc = attempted > 0 ? Math.round((d.correct / attempted) * 100) : 0;
                const accColor = acc >= 70 ? P.correct.solid : acc >= 50 ? P.gold.solid : P.wrong.solid;
                const color = PIE_COLORS[(sortedData.indexOf(d)) % PIE_COLORS.length];
                return (
                  <tr key={d.label} onClick={() => setActiveLabel(d.label)}
                    style={{ borderTop: "1px solid var(--bg-border)", background: i % 2 === 1 ? "var(--bg-muted)" : "transparent", cursor: "pointer" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = `${P.blue.solid}10`}
                    onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 1 ? "var(--bg-muted)" : "transparent"}>
                    <td style={{ padding: "12px 14px", color: "var(--text-primary)", fontWeight: 600, fontSize: 13.5 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <span style={{ width: 9, height: 9, borderRadius: 3, background: color, flexShrink: 0 }} />
                        <span style={{ wordBreak: "break-word" }}>{d.label}</span>
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right", fontFamily: MONO, color: "var(--text-secondary)", fontWeight: 600 }}>{d.count}</td>
                    <td style={{ padding: "12px 14px", textAlign: "right", fontFamily: MONO, color: P.correct.solid, fontWeight: 600 }}>{d.correct}</td>
                    <td style={{ padding: "12px 14px", textAlign: "right", fontFamily: MONO, color: P.wrong.solid, fontWeight: 600 }}>{d.wrong}</td>
                    <td style={{ padding: "12px 14px", textAlign: "right", fontFamily: MONO, color: P.skipped.solid, fontWeight: 600 }}>{d.skipped}</td>
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>
                      {attempted > 0 ? (
                        <span style={{ display: "inline-block", padding: "4px 11px", borderRadius: 20, fontFamily: MONO, fontWeight: 700, fontSize: 12.5, color: accColor, background: `${accColor}18` }}>{acc}%</span>
                      ) : <span style={{ color: "var(--text-muted)", fontFamily: MONO, fontSize: 12.5 }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 10px", textAlign: "right" }}><ArrowRight size={13} style={{ color: "var(--text-muted)", opacity: 0.5 }} /></td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {paginatedData.length > 0 && (
        <div style={{ fontSize: 11.5, fontFamily: MONO, color: "var(--text-muted)", marginTop: 10, opacity: 0.8 }}>
          Click any row to view all its questions
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 11.5, fontFamily: MONO, color: "var(--text-muted)" }}>{sortedData.length} {viewType.toLowerCase()}s · Page {currentPage} of {totalPages}</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              style={{ padding: "7px 15px", fontSize: 11.5, fontFamily: MONO, background: "var(--bg-muted)", border: "1px solid var(--bg-border)", borderRadius: 8, color: currentPage === 1 ? "var(--text-muted)" : "var(--text-primary)", cursor: currentPage === 1 ? "default" : "pointer", opacity: currentPage === 1 ? 0.4 : 1 }}>Previous</button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              style={{ padding: "7px 15px", fontSize: 11.5, fontFamily: MONO, background: "var(--bg-muted)", border: "1px solid var(--bg-border)", borderRadius: 8, color: currentPage === totalPages ? "var(--text-muted)" : "var(--text-primary)", cursor: currentPage === totalPages ? "default" : "pointer", opacity: currentPage === totalPages ? 0.4 : 1 }}>Next</button>
          </div>
        </div>
      )}

      {activeLabel && (
        <QuestionsModal label={activeLabel} viewType={viewType} questions={matchedAttempts} onClose={() => setActiveLabel(null)} />
      )}
    </div>
  );
}

// ─── Questions Modal ─────────────────────────────────────────────────────
function QuestionsModal({ label, viewType, questions, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const sorted = useMemo(() => {
    return [...questions].sort((a, b) => {
      const at = a.attemptedAt ? new Date(a.attemptedAt).getTime() : 0;
      const bt = b.attemptedAt ? new Date(b.attemptedAt).getTime() : 0;
      return bt - at;
    });
  }, [questions]);

  const visible = sorted.slice(0, 100);
  const localDiffColor = { Easy: P.correct.solid, Medium: P.gold.solid, Hard: P.wrong.solid };
  const resultColorFor = (r) => r === "correct" ? P.correct.solid : r === "wrong" ? P.wrong.solid : P.skipped.solid;
  const resultIconFor = (r) => r === "correct" ? "✓" : r === "wrong" ? "✗" : "⊘";

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 14 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 760, maxHeight: "85vh", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: 18, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "none" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 18px", borderBottom: "1px solid var(--bg-border)", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 10, fontFamily: MONO, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.7, fontWeight: 700, marginBottom: 3 }}>{viewType}</div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: SERIF, color: "var(--text-primary)" }}>{label}</div>
          </div>
          <button onClick={onClose} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 10, border: "1px solid var(--bg-border)", background: "var(--bg-muted)", color: "var(--text-muted)", cursor: "pointer", flexShrink: 0, boxShadow: "none" }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: "10px 18px", fontSize: 12, fontFamily: MONO, color: "var(--text-muted)", flexShrink: 0 }}>
          {sorted.length} question{sorted.length === 1 ? "" : "s"} attempted from this {viewType.toLowerCase()}
        </div>
        <div style={{ overflowY: "auto", flex: 1, padding: "0 14px 18px" }}>
          {visible.length === 0 ? (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)", fontFamily: MONO, fontSize: 13 }}>No questions found.</div>
          ) : (
            <div style={{ borderRadius: 12, border: "1px solid var(--bg-border)", overflow: "hidden", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 420 }}>
                <thead>
                  <tr style={{ background: "var(--bg-muted)" }}>
                    <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 10.5, fontFamily: MONO, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Question</th>
                    <th style={{ padding: "10px 12px", textAlign: "center", fontSize: 10.5, fontFamily: MONO, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>Difficulty</th>
                    <th style={{ padding: "10px 12px", textAlign: "center", fontSize: 10.5, fontFamily: MONO, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((a, i) => {
                    const rc = resultColorFor(a.result);
                    const dc = localDiffColor[a.difficulty] || P.gold.solid;
                    return (
                      <tr key={a.id || i} style={{ borderTop: "1px solid var(--bg-border)", background: i % 2 === 1 ? "var(--bg-muted)" : "transparent" }}>
                        <td style={{ padding: "10px 12px", color: "var(--text-primary)", lineHeight: 1.55, fontWeight: 500 }}>
                          {a.questionText?.slice(0, 180)}{a.questionText?.length > 180 ? "…" : ""}
                          {a.year && <span style={{ marginLeft: 8, fontSize: 10.5, color: "var(--text-muted)", fontFamily: MONO }}>· {a.year}</span>}
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "center", whiteSpace: "nowrap" }}>
                          {a.difficulty && <span style={{ fontSize: 10.5, padding: "3px 9px", borderRadius: 20, background: `${dc}18`, color: dc, fontFamily: MONO, fontWeight: 600 }}>{a.difficulty}</span>}
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "center", whiteSpace: "nowrap" }}>
                          <span style={{ fontSize: 10.5, padding: "3px 9px", borderRadius: 20, background: `${rc}18`, color: rc, fontFamily: MONO, fontWeight: 700 }}>{resultIconFor(a.result)} {a.result}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {sorted.length > 100 && (
            <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", fontFamily: MONO, padding: "12px 0 0" }}>Showing first 100 of {sorted.length} questions.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Year Bar Chart — PURE flat rectangles, zero border-radius, zero shadow ──
function YearBarChart({ byYear }) {
  const grown = useGrow(280);
  const years = Object.keys(byYear).sort((a, b) => Number(a) - Number(b)).slice(-8);
  if (years.length < 1) return null;
  const maxTotal = Math.max(...years.map(y => byYear[y].total), 1);

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: years.length > 5 ? 8 : 16, height: 128, padding: "0 4px" }}>
        {years.map((y) => {
          const t = byYear[y].total, c = byYear[y].correct;
          const hTotal = grown ? (t / maxTotal) * 100 : 0;
          const hCorrect = grown ? (c / maxTotal) * 100 : 0;
          return (
            <div key={y} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, flex: "0 1 40px" }}>
              <div style={{ position: "relative", width: 28, height: 96, background: "var(--bg-muted)", boxShadow: "none" }}>
                <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: `${hTotal}%`, background: `${P.blue.solid}30`, transition: "height 0.9s cubic-bezier(0.34,1.56,0.64,1)" }} />
                <div style={{ position: "absolute", bottom: 0, left: "20%", width: "60%", height: `${hCorrect}%`, background: P.correct.solid, transition: "height 0.9s cubic-bezier(0.34,1.56,0.64,1) 0.08s" }} />
              </div>
              <span style={{ fontSize: 11, fontFamily: MONO, color: "var(--text-muted)", fontWeight: 700 }}>{y}</span>
              <span style={{ fontSize: 10, fontFamily: MONO, color: "var(--text-secondary)" }}>{t}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── StatTile — flat, zero shadow ──────────────────────────────────────────
function StatTile({ icon: Icon, value, label, color, sub, delay = 0 }) {
  const grown = useGrow(delay + 60);
  return (
    <div style={{
      background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: 16,
      padding: "18px 18px 16px", borderTop: `3px solid ${color}`, boxShadow: "none", overflow: "hidden",
      opacity: grown ? 1 : 0, transform: grown ? "translateY(0)" : "translateY(10px)",
      transition: "opacity 0.5s ease, transform 0.5s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        {Icon && <Icon size={15} style={{ color, opacity: 0.9 }} />}
        <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: MONO, letterSpacing: 0.6, textTransform: "uppercase" }}>{label}</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1, fontFamily: SERIF, color: "var(--text-primary)" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color, marginTop: 6, fontFamily: MONO, opacity: 0.85 }}>{sub}</div>}
    </div>
  );
}

// ─── SectionCard — flat, zero shadow, overflow visible (so pies never clip) ──
function SectionCard({ title, accent, right, note, children, style = {} }) {
  return (
    <div style={{
      background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: 18,
      padding: "22px 20px 24px", boxShadow: "none", overflow: "visible", ...style,
    }}>
      {(title || right) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: note ? 8 : 18, flexWrap: "wrap" }}>
          {title && (
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", fontFamily: SERIF, display: "flex", alignItems: "center", gap: 10, letterSpacing: "-0.1px" }}>
              {accent && <span style={{ width: 4, height: 18, borderRadius: 2, background: accent, display: "inline-block" }} />}
              {title}
            </div>
          )}
          {right && <span style={{ fontSize: 12, fontFamily: MONO, color: "var(--text-muted)" }}>{right}</span>}
        </div>
      )}
      {note && <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: MONO, marginBottom: 18, opacity: 0.85, lineHeight: 1.6 }}>{note}</div>}
      {children}
    </div>
  );
}

// ─── Legend Dot ───────────────────────────────────────────────────────────
function LegendDot({ color, label }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)", fontFamily: MONO }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color, display: "inline-block" }} />
      {label}
    </span>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────
export default function QuestionStats() {
  const { attempts, clearAttempts } = useQuestionAttempts();
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [viewMode, setViewMode] = useState("subjects");

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

  const subjectData = useMemo(() => aggregateBy(attempts, "subject"), [attempts]);
  const topicData = useMemo(() => aggregateBy(attempts, "topic"), [attempts]);
  const currentData = viewMode === "subjects" ? subjectData : topicData;

  if (total === 0) {
    return (
      <div style={{ fontFamily: SANS, maxWidth: 900, margin: "0 auto", padding: "60px 20px", color: "var(--text-primary)", textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>📊</div>
        <div style={{ fontSize: 26, fontWeight: 600, fontFamily: SERIF, marginBottom: 10 }}>No Attempts Yet</div>
        <div style={{ fontSize: 14, color: "var(--text-muted)", fontFamily: MONO, lineHeight: 1.8, maxWidth: 440, margin: "0 auto" }}>
          Answer questions in Topic-wise PYQs or take a Test Series.
          <br />Every answer gets tracked here automatically.
        </div>
      </div>
    );
  }

  const diffOrder = ["Easy", "Medium", "Hard"];
  const diffDotColor = { Easy: P.correct.solid, Medium: P.gold.solid, Hard: P.wrong.solid };

  return (
    <div style={{ fontFamily: SANS, width: "100%", color: "var(--text-primary)", overflow: "visible" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: "clamp(26px, 5vw, 34px)", fontWeight: 700, fontFamily: SERIF, lineHeight: 1.15, letterSpacing: "-0.3px" }}>Practice Analytics</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 7, fontFamily: MONO, letterSpacing: 0.2 }}>{total} attempts tracked · PYQs + all test series</div>
        </div>
        <button
          onClick={() => { if (window.confirm("Clear all attempt history? This cannot be undone.")) { clearAttempts(); setSelectedSegment(null); } }}
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "9px 18px", borderRadius: 10, border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.06)", color: "#fca5a5", cursor: "pointer", fontFamily: MONO, fontWeight: 500, boxShadow: "none" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(248,113,113,0.12)"; e.currentTarget.style.borderColor = "rgba(248,113,113,0.5)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(248,113,113,0.06)"; e.currentTarget.style.borderColor = "rgba(248,113,113,0.3)"; }}
        >
          <Trash2 size={14} /> Clear History
        </button>
      </div>

      {/* ── How to read this ── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexWrap: "wrap", background: "var(--bg-muted)", border: "1px solid var(--bg-border)", borderRadius: 12, padding: "13px 18px", marginBottom: 20, boxShadow: "none" }}>
        <Info size={16} style={{ color: P.blue.solid, marginTop: 2, flexShrink: 0 }} />
        <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, flex: 1, minWidth: 220 }}>
          Every percentage below is <strong style={{ color: "var(--text-primary)" }}>accuracy</strong> — correct ÷ (correct + wrong). Skipped questions are counted separately and never affect a percentage.
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", flexShrink: 0 }}>
          <LegendDot color={P.correct.solid} label="Correct" />
          <LegendDot color={P.wrong.solid} label="Wrong" />
          <LegendDot color={P.skipped.solid} label="Skipped" />
        </div>
      </div>

      {/* ── Stat tiles ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))", gap: 14, marginBottom: 20 }}>
        <StatTile icon={Target} value={total} label="Attempted" color={P.blue.solid} delay={0} />
        <StatTile icon={CheckCircle2} value={correct} label="Correct" color={P.correct.solid} delay={60} sub={`${accuracy}% accuracy`} />
        <StatTile icon={XCircle} value={wrong} label="Wrong" color={P.wrong.solid} delay={120} />
        <StatTile icon={Ban} value={skipped} label="Skipped" color={P.skipped.solid} delay={180} />
        <StatTile icon={BookMarked} value={pyqCount} label="PYQs" color={P.indigo.solid} delay={240} />
        <StatTile icon={ListChecks} value={testCount} label="Tests" color={P.gold.solid} delay={300} />
      </div>

      {/* ── Row A: Outcome split + Accuracy by difficulty + Year-wise — 3 across, stacks on mobile ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18, marginBottom: 18, alignItems: "stretch" }}>

        <SectionCard title="Outcome Split" accent={P.correct.solid} right={`${total} total`}>
          <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
            <FilledDonutRing correct={correct} wrong={wrong} skipped={skipped} accuracy={accuracy} size={140} />
            <div style={{ flex: 1, minWidth: 160, display: "flex", flexDirection: "column", gap: 14 }}>
              <BreakdownRow color={P.correct.solid} label="Correct" pct={total ? (correct / total) * 100 : 0} pctLabel={`${total ? Math.round((correct / total) * 100) : 0}%`} countLabel={`${correct} of ${total}`} delay={0} />
              <BreakdownRow color={P.wrong.solid} label="Wrong" pct={total ? (wrong / total) * 100 : 0} pctLabel={`${total ? Math.round((wrong / total) * 100) : 0}%`} countLabel={`${wrong} of ${total}`} delay={60} />
              <BreakdownRow color={P.skipped.solid} label="Skipped" pct={total ? (skipped / total) * 100 : 0} pctLabel={`${total ? Math.round((skipped / total) * 100) : 0}%`} countLabel={`${skipped} of ${total}`} delay={120} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Accuracy by Difficulty" accent={P.gold.solid} right={`${diffBreakdown.Easy.total + diffBreakdown.Medium.total + diffBreakdown.Hard.total} Qs`} note="Each bar = correct ÷ attempted">
          {diffOrder.map((label, i) => (
            <div key={label} style={{ marginBottom: i < diffOrder.length - 1 ? 16 : 0 }}>
              <BreakdownRow
                color={diffDotColor[label]} label={label}
                pct={diffBreakdown[label].total ? (diffBreakdown[label].correct / diffBreakdown[label].total) * 100 : 0}
                pctLabel={diffBreakdown[label].total ? `${Math.round((diffBreakdown[label].correct / diffBreakdown[label].total) * 100)}%` : "0%"}
                countLabel={`${diffBreakdown[label].correct}/${diffBreakdown[label].correct + diffBreakdown[label].wrong}`}
                delay={i * 60}
              />
            </div>
          ))}
        </SectionCard>

        {Object.keys(byYear).length >= 1 && (
          <SectionCard title="Year-wise" accent={P.blue.solid} right={yearMeta ? `peak ${yearMeta.peakYear} (${yearMeta.peakTotal})` : null}>
            <YearBarChart byYear={byYear} />
            <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap", justifyContent: "center" }}>
              <LegendDot color={P.blue.solid} label="Attempted" />
              <LegendDot color={P.correct.solid} label="Correct" />
            </div>
          </SectionCard>
        )}
      </div>

      {/* ── Row B: Subject view (Pie + Table) or Topic view (Table only) — both have Result/Difficulty filters ── */}
      {currentData.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <SectionCard
            title={viewMode === "subjects" ? "Subject Performance" : "Topic Performance"}
            accent={viewMode === "subjects" ? P.purple.solid : P.indigo.solid}
            right={viewMode === "subjects" ? `${subjectData.length} subjects · ${total} total Qs` : `${topicData.length} topics · ${total} total Qs`}
            note={viewMode === "subjects" ? "Click a pie segment to highlight it · click a table row to view its questions" : "Click any row to view all questions from that topic"}
          >
            <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
              <button onClick={() => { setViewMode("subjects"); setSelectedSegment(null); }}
                style={{ padding: "9px 20px", borderRadius: 10, fontSize: 13, fontFamily: MONO, border: viewMode === "subjects" ? `2px solid ${P.purple.solid}` : "1px solid var(--bg-border)", background: viewMode === "subjects" ? `${P.purple.solid}18` : "transparent", color: viewMode === "subjects" ? P.purple.solid : "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontWeight: viewMode === "subjects" ? 700 : 500, boxShadow: "none" }}>
                <PieChartIcon size={17} /> Subject View
              </button>
              <button onClick={() => { setViewMode("topics"); setSelectedSegment(null); }}
                style={{ padding: "9px 20px", borderRadius: 10, fontSize: 13, fontFamily: MONO, border: viewMode === "topics" ? `2px solid ${P.indigo.solid}` : "1px solid var(--bg-border)", background: viewMode === "topics" ? `${P.indigo.solid}18` : "transparent", color: viewMode === "topics" ? P.indigo.solid : "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontWeight: viewMode === "topics" ? 700 : 500, boxShadow: "none" }}>
                <Table size={17} /> Topic Table
              </button>
            </div>

            {viewMode === "subjects" ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, alignItems: "start" }}>
                <div style={{ overflow: "visible" }}>
                  <SubjectPieChart data={subjectData} total={total} onSegmentClick={(label) => setSelectedSegment(selectedSegment === label ? null : label)} selectedSegment={selectedSegment} />
                </div>
                <div>
                  <EnhancedDataTable attempts={attempts} field="subject" viewType="Subject" />
                </div>
              </div>
            ) : (
              <EnhancedDataTable attempts={attempts} field="topic" viewType="Topic" />
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
}