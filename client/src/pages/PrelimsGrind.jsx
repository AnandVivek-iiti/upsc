
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
  getPrelimsPaperLink,
  PRELIMS_LAST_VERIFIED_DATE,
} from "../data/Prelims_paper";
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
  { id: "paper-i", label: "Paper I" },
  { id: "paper-ii", label: "Paper II" },
];

const STORAGE_KEY = "upsc-prelims-links";

const PYQ_CARDS = [
  { year: 2026, chip: "Current Cycle" },
  { year: 2025, chip: "Latest" },
  { year: 2024, chip: "Latest" },
  { year: 2023, chip: "Recent" },
  { year: 2022, chip: "Paper Set" },
  { year: 2021, chip: "Archive" },
  { year: 2020, chip: "Bundle" },
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

function NotesPanel() {
  const prelims = NOTES.filter((n) => n.paper === "Prelims GS1" || n.paper === "Prelims CSAT");

  if (prelims.length === 0) return (
    <div className="mt-5 rounded-3xl border border-dashed border-bg-border bg-bg-muted/40 p-8 text-center">
      <FolderOpen size={28} className="mx-auto mb-3 text-text-muted opacity-50" />
      <p className="text-sm font-semibold text-text-secondary">No Prelims notes linked yet</p>
      <p className="mt-1 text-xs text-text-muted leading-relaxed">
        Add entries in <code className="bg-bg-border px-1 rounded">src/data/notes_data.js</code> with{" "}
        <code className="bg-bg-border px-1 rounded">paper: "Prelims GS1"</code> and they'll appear here.
      </p>
    </div>
  );

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {prelims.map((note) => (
        <div key={note.id} className="rounded-2xl border border-bg-border bg-bg-surface p-4 flex flex-col gap-2">
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
                <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-muted text-text-muted">#{t}</span>
              ))}
            </div>
          )}
          <div className="flex gap-2 mt-auto pt-1">
            {note.url && (
              <a href={note.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-bg-border bg-bg-muted px-3 py-1 text-xs font-semibold text-text-secondary hover:border-accent-gold/30 hover:text-text-primary transition">
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


function NCERTPanel() {
  const PRELIMS_SUBJECTS = ["History", "Geography", "Polity", "Economics", "Science", "Environment"];

  const [books, setBooks] = useState(() =>
    NCERT_BOOKS.filter((b) => PRELIMS_SUBJECTS.includes(b.subject))
  );

  const toggleDone = (id) => {
    setBooks((prev) => prev.map((b) => b.id === id ? { ...b, done: !b.done } : b));
  };

  if (books.length === 0) return (
    <div className="mt-5 rounded-3xl border border-dashed border-bg-border bg-bg-muted/40 p-8 text-center">
      <BookOpen size={28} className="mx-auto mb-3 text-text-muted opacity-50" />
      <p className="text-sm font-semibold text-text-secondary">No NCERT books linked yet</p>
      <p className="mt-1 text-xs text-text-muted leading-relaxed">
        Add entries in <code className="bg-bg-border px-1 rounded">src/data/ncert_data.js</code>.
        Books for History, Geography, Polity, Economics, Science, and Environment will appear here.
      </p>
    </div>
  );

  const grouped = books.reduce((acc, b) => {
    if (!acc[b.subject]) acc[b.subject] = [];
    acc[b.subject].push(b);
    return acc;
  }, {});

  return (
    <div className="mt-5 space-y-6">
      {Object.entries(grouped).map(([subject, subjectBooks]) => (
        <div key={subject}>
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-text-muted mb-3">{subject}</p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {subjectBooks.sort((a, b) => a.class - b.class).map((book) => (
              <div key={book.id}
                className={`rounded-2xl border p-4 flex flex-col gap-2 transition ${
                  book.done
                    ? "border-accent-green/30 bg-accent-green/5"
                    : "border-bg-border bg-bg-surface"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-text-primary leading-tight">{book.title}</p>
                    <p className="text-[11px] font-mono text-text-muted mt-0.5">Class {book.class}</p>
                  </div>
                  <button
                    onClick={() => toggleDone(book.id)}
                    className={`shrink-0 text-[10px] font-mono px-2 py-0.5 rounded-full border transition ${
                      book.done
                        ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
                        : "border-bg-border bg-bg-muted text-text-muted hover:border-accent-gold/30"
                    }`}
                  >
                    {book.done ? "✓ Done" : "Mark done"}
                  </button>
                </div>
                <div className="flex gap-2 mt-auto pt-1">
                  {book.url && (
                    <a href={book.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-bg-border bg-bg-muted px-3 py-1 text-xs font-semibold text-text-secondary hover:border-accent-gold/30 hover:text-text-primary transition">
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
        </div>
      ))}
    </div>
  );
}
// ─── Main Component ───────────────────────────────────────────────────────────
export default function PrelimsGrind() {
  const [activeTab, setActiveTab] = useState("pyqs");
  const [yearFilter, setYearFilter] = useState("all");
  const [savedLinks, setSavedLinks] = useState({});

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      setSavedLinks(stored);
    } catch (error) {
      console.warn("Could not read prelims links", error);
    }
  }, []);

  const visibleCards = useMemo(() => {
    if (yearFilter === "latest") return PYQ_CARDS.slice(0, 5);
    if (yearFilter === "2015") return PYQ_CARDS.filter((c) => c.year >= 2015 && c.year <= 2019);
    if (yearFilter === "2010") return PYQ_CARDS.filter((c) => c.year >= 2010 && c.year <= 2014);
    if (yearFilter === "2005") return PYQ_CARDS.filter((c) => c.year >= 2005 && c.year <= 2009);
    return PYQ_CARDS;
  }, [yearFilter]);

  const getSavedLink = (year, paperId) => savedLinks[`${activeTab}-${year}-${paperId}`];
  const getOfficialLink = (year, paperId) => getPrelimsPaperLink(year, paperId);

  const handlePaperClick = (year, paperId) => {
    const existing = getSavedLink(year, paperId);
    if (existing?.url) { window.open(existing.url, "_blank", "noopener,noreferrer"); return; }
    const officialLink = getOfficialLink(year, paperId);
    if (officialLink) { window.open(officialLink, "_blank", "noopener,noreferrer"); return; }
    window.alert(`UPSC has not published a mapped prelims link for ${year} yet.`);
  };

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="rounded-3xl border border-bg-border bg-bg-surface/90 p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-accent-gold">Prelims Grind</p>
              <h1 className="mt-1 font-display text-2xl font-bold text-text-primary">
                PYQs, notes, and NCERT for Prelims prep.
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-text-secondary">
               Important Tips for Prelims PYQ Drilling:
                <ul className="list-disc list-inside mt-2 text-sm text-text-secondary">
                  <li>Always focus on understanding concepts rather than memorizing.</li>
                  <li>Practice time management during the actual exam.</li>
                </ul>
              </p>
            </div>
            <div className="rounded-2xl border border-accent-gold/20 bg-accent-gold/10 px-3 py-2 text-xs text-text-secondary">
              <span className="font-semibold text-accent-gold">Preparation Started:</span>{" "}
              {PRELIMS_LAST_VERIFIED_DATE}
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
                {visibleCards.map((item) => (
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
                    <div className="mt-4 flex flex-wrap gap-2">
                      {PAPER_OPTIONS.map((paper) => {
                        const officialLink = getOfficialLink(item.year, paper.id);
                        const savedLink = getSavedLink(item.year, paper.id);
                        const hasDirectLink = Boolean(savedLink?.url || officialLink);
                        return (
                          <button
                            key={`${item.year}-${paper.id}`}
                            type="button"
                            onClick={() => handlePaperClick(item.year, paper.id)}
                            disabled={!hasDirectLink}
                            className="inline-flex items-center gap-1 rounded-full border border-bg-border bg-bg-muted px-3 py-1.5 text-xs font-semibold text-text-secondary hover:border-accent-gold/30 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40 transition"
                            title={savedLink?.url ? "Open saved link" : "Open official UPSC link"}
                          >
                            <Link2 size={12} />
                            {paper.label}
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${hasDirectLink ? "bg-emerald-500" : "bg-amber-500"}`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {/* ── Notes Tab — wired to /api/notes ── */}
          {activeTab === "notes" && <NotesPanel />}

          {/* ── NCERT Tab — wired to /api/ncert ── */}
          {activeTab === "ncert" && <NCERTPanel />}
        </section>
      </div>
    </div>
  );
}