import { useState, useEffect, useCallback } from "react";
import { BarChart2, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { SUBJECT_COLORS, SUBJECT_ICONS } from "../../hooks/useSubjectTimer";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function authHeaders() {
  const token = localStorage.getItem("upsc_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const PERIODS = [
  { id: "day",      label: "Today"     },
  { id: "week",     label: "This Week" },
  { id: "month",    label: "This Month"},
  { id: "lifetime", label: "All Time"  },
];

function SubjectRow({ row, maxSeconds, rank, grown }) {
  const color    = SUBJECT_COLORS[row.subject] || "#94a3b8";
  const icon     = SUBJECT_ICONS[row.subject]  || "📚";
  const barWidth = maxSeconds > 0 ? (row.total_seconds / maxSeconds) * 100 : 0;
  return (
    <div className="flex items-center gap-2 sm:gap-3 py-2.5 border-b border-bg-border/40 last:border-0">
      <span className="text-[10px] font-mono text-text-muted w-4 shrink-0 text-center">{rank}</span>
      <div className="flex items-center gap-1.5 w-24 sm:w-32 shrink-0">
        <span className="text-sm leading-none">{icon}</span>
        <span className="text-xs text-text-secondary truncate">{row.subject}</span>
      </div>
      <div className="flex-1 h-2 bg-bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: grown ? `${barWidth}%` : "0%",
            background: `linear-gradient(90deg, ${color}bb, ${color})`,
            boxShadow: barWidth > 0 ? `0 0 6px ${color}44` : "none",
            transition: `width 800ms cubic-bezier(0.16,1,0.3,1) ${rank * 60}ms`,
          }}
        />
      </div>
      <div className="text-right shrink-0 space-y-0.5">
        <p className="text-xs font-mono font-bold" style={{ color }}>{row.display}</p>
        <p className="text-[9px] font-mono text-text-muted">{row.session_count} session{row.session_count !== 1 ? "s" : ""}</p>
      </div>
      <span className="text-[10px] font-mono text-text-muted w-8 text-right shrink-0">{row.percentage}%</span>
    </div>
  );
}

function InsightPill({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl p-3" style={{ background: `${color}10`, border: `0.5px solid ${color}25` }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
        <Icon size={14} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-text-primary truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

export default function SubjectAnalyticsDashboard({ userId, isLoggedIn = false }) {
  const [period, setPeriod] = useState("day");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [grown, setGrown] = useState(false);

  const fetchData = useCallback(async (p = "day") => {
    if (!isLoggedIn) return;
    setLoading(true);
    setGrown(false);
    try {
      const res = await fetch(`${BASE}/subject-sessions/analytics?period=${p}`, { headers: authHeaders() });
      const json = await res.json();
      console.log("📊 SubjectAnalyticsDashboard response:", json);
      if (json.success) {
        setData(json);
        setTimeout(() => setGrown(true), 80);
      }
    } catch (err) {
      console.error("❌ Analytics dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => { fetchData("day"); }, [fetchData]);

  const handlePeriod = (p) => { setPeriod(p); fetchData(p); };

  if (!isLoggedIn) {
    return (
      <div className="glass-panel p-4 text-center">
        <BarChart2 size={20} className="text-text-muted mx-auto mb-2" />
        <p className="text-sm font-mono text-text-muted">Sign in to see your subject study analytics.</p>
      </div>
    );
  }

  const dist = data?.distribution || [];
  const insights = data?.insights || {};
  const maxSeconds = dist[0]?.total_seconds || 1;
  const totalHours = data?.total_hours || 0;
  const totalSessions = data?.total_sessions || 0;
  const weekTop = insights?.this_week?.[0] || null;
  const monthTop = insights?.this_month?.[0] || null;

  return (
    <div className="glass-panel p-3 sm:p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BarChart2 size={14} className="text-accent-gold shrink-0" />
          <h3 className="text-sm font-display font-semibold text-text-primary">Subject Study Hours</h3>
        </div>
        <button onClick={() => fetchData(period)} disabled={loading} className="p-1.5 rounded-lg hover:bg-bg-muted transition-colors" title="Refresh">
          <RefreshCw size={11} className={`text-text-muted ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="flex bg-bg-muted rounded-lg p-0.5 gap-0.5">
        {PERIODS.map(({ id, label }) => (
          <button key={id} onClick={() => handlePeriod(id)} className={`flex-1 py-1.5 px-1 rounded-md text-[10px] sm:text-[11px] font-mono transition-all ${period === id ? "bg-accent-gold/20 text-accent-gold border border-accent-gold/30" : "text-text-muted hover:text-text-secondary"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Total", val: `${totalHours}h`, color: "var(--accent-gold)" },
          { label: "Sessions", val: totalSessions, color: "#60a5fa" },
          { label: "Subjects", val: dist.length, color: "#4ade80" },
        ].map(({ label, val, color }) => (
          <div key={label} className="rounded-lg p-2 text-center" style={{ background: `${color}0e`, border: `0.5px solid ${color}25` }}>
            <p className="text-[9px] font-mono text-text-muted uppercase">{label}</p>
            <p className="text-base font-display font-bold text-text-primary">{val}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2.5 animate-pulse">
          {[80, 60, 40, 25, 15].map((w, i) => <div key={i} className="h-8 bg-bg-muted rounded" style={{ width: `${w}%` }} />)}
        </div>
      ) : dist.length === 0 ? (
        <div className="py-8 text-center">
          <BarChart2 size={24} className="text-text-muted mx-auto mb-3" />
          <p className="text-sm font-mono text-text-muted">No study data for this period.</p>
          <p className="text-xs text-text-muted mt-1">Start a timer session to see your subject breakdown.</p>
        </div>
      ) : (
        <div>
          {dist.map((row, i) => <SubjectRow key={row.subject} row={row} maxSeconds={maxSeconds} rank={i + 1} grown={grown} />)}
        </div>
      )}

      {(insights.most_studied || insights.least_studied) && (
        <div className="pt-2 border-t border-bg-border/50 space-y-2">
          <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Subject Insights</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {insights.most_studied && (
              <InsightPill icon={TrendingUp} label="Most Studied" value={`${SUBJECT_ICONS[insights.most_studied.subject] || ""} ${insights.most_studied.subject} · ${insights.most_studied.display}`} color={SUBJECT_COLORS[insights.most_studied.subject] || "#4ade80"} />
            )}
            {insights.least_studied && (
              <InsightPill icon={TrendingDown} label="Least Studied" value={`${SUBJECT_ICONS[insights.least_studied.subject] || ""} ${insights.least_studied.subject} · ${insights.least_studied.display}`} color={SUBJECT_COLORS[insights.least_studied.subject] || "#f87171"} />
            )}
          </div>
          {(weekTop || monthTop) && (
            <div className="grid grid-cols-2 gap-2">
              {weekTop && (() => {
                const c = SUBJECT_COLORS[weekTop.subject] || "#C9A84C";
                return (
                  <div className="rounded-xl p-2.5 space-y-0.5" style={{ background: `${c}0a`, border: `0.5px solid ${c}20` }}>
                    <p className="text-[9px] font-mono text-text-muted uppercase">This Week Top</p>
                    <p className="text-xs font-medium text-text-primary">{SUBJECT_ICONS[weekTop.subject]} {weekTop.subject}</p>
                    <p className="text-xs font-mono font-bold" style={{ color: c }}>{weekTop.display}</p>
                  </div>
                );
              })()}
              {monthTop && (() => {
                const c = SUBJECT_COLORS[monthTop.subject] || "#C9A84C";
                return (
                  <div className="rounded-xl p-2.5 space-y-0.5" style={{ background: `${c}0a`, border: `0.5px solid ${c}20` }}>
                    <p className="text-[9px] font-mono text-text-muted uppercase">This Month Top</p>
                    <p className="text-xs font-medium text-text-primary">{SUBJECT_ICONS[monthTop.subject]} {monthTop.subject}</p>
                    <p className="text-xs font-mono font-bold" style={{ color: c }}>{monthTop.display}</p>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

    </div>
  );
}