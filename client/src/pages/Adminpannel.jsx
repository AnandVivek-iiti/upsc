import { useState, useEffect, useCallback, useRef } from "react";
import {
  Users, BarChart2, Shield, RefreshCw,
  ChevronLeft, ChevronRight, Eye, EyeOff, Activity,
  AlertCircle, CheckCircle2, Loader2, TrendingUp, TrendingDown,
  Flame, Clock, BookOpen, Brain, FileText, Target,
  ArrowUp, ArrowDown, Minus, X, Calendar, UserCheck,
} from "lucide-react";

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
  timer_start:     { label: "started study timer", icon: Clock, color: "#4ade80" },
  mentor_open:     { label: "opened AI Mentor", icon: Brain, color: "#a78bfa" },
  answer_evaluated:{ label: "evaluated an answer", icon: FileText, color: "#f59e0b" },
  notes_audited:   { label: "audited notes", icon: BookOpen, color: "#34d399" },
  test_attempted:  { label: "attempted a mock test", icon: Target, color: "#f97316" },
  pyq_used:        { label: "practiced PYQs", icon: Activity, color: "#22d3ee" },
  syllabus_tracked:{ label: "updated syllabus", icon: CheckCircle2, color: "#4ade80" },
  day_return:      { label: "returned to study", icon: Flame, color: "#fb923c" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════════════════════════════
function OverviewTab({ metrics, loading, onRefresh }) {
  if (loading && !metrics) return <LoadSpinner />;
  if (!metrics) return <p className="text-sm text-text-muted py-8 text-center">No metrics available.</p>;

  const { users = {}, engagement = {}, activity = {}, trends = {} } = metrics;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHead title="User Growth" />
        <button onClick={onRefresh} disabled={loading}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary font-mono transition-colors">
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Row 1 — User Growth */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <MetricCard icon={Users}      label="Total Users"    value={users.total}        iconColor="#60a5fa" delta={trends.total_delta} />
        <MetricCard icon={UserCheck}  label="Today Signups"  value={users.todaySignups} iconColor="#4ade80" delta={trends.signup_delta} />
        <MetricCard icon={Activity}   label="DAU"            value={users.dau}          iconColor="#f59e0b" delta={trends.dau_delta} accent />
        <MetricCard icon={Calendar}   label="WAU"            value={users.wau}          iconColor="#a78bfa" />
        <MetricCard icon={TrendingUp} label="MAU"            value={users.mau}          iconColor="#f97316" />
      </div>

      {/* Row 2 — Feature Adoption Funnel Summary */}
      <div>
        <SectionHead title="Feature Adoption" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard icon={Users}       label="Registered"     value={users.total}              iconColor="#60a5fa" />
          <MetricCard icon={Activity}    label="Used Any Feature" value={users.usedAnyFeature}   iconColor="#4ade80"
            sub={users.total ? `${Math.round((users.usedAnyFeature / users.total) * 100)}% of users` : undefined} />
          <MetricCard icon={TrendingUp}  label="Used 3+ Features" value={users.used3PlusFeatures} iconColor="#f59e0b"
            sub={users.total ? `${Math.round((users.used3PlusFeatures / users.total) * 100)}% of users` : undefined} />
          <MetricCard icon={Target}      label="Used 5+ Features" value={users.used5PlusFeatures} iconColor="#a78bfa" accent
            sub={users.total ? `${Math.round((users.used5PlusFeatures / users.total) * 100)}% of users` : undefined} />
        </div>
      </div>

      {/* Row 3 — Engagement */}
      <div>
        <SectionHead title="Engagement" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <MetricCard icon={Calendar}   label="Retention D1"     value={engagement.retentionD1 !== undefined ? `${engagement.retentionD1}%` : "—"} iconColor="#4ade80" />
          <MetricCard icon={Calendar}   label="Retention D7"     value={engagement.retentionD7 !== undefined ? `${engagement.retentionD7}%` : "—"} iconColor="#f59e0b" />
          <MetricCard icon={Clock}      label="Avg Study/Day"    value={engagement.avgStudyHours !== undefined ? `${engagement.avgStudyHours}h` : "—"} iconColor="#60a5fa" />
          <MetricCard icon={Clock}      label="Total Study Hrs"  value={fmtNum(engagement.totalStudyHours)} iconColor="#a78bfa" />
          <MetricCard icon={Flame}      label="Active Streaks"   value={users.activeStreakUsers} iconColor="#fb923c" />
        </div>
      </div>

      {/* Row 4 — Activity Counts */}
      <div>
        <SectionHead title="Activity" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard icon={FileText}  label="Answers Evaluated"   value={activity.answersEvaluated}     iconColor="#f59e0b" />
          <MetricCard icon={BookOpen}  label="Notes Audited"        value={activity.notesAudited}         iconColor="#34d399" />
          <MetricCard icon={Target}    label="Tests Attempted"      value={activity.testsAttempted}       iconColor="#f97316" />
          <MetricCard icon={Brain}     label="AI Conversations"     value={activity.aiMentorConversations} iconColor="#a78bfa" accent />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// USERS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function UsersTab({ users, usersTotal, userPage, loading, onPageChange, onSortChange, sortBy, sortDir }) {
  const [showEmails, setShowEmails] = useState(false);

  const COLS = [
    { key: "name",             label: "Name"            },
    { key: "email",            label: "Email"           },
    { key: "streak",           label: "Streak 🔥"       },
    { key: "longest_streak",   label: "Best Streak"     },
    { key: "total_study_hours",label: "Study Hrs"       },
    { key: "answers_evaluated",label: "Answers"         },
    { key: "notes_audited",    label: "Notes"           },
    { key: "tests_attempted",  label: "Tests"           },
    { key: "days_active",      label: "Days Active"     },
    { key: "features_used",    label: "Features"        },
    { key: "last_active",      label: "Last Active"     },
    { key: "registration_date",label: "Joined"          },
    { key: "engagement_score", label: "Score"           },
  ];

  const maskEmail = (email) => {
    if (!email) return "—";
    return email.replace(/(.{2}).*(@.*)/, "$1••••$2");
  };

  const totalPages = Math.ceil(usersTotal / 20);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <SectionHead title={`Users (${usersTotal})`} />
        <button onClick={() => setShowEmails(v => !v)}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary font-mono transition-colors">
          {showEmails ? <EyeOff size={12} /> : <Eye size={12} />}
          {showEmails ? "Mask emails" : "Show emails"}
        </button>
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
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} className={`border-b border-bg-border/40 hover:bg-bg-muted/30 transition-colors
                    ${i % 2 === 0 ? "" : "bg-bg-muted/10"}`}>
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
// ANALYTICS TAB — Funnel + Feature Usage
// ═══════════════════════════════════════════════════════════════════════════════
function AnalyticsTab({ funnel, features, loading }) {
  if (loading && !funnel) return <LoadSpinner />;

  return (
    <div className="space-y-8">
      {/* Activation Funnel */}
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

      {/* Feature Usage */}
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
        <button onClick={onRefresh} disabled={loading}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary font-mono transition-colors">
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          Auto-refreshes every 60s
        </button>
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
      {/* D1 / D7 / D30 summary */}
      <div>
        <SectionHead title="Retention Rates" />
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Day 1", value: retention?.d1, sub: "Returned day after signup" },
            { label: "Day 7", value: retention?.d7, sub: "Returned within first week" },
            { label: "Day 30",value: retention?.d30,sub: "Returned within first month" },
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

      {/* Weekly Cohort Table */}
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

      {/* Churn Risk List */}
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
// MAIN ADMIN PANEL
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminPanel() {
  const [tab, setTab] = useState("overview");

  // Data state
  const [metrics,    setMetrics]    = useState(null);
  const [users,      setUsers]      = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [userPage,   setUserPage]   = useState(1);
  const [sortBy,     setSortBy]     = useState("engagement_score");
  const [sortDir,    setSortDir]    = useState("desc");
  const [funnel,     setFunnel]     = useState(null);
  const [features,   setFeatures]   = useState(null);
  const [events,     setEvents]     = useState(null);
  const [retention,  setRetention]  = useState(null);
  const [cohort,     setCohort]     = useState(null);
  const [churnList,  setChurnList]  = useState(null);

  // Loading state per section
  const [loading, setLoading] = useState({});
  const [toast,   setToast]   = useState(null);

  const notify = (msg, type = "ok") => setToast({ msg, type });
  const load   = (key, val)        => setLoading(prev => ({ ...prev, [key]: val }));

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

  // ── Tab-driven lazy loading ────────────────────────────────────────────────
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    if (tab === "Users"     && users.length === 0)     fetchUsers(1);
    if (tab === "analytics" && funnel === null)         fetchAnalytics();
    if (tab === "activity"  && events === null)         fetchActivity();
    if (tab === "retention" && retention === null)      fetchRetention();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // ── Sort handler ───────────────────────────────────────────────────────────
  const handleSort = useCallback((col) => {
    const newDir = sortBy === col && sortDir === "desc" ? "asc" : "desc";
    setSortBy(col);
    setSortDir(newDir);
    fetchUsers(1, col, newDir);
  }, [sortBy, sortDir, fetchUsers]);

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
    { id: "overview",  label: "Overview",  icon: BarChart2  },
    { id: "Users",     label: "Users",     icon: Users      },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "activity",  label: "Activity",  icon: Activity   },
    { id: "retention", label: "Retention", icon: Calendar   },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-accent-red/10 border border-accent-red/20 flex items-center justify-center shrink-0">
          <Shield size={16} className="text-accent-red" />
        </div>
        <div>
          <h1 className="text-base font-display font-bold text-text-primary">Admin Panel</h1>
          <p className="text-xs text-text-muted font-mono">Logged in as {storedUser.email}</p>
        </div>
      </div>

      {/* Tab bar */}
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

      {/* Tab content */}
      {tab === "overview" && (
        <OverviewTab metrics={metrics} loading={loading.metrics} onRefresh={fetchMetrics} />
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
        />
      )}

      {tab === "analytics" && (
        <AnalyticsTab
          funnel={funnel}
          features={features}
          loading={loading.analytics}
        />
      )}

      {tab === "activity" && (
        <ActivityTab
          events={events}
          loading={loading.activity}
          onRefresh={fetchActivity}
        />
      )}

      {tab === "retention" && (
        <RetentionTab
          retention={retention}
          cohort={cohort}
          churnList={churnList}
          loading={loading.retention}
        />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}