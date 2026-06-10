// // ─── Resource Library ─────────────────────────────────────────────────────────
// Four sections: NCERT Books · My Notes · Reference Books · YouTube Classes

import { useState, useMemo } from "react";
import {
  NCERT_BOOKS, SUBJECTS, SUBJECT_PAPER_MAP, NCERT_LAST_UPDATED,
} from "../data/ncert_data";
import { NOTES, NOTE_PAPERS, NOTES_LAST_UPDATED } from "../data/notes_data";
import {
  REFERENCE_BOOKS, REF_BOOK_PAPERS, PRIORITY_COLORS, REF_BOOKS_LAST_UPDATED,
} from "../data/reference_books_data";
import {
  YOUTUBE_CLASSES, YT_SUBJECTS, YT_PAPERS, YT_LAST_UPDATED,
} from "../data/classes";

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

const TYPE_ICONS  = { pdf: "📄", docx: "📝", md: "📋", link: "🔗", txt: "📃", image: "🖼" };
const TYPE_COLORS = { pdf: "#f87171", docx: "#60a5fa", md: "#34d399", link: "#a78bfa", txt: "#fbbf24", image: "#f9a8d4" };

const SUBJECT_COLORS = {
  History: "#f472b6", Geography: "#60a5fa", Polity: "#4F8EF7",
  Economics: "#34d399", Science: "#f9a8d4", Sociology: "#fb923c", Environment: "#6ee7b7",
};

const LANG_COLORS = { Hindi: "#f97316", English: "#60a5fa", Bilingual: "#a78bfa" };

// ─── NCERT BOOK CARD ──────────────────────────────────────────────────────────
function NCERTCard({ book, onToggleDone, localDone }) {
  const done   = localDone ?? book.done ?? false;
  const papers = SUBJECT_PAPER_MAP[book.subject] || [];
  const color  = SUBJECT_COLORS[book.subject] || "#a78bfa";

  const handleOpen = () => {
    const target = book.url || (book.filePath ? `/api/ncert/file?path=${encodeURIComponent(book.filePath)}` : null);
    if (target) window.open(target, "_blank", "noopener,noreferrer");
    else alert("No file path or URL configured for this book.\nEdit src/data/ncert_data.js to add it.");
  };

  return (
    <div style={{
      background: "var(--bg-surface)", border: "0.5px solid var(--bg-border)",
      borderRadius: 12, overflow: "hidden",
      borderLeft: `3px solid ${done ? "var(--accent-green)" : color}`,
      opacity: done ? 0.8 : 1, transition: "opacity .2s",
    }}>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: `${color}18`, color, border: `0.5px solid ${color}44`, fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>
                Class {book.class}
              </span>
              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "var(--bg-muted)", color: "var(--text-muted)", border: "0.5px solid var(--bg-border)", fontFamily: "'DM Mono', monospace" }}>
                {book.subject}
              </span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: done ? "var(--text-muted)" : "var(--text-primary)", marginBottom: 4, textDecoration: done ? "line-through" : "none" }}>
              {book.title}
            </div>
            {papers.length > 0 && (
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
                → {papers.join(" · ")}
              </div>
            )}
          </div>
          <button
            onClick={() => onToggleDone(book.id)}
            title={done ? "Mark as unread" : "Mark as done"}
            style={{
              width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
              border: done ? "0.5px solid var(--accent-green)" : "0.5px solid var(--bg-border)",
              background: done ? "rgba(52,211,153,0.12)" : "transparent",
              color: done ? "#6ee7b7" : "var(--text-muted)",
              cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {done ? "✓" : "○"}
          </button>
        </div>
        <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
          <button onClick={handleOpen} style={{
            fontSize: 12, padding: "5px 14px", borderRadius: 8,
            border: `0.5px solid ${color}`, background: `${color}12`,
            color, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}>
            {book.url ? "Open PDF ↗" : book.filePath ? "Open File ↗" : "Not Configured"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── NOTE CARD ────────────────────────────────────────────────────────────────
function NoteCard({ note }) {
  const color = TYPE_COLORS[note.type] || "#a78bfa";
  const icon  = TYPE_ICONS[note.type]  || "📄";

  const handleOpen = () => {
    const target = note.url || (note.filePath ? `/api/notes/file?path=${encodeURIComponent(note.filePath)}` : null);
    if (target) window.open(target, "_blank", "noopener,noreferrer");
    else alert("No file path or URL configured for this note.\nEdit src/data/notes_data.js to add it.");
  };

  return (
    <div style={{
      background: "var(--bg-surface)", border: "0.5px solid var(--bg-border)",
      borderRadius: 12, padding: "14px 16px", borderLeft: `3px solid ${color}`,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{note.title}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: `${color}15`, color, border: `0.5px solid ${color}33`, fontFamily: "'DM Mono', monospace" }}>{note.paper}</span>
            {note.module && (
              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "var(--bg-muted)", color: "var(--text-muted)", border: "0.5px solid var(--bg-border)", fontFamily: "'DM Mono', monospace" }}>{note.module}</span>
            )}
            {(note.tags || []).map(tag => (
              <span key={tag} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "var(--bg-muted)", color: "var(--text-muted)", border: "0.5px solid var(--bg-border)", fontFamily: "'DM Mono', monospace" }}>#{tag}</span>
            ))}
          </div>
          <button onClick={handleOpen} style={{
            fontSize: 12, padding: "5px 14px", borderRadius: 8,
            border: `0.5px solid ${color}`, background: `${color}12`,
            color, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}>
            Open {note.type?.toUpperCase()} ↗
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── REFERENCE BOOK CARD ──────────────────────────────────────────────────────
function RefBookCard({ book }) {
  const priorityColor = PRIORITY_COLORS[book.priority] || "#a78bfa";
  const priorityLabel = { "must-read": "Must Read", "recommended": "Recommended", "optional": "Optional" };

  const handleOpen = () => {
    if (book.url) window.open(book.url, "_blank", "noopener,noreferrer");
    else alert("No URL configured for this book.");
  };

  return (
    <div style={{
      background: "var(--bg-surface)", border: "0.5px solid var(--bg-border)",
      borderRadius: 12, padding: "14px 16px",
      borderLeft: `3px solid ${priorityColor}`,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4, lineHeight: 1.35 }}>
            {book.title}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", marginBottom: 8 }}>
            {book.author} · {book.edition}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            <span style={{
              fontSize: 10, padding: "2px 8px", borderRadius: 20,
              background: `${priorityColor}18`, color: priorityColor,
              border: `0.5px solid ${priorityColor}44`,
              fontFamily: "'DM Mono', monospace", fontWeight: 600,
            }}>
              {priorityLabel[book.priority] || book.priority}
            </span>
            <span style={{
              fontSize: 10, padding: "2px 8px", borderRadius: 20,
              background: "var(--bg-muted)", color: "var(--text-muted)",
              border: "0.5px solid var(--bg-border)",
              fontFamily: "'DM Mono', monospace",
            }}>
              {book.module}
            </span>
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
            {(book.tags || []).slice(0, 4).map(tag => (
              <span key={tag} style={{
                fontSize: 10, padding: "2px 8px", borderRadius: 20,
                background: "var(--bg-muted)", color: "var(--text-muted)",
                border: "0.5px solid var(--bg-border)",
                fontFamily: "'DM Mono', monospace",
              }}>#{tag}</span>
            ))}
          </div>
          <button onClick={handleOpen} style={{
            fontSize: 12, padding: "5px 14px", borderRadius: 8,
            border: `0.5px solid ${priorityColor}`, background: `${priorityColor}12`,
            color: priorityColor, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}>
            {book.url ? "View / Buy ↗" : "Not Configured"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── YOUTUBE CLASS CARD ───────────────────────────────────────────────────────
function ClassCard({ cls }) {
  const langColor = LANG_COLORS[cls.language] || "#a78bfa";
  const subjectColor = SUBJECT_COLORS[cls.subject] || "#a78bfa";

  return (
    <div style={{
      background: "var(--bg-surface)", border: "0.5px solid var(--bg-border)",
      borderRadius: 12, padding: "14px 16px",
      borderLeft: "3px solid #ff0000",
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      {/* Teacher + channel */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, #ff000022, #ff000044)",
          border: "0.5px solid #ff000055",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14,
        }}>▶</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>{cls.teacher}</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>{cls.channel}</div>
        </div>
      </div>

      {/* Title */}
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.35 }}>
        {cls.title}
      </div>

      {/* Description */}
      <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
        {cls.description}
      </div>

      {/* Chips row */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        <span style={{
          fontSize: 10, padding: "2px 8px", borderRadius: 20,
          background: `${subjectColor}18`, color: subjectColor,
          border: `0.5px solid ${subjectColor}44`, fontFamily: "'DM Mono', monospace", fontWeight: 600,
        }}>{cls.subject}</span>
        <span style={{
          fontSize: 10, padding: "2px 8px", borderRadius: 20,
          background: `${langColor}18`, color: langColor,
          border: `0.5px solid ${langColor}44`, fontFamily: "'DM Mono', monospace",
        }}>{cls.language}</span>
        {cls.totalVideos && (
          <span style={{
            fontSize: 10, padding: "2px 8px", borderRadius: 20,
            background: "var(--bg-muted)", color: "var(--text-muted)",
            border: "0.5px solid var(--bg-border)", fontFamily: "'DM Mono', monospace",
          }}>{cls.totalVideos} videos</span>
        )}
        <span style={{
          fontSize: 10, padding: "2px 8px", borderRadius: 20,
          background: "var(--bg-muted)", color: "var(--text-muted)",
          border: "0.5px solid var(--bg-border)", fontFamily: "'DM Mono', monospace",
        }}>{cls.paper}</span>
      </div>

      {/* Tags */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        {(cls.tags || []).slice(0, 4).map(tag => (
          <span key={tag} style={{
            fontSize: 10, padding: "2px 6px", borderRadius: 20,
            background: "var(--bg-muted)", color: "var(--text-muted)",
            border: "0.5px solid var(--bg-border)", fontFamily: "'DM Mono', monospace",
          }}>#{tag}</span>
        ))}
      </div>

      {/* CTA */}
      <a
        href={cls.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 12, padding: "6px 14px", borderRadius: 8,
          border: "0.5px solid #ff000055", background: "#ff000012",
          color: "#f87171", textDecoration: "none", fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600, marginTop: 2, transition: "background .15s",
        }}
      >
        ▶ Watch on YouTube ↗
      </a>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ResourceLibrary() {
  // Active tab: "ncert" | "notes" | "refbooks" | "classes"
  const [activeTab, setActiveTab] = useState("ncert");
  const [search, setSearch] = useState("");

  // NCERT filters
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [classFilter,   setClassFilter]   = useState("All");

  // Notes filter
  const [paperFilter, setPaperFilter] = useState("All");

  // Ref Books filter
  const [refPaperFilter, setRefPaperFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  // Classes filters
  const [ytSubjectFilter, setYtSubjectFilter] = useState("All");
  const [ytPaperFilter,   setYtPaperFilter]   = useState("All");
  const [ytLangFilter,    setYtLangFilter]     = useState("All");

  // NCERT done-state stored in localStorage
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

  // ── NCERT filter helpers ───────────────────────────────────────────────────
  const classes = useMemo(() =>
    ["All", ...[...new Set(NCERT_BOOKS.map(b => b.class))].sort((a, b) => a - b).map(String)],
    []
  );
  const filteredNCERT = useMemo(() => NCERT_BOOKS.filter(b => {
    if (subjectFilter !== "All" && b.subject !== subjectFilter) return false;
    if (classFilter   !== "All" && String(b.class) !== classFilter) return false;
    if (search.trim() && !b.title.toLowerCase().includes(search.toLowerCase()) && !b.subject.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [subjectFilter, classFilter, search]);

  // ── Notes filter helper ────────────────────────────────────────────────────
  const filteredNotes = useMemo(() => NOTES.filter(n => {
    if (paperFilter !== "All" && n.paper !== paperFilter) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      if (!n.title.toLowerCase().includes(s) && !(n.tags || []).some(t => t.includes(s)) && !n.module?.toLowerCase().includes(s)) return false;
    }
    return true;
  }), [paperFilter, search]);

  // ── Ref Books filter helper ────────────────────────────────────────────────
  const filteredRefBooks = useMemo(() => REFERENCE_BOOKS.filter(b => {
    if (refPaperFilter !== "All" && b.paper !== refPaperFilter) return false;
    if (priorityFilter !== "All" && b.priority !== priorityFilter) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      if (!b.title.toLowerCase().includes(s) && !b.author.toLowerCase().includes(s) && !(b.tags || []).some(t => t.includes(s))) return false;
    }
    return true;
  }), [refPaperFilter, priorityFilter, search]);

  // ── Classes filter helper ──────────────────────────────────────────────────
  const filteredClasses = useMemo(() => YOUTUBE_CLASSES.filter(c => {
    if (ytSubjectFilter !== "All" && c.subject !== ytSubjectFilter) return false;
    if (ytPaperFilter   !== "All" && c.paper   !== ytPaperFilter)   return false;
    if (ytLangFilter    !== "All" && c.language !== ytLangFilter)    return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      if (
        !c.title.toLowerCase().includes(s) &&
        !c.teacher.toLowerCase().includes(s) &&
        !c.channel.toLowerCase().includes(s) &&
        !(c.tags || []).some(t => t.includes(s))
      ) return false;
    }
    return true;
  }), [ytSubjectFilter, ytPaperFilter, ytLangFilter, search]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const doneCount  = NCERT_BOOKS.filter(b => doneMap[b.id] ?? b.done).length;
  const totalNCERT = NCERT_BOOKS.length;
  const totalNotes = NOTES.length;
  const mustReads  = REFERENCE_BOOKS.filter(b => b.priority === "must-read").length;
  const totalClasses = YOUTUBE_CLASSES.length;

  const lastUpdated = activeTab === "ncert"    ? NCERT_LAST_UPDATED
                    : activeTab === "notes"    ? NOTES_LAST_UPDATED
                    : activeTab === "classes"  ? YT_LAST_UPDATED
                    : REF_BOOKS_LAST_UPDATED;

  // Unique language options from data
  const ytLanguages = useMemo(() =>
    ["All", ...new Set(YOUTUBE_CLASSES.map(c => c.language))],
    []
  );

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", maxWidth: 1152, width: "100%", margin: "0 auto", padding: "32px 24px", color: "var(--text-primary)" }}>

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
          ["NCERT Books",    totalNCERT,              "#60a5fa"],
          ["Read Done",      doneCount,               "var(--accent-green)"],
          ["My Notes",       totalNotes,              "#c084fc"],
          ["Ref Books",      REFERENCE_BOOKS.length,  "#f97316"],
          ["YT Classes",     totalClasses,            "#ff0000"],
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
          ["ncert",    "📚 NCERT Books"],
          ["notes",    "📝 My Notes"],
          ["refbooks", "📖 Reference Books"],
          ["classes",  "▶ YouTube Classes"],
        ].map(([id, label]) => (
          <button key={id} onClick={() => { setActiveTab(id); setSearch(""); }} style={{
            padding: "9px 22px", fontSize: 13, fontWeight: activeTab === id ? 600 : 400,
            borderRadius: 10,
            background: activeTab === id ? (id === "classes" ? "#ff000015" : "var(--text-primary)") : "transparent",
            color: activeTab === id ? (id === "classes" ? "#f87171" : "var(--bg-base)") : "var(--text-secondary)",
            border: activeTab === id
              ? (id === "classes" ? "0.5px solid #ff000044" : "none")
              : "0.5px solid var(--bg-border)",
            cursor: "pointer", transition: "all .15s",
            fontFamily: "'DM Sans', sans-serif",
          }}>{label}</button>
        ))}
      </div>

      {/* ── Search ─────────────────────────────────────────────────────────── */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder={
            activeTab === "ncert"    ? "Search books…" :
            activeTab === "notes"    ? "Search notes, tags…" :
            activeTab === "classes"  ? "Search by teacher, subject, tags…" :
            "Search by title, author, tags…"
          }
          style={{ width: "100%", padding: "9px 14px 9px 36px", fontSize: 13, background: "var(--bg-surface)", border: "0.5px solid var(--bg-border)", borderRadius: 10, color: "var(--text-primary)", outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" }}
        />
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 14, pointerEvents: "none" }}>⌕</span>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TAB: NCERT                                                          */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "ncert" && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", minWidth: 52 }}>SUBJECT</span>
              <FilterChip label="All" active={subjectFilter === "All"} onClick={() => setSubjectFilter("All")} />
              {SUBJECTS.map(s => <FilterChip key={s} label={s} active={subjectFilter === s} onClick={() => setSubjectFilter(s)} />)}
            </div>
            {classes.length > 2 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", minWidth: 52 }}>CLASS</span>
                {classes.map(c => <FilterChip key={c} label={c === "All" ? "All" : `Class ${c}`} active={classFilter === c} onClick={() => setClassFilter(c)} />)}
              </div>
            )}
          </div>

          {NCERT_BOOKS.length === 0 ? (
            <EmptyState icon="📚" title="No books added yet" body={<>Open <code>src/data/ncert_data.js</code> and fill in<br />your NCERT PDF paths or URLs to get started.</>} />
          ) : filteredNCERT.length === 0 ? (
            <NoMatch />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {filteredNCERT.map(book => (
                <NCERTCard key={book.id} book={book} onToggleDone={toggleDone} localDone={doneMap[book.id] ?? book.done} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TAB: MY NOTES                                                       */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "notes" && (
        <>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
            <FilterChip label="All" active={paperFilter === "All"} color="#c084fc" onClick={() => setPaperFilter("All")} />
            {NOTE_PAPERS.map(p => <FilterChip key={p} label={p} active={paperFilter === p} color="#c084fc" onClick={() => setPaperFilter(p)} />)}
          </div>

          {NOTES.length === 0 ? (
            <EmptyState icon="📝" title="No notes added yet" body={<>Open <code>src/data/notes_data.js</code> and add your<br />notes with file paths or Google Drive URLs.</>} />
          ) : filteredNotes.length === 0 ? (
            <NoMatch />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredNotes.map(note => <NoteCard key={note.id} note={note} />)}
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TAB: REFERENCE BOOKS                                                */}
      {/* ════════════════════════════════════════════════════════════════════ */}
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
              {[["All", "#a78bfa"], ["must-read", "#f87171"], ["recommended", "#60a5fa"], ["optional", "#a78bfa"]].map(([id, c]) => (
                <FilterChip key={id} label={id === "All" ? "All" : id.charAt(0).toUpperCase() + id.slice(1).replace("-", " ")} active={priorityFilter === id} color={c} onClick={() => setPriorityFilter(id)} />
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

          {filteredRefBooks.length === 0 ? (
            <NoMatch />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
              {filteredRefBooks.map(book => <RefBookCard key={book.id} book={book} />)}
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TAB: YOUTUBE CLASSES                                                */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "classes" && (
        <>
          {/* Teacher group headers banner */}
          <div style={{ marginBottom: 16, padding: "10px 16px", borderRadius: 10, background: "rgba(255,0,0,0.06)", border: "0.5px solid rgba(255,0,0,0.2)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>▶</span>
            <span style={{ fontSize: 12, color: "#f87171", fontFamily: "'DM Mono', monospace" }}>
              <strong>{totalClasses}</strong> free playlists — Vikas Divyakriti, Mrunal, Khan Sir, PMFIAS & more.
            </span>
          </div>

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

          {filteredClasses.length === 0 ? (
            <NoMatch />
          ) : (
            <>
              {/* Group by teacher */}
              {Object.entries(
                filteredClasses.reduce((acc, cls) => {
                  if (!acc[cls.teacher]) acc[cls.teacher] = { channel: cls.channel, items: [] };
                  acc[cls.teacher].items.push(cls);
                  return acc;
                }, {})
              ).map(([teacher, { channel, items }]) => (
                <div key={teacher} style={{ marginBottom: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                      background: "linear-gradient(135deg, #ff000020, #ff000040)",
                      border: "0.5px solid #ff000055",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16,
                    }}>▶</div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{teacher}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>{channel} · {items.length} playlist{items.length > 1 ? "s" : ""}</div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
                    {items.map(cls => <ClassCard key={cls.id} cls={cls} />)}
                  </div>
                </div>
              ))}
            </>
          )}
        </>
      )}

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div style={{ marginTop: 32, paddingTop: 20, borderTop: "0.5px solid var(--bg-border)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>Last updated: {lastUpdated}</div>
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