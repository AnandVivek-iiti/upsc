import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Trophy, Flame, Clock, PenTool, Target, Crown,
  ChevronLeft, ChevronRight, Loader2, AlertCircle, Medal, X, BarChart3,
  Search, List as ListIcon, Table2, Sparkles,
} from "lucide-react";
import { getLeaderboard } from "../../utils/api";
import { AvatarCircle } from "./ProfilePage";

const TABS = [
  {
    id: "composite",
    label: "Overall",
    icon: Trophy,
    color: "var(--accent-gold)",
    statLabel: "Score",
    statValue: (r) => r.composite_score.toFixed(1),
  },
  {
    id: "streak",
    label: "Streak",
    icon: Flame,
    color: "#fb923c",
    statLabel: "Best Streak",
    statValue: (r) => `${r.longest_streak}d`,
  },
  {
    id: "hours",
    label: "Study Hours",
    icon: Clock,
    color: "var(--accent-blue)",
    statLabel: "Hours",
    statValue: (r) => `${r.total_study_hours}h`,
  },
  {
    id: "mains",
    label: "Mains Grind",
    icon: PenTool,
    color: "var(--accent-purple)",
    statLabel: "Answers",
    statValue: (r) => r.mains_evaluations,
  },
  {
    id: "accuracy",
    label: "Test Accuracy",
    icon: Target,
    color: "var(--accent-green)",
    statLabel: "Accuracy",
    statValue: (r) => `${r.avg_test_accuracy}%`,
  },
];

function RankBadge({ rank, size = "md" }) {
  const medalColor = rank === 1 ? "#FFD700" : rank === 2 ? "#C0C0C0" : rank === 3 ? "#CD7F32" : null;
  const dim = size === "sm" ? "w-8 h-8" : "w-9 h-9";
  if (medalColor) {
    return (
      <div
        className={`${dim} rounded-xl flex items-center justify-center shrink-0`}
        style={{ background: `${medalColor}22`, border: `1px solid ${medalColor}55` }}
      >
        <Medal size={16} style={{ color: medalColor }} />
      </div>
    );
  }
  return (
    <div className={`${dim} rounded-xl flex items-center justify-center shrink-0 bg-bg-muted border border-bg-border`}>
      <span className="text-sm font-mono font-bold text-text-muted">{rank}</span>
    </div>
  );
}

function PublicProfileModal({ entry, onClose }) {
  if (!entry) return null;
  const stats = [
    { label: "Current Streak", value: `${entry.streak}d`, color: "#fb923c", icon: Flame },
    { label: "Best Streak", value: `${entry.longest_streak}d`, color: "#fbbf24", icon: Trophy },
    { label: "Study Hours", value: `${entry.total_study_hours}h`, color: "var(--accent-blue)", icon: Clock },
    { label: "Mains Answers", value: entry.mains_evaluations, color: "var(--accent-purple)", icon: PenTool },
    { label: "Tests Attempted", value: entry.tests_attempted, color: "var(--accent-green)", icon: BarChart3 },
    { label: "Avg Test Accuracy", value: `${entry.avg_test_accuracy}%`, color: "var(--accent-green)", icon: Target },
  ];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-sm relative z-10 p-6 animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center bg-bg-muted border border-bg-border text-text-muted hover:text-text-primary transition-all active:scale-95"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col items-center text-center mb-5">
          <AvatarCircle name={entry.name} size="xl" as="div" className="mb-3" />
          <p className="text-lg font-display font-semibold text-text-primary">{entry.name}</p>
          <p className="text-xs font-mono text-text-muted">CSE {entry.target_year} · Rank #{entry.rank}</p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {stats.map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="muted-panel p-3 flex flex-col items-center gap-1 text-center">
              <Icon size={14} style={{ color }} />
              <span className="text-base font-bold text-text-primary">{value}</span>
              <span className="text-[10px] font-mono uppercase tracking-wide text-text-muted">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LeaderboardRow({ entry, tab, isMe, onClick }) {
  const isTop3 = entry.rank <= 3;
  const ringColor = entry.rank === 1 ? "#FFD700" : entry.rank === 2 ? "#C0C0C0" : entry.rank === 3 ? "#CD7F32" : null;
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className={`group flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 rounded-xl border transition-all cursor-pointer ${
        isMe ? "border-accent-gold/40" : "border-transparent hover:border-bg-border hover:bg-bg-muted/60"
      }`}
      style={isMe ? { background: "var(--accent-gold-dim)" } : {}}
    >
      <RankBadge rank={entry.rank} />
      <div className="relative shrink-0">
        <AvatarCircle name={entry.name} size="sm" as="div" />
        {ringColor && (
          <div
            className="absolute -inset-0.5 rounded-full pointer-events-none"
            style={{ border: `1.5px solid ${ringColor}` }}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm sm:text-base font-semibold text-text-primary truncate flex items-center gap-2">
          {entry.name}
          {isMe && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full text-accent-gold border border-accent-gold/30 bg-accent-gold/10 shrink-0">
              YOU
            </span>
          )}
        </p>
        <p className="text-[11px] sm:text-xs font-mono text-text-muted">CSE {entry.target_year}</p>
      </div>
      <div className="text-right shrink-0">
        <p
          className="text-base sm:text-lg font-display font-bold transition-transform group-hover:scale-105"
          style={{ color: tab.color }}
        >
          {tab.statValue(entry)}
        </p>
        <p className="text-[10px] font-mono text-text-muted uppercase tracking-wide">{tab.statLabel}</p>
      </div>
    </div>
  );
}

function PodiumCard({ entry, place, onClick }) {
  const cfg = {
    1: { color: "#FFD700", h: "pt-2", order: "sm:order-2", scale: "sm:scale-110" },
    2: { color: "#C0C0C0", h: "pt-6", order: "sm:order-1", scale: "" },
    3: { color: "#CD7F32", h: "pt-6", order: "sm:order-3", scale: "" },
  }[place];
  if (!entry) return <div className={`hidden sm:block ${cfg.order}`} />;
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className={`flex flex-col items-center text-center ${cfg.h} ${cfg.order} ${cfg.scale} cursor-pointer transition-transform hover:-translate-y-1`}
    >
      {place === 1 && <Crown size={18} className="mb-1" style={{ color: cfg.color }} />}
      <div className="relative">
        <AvatarCircle name={entry.name} size={place === 1 ? "xl" : "sm"} as="div" />
        <div
          className="absolute -inset-1 rounded-full pointer-events-none"
          style={{ border: `2px solid ${cfg.color}` }}
        />
        <div
          className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-bold"
          style={{ background: cfg.color, color: "#1a1a1a" }}
        >
          {place}
        </div>
      </div>
      <p className="mt-2.5 text-sm font-display font-semibold text-text-primary truncate max-w-[110px]">
        {entry.name}
      </p>
      <p className="text-[11px] font-mono text-text-muted">CSE {entry.target_year}</p>
      <p className="text-sm font-bold mt-0.5" style={{ color: cfg.color }}>
        {entry.composite_score.toFixed(1)}
      </p>
    </div>
  );
}

function LeaderboardTable({ entries, me, onSelect, activeTabId }) {
  return (
    <div className="overflow-x-auto -mx-2 sm:mx-0">
      <table className="w-full border-collapse min-w-[640px]">
        <thead>
          <tr className="border-b border-bg-border">
            <th className="text-left text-[11px] font-mono uppercase tracking-wide text-text-muted px-3 py-2.5 w-14">#</th>
            <th className="text-left text-[11px] font-mono uppercase tracking-wide text-text-muted px-3 py-2.5">Student</th>
            {TABS.map((t) => (
              <th
                key={t.id}
                className="text-right text-[11px] font-mono uppercase tracking-wide px-3 py-2.5 whitespace-nowrap"
                style={{ color: t.id === activeTabId ? t.color : "var(--text-muted)" }}
              >
                {t.statLabel}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => {
            const isMe = me?.id === entry.id;
            return (
              <tr
                key={entry.id}
                onClick={() => onSelect(entry)}
                className={`cursor-pointer transition-colors border-b border-bg-border/60 last:border-0 hover:bg-bg-muted/60 ${
                  i % 2 === 1 ? "bg-bg-muted/25" : ""
                }`}
                style={isMe ? { background: "var(--accent-gold-dim)" } : {}}
              >
                <td className="px-3 py-2.5"><RankBadge rank={entry.rank} size="sm" /></td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <AvatarCircle name={entry.name} size="sm" as="div" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate flex items-center gap-1.5">
                        {entry.name}
                        {isMe && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full text-accent-gold border border-accent-gold/30 bg-accent-gold/10 shrink-0">
                            YOU
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] font-mono text-text-muted">CSE {entry.target_year}</p>
                    </div>
                  </div>
                </td>
                {TABS.map((t) => (
                  <td
                    key={t.id}
                    className="text-right px-3 py-2.5 text-sm font-mono whitespace-nowrap"
                    style={{
                      color: t.id === activeTabId ? t.color : "var(--text-secondary)",
                      fontWeight: t.id === activeTabId ? 700 : 500,
                    }}
                  >
                    {t.statValue(entry)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Leaderboard({ user }) {
  const [tabId, setTabId] = useState("composite");
  const [year, setYear] = useState("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [view, setView] = useState("list");
  const [result, setResult] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewingEntry, setViewingEntry] = useState(null);

  const tab = TABS.find((t) => t.id === tabId) || TABS[0];

  // Debounce the search box so we're not firing a request on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchBoard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getLeaderboard({ sortBy: tabId, year, page, limit: 25, search: debouncedSearch });
      setResult(res);
      if (Array.isArray(res?.availableYears)) setAvailableYears(res.availableYears);
    } catch (e) {
      setError(e.message || "Failed to load leaderboard.");
    } finally {
      setLoading(false);
    }
  }, [tabId, year, page, debouncedSearch]);

  useEffect(() => { fetchBoard(); }, [fetchBoard]);
  useEffect(() => { setPage(1); }, [tabId, year, debouncedSearch]);

  const entries = result?.leaderboard || [];
  const me = result?.me || null;
  const meOnPage = me && entries.some((e) => e.id === me.id);
  const showPodium = page === 1 && !debouncedSearch && entries.length >= 3;
  const podiumIds = useMemo(
    () => (showPodium ? new Set(entries.slice(0, 3).map((e) => e.id)) : new Set()),
    [showPodium, entries]
  );
  const restEntries = showPodium ? entries.filter((e) => !podiumIds.has(e.id)) : entries;

  return (
    <div className="w-full px-4 sm:px-8 md:px-10 lg:px-14 py-6 sm:py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: "var(--accent-gold-dim)" }}
        >
          <Trophy size={20} className="text-accent-gold" />
        </div>
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-semibold text-text-primary leading-tight">Leaderboard</h1>
          <p className="text-xs sm:text-sm text-text-muted">See how your prep stacks up against other aspirants</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 -mx-1 px-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = t.id === tabId;
          return (
            <button
              key={t.id}
              onClick={() => setTabId(t.id)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all border shrink-0 active:scale-95"
              style={active
                ? { background: `${t.color}18`, color: t.color, borderColor: `${t.color}55` }
                : { color: "var(--text-secondary)", borderColor: "var(--bg-border)" }}
            >
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Filter bar: search, year, view toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="w-full rounded-xl pl-9 pr-3 py-2 text-sm bg-bg-muted text-text-primary border border-bg-border focus:outline-none focus:ring-2 focus:ring-accent-gold/40 placeholder:text-text-muted"
          />
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="rounded-xl px-3 py-2 text-sm bg-bg-muted text-text-primary border border-bg-border focus:outline-none focus:ring-2 focus:ring-accent-gold/40"
          >
            <option value="all">All years</option>
            {availableYears.map((y) => <option key={y} value={y}>CSE {y}</option>)}
          </select>

          <div className="flex items-center rounded-xl border border-bg-border p-0.5 bg-bg-muted shrink-0">
            <button
              onClick={() => setView("list")}
              aria-label="List view"
              className="w-8 h-8 rounded-[10px] flex items-center justify-center transition-all"
              style={view === "list"
                ? { background: "var(--bg-surface)", color: "var(--accent-gold)", boxShadow: "var(--shadow-sm)" }
                : { color: "var(--text-muted)" }}
            >
              <ListIcon size={15} />
            </button>
            <button
              onClick={() => setView("table")}
              aria-label="Table view"
              className="w-8 h-8 rounded-[10px] flex items-center justify-center transition-all"
              style={view === "table"
                ? { background: "var(--bg-surface)", color: "var(--accent-gold)", boxShadow: "var(--shadow-sm)" }
                : { color: "var(--text-muted)" }}
            >
              <Table2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Pinned "your rank" - shown when you're not on the current page */}
      {me && !meOnPage && (
        <div className="mb-4">
          <p className="text-[11px] font-mono text-text-muted uppercase tracking-wide mb-1.5">Your rank</p>
          <LeaderboardRow entry={me} tab={tab} isMe onClick={() => setViewingEntry(me)} />
        </div>
      )}

      {/* Podium (page 1, composite tab context, no active search) */}
      {!loading && !error && showPodium && (
        <div className="glass-panel p-5 sm:p-6 mb-4">
          <p className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wide text-text-muted mb-4">
            <Sparkles size={12} className="text-accent-gold" /> Top performers
          </p>
          <div className="flex items-end justify-center gap-5 sm:gap-8">
            <PodiumCard entry={entries[1]} place={2} onClick={() => setViewingEntry(entries[1])} />
            <PodiumCard entry={entries[0]} place={1} onClick={() => setViewingEntry(entries[0])} />
            <PodiumCard entry={entries[2]} place={3} onClick={() => setViewingEntry(entries[2])} />
          </div>
        </div>
      )}

      {/* List / Table */}
      <div className="glass-panel p-2 sm:p-3">
        {loading ? (
          <div className="flex items-center justify-center py-14 text-text-muted">
            <Loader2 size={20} className="animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 py-10 px-4 text-sm font-mono text-red-400">
            <AlertCircle size={14} /> {error}
          </div>
        ) : entries.length === 0 ? (
          <p className="text-center py-14 text-sm text-text-muted">No students found for this filter yet.</p>
        ) : view === "table" ? (
          <LeaderboardTable entries={entries} me={me} onSelect={setViewingEntry} activeTabId={tabId} />
        ) : (
          <div className="space-y-1">
            {restEntries.map((entry) => (
              <LeaderboardRow
                key={entry.id}
                entry={entry}
                tab={tab}
                isMe={me?.id === entry.id}
                onClick={() => setViewingEntry(entry)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {result && result.pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="btn-ghost flex items-center gap-1.5 text-sm disabled:opacity-40"
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <span className="text-xs font-mono text-text-muted">
            Page {result.page} of {result.pages} · {result.total} students
          </span>
          <button
            onClick={() => setPage((p) => Math.min(result.pages, p + 1))}
            disabled={page >= result.pages}
            className="btn-ghost flex items-center gap-1.5 text-sm disabled:opacity-40"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {viewingEntry && (
        <PublicProfileModal entry={viewingEntry} onClose={() => setViewingEntry(null)} />
      )}
    </div>
  );
}