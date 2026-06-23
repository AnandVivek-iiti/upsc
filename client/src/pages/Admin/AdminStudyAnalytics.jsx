/**
 * AdminStudyAnalytics.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Features 7 & 9 — Admin analytics panel for founder / admin dashboard.
 *
 * Answers the questions:
 *   Which subjects are most studied platform-wide?
 *   Average study hours per user?
 *   Who studies consistently (≥5 days in period)?
 *   Top 10 users by study hours?
 *   Per-user subject breakdown?
 *
 * Usage in Adminpannel.jsx:
 *   import AdminStudyAnalytics from "./AdminStudyAnalytics";
 *   <AdminStudyAnalytics />
 *
 * Requires admin JWT in localStorage("upsc_token").
 *
 * Design:
 *   - Matches existing glass-panel / font-mono aesthetic
 *   - No pie charts (per spec); uses progress bars and ranked lists
 *   - Three tabs: Global Insights | Top Users | Per-User Breakdown
 */

import { useState, useEffect, useCallback } from "react";
import {
  BarChart2, Users, TrendingUp, Trophy, Flame,
  RefreshCw, ChevronDown, ChevronUp, Search,
} from "lucide-react";
import { SUBJECT_COLORS, SUBJECT_ICONS } from "../../hooks/useSubjectTimer";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function authHeaders() {
  const token = localStorage.getItem("upsc_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── Formatters ───────────────────────────────────────────────────────────────
function fmtHours(h) {
  if (!h) return "0h";
  return `${h}h`;
}
function fmtMin(m) {
  if (!m || m < 1) return "< 1m";
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

// ─── Period selector ──────────────────────────────────────────────────────────
const PERIODS = [
  { id: "day",      label: "Today"     },
  { id: "week",     label: "This Week" },
  { id: "month",    label: "This Month"},
  { id: "lifetime", label: "All Time"  },
];

// ─── Platform stat card ───────────────────────────────────────────────────────
function PlatformStat({ label, value, sub, color = "var(--accent-gold)" }) {
  return (
    <div
      className="rounded-xl p-3 sm:p-4 space-y-1"
      style={{ background: `${color}0c`, border: `0.5px solid ${color}25` }}
    >
      <p className="text-[9px] sm:text-[10px] font-mono text-text-muted uppercase tracking-wider">{label}</p>
      <p className="text-xl sm:text-2xl font-display font-bold text-text-primary">{value}</p>
      {sub && <p className="text-[10px] font-mono text-text-muted">{sub}</p>}
    </div>
  );
}

// ─── Subject bar row ──────────────────────────────────────────────────────────
function SubjectBar({ subject, hours, userCount, sessionCount, maxHours, rank }) {
  const color = SUBJECT_COLORS[subject] || "#94a3b8";
  const icon  = SUBJECT_ICONS[subject]  || "📚";
  const pct   = maxHours > 0 ? (hours / maxHours) * 100 : 0;

  return (
    <div className="space-y-1 py-2 border-b border-bg-border/30 last:border-0">
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] font-mono text-text-muted w-4 text-center shrink-0">{rank}</span>
          <span className="text-sm">{icon}</span>
          <span className="text-xs font-medium text-text-primary truncate">{subject}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-right">
          <span className="text-[10px] font-mono text-text-muted hidden sm:inline">
            {userCount} user{userCount !== 1 ? "s" : ""}
          </span>
          <span className="text-[10px] font-mono text-text-muted hidden sm:inline">
            {sessionCount} sessions
          </span>
          <span className="text-xs font-mono font-bold" style={{ color }}>
            {fmtHours(hours)}
          </span>
        </div>
      </div>
      <div className="h-1.5 bg-bg-muted rounded-full overflow-hidden ml-10">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}bb, ${color})`,
          }}
        />
      </div>
    </div>
  );
}

// ─── Top user row ─────────────────────────────────────────────────────────────
function TopUserRow({ user, rank, maxHours }) {
  const [expanded, setExpanded] = useState(false);
  const pct = maxHours > 0 ? (user.total_hours / maxHours) * 100 : 0;

  const medals = ["🥇", "🥈", "🥉"];
  const medal  = rank <= 3 ? medals[rank - 1] : null;

  return (
    <div className="border-b border-bg-border/30 last:border-0">
      <div
        className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-bg-muted/30 rounded-lg px-2 -mx-2 transition-colors"
        onClick={() => user.subject_breakdown?.length && setExpanded((v) => !v)}
      >
        {/* Rank */}
        <span className="text-sm w-6 text-center shrink-0">
          {medal || <span className="text-[11px] font-mono text-text-muted">{rank}</span>}
        </span>

        {/* Name + email */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-text-primary truncate">{user.name}</p>
          <p className="text-[10px] font-mono text-text-muted truncate">{user.email}</p>
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-3 text-right shrink-0">
          <div>
            <p className="text-[9px] font-mono text-text-muted uppercase">Sessions</p>
            <p className="text-xs font-mono text-text-primary">{user.total_sessions}</p>
          </div>
          <div>
            <p className="text-[9px] font-mono text-text-muted uppercase">Avg Session</p>
            <p className="text-xs font-mono text-text-primary">{fmtMin(user.avg_session_min)}</p>
          </div>
          <div>
            <p className="text-[9px] font-mono text-text-muted uppercase">Study Days</p>
            <p className="text-xs font-mono text-text-primary">{user.study_days ?? "—"}</p>
          </div>
        </div>

        {/* Total hours */}
        <div className="text-right shrink-0">
          <p className="text-sm font-display font-bold text-accent-gold">{fmtHours(user.total_hours)}</p>
          <p className="text-[9px] font-mono text-text-muted">{user.most_studied || "—"}</p>
        </div>

        {/* Expand toggle */}
        {user.subject_breakdown?.length > 0 && (
          <button className="text-text-muted shrink-0">
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-bg-muted rounded-full overflow-hidden mb-1 ml-9">
        <div
          className="h-full bg-accent-gold/60 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Expanded subject breakdown */}
      {expanded && user.subject_breakdown?.length > 0 && (
        <div className="ml-9 mb-2 space-y-1">
          {user.subject_breakdown.map((sub) => {
            const c = SUBJECT_COLORS[sub.subject] || "#94a3b8";
            return (
              <div key={sub.subject} className="flex items-center gap-2">
                <span className="text-xs">{SUBJECT_ICONS[sub.subject] || "📚"}</span>
                <span className="text-[11px] text-text-secondary flex-1">{sub.subject}</span>
                <span className="text-[11px] font-mono font-bold" style={{ color: c }}>
                  {sub.display}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Daily activity sparkline ─────────────────────────────────────────────────
function DailySparkline({ data }) {
  if (!data?.length) return null;
  const maxH = Math.max(...data.map((d) => d.total_hours), 0.1);
  return (
    <div>
      <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-2">
        Daily Activity (last 30 days)
      </p>
      <div className="flex items-end gap-0.5 h-12">
        {data.map((d) => {
          const pct  = Math.min((d.total_hours / maxH) * 100, 100);
          const color = pct > 66 ? "#10b981" : pct > 33 ? "#6366f1" : "#f59e0b";
          return (
            <div
              key={d.date}
              className="flex-1 rounded-t-sm transition-all duration-500"
              style={{
                height:     `${Math.max(pct, 4)}%`,
                background: color,
                opacity:    0.6 + (pct / 100) * 0.4,
              }}
              title={`${d.date}: ${d.total_hours}h · ${d.active_users} users`}
            />
          );
        })}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px] font-mono text-text-muted">{data[0]?.date?.slice(5) || ""}</span>
        <span className="text-[9px] font-mono text-text-muted">{data[data.length - 1]?.date?.slice(5) || ""}</span>
      </div>
    </div>
  );
}

// ─── Tab: Global Insights (Feature 9) ────────────────────────────────────────
function GlobalInsightsTab({ period }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/subject-sessions/admin/global?period=${period}`, { headers: authHeaders() });
      const json = await res.json();
      if (json.success) setData(json);
    } catch { /* non-fatal */ }
    finally  { setLoading(false); }
  }, [period]);

  useEffect(() => { fetch_(); }, [fetch_]);

  if (loading && !data) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-bg-muted rounded-xl" />)}
      </div>
    );
  }
  if (!data) return null;

  const { platform, subject_distribution, top_users, daily_activity } = data;
  const maxSubjectHours = subject_distribution[0]?.total_hours || 1;

  return (
    <div className="space-y-5">

      {/* Platform summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        <PlatformStat
          label="Total Study Hours"
          value={fmtHours(platform.total_hours)}
          sub={`${platform.total_sessions} sessions`}
          color="#C9A84C"
        />
        <PlatformStat
          label="Active Users"
          value={platform.active_users}
          sub={`${fmtHours(platform.avg_hours_per_user)} avg/user`}
          color="#6366f1"
        />
        <PlatformStat
          label="Avg Session"
          value={fmtMin(platform.avg_session_min)}
          sub="per session"
          color="#10b981"
        />
      </div>

      {/* Subject distribution */}
      <div>
        <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-2">
          Subject Distribution — Platform Wide
        </p>
        {subject_distribution.length === 0 ? (
          <p className="text-xs font-mono text-text-muted py-3">No data for this period.</p>
        ) : (
          <div>
            {subject_distribution.map((row, i) => (
              <SubjectBar
                key={row.subject}
                subject={row.subject}
                hours={row.total_hours}
                userCount={row.user_count}
                sessionCount={row.session_count}
                maxHours={maxSubjectHours}
                rank={i + 1}
              />
            ))}
          </div>
        )}
      </div>

      {/* Top 3 preview */}
      {top_users.length > 0 && (
        <div>
          <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-2">
            Top 3 Users
          </p>
          <div className="space-y-1.5">
            {top_users.slice(0, 3).map((u, i) => (
              <div key={u.user_id} className="flex items-center gap-3 py-1.5 px-2.5 rounded-lg bg-bg-muted/50">
                <span className="text-sm">{"🥇🥈🥉"[i]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-primary truncate">{u.name}</p>
                  <p className="text-[10px] font-mono text-text-muted truncate">{u.email}</p>
                </div>
                <span className="text-sm font-display font-bold text-accent-gold shrink-0">
                  {fmtHours(u.total_hours)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily activity chart */}
      {daily_activity?.length > 0 && (
        <div className="pt-2 border-t border-bg-border/40">
          <DailySparkline data={daily_activity} />
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={fetch_}
          disabled={loading}
          className="flex items-center gap-1.5 text-[11px] font-mono text-text-muted hover:text-text-primary transition-colors"
        >
          <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>
    </div>
  );
}

// ─── Tab: Top Users (Feature 9) ───────────────────────────────────────────────
function TopUsersTab({ period }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(
        `${BASE}/subject-sessions/admin/global?period=${period}`,
        { headers: authHeaders() }
      );
      const json = await res.json();
      if (json.success) setData(json);
    } catch { /* non-fatal */ }
    finally  { setLoading(false); }
  }, [period]);

  useEffect(() => { fetch_(); }, [fetch_]);

  if (loading && !data) {
    return (
      <div className="space-y-2 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-14 bg-bg-muted rounded-lg" />)}
      </div>
    );
  }
  if (!data?.top_users?.length) {
    return <p className="text-xs font-mono text-text-muted py-3">No data for this period.</p>;
  }

  const maxHours = data.top_users[0]?.total_hours || 1;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
          Top 10 by Study Hours
        </p>
        <button onClick={fetch_} disabled={loading} className="p-1 rounded hover:bg-bg-muted transition-colors">
          <RefreshCw size={11} className={`text-text-muted ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
      {data.top_users.map((u, i) => (
        <TopUserRow key={u.user_id} user={u} rank={i + 1} maxHours={maxHours} />
      ))}

      {/* Consistent studiers callout */}
      {data.consistent_studiers?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-bg-border/40">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={12} className="text-orange-400" />
            <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
              Consistent Studiers (≥5 active days)
            </p>
          </div>
          <p className="text-sm font-display font-bold text-text-primary">
            {data.consistent_studiers.length}
            <span className="text-xs font-mono font-normal text-text-muted ml-1">users</span>
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Per-User Breakdown (Feature 7) ──────────────────────────────────────
function UserBreakdownTab({ period }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [search,  setSearch]  = useState("");
  const [offset,  setOffset]  = useState(0);
  const LIMIT = 25;

  const fetch_ = useCallback(async (off = 0) => {
    setLoading(true);
    try {
      const res  = await fetch(
        `${BASE}/subject-sessions/admin/users?period=${period}&limit=${LIMIT}&offset=${off}`,
        { headers: authHeaders() }
      );
      const json = await res.json();
      if (json.success) {
        setData((prev) => off === 0 ? json : { ...json, users: [...(prev?.users || []), ...json.users] });
        setOffset(off + json.users.length);
      }
    } catch { /* non-fatal */ }
    finally  { setLoading(false); }
  }, [period]);

  useEffect(() => { setOffset(0); fetch_(0); }, [fetch_]);

  const users    = data?.users || [];
  const filtered = search
    ? users.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const maxHours = users[0]?.total_hours || 1;
  const hasMore  = data ? offset < data.total : false;

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full pl-8 pr-3 py-2 text-xs font-mono bg-bg-muted border border-bg-border rounded-lg
                     text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-gold/40 transition-colors"
        />
      </div>

      {/* Column headers */}
      <div className="flex items-center gap-3 px-2 text-[9px] font-mono text-text-muted uppercase tracking-wider">
        <span className="w-6 shrink-0">#</span>
        <span className="flex-1">User</span>
        <span className="hidden sm:block w-16 text-right">Hours</span>
        <span className="hidden sm:block w-16 text-right">Sessions</span>
        <span className="hidden sm:block w-16 text-right">Days</span>
        <span className="w-16 text-right">Avg Sess</span>
      </div>

      {/* User rows */}
      {loading && !data ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-bg-muted rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-xs font-mono text-text-muted py-4 text-center">
          {search ? "No users match your search." : "No data for this period."}
        </p>
      ) : (
        <div>
          {filtered.map((u, i) => (
            <TopUserRow key={u.user_id} user={u} rank={i + 1} maxHours={maxHours} />
          ))}
        </div>
      )}

      {/* Load more */}
      {!search && hasMore && (
        <button
          onClick={() => fetch_(offset)}
          disabled={loading}
          className="w-full py-2 text-[11px] font-mono text-text-muted hover:text-text-primary
                     border border-bg-border rounded-lg hover:bg-bg-muted transition-colors"
        >
          {loading ? "Loading…" : `Load more (${data.total - offset} remaining)`}
        </button>
      )}
    </div>
  );
}

// ─── Main AdminStudyAnalytics ──────────────────────────────────────────────────
const TABS = [
  { id: "global",    label: "Global Insights", icon: TrendingUp },
  { id: "top",       label: "Top Users",        icon: Trophy     },
  { id: "breakdown", label: "Per-User",         icon: Users      },
];

export default function AdminStudyAnalytics() {
  const [tab,    setTab]    = useState("global");
  const [period, setPeriod] = useState("month");

  return (
    <div className="glass-panel p-3 sm:p-5 space-y-4">

      {/* Header */}
      <div className="flex items-center gap-2">
        <BarChart2 size={14} className="text-accent-gold shrink-0" />
        <div>
          <h3 className="text-sm font-display font-semibold text-text-primary">
            Study Analytics
          </h3>
          <p className="text-[10px] font-mono text-text-muted mt-0.5">
            Platform-wide UPSC study behaviour
          </p>
        </div>
      </div>

      {/* Period tabs */}
      <div className="flex bg-bg-muted rounded-lg p-0.5 gap-0.5">
        {PERIODS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setPeriod(id)}
            className={`flex-1 py-1.5 px-1 rounded-md text-[10px] sm:text-[11px] font-mono transition-all ${
              period === id
                ? "bg-accent-gold/20 text-accent-gold border border-accent-gold/30"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* View tabs */}
      <div className="flex gap-1.5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all ${
              tab === id
                ? "bg-accent-gold/15 text-accent-gold border border-accent-gold/30"
                : "text-text-muted hover:text-text-secondary hover:bg-bg-muted border border-transparent"
            }`}
          >
            <Icon size={11} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="pt-1">
        {tab === "global"    && <GlobalInsightsTab period={period} />}
        {tab === "top"       && <TopUsersTab       period={period} />}
        {tab === "breakdown" && <UserBreakdownTab  period={period} />}
      </div>
    </div>
  );
}