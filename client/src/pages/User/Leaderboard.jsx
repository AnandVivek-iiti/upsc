import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Trophy, Flame, Clock, PenTool, Target, Crown,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Loader2, AlertCircle, Medal, BarChart3,
  Search, List as ListIcon, Table2, Sparkles, Layers, ArrowLeft, BookOpen, CalendarCheck,
} from "lucide-react";
import { getLeaderboard } from "../../utils/api";
import { AvatarCircle } from "./ProfilePage";
import { SUBJECT_COLORS, SUBJECT_ICONS } from "../../hooks/useSubjectTimer";

const BRAND_GREEN = "var(--accent-green)";
const BRAND_GREEN_DEEP = "#059669";

function withAlpha(color, alphaPercent) {
  if (!color) return color;
  if (color.startsWith("var(")) {
    return `color-mix(in srgb, ${color} ${alphaPercent}%, transparent)`;
  }
  const hex = Math.round((alphaPercent / 100) * 255).toString(16).padStart(2, "0");
  return `${color}${hex}`;
}

const TABS = [
  {
    id: "composite",
    label: "Overall",
    icon: Trophy,
    color: BRAND_GREEN_DEEP,
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
    color: "var(--accent-pink)",
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

// ─── Per-subject mini breakdown ──────────────────────────────────────────────
// Renders a compact, ranked list of a student's subjects with a proportional
// bar + hours, reusing the same colour/icon map as the admin study-analytics
// panel so the visual language stays consistent across the app.
function SubjectBreakdownList({ subjects, dense = false }) {
  if (!subjects?.length) return null;
  const maxHours = Math.max(...subjects.map((s) => s.hours || 0), 1);
  return (
    <div className={dense ? "space-y-1.5" : "space-y-2"}>
      {subjects.map((s) => {
        const color = SUBJECT_COLORS[s.subject] || "#10B981";
        const icon = SUBJECT_ICONS[s.subject] || "📚";
        const pct = maxHours > 0 ? ((s.hours || 0) / maxHours) * 100 : 0;
        return (
          <div key={s.subject} className="flex items-center gap-2">
            <span className={dense ? "text-xs w-4 shrink-0 text-center" : "text-sm w-5 shrink-0 text-center"}>{icon}</span>
            <span className={`${dense ? "text-[11px]" : "text-xs"} text-text-secondary flex-1 truncate`}>{s.subject}</span>
            <div className={`${dense ? "w-16 sm:w-24 h-1.5" : "w-20 sm:w-28 h-2"} bg-bg-muted rounded-full overflow-hidden hidden xs:block`}>
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${withAlpha(color, 70)}, ${color})` }}
              />
            </div>
            <span className={`${dense ? "text-[11px]" : "text-xs"} font-mono font-bold w-12 text-right shrink-0`} style={{ color }}>
              {s.display || `${s.hours}h`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function StudentAnalyticsPage({ entry, onBack }) {
  const subjects = entry.subject_breakdown || [];
  const totalSubjectHours = subjects.reduce((sum, s) => sum + (s.hours || 0), 0);
  const topSubject = entry.top_subject || subjects[0]?.subject;

  const behaviorStats = [
    { label: "Current Streak", value: `${entry.streak ?? 0}d`, color: "#fb923c", icon: Flame },
    { label: "Best Streak", value: `${entry.longest_streak ?? 0}d`, color: "#fbbf24", icon: Trophy },
    { label: "Total Study Hours", value: `${entry.total_study_hours ?? 0}h`, color: "var(--accent-blue)", icon: Clock },
    { label: "Mains Answers Practiced", value: entry.mains_evaluations ?? 0, color: "var(--accent-purple)", icon: PenTool },
    { label: "Tests Attempted", value: entry.tests_attempted ?? 0, color: "var(--accent-green)", icon: BarChart3 },
    { label: "Study Days Logged", value: entry.study_days ?? "—", color: "var(--accent-green)", icon: CalendarCheck },
  ];

  return (
    <div className="animate-fade-in">
      {/* Back bar */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-accent-green transition-colors mb-4 active:scale-95"
      >
        <ArrowLeft size={16} /> Back to leaderboard
      </button>

      {/* Student header */}
      <div
        className="relative overflow-hidden rounded-2xl p-5 sm:p-6 mb-5"
        style={{
          background: "linear-gradient(135deg, var(--accent-green-dim) 0%, var(--bg-surface) 70%)",
          border: "1px solid var(--bg-border)",
        }}
      >
        <div className="relative flex items-center gap-4">
          <div className="relative shrink-0">
            <AvatarCircle name={entry.name} src={entry.avatar} size="xl" as="div" />
            <div
              className="absolute -inset-1 rounded-full pointer-events-none"
              style={{ border: "1.5px solid var(--accent-green)", opacity: 0.55 }}
            />
          </div>
          <div className="min-w-0">
            <p className="text-lg sm:text-xl font-display font-semibold text-text-primary truncate">{entry.name}</p>
            <p className="text-xs sm:text-sm font-mono text-text-muted">
              CSE {entry.target_year} · Rank #{entry.rank}
              {topSubject && (
                <span> · {SUBJECT_ICONS[topSubject] || "📚"} Most studied: {topSubject}</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Study behaviour stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-5">
        {behaviorStats.map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="muted-panel p-3.5 flex flex-col items-center gap-1.5 text-center">
            <Icon size={16} style={{ color }} />
            <span className="text-lg font-display font-bold text-text-primary">{value}</span>
            <span className="text-[10px] font-mono uppercase tracking-wide text-text-muted leading-tight">{label}</span>
          </div>
        ))}
      </div>

      {/* Subject-wise study analytics */}
      <div className="glass-panel p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wide text-text-muted">
            <Layers size={12} className="text-accent-green" /> Study time by subject
          </p>
          {totalSubjectHours > 0 && (
            <span className="text-[11px] font-mono text-text-muted">{totalSubjectHours.toFixed(1)}h tracked</span>
          )}
        </div>
        {subjects.length > 0 ? (
          <SubjectBreakdownList subjects={subjects} />
        ) : (
          <div className="flex flex-col items-center text-center py-8 text-text-muted">
            <BookOpen size={20} className="mb-2 opacity-60" />
            <p className="text-sm">No subject-wise data available for this student yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function LeaderboardRow({ entry, tab, isMe, onClick }) {
  const [expanded, setExpanded] = useState(false);
  const ringColor = entry.rank === 1 ? "#FFD700" : entry.rank === 2 ? "#C0C0C0" : entry.rank === 3 ? "#CD7F32" : null;
  const subjects = entry.subject_breakdown || [];
  const topSubject = entry.top_subject || subjects[0]?.subject;
  const hasSubjects = subjects.length > 0;

  return (
    <div
      className={`rounded-xl border transition-all ${
        isMe ? "border-accent-green/40" : "border-transparent hover:border-bg-border hover:bg-bg-muted/60"
      }`}
      style={isMe ? { background: "var(--accent-green-dim)" } : {}}
    >
      <div
        onClick={onClick}
        role="button"
        tabIndex={0}
        className="group flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 cursor-pointer"
      >
        <RankBadge rank={entry.rank} />
        <div className="relative shrink-0">
          <AvatarCircle name={entry.name} src={entry.avatar} size="sm" as="div" />
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
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full text-accent-green border border-accent-green/30 bg-accent-green/10 shrink-0">
                YOU
              </span>
            )}
          </p>
          <p className="text-[11px] sm:text-xs font-mono text-text-muted truncate">
            CSE {entry.target_year}
            {topSubject && (
              <span className="text-text-muted">
                {" "}· {SUBJECT_ICONS[topSubject] || "📚"} {topSubject}
              </span>
            )}
          </p>
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
        {hasSubjects && (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
            aria-label="Toggle subject breakdown"
            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-accent-green hover:bg-accent-green/10 transition-all"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      {expanded && hasSubjects && (
        <div className="px-3 sm:px-4 pb-3 pt-0.5 animate-slide-up">
          <div className="pl-11 sm:pl-[52px]">
            <SubjectBreakdownList subjects={subjects} dense />
          </div>
        </div>
      )}
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
      className={`flex flex-col items-center text-center ${cfg.h} ${cfg.order} ${cfg.scale} cursor-pointer transition-transform hover:-translate-y-1.5`}
    >
      {place === 1 && <Crown size={18} className="mb-1 animate-pulse-soft" style={{ color: cfg.color }} />}
      <div className={`relative ${place === 1 ? "animate-float" : ""}`}>
        <AvatarCircle name={entry.name} src={entry.avatar} size={place === 1 ? "xl" : "sm"} as="div" />
        <div
          className="absolute -inset-1 rounded-full pointer-events-none"
          style={{ border: `2px solid ${cfg.color}`, boxShadow: place === 1 ? `0 0 16px ${cfg.color}55` : "none" }}
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
      <p className="text-sm font-bold mt-0.5" style={{ color: "var(--accent-green)" }}>
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
            <th className="text-left text-[11px] font-mono uppercase tracking-wide text-text-muted px-3 py-2.5 hidden md:table-cell">Top Subject</th>
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
            const topSubject = entry.top_subject || entry.subject_breakdown?.[0]?.subject;
            return (
              <tr
                key={entry.id}
                onClick={() => onSelect(entry)}
                className={`cursor-pointer transition-colors border-b border-bg-border/60 last:border-0 hover:bg-bg-muted/60 ${
                  i % 2 === 1 ? "bg-bg-muted/25" : ""
                }`}
                style={isMe ? { background: "var(--accent-green-dim)" } : {}}
              >
                <td className="px-3 py-2.5"><RankBadge rank={entry.rank} size="sm" /></td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <AvatarCircle name={entry.name} src={entry.avatar} size="sm" as="div" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate flex items-center gap-1.5">
                        {entry.name}
                        {isMe && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full text-accent-green border border-accent-green/30 bg-accent-green/10 shrink-0">
                            YOU
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] font-mono text-text-muted">CSE {entry.target_year}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5 hidden md:table-cell">
                  {topSubject ? (
                    <span
                      className="text-[11px] font-mono px-2 py-1 rounded-lg inline-flex items-center gap-1.5"
                      style={{
                        color: SUBJECT_COLORS[topSubject] || "#10B981",
                        background: withAlpha(SUBJECT_COLORS[topSubject] || "#10B981", 8),
                      }}
                    >
                      {SUBJECT_ICONS[topSubject] || "📚"} {topSubject}
                    </span>
                  ) : (
                    <span className="text-[11px] text-text-muted">—</span>
                  )}
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

  // Viewing a student swaps the whole panel for a full analytics page
  // instead of a small popup card.
  if (viewingEntry) {
    return (
      <div className="w-full px-4 sm:px-8 md:px-10 lg:px-14 py-6 sm:py-8 max-w-4xl mx-auto">
        <StudentAnalyticsPage entry={viewingEntry} onBack={() => setViewingEntry(null)} />
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-8 md:px-10 lg:px-14 py-6 sm:py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div
        className="relative overflow-hidden rounded-2xl mb-6 p-5 sm:p-6"
        style={{
          background: "linear-gradient(135deg, var(--accent-green-dim) 0%, var(--bg-surface) 65%)",
          border: "1px solid var(--bg-border)",
        }}
      >
        <div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none animate-pulse-soft"
          style={{ background: "radial-gradient(circle, var(--accent-green) 0%, transparent 70%)", opacity: 0.15 }}
        />
        <div className="relative flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 animate-float"
            style={{ background: "var(--accent-green-dim)", border: "1px solid rgba(16, 185, 129, 0.3)" }}
          >
            <Trophy size={20} className="text-accent-green" />
          </div>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-semibold text-text-primary leading-tight">Leaderboard</h1>
            <p className="text-xs sm:text-sm text-text-muted">See how your prep stacks up against other aspirants</p>
          </div>
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
                ? { background: withAlpha(t.color, 10), color: t.color, borderColor: withAlpha(t.color, 35), boxShadow: `0 0 0 1px ${withAlpha(t.color, 15)}` }
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
            className="w-full rounded-xl pl-9 pr-3 py-2 text-sm bg-bg-muted text-text-primary border border-bg-border focus:outline-none focus:ring-2 focus:ring-accent-green/40 placeholder:text-text-muted"
          />
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="rounded-xl px-3 py-2 text-sm bg-bg-muted text-text-primary border border-bg-border focus:outline-none focus:ring-2 focus:ring-accent-green/40"
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
                ? { background: "var(--bg-surface)", color: "var(--accent-green)", boxShadow: "var(--shadow-sm)" }
                : { color: "var(--text-muted)" }}
            >
              <ListIcon size={15} />
            </button>
            <button
              onClick={() => setView("table")}
              aria-label="Table view"
              className="w-8 h-8 rounded-[10px] flex items-center justify-center transition-all"
              style={view === "table"
                ? { background: "var(--bg-surface)", color: "var(--accent-green)", boxShadow: "var(--shadow-sm)" }
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
        <div
          className="glass-panel p-5 sm:p-6 mb-4 relative overflow-hidden"
          style={{ boxShadow: "var(--shadow-md), 0 0 24px rgba(16, 185, 129, 0.12)" }}
        >
          <p className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wide text-text-muted mb-4">
            <Sparkles size={12} className="text-accent-green" /> Top performers
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
            <Loader2 size={20} className="animate-spin text-accent-green" />
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
            {restEntries.map((entry, i) => (
              <div key={entry.id} className={`animate-rise ${i < 6 ? `stagger-${i + 1}` : ""}`}>
                <LeaderboardRow
                  entry={entry}
                  tab={tab}
                  isMe={me?.id === entry.id}
                  onClick={() => setViewingEntry(entry)}
                />
              </div>
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
    </div>
  );
}