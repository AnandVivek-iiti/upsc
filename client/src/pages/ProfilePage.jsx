import { useState, useEffect, useCallback } from "react";
import {
  User, Mail, Calendar, Clock, Target, Flame, Trophy,
  Edit3, Save, X, Loader2, CheckCircle2, AlertCircle,
  TrendingUp, Shield, KeyRound, Eye, EyeOff, ArrowLeft,
  BookOpen, Zap,
} from "lucide-react";

// ─── Avatar initials ──────────────────────────────────────────────────────────
export function getInitials(name = "") {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ─── AvatarCircle — exported so Sidebar / topbar can reuse it ────────────────
export function AvatarCircle({ name = "", size = "md", onClick, className = "" }) {
  const initials = getInitials(name);
  const sizeMap = {
    sm: "w-8  h-8  text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
    xl: "w-20 h-20 text-2xl",
  };
  return (
    <button
      onClick={onClick}
      title={name || "Profile"}
      aria-label="Open profile"
      className={`
        ${sizeMap[size]} rounded-full flex items-center justify-center
        font-bold shrink-0 select-none transition-all duration-200
        hover:ring-2 hover:ring-offset-1 hover:ring-amber-400/60 active:scale-95
        ${className}
      `}
      style={{
        background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        color:      "#1a1a1a",
        border:     "2px solid rgba(245,158,11,0.35)",
        boxShadow:  "0 2px 10px rgba(245,158,11,0.3)",
        fontFamily: "inherit",
      }}
    >
      {initials}
    </button>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE         = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => 2025 + i);
const HOUR_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20];

function authHeaders(token) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-bg-border last:border-0">
      <span className="w-7 h-7 rounded-lg bg-bg-muted flex items-center justify-center shrink-0"
        style={{ color: accent || "var(--text-muted,#888)" }}>
        <Icon size={13} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted">{label}</p>
        <p className="text-sm text-text-primary truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

function FieldInput({ label, type = "text", value, onChange, error, icon: Icon, hint }) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-text-muted">
        {Icon && <Icon size={10} />}{label}
      </label>
      <div className="relative">
        <input
          type={isPass ? (show ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          className="w-full rounded-xl px-3 py-2.5 text-sm bg-bg-muted text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-gold/40 transition-all"
          style={{ border: `1px solid ${error ? "rgba(239,68,68,0.5)" : "var(--bg-border,#333)"}`, paddingRight: isPass ? "2.5rem" : undefined }}
        />
        {isPass && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
      {hint  && !error && <p className="text-[11px] font-mono text-text-muted">{hint}</p>}
      {error && <p className="flex items-center gap-1 text-[11px] font-mono text-red-400"><AlertCircle size={10} />{error}</p>}
    </div>
  );
}

function SelectField({ label, icon: Icon, value, onChange, children }) {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-text-muted">
        {Icon && <Icon size={10} />}{label}
      </label>
      <select value={value} onChange={onChange}
        className="w-full rounded-xl px-3 py-2.5 text-sm bg-bg-muted text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-gold/40 transition-all"
        style={{ border: "1px solid var(--bg-border,#333)" }}>
        {children}
      </select>
    </div>
  );
}

function StatPill({ icon: Icon, label, value, color }) {
  return (
    <div className="glass-panel p-3 flex flex-col items-center gap-1 text-center">
      <Icon size={15} style={{ color }} />
      <span className="text-base font-bold text-text-primary">{value}</span>
      <span className="text-[10px] font-mono uppercase tracking-wide text-text-muted">{label}</span>
    </div>
  );
}

function Toast({ msg }) {
  if (!msg) return null;
  const ok = msg === "saved";
  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-mono ${
      ok ? "bg-green-500/10 border-green-500/30 text-green-400"
         : "bg-red-500/10 border-red-500/30 text-red-400"
    }`}>
      {ok
        ? <><CheckCircle2 size={12} /> Profile updated successfully.</>
        : <><AlertCircle  size={12} /> {msg.replace(/^error:\s*/i, "")}</>
      }
    </div>
  );
}

// ─── ProfilePage ──────────────────────────────────────────────────────────────
export default function ProfilePage({ token, onBack, onProfileUpdate }) {
  const [profile,   setProfile]   = useState(null);
  const [fetching,  setFetching]  = useState(true);
  const [fetchErr,  setFetchErr]  = useState("");
  const [section,   setSection]   = useState("view"); // "view" | "edit" | "password"
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState("");
  const [fieldErrs, setFieldErrs] = useState({});

  const [form, setForm] = useState({
    name: "", target_year: 2026, daily_target_hours: 8, examDate: "",
  });
  const [passForm, setPassForm] = useState({ current: "", next: "", confirm: "" });

  // ── Fetch profile from /auth/me ───────────────────────────────────────────
  const fetchProfile = useCallback(() => {
    if (!token) return;
    setFetching(true);
    fetch(`${BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (!d.success) throw new Error(d.error || "Failed to load profile");
        setProfile(d.user);
        const p = d.user?.profile || {};
        setForm({
          name:               d.user?.name || "",
          target_year:        p.target_year        || 2026,
          daily_target_hours: p.daily_target_hours || 8,
          examDate:           p.examDate ? new Date(p.examDate).toISOString().split("T")[0] : "",
        });
      })
      .catch(e => setFetchErr(e.message))
      .finally(() => setFetching(false));
  }, [token]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // ── Validation ────────────────────────────────────────────────────────────
  const validateProfile = () => {
    const e = {};
    if (!form.name.trim())                e.name     = "Name is required.";
    else if (form.name.trim().length > 80) e.name    = "Max 80 characters.";
    if (form.examDate && isNaN(new Date(form.examDate).getTime())) e.examDate = "Invalid date.";
    return e;
  };
  const validatePass = () => {
    const e = {};
    if (!passForm.current)                        e.current = "Enter your current password.";
    if (!passForm.next || passForm.next.length < 8) e.next  = "Minimum 8 characters.";
    if (passForm.next !== passForm.confirm)        e.confirm = "Passwords do not match.";
    return e;
  };

  // ── Save profile — hits PATCH /dashboard/profile (our new endpoint) ───────
  // Also hits PATCH /auth/profile for name (if your auth controller supports it)
  // We do two calls: one for name via auth, one for study settings via dashboard
  const saveProfile = async () => {
    const errs = validateProfile();
    if (Object.keys(errs).length) { setFieldErrs(errs); return; }
    setFieldErrs({});
    setSaving(true);
    try {
      // 1. Update study settings (daily_target_hours, target_year, exam_date)
      const dashRes  = await fetch(`${BASE}/dashboard/profile`, {
        method:  "PATCH",
        headers: authHeaders(token),
        body:    JSON.stringify({
          daily_target_hours: Number(form.daily_target_hours),
          target_year:        Number(form.target_year),
          exam_date:          form.examDate || null,
        }),
      });
      const dashData = await dashRes.json();
      if (!dashRes.ok || !dashData.success) throw new Error(dashData.error || "Save failed.");

      // 2. Update name via auth endpoint (if it exists)
      const authRes  = await fetch(`${BASE}/auth/profile`, {
        method:  "PATCH",
        headers: authHeaders(token),
        body:    JSON.stringify({ name: form.name.trim(), examDate: form.examDate || null }),
      });
      const authData = await authRes.json();
      // Auth profile update is best-effort — don't fail if endpoint not wired
      if (authRes.ok && authData.success && authData.user) {
        setProfile(authData.user);
      } else {
        // Merge dashboard response into local profile state
        setProfile(prev => ({
          ...prev,
          name: form.name.trim(),
          profile: { ...(prev?.profile || {}), ...dashData.profile },
        }));
      }

      onProfileUpdate?.();
      showToast("saved");
      setSection("view");
    } catch (e) {
      showToast(`error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  // ── Change password ───────────────────────────────────────────────────────
  const savePassword = async () => {
    const errs = validatePass();
    if (Object.keys(errs).length) { setFieldErrs(errs); return; }
    setFieldErrs({});
    setSaving(true);
    try {
      const res  = await fetch(`${BASE}/auth/change-password`, {
        method:  "PATCH",
        headers: authHeaders(token),
        body:    JSON.stringify({ currentPassword: passForm.current, newPassword: passForm.next }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Password change failed.");
      setPassForm({ current: "", next: "", confirm: "" });
      showToast("saved");
      setSection("view");
    } catch (e) {
      showToast(`error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const cancelEdit = () => {
    setSection("view");
    setFieldErrs({});
    if (profile) {
      const p = profile.profile || {};
      setForm({
        name:               profile.name || "",
        target_year:        p.target_year        || 2026,
        daily_target_hours: p.daily_target_hours || 8,
        examDate:           p.examDate ? new Date(p.examDate).toISOString().split("T")[0] : "",
      });
    }
    setPassForm({ current: "", next: "", confirm: "" });
  };

  const sf = k => e => setForm(f     => ({ ...f, [k]: e.target.value }));
  const pf = k => e => setPassForm(f => ({ ...f, [k]: e.target.value }));

  // ── Derived values ────────────────────────────────────────────────────────
  const p           = profile?.profile || {};
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "—";
  const examDisplay = p.examDate
    ? new Date(p.examDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "Not set";
  const daysLeft    = p.examDate
    ? Math.max(0, Math.ceil((new Date(p.examDate) - Date.now()) / 86_400_000))
    : null;

  // ── Loading / error states ────────────────────────────────────────────────
  if (fetching) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <Loader2 size={22} className="animate-spin text-accent-gold" />
      <p className="text-xs font-mono text-text-muted">Loading profile…</p>
    </div>
  );
  if (fetchErr) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <AlertCircle size={22} className="text-red-400" />
      <p className="text-xs font-mono text-red-400">{fetchErr}</p>
      <button onClick={fetchProfile} className="btn-primary text-xs px-4 py-2">Retry</button>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in min-h-screen">
      {/* Full-width top banner */}
      <div className="w-full px-4 sm:px-8 lg:px-12 py-6 sm:py-8 border-b border-bg-border bg-transparent">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
            {onBack && (
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: "var(--bg-muted, #1e1e1e)", border: "1px solid var(--bg-border, #333)", color: "var(--text-secondary, #aaa)" }}
            aria-label="Go back"
          >
            <ArrowLeft size={15} />
          </button>
        )}
          <AvatarCircle name={profile?.name} size="lg" />
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-2xl sm:text-3xl text-text-primary truncate">{profile?.name}</h2>
            {/* // line space in moblie view  */}
            <br className="block lg:hidden" />
            <p className="text-xs font-mono text-text-muted truncate">{profile?.email} · Member since {memberSince}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {profile?.role === "admin" && (
                <span className="label-tag flex items-center gap-1 text-purple-400 border-purple-400/30 bg-purple-400/10">
                  <Shield size={9} /> Admin
                </span>
              )}
              <span className="label-tag text-accent-gold border-accent-gold/30 bg-accent-gold/10">
                CSE {p.target_year || "—"}
              </span>
              {daysLeft !== null && (
                <span className="label-tag" style={{
                  color:       daysLeft <= 30 ? "#f87171" : "#4ade80",
                  borderColor: daysLeft <= 30 ? "rgba(248,113,113,0.3)" : "rgba(74,222,128,0.3)",
                  background:  daysLeft <= 30 ? "rgba(248,113,113,0.1)" : "rgba(74,222,128,0.1)",
                }}>
                  {daysLeft}d to exam
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Page body — two-column on lg */}
      <div className="w-full px-4 sm:px-8 lg:px-12 py-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Left column: stats + account info ── */}
          <div className="space-y-4">

            {/* Stat pills */}
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
              <StatPill icon={Flame}  label="Streak"  value={`${p.streak || 0}d`}                color="#fb923c" />
              <StatPill icon={Trophy} label="Best"    value={`${p.longest_streak || 0}d`}        color="#fbbf24" />
              <StatPill icon={Clock}  label="Target"  value={`${p.daily_target_hours || 8}h/d`} color="#60a5fa" />
            </div>

            {/* Study stats card */}
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={13} className="text-accent-green" />
                <h3 className="text-sm font-semibold text-text-primary">Study Stats</h3>
              </div>
              <div className="space-y-0">
                {[
                  { label: "Current streak",  value: `${p.streak || 0} days`,              color: "#fb923c" },
                  { label: "Longest streak",  value: `${p.longest_streak || 0} days`,      color: "#fbbf24" },
                  { label: "Target year",     value: `CSE ${p.target_year || "—"}`,        color: "var(--text-primary)" },
                  { label: "Days to exam",    value: daysLeft != null ? `${daysLeft}d` : "—",
                    color: daysLeft != null && daysLeft <= 90 ? "#f87171" : "#4ade80" },
                  { label: "Daily goal",      value: `${p.daily_target_hours || 8}h`,      color: "#60a5fa" },
                  { label: "Role",            value: profile?.role === "admin" ? "Admin" : "Student", color: "#a78bfa" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-bg-border last:border-0">
                    <span className="text-xs font-mono text-text-muted">{label}</span>
                    <span className="text-xs font-bold" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Account ID */}
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={13} className="text-accent-gold" />
                <h3 className="text-sm font-semibold text-text-primary">Account</h3>
              </div>
              <p className="text-[11px] font-mono text-text-muted break-all">
                ID: <span className="text-text-secondary">{profile?.id || "—"}</span>
              </p>
            </div>
          </div>

          {/* ── Right column: edit panels ── */}
          <div className="lg:col-span-2 space-y-4">

            {toast && <Toast msg={toast} />}

            {/* Personal details */}
            <div className="glass-panel p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-accent-gold" />
                  <h3 className="text-sm font-semibold text-text-primary">Personal Details</h3>
                </div>
                {section === "view" && (
                  <button onClick={() => setSection("edit")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border border-bg-border text-text-secondary hover:text-text-primary transition-colors">
                    <Edit3 size={11} /> Edit
                  </button>
                )}
              </div>

              {section !== "edit" ? (
                <>
                  <InfoRow icon={User}     label="Full Name"          value={profile?.name}                           accent="var(--accent-gold,#f59e0b)" />
                  <InfoRow icon={Mail}     label="Email"              value={profile?.email}                          />
                  <InfoRow icon={Target}   label="Target Year"        value={`CSE ${p.target_year}`}                 accent="#60a5fa" />
                  <InfoRow icon={Calendar} label="Exam Date"          value={examDisplay}                            accent="#4ade80" />
                  <InfoRow icon={Clock}    label="Daily Study Target" value={`${p.daily_target_hours || 8} hours / day`} accent="#a78bfa" />
                  <InfoRow icon={BookOpen} label="Member Since"       value={memberSince}                            />
                </>
              ) : (
                <div className="space-y-4">
                  <FieldInput label="Full Name"  value={form.name}     onChange={sf("name")}     error={fieldErrs.name}    icon={User} />
                  <SelectField label="Target Year" icon={Target} value={form.target_year} onChange={sf("target_year")}>
                    {YEAR_OPTIONS.map(y => <option key={y} value={y}>CSE {y}</option>)}
                  </SelectField>
                  <FieldInput label="Exam Date" type="date" value={form.examDate} onChange={sf("examDate")}
                    error={fieldErrs.examDate} icon={Calendar} hint="Updates the sidebar countdown" />
                  <SelectField label="Daily Study Target" icon={Clock} value={form.daily_target_hours} onChange={sf("daily_target_hours")}>
                    {HOUR_OPTIONS.map(h => <option key={h} value={h}>{h} hour{h > 1 ? "s" : ""} / day</option>)}
                  </SelectField>
                  <div className="flex gap-2 pt-1">
                    <button onClick={cancelEdit}
                      className="btn-ghost border border-bg-border flex-1 flex items-center justify-center gap-1.5 text-sm">
                      <X size={13} /> Cancel
                    </button>
                    <button onClick={saveProfile} disabled={saving}
                      className="btn-primary flex-[2] flex items-center justify-center gap-1.5 text-sm">
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <><Save size={13} /> Save Changes</>}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Password */}
            <div className="glass-panel p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <KeyRound size={14} style={{ color: "#60a5fa" }} />
                  <h3 className="text-sm font-semibold text-text-primary">Password</h3>
                </div>
                {section === "view" && (
                  <button onClick={() => setSection("password")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border border-bg-border text-text-secondary hover:text-text-primary transition-colors">
                    <Edit3 size={11} /> Change
                  </button>
                )}
              </div>

              {section !== "password" ? (
                <p className="text-xs font-mono text-text-muted py-1">
                  ••••••••&nbsp;&nbsp;Use a strong, unique password.
                </p>
              ) : (
                <div className="space-y-4">
                  <FieldInput label="Current Password"     type="password" value={passForm.current} onChange={pf("current")} error={fieldErrs.current} icon={KeyRound} />
                  <FieldInput label="New Password"         type="password" value={passForm.next}    onChange={pf("next")}    error={fieldErrs.next}    icon={KeyRound} hint="Minimum 8 characters" />
                  <FieldInput label="Confirm New Password" type="password" value={passForm.confirm} onChange={pf("confirm")} error={fieldErrs.confirm} icon={KeyRound} />
                  <div className="flex gap-2 pt-1">
                    <button onClick={cancelEdit}
                      className="btn-ghost border border-bg-border flex-1 flex items-center justify-center gap-1.5 text-sm">
                      <X size={13} /> Cancel
                    </button>
                    <button onClick={savePassword} disabled={saving}
                      className="flex-[2] flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                      style={{ background: "#3b82f6", color: "#fff" }}>
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <><Save size={13} /> Update Password</>}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}