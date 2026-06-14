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
        hover:ring-2 hover:ring-offset-2 hover:ring-amber-400/60 active:scale-95
        ${className}
      `}
      style={{
        background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        color: "#1a1a1a",
        border: "2px solid rgba(245,158,11,0.4)",
        boxShadow: "0 4px 12px rgba(245,158,11,0.3)",
        fontFamily: "inherit",
      }}
    >
      {initials}
    </button>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => 2025 + i);
const HOUR_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20];

function authHeaders(token) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

// ─── Sub-components (enhanced spacing & fonts) ───────────────────────────────
function InfoRow({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-bg-border last:border-0">
      <span className="w-8 h-8 rounded-xl bg-bg-muted flex items-center justify-center shrink-0"
        style={{ color: accent || "var(--text-muted,#888)" }}>
        <Icon size={15} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-text-muted">{label}</p>
        <p className="text-sm sm:text-base text-text-primary font-medium truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

function FieldInput({ label, type = "text", value, onChange, error, icon: Icon, hint }) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-xs sm:text-sm font-mono uppercase tracking-wider text-text-muted">
        {Icon && <Icon size={12} />}{label}
      </label>
      <div className="relative">
        <input
          type={isPass ? (show ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          className="w-full rounded-xl px-4 py-3 text-base bg-bg-muted text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-gold/40 transition-all"
          style={{ border: `1px solid ${error ? "rgba(239,68,68,0.5)" : "var(--bg-border,#333)"}`, paddingRight: isPass ? "2.75rem" : undefined }}
        />
        {isPass && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {hint && !error && <p className="text-xs font-mono text-text-muted/70">{hint}</p>}
      {error && <p className="flex items-center gap-1.5 text-xs font-mono text-red-400"><AlertCircle size={11} />{error}</p>}
    </div>
  );
}

function SelectField({ label, icon: Icon, value, onChange, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-xs sm:text-sm font-mono uppercase tracking-wider text-text-muted">
        {Icon && <Icon size={12} />}{label}
      </label>
      <select value={value} onChange={onChange}
        className="w-full rounded-xl px-4 py-3 text-base bg-bg-muted text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-gold/40 transition-all"
        style={{ border: "1px solid var(--bg-border,#333)" }}>
        {children}
      </select>
    </div>
  );
}

function StatPill({ icon: Icon, label, value, color }) {
  return (
    <div className="glass-panel p-4 sm:p-5 flex flex-col items-center gap-2 text-center hover:scale-[1.02] transition-transform duration-200">
      <Icon size={18} style={{ color }} />
      <span className="text-xl sm:text-2xl font-bold text-text-primary">{value}</span>
      <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wide text-text-muted">{label}</span>
    </div>
  );
}

function Toast({ msg }) {
  if (!msg) return null;
  const ok = msg === "saved";
  return (
    <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border text-sm font-mono ${ok ? "bg-green-500/10 border-green-500/30 text-green-400"
        : "bg-red-500/10 border-red-500/30 text-red-400"
      }`}>
      {ok
        ? <><CheckCircle2 size={14} /> Profile updated successfully.</>
        : <><AlertCircle size={14} /> {msg.replace(/^error:\s*/i, "")}</>
      }
    </div>
  );
}

// ─── ProfilePage ──────────────────────────────────────────────────────────────
export default function ProfilePage({ token, onBack, onProfileUpdate, userData = null }) {
  const [profile, setProfile] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [fetchErr, setFetchErr] = useState("");
  const [section, setSection] = useState("view"); // "view" | "edit" | "password"
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [fieldErrs, setFieldErrs] = useState({});

  const [form, setForm] = useState({
    name: "", target_year: 2026, daily_target_hours: 8, examDate: "",
  });
  const [passForm, setPassForm] = useState({ current: "", next: "", confirm: "" });

  // ── Progress values derived from synced userData ────────────────────────────
  const overallCoverage = userData
    ? (() => {
        let total = 0, count = 0;
        for (const stage of Object.values(userData.syllabus || {})) {
          for (const paper of Object.values(stage)) {
            for (const mod of Object.values(paper.modules || {})) {
              total += mod.progress || 0;
              count++;
            }
          }
        }
        return count > 0 ? Math.round(total / count) : 0;
      })()
    : 0;
  // question_attempts = all MCQ/PYQ attempts (synced from server)
  // answers = written mains answers
  const totalAnswered = (userData?.question_attempts?.length || 0) + (userData?.answers?.length || 0);
  const totalMCQCorrect = (userData?.question_attempts || []).filter(a => a.result === "correct").length;
  const mcqAccuracy = totalAnswered > 0
    ? Math.round((totalMCQCorrect / Math.max(userData?.question_attempts?.length || 1, 1)) * 100)
    : 0;
  const todayStudyHours = userData
    ? (() => {
        const today = new Date().toISOString().split("T")[0];
        const log = (userData.daily_logs || []).find(l => l.date === today);
        return parseFloat((log?.hours || 0).toFixed(1));
      })()
    : 0;

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
          name: d.user?.name || "",
          target_year: p.target_year || 2026,
          daily_target_hours: p.daily_target_hours || 8,
          examDate: p.examDate ? new Date(p.examDate).toISOString().split("T")[0] : "",
        });
      })
      .catch(e => setFetchErr(e.message))
      .finally(() => setFetching(false));
  }, [token]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // ── Validation ────────────────────────────────────────────────────────────
  const validateProfile = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    else if (form.name.trim().length > 80) e.name = "Max 80 characters.";
    if (form.examDate && isNaN(new Date(form.examDate).getTime())) e.examDate = "Invalid date.";
    return e;
  };
  const validatePass = () => {
    const e = {};
    if (!passForm.current) e.current = "Enter your current password.";
    if (!passForm.next || passForm.next.length < 8) e.next = "Minimum 8 characters.";
    if (passForm.next !== passForm.confirm) e.confirm = "Passwords do not match.";
    return e;
  };

  // ── Save profile — hits PATCH /dashboard/profile (our new endpoint) ───────
  const saveProfile = async () => {
    const errs = validateProfile();
    if (Object.keys(errs).length) { setFieldErrs(errs); return; }
    setFieldErrs({});
    setSaving(true);
    try {
      const dashRes = await fetch(`${BASE}/dashboard/profile`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({
          daily_target_hours: Number(form.daily_target_hours),
          target_year: Number(form.target_year),
          exam_date: form.examDate || null,
        }),
      });
      const dashData = await dashRes.json();
      if (!dashRes.ok || !dashData.success) throw new Error(dashData.error || "Save failed.");

      const authRes = await fetch(`${BASE}/auth/profile`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({ name: form.name.trim(), examDate: form.examDate || null }),
      });
      const authData = await authRes.json();
      if (authRes.ok && authData.success && authData.user) {
        setProfile(authData.user);
      } else {
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
      const res = await fetch(`${BASE}/auth/change-password`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({ currentPassword: passForm.current, newPassword: passForm.next }),
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
        name: profile.name || "",
        target_year: p.target_year || 2026,
        daily_target_hours: p.daily_target_hours || 8,
        examDate: p.examDate ? new Date(p.examDate).toISOString().split("T")[0] : "",
      });
    }
    setPassForm({ current: "", next: "", confirm: "" });
  };

  const sf = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const pf = k => e => setPassForm(f => ({ ...f, [k]: e.target.value }));

  // ── Derived values ────────────────────────────────────────────────────────
  const p = profile?.profile || {};
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "—";
  const examDisplay = p.examDate
    ? new Date(p.examDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "Not set";
  const daysLeft = p.examDate
    ? Math.max(0, Math.ceil((new Date(p.examDate) - Date.now()) / 86_400_000))
    : null;

  // ── Loading / error states ────────────────────────────────────────────────
  if (fetching) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 size={26} className="animate-spin text-accent-gold" />
      <p className="text-sm font-mono text-text-muted">Loading profile…</p>
    </div>
  );
  if (fetchErr) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <AlertCircle size={26} className="text-red-400" />
      <p className="text-sm font-mono text-red-400">{fetchErr}</p>
      <button onClick={fetchProfile} className="btn-primary text-sm px-5 py-2.5 rounded-xl">Retry</button>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in min-h-screen">
      {/* ─── Theme‑aware, responsive header ─── */}
      <div className="w-full px-5 sm:px-8 md:px-10 lg:px-14 py-6 sm:py-8 md:py-10 border-b border-bg-border bg-bg-primary/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {onBack && (
                <button
                  onClick={onBack}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95 bg-bg-muted border border-bg-border text-text-muted hover:text-text-primary hover:border-accent-gold/40 shrink-0"
                  aria-label="Go back"
                >
                  <ArrowLeft size={18} />
                </button>
              )}
              <AvatarCircle name={profile?.name} size="lg" />
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-text-primary truncate tracking-tight">
                  {profile?.name}
                </h2>
                <p className="text-xs sm:text-sm font-mono text-text-muted truncate hidden sm:block">
                  {profile?.email} · Member since {memberSince}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto sm:ml-auto">
              {profile?.role === "admin" && (
                <span className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-mono flex items-center gap-1.5 text-purple-400 border border-purple-400/30 bg-purple-500/10">
                  <Shield size={12} /> Admin
                </span>
              )}
              <span className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-mono flex items-center gap-1.5 text-amber-400 border border-amber-400/30 bg-amber-500/10">
                CSE {p.target_year || "—"}
              </span>
              {daysLeft !== null && (
                <span
                  className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-mono"
                  style={{
                    color: daysLeft <= 30 ? "#f87171" : "#4ade80",
                    borderColor: daysLeft <= 30 ? "rgba(248,113,113,0.3)" : "rgba(74,222,128,0.3)",
                    background: daysLeft <= 30 ? "rgba(248,113,113,0.1)" : "rgba(74,222,128,0.1)",
                  }}
                >
                  {daysLeft}d to exam
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm font-mono text-text-muted truncate block sm:hidden w-full mt-2">
              Member since {memberSince}
            </p>
          </div>
        </div>
      </div>

      {/* Page body — enhanced spacing everywhere */}
      <div className="w-full px-5 sm:px-8 md:px-10 lg:px-14 py-8 sm:py-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

          {/* ── Left column: stats + account info ── */}
          <div className="space-y-6 sm:space-y-7">

            {/* Stat pills — larger touch targets */}
            <div className="grid grid-cols-3 lg:grid-cols-2 gap-3 sm:gap-4">
              <StatPill icon={Flame} label="Streak" value={`${p.streak || 0}d`} color="#fb923c" />
              <StatPill icon={Trophy} label="Best" value={`${p.longest_streak || 0}d`} color="#fbbf24" />
              <StatPill icon={Clock} label="Target" value={`${p.daily_target_hours || 8}h/d`} color="#60a5fa" />
              <StatPill icon={TrendingUp} label="Coverage" value={`${overallCoverage}%`} color="#4ade80" />
              <StatPill icon={BookOpen} label="Answered" value={`${totalAnswered}`} color="#a78bfa" />
              <StatPill icon={Zap} label="Today" value={`${todayStudyHours}h`} color="#f59e0b" />
            </div>

            {/* Study stats card — bigger padding, larger text */}
            <div className="glass-panel p-5 sm:p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-5">
                <TrendingUp size={16} className="text-accent-green" />
                <h3 className="text-base sm:text-lg font-semibold text-text-primary">Study Stats</h3>
              </div>
              <div className="space-y-1">
                {[
                  { label: "Current streak", value: `${p.streak || 0} days`, color: "#fb923c" },
                  { label: "Longest streak", value: `${p.longest_streak || 0} days`, color: "#fbbf24" },
                  { label: "Target year", value: `CSE ${p.target_year || "—"}`, color: "var(--text-primary)" },
                  {
                    label: "Days to exam", value: daysLeft != null ? `${daysLeft}d` : "—",
                    color: daysLeft != null && daysLeft <= 90 ? "#f87171" : "#4ade80"
                  },
                  { label: "Daily goal", value: `${p.daily_target_hours || 8}h`, color: "#60a5fa" },
                  { label: "MCQ Accuracy", value: `${mcqAccuracy}%`, color: "#4ade80" },
                  { label: "Role", value: profile?.role === "admin" ? "Admin" : "Student", color: "#a78bfa" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between items-center py-3 border-b border-bg-border last:border-0">
                    <span className="text-sm font-mono text-text-muted">{label}</span>
                    <span className="text-sm sm:text-base font-bold" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Account ID card */}
            <div className="glass-panel p-5 sm:p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <Zap size={15} className="text-accent-gold" />
                <h3 className="text-base sm:text-lg font-semibold text-text-primary">Account</h3>
              </div>
              <p className="text-xs sm:text-sm font-mono text-text-muted break-all">
                ID: <span className="text-text-secondary font-mono">{profile?.id || "—"}</span>
              </p>
            </div>
          </div>

          {/* ── Right column: edit panels ── */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-7">

            {toast && <Toast msg={toast} />}

            {/* Personal details card */}
            <div className="glass-panel p-5 sm:p-6 rounded-2xl">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2.5">
                  <User size={16} className="text-accent-gold" />
                  <h3 className="text-base sm:text-lg font-semibold text-text-primary">Personal Details</h3>
                </div>
                {section === "view" && (
                  <button onClick={() => setSection("edit")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-mono border border-bg-border text-text-secondary hover:text-text-primary transition-all active:scale-95">
                    <Edit3 size={13} /> Edit
                  </button>
                )}
              </div>

              {section !== "edit" ? (
                <div className="space-y-1">
                  <InfoRow icon={User} label="Full Name" value={profile?.name} accent="var(--accent-gold,#f59e0b)" />
                  <InfoRow icon={Mail} label="Email" value={profile?.email} />
                  <InfoRow icon={Target} label="Target Year" value={`CSE ${p.target_year}`} accent="#60a5fa" />
                  <InfoRow icon={Calendar} label="Exam Date" value={examDisplay} accent="#4ade80" />
                  <InfoRow icon={Clock} label="Daily Study Target" value={`${p.daily_target_hours || 8} hours / day`} accent="#a78bfa" />
                  <InfoRow icon={BookOpen} label="Member Since" value={memberSince} />
                </div>
              ) : (
                <div className="space-y-5 sm:space-y-6">
                  <FieldInput label="Full Name" value={form.name} onChange={sf("name")} error={fieldErrs.name} icon={User} />
                  <SelectField label="Target Year" icon={Target} value={form.target_year} onChange={sf("target_year")}>
                    {YEAR_OPTIONS.map(y => <option key={y} value={y}>CSE {y}</option>)}
                  </SelectField>
                  <FieldInput label="Exam Date" type="date" value={form.examDate} onChange={sf("examDate")}
                    error={fieldErrs.examDate} icon={Calendar} hint="Updates the sidebar countdown" />
                  <SelectField label="Daily Study Target" icon={Clock} value={form.daily_target_hours} onChange={sf("daily_target_hours")}>
                    {HOUR_OPTIONS.map(h => <option key={h} value={h}>{h} hour{h > 1 ? "s" : ""} / day</option>)}
                  </SelectField>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button onClick={cancelEdit}
                      className="btn-ghost border border-bg-border flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all active:scale-95">
                      <X size={14} /> Cancel
                    </button>
                    <button onClick={saveProfile} disabled={saving}
                      className="btn-primary flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50">
                      {saving ? <Loader2 size={15} className="animate-spin" /> : <><Save size={14} /> Save Changes</>}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Password card */}
            <div className="glass-panel p-5 sm:p-6 rounded-2xl">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2.5">
                  <KeyRound size={16} style={{ color: "#60a5fa" }} />
                  <h3 className="text-base sm:text-lg font-semibold text-text-primary">Password</h3>
                </div>
                {section === "view" && (
                  <button onClick={() => setSection("password")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-mono border border-bg-border text-text-secondary hover:text-text-primary transition-all active:scale-95">
                    <Edit3 size={13} /> Change
                  </button>
                )}
              </div>

              {section !== "password" ? (
                <p className="text-sm font-mono text-text-muted py-2">
                  ••••••••&nbsp;&nbsp;Use a strong, unique password.
                </p>
              ) : (
                <div className="space-y-5 sm:space-y-6">
                  <FieldInput label="Current Password" type="password" value={passForm.current} onChange={pf("current")} error={fieldErrs.current} icon={KeyRound} />
                  <FieldInput label="New Password" type="password" value={passForm.next} onChange={pf("next")} error={fieldErrs.next} icon={KeyRound} hint="Minimum 8 characters" />
                  <FieldInput label="Confirm New Password" type="password" value={passForm.confirm} onChange={pf("confirm")} error={fieldErrs.confirm} icon={KeyRound} />
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button onClick={cancelEdit}
                      className="border border-bg-border flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all active:scale-95">
                      <X size={14} /> Cancel
                    </button>
                    <button onClick={savePassword} disabled={saving}
                      className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
                      style={{ background: "#3b82f6", color: "#fff" }}>
                      {saving ? <Loader2 size={15} className="animate-spin" /> : <><Save size={14} /> Update Password</>}
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