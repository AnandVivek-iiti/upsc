import { useState, useEffect, useCallback } from "react";
import {
  Users, BarChart2, Zap, Shield, Trash2, Plus, RefreshCw,
  ChevronLeft, ChevronRight, Eye, EyeOff, Activity,
  AlertCircle, CheckCircle2, Loader2, TrendingUp, Calendar,
  Globe, ToggleLeft, ToggleRight, X,
} from "lucide-react";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ─── tiny fetch helper (reads token from localStorage) ───────────────────────
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

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = "accent-gold" }) {
  return (
    <div className="bg-bg-surface border border-bg-border rounded-2xl p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl bg-${color}/10 border border-${color}/20 flex items-center justify-center shrink-0`}>
        <Icon size={18} className={`text-${color}`} />
      </div>
      <div>
        <p className="text-xs font-mono text-text-muted uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-display font-bold text-text-primary mt-0.5">{value ?? "—"}</p>
        {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHead({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-mono font-semibold text-text-secondary uppercase tracking-widest">{title}</h2>
      {action}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-mono
      ${type === "error" ? "bg-accent-red/10 border border-accent-red/30 text-accent-red"
        : "bg-accent-green/10 border border-accent-green/30 text-accent-green"}`}>
      {type === "error" ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
      {msg}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X size={12} /></button>
    </div>
  );
}

// ─── Feature modal ────────────────────────────────────────────────────────────
function FeatureModal({ feature, onClose, onSave }) {
  const [form, setForm] = useState(
    feature ?? { featureName: "", description: "", path: "", isActive: true }
  );
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const isEdit = !!feature?.id;

  const handleSave = async () => {
    if (!form.featureName.trim() || !form.description.trim()) {
      setErr("Name and description are required."); return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await adminFetch(`/features/${feature.id}`, { method: "PATCH", body: JSON.stringify(form) });
      } else {
        await adminFetch("/features", { method: "POST", body: JSON.stringify(form) });
      }
      onSave();
      onClose();
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-bg-surface border border-bg-border rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-semibold text-text-primary">{isEdit ? "Edit Feature" : "New Feature"}</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary"><X size={16} /></button>
        </div>

        {err && (
          <p className="flex items-center gap-1.5 text-xs text-accent-red font-mono mb-4">
            <AlertCircle size={12} /> {err}
          </p>
        )}

        <div className="space-y-4">
          {[
            { label: "Feature Name", key: "featureName", placeholder: "e.g. AI Mentor Chat" },
            { label: "Description",  key: "description",  placeholder: "What this feature does" },
            { label: "Path (optional)", key: "path",      placeholder: "/ai-workplace" },
          ].map(({ label, key, placeholder }) => (
            <div key={key} className="space-y-1">
              <label className="text-[11px] font-mono text-text-muted uppercase tracking-wider">{label}</label>
              <input
                value={form[key] || ""}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full bg-bg-muted border border-bg-border rounded-xl px-4 py-2.5 text-sm text-text-primary
                  placeholder:text-text-muted/40 focus:outline-none focus:ring-2 focus:ring-accent-gold/20 focus:border-accent-gold/50"
              />
            </div>
          ))}

          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-text-secondary">Active</span>
            <button onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
              className={`transition-colors ${form.isActive ? "text-accent-green" : "text-text-muted"}`}>
              {form.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
            </button>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-bg-border text-sm text-text-secondary hover:bg-bg-muted transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-accent-gold/10 border border-accent-gold/30 text-sm text-accent-gold hover:bg-accent-gold/20 transition-colors flex items-center justify-center gap-2">
            {loading && <Loader2 size={13} className="animate-spin" />}
            {isEdit ? "Save Changes" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main AdminPanel ──────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [tab, setTab]           = useState("overview");
  const [metrics, setMetrics]   = useState(null);
  const [users, setUsers]       = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [userPage, setUserPage] = useState(1);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading]   = useState({});
  const [toast, setToast]       = useState(null);
  const [modalFeature, setModalFeature] = useState(undefined); // undefined=closed, null=new, obj=edit
  const [showPasswords, setShowPasswords] = useState(false);

  const notify = (msg, type = "ok") => setToast({ msg, type });
  const load   = (key, val) => setLoading(prev => ({ ...prev, [key]: val }));

  // ── fetch helpers ─────────────────────────────────────────────────────────
  const fetchMetrics = useCallback(async () => {
    load("metrics", true);
    try {
      const d = await adminFetch("/metrics");
      setMetrics(d.metrics);
    } catch (e) { notify(e.message, "error"); }
    finally { load("metrics", false); }
  }, []);

  const fetchUsers = useCallback(async (page = 1) => {
    load("users", true);
    try {
      const d = await adminFetch(`/users?page=${page}&limit=20`);
      setUsers(d.users);
      setUsersTotal(d.total);
      setUserPage(page);
    } catch (e) { notify(e.message, "error"); }
    finally { load("users", false); }
  }, []);

  const fetchFeatures = useCallback(async () => {
    load("features", true);
    try {
      const d = await adminFetch("/features");
      setFeatures(d.features);
    } catch (e) { notify(e.message, "error"); }
    finally { load("features", false); }
  }, []);

  const deleteFeature = async (id, name) => {
    if (!confirm(`Delete feature "${name}"?`)) return;
    try {
      await adminFetch(`/features/${id}`, { method: "DELETE" });
      notify(`"${name}" deleted.`);
      fetchFeatures();
    } catch (e) { notify(e.message, "error"); }
  };

  const toggleFeature = async (f) => {
    try {
      await adminFetch(`/features/${f.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !f.isActive }),
      });
      notify(`"${f.featureName}" ${!f.isActive ? "enabled" : "disabled"}.`);
      fetchFeatures();
    } catch (e) { notify(e.message, "error"); }
  };

  // ── initial loads ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchMetrics();
    fetchUsers(1);
    fetchFeatures();
  }, [fetchMetrics, fetchUsers, fetchFeatures]);

  // ── guard: only admin can see this ───────────────────────────────────────
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem("upsc_user") || "{}"); } catch { return {}; }
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
    { id: "overview", label: "Overview",  icon: BarChart2 },
    { id: "users",    label: "Users",     icon: Users },
    { id: "features", label: "Features",  icon: Zap },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-accent-red/10 border border-accent-red/20 flex items-center justify-center">
          <Shield size={16} className="text-accent-red" />
        </div>
        <div>
          <h1 className="text-base font-display font-bold text-text-primary">Admin Panel</h1>
          <p className="text-xs text-text-muted font-mono">Logged in as {storedUser.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-bg-muted border border-bg-border rounded-xl mb-6 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono transition-all
              ${tab === id ? "bg-bg-surface text-text-primary shadow-sm border border-bg-border"
                           : "text-text-muted hover:text-text-secondary"}`}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ──────────────────────────────────────────────────── */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <SectionHead title="Platform Metrics" />
            <button onClick={fetchMetrics} disabled={loading.metrics}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary font-mono transition-colors">
              <RefreshCw size={12} className={loading.metrics ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {loading.metrics && !metrics ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={20} className="animate-spin text-accent-gold" />
            </div>
          ) : metrics ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users}      label="Total Users"      value={metrics.users?.total}           color="accent-blue" />
                <StatCard icon={Activity}   label="Active (7 days)"  value={metrics.users?.activeLastWeek}  color="accent-green" />
                <StatCard icon={TrendingUp} label="Total Evaluations" value={metrics.ai?.totalEvaluations}  color="accent-gold" />
                <StatCard icon={Shield}     label="Admins"           value={metrics.users?.admins}          color="accent-red" />
              </div>

              {/* Traffic */}
              {metrics.traffic?.totalHits > 0 && (
                <div className="bg-bg-surface border border-bg-border rounded-2xl p-5">
                  <SectionHead title="Traffic (30 days)" />
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-text-muted font-mono">Total Hits</p>
                      <p className="text-xl font-bold text-text-primary">{metrics.traffic.totalHits.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted font-mono">Unique Visitors</p>
                      <p className="text-xl font-bold text-text-primary">{metrics.traffic.totalDistinctVisitors.toLocaleString()}</p>
                    </div>
                  </div>
                  {/* Mini bar chart */}
                  {metrics.traffic.dailyBreakdown?.length > 0 && (
                    <div className="flex items-end gap-1 h-16">
                      {metrics.traffic.dailyBreakdown.slice(-14).map((d, i) => {
                        const max = Math.max(...metrics.traffic.dailyBreakdown.map(x => x.hits));
                        const h = max > 0 ? Math.round((d.hits / max) * 100) : 0;
                        return (
                          <div key={i} title={`${d.date}: ${d.hits} hits`}
                            className="flex-1 bg-accent-blue/30 hover:bg-accent-blue/60 rounded-sm transition-colors cursor-default"
                            style={{ height: `${Math.max(h, 4)}%` }} />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-text-muted">No metrics available.</p>
          )}
        </div>
      )}

      {/* ── USERS TAB ─────────────────────────────────────────────────────── */}
      {tab === "users" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <SectionHead title={`Users (${usersTotal})`} />
            <button onClick={() => setShowPasswords(v => !v)}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary font-mono">
              {showPasswords ? <EyeOff size={12} /> : <Eye size={12} />}
              {showPasswords ? "Hide emails" : "Show emails"}
            </button>
          </div>

          {loading.users && users.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={20} className="animate-spin text-accent-gold" />
            </div>
          ) : (
            <div className="bg-bg-surface border border-bg-border rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-bg-border">
                      {["Name", "Email", "Role", "Streak", "Target Year", "Joined"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[11px] font-mono text-text-muted uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={u.id} className={`border-b border-bg-border/50 hover:bg-bg-muted/50 transition-colors
                        ${i % 2 === 0 ? "" : "bg-bg-muted/20"}`}>
                        <td className="px-4 py-3 font-medium text-text-primary">{u.name}</td>
                        <td className="px-4 py-3 text-text-secondary font-mono text-xs">
                          {showPasswords ? u.email : u.email.replace(/(.{2}).*(@.*)/, "$1••••$2")}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono
                            ${u.role === "admin"
                              ? "bg-accent-red/10 text-accent-red border border-accent-red/20"
                              : "bg-accent-blue/10 text-accent-blue border border-accent-blue/20"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          {u.streak > 0 ? <span className="text-accent-gold font-mono">{u.streak}🔥</span> : <span className="text-text-muted">—</span>}
                        </td>
                        <td className="px-4 py-3 text-text-secondary font-mono text-xs">{u.target_year || "—"}</td>
                        <td className="px-4 py-3 text-text-muted font-mono text-xs">
                          {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-text-muted text-sm">No users found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {usersTotal > 20 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-bg-border">
                  <p className="text-xs text-text-muted font-mono">
                    Page {userPage} of {Math.ceil(usersTotal / 20)}
                  </p>
                  <div className="flex gap-2">
                    <button disabled={userPage <= 1} onClick={() => fetchUsers(userPage - 1)}
                      className="p-1.5 rounded-lg border border-bg-border disabled:opacity-40 hover:bg-bg-muted transition-colors">
                      <ChevronLeft size={14} className="text-text-secondary" />
                    </button>
                    <button disabled={userPage >= Math.ceil(usersTotal / 20)} onClick={() => fetchUsers(userPage + 1)}
                      className="p-1.5 rounded-lg border border-bg-border disabled:opacity-40 hover:bg-bg-muted transition-colors">
                      <ChevronRight size={14} className="text-text-secondary" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── FEATURES TAB ──────────────────────────────────────────────────── */}
      {tab === "features" && (
        <div>
          <SectionHead title="Feature Flags"
            action={
              <button onClick={() => setModalFeature(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-gold/10 border border-accent-gold/30
                  text-xs font-mono text-accent-gold hover:bg-accent-gold/20 transition-colors">
                <Plus size={12} /> New Feature
              </button>
            }
          />

          {loading.features && features.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={20} className="animate-spin text-accent-gold" />
            </div>
          ) : (
            <div className="space-y-3">
              {features.map(f => (
                <div key={f.id} className="bg-bg-surface border border-bg-border rounded-2xl p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-medium text-text-primary text-sm">{f.featureName}</p>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono
                        ${f.isActive ? "bg-accent-green/10 text-accent-green" : "bg-bg-muted text-text-muted"}`}>
                        {f.isActive ? "active" : "off"}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted truncate">{f.description}</p>
                    {f.path && <p className="text-[11px] font-mono text-accent-blue mt-0.5">{f.path}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => toggleFeature(f)}
                      className={`transition-colors ${f.isActive ? "text-accent-green hover:text-text-muted" : "text-text-muted hover:text-accent-green"}`}>
                      {f.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                    <button onClick={() => setModalFeature(f)}
                      className="p-1.5 rounded-lg hover:bg-bg-muted text-text-muted hover:text-text-primary transition-colors text-xs font-mono">
                      Edit
                    </button>
                    <button onClick={() => deleteFeature(f.id, f.featureName)}
                      className="p-1.5 rounded-lg hover:bg-accent-red/10 text-text-muted hover:text-accent-red transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {features.length === 0 && (
                <div className="text-center py-12 text-text-muted text-sm">
                  No features yet. Create one to get started.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modalFeature !== undefined && (
        <FeatureModal
          feature={modalFeature}
          onClose={() => setModalFeature(undefined)}
          onSave={() => { fetchFeatures(); notify(modalFeature ? "Feature updated." : "Feature created."); }}
        />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}