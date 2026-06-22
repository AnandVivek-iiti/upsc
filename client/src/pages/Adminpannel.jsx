import { useState, useEffect, useCallback, useRef } from "react";
import {
  Users, BarChart2, Shield, RefreshCw, Download,
  ChevronLeft, ChevronRight, Eye, EyeOff, Activity,
  AlertCircle, Trash2, CheckCircle2, Loader2, TrendingUp, TrendingDown,
  Flame, Clock, BookOpen, Brain, FileText, Target,
  ArrowUp, ArrowDown, Minus, X, Calendar, UserCheck,
  GitBranch, Compass, Lightbulb, User, Zap, AlertTriangle, MessageCircle, Star, ThumbsUp,
  Layers, Info,
} from "lucide-react";
import {
  downloadFullReport,
} from "../utils/adminReports";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ─── fetch helper ─────────────────────────────────────────────────────────────
async function adminFetch(path, options = {}) {
  const token = localStorage.getItem("upsc_token");
  const res = await fetch(`${BASE}/admin${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

function relTime(iso) {
  if (!iso) return "—";
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function fmtNum(n) {
  if (n === undefined || n === null) return "—";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-mono
      ${type === "error"
        ? "bg-accent-red/10 border border-accent-red/30 text-accent-red"
        : "bg-accent-green/10 border border-accent-green/30 text-accent-green"}`}>
      {type === "error" ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
      {msg}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X size={12} /></button>
    </div>
  );
}

// ─── Trend chip ───────────────────────────────────────────────────────────────
function TrendChip({ delta }) {
  if (delta === undefined || delta === null) return null;
  const up = delta > 0;
  const flat = delta === 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded-full
      ${flat ? "text-text-muted bg-bg-muted"
        : up ? "text-accent-green bg-accent-green/10"
          : "text-accent-red bg-accent-red/10"}`}>
      {flat ? <Minus size={9} /> : up ? <ArrowUp size={9} /> : <ArrowDown size={9} />}
      {flat ? "flat" : `${Math.abs(delta)}`}
    </span>
  );
}

// ─── Metric card ──────────────────────────────────────────────────────────────
function MetricCard({ icon: Icon, label, value, sub, iconColor, delta, accent }) {
  return (
    <div className={`bg-bg-surface border rounded-2xl p-4 sm:p-5 flex flex-col gap-2
      ${accent ? "border-accent-gold/30" : "border-bg-border"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${iconColor}15`, border: `1px solid ${iconColor}25` }}>
          <Icon size={16} style={{ color: iconColor }} />
        </div>
        <TrendChip delta={delta} />
      </div>
      <div>
        <p className="text-[11px] font-mono text-text-muted uppercase tracking-wider">{label}</p>
        <p className={`text-2xl font-display font-bold mt-0.5 ${accent ? "text-accent-gold" : "text-text-primary"}`}>
          {fmtNum(value)}
        </p>
        {sub && <p className="text-[11px] text-text-muted mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHead({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xs font-mono font-semibold text-text-muted uppercase tracking-widest">{title}</h2>
      {action}
    </div>
  );
}

// ─── Loading placeholder ──────────────────────────────────────────────────────
function LoadSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 size={20} className="animate-spin text-accent-gold" />
    </div>
  );
}

// ─── Download PDF button ──────────────────────────────────────────────────────
function DownloadBtn({ onClick, label = "PDF" }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-xs font-mono text-accent-blue hover:text-text-primary
        transition-colors px-2.5 py-1.5 rounded-lg border border-accent-blue/20
        hover:border-accent-blue/50 bg-accent-blue/5 hover:bg-accent-blue/10"
    >
      <Download size={11} />
      {label}
    </button>
  );
}

// ─── Retention heat-map cell ──────────────────────────────────────────────────
function RetentionCell({ pct }) {
  if (pct === undefined || pct === null) return <td className="px-3 py-2 text-center text-text-muted/30 text-xs">—</td>;
  const color = pct >= 60 ? "#4ade80" : pct >= 30 ? "#fbbf24" : pct >= 10 ? "#fb923c" : "#f87171";
  return (
    <td className="px-3 py-2 text-center">
      <span className="text-xs font-mono font-bold" style={{ color }}>{pct}%</span>
    </td>
  );
}

// ─── Event type → human label ─────────────────────────────────────────────────
const EVENT_LABELS = {
  dashboard_visit: { label: "visited dashboard", icon: BarChart2, color: "#60a5fa" },
  timer_start: { label: "started study timer", icon: Clock, color: "#4ade80" },
  mentor_open: { label: "opened AI Mentor", icon: Brain, color: "#a78bfa" },
  answer_evaluated: { label: "evaluated an answer", icon: FileText, color: "#f59e0b" },
  notes_audited: { label: "audited notes", icon: BookOpen, color: "#34d399" },
  test_attempted: { label: "attempted a mock test", icon: Target, color: "#f97316" },
  pyq_used: { label: "practiced PYQs", icon: Activity, color: "#22d3ee" },
  syllabus_tracked: { label: "updated syllabus", icon: CheckCircle2, color: "#4ade80" },
  day_return: { label: "returned to study", icon: Flame, color: "#fb923c" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════════════════════════════
function OverviewTab({ metrics, insights, loading, onRefresh }) {
  if (loading && !metrics) return <LoadSpinner />;
  if (!metrics) return <p className="text-sm text-text-muted py-8 text-center">No metrics available.</p>;

  const { users = {}, engagement = {}, activity = {}, trends = {} } = metrics;
  const topInsights = insights?.slice(0, 3) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHead title="User Growth" />
        <div className="flex items-center gap-2">
          <button onClick={onRefresh} disabled={loading}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary font-mono transition-colors">
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <MetricCard icon={Users} label="Total Users" value={users.total} iconColor="#60a5fa" delta={trends.total_delta} />
        <MetricCard icon={UserCheck} label="Today Signups" value={users.todaySignups} iconColor="#4ade80" delta={trends.signup_delta} />
        <MetricCard icon={Activity} label="DAU" value={users.dau} iconColor="#f59e0b" delta={trends.dau_delta} accent />
        <MetricCard icon={Calendar} label="WAU" value={users.wau} iconColor="#a78bfa" />
        <MetricCard icon={TrendingUp} label="MAU" value={users.mau} iconColor="#f97316" />
      </div>

      <div>
        <SectionHead title="Feature Adoption" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard icon={Users} label="Registered" value={users.total} iconColor="#60a5fa" />
          <MetricCard icon={Activity} label="Used Any Feature" value={users.usedAnyFeature} iconColor="#4ade80"
            sub={users.total ? `${Math.round((users.usedAnyFeature / users.total) * 100)}% of users` : undefined} />
          <MetricCard icon={TrendingUp} label="Used 3+ Features" value={users.used3PlusFeatures} iconColor="#f59e0b"
            sub={users.total ? `${Math.round((users.used3PlusFeatures / users.total) * 100)}% of users` : undefined} />
          <MetricCard icon={Target} label="Used 5+ Features" value={users.used5PlusFeatures} iconColor="#a78bfa" accent
            sub={users.total ? `${Math.round((users.used5PlusFeatures / users.total) * 100)}% of users` : undefined} />
        </div>
      </div>

      <div>
        <SectionHead title="Engagement" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <MetricCard icon={Calendar} label="Retention D1" value={engagement.retentionD1 !== undefined ? `${engagement.retentionD1}%` : "—"} iconColor="#4ade80" />
          <MetricCard icon={Calendar} label="Retention D7" value={engagement.retentionD7 !== undefined ? `${engagement.retentionD7}%` : "—"} iconColor="#f59e0b" />
          <MetricCard icon={Clock} label="Avg Study/Day" value={engagement.avgStudyHours !== undefined ? `${engagement.avgStudyHours}h` : "—"} iconColor="#60a5fa" />
          <MetricCard icon={Clock} label="Total Study Hrs" value={fmtNum(engagement.totalStudyHours)} iconColor="#a78bfa" />
          <MetricCard icon={Flame} label="Active Streaks" value={users.activeStreakUsers} iconColor="#fb923c" />
        </div>
      </div>

      <div>
        <SectionHead title="Activity" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard icon={FileText} label="Answers Evaluated" value={activity.answersEvaluated} iconColor="#f59e0b" />
          <MetricCard icon={BookOpen} label="Notes Audited" value={activity.notesAudited} iconColor="#34d399" />
          <MetricCard icon={Target} label="Tests Attempted" value={activity.testsAttempted} iconColor="#f97316" />
          <MetricCard icon={Brain} label="AI Conversations" value={activity.aiMentorConversations} iconColor="#a78bfa" accent />
        </div>
      </div>

      {topInsights.length > 0 && (
        <div>
          <SectionHead title="Top Insights" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topInsights.map((insight, i) => (
              <div key={insight.id || i} className="bg-bg-surface border border-bg-border rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  {insight.type === "positive" ? (
                    <Zap size={16} className="text-accent-green" />
                  ) : insight.type === "warning" ? (
                    <AlertTriangle size={16} className="text-accent-gold" />
                  ) : (
                    <Info size={16} className="text-text-muted" />
                  )}
                  <span className="text-xs font-mono font-semibold text-text-primary">{insight.title}</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{insight.body}</p>
                {insight.feature && (
                  <span className="text-[10px] font-mono text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded-full self-start">
                    {insight.feature}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// USERS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function UsersTab({ users, usersTotal, userPage, loading, onPageChange, onSortChange, sortBy, sortDir, onDelete, onUserClick }) {
  const [showEmails, setShowEmails] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const COLS = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "streak", label: "Streak 🔥" },
    { key: "longest_streak", label: "Best Streak" },
    { key: "total_study_hours", label: "Study Hrs" },
    { key: "answers_evaluated", label: "Answers" },
    { key: "notes_audited", label: "Notes" },
    { key: "tests_attempted", label: "Tests" },
    { key: "days_active", label: "Days Active" },
    { key: "features_used", label: "Features" },
    { key: "last_active", label: "Last Active" },
    { key: "registration_date", label: "Joined" },
    { key: "engagement_score", label: "Score" },
  ];

  const maskEmail = (email) => {
    if (!email) return "—";
    return email.replace(/(.{2}).*(@.*)/, "$1••••$2");
  };
  const fetchFeedback = useCallback(async () => {
    load("feedback", true);
    try {
      const [statsRes, listRes] = await Promise.all([
        adminFetch("/feedback/admin/stats"),
        adminFetch("/feedback/admin/list?limit=20"),
      ]);
      setFeedbackStats(statsRes.stats);
      setFeedbackList(listRes.feedback || []);
    } catch (e) { notify(e.message, "error"); }
    finally { load("feedback", false); }
  }, []);
  const totalPages = Math.ceil(usersTotal / 20);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <SectionHead title={`Users (${usersTotal})`} />
        <div className="flex items-center gap-2">
          <button onClick={() => setShowEmails(v => !v)}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary font-mono transition-colors">
            {showEmails ? <EyeOff size={12} /> : <Eye size={12} />}
            {showEmails ? "Mask emails" : "Show emails"}
          </button>
        </div>
      </div>

      {loading && users.length === 0 ? <LoadSpinner /> : (
        <div className="bg-bg-surface border border-bg-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-bg-border bg-bg-muted/40">
                  {COLS.map(c => (
                    <th key={c.key}
                      onClick={() => onSortChange(c.key)}
                      className="text-left px-3 py-3 text-[10px] font-mono text-text-muted uppercase tracking-wider cursor-pointer hover:text-text-primary transition-colors whitespace-nowrap select-none">
                      <span className="flex items-center gap-1">
                        {c.label}
                        {sortBy === c.key && (
                          sortDir === "asc" ? <ArrowUp size={9} /> : <ArrowDown size={9} />
                        )}
                      </span>
                    </th>
                  ))}
                  <th className="w-10 px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr
                    key={u.id}
                    className={`group border-b border-bg-border/40 hover:bg-bg-muted/30 transition-colors cursor-pointer
                      ${i % 2 === 0 ? "" : "bg-bg-muted/10"}`}
                    onClick={() => onUserClick(u.id)}
                  >
                    <td className="px-3 py-2.5 font-medium text-text-primary whitespace-nowrap">{u.name || "—"}</td>
                    <td className="px-3 py-2.5 text-text-secondary font-mono text-xs whitespace-nowrap">
                      {showEmails ? u.email : maskEmail(u.email)}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {(u.streak || 0) > 0
                        ? <span className="text-accent-gold font-mono font-bold">{u.streak}</span>
                        : <span className="text-text-muted">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-center text-text-secondary font-mono text-xs">{u.longest_streak || "—"}</td>
                    <td className="px-3 py-2.5 text-center text-text-secondary font-mono text-xs">
                      {u.total_study_hours ? `${parseFloat(u.total_study_hours).toFixed(1)}h` : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-center text-text-secondary font-mono text-xs">{u.answers_evaluated ?? "—"}</td>
                    <td className="px-3 py-2.5 text-center text-text-secondary font-mono text-xs">{u.notes_audited ?? "—"}</td>
                    <td className="px-3 py-2.5 text-center text-text-secondary font-mono text-xs">{u.tests_attempted ?? "—"}</td>
                    <td className="px-3 py-2.5 text-center text-text-secondary font-mono text-xs">{u.days_active ?? "—"}</td>
                    <td className="px-3 py-2.5 text-center">
                      {u.features_used !== undefined
                        ? <span className="font-mono text-xs text-accent-blue">{u.features_used}/7</span>
                        : <span className="text-text-muted text-xs">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-text-muted font-mono text-xs whitespace-nowrap">{relTime(u.last_active)}</td>
                    <td className="px-3 py-2.5 text-text-muted font-mono text-xs whitespace-nowrap">
                      {u.registration_date
                        ? new Date(u.registration_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })
                        : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="font-mono text-xs font-bold text-accent-gold">{u.engagement_score ?? "—"}</span>
                    </td>
                    <td className="px-2 py-2.5" onClick={(e) => e.stopPropagation()}>
                      {pendingDelete === u.id ? (
                        <span className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => {
                              onDelete(u.id);
                              setPendingDelete(null);
                            }}
                            className="text-[10px] font-mono text-accent-red hover:text-black bg-accent-red/10 hover:bg-accent-red/30 border border-accent-red/30 px-1.5 py-0.5 rounded transition-colors"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setPendingDelete(null)}
                            className="text-[10px] font-mono text-text-muted hover:text-text-primary px-1.5 py-0.5 rounded transition-colors"
                          >
                            No
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setPendingDelete(u.id)}
                          className="opacity-0 group-hover:opacity-100 flex items-center justify-center p-1 rounded hover:bg-accent-red/10 text-text-muted hover:text-accent-red transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={COLS.length} className="px-4 py-10 text-center text-text-muted text-sm">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-bg-border">
              <p className="text-xs text-text-muted font-mono">Page {userPage} of {totalPages} · {usersTotal} users</p>
              <div className="flex gap-2">
                <button disabled={userPage <= 1} onClick={() => onPageChange(userPage - 1)}
                  className="p-1.5 rounded-lg border border-bg-border disabled:opacity-40 hover:bg-bg-muted transition-colors">
                  <ChevronLeft size={13} className="text-text-secondary" />
                </button>
                <button disabled={userPage >= totalPages} onClick={() => onPageChange(userPage + 1)}
                  className="p-1.5 rounded-lg border border-bg-border disabled:opacity-40 hover:bg-bg-muted transition-colors">
                  <ChevronRight size={13} className="text-text-secondary" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function AnalyticsTab({ funnel, features, loading }) {
  if (loading && !funnel) return <LoadSpinner />;

  return (
    <div className="space-y-8">
      <div className="flex justify-end -mb-4">
      </div>

      <div>
        <SectionHead title="Activation Funnel" />
        {funnel?.length ? (
          <div className="bg-bg-surface border border-bg-border rounded-2xl p-5 space-y-4">
            {funnel.map((step, i) => {
              const barW = Math.max(step.pctOfTotal, 2);
              const isFirst = i === 0;
              return (
                <div key={step.step}>
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-mono text-text-muted w-4 shrink-0">{step.step}</span>
                      <span className="text-sm text-text-primary truncate">{step.label}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {!isFirst && step.dropOffPct > 0 && (
                        <span className="text-[10px] font-mono text-accent-red">
                          −{step.dropOffPct}% drop
                        </span>
                      )}
                      <span className="text-xs font-mono font-bold text-text-primary w-8 text-right">{step.count}</span>
                      <span className="text-[10px] font-mono text-text-muted w-8 text-right">{step.pctOfTotal}%</span>
                    </div>
                  </div>
                  <div className="h-7 rounded-lg overflow-hidden bg-bg-muted relative">
                    <div
                      className="h-full rounded-lg transition-all duration-700"
                      style={{
                        width: `${barW}%`,
                        background: isFirst
                          ? "linear-gradient(90deg, #60a5fa, #818cf8)"
                          : step.pctOfTotal >= 60
                            ? "linear-gradient(90deg, #4ade80, #34d399)"
                            : step.pctOfTotal >= 30
                              ? "linear-gradient(90deg, #fbbf24, #f59e0b)"
                              : "linear-gradient(90deg, #fb923c, #ef4444)",
                      }}
                    />
                    <span className="absolute inset-0 flex items-center px-3 text-[11px] font-mono text-white/80">
                      {step.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-text-muted py-6 text-center">No funnel data yet.</p>
        )}
      </div>

      <div>
        <SectionHead title="Feature Engagement (ranked)" />
        {features?.length ? (
          <div className="bg-bg-surface border border-bg-border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bg-border bg-bg-muted/40">
                  {["#", "Feature", "Unique Users", "Total Uses", "Avg / User", "Score", "Last Used", "Top Users"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-mono text-text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((f, i) => (
                  <tr key={f.name} className={`border-b border-bg-border/40 hover:bg-bg-muted/20 transition-colors`}>
                    <td className="px-4 py-3 text-[11px] font-mono text-text-muted">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-text-primary whitespace-nowrap">{f.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-bold text-accent-blue">{f.uniqueUsers}</span>
                        <div className="h-1.5 w-16 bg-bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-accent-blue/60 rounded-full"
                            style={{ width: `${features[0]?.uniqueUsers > 0 ? (f.uniqueUsers / features[0].uniqueUsers) * 100 : 0}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-text-secondary">{f.totalUses}</td>
                    <td className="px-4 py-3 font-mono text-xs text-text-muted">{f.avgUsagePerUser}×</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono font-bold text-accent-gold">{f.engagementScore}</span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-text-muted whitespace-nowrap">{relTime(f.lastUsed)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {(f.topUsers || []).map((u, j) => (
                          <span key={j} className="text-[10px] font-mono bg-bg-muted border border-bg-border rounded px-1.5 py-0.5 text-text-muted truncate max-w-[80px]" title={u.name}>
                            {u.name?.split(" ")[0] || "—"}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-text-muted py-6 text-center">No feature analytics yet.</p>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACTIVITY TAB
// ═══════════════════════════════════════════════════════════════════════════════
function ActivityTab({ events, loading, onRefresh }) {
  const autoRef = useRef(null);

  useEffect(() => {
    autoRef.current = setInterval(onRefresh, 60000);
    return () => clearInterval(autoRef.current);
  }, [onRefresh]);

  if (loading && !events?.length) return <LoadSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <SectionHead title="Activity Feed (latest 50)" />
        <div className="flex items-center gap-2">
          <button onClick={onRefresh} disabled={loading}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary font-mono transition-colors">
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Auto-refreshes every 60s
          </button>
        </div>
      </div>

      {events?.length ? (
        <div className="bg-bg-surface border border-bg-border rounded-2xl overflow-hidden divide-y divide-bg-border/50">
          {events.map((ev) => {
            const meta = EVENT_LABELS[ev.event_type] || { label: ev.event_type, icon: Activity, color: "#94a3b8" };
            const Icon = meta.icon;
            return (
              <div key={ev.id} className="flex items-start gap-3 px-4 py-3 hover:bg-bg-muted/30 transition-colors">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}20` }}>
                  <Icon size={13} style={{ color: meta.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">
                    <span className="font-semibold">{ev.user_name || "A user"}</span>
                    {" "}{meta.label}
                    {ev.feature_name && ev.feature_name !== ev.user_name && (
                      <span className="text-text-muted"> · {ev.feature_name}</span>
                    )}
                    {ev.metadata?.subject && (
                      <span className="text-accent-gold font-mono text-xs ml-1">({ev.metadata.subject})</span>
                    )}
                  </p>
                  {ev.metadata?.score !== undefined && (
                    <p className="text-[11px] font-mono text-text-muted">Score: {ev.metadata.score}</p>
                  )}
                </div>
                <span className="text-[11px] font-mono text-text-muted shrink-0 mt-0.5">{relTime(ev.created_at)}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-bg-surface border border-bg-border rounded-2xl py-16 text-center">
          <Activity size={24} className="text-text-muted mx-auto mb-3" />
          <p className="text-sm text-text-muted">No activity recorded yet.</p>
          <p className="text-xs text-text-muted mt-1">Events will appear here as users interact with the platform.</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RETENTION TAB
// ═══════════════════════════════════════════════════════════════════════════════
function RetentionTab({ retention, cohort, churnList, loading }) {
  if (loading && !retention) return <LoadSpinner />;

  return (
    <div className="space-y-8">
      <div className="flex justify-end -mb-4">
      </div>

      <div>
        <SectionHead title="Retention Rates" />
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Day 1", value: retention?.d1, sub: "Returned day after signup" },
            { label: "Day 7", value: retention?.d7, sub: "Returned within first week" },
            { label: "Day 30", value: retention?.d30, sub: "Returned within first month" },
          ].map(({ label, value, sub }) => {
            const color = value >= 40 ? "#4ade80" : value >= 15 ? "#fbbf24" : "#f87171";
            return (
              <div key={label} className="bg-bg-surface border border-bg-border rounded-2xl p-5 text-center">
                <p className="text-[11px] font-mono text-text-muted uppercase tracking-wider mb-2">{label}</p>
                <p className="text-4xl font-display font-bold" style={{ color }}>{value ?? "—"}{value !== undefined ? "%" : ""}</p>
                <p className="text-[11px] text-text-muted mt-1">{sub}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <SectionHead title="Weekly Cohort Retention" />
        {cohort?.length ? (
          <div className="bg-bg-surface border border-bg-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-bg-border bg-bg-muted/40">
                    <th className="text-left px-4 py-3 text-[10px] font-mono text-text-muted uppercase tracking-wider">Signup Week</th>
                    <th className="px-3 py-3 text-[10px] font-mono text-text-muted uppercase tracking-wider text-center">Cohort</th>
                    <th className="px-3 py-3 text-[10px] font-mono text-text-muted uppercase tracking-wider text-center">Week 0</th>
                    <th className="px-3 py-3 text-[10px] font-mono text-text-muted uppercase tracking-wider text-center">Week 1</th>
                    <th className="px-3 py-3 text-[10px] font-mono text-text-muted uppercase tracking-wider text-center">Week 2</th>
                    <th className="px-3 py-3 text-[10px] font-mono text-text-muted uppercase tracking-wider text-center">Week 3</th>
                  </tr>
                </thead>
                <tbody>
                  {cohort.map((row) => (
                    <tr key={row.cohortWeek} className="border-b border-bg-border/40 hover:bg-bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-xs text-text-primary">{row.cohortWeek}</td>
                      <td className="px-3 py-2.5 text-center font-mono text-xs text-text-muted">{row.cohortSize}</td>
                      <RetentionCell pct={row.week0} />
                      <RetentionCell pct={row.week1} />
                      <RetentionCell pct={row.week2} />
                      <RetentionCell pct={row.week3} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2 border-t border-bg-border flex items-center gap-4 text-[10px] font-mono text-text-muted">
              <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-[#4ade80]" /> ≥60%</span>
              <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-[#fbbf24]" /> 30–59%</span>
              <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-[#fb923c]" /> 10–29%</span>
              <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-[#f87171]" /> &lt;10%</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-text-muted py-6 text-center">No cohort data yet — needs more sign-ups across multiple weeks.</p>
        )}
      </div>

      <div>
        <SectionHead title="Churn Risk · Not seen in 7+ days" />
        {churnList?.length ? (
          <div className="bg-bg-surface border border-bg-border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bg-border bg-bg-muted/40">
                  {["Name", "Email (masked)", "Streak", "Last Active"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-mono text-text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {churnList.map((u, i) => (
                  <tr key={u.id} className={`border-b border-bg-border/40 hover:bg-accent-red/5 transition-colors ${i % 2 === 0 ? "" : "bg-bg-muted/10"}`}>
                    <td className="px-4 py-2.5 font-medium text-text-primary">{u.name}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-text-secondary">
                      {u.email?.replace(/(.{2}).*(@.*)/, "$1••••$2") || "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      {(u.streak || 0) > 0
                        ? <span className="font-mono text-accent-gold text-xs">{u.streak}🔥</span>
                        : <span className="text-text-muted text-xs">—</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-xs text-accent-red">{relTime(u.last_active)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-bg-surface border border-bg-border rounded-2xl py-10 text-center">
            <CheckCircle2 size={20} className="text-accent-green mx-auto mb-2" />
            <p className="text-sm text-text-muted">No users at churn risk right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// JOURNEY TAB
// ═══════════════════════════════════════════════════════════════════════════════
function JourneyTab({ journeyData, loading }) {
  if (loading && !journeyData) return <LoadSpinner />;
  if (!journeyData) return <p className="text-sm text-text-muted py-8 text-center">No journey data yet.</p>;

  const { firstFeatureRanked = [], journeyRows = [] } = journeyData;

  return (
    <div className="space-y-8">
      <SectionHead title="First Feature Discovery & Return Rates" />
      {firstFeatureRanked.length ? (
        <div className="bg-bg-surface border border-bg-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-border bg-bg-muted/40">
                <th className="text-left px-4 py-3 text-[10px] font-mono text-text-muted uppercase tracking-wider">Feature</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono text-text-muted uppercase tracking-wider">First‑time Users</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono text-text-muted uppercase tracking-wider">% of Total</th>
                <th className="text-left px-4 py-3 text-[10px] font-mono text-text-muted uppercase tracking-wider">Return Rate (D1)</th>
              </tr>
            </thead>
            <tbody>
              {firstFeatureRanked.map((item) => (
                <tr key={item.feature} className="border-b border-bg-border/40 hover:bg-bg-muted/20 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-text-primary">{item.feature}</td>
                  <td className="px-4 py-2.5 font-mono text-sm text-text-secondary">{item.count}</td>
                  <td className="px-4 py-2.5 font-mono text-sm text-text-secondary">{item.pct}%</td>
                  <td className="px-4 py-2.5 font-mono text-sm">
                    <span className={item.returnRate >= 60 ? "text-accent-green" : item.returnRate >= 30 ? "text-accent-gold" : "text-accent-red"}>
                      {item.returnRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-text-muted py-6 text-center">No first‑feature data yet.</p>
      )}

      <SectionHead title="Recent User Journeys (last 200)" />
      {journeyRows.length ? (
        <div className="bg-bg-surface border border-bg-border rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-border bg-bg-muted/40 sticky top-0">
                <th className="text-left px-4 py-2 text-[10px] font-mono text-text-muted uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-2 text-[10px] font-mono text-text-muted uppercase tracking-wider">Signed Up</th>
                <th className="text-left px-4 py-2 text-[10px] font-mono text-text-muted uppercase tracking-wider">First Feature</th>
                <th className="text-left px-4 py-2 text-[10px] font-mono text-text-muted uppercase tracking-wider">Second Feature</th>
                <th className="text-left px-4 py-2 text-[10px] font-mono text-text-muted uppercase tracking-wider">Most Used</th>
                <th className="text-left px-4 py-2 text-[10px] font-mono text-text-muted uppercase tracking-wider">Returned?</th>
              </tr>
            </thead>
            <tbody>
              {journeyRows.map((row) => (
                <tr key={row.user_id} className="border-b border-bg-border/40 hover:bg-bg-muted/20 transition-colors">
                  <td className="px-4 py-2 font-medium text-text-primary">{row.name}</td>
                  <td className="px-4 py-2 font-mono text-xs text-text-muted">{relTime(row.signed_up)}</td>
                  <td className="px-4 py-2 font-mono text-xs text-accent-blue">{row.first_feature || "—"}</td>
                  <td className="px-4 py-2 font-mono text-xs text-text-muted">{row.second_feature || "—"}</td>
                  <td className="px-4 py-2 font-mono text-xs text-text-muted">{row.most_used_feature || "—"}</td>
                  <td className="px-4 py-2">
                    {row.returned_next_day ? (
                      <CheckCircle2 size={14} className="text-accent-green" />
                    ) : (
                      <X size={14} className="text-accent-red" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-text-muted py-6 text-center">No recent journeys.</p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEGMENTS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function SegmentsTab({ segments, loading }) {
  if (loading && !segments) return <LoadSpinner />;
  if (!segments) return <p className="text-sm text-text-muted py-8 text-center">No segment data yet.</p>;

  const { powerUsers, atRisk, dormant, newUsers, total } = segments;

  const renderSegment = (title, data, color, Icon) => (
    <div className="bg-bg-surface border border-bg-border rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} style={{ color }} />
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        <span className="ml-auto text-xs font-mono text-text-muted">{data.count} users</span>
      </div>
      {data.users?.length ? (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {data.users.map((u) => (
            <div key={u.id} className="flex justify-between items-center text-xs border-b border-bg-border/30 py-1">
              <span className="text-text-primary">{u.name}</span>
              <span className="font-mono text-text-muted">{relTime(u.last_active)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-text-muted">No users in this segment.</p>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <SectionHead title={`User Segments (${total} total)`} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderSegment("Power Users", powerUsers, "#4ade80", Zap)}
        {renderSegment("At Risk", atRisk, "#fbbf24", AlertTriangle)}
        {renderSegment("Dormant", dormant, "#f87171", X)}
        {renderSegment("New Users", newUsers, "#60a5fa", User)}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DISCOVERY TAB
// ═══════════════════════════════════════════════════════════════════════════════
function DiscoveryTab({ discovery, loading }) {
  if (loading && !discovery) return <LoadSpinner />;
  if (!discovery) return <p className="text-sm text-text-muted py-8 text-center">No discovery data yet.</p>;

  const { firstFeatureDist = {}, retentionByFeature = [], ignoredFeatures = [], causeOfReturn = [] } = discovery;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SectionHead title="First Feature Distribution" />
          <div className="bg-bg-surface border border-bg-border rounded-2xl p-4">
            {Object.keys(firstFeatureDist).length ? (
              <div className="space-y-2">
                {Object.entries(firstFeatureDist)
                  .sort((a, b) => b[1] - a[1])
                  .map(([feature, count]) => (
                    <div key={feature} className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary w-32 truncate">{feature}</span>
                      <div className="flex-1 h-2 bg-bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent-blue/70 rounded-full"
                          style={{ width: `${(count / Math.max(...Object.values(firstFeatureDist))) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-text-muted w-10 text-right">{count}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">No data.</p>
            )}
          </div>
        </div>

        <div>
          <SectionHead title="Retention Rate by Feature (D1)" />
          <div className="bg-bg-surface border border-bg-border rounded-2xl p-4 max-h-64 overflow-y-auto">
            {retentionByFeature.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-bg-border">
                    <th className="text-left text-[10px] font-mono text-text-muted uppercase py-1">Feature</th>
                    <th className="text-right text-[10px] font-mono text-text-muted uppercase py-1">Return Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {retentionByFeature.map((item) => (
                    <tr key={item.feature} className="border-b border-bg-border/30">
                      <td className="py-1 text-text-primary">{item.feature}</td>
                      <td className="py-1 text-right font-mono">
                        <span className={item.returnRate >= 60 ? "text-accent-green" : item.returnRate >= 30 ? "text-accent-gold" : "text-accent-red"}>
                          {item.returnRate}%
                        </span>
                        <span className="text-[10px] text-text-muted ml-1">({item.usersWhoReturned}/{item.totalUsersOfFeature})</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-text-muted">No data.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <SectionHead title="Ignored Features (<10% adoption)" />
          <div className="bg-bg-surface border border-bg-border rounded-2xl p-4">
            {ignoredFeatures.length ? (
              <ul className="list-disc list-inside space-y-1">
                {ignoredFeatures.map((f) => (
                  <li key={f} className="text-sm text-text-secondary">{f}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-accent-green">No ignored features – all are being adopted.</p>
            )}
          </div>
        </div>

        <div>
          <SectionHead title="Features that drive return visits" />
          <div className="bg-bg-surface border border-bg-border rounded-2xl p-4">
            {causeOfReturn.length ? (
              <ul className="space-y-2">
                {causeOfReturn.map((item) => (
                  <li key={item.feature} className="flex justify-between items-center border-b border-bg-border/30 py-1">
                    <span className="text-sm text-text-primary">{item.feature}</span>
                    <span className="text-xs font-mono text-text-muted">{item.count} users</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-text-muted">No data yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INSIGHTS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function InsightsTab({ insights, loading }) {
  if (loading && !insights) return <LoadSpinner />;
  if (!insights?.length) return <p className="text-sm text-text-muted py-8 text-center">No insights generated yet.</p>;

  return (
    <div className="space-y-4">
      <SectionHead title="Founder Insights" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, i) => {
          const Icon = insight.type === "positive" ? Zap : insight.type === "warning" ? AlertTriangle : Info;
          const color = insight.type === "positive" ? "text-accent-green" : insight.type === "warning" ? "text-accent-gold" : "text-text-muted";
          return (
            <div key={insight.id || i} className="bg-bg-surface border border-bg-border rounded-2xl p-5 flex flex-col gap-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${color}15` }}>
                  <Icon size={14} className={color} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">{insight.title}</h3>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">{insight.body}</p>
                  {insight.feature && (
                    <span className="inline-block mt-2 text-[10px] font-mono bg-accent-blue/10 text-accent-blue px-2 py-0.5 rounded-full">
                      {insight.feature}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
// ─── FEEDBACK TAB ──────────────────────────────────────────────────────────
function FeedbackTab({ stats, feedbackList, loading, onRefresh, onExport }) {
  if (loading && !stats) return <LoadSpinner />;
  if (!stats) return <p className="text-sm text-text-muted py-8 text-center">No feedback data yet.</p>;

  const { total, avgRating, recommendRate, featureStats, mostRequested } = stats;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHead title="Feedback Analytics" />
        <div className="flex items-center gap-2">
          <button onClick={onRefresh} disabled={loading}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary font-mono transition-colors">
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={MessageCircle} label="Total Feedback" value={total} iconColor="#60a5fa" />
        <MetricCard icon={Star} label="Avg Rating" value={avgRating ? avgRating.toFixed(1) : "—"} iconColor="#f59e0b" />
        <MetricCard icon={ThumbsUp} label="Would Recommend" value={`${recommendRate}%`} iconColor="#4ade80" />
        <MetricCard icon={TrendingUp} label="Best Feature" value={featureStats?.[0]?.feature || "—"} iconColor="#a78bfa" />
      </div>

      {/* Feature satisfaction */}
      <div>
        <SectionHead title="Feature Satisfaction" />
        <div className="bg-bg-surface border border-bg-border rounded-2xl p-4">
          {featureStats?.length ? (
            <div className="space-y-2">
              {featureStats.map((f) => (
                <div key={f.feature} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-primary w-32 truncate">{f.feature}</span>
                  <div className="flex-1 h-2 bg-bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-blue/70 rounded-full"
                      style={{ width: `${(f.avgRating / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-text-muted w-16 text-right">
                    {f.avgRating ? f.avgRating.toFixed(1) : "—"} ★
                  </span>
                  <span className="text-[10px] font-mono text-text-muted w-12 text-right">({f.count})</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">No feature data yet.</p>
          )}
        </div>
      </div>

      {/* Most requested */}
      <div>
        <SectionHead title="Most Requested Features" />
        <div className="bg-bg-surface border border-bg-border rounded-2xl p-4">
          {mostRequested?.length ? (
            <ul className="space-y-1">
              {mostRequested.map((item) => (
                <li key={item.feature} className="flex justify-between items-center border-b border-bg-border/30 py-1">
                  <span className="text-sm text-text-primary">{item.feature}</span>
                  <span className="text-xs font-mono text-text-muted">{item.count} requests</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-muted">No requests yet.</p>
          )}
        </div>
      </div>

      {/* Recent feedback feed */}
      <div>
        <SectionHead title="Recent Feedback" />
        <div className="bg-bg-surface border border-bg-border rounded-2xl divide-y divide-bg-border/50 max-h-96 overflow-y-auto">
          {feedbackList?.length ? (
            feedbackList.map((fb) => (
              <div key={fb.id} className="px-4 py-3 hover:bg-bg-muted/20 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-accent-gold">
                        {fb.rating ? "★".repeat(fb.rating) : "—"}
                      </span>
                      <span className="text-xs font-mono text-text-muted bg-bg-muted px-1.5 py-0.5 rounded">
                        {fb.feature}
                      </span>
                      <span className="text-xs text-text-muted">
                        {fb.User?.name || "Anonymous"}
                      </span>
                      {fb.wouldRecommend !== null && (
                        <span className={`text-xs font-mono ${fb.wouldRecommend ? "text-accent-green" : "text-accent-red"}`}>
                          {fb.wouldRecommend ? "👍" : "👎"}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                      {fb.feedbackText?.slice(0, 180) || "No text"}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-text-muted shrink-0">
                    {relTime(fb.createdAt)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 text-center text-text-muted">No feedback yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
// ═══════════════════════════════════════════════════════════════════════════════
// USER PROFILE MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function UserProfileModal({ userId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    adminFetch(`/sessions/${userId}`)
      .then(res => setData(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  if (!userId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-bg-surface border border-bg-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-bg-surface border-b border-bg-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-base font-display font-bold text-text-primary">User Profile</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-bg-muted transition-colors">
            <X size={18} className="text-text-muted" />
          </button>
        </div>

        {loading ? (
          <LoadSpinner />
        ) : error ? (
          <div className="p-6 text-center text-accent-red">{error}</div>
        ) : data ? (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><p className="text-[10px] font-mono text-text-muted uppercase">Name</p><p className="text-sm font-medium text-text-primary">{data.user?.name || "—"}</p></div>
              <div><p className="text-[10px] font-mono text-text-muted uppercase">Email</p><p className="text-sm font-mono text-text-secondary">{data.user?.email || "—"}</p></div>
              <div><p className="text-[10px] font-mono text-text-muted uppercase">Streak</p><p className="text-sm font-mono text-accent-gold">{data.user?.streak || 0}</p></div>
              <div><p className="text-[10px] font-mono text-text-muted uppercase">Longest Streak</p><p className="text-sm font-mono text-text-secondary">{data.user?.longestStreak || 0}</p></div>
              <div><p className="text-[10px] font-mono text-text-muted uppercase">Study Hours</p><p className="text-sm font-mono text-text-secondary">{data.user?.totalStudyHours || 0}h</p></div>
              <div><p className="text-[10px] font-mono text-text-muted uppercase">Sessions</p><p className="text-sm font-mono text-text-secondary">{data.user?.totalSessions || 0}</p></div>
              <div><p className="text-[10px] font-mono text-text-muted uppercase">Days Active</p><p className="text-sm font-mono text-text-secondary">{data.user?.daysActive || 0}</p></div>
              <div><p className="text-[10px] font-mono text-text-muted uppercase">Returned Next Day</p><p className="text-sm font-mono">{data.user?.returnedNextDay ? <CheckCircle2 size={16} className="text-accent-green" /> : <X size={16} className="text-accent-red" />}</p></div>
              <div><p className="text-[10px] font-mono text-text-muted uppercase">First Feature</p><p className="text-sm font-mono text-accent-blue">{data.user?.firstFeatureUsed || "—"}</p></div>
              <div><p className="text-[10px] font-mono text-text-muted uppercase">First Feature At</p><p className="text-sm font-mono text-text-muted">{data.user?.firstFeatureAt ? relTime(data.user.firstFeatureAt) : "—"}</p></div>
              <div><p className="text-[10px] font-mono text-text-muted uppercase">Last Active</p><p className="text-sm font-mono text-text-muted">{data.user?.lastActiveAt ? relTime(data.user.lastActiveAt) : "—"}</p></div>
              <div><p className="text-[10px] font-mono text-text-muted uppercase">Joined</p><p className="text-sm font-mono text-text-muted">{data.user?.joinedAt ? relTime(data.user.joinedAt) : "—"}</p></div>
            </div>

            <div>
              <h3 className="text-xs font-mono font-semibold text-text-muted uppercase tracking-wider mb-2">Features Used</h3>
              <div className="flex flex-wrap gap-2">
                {data.user?.featuresUsed?.length ? (
                  data.user.featuresUsed.map((f) => (
                    <span key={f.name} className="text-xs bg-bg-muted border border-bg-border px-2 py-1 rounded-full flex items-center gap-1">
                      {f.name} <span className="font-mono text-text-muted">×{f.count}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-text-muted">No features used.</span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-mono font-semibold text-text-muted uppercase tracking-wider mb-2">Session Timeline ({data.sessions?.length || 0} sessions)</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {data.sessions?.map((session, idx) => (
                  <div key={idx} className="bg-bg-muted/30 border border-bg-border rounded-xl p-4">
                    <div className="flex items-center justify-between text-xs text-text-muted mb-2">
                      <span className="font-mono">{new Date(session.startedAt).toLocaleString()}</span>
                      <span>{session.durationMin}m · {session.eventCount} events</span>
                    </div>
                    <div className="space-y-1">
                      {session.events.map((ev) => {
                        const meta = EVENT_LABELS[ev.eventType] || { label: ev.eventType, icon: Activity, color: "#94a3b8" };
                        const Icon = meta.icon;
                        return (
                          <div key={ev.id} className="flex items-start gap-2 text-sm">
                            <span className="text-[10px] font-mono text-text-muted w-16 shrink-0">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${meta.color}15` }}>
                              <Icon size={10} style={{ color: meta.color }} />
                            </div>
                            <span className="text-text-secondary">{meta.label}</span>
                            {ev.featureName && <span className="text-text-muted text-xs font-mono">· {ev.featureName}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {!data.sessions?.length && <p className="text-sm text-text-muted">No sessions recorded.</p>}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN PANEL
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminPanel() {
  const [tab, setTab] = useState("overview");

  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [userPage, setUserPage] = useState(1);
  const [sortBy, setSortBy] = useState("engagement_score");
  const [sortDir, setSortDir] = useState("desc");
  const [funnel, setFunnel] = useState(null);
  const [features, setFeatures] = useState(null);
  const [events, setEvents] = useState(null);
  const [retention, setRetention] = useState(null);
  const [cohort, setCohort] = useState(null);
  const [churnList, setChurnList] = useState(null);

  const [journeyData, setJourneyData] = useState(null);
  const [segments, setSegments] = useState(null);
  const [discovery, setDiscovery] = useState(null);
  const [insights, setInsights] = useState(null);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [profileUserId, setProfileUserId] = useState(null);

  const [loading, setLoading] = useState({});
  const [toast, setToast] = useState(null);

  const notify = (msg, type = "ok") => setToast({ msg, type });
  const load = (key, val) => setLoading(prev => ({ ...prev, [key]: val }));

  // ── Fetch functions ────────────────────────────────────────────────────────
  const fetchMetrics = useCallback(async () => {
    load("metrics", true);
    try {
      const d = await adminFetch("/metrics");
      setMetrics(d.metrics);
    } catch (e) { notify(e.message, "error"); }
    finally { load("metrics", false); }
  }, []);

  const fetchUsers = useCallback(async (page = 1, sb = sortBy, sd = sortDir) => {
    load("Users", true);
    try {
      const d = await adminFetch(`/users?page=${page}&limit=20&sort=${sb}&dir=${sd}`);
      setUsers(d.users || []);
      setUsersTotal(d.total || 0);
      setUserPage(page);
    } catch (e) { notify(e.message, "error"); }
    finally { load("Users", false); }
  }, [sortBy, sortDir]);

  const fetchAnalytics = useCallback(async () => {
    load("analytics", true);
    try {
      const [fd, featd] = await Promise.all([
        adminFetch("/funnel"),
        adminFetch("/features"),
      ]);
      setFunnel(fd.funnel || []);
      setFeatures(featd.features || []);
    } catch (e) { notify(e.message, "error"); }
    finally { load("analytics", false); }
  }, []);

  const fetchActivity = useCallback(async () => {
    load("activity", true);
    try {
      const d = await adminFetch("/activity");
      setEvents(d.events || []);
    } catch (e) { notify(e.message, "error"); }
    finally { load("activity", false); }
  }, []);

  const fetchRetention = useCallback(async () => {
    load("retention", true);
    try {
      const d = await adminFetch("/retention");
      setRetention(d.retention);
      setCohort(d.cohort || []);
      setChurnList(d.churnList || []);
    } catch (e) { notify(e.message, "error"); }
    finally { load("retention", false); }
  }, []);

  const fetchJourney = useCallback(async () => {
    load("journey", true);
    try {
      const d = await adminFetch("/journey");
      setJourneyData(d);
    } catch (e) { notify(e.message, "error"); }
    finally { load("journey", false); }
  }, []);

  const fetchSegments = useCallback(async () => {
    load("segments", true);
    try {
      const d = await adminFetch("/segments");
      setSegments(d);
    } catch (e) { notify(e.message, "error"); }
    finally { load("segments", false); }
  }, []);

  const fetchDiscovery = useCallback(async () => {
    load("discovery", true);
    try {
      const d = await adminFetch("/discovery");
      setDiscovery(d);
    } catch (e) { notify(e.message, "error"); }
    finally { load("discovery", false); }
  }, []);

  const fetchInsights = useCallback(async () => {
    load("insights", true);
    try {
      const d = await adminFetch("/insights");
      setInsights(d.insights || []);
    } catch (e) { notify(e.message, "error"); }
    finally { load("insights", false); }
  }, []);
  const fetchFeedback = useCallback(async () => {
    load("feedback", true);
    try {
      const [statsRes, listRes] = await Promise.all([
        adminFetch("/feedback/admin/stats"),
        adminFetch("/feedback/admin/list?limit=20"),
      ]);
      setFeedbackStats(statsRes.stats);
      setFeedbackList(listRes.feedback || []);
    } catch (e) { notify(e.message, "error"); }
    finally { load("feedback", false); }
  }, []);
  // ── Tab-driven lazy loading ────────────────────────────────────────────────
  useEffect(() => {
    fetchMetrics();
    fetchInsights(); // always pre-fetch for overview widget
  }, [fetchMetrics, fetchInsights]);

  useEffect(() => {
    if (tab === "Users" && users.length === 0) fetchUsers(1);
    if (tab === "analytics" && funnel === null) fetchAnalytics();
    if (tab === "activity" && events === null) fetchActivity();
    if (tab === "retention" && retention === null) fetchRetention();
    if (tab === "journey" && journeyData === null) fetchJourney();
    if (tab === "segments" && segments === null) fetchSegments();
    if (tab === "discovery" && discovery === null) fetchDiscovery();
    if (tab === "feedback" && feedbackStats === null) fetchFeedback();
    // insights already loaded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // ── Sort handler ───────────────────────────────────────────────────────────
  const handleSort = useCallback((col) => {
    const newDir = sortBy === col && sortDir === "desc" ? "asc" : "desc";
    setSortBy(col);
    setSortDir(newDir);
    fetchUsers(1, col, newDir);
  }, [sortBy, sortDir, fetchUsers]);

  const handleDelete = useCallback(async (userId) => {
    try {
      await adminFetch(`/users/${userId}`, { method: "DELETE" });
      setUsers(prev => prev.filter(u => u.id !== userId));
      setUsersTotal(prev => prev - 1);
      notify("User deleted.");
    } catch (e) {
      notify(e.message, "error");
    }
  }, []);

  const openProfile = useCallback((userId) => {
    setProfileUserId(userId);
  }, []);

  const closeProfile = useCallback(() => {
    setProfileUserId(null);
  }, []);

  // ── Admin guard ────────────────────────────────────────────────────────────
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem("upsc_user") || "{}"); }
    catch { return {}; }
  })();

  if (storedUser.role !== "admin") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Shield size={32} className="text-accent-red mx-auto" />
          <p className="text-text-primary font-semibold">Admin access required</p>
          <p className="text-sm text-text-muted">Your account doesn't have admin privileges.</p>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "Users", label: "Users", icon: Users },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "retention", label: "Retention", icon: Calendar },
    { id: "journey", label: "Journey", icon: GitBranch },
    { id: "segments", label: "Segments", icon: Layers },
    { id: "discovery", label: "Discovery", icon: Compass },
    { id: "insights", label: "Insights", icon: Lightbulb },
    { id: "feedback", label: "Feedback", icon: MessageCircle }
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-red/10 border border-accent-red/20 flex items-center justify-center shrink-0">
            <Shield size={16} className="text-accent-red" />
          </div>
          <div>
            <h1 className="text-base font-display font-bold text-text-primary">Admin Panel</h1>
            <p className="text-xs text-text-muted font-mono">Logged in as {storedUser.email}</p>
          </div>
        </div>
        <button
          onClick={() => downloadFullReport({
            metrics,
            users,
            usersTotal,
            funnel,
            features,
            events,
            retention,
            cohort,
            churnList,
            journeyData,
            segments,
            discovery,
            insights,
            feedbackStats,
            feedbackList,
          })}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-gold/10 border border-accent-gold/30 text-accent-gold hover:bg-accent-gold/20 transition-colors text-sm font-mono"
        >
          <Download size={14} />
          Download Full Report
        </button>
      </div>

      <div className="flex gap-1 p-1 bg-bg-muted border border-bg-border rounded-xl mb-6 w-fit overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-mono transition-all whitespace-nowrap
              ${tab === id
                ? "bg-bg-surface text-text-primary shadow-sm border border-bg-border"
                : "text-text-muted hover:text-text-secondary"}`}>
            <Icon size={13} />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.slice(0, 3)}</span>
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <OverviewTab metrics={metrics} insights={insights} loading={loading.metrics} onRefresh={fetchMetrics} />
      )}
      {tab === "Users" && (
        <UsersTab
          users={users}
          usersTotal={usersTotal}
          userPage={userPage}
          loading={loading.users}
          onPageChange={(p) => fetchUsers(p, sortBy, sortDir)}
          onSortChange={handleSort}
          sortBy={sortBy}
          sortDir={sortDir}
          onDelete={handleDelete}
          onUserClick={openProfile}
        />
      )}
      {tab === "analytics" && (
        <AnalyticsTab funnel={funnel} features={features} loading={loading.analytics} />
      )}
      {tab === "activity" && (
        <ActivityTab events={events} loading={loading.activity} onRefresh={fetchActivity} />
      )}
      {tab === "retention" && (
        <RetentionTab retention={retention} cohort={cohort} churnList={churnList} loading={loading.retention} />
      )}
      {tab === "journey" && (
        <JourneyTab journeyData={journeyData} loading={loading.journey} />
      )}
      {tab === "segments" && (
        <SegmentsTab segments={segments} loading={loading.segments} />
      )}
      {tab === "discovery" && (
        <DiscoveryTab discovery={discovery} loading={loading.discovery} />
      )}
      {tab === "insights" && (
        <InsightsTab insights={insights} loading={loading.insights} />
      )}
      {tab === "feedback" && (
        <FeedbackTab
          stats={feedbackStats}
          feedbackList={feedbackList}
          loading={loading.feedback}
          onRefresh={fetchFeedback}
        />
      )}
      {profileUserId && (
        <UserProfileModal userId={profileUserId} onClose={closeProfile} />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}