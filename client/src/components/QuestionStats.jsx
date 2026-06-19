
import { useMemo, useState } from "react";
import { useQuestionAttempts } from "../hooks/useQuestionAttempts";
import { TEST_T29 } from "../data/Test/Testseries_t29_data";

// ─── Palette helpers ──────────────────────────────────────────────────────────
const DIFF_META = {
  Easy:   { bg: "rgba(52,211,153,0.12)",  text: "#6ee7b7", border: "rgba(52,211,153,0.3)",  gradient: "linear-gradient(135deg, #6ee7b7, #34d399)" },
  Medium: { bg: "rgba(251,191,36,0.12)",  text: "#fcd34d", border: "rgba(251,191,36,0.3)",  gradient: "linear-gradient(135deg, #fcd34d, #f59e0b)" },
  Hard:   { bg: "rgba(248,113,113,0.12)", text: "#fca5a5", border: "rgba(248,113,113,0.3)", gradient: "linear-gradient(135deg, #fca5a5, #ef4444)" },
};

const RESULT_META = {
  correct: { bg: "rgba(52,211,153,0.12)",  text: "#6ee7b7",  border: "rgba(52,211,153,0.3)",  label: "Correct",  icon: "✓" },
  wrong:   { bg: "rgba(248,113,113,0.12)", text: "#fca5a5",  border: "rgba(248,113,113,0.3)", label: "Wrong",    icon: "✗" },
  skipped: { bg: "rgba(148,163,184,0.12)", text: "#94a3b8",  border: "rgba(148,163,184,0.3)",  label: "Skipped",  icon: "⊘" },
};

// Source categories for enhanced filtering
const SOURCE_CATEGORIES = {
  "PYQ": { label: "PYQs (Topic-wise)", icon: "📚", color: "#4F8EF7" },
  "Test": { label: "Test Series", icon: "📝", color: "#f97316" },
};

const PAPER_TYPES = {
  "GS": { label: "General Studies", icon: "📖", color: "#4F8EF7" },
  "CSAT": { label: "CSAT", icon: "🧮", color: "#f97316" },
  "GS1": { label: "GS Paper I", icon: "📋", color: "#4F8EF7" },
  "GS2": { label: "GS Paper II", icon: "📋", color: "#34d399" },
  "GS3": { label: "GS Paper III", icon: "📋", color: "#f97316" },
  "GS4": { label: "GS Paper IV", icon: "📋", color: "#a78bfa" },
};

function Chip({ label, active, color, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 11,
        padding: "5px 14px",
        borderRadius: 20,
        border: active ? `1px solid ${color}` : "1px solid var(--bg-border)",
        background: active ? `${color}15` : "transparent",
        color: active ? color : "var(--text-muted)",
        cursor: "pointer",
        fontWeight: active ? 600 : 400,
        whiteSpace: "nowrap",
        transition: "all 0.2s ease",
        fontFamily: "'DM Mono', monospace",
        display: "flex",
        alignItems: "center",
        gap: 4,
        boxShadow: active ? `0 2px 8px ${color}20` : "none",
        transform: active ? "translateY(-1px)" : "none",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.target.style.borderColor = color;
          e.target.style.color = color;
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.target.style.borderColor = "var(--bg-border)";
          e.target.style.color = "var(--text-muted)";
        }
      }}
    >
      {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
      {label}
    </button>
  );
}

function StatTile({ value, label, color, sub, icon }) {
  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--bg-border)",
      borderRadius: 16,
      padding: "20px 16px",
      textAlign: "center",
      borderTop: `3px solid ${color}`,
      boxShadow: "var(--shadow-sm), inset 0 1px 0 rgba(255,255,255,0.05)",
      transition: "all 0.3s ease",
      position: "relative",
      overflow: "hidden",
    }}>
      {icon && (
        <div style={{
          position: "absolute",
          top: 8,
          right: 8,
          fontSize: 20,
          opacity: 0.1,
          color: color,
        }}>
          {icon}
        </div>
      )}
      <div style={{
        fontSize: 36,
        fontWeight: 700,
        color: "var(--text-primary)",
        lineHeight: 1,
        fontFamily: "'Playfair Display', Georgia, serif",
        background: `linear-gradient(135deg, var(--text-primary), ${color})`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 11,
        color: "var(--text-muted)",
        marginTop: 6,
        fontFamily: "'DM Mono', monospace",
        fontWeight: 500,
        letterSpacing: 0.5,
      }}>
        {label}
      </div>
      {sub && (
        <div style={{
          fontSize: 10,
          color: color,
          marginTop: 4,
          fontFamily: "'DM Mono', monospace",
          opacity: 0.8,
          fontWeight: 500,
        }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function HBar({ label, count, total, color, icon }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 10,
      padding: "4px 0",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 64 }}>
        {icon && <span style={{ fontSize: 14, color: color, opacity: 0.7 }}>{icon}</span>}
        <span style={{
          fontSize: 11,
          fontFamily: "'DM Mono', monospace",
          color: "var(--text-secondary)",
          fontWeight: 500,
        }}>
          {label}
        </span>
      </div>
      <div style={{
        flex: 1,
        height: 12,
        background: "var(--bg-muted)",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
      }}>
        <div style={{
          width: `${pct}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${color}dd, ${color})`,
          borderRadius: 12,
          transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: `0 1px 4px ${color}40`,
        }} />
      </div>
      <span style={{
        fontSize: 11,
        fontFamily: "'DM Mono', monospace",
        color: "var(--text-secondary)",
        minWidth: 56,
        fontWeight: 500,
        textAlign: "right",
      }}>
        {count} <span style={{ opacity: 0.5, fontSize: 10 }}>({pct}%)</span>
      </span>
    </div>
  );
}

function YearChart({ byYear, sourceFilter }) {
  const years = Object.keys(byYear).sort((a, b) => b - a).slice(0, 16);
  if (years.length === 0) return null;
  const maxTotal = Math.max(...years.map(y => byYear[y].total), 1);

  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--bg-border)",
      borderRadius: 16,
      padding: "24px 24px",
      boxShadow: "var(--shadow-sm)",
    }}>
      <div style={{
        fontSize: 15,
        fontWeight: 600,
        color: "var(--text-primary)",
        marginBottom: 20,
        fontFamily: "'Playfair Display', Georgia, serif",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        Year-wise Performance
        {sourceFilter !== "All" && (
          <span style={{
            fontSize: 11,
            color: "var(--text-muted)",
            fontFamily: "'DM Mono', monospace",
            fontWeight: 400,
          }}>
            ({sourceFilter === "PYQ" ? "Topic-wise PYQs" : "Test Series"})
          </span>
        )}
      </div>
      <div style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
        height: 120,
        overflowX: "auto",
        paddingBottom: 30,
      }}>
        {years.map(y => {
          const { total, correct } = byYear[y];
          const totalH  = Math.round((total   / maxTotal) * 100);
          const correctH = Math.round((correct / maxTotal) * 100);
          return (
            <div key={y} style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              minWidth: 36,
              transition: "transform 0.2s ease",
            }}>
              <span style={{
                fontSize: 10,
                color: "var(--text-muted)",
                fontFamily: "'DM Mono', monospace",
                fontWeight: 600,
              }}>
                {total}
              </span>
              <div style={{
                width: 24,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                height: 100,
                gap: 1,
                cursor: "pointer",
              }}>
                <div style={{
                  width: "100%",
                  height: totalH,
                  background: "linear-gradient(180deg, rgba(79,142,247,0.4), rgba(79,142,247,0.2))",
                  borderRadius: "4px 4px 0 0",
                  position: "relative",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 4px rgba(79,142,247,0.1)",
                }}>
                  <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: correctH,
                    background: "linear-gradient(180deg, #6ee7b7, #34d399)",
                    borderRadius: "4px 4px 0 0",
                    boxShadow: "0 1px 3px rgba(52,211,153,0.3)",
                  }} />
                </div>
              </div>
              <span style={{
                fontSize: 9,
                color: "var(--text-muted)",
                fontFamily: "'DM Mono', monospace",
                transform: "rotate(-45deg)",
                transformOrigin: "top left",
                marginTop: 8,
                fontWeight: 600,
              }}>
                {y}
              </span>
            </div>
          );
        })}
      </div>
      <div style={{
        marginTop: 24,
        display: "flex",
        gap: 20,
        flexWrap: "wrap",
        padding: "12px 0",
        borderTop: "1px solid var(--bg-border)",
      }}>
        <span style={{
          fontSize: 11,
          color: "var(--text-muted)",
          fontFamily: "'DM Mono', monospace",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}>
          <span style={{
            width: 12,
            height: 12,
            borderRadius: 3,
            background: "linear-gradient(135deg, rgba(79,142,247,0.4), rgba(79,142,247,0.2))",
            display: "inline-block",
            border: "1px solid rgba(79,142,247,0.3)",
          }} />
          Attempted
        </span>
        <span style={{
          fontSize: 11,
          color: "var(--text-muted)",
          fontFamily: "'DM Mono', monospace",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}>
          <span style={{
            width: 12,
            height: 12,
            borderRadius: 3,
            background: "linear-gradient(135deg, #6ee7b7, #34d399)",
            display: "inline-block",
            border: "1px solid rgba(52,211,153,0.3)",
          }} />
          Correct
        </span>
      </div>
    </div>
  );
}

function AttemptCard({ a }) {
  const resultMeta = RESULT_META[a.result] || RESULT_META.skipped;
  const diffMeta   = DIFF_META[a.difficulty] || DIFF_META.Medium;
  const sourceMeta = SOURCE_CATEGORIES[a.source] || { label: a.source, color: "var(--text-muted)" };

  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--bg-border)",
      borderRadius: 12,
      padding: "14px 18px",
      borderLeft: `4px solid ${resultMeta.text}`,
      display: "flex",
      flexDirection: "column",
      gap: 10,
      transition: "all 0.2s ease",
      boxShadow: "var(--shadow-sm)",
      cursor: "default",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateX(4px)";
      e.currentTarget.style.boxShadow = `0 4px 12px ${resultMeta.text}20`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateX(0)";
      e.currentTarget.style.boxShadow = "var(--shadow-sm)";
    }}
    >
      <div style={{
        fontSize: 13,
        fontWeight: 500,
        color: "var(--text-primary)",
        lineHeight: 1.6,
        maxWidth: "100%",
        wordWrap: "break-word",
      }}>
        {a.questionText?.slice(0, 180)}{a.questionText?.length > 180 ? "…" : ""}
      </div>
      <div style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        alignItems: "center",
      }}>
        {a.source && (
          <span style={{
            fontSize: 10,
            padding: "3px 10px",
            borderRadius: 6,
            background: `${sourceMeta.color}15`,
            color: sourceMeta.color,
            border: `1px solid ${sourceMeta.color}30`,
            fontFamily: "'DM Mono', monospace",
            fontWeight: 600,
          }}>
            {sourceMeta.label}
          </span>
        )}
        {a.year && (
          <span style={{
            fontSize: 10,
            padding: "3px 10px",
            borderRadius: 6,
            background: "var(--bg-muted)",
            color: "var(--text-secondary)",
            border: "1px solid var(--bg-border)",
            fontFamily: "'DM Mono', monospace",
            fontWeight: 600,
            letterSpacing: 0.5,
          }}>
            {a.year}
          </span>
        )}
        {a.paper && (
          <span style={{
            fontSize: 10,
            padding: "3px 10px",
            borderRadius: 20,
            background: "rgba(251,191,36,0.08)",
            color: "#fbbf24",
            border: "1px solid rgba(251,191,36,0.2)",
            fontFamily: "'DM Mono', monospace",
            fontWeight: 500,
          }}>
            {a.paper}
          </span>
        )}
        {a.subject && (
          <span style={{
            fontSize: 10,
            padding: "3px 10px",
            borderRadius: 20,
            background: "var(--bg-muted)",
            color: "var(--text-muted)",
            border: "1px solid var(--bg-border)",
            fontFamily: "'DM Mono', monospace",
          }}>
            {a.subject}
          </span>
        )}
        {a.topic && (
          <span style={{
            fontSize: 10,
            padding: "3px 10px",
            borderRadius: 20,
            background: "var(--bg-muted)",
            color: "var(--text-muted)",
            border: "1px solid var(--bg-border)",
            fontFamily: "'DM Mono', monospace",
          }}>
            {a.topic}
          </span>
        )}
        {a.difficulty && (
          <span style={{
            fontSize: 10,
            padding: "3px 10px",
            borderRadius: 20,
            background: diffMeta.bg,
            color: diffMeta.text,
            border: `1px solid ${diffMeta.border}`,
            fontFamily: "'DM Mono', monospace",
            fontWeight: 600,
          }}>
            {a.difficulty}
          </span>
        )}
        {a.testTitle && (
          <span style={{
            fontSize: 10,
            padding: "3px 10px",
            borderRadius: 20,
            background: "rgba(249,115,22,0.08)",
            color: "#f97316",
            border: "1px solid rgba(249,115,22,0.2)",
            fontFamily: "'DM Mono', monospace",
            fontWeight: 600,
          }}>
            {a.testTitle}
          </span>
        )}
        <span style={{
          fontSize: 10,
          padding: "3px 10px",
          borderRadius: 20,
          background: resultMeta.bg,
          color: resultMeta.text,
          border: `1px solid ${resultMeta.border}`,
          fontFamily: "'DM Mono', monospace",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}>
          {resultMeta.icon} {resultMeta.label}
        </span>
        {a.attemptedAt && (
          <span style={{
            marginLeft: "auto",
            fontSize: 10,
            color: "var(--text-muted)",
            fontFamily: "'DM Mono', monospace",
            opacity: 0.8,
          }}>
            {new Date(a.attemptedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
      {a.score !== undefined && (
        <div style={{
          fontSize: 10,
          color: "var(--text-muted)",
          fontFamily: "'DM Mono', monospace",
          padding: "4px 8px",
          background: "var(--bg-muted)",
          borderRadius: 6,
          display: "inline-flex",
          gap: 8,
          width: "fit-content",
        }}>
          <span>Score: {a.score?.toFixed(1)}</span>
          {a.accuracy !== undefined && <span>Acc: {a.accuracy}%</span>}
        </div>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function QuestionStats() {
  const { attempts, clearAttempts } = useQuestionAttempts();
  const [diffFilter,    setDiffFilter]    = useState("All");
  const [resultFilter,  setResultFilter]  = useState("All");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [sourceFilter,  setSourceFilter]  = useState("All");
  const [paperFilter,   setPaperFilter]   = useState("All");
  const [search,        setSearch]        = useState("");
  const [showLog,       setShowLog]       = useState(false);

  // Enhanced attempts with source and paper metadata
  const enhancedAttempts = useMemo(() => {
    return attempts.map(a => {
      // Detect source (PYQ vs Test)
      const isTest = TEST_T29.some(test =>
        test.questions.some(q =>
          (q._id || q.id) === a.id ||
          q.questionText?.includes(a.questionText?.slice(0, 50))
        )
      );

      // Determine paper type
      let paper = a.paper || a.subject;
      if (paper?.includes("GS")) paper = "GS";
      else if (paper?.includes("CSAT") || a.subject?.includes("CSAT")) paper = "CSAT";

      return {
        ...a,
        source: a.source || (isTest ? "Test" : "PYQ"),
        paper: a.paper || paper || "GS",
      };
    });
  }, [attempts]);

  // ── derived stats ──────────────────────────────────────────────────────────
  const total   = enhancedAttempts.length;
  const correct = enhancedAttempts.filter(a => a.result === "correct").length;
  const wrong   = enhancedAttempts.filter(a => a.result === "wrong").length;
  const skipped = enhancedAttempts.filter(a => a.result === "skipped").length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  // Source breakdown
  const pyqAttempts   = enhancedAttempts.filter(a => a.source === "PYQ").length;
  const testAttempts  = enhancedAttempts.filter(a => a.source === "Test").length;
  const gsAttempts    = enhancedAttempts.filter(a => a.paper === "GS").length;
  const csatAttempts  = enhancedAttempts.filter(a => a.paper === "CSAT").length;

  const byDiff = useMemo(() => {
    const map = { Easy: { total: 0, correct: 0 }, Medium: { total: 0, correct: 0 }, Hard: { total: 0, correct: 0 } };
    enhancedAttempts.forEach(a => {
      if (map[a.difficulty]) {
        map[a.difficulty].total++;
        if (a.result === "correct") map[a.difficulty].correct++;
      }
    });
    return map;
  }, [enhancedAttempts]);

  const byYear = useMemo(() => {
    const map = {};
    enhancedAttempts.forEach(a => {
      if (!a.year) return;
      if (!map[a.year]) map[a.year] = { total: 0, correct: 0 };
      map[a.year].total++;
      if (a.result === "correct") map[a.year].correct++;
    });
    return map;
  }, [enhancedAttempts]);

  // Source-wise year breakdown
  const byYearAndSource = useMemo(() => {
    const map = {};
    enhancedAttempts.forEach(a => {
      if (!a.year) return;
      const key = `${a.year}-${a.source}`;
      if (!map[key]) map[key] = { total: 0, correct: 0 };
      map[key].total++;
      if (a.result === "correct") map[key].correct++;
    });
    return map;
  }, [enhancedAttempts]);

  const subjects = useMemo(() =>
    ["All", ...new Set(enhancedAttempts.map(a => a.subject).filter(Boolean))],
    [enhancedAttempts]
  );

  const papers = useMemo(() =>
    ["All", ...new Set(enhancedAttempts.map(a => a.paper).filter(Boolean))],
    [enhancedAttempts]
  );

  const filtered = useMemo(() => {
    return enhancedAttempts.filter(a => {
      if (diffFilter    !== "All" && a.difficulty !== diffFilter)    return false;
      if (resultFilter  !== "All" && a.result     !== resultFilter)  return false;
      if (subjectFilter !== "All" && a.subject    !== subjectFilter) return false;
      if (sourceFilter  !== "All" && a.source     !== sourceFilter)  return false;
      if (paperFilter   !== "All" && a.paper      !== paperFilter)   return false;
      if (search.trim()) {
        const s = search.toLowerCase();
        if (!a.questionText?.toLowerCase().includes(s) &&
            !a.topic?.toLowerCase().includes(s) &&
            !a.subject?.toLowerCase().includes(s) &&
            !a.testTitle?.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [enhancedAttempts, diffFilter, resultFilter, subjectFilter, sourceFilter, paperFilter, search]);

  // ── empty state ────────────────────────────────────────────────────────────
  if (total === 0) {
    return (
      <div style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        maxWidth: 900,
        margin: "0 auto",
        padding: "80px 24px",
        color: "var(--text-primary)",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>📊</div>
        <div style={{
          fontSize: 28,
          fontWeight: 600,
          fontFamily: "'Playfair Display', Georgia, serif",
          marginBottom: 12,
        }}>
          No Attempts Yet
        </div>
        <div style={{
          fontSize: 15,
          color: "var(--text-muted)",
          fontFamily: "'DM Mono', monospace",
          lineHeight: 1.8,
          maxWidth: 500,
          margin: "0 auto",
        }}>
          Start practicing questions in the <strong style={{ color: "#4F8EF7" }}>Topic-wise</strong> tab
          or take a <strong style={{ color: "#f97316" }}>Test Series</strong>.<br />
          Every question you answer gets tracked here automatically.
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: "'DM Sans', system-ui, sans-serif",
      maxWidth: 1200,
      margin: "0 auto",
      padding: "40px 0px",
      color: "var(--text-primary)",
    }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 36,
        gap: 20,
        flexWrap: "wrap",
      }}>
        <div>
          <div style={{
            fontSize: 32,
            fontWeight: 600,
            fontFamily: "'Playfair Display', Georgia, serif",
            lineHeight: 1.2,
          }}>
            Practice Analytics
          </div>
          <div style={{
            fontSize: 14,
            color: "var(--text-muted)",
            marginTop: 6,
            fontFamily: "'DM Mono', monospace",
            opacity: 0.9,
          }}>
            Tracked from PYQs & Test Series · {total} attempts recorded
          </div>
        </div>
        <button
          onClick={() => {
            if (window.confirm("Clear all attempt history? This cannot be undone.")) {
              clearAttempts();
            }
          }}
          style={{
            fontSize: 12,
            padding: "8px 18px",
            borderRadius: 10,
            border: "1px solid rgba(248,113,113,0.3)",
            background: "rgba(248,113,113,0.06)",
            color: "#fca5a5",
            cursor: "pointer",
            fontFamily: "'DM Mono', monospace",
            fontWeight: 500,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(248,113,113,0.12)";
            e.target.style.borderColor = "rgba(248,113,113,0.5)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(248,113,113,0.06)";
            e.target.style.borderColor = "rgba(248,113,113,0.3)";
          }}
        >
          Clear History
        </button>
      </div>

      {/* ── Summary tiles ──────────────────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 12,
        marginBottom: 24,
      }}>
        <StatTile value={total}    label="Total Attempts"  color="#4F8EF7" icon="📝" />
        <StatTile value={correct}  label="Correct"         color="#6ee7b7" sub={`${accuracy}% accuracy`} icon="✓" />
        <StatTile value={wrong}    label="Wrong"           color="#f87171" icon="✗" />
        <StatTile value={skipped}  label="Skipped"         color="#94a3b8" icon="⊘" />
        <StatTile value={`${accuracy}%`} label="Accuracy"  color="#fbbf24" icon="🎯" />
        <StatTile value={Object.keys(byYear).length} label="Years Covered" color="#a78bfa" icon="📅" />
      </div>

      {/* ── Source & Paper Breakdown ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 16,
        marginBottom: 24,
      }}>
        {/* Source Breakdown */}
        <div style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--bg-border)",
          borderRadius: 16,
          padding: "24px 24px",
          boxShadow: "var(--shadow-sm)",
        }}>
          <div style={{
            fontSize: 15,
            fontWeight: 600,
            color: "var(--text-primary)",
            marginBottom: 20,
            fontFamily: "'Playfair Display', Georgia, serif",
          }}>
            Source Breakdown
          </div>
          <HBar label="PYQs"       count={pyqAttempts}   total={total} color="#4F8EF7" icon="📚" />
          <HBar label="Tests"      count={testAttempts}  total={total} color="#f97316" icon="📝" />
          <HBar label="GS Paper"   count={gsAttempts}    total={total} color="#4F8EF7" icon="📖" />
          <HBar label="CSAT"       count={csatAttempts}  total={total} color="#f97316" icon="🧮" />
        </div>

        {/* Difficulty breakdown */}
        <div style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--bg-border)",
          borderRadius: 16,
          padding: "24px 24px",
          boxShadow: "var(--shadow-sm)",
        }}>
          <div style={{
            fontSize: 15,
            fontWeight: 600,
            color: "var(--text-primary)",
            marginBottom: 20,
            fontFamily: "'Playfair Display', Georgia, serif",
          }}>
            Difficulty Breakdown
          </div>
          {["Easy", "Medium", "Hard"].map(d => {
            const { total: dt, correct: dc } = byDiff[d];
            const meta = DIFF_META[d];
            return (
              <div key={d} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{
                    fontSize: 12,
                    color: meta.text,
                    fontFamily: "'DM Mono', monospace",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}>
                    <span style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: meta.gradient,
                      display: "inline-block",
                    }} />
                    {d}
                  </span>
                  <span style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    fontFamily: "'DM Mono', monospace",
                    fontWeight: 500,
                  }}>
                    {dc}/{dt} correct {dt > 0 ? `(${Math.round((dc / dt) * 100)}%)` : ""}
                  </span>
                </div>
                <div style={{
                  height: 10,
                  background: "var(--bg-muted)",
                  borderRadius: 10,
                  overflow: "hidden",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                }}>
                  <div style={{
                    height: "100%",
                    width: `${dt > 0 ? Math.round((dc / dt) * 100) : 0}%`,
                    background: meta.gradient,
                    borderRadius: 10,
                    transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: `0 1px 4px ${meta.text}40`,
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Year chart ────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 36 }}>
        <YearChart byYear={byYear} sourceFilter={sourceFilter} />
      </div>

      {/* ── Attempt log ──────────────────────────────────────────────────── */}
      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--bg-border)",
        borderRadius: 16,
        padding: "24px 24px",
        boxShadow: "var(--shadow-sm)",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}>
          <div style={{
            fontSize: 15,
            fontWeight: 600,
            color: "var(--text-primary)",
            fontFamily: "'Playfair Display', Georgia, serif",
          }}>
            Attempt Log{' '}
            <span style={{
              fontSize: 12,
              color: "var(--text-muted)",
              fontFamily: "'DM Mono', monospace",
              fontWeight: 400,
            }}>
              ({filtered.length} of {total} shown)
            </span>
          </div>
          <button
            onClick={() => setShowLog(v => !v)}
            style={{
              fontSize: 11,
              padding: "6px 16px",
              borderRadius: 10,
              cursor: "pointer",
              border: "1px solid var(--bg-border)",
              background: "var(--bg-muted)",
              color: "var(--text-secondary)",
              fontFamily: "'DM Mono', monospace",
              fontWeight: 500,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "var(--bg-surface)";
              e.target.style.borderColor = "#6ee7b7";
              e.target.style.color = "#6ee7b7";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "var(--bg-muted)";
              e.target.style.borderColor = "var(--bg-border)";
              e.target.style.color = "var(--text-secondary)";
            }}
          >
            {showLog ? "▲ Hide All" : "▼ Show All"}
          </button>
        </div>

        {/* Enhanced Filters */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginBottom: 20,
          padding: "16px",
          background: "var(--bg-muted)",
          borderRadius: 12,
          border: "1px solid var(--bg-border)",
        }}>
          {/* Source Filter */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{
              fontSize: 10,
              color: "var(--text-muted)",
              fontFamily: "'DM Mono', monospace",
              minWidth: 50,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}>
              Source
            </span>
            <Chip
              label="All"
              active={sourceFilter === "All"}
              color="#a78bfa"
              onClick={() => setSourceFilter("All")}
            />
            <Chip
              label="PYQs"
              active={sourceFilter === "PYQ"}
              color="#4F8EF7"
              onClick={() => setSourceFilter("PYQ")}
              icon="📚"
            />
            <Chip
              label="Tests"
              active={sourceFilter === "Test"}
              color="#f97316"
              onClick={() => setSourceFilter("Test")}
              icon="📝"
            />
          </div>

          {/* Paper Filter */}
          {papers.length > 2 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{
                fontSize: 10,
                color: "var(--text-muted)",
                fontFamily: "'DM Mono', monospace",
                minWidth: 50,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}>
                Paper
              </span>
              {papers.map(p => (
                <Chip
                  key={p}
                  label={PAPER_TYPES[p]?.label || p}
                  active={paperFilter === p}
                  color={PAPER_TYPES[p]?.color || "#a78bfa"}
                  onClick={() => setPaperFilter(p)}
                  icon={PAPER_TYPES[p]?.icon}
                />
              ))}
            </div>
          )}

          {/* Result Filter */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{
              fontSize: 10,
              color: "var(--text-muted)",
              fontFamily: "'DM Mono', monospace",
              minWidth: 50,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}>
              Result
            </span>
            {["All","correct","wrong","skipped"].map(r => (
              <Chip
                key={r}
                label={r === "All" ? "All" : RESULT_META[r]?.label || r}
                active={resultFilter === r}
                color={r === "All" ? "#a78bfa" : RESULT_META[r]?.text || "#a78bfa"}
                onClick={() => setResultFilter(r)}
                icon={r === "All" ? null : RESULT_META[r]?.icon}
              />
            ))}
          </div>

          {/* Difficulty Filter */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{
              fontSize: 10,
              color: "var(--text-muted)",
              fontFamily: "'DM Mono', monospace",
              minWidth: 50,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}>
              Difficulty
            </span>
            {["All","Easy","Medium","Hard"].map(d => (
              <Chip
                key={d}
                label={d}
                active={diffFilter === d}
                color={d === "All" ? "#a78bfa" : DIFF_META[d]?.text || "#a78bfa"}
                onClick={() => setDiffFilter(d)}
              />
            ))}
          </div>

          {/* Subject Filter */}
          {subjects.length > 2 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{
                fontSize: 10,
                color: "var(--text-muted)",
                fontFamily: "'DM Mono', monospace",
                minWidth: 50,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}>
                Subject
              </span>
              {subjects.map(s => (
                <Chip
                  key={s}
                  label={s}
                  active={subjectFilter === s}
                  color="#fbbf24"
                  onClick={() => setSubjectFilter(s)}
                />
              ))}
            </div>
          )}

          {/* Search */}
          <div style={{ position: "relative", marginTop: 4 }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search questions, topics, test titles..."
              style={{
                width: "100%",
                padding: "10px 12px 10px 36px",
                fontSize: 13,
                background: "var(--bg-surface)",
                border: "1px solid var(--bg-border)",
                borderRadius: 10,
                color: "var(--text-primary)",
                outline: "none",
                fontFamily: "'DM Sans', sans-serif",
                boxSizing: "border-box",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#6ee7b7";
                e.target.style.boxShadow = "0 0 0 3px rgba(110,231,183,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--bg-border)";
                e.target.style.boxShadow = "none";
              }}
            />
            <span style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
              pointerEvents: "none",
              fontSize: 16,
            }}>
              ⌕
            </span>
          </div>
        </div>

        {/* Cards */}
        {showLog && (
          filtered.length === 0 ? (
            <div style={{
              padding: "32px",
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: 13,
              fontFamily: "'DM Mono', monospace",
            }}>
              No attempts match your filters.
            </div>
          ) : (
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              maxHeight: 560,
              overflowY: "auto",
              padding: "4px",
            }}>
              {filtered.map((a, i) => <AttemptCard key={a.id || i} a={a} />)}
            </div>
          )
        )}
        {!showLog && (
          <div style={{
            fontSize: 12,
            color: "var(--text-muted)",
            fontFamily: "'DM Mono', monospace",
            textAlign: "center",
            padding: "12px 0",
            opacity: 0.8,
          }}>
            Click "Show All" to browse individual attempts.
          </div>
        )}
      </div>
    </div>
  );
}