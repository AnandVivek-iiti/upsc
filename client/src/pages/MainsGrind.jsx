
import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  BookOpen,
  ExternalLink,
  FileText,
  FolderOpen,
  Link2,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  getMainsPaperLink,
  MAINS_LAST_VERIFIED_DATE,
} from "../data/Mains_papers";
import { NCERT_BOOKS } from "../data/ncert_data";
import { NOTES } from "../data/notes_data";

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "pyqs", label: "PYQs", icon: Archive },
  { id: "notes", label: "Notes", icon: FileText },
  { id: "ncert", label: "NCERT", icon: BookOpen },
];

const YEAR_FILTERS = [
  { id: "all", label: "All Years" },
  { id: "latest", label: "Latest 5" },
  { id: "2015", label: "2015-2019" },
  { id: "2010", label: "2010-2014" },
  { id: "2005", label: "2005-2009" },
];

const PAPER_OPTIONS = [
  { id: "essay", label: "Essay" },
  { id: "gs1", label: "GS I" },
  { id: "gs2", label: "GS II" },
  { id: "gs3", label: "GS III" },
  { id: "gs4", label: "GS IV" },
  { id: "optional-i", label: "Optional I" },
  { id: "optional-ii", label: "Optional II" },
  { id: "language-i", label: "Language I" },
  { id: "language-ii", label: "Language II" },
];

const STORAGE_PREFIX = "upsc-mains-links:";
const getPaperStorageKey = (paperId) => `${STORAGE_PREFIX}${paperId}`;

const PYQ_CARDS = [
  { year: 2026, chip: "Current Cycle" },
  { year: 2025, chip: "Latest" },
  { year: 2024, chip: "Latest" },
  { year: 2023, chip: "Recent" },
  { year: 2022, chip: "Recent" },
  { year: 2021, chip: "Archive" },
  { year: 2020, chip: "Archive" },
  { year: 2019, chip: "Classic" },
  { year: 2018, chip: "Classic" },
  { year: 2017, chip: "Classic" },
  { year: 2016, chip: "Classic" },
  { year: 2015, chip: "Classic" },
  { year: 2014, chip: "Old Set" },
  { year: 2013, chip: "Old Set" },
  { year: 2012, chip: "Old Set" },
  { year: 2011, chip: "Old Set" },
  { year: 2010, chip: "Old Set" },
  { year: 2009, chip: "Legacy" },
  { year: 2008, chip: "Legacy" },
  { year: 2007, chip: "Legacy" },
  { year: 2006, chip: "Legacy" },
  { year: 2005, chip: "Legacy" },
];

// ─── Sub-panel: Notes ─────────────────────────────────────────────────────────
function NotesPanel({ paper }) {
  // Map paper id → display paper name used in notes_data.js
  const paperMap = {
    essay: "Essay", gs1: "GS1", gs2: "GS2", gs3: "GS3", gs4: "GS4",
    "optional-i": "Optional", "optional-ii": "Optional",
    "language-i": "General", "language-ii": "General",
  };
  const paperKey = paperMap[paper] || "General";
  const notes = NOTES.filter((n) => n.paper === paperKey);

  if (notes.length === 0) return (
    <div className="mt-5 rounded-3xl border border-dashed border-bg-border bg-bg-muted/40 p-8 text-center">
      <FolderOpen size={28} className="mx-auto mb-3 text-text-muted opacity-50" />
      <p className="text-sm font-semibold text-text-secondary">No notes yet for this paper</p>
      <p className="mt-1 text-xs text-text-muted leading-relaxed">
        Add your notes in <code className="bg-bg-border px-1 rounded">src/data/notes_data.js</code> and they will appear here automatically.
      </p>
    </div>
  );

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {notes.map((note) => (
        <div
          key={note.id}
          className="rounded-2xl border border-bg-border bg-bg-surface p-4 flex flex-col gap-2"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-text-primary leading-tight">{note.title}</p>
              <p className="text-[11px] font-mono text-text-muted mt-0.5">{note.module}</p>
            </div>
            <span className="label-tag text-accent-blue border-accent-blue/30 bg-accent-blue/10 shrink-0 text-[10px]">
              {note.type?.toUpperCase() || "FILE"}
            </span>
          </div>
          {note.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {note.tags.map((t) => (
                <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-muted text-text-muted">
                  #{t}
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2 mt-auto pt-1">
            {note.url && (
              <a
                href={note.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-bg-border bg-bg-muted px-3 py-1 text-xs font-semibold text-text-secondary hover:border-accent-gold/30 hover:text-text-primary transition"
              >
                <ExternalLink size={11} /> Open link
              </a>
            )}
            {!note.url && (
              <span className="inline-flex items-center gap-1 rounded-full border border-bg-border bg-bg-muted px-3 py-1 text-xs text-text-muted">
                <FileText size={11} /> Local file
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Sub-panel: NCERT ─────────────────────────────────────────────────────────
// Subject relevance by mains paper id
const PAPER_SUBJECTS = {
  gs1: ["History", "Geography", "Sociology"],
  gs2: ["Polity"],
  gs3: ["Economics", "Science", "Environment"],
  gs4: [],
  essay: [],
  "optional-i": [],
  "optional-ii": [],
  "language-i": [],
  "language-ii": [],
};

function NCERTPanel({ paper }) {
  const subjects = PAPER_SUBJECTS[paper] || [];

  // Local state so "Mark done" works without a server
  const [books, setBooks] = useState(() =>
    subjects.length
      ? NCERT_BOOKS.filter((b) => subjects.includes(b.subject))
      : NCERT_BOOKS
  );

  // Re-filter when paper changes
  useEffect(() => {
    setBooks(
      subjects.length
        ? NCERT_BOOKS.filter((b) => subjects.includes(b.subject))
        : NCERT_BOOKS
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paper]);

  const toggleDone = (id) => {
    setBooks((prev) => prev.map((b) => b.id === id ? { ...b, done: !b.done } : b));
  };

  if (books.length === 0) return (
    <div className="mt-5 rounded-3xl border border-dashed border-bg-border bg-bg-muted/40 p-8 text-center">
      <BookOpen size={28} className="mx-auto mb-3 text-text-muted opacity-50" />
      <p className="text-sm font-semibold text-text-secondary">No NCERT books linked yet</p>
      <p className="mt-1 text-xs text-text-muted leading-relaxed">
        Add your books in <code className="bg-bg-border px-1 rounded">src/data/ncert_data.js</code>. Relevant books for this paper will appear here.
      </p>
      {subjects.length > 0 && (
        <p className="mt-2 text-[11px] font-mono text-text-muted">
          Relevant subjects: {subjects.join(" · ")}
        </p>
      )}
    </div>
  );

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {books.map((book) => (
        <div
          key={book.id}
          className={`rounded-2xl border p-4 flex flex-col gap-2 transition ${book.done
            ? "border-accent-green/30 bg-accent-green/5"
            : "border-bg-border bg-bg-surface"
            }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-text-primary leading-tight">{book.title}</p>
              <p className="text-[11px] font-mono text-text-muted mt-0.5">
                Class {book.class} · {book.subject}
              </p>
            </div>
            <button
              onClick={() => toggleDone(book.id)}
              className={`shrink-0 text-[10px] font-mono px-2 py-0.5 rounded-full border transition ${book.done
                ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
                : "border-bg-border bg-bg-muted text-text-muted hover:border-accent-gold/30"
                }`}
            >
              {book.done ? "✓ Done" : "Mark done"}
            </button>
          </div>
          <div className="flex gap-2 mt-auto pt-1">
            {book.url && (
              <a
                href={book.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-bg-border bg-bg-muted px-3 py-1 text-xs font-semibold text-text-secondary hover:border-accent-gold/30 hover:text-text-primary transition"
              >
                <ExternalLink size={11} /> NCERT site
              </a>
            )}
            {!book.url && (
              <span className="inline-flex items-center gap-1 rounded-full border border-bg-border bg-bg-muted px-3 py-1 text-xs text-text-muted">
                <FileText size={11} /> Local file
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MainsGrind() {
  const [savedLinks, setSavedLinks] = useState({});
  const [activePaper, setActivePaper] = useState(PAPER_OPTIONS[1].id);
  const [activeTab, setActiveTab] = useState("pyqs");
  const [yearFilter, setYearFilter] = useState("all");
  const [pageMode, setPageMode] = useState("grid");

  useEffect(() => {
    try {
      const nextSavedLinks = {};
      PAPER_OPTIONS.forEach((paper) => {
        const raw = localStorage.getItem(getPaperStorageKey(paper.id));
        if (raw) nextSavedLinks[paper.id] = JSON.parse(raw);
      });
      setSavedLinks(nextSavedLinks);
    } catch (error) {
      console.warn("Could not read mains links", error);
    }
  }, []);

  const visibleCards = useMemo(() => {
    if (yearFilter === "latest") return PYQ_CARDS.slice(0, 5);
    if (yearFilter === "2015") return PYQ_CARDS.filter((c) => c.year >= 2015 && c.year <= 2019);
    if (yearFilter === "2010") return PYQ_CARDS.filter((c) => c.year >= 2010 && c.year <= 2014);
    if (yearFilter === "2005") return PYQ_CARDS.filter((c) => c.year >= 2005 && c.year <= 2009);
    return PYQ_CARDS;
  }, [yearFilter]);

  const selectedPaper = PAPER_OPTIONS.find((p) => p.id === activePaper) || PAPER_OPTIONS[1];
  const getSavedLink = (year) => savedLinks[activePaper]?.[year];
  const getOfficialLink = (year) => getMainsPaperLink(year, activePaper);

  const openPaperDetails = (paperId) => {
    setActivePaper(paperId);
    setPageMode("detail");
  };

  const handlePaperClick = (year) => {
    const existing = getSavedLink(year);
    if (existing?.url) { window.open(existing.url, "_blank", "noopener,noreferrer"); return; }
    const officialLink = getOfficialLink(year);
    if (officialLink) { window.open(officialLink, "_blank", "noopener,noreferrer"); return; }
    window.alert(`UPSC has not published a mapped ${selectedPaper.label} link for ${year} yet.`);
  };

  // ── Detail view ──────────────────────────────────────────────────────────────
  if (pageMode === "detail") {
    return (
      <div className="h-full overflow-y-auto p-6 animate-fade-in">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <header className="rounded-3xl border border-bg-border bg-bg-surface/90 p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-accent-gold">Mains Grind</p>
                <h1 className="mt-1 font-display text-2xl font-bold text-text-primary">
                  {selectedPaper.label} workspace
                </h1>
                <p className="mt-2 max-w-3xl text-sm text-text-secondary">
                  Year-wise PYQs, your notes, and NCERT reading stack for {selectedPaper.label}.
                </p>
              </div>
              <div className="flex items-center gap-3">
               
                <button
                  type="button"
                  onClick={() => setPageMode("grid")}
                  className="rounded-full border border-bg-border bg-bg-muted px-3 py-1.5 text-xs font-semibold text-text-secondary hover:border-accent-gold/30 hover:text-text-primary transition"
                >
                  ← Back
                </button>
              </div>
            </div>
          </header>

          <section className="rounded-3xl border border-bg-border bg-bg-surface/90 p-5 shadow-sm">
            {/* Tab switcher */}
            <div className="flex flex-wrap gap-2">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${activeTab === id
                    ? "border-accent-gold/30 bg-accent-gold/10 text-accent-gold"
                    : "border-bg-border bg-bg-muted text-text-secondary hover:border-accent-gold/20 hover:text-text-primary"
                    }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            {/* ── PYQs Tab ── */}
            {activeTab === "pyqs" && (
              <>
                <div className="mt-5 rounded-2xl border border-bg-border bg-bg-muted/60 p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Sort by year</p>

                  </div>
                  <div className="flex flex-wrap gap-2">
                    {YEAR_FILTERS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setYearFilter(item.id)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${yearFilter === item.id
                          ? "border-accent-gold/30 bg-accent-gold/10 text-accent-gold"
                          : "border-bg-border bg-bg-surface text-text-secondary hover:border-accent-gold/20 hover:text-text-primary"
                          }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {visibleCards.map((item) => {
                    const savedLink = getSavedLink(item.year);
                    const officialLink = getOfficialLink(item.year);
                    const hasDirectLink = Boolean(savedLink?.url || officialLink);
                    return (
                      <article
                        key={item.year}
                        className="rounded-3xl border border-bg-border bg-bg-surface p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="rounded-full bg-accent-gold/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.25em] text-accent-gold">
                            {item.chip}
                          </span>
                          <Sparkles size={13} className="text-accent-gold" />
                        </div>
                        <h2 className="mt-4 font-display text-xl font-semibold text-text-primary">
                          Year {item.year}
                        </h2>

                        <div className="mt-4 space-y-3 rounded-2xl border border-bg-border bg-bg-muted/70 p-3 text-xs text-text-secondary">
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 text-text-muted">
                              <BookOpen size={12} /> Link status
                            </span>
                            <span className={`h-2.5 w-2.5 rounded-full ${hasDirectLink ? "bg-emerald-500" : "bg-amber-500"}`} />
                          </div>
                          <p className="text-[12px] leading-relaxed text-text-muted">
                            {savedLink?.url
                              ? "An existing saved link is preserved for this paper-year pair."
                              : officialLink
                                ? "Start a new drill session by opening the official UPSC link for this paper-year pair."
                                : `Waiting for UPSC to publish the ${item.year} paper set.`}
                          </p>
                          <button
                            type="button"
                            onClick={() => handlePaperClick(item.year)}
                            disabled={!hasDirectLink}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-bg-border bg-bg-surface px-3 py-2 text-xs font-semibold text-text-primary transition hover:border-accent-gold/30 hover:bg-accent-gold/5 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Link2 size={12} />
                            {savedLink?.url ? "Open saved link" : officialLink ? "Open paper " : "Link unavailable"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── Notes Tab ── */}
            {activeTab === "notes" && <NotesPanel paper={activePaper} />}

            {/* ── NCERT Tab ── */}
            {activeTab === "ncert" && <NCERTPanel paper={activePaper} />}
          </section>
        </div>
      </div>
    );
  }

  // ── Grid view ────────────────────────────────────────────────────────────────
  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-3xl border border-bg-border bg-bg-surface/90 p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-accent-gold">Mains Grind</p>
              <h1 className="mt-1 font-display text-2xl font-bold text-text-primary">
                Paper-wise mains drill — PYQs, notes, and NCERT.
              </h1>
              <p>

                <ul className="list-disc list-inside mt-2 text-md text-text-secondary">
                  - Start with one paper (e.g. GS1) and explore the linked PYQs, notes, and NCERTs. Gradually add more papers to your routine as you build confidence.
                  <br />
                  - Use the "Mark done" feature in NCERT tab to track your reading progress. Focus on understanding concepts rather than just ticking boxes.
                  <br />
                   - Regularly check back for new PYQs and notes as you progress in your preparation.
                </ul>
              </p>
            </div>

          </div>
        </header>

        <section className="rounded-3xl border border-bg-border bg-bg-surface/90 p-5 shadow-sm">
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {PAPER_OPTIONS.map((paper, index) => {
              const savedCount = Object.keys(savedLinks[paper.id] || {}).length;
              return (
                <button
                  key={paper.id}
                  type="button"
                  aria-pressed={activePaper === paper.id}
                  onClick={() => openPaperDetails(paper.id)}
                  className={`rounded-3xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 ${activePaper === paper.id
                    ? "border-accent-gold/35 bg-accent-gold/10"
                    : "border-bg-border bg-bg-surface hover:border-accent-gold/30"
                    }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-accent-gold/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.25em] text-accent-gold">
                      Paper {index + 1}
                    </span>
                    <Sparkles size={13} className="text-accent-gold" />
                  </div>
                  <h2 className="mt-4 font-display text-xl font-semibold text-text-primary">
                    {paper.label}
                  </h2>

                  <div className="mt-4 flex items-center justify-between rounded-2xl border border-bg-border bg-bg-muted/70 px-3 py-2 text-xs text-text-secondary">
                    <span>
                      {savedCount > 0 ? `${savedCount} saved links` : "Access Workspace"}
                    </span>
                    {/* // Arrow indicator: green if any saved links exist for this paper, amber otherwise */}
                    <span className={`h-2.5 w-2.5 rounded-full ${savedCount > 0 ? "bg-emerald-500" : "bg-amber-500"}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}