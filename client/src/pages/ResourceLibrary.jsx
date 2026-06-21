// ─── Resource Library ─────────────────────────────────────────────────────────
// Four sections: NCERT Books · My Notes · Reference Books · YouTube Classes

import { useState, useMemo } from "react";
import TestSeriesPage from "./Testseriespage";
import MentorNotes from "./MentorNotes"; // adjust path if MentorNotes.jsx lives elsewhere

import {
  NCERT_BOOKS, SUBJECTS, SUBJECT_PAPER_MAP, NCERT_LAST_UPDATED,
} from "../data/Resources/ncert_data";
import {
  REFERENCE_BOOKS, REF_BOOK_PAPERS, PRIORITY_COLORS, REF_BOOKS_LAST_UPDATED,
} from "../data/Resources/reference_books_data";
import {
  YOUTUBE_CLASSES, YT_SUBJECTS, YT_PAPERS, YT_LAST_UPDATED,
} from "../data/Resources/classes";

// ─── COVER IMAGE MAP ──────────────────────────────────────────────────────────
const COVER_MAP = {};

// ─── SUBJECT META ─────────────────────────────────────────────────────────────
const SUBJECT_PALETTE = {
  "Art And Culture": { bg: "#78350f", accent: "#fbbf24", emoji: "🏛️" },
  Economics:         { bg: "#064e3b", accent: "#34d399", emoji: "📈" },
  Geography:         { bg: "#1e3a5f", accent: "#60a5fa", emoji: "🌏" },
  History:           { bg: "#3b1f5e", accent: "#c084fc", emoji: "📜" },
  Polity:            { bg: "#7f1d1d", accent: "#f87171", emoji: "⚖️" },
  Sociology:         { bg: "#1c3d2e", accent: "#6ee7b7", emoji: "🧭" },
};

function getSubjectMeta(subject) {
  return SUBJECT_PALETTE[subject] || { bg: "#1e293b", accent: "#94a3b8", emoji: "📚" };
}

// ─── MINI COMPONENTS ──────────────────────────────────────────────────────────
function FilterChip({ label, active, color = "#4F8EF7", onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 11, padding: "4px 12px", borderRadius: 20,
        border: active ? `0.5px solid ${color}` : "0.5px solid var(--bg-border)",
        background: active ? `${color}22` : "transparent",
        color: active ? color : "var(--text-muted)",
        cursor: "pointer", fontWeight: active ? 600 : 400,
        whiteSpace: "nowrap", transition: "all .15s",
        fontFamily: "'DM Mono', monospace",
      }}
    >
      {label}
    </button>
  );
}

const SUBJECT_COLORS = {
  History: "#c084fc", Geography: "#60a5fa", Polity: "#f87171",
  Economics: "#34d399", "Science & Technology": "#f9a8d4", Sociology: "#6ee7b7",
  "Art And Culture": "#fbbf24", Environment: "#6ee7b7", CSAT: "#fbbf24",
  Essay: "#a78bfa", "Current Affairs": "#fb923c", General: "#94a3b8",
};

const LANG_COLORS = { Hindi: "#f97316", English: "#60a5fa", Bilingual: "#a78bfa" };

// ─── NCERT BOOK CARD ──────────────────────────────────────────────────────────
function NCERTBookCard({ book, localDone, onToggleDone }) {
  const [hovered, setHovered] = useState(false);
  const isDone = localDone ?? book.done ?? false;
  const meta = getSubjectMeta(book.subject);
  const coverSrc = COVER_MAP[book.id] || null;

  const handleOpen = () => {
    const target = book.url || (book.filePath ? `/api/ncert/file?path=${encodeURIComponent(book.filePath)}` : null);
    if (target) window.open(target, "_blank", "noopener,noreferrer");
    else alert("No file path or URL configured for this book.\nEdit src/data/ncert_data.js to add it.");
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--bg-surface)",
        border: `0.5px solid ${hovered && !isDone ? meta.accent + "55" : "var(--bg-border)"}`,
        borderRadius: 16,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s ease",
        transform: hovered ? "translateY(-3px)" : "none",
        boxShadow: hovered ? `0 12px 32px rgba(0,0,0,0.25), 0 0 0 1px ${meta.accent}20` : "0 2px 8px rgba(0,0,0,0.12)",
        opacity: isDone ? 0.65 : 1,
        position: "relative",
      }}
    >
      <div style={{
        height: 3,
        background: isDone
          ? "linear-gradient(90deg, #34d399, #6ee7b7)"
          : `linear-gradient(90deg, ${meta.accent}, ${meta.accent}88)`,
        flexShrink: 0,
      }} />

      <div
        onClick={handleOpen}
        style={{
          position: "relative",
          height: 180,
          background: coverSrc ? "#000" : `linear-gradient(145deg, ${meta.bg} 0%, #0f0f1a 100%)`,
          cursor: book.url || book.filePath ? "pointer" : "default",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {coverSrc ? (
          <img src={coverSrc} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <>
            <div style={{
              position: "absolute", top: -24, right: -24,
              width: 250, height: 150, borderRadius: "50%",
              background: `${meta.accent}15`, border: `1px solid ${meta.accent}20`,
            }} />
            <div style={{
              position: "absolute", bottom: -16, left: -16,
              width: 100, height: 70, borderRadius: "50%",
              background: `${meta.accent}0a`,
            }} />
            <div style={{
              position: "absolute", top: 14, left: 14,
              fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
              color: meta.accent, fontFamily: "'DM Mono', monospace",
              background: `${meta.accent}18`, border: `0.5px solid ${meta.accent}40`,
              padding: "3px 8px", borderRadius: 5,
            }}>
              CLASS {book.class}
            </div>
            <div style={{
              position: "absolute", top: 14, right: 14,
              fontSize: 9, fontWeight: 600, letterSpacing: 0.8,
              color: meta.accent, fontFamily: "'DM Mono', monospace",
              background: "rgba(0,0,0,0.4)",
              padding: "3px 8px", borderRadius: 5,
              border: `0.5px solid ${meta.accent}30`,
            }}>
              {book.subject.toUpperCase()}
            </div>
            <div style={{
              position: "absolute", bottom: 44, left: "50%",
              transform: "translateX(-50%)",
              fontSize: 42, lineHeight: 1,
              filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
            }}>
              {meta.emoji}
            </div>
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              padding: "8px 14px",
              background: `linear-gradient(transparent, rgba(0,0,0,0.6))`,
              fontSize: 8, fontWeight: 700, letterSpacing: 2,
              color: `${meta.accent}cc`, fontFamily: "'DM Mono', monospace",
              textTransform: "uppercase",
            }}>
              NCERT
            </div>
          </>
        )}

        {isDone && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              background: "rgba(52,211,153,0.2)", border: "1.5px solid #34d399",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, color: "#34d399",
            }}>✓</div>
          </div>
        )}

        {hovered && (book.url || book.filePath) && !isDone && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(2px)",
          }}>
            <div style={{
              fontSize: 12, fontWeight: 700, color: "#fff",
              background: meta.accent,
              padding: "8px 18px", borderRadius: 8,
              fontFamily: "'DM Mono', monospace",
              letterSpacing: 0.8,
              boxShadow: `0 4px 16px ${meta.accent}44`,
            }}>
              Open PDF ↗
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "14px 16px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{
          fontSize: 13, fontWeight: 700, color: "var(--text-primary)",
          lineHeight: 1.45, fontFamily: "'DM Sans', sans-serif",
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
          minHeight: 38,
        }}>
          {book.title}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
          <button
            onClick={handleOpen}
            disabled={!book.url && !book.filePath}
            style={{
              fontSize: 11, padding: "5px 12px", borderRadius: 8,
              border: `0.5px solid ${book.url || book.filePath ? meta.accent + "66" : "var(--bg-border)"}`,
              background: book.url || book.filePath ? `${meta.accent}12` : "transparent",
              color: book.url || book.filePath ? meta.accent : "var(--text-muted)",
              cursor: book.url || book.filePath ? "pointer" : "default",
              fontFamily: "'DM Mono', monospace",
              fontWeight: 600,
              transition: "all .15s",
            }}
          >
            {book.url || book.filePath ? "Open PDF ↗" : "Add file"}
          </button>

          <button
            onClick={() => onToggleDone(book.id)}
            title={isDone ? "Mark as unread" : "Mark as done"}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              fontSize: 10, padding: "5px 10px", borderRadius: 8,
              border: isDone
                ? `0.5px solid ${meta.accent}66`
                : "0.5px solid var(--bg-border)",
              background: isDone ? `${meta.accent}15` : "transparent",
              color: isDone ? meta.accent : "var(--text-muted)",
              cursor: "pointer",
              fontFamily: "'DM Mono', monospace",
              fontWeight: isDone ? 600 : 400,
              transition: "all .15s",
            }}
          >
            {isDone ? "✓ Done" : "○ Read"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── REFERENCE BOOK CARD ──────────────────────────────────────────────────────
const REF_BOOK_PALETTE = [
  { match: ["history"], bg: "#3b1f5e", accent: "#c084fc", emoji: "📜" },
  { match: ["art", "culture"], bg: "#78350f", accent: "#fbbf24", emoji: "🏛️" },
  { match: ["geography"], bg: "#1e3a5f", accent: "#60a5fa", emoji: "🌏" },
  { match: ["polity", "constitution", "governance"], bg: "#7f1d1d", accent: "#f87171", emoji: "⚖️" },
  { match: ["international", "relations"], bg: "#0f3a3a", accent: "#5eead4", emoji: "🌐" },
  { match: ["economy", "budget", "survey"], bg: "#064e3b", accent: "#34d399", emoji: "📈" },
  { match: ["science", "technology"], bg: "#4a154b", accent: "#f9a8d4", emoji: "🔬" },
  { match: ["environment"], bg: "#1c3d2e", accent: "#6ee7b7", emoji: "🌿" },
  { match: ["security"], bg: "#5c1a1a", accent: "#fb923c", emoji: "🛡️" },
  { match: ["ethics", "thinkers"], bg: "#2e1065", accent: "#a78bfa", emoji: "🧭" },
  { match: ["essay"], bg: "#3b0764", accent: "#c4b5fd", emoji: "✍️" },
  { match: ["aptitude", "csat", "mental ability", "quantitative", "reasoning"], bg: "#3f3500", accent: "#fde047", emoji: "🧮" },
  { match: ["current affairs", "gs preparation", "general"], bg: "#431407", accent: "#fb923c", emoji: "📰" },
];
function getRefBookMeta(moduleStr = "") {
  const lower = moduleStr.toLowerCase();
  return REF_BOOK_PALETTE.find(p => p.match.some(k => lower.includes(k))) || { bg: "#1e293b", accent: "#94a3b8", emoji: "📚" };
}

function RefBookCard({ book }) {
  const [hovered, setHovered]     = useState(false);
  const priorityColor = PRIORITY_COLORS[book.priority] || "#a78bfa";
  const priorityLabel = { "must-read": "Must Read", "recommended": "Recommended", "optional": "Optional" };
  const meta    = getRefBookMeta(book.module);
  const hasFile = Boolean(book.url || book.filePath);

 const handleOpen = () => {
  const target = book.url || book.filePath;

  if (target) {
    window.open(target, "_blank", "noopener,noreferrer");
  }
};

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--bg-surface)",
        border: `0.5px solid ${hovered && hasFile ? meta.accent + "55" : "var(--bg-border)"}`,
        borderRadius: 16,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s ease",
        transform: hovered ? "translateY(-3px)" : "none",
        boxShadow: hovered ? `0 12px 32px rgba(0,0,0,0.25), 0 0 0 1px ${meta.accent}20` : "0 2px 8px rgba(0,0,0,0.12)",
      }}
    >
      <div style={{ height: 3, background: `linear-gradient(90deg, ${priorityColor}, ${priorityColor}88)`, flexShrink: 0 }} />

      <div
        onClick={hasFile ? handleOpen : undefined}
        style={{
          position: "relative",
          height: 140,
          background: `linear-gradient(145deg, ${meta.bg} 0%, #0f0f1a 100%)`,
          cursor: hasFile ? "pointer" : "default",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        <div style={{
          position: "absolute", top: -24, right: -24,
          width: 220, height: 130, borderRadius: "50%",
          background: `${meta.accent}15`, border: `1px solid ${meta.accent}20`,
        }} />
        <div style={{
          position: "absolute", top: 12, left: 12,
          fontSize: 9, fontWeight: 700, letterSpacing: 1,
          color: priorityColor, fontFamily: "'DM Mono', monospace",
          background: `${priorityColor}18`, border: `0.5px solid ${priorityColor}44`,
          padding: "3px 8px", borderRadius: 5,
        }}>
          {priorityLabel[book.priority] || book.priority}
        </div>
        <div style={{
          position: "absolute", top: 12, right: 12,
          fontSize: 9, fontWeight: 600, letterSpacing: 0.8,
          color: meta.accent, fontFamily: "'DM Mono', monospace",
          background: "rgba(0,0,0,0.4)",
          padding: "3px 8px", borderRadius: 5,
          border: `0.5px solid ${meta.accent}30`,
        }}>
          {book.paper.toUpperCase()}
        </div>
        <div style={{
          position: "absolute", bottom: 34, left: "50%",
          transform: "translateX(-50%)",
          fontSize: 36, lineHeight: 1,
          filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
        }}>
          {meta.emoji}
        </div>
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "6px 14px",
          background: "linear-gradient(transparent, rgba(0,0,0,0.6))",
          fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.7)",
          fontFamily: "'DM Mono', monospace",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {book.module}
        </div>

        {hovered && hasFile && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(2px)",
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: "#fff",
              background: meta.accent,
              padding: "7px 16px", borderRadius: 8,
              fontFamily: "'DM Mono', monospace",
              letterSpacing: 0.6,
              boxShadow: `0 4px 16px ${meta.accent}44`,
            }}>
              Open PDF ↗
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "14px 16px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{
          fontSize: 13, fontWeight: 700, color: "var(--text-primary)",
          lineHeight: 1.4, fontFamily: "'DM Sans', sans-serif",
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
          minHeight: 36,
        }}>
          {book.title}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
          {book.author} · {book.edition}
        </div>

        {(book.tags || []).length > 0 && (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {(book.tags || []).slice(0, 3).map(tag => (
              <span key={tag} style={{
                fontSize: 9, padding: "2px 7px", borderRadius: 20,
                background: "var(--bg-muted)", color: "var(--text-muted)",
                border: "0.5px solid var(--bg-border)",
                fontFamily: "'DM Mono', monospace",
              }}>#{tag}</span>
            ))}
          </div>
        )}

        <button
          onClick={handleOpen}
          disabled={!hasFile}
          style={{
            fontSize: 11, padding: "5px 12px", borderRadius: 8, marginTop: "auto",
            border: `0.5px solid ${hasFile ? meta.accent + "66" : "var(--bg-border)"}`,
            background: hasFile ? `${meta.accent}12` : "transparent",
            color: hasFile ? meta.accent : "var(--text-muted)",
            cursor: hasFile ? "pointer" : "default",
            fontFamily: "'DM Mono', monospace",
            fontWeight: 600,
            transition: "all .15s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          }}
        >
          {hasFile ? "Open PDF ↗" : "Add file"}
        </button>
      </div>
    </div>
  );
}

// ─── YOUTUBE CLASS CARD ───────────────────────────────────────────────────────
// Shows a real YouTube thumbnail via thumbnailVideoId, falls back to a placeholder
function ClassCard({ cls }) {
  const [thumbError, setThumbError] = useState(false);
  const langColor    = LANG_COLORS[cls.language] || "#a78bfa";
  const subjectColor = SUBJECT_COLORS[cls.subject] || "#a78bfa";

  const thumbUrl = cls.thumbnailVideoId && !thumbError
    ? `https://i.ytimg.com/vi/${cls.thumbnailVideoId}/hqdefault.jpg`
    : null;

  const handleWatch = () => window.open(cls.url, "_blank", "noopener,noreferrer");

  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "0.5px solid var(--bg-border)",
      borderRadius: 14,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      transition: "box-shadow 0.2s ease",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.25)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      {/* ── Thumbnail area ──────────────────────────────────────────── */}
      <div
        onClick={handleWatch}
        style={{
          position: "relative",
          height: 168,
          background: thumbUrl ? "#000" : "linear-gradient(135deg, #1a0a0a 0%, #0d0d1a 100%)",
          cursor: "pointer",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={cls.title}
            onError={() => setThumbError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          /* Placeholder when no video ID */
          <div style={{
            width: "100%", height: "100%",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 8,
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "rgba(255,0,0,0.12)", border: "1.5px solid rgba(255,0,0,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, color: "#f87171",
            }}>▶</div>
            <div style={{
              fontSize: 10, color: "rgba(255,255,255,0.35)",
              fontFamily: "'DM Mono', monospace", letterSpacing: 1,
            }}>
              {cls.channel}
            </div>
          </div>
        )}

        {/* YouTube play button overlay */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0)",
          transition: "background 0.2s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.35)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0)"}
        >
          <div style={{
            width: 48, height: 34, borderRadius: 8,
            background: "#ff0000",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 12px rgba(255,0,0,0.5)",
            opacity: thumbUrl ? 0.9 : 0,
            transition: "opacity 0.2s, transform 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.transform = "scale(1.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = 0.9; e.currentTarget.style.transform = "scale(1)"; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        {/* Language badge */}
        <div style={{
          position: "absolute", top: 8, right: 8,
          fontSize: 9, fontWeight: 700, letterSpacing: 0.8,
          color: langColor, fontFamily: "'DM Mono', monospace",
          background: "rgba(0,0,0,0.75)",
          padding: "3px 7px", borderRadius: 5,
          border: `0.5px solid ${langColor}55`,
        }}>
          {cls.language.toUpperCase()}
        </div>

        {/* Subject badge bottom-left */}
        <div style={{
          position: "absolute", bottom: 8, left: 8,
          fontSize: 9, fontWeight: 700,
          color: subjectColor, fontFamily: "'DM Mono', monospace",
          background: "rgba(0,0,0,0.75)",
          padding: "3px 8px", borderRadius: 5,
          border: `0.5px solid ${subjectColor}55`,
        }}>
          {cls.subject.toUpperCase()}
        </div>
      </div>

      {/* ── Card body ────────────────────────────────────────────────── */}
      <div style={{ padding: "12px 14px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>

        {/* Teacher row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #ff000022, #ff000044)",
            border: "0.5px solid #ff000055",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, color: "#f87171",
          }}>▶</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>{cls.teacher}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>{cls.channel}</div>
          </div>
        </div>

        {/* Title */}
        <div style={{
          fontSize: 13, fontWeight: 700, color: "var(--text-primary)",
          lineHeight: 1.4,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {cls.title}
        </div>

        {/* Description */}
        <div style={{
          fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.55,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {cls.description}
        </div>

        {/* Chips */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 20, background: `${langColor}18`, color: langColor, border: `0.5px solid ${langColor}44`, fontFamily: "'DM Mono', monospace" }}>{cls.language}</span>
          {cls.totalVideos && (
            <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 20, background: "var(--bg-muted)", color: "var(--text-muted)", border: "0.5px solid var(--bg-border)", fontFamily: "'DM Mono', monospace" }}>{cls.totalVideos} videos</span>
          )}
          <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 20, background: "var(--bg-muted)", color: "var(--text-muted)", border: "0.5px solid var(--bg-border)", fontFamily: "'DM Mono', monospace" }}>{cls.paper}</span>
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {(cls.tags || []).slice(0, 4).map(tag => (
            <span key={tag} style={{ fontSize: 9, padding: "2px 6px", borderRadius: 20, background: "var(--bg-muted)", color: "var(--text-muted)", border: "0.5px solid var(--bg-border)", fontFamily: "'DM Mono', monospace" }}>#{tag}</span>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleWatch}
          style={{
            marginTop: 2,
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
            fontSize: 12, padding: "7px 0", borderRadius: 8, width: "100%",
            border: "none", background: "#ff0000",
            color: "#fff", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
            letterSpacing: 0.3,
            boxShadow: "0 2px 8px rgba(255,0,0,0.3)",
            transition: "background 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#cc0000"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(255,0,0,0.45)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#ff0000"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(255,0,0,0.3)"; }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
            <path d="M8 5v14l11-7z"/>
          </svg>
          Watch on YouTube
        </button>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ResourceLibrary({ user = null, updateProgress = null, bulkUpdateProgress = null, serverAttempts = [] }) {
  const [activeTab, setActiveTab] = useState("ncert");
  const [search, setSearch]       = useState("");

  const [subjectFilter, setSubjectFilter] = useState("All");
  const [classFilter,   setClassFilter]   = useState("All");
  const [refPaperFilter, setRefPaperFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [ytSubjectFilter, setYtSubjectFilter] = useState("All");
  const [ytPaperFilter,   setYtPaperFilter]   = useState("All");
  const [ytLangFilter,    setYtLangFilter]     = useState("All");

  const [doneMap, setDoneMap] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ncert-done-map") || "{}"); }
    catch { return {}; }
  });
  const toggleDone = (id) => {
    setDoneMap(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem("ncert-done-map", JSON.stringify(next));
      return next;
    });
  };

  const availableClasses = useMemo(() => {
    const cls = [...new Set(NCERT_BOOKS.map(b => b.class))].sort((a, b) => a - b);
    return cls;
  }, []);

  const filteredNCERT = useMemo(() => NCERT_BOOKS.filter(b => {
    if (subjectFilter !== "All" && b.subject !== subjectFilter) return false;
    if (classFilter   !== "All" && String(b.class) !== String(classFilter)) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      if (!b.title.toLowerCase().includes(s) && !b.subject.toLowerCase().includes(s)) return false;
    }
    return true;
  }), [subjectFilter, classFilter, search]);

  const booksByClass = useMemo(() => {
    const map = {};
    filteredNCERT.forEach(b => {
      if (!map[b.class]) map[b.class] = [];
      map[b.class].push(b);
    });
    return Object.entries(map).sort(([a], [b]) => Number(a) - Number(b));
  }, [filteredNCERT]);

  const filteredRefBooks = useMemo(() => REFERENCE_BOOKS.filter(b => {
    if (refPaperFilter !== "All" && b.paper !== refPaperFilter) return false;
    if (priorityFilter !== "All" && b.priority !== priorityFilter) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      if (!b.title.toLowerCase().includes(s) && !b.author.toLowerCase().includes(s) && !(b.tags || []).some(t => t.includes(s))) return false;
    }
    return true;
  }), [refPaperFilter, priorityFilter, search]);

  const filteredClasses = useMemo(() => YOUTUBE_CLASSES.filter(c => {
    if (ytSubjectFilter !== "All" && c.subject !== ytSubjectFilter) return false;
    if (ytPaperFilter   !== "All" && c.paper   !== ytPaperFilter)   return false;
    if (ytLangFilter    !== "All" && c.language !== ytLangFilter)    return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      if (!c.title.toLowerCase().includes(s) && !c.teacher.toLowerCase().includes(s) && !c.channel.toLowerCase().includes(s) && !(c.tags || []).some(t => t.includes(s))) return false;
    }
    return true;
  }), [ytSubjectFilter, ytPaperFilter, ytLangFilter, search]);

  const doneCount    = NCERT_BOOKS.filter(b => doneMap[b.id] ?? b.done).length;
  const totalNCERT   = NCERT_BOOKS.length;
  const mustReads    = REFERENCE_BOOKS.filter(b => b.priority === "must-read").length;
  const totalClasses = YOUTUBE_CLASSES.length;

  const lastUpdated = activeTab === "ncert"    ? NCERT_LAST_UPDATED
                    : activeTab === "classes"  ? YT_LAST_UPDATED
                    : activeTab === "notes"    ? null
                    : REF_BOOKS_LAST_UPDATED;

  const ytLanguages = useMemo(() => ["All", ...new Set(YOUTUBE_CLASSES.map(c => c.language))], []);

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      maxWidth: 1252, width: "100%", margin: "0 auto",
      padding: "16px 12px", color: "var(--text-primary)",
    }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 28, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.15, fontFamily: "'Playfair Display', Georgia, serif" }}>
          Resource Library
        </div>
        <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4, fontFamily: "'DM Mono', monospace" }}>
          NCERT Books · My Notes · Reference Books · YouTube Classes
        </div>
      </div>

      {/* ── Stats Bar ──────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 24 }}>
        {[
          ["NCERT Books",   totalNCERT,              "#60a5fa"],
          ["Read Done",     doneCount,               "var(--accent-green)"],
          ["Ref Books",     REFERENCE_BOOKS.length,  "#f97316"],
          ["YT Classes",    totalClasses,            "#ff0000"],
        ].map(([l, v, c]) => (
          <div key={l} style={{
            background: "var(--bg-surface)", border: "0.5px solid var(--bg-border)",
            borderRadius: 12, padding: "16px 12px", textAlign: "center",
            borderTop: `3px solid ${c}`, boxShadow: "var(--shadow-sm)",
          }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1, fontFamily: "'Playfair Display', Georgia, serif" }}>{v}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 5, fontFamily: "'DM Mono', monospace" }}>{l}</div>
          </div>
        ))}
      </div>

      {/* ── Tab Bar ────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 20 }}>
        {[
          ["ncert",       "📚 NCERT Books"],
          ["notes",       "📝 My Notes"],
          ["refbooks",    "📖 Reference Books"],
          ["classes",     "▶ YouTube Classes"],
          ["test-series", "🎯 Test Series"],
        ].map(([id, label]) => (
          <button key={id} onClick={() => { setActiveTab(id); setSearch(""); }} style={{
            padding: "9px 22px", fontSize: 13, fontWeight: activeTab === id ? 600 : 400,
            borderRadius: 10,
            background: activeTab === id
              ? (id === "classes" ? "#ff000015" : id === "test-series" ? "var(--accent-gold-dim)" : "var(--text-primary)")
              : "transparent",
            color: activeTab === id
              ? (id === "classes" ? "#f87171" : id === "test-series" ? "var(--accent-gold)" : "var(--bg-base)")
              : "var(--text-secondary)",
            border: activeTab === id
              ? (id === "classes" ? "0.5px solid #ff000044" : id === "test-series" ? "0.5px solid var(--accent-gold)" : "none")
              : "0.5px solid var(--bg-border)",
            cursor: "pointer", transition: "all .15s",
            fontFamily: "'DM Sans', sans-serif",
          }}>{label}</button>
        ))}
      </div>

      {/* ── Search ─────────────────────────────────────────────────────────── */}
      {activeTab !== "notes" && (
        <div style={{ position: "relative", marginBottom: 16 }}>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={
              activeTab === "ncert"   ? "Search books, subjects…" :
              activeTab === "classes" ? "Search by teacher, subject, tags…" :
              "Search by title, author, tags…"
            }
            style={{
              width: "100%", padding: "9px 14px 9px 36px", fontSize: 13,
              background: "var(--bg-surface)", border: "0.5px solid var(--bg-border)",
              borderRadius: 10, color: "var(--text-primary)", outline: "none",
              fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box",
            }}
          />
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 14, pointerEvents: "none" }}>⌕</span>
        </div>
      )}

      {/* ════════ TAB: NCERT ════════════════════════════════════════════════ */}
      {activeTab === "ncert" && (
        <>
          <div style={{
            background: "var(--bg-surface)", border: "0.5px solid var(--bg-border)",
            borderRadius: 14, padding: "16px 18px", marginBottom: 20,
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", minWidth: 52, textTransform: "uppercase" }}>Subject</span>
              <FilterChip label="All" active={subjectFilter === "All"} color="#94a3b8" onClick={() => setSubjectFilter("All")} />
              {SUBJECTS.map(s => (
                <FilterChip key={s} label={s} active={subjectFilter === s} color={getSubjectMeta(s).accent} onClick={() => setSubjectFilter(s)} />
              ))}
            </div>
            <div style={{ height: "0.5px", background: "var(--bg-border)" }} />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", minWidth: 52, textTransform: "uppercase" }}>Class</span>
              <FilterChip label="All" active={classFilter === "All"} color="#94a3b8" onClick={() => setClassFilter("All")} />
              {availableClasses.map(c => (
                <FilterChip key={c} label={`Class ${c}`} active={String(classFilter) === String(c)} color="#60a5fa" onClick={() => setClassFilter(String(c))} />
              ))}
            </div>
          </div>

          <div style={{
            marginBottom: 28, padding: "14px 18px",
            background: "var(--bg-surface)", border: "0.5px solid var(--bg-border)",
            borderRadius: 12, display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'Playfair Display', serif", minWidth: 36 }}>{doneCount}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>
                of {totalNCERT} NCERT books read · showing {filteredNCERT.length}
              </div>
              <div style={{ height: 5, borderRadius: 3, background: "var(--bg-border)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 3,
                  width: `${totalNCERT ? (doneCount / totalNCERT) * 100 : 0}%`,
                  background: "linear-gradient(90deg, #34d399, #60a5fa)",
                  transition: "width 0.5s ease",
                }} />
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
              {totalNCERT ? Math.round((doneCount / totalNCERT) * 100) : 0}%
            </div>
          </div>

          {NCERT_BOOKS.length === 0 ? (
            <EmptyState icon="📚" title="No books added yet" body={<>Open <code>src/data/ncert_data.js</code> and fill in your NCERT PDF paths or URLs.</>} />
          ) : booksByClass.length === 0 ? (
            <NoMatch />
          ) : (
            booksByClass.map(([classNum, books]) => (
              <div key={classNum} style={{ marginBottom: 40 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", textTransform: "uppercase" }}>
                    Class {classNum}
                  </div>
                  <div style={{ flex: 1, height: "0.5px", background: "var(--bg-border)" }} />
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
                    {books.filter(b => doneMap[b.id] ?? b.done).length}/{books.length} read
                  </div>
                  <div style={{ width: 44, height: 3, borderRadius: 2, background: "var(--bg-border)", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 2,
                      width: `${books.length ? (books.filter(b => doneMap[b.id] ?? b.done).length / books.length) * 100 : 0}%`,
                      background: "#34d399", transition: "width 0.4s ease",
                    }} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px 16px" }}>
                  {books.map(book => (
                    <NCERTBookCard key={book.id} book={book} localDone={doneMap[book.id] ?? book.done} onToggleDone={toggleDone} />
                  ))}
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* ════════ TAB: MY NOTES ═════════════════════════════════════════════ */}
      {activeTab === "notes" && (
        <div style={{
          height: "calc(100vh - 320px)", minHeight: 560,
          borderRadius: 16, overflow: "hidden",
          border: "0.5px solid var(--bg-border)", boxShadow: "var(--shadow-sm)",
        }}>
          <MentorNotes isLoggedIn={!!user} contextHint="Resource Library · My Notes" />
        </div>
      )}

      {/* ════════ TAB: REFERENCE BOOKS ══════════════════════════════════════ */}
      {activeTab === "refbooks" && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", minWidth: 52 }}>PAPER</span>
              <FilterChip label="All" active={refPaperFilter === "All"} color="#f97316" onClick={() => setRefPaperFilter("All")} />
              {REF_BOOK_PAPERS.map(p => <FilterChip key={p} label={p} active={refPaperFilter === p} color="#f97316" onClick={() => setRefPaperFilter(p)} />)}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", minWidth: 52 }}>PRIORITY</span>
              {[["All","#a78bfa"],["must-read","#f87171"],["recommended","#60a5fa"],["optional","#a78bfa"]].map(([id, c]) => (
                <FilterChip key={id} label={id === "All" ? "All" : id.charAt(0).toUpperCase() + id.slice(1).replace("-"," ")} active={priorityFilter === id} color={c} onClick={() => setPriorityFilter(id)} />
              ))}
            </div>
          </div>
          {priorityFilter === "All" && (
            <div style={{ marginBottom: 16, padding: "10px 16px", borderRadius: 10, background: "rgba(248,113,113,0.08)", border: "0.5px solid rgba(248,113,113,0.25)", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>🔴</span>
              <span style={{ fontSize: 12, color: "#f87171", fontFamily: "'DM Mono', monospace" }}>
                <strong>{mustReads}</strong> must-read books — start with these before supplementary texts.
              </span>
            </div>
          )}
          {filteredRefBooks.length === 0 ? <NoMatch /> : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px 16px" }}>
              {filteredRefBooks.map(book => <RefBookCard key={book.id} book={book} />)}
            </div>
          )}
        </>
      )}

      {/* ════════ TAB: YOUTUBE CLASSES ══════════════════════════════════════ */}
      {activeTab === "classes" && (
        <>


          {/* Filters */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", minWidth: 52 }}>SUBJECT</span>
              <FilterChip label="All" active={ytSubjectFilter === "All"} color="#f87171" onClick={() => setYtSubjectFilter("All")} />
              {YT_SUBJECTS.map(s => <FilterChip key={s} label={s} active={ytSubjectFilter === s} color="#f87171" onClick={() => setYtSubjectFilter(s)} />)}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", minWidth: 52 }}>PAPER</span>
              <FilterChip label="All" active={ytPaperFilter === "All"} color="#f97316" onClick={() => setYtPaperFilter("All")} />
              {YT_PAPERS.map(p => <FilterChip key={p} label={p} active={ytPaperFilter === p} color="#f97316" onClick={() => setYtPaperFilter(p)} />)}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", minWidth: 52 }}>LANG</span>
              {ytLanguages.map(l => <FilterChip key={l} label={l} active={ytLangFilter === l} color="#a78bfa" onClick={() => setYtLangFilter(l)} />)}
            </div>
          </div>

          {filteredClasses.length === 0 ? <NoMatch /> : (
            Object.entries(
              filteredClasses.reduce((acc, cls) => {
                if (!acc[cls.teacher]) acc[cls.teacher] = { channel: cls.channel, items: [] };
                acc[cls.teacher].items.push(cls);
                return acc;
              }, {})
            ).map(([teacher, { channel, items }]) => (
              <div key={teacher} style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg, #ff000020, #ff000040)",
                    border: "0.5px solid #ff000055",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                  }}>▶</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{teacher}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>{channel} · {items.length} playlist{items.length > 1 ? "s" : ""}</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                  {items.map(cls => <ClassCard key={cls.id} cls={cls} />)}
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* ── TAB: TEST SERIES ──────────────────────────────────────────────── */}
      {activeTab === "test-series" && <TestSeriesPage user={user} onSyllabusUpdate={updateProgress} onBulkSyllabusUpdate={bulkUpdateProgress} serverAttempts={serverAttempts} />}

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div style={{ marginTop: 32, paddingTop: 20, borderTop: "0.5px solid var(--bg-border)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
          {activeTab === "notes" ? "Notes are saved on this device automatically" : `Last updated: ${lastUpdated}`}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>Edit data files to add your resources.</div>
      </div>
    </div>
  );
}

// ─── Utility sub-components ───────────────────────────────────────────────────
function EmptyState({ icon, title, body }) {
  return (
    <div style={{ padding: "60px 24px", textAlign: "center", background: "var(--bg-surface)", border: "0.5px solid var(--bg-border)", borderRadius: 14 }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", fontFamily: "'Playfair Display', Georgia, serif", marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", lineHeight: 1.7 }}>{body}</div>
    </div>
  );
}
function NoMatch() {
  return (
    <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: 13, fontFamily: "'DM Mono', monospace" }}>
      No items match your filters.
    </div>
  );
}