import { useState, useEffect, useRef } from "react";
import {
  Eye, EyeOff, ArrowRight, Loader2, AlertCircle,
  CheckCircle2, User, Mail, Lock, Target, Clock, BookOpen,
} from "lucide-react";

// ─── Google Icon SVG ──────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.4673-.8064 5.9564-2.1805l-2.9087-2.2581c-.8064.54-1.8368.8591-3.0477.8591-2.3441 0-4.3282-1.5831-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71c-.18-.54-.2827-1.1168-.2827-1.71s.1027-1.17.2827-1.71V4.9582H.9574C.3477 6.1732 0 7.5482 0 9s.3477 2.8268.9574 4.0418L3.964 10.71z" fill="#FBBC05"/>
      <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9574 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z" fill="#EA4335"/>
    </svg>
  );
}

// ─── Floating label input ─────────────────────────────────────────────────────
function Field({ label, type = "text", value, onChange, error, icon: Icon, hint, min, max, step, autoComplete }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-mono text-text-muted uppercase tracking-wider mb-0.5">
        {Icon && <Icon size={11} className="shrink-0" />}
        {label}
      </label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          min={min}
          max={max}
          step={step}
          className={`w-full bg-bg-muted border rounded-xl px-4 py-3.5 text-base text-text-primary
            font-body placeholder:text-text-muted/40 transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-accent-gold/20
            ${error
              ? "border-accent-red/60 focus:border-accent-red/60"
              : "border-bg-border focus:border-accent-gold/50"
            }
            ${isPassword ? "pr-11" : ""}
          `}
          placeholder=" "
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors p-1.5 touch-manipulation"
            tabIndex={-1}
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {hint && !error && <p className="text-sm text-text-muted font-mono">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1.5 text-[11px] text-accent-red font-mono">
          <AlertCircle size={10} className="shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

// ─── Select field ─────────────────────────────────────────────────────────────
function SelectField({ label, value, onChange, options, icon: Icon, error }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-mono text-text-muted uppercase tracking-wider mb-0.5">
        {Icon && <Icon size={11} className="shrink-0" />}
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        className={`w-full bg-bg-muted border rounded-xl px-4 py-3.5 text-base text-text-primary
          font-body transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-gold/20
          ${error ? "border-accent-red/60" : "border-bg-border focus:border-accent-gold/50"}
        `}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && (
        <p className="flex items-center gap-1.5 text-[11px] text-accent-red font-mono">
          <AlertCircle size={10} className="shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

// ─── Validation ───────────────────────────────────────────────────────────────
function validateLogin({ email, password }) {
  const errs = {};
  if (!email.trim()) errs.email = "Email is required";
  else if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Enter a valid email";
  if (!password) errs.password = "Password is required";
  return errs;
}
function validateSignup(form) {
  const errs = {};
  if (!form.name.trim()) errs.name = "Name is required";
  else if (form.name.trim().length > 80) errs.name = "Max 80 characters";
  if (!form.email.trim()) errs.email = "Email is required";
  else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email";
  if (!form.password) errs.password = "Password is required";
  else if (form.password.length < 8) errs.password = "At least 8 characters";
  if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords don't match";

  const yr = Number(form.target_year);
  if (!yr || yr < 2025 || yr > 2035) errs.target_year = "Pick a year between 2025–2035";

  const hrs = Number(form.daily_target_hours);
  if (!hrs || hrs < 1 || hrs > 20) errs.daily_target_hours = "Between 1–20 hours";

  // Exam date verification
  if (!form.examDate) {
    errs.examDate = "Exam date is required for the countdown tracker";
  } else {
    const selectedDate = new Date(form.examDate);
    if (selectedDate < new Date().setHours(0, 0, 0, 0)) {
      errs.examDate = "Exam date cannot be in the past";
    }
  }
  return errs;
}

// ─── Step dots ────────────────────────────────────────────────────────────────
function StepDots({ step, total }) {
  return (
    <div className="flex items-center gap-2 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${i === step
            ? "w-5 h-1.5 bg-accent-gold"
            : i < step
              ? "w-1.5 h-1.5 bg-accent-gold/40"
              : "w-1.5 h-1.5 bg-bg-border"
            }`}
        />
      ))}
    </div>
  );
}

// ─── Options ──────────────────────────────────────────────────────────────────
const yearOptions = Array.from({ length: 8 }, (_, i) => {
  const yr = 2025 + i;
  return { value: String(yr), label: `CSE ${yr}` };
});

const hourOptions = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16].map(h => ({
  value: String(h),
  label: `${h} hours / day`,
}));

// ─── AuthPage ─────────────────────────────────────────────────────────────────
export default function AuthPage({ onAuthSuccess, onBack }) {
  const [mode, setMode] = useState("login");
  const [signupStep, setSignupStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false); // ← Google
  const [globalError, setGlobalError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    target_year: String(new Date().getFullYear() + 1),
    daily_target_hours: "8",
    examDate: "",
  });

  const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ""; // ← Google
  const clearErrors = () => { setFieldErrors({}); setGlobalError(""); };

  // ─── Google Identity Services ──────────────────────────────────────────────
  const googleBtnRef = useRef(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const scriptId = "google-gsi-script";
    if (document.getElementById(scriptId)) { initGoogleButton(); return; }
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGoogleButton;
    document.head.appendChild(script);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [GOOGLE_CLIENT_ID]);

  useEffect(() => {
    if (window.google && GOOGLE_CLIENT_ID) initGoogleButton();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  function initGoogleButton() {
    if (!window.google?.accounts?.id || !googleBtnRef.current) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
    });
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: "outline",
      size: "large",
      width: googleBtnRef.current.offsetWidth || 400,
      text: mode === "login" ? "signin_with" : "signup_with",
      logo_alignment: "left",
    });
  }

  async function handleGoogleCredential(response) {
    clearErrors();
    setGoogleLoading(true);
    try {
      const res = await fetch(`${BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: response.credential }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Google sign-in failed");
      localStorage.setItem("upsc_token", data.token);
      localStorage.setItem("upsc_user", JSON.stringify(data.user));
      setSuccessMsg("Signed in with Google! Loading your dashboard…");
      setTimeout(() => onAuthSuccess(data.user, data.token), 800);
    } catch (e) {
      setGlobalError(e.message || "Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  }

  const switchMode = (m) => {
    setMode(m);
    setSignupStep(0);
    clearErrors();
    setSuccessMsg("");
  };

  const handleLogin = async () => {
    clearErrors();
    const errs = validateLogin(loginForm);
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginForm.email.trim(), password: loginForm.password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Login failed");
      localStorage.setItem("upsc_token", data.token);
      localStorage.setItem("upsc_user", JSON.stringify(data.user));
      onAuthSuccess(data.user, data.token);
    } catch (e) {
      setGlobalError(e.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupNext = () => {
    clearErrors();
    const { name, email, password, confirmPassword } = signupForm;
    const errs = {};
    if (!name.trim()) errs.name = "Name is required";
    else if (name.trim().length > 80) errs.name = "Max 80 characters";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    else if (password.length < 8) errs.password = "At least 8 characters";
    if (password !== confirmPassword) errs.confirmPassword = "Passwords don't match";
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setSignupStep(1);
  };
  const handleSignup = async () => {
    clearErrors();
    const errs = validateSignup(signupForm);
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupForm.name.trim(),
          email: signupForm.email.trim().toLowerCase(),
          password: signupForm.password,
          target_year: Number(signupForm.target_year),
          daily_target_hours: Number(signupForm.daily_target_hours),
          examDate: signupForm.examDate,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Registration failed");
      localStorage.setItem("upsc_token", data.token);
      localStorage.setItem("upsc_user", JSON.stringify(data.user));
      setSuccessMsg("Account created! Setting up your dashboard…");
      setTimeout(() => onAuthSuccess(data.user, data.token), 900);
    } catch (e) {
      setGlobalError(e.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const sf = (field) => (e) => setSignupForm(f => ({ ...f, [field]: e.target.value }));
  const lf = (field) => (e) => setLoginForm(f => ({ ...f, [field]: e.target.value }));

  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;
    if (mode === "login") handleLogin();
    else if (signupStep === 0) handleSignupNext();
    else handleSignup();
  };

  // ─── OR divider ────────────────────────────────────────────────────────────
  const Divider = () => (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-bg-border" />
      <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider">or</span>
      <div className="flex-1 h-px bg-bg-border" />
    </div>
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "var(--bg-base)" }}
      onKeyDown={handleKeyDown}
    >
      {/* Subtle grid overlay — matches your body background radial style */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(var(--accent-gold) 1px, transparent 1px), linear-gradient(90deg, var(--accent-gold) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Radial glow top-right */}
      <div className="pointer-events-none fixed top-0 right-0 w-[500px] h-[400px] opacity-[0.08] rounded-full blur-[100px]"
        style={{ background: "var(--accent-gold)", transform: "translate(30%, -30%)" }}
      />
      {/* Radial glow bottom-left */}
      <div className="pointer-events-none fixed bottom-0 left-0 w-[380px] h-[380px] opacity-[0.05] rounded-full blur-[90px]"
        style={{ background: "var(--accent-blue)", transform: "translate(-30%, 30%)" }}
      />

      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-4 left-4 z-20 flex items-center gap-1.5 text-sm font-mono text-text-muted hover:text-text-primary transition-colors px-3 py-2 rounded-xl border border-bg-border bg-bg-surface touch-manipulation"
          aria-label="Go back"
        >
          ← Back
        </button>
      )}

      {/* Card */}
      <div className="glass-panel w-full max-w-md relative z-10 p-6 sm:p-8 animate-rise">
        {/* Brand header */}
        <div className="text-center mb-6 sm:mb-7">

          {/* Centered Logo */}
          <div className="flex justify-center mb-4">
            <div className="relative">

              {/* Soft Glow */}
              <div
                className="absolute inset-0 rounded-2xl animate-pulse"
                style={{
                  background: "rgba(245,158,11,0.12)",
                  filter: "blur(16px)",
                  transform: "scale(1.25)",
                }}
              />

              {/* Animated Border Ring */}
              <div className="absolute inset-0 rounded-2xl logo-ring" />

              {/* Logo Container */}
              <div
                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-bg-muted flex items-center justify-center overflow-hidden logo-float"
                style={{
                  border: "1px solid rgba(245,158,11,0.25)",
                }}
              >
                <img
                  src="/logo-upsc.png"
                  alt="UPSC Mentor"
                  className="w-full h-full object-cover object-center"
                />
              </div>

            </div>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text-primary">
            UPSC Mentor
          </h1>

          <p className="text-[10px] sm:text-[11px] font-mono text-text-muted mt-1 tracking-widest uppercase">
            {mode === "login"
              ? "Welcome back, Aspirant"
              : signupStep === 0
                ? "Create your account"
                : "Set up your study profile"}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-bg-muted rounded-xl p-1 mb-6 border border-bg-border">
          {["login", "signup"].map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all duration-200 touch-manipulation ${mode === m
                ? "text-text-inverse font-semibold shadow-sm"
                : "text-text-muted hover:text-text-primary"
                }`}
              style={mode === m ? { background: "var(--accent-gold)", color: "var(--text-inverse)" } : {}}
            >
              {m === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        {/* Step dots for signup */}
        {mode === "signup" && (
          <div className="mb-5">
            <StepDots step={signupStep} total={2} />
          </div>
        )}

        {/* Global error */}
        {globalError && (
          <div className="flex items-start gap-2 mb-4 px-3.5 py-3 rounded-xl"
            style={{
              background: "var(--accent-red-dim)",
              border: "0.5px solid rgba(239,68,68,0.3)",
            }}
          >
            <AlertCircle size={14} className="text-accent-red shrink-0 mt-0.5" />
            <p className="text-sm text-accent-red font-mono leading-relaxed">{globalError}</p>
          </div>
        )}

        {/* Success */}
        {successMsg && (
          <div className="flex items-center gap-2 mb-4 px-3.5 py-3 rounded-xl"
            style={{
              background: "var(--accent-green-dim)",
              border: "0.5px solid rgba(16,185,129,0.3)",
            }}
          >
            <CheckCircle2 size={14} className="text-accent-green shrink-0" />
            <p className="text-sm text-accent-green font-mono">{successMsg}</p>
          </div>
        )}

        {/* ── LOGIN ── */}
        {mode === "login" && (
          <div className="space-y-5">

            {/* ── Google button ── */}
            {GOOGLE_CLIENT_ID && (
              <>
                {googleLoading ? (
                  <div className="flex items-center justify-center gap-2 py-3 rounded-xl border border-bg-border text-base text-text-muted">
                    <Loader2 size={16} className="animate-spin" /> Signing in with Google…
                  </div>
                ) : (
                  <div ref={googleBtnRef} className="w-full flex justify-center" />
                )}
                <Divider />
              </>
            )}

            <Field label="Email address" type="email" value={loginForm.email}
              onChange={lf("email")} error={fieldErrors.email} icon={Mail} autoComplete="email" />
            <Field label="Password" type="password" value={loginForm.password}
              onChange={lf("password")} error={fieldErrors.password} icon={Lock} autoComplete="current-password" />

            <button
              onClick={handleLogin}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2 touch-manipulation"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Sign In</span><ArrowRight size={15} /></>}
            </button>

            <p className="text-center text-sm text-text-muted font-mono">
              New here?{" "}
              <button onClick={() => switchMode("signup")} className="text-accent-gold hover:underline touch-manipulation">
                Create an account
              </button>
            </p>
          </div>
        )}

        {/* ── SIGNUP STEP 0 ── */}
        {mode === "signup" && signupStep === 0 && (
          <div className="space-y-5">

            {/* ── Google button ── */}
            {GOOGLE_CLIENT_ID && (
              <>
                {googleLoading ? (
                  <div className="flex items-center justify-center gap-2 py-3 rounded-xl border border-bg-border text-base text-text-muted">
                    <Loader2 size={16} className="animate-spin" /> Signing up with Google…
                  </div>
                ) : (
                  <div ref={googleBtnRef} className="w-full flex justify-center" />
                )}
                <Divider />
              </>
            )}

            <Field label="Full name" value={signupForm.name} onChange={sf("name")}
              error={fieldErrors.name} icon={User} autoComplete="name"
              hint="Appears on your dashboard" />
            <Field label="Email address" type="email" value={signupForm.email}
              onChange={sf("email")} error={fieldErrors.email} icon={Mail} autoComplete="email" />
            <Field label="Password" type="password" value={signupForm.password}
              onChange={sf("password")} error={fieldErrors.password} icon={Lock} autoComplete="new-password" />
            <Field label="Confirm password" type="password" value={signupForm.confirmPassword}
              onChange={sf("confirmPassword")} error={fieldErrors.confirmPassword}
              icon={Lock} autoComplete="new-password" />

            <button onClick={handleSignupNext} className="btn-primary w-full flex items-center justify-center gap-2 mt-2 touch-manipulation">
              <span>Next — Study Profile</span><ArrowRight size={15} />
            </button>

            <p className="text-center text-sm text-text-muted font-mono">
              Already registered?{" "}
              <button onClick={() => switchMode("login")} className="text-accent-gold hover:underline touch-manipulation">
                Sign in
              </button>
            </p>
          </div>
        )}
        {/* ── SIGNUP STEP 1 ── */}
        {mode === "signup" && signupStep === 1 && (
          <div className="space-y-5">
            <div className="px-4 py-3 rounded-xl" style={{ background: "var(--accent-gold-dim)", border: "0.5px solid rgba(245,158,11,0.2)" }}>
              <p className="text-sm font-mono text-accent-gold leading-relaxed">
                Almost there! Tell us about your UPSC preparation so we can personalise your dashboard.
              </p>
            </div>

            <SelectField
              label="Target exam year"
              value={signupForm.target_year}
              onChange={sf("target_year")}
              options={yearOptions}
              icon={Target}
              error={fieldErrors.target_year}
            />

            <Field
              label="Target Exam Date"
              type="date"
              value={signupForm.examDate}
              onChange={sf("examDate")}
              error={fieldErrors.examDate}
              icon={Clock}
              hint="Feeds your sidebar countdown dashboard widget"
            />

            <SelectField
              label="Daily study target"
              value={signupForm.daily_target_hours}
              onChange={sf("daily_target_hours")}
              options={hourOptions}
              icon={Clock}
              error={fieldErrors.daily_target_hours}
            />

            <div className="px-4 py-3 rounded-xl muted-panel">
              <p className="text-[11px] font-mono text-text-muted leading-relaxed">
                ✦ Your complete UPSC syllabus tracker will be seeded automatically<br />
                ✦ Streak counter, daily logs, and mains evaluation start from Day 1<br />
                ✦ You can update these anytime from your profile
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => { clearErrors(); setSignupStep(0); }} className="btn-outline flex-1 flex items-center justify-center gap-1.5 py-3 text-base touch-manipulation">
                ← Back
              </button>
              <button onClick={handleSignup} disabled={loading} className="btn-primary flex-[2] flex items-center justify-center gap-2 py-3 text-base touch-manipulation">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Create Account</span><ArrowRight size={15} /></>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}