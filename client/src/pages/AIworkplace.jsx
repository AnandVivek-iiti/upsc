import { useState, useRef, useCallback } from "react";
import {
  Send, RefreshCw, Cpu, FileText, ChevronDown, Copy, CheckCheck,
  AlertTriangle, BookOpen, Hash, Zap, TrendingUp, TrendingDown,
  Award, Target, Key, User, Star, ArrowRight, CheckCircle2, XCircle,
  Minus, ChevronRight, Sparkles, PenLine,
} from "lucide-react";
import { evaluateAnswer } from "../utils/api";
import AuthGate from "../components/AuthGate";

const PAPER_OPTIONS = ["GS1", "GS2", "GS3", "GS4", "English", "Indian Language", "Essay"];

const SAMPLE_QUESTIONS = [
  // ── GENERAL STUDIES 1 (History, Geography, Society) ──
  { paper: "GS1", text: "Evaluate the impact of the Bhakti movement in providing a socio-religious alternative to the hierarchical structure of Indian society." },
  { paper: "GS1", text: "The Indian Ocean has emerged as the new geopolitical centre of gravity in the 21st century. Discuss India's strategic interests and challenges in the region." },
  { paper: "GS1", text: "Assess the impact of globalization on changing family structures and elderly care paradigms in contemporary Indian society." },
  { paper: "GS1", text: "Explain the mechanisms of urban sprawl in Indian tier-2 cities and analyze the structural challenges it presents to resource management." },
  { paper: "GS1", text: "Critically examine the factors responsible for the frequency of intense tropical cyclones in the Bay of Bengal compared to the Arabian Sea." },
  { paper: "GS1", text: "Discuss the architectural and cultural significance of the temple architecture under the Chola Empire, highlighting its socio-economic role." },

  // ── GENERAL STUDIES 2 (Polity, Governance, IR) ──
  { paper: "GS2", text: "Critically examine the role of Governors in India's federal structure. Have they acted as agents of the Centre or constitutional heads?" },
  { paper: "GS2", text: "The judicial enforcement of Fundamental Rights has increasingly leaned towards the 'Due Process of Law' over 'Procedure Established by Law'. Analyze with landmark judgments." },
  { paper: "GS2", text: "Discuss how the lateral entry scheme into Indian civil services impacts institutional domain expertise, administrative continuity, and the civil services architecture." },
  { paper: "GS2", text: "Analyze the role of NGOs and Self-Help Groups (SHGs) in bridging the developmental gap in health and nutrition across rural India." },
  { paper: "GS2", text: "The cross-border interface of the 'Neighborhood First' policy faces immense geopolitical turbulence. Examine India's structural challenges with its immediate neighbors." },
  { paper: "GS2", text: "Examine the structural efficacy of the National Human Rights Commission (NHRC) in protecting civil liberties. Is it a 'toothless tiger'?" },
  { paper: "GS2", text: "Analyze the challenges and constitutional issues arising from simultaneous elections (One Nation, One Election) in India's multi-tier federal scheme." },

  // ── GENERAL STUDIES 3 (Economy, Infra, Science, Security) ──
  { paper: "GS3", text: "India's energy security is inextricably linked to its economic development. Analyze India's energy mix and the challenges of transitioning to renewables." },
  { paper: "GS3", text: "Explain the concept of 'Jobless Growth' in India. Suggest structural reforms required to leverage India's demographic dividend through manufacturing sector integration." },
  { paper: "GS3", text: "Evaluate the role of precision agriculture and digital public infrastructure (DPI) in transforming the returns of small and marginal farmers." },
  { paper: "GS3", text: "Analyze the vulnerabilities of India's critical information infrastructure to state-sponsored cyber warfare. Suggest institutional mitigation frameworks." },
  { paper: "GS3", text: "What are the regulatory and ethical bottlenecks in the deployment of Generative AI systems in India? Analyze the current draft guidelines." },
  { paper: "GS3", text: "Examine the links between organized crime, drug trafficking networks, and left-wing extremism (LWE) across India's red corridor." },
  { paper: "GS3", text: "Discuss the structural challenges of direct tax mobilization in India and suggest steps to widen the effective tax base." },

  // ── GENERAL STUDIES 4 (Ethics, Integrity, Aptitude) ──
  { paper: "GS4", text: "A civil servant is faced with a situation where following official orders would cause significant harm to a marginalized community. Analyze the ethical dimensions and suggest a course of action." },
  { paper: "GS4", text: "An upstanding municipal commissioner detects deep-seated institutional cartelization in public procurement tenders involving powerful local politicians. Draft a strategy to dismantle the network without paralyzing public utilities." },
  { paper: "GS4", text: "What does emotional intelligence mean to an administrator facing severe public agitation during a pandemic lockdown enforcement? Discuss with practical parameters." },
  { paper: "GS4", text: "Corporate governance must go beyond corporate social responsibility (CSR) mandates to genuine ethical capitalism. Critically evaluate the statement." },

  // ── ESSAY PAPERS (Philosophical & Topical) ──
  { paper: "Essay", text: "Ships do not sink because of water around them; ships sink because of water that gets into them." },
  { paper: "Essay", text: "Artificial Intelligence is a brilliant tool but a catastrophic master: Navigating humanity's developmental paradox." },
  { paper: "Essay", text: "The structural metrics of a nation's progress are written in the freedom and safety of its women." }
];

const RATING_CONFIG = {
  Strong: { color: "var(--accent-green)", bg: "var(--accent-green-dim)", icon: CheckCircle2 },
  Adequate: { color: "var(--accent-gold)", bg: "var(--accent-gold-dim)", icon: Minus },
  Weak: { color: "var(--accent-red)", bg: "var(--accent-red-dim)", icon: TrendingDown },
  Missing: { color: "var(--accent-red)", bg: "var(--accent-red-dim)", icon: XCircle },
};

// ─── Score Ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const pct = (score / 10) * 100;
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = score >= 7 ? "var(--accent-green)" : score >= 5 ? "var(--accent-gold)" : "var(--accent-red)";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
          <circle cx="44" cy="44" r={r} fill="none" stroke="var(--bg-border)" strokeWidth="6" />
          <circle
            cx="44" cy="44" r={r} fill="none"
            stroke={color} strokeWidth="6"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-2xl" style={{ color }}>{score}</span>
          <span className="text-[10px] font-mono text-text-muted">/10</span>
        </div>
      </div>
    </div>
  );
}

// ─── Keyword Chip ──────────────────────────────────────────────────────────────
function KeyChip({ word, type }) {
  const styles = {
    present: { bg: "var(--accent-green-dim)", color: "var(--accent-green)", border: "rgba(16,185,129,0.25)" },
    missing: { bg: "var(--accent-red-dim)", color: "var(--accent-red)", border: "rgba(239,68,68,0.25)" },
    bonus: { bg: "var(--accent-gold-dim)", color: "var(--accent-gold)", border: "rgba(245,158,11,0.25)" },
  }[type];

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium animate-rise"
      style={{ background: styles.bg, color: styles.color, border: `1px solid ${styles.border}` }}
    >
      {type === "present" && <CheckCircle2 size={9} />}
      {type === "missing" && <XCircle size={9} />}
      {type === "bonus" && <Star size={9} />}
      {word}
    </span>
  );
}

// ─── Structure Bar ─────────────────────────────────────────────────────────────
function StructureBar({ label, rating, comment }) {
  const cfg = RATING_CONFIG[rating] || RATING_CONFIG.Weak;
  const Icon = cfg.icon;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-bg-border last:border-0 animate-rise">
      <div className="flex items-center gap-1.5 w-28 shrink-0 pt-0.5">
        <Icon size={12} style={{ color: cfg.color }} />
        <span className="text-xs font-mono text-text-muted">{label}</span>
      </div>
      <span
        className="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0"
        style={{ background: cfg.bg, color: cfg.color }}
      >
        {rating}
      </span>
      <p className="text-xs text-text-secondary leading-relaxed flex-1">{comment}</p>
    </div>
  );
}

// ─── Evaluation Panel (rich structured output) ─────────────────────────────────
function EvaluationPanel({ data, evaluating, rawStream }) {
  const [topperExpanded, setTopperExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.topper_answer || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (evaluating && !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-8">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-accent-gold/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-t-accent-gold border-accent-gold/10 animate-spin" />
          <Cpu size={20} className="absolute inset-0 m-auto text-accent-gold" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-display font-semibold text-text-primary">Mentor is analysing…</p>
          <p className="text-xs font-mono text-text-muted">Comparing with topper patterns</p>
        </div>
        {rawStream && (
          <div className="w-full max-w-xs bg-bg-muted rounded-xl px-4 py-3 border border-bg-border">
            <p className="text-[11px] font-mono text-text-muted leading-relaxed line-clamp-4 stream-cursor">{rawStream}</p>
          </div>
        )}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 py-8 opacity-50">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "var(--accent-gold-dim)" }}>
          <Sparkles size={22} className="text-accent-gold" />
        </div>
        <div className="text-center space-y-2 max-w-xs">
          <p className="text-sm font-display font-semibold text-text-primary">Mentor Awaiting Your Answer</p>
          <p className="text-xs font-mono text-text-muted">Write your Mains answer and submit. You'll get keyword analysis, strength/weakness breakdown, and a topper's model answer.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
          {[
            { icon: Key, label: "Keywords" },
            { icon: TrendingUp, label: "Strengths" },
            { icon: Target, label: "Structure" },
            { icon: User, label: "Topper Answer" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-muted border border-bg-border">
              <Icon size={12} className="text-accent-gold" />
              <span className="text-[11px] font-mono text-text-muted">{label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4">

      {/* Score + rationale */}
      <div className="glass-panel p-4 flex items-center gap-5 animate-rise">
        <ScoreRing score={data.score} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Examiner Score</p>
          <p className="text-sm text-text-primary leading-relaxed">{data.score_rationale}</p>
        </div>
      </div>

      {/* Keywords */}
      <div className="glass-panel p-4 space-y-3 animate-rise" style={{ animationDelay: "60ms" }}>
        <div className="flex items-center gap-2">
          <Key size={13} className="text-accent-gold" />
          <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider">Keyword Analysis</h3>
        </div>
        {data.keywords.present?.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-mono text-text-muted flex items-center gap-1"><CheckCircle2 size={9} className="text-accent-green" /> Used ({data.keywords.present.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {data.keywords.present.map(k => <KeyChip key={k} word={k} type="present" />)}
            </div>
          </div>
        )}
        {data.keywords.bonus?.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-mono text-text-muted flex items-center gap-1"><Star size={9} className="text-accent-gold" /> Bonus Keywords</p>
            <div className="flex flex-wrap gap-1.5">
              {data.keywords.bonus.map(k => <KeyChip key={k} word={k} type="bonus" />)}
            </div>
          </div>
        )}
        {data.keywords.missing?.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-mono text-text-muted flex items-center gap-1"><XCircle size={9} className="text-accent-red" /> Missing — Add These ({data.keywords.missing.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {data.keywords.missing.map(k => <KeyChip key={k} word={k} type="missing" />)}
            </div>
          </div>
        )}
      </div>

      {/* Structure */}
      <div className="glass-panel p-4 animate-rise" style={{ animationDelay: "100ms" }}>
        <div className="flex items-center gap-2 mb-2">
          <FileText size={13} className="text-accent-gold" />
          <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider">Structure Breakdown</h3>
        </div>
        {Object.entries({
          Introduction: data.structure.intro,
          "Body / Arguments": data.structure.body,
          "Way Forward": data.structure.way_forward,
          Conclusion: data.structure.conclusion,
        }).map(([label, s]) => s && (
          <StructureBar key={label} label={label} rating={s.rating} comment={s.comment} />
        ))}
      </div>

      {/* Strengths + Weaknesses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-rise" style={{ animationDelay: "140ms" }}>
        <div className="glass-panel p-4 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={13} className="text-accent-green" />
            <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider">Strengths</h3>
          </div>
          {data.strengths?.length > 0 ? data.strengths.map((s, i) => (
            <div key={i} className="space-y-0.5">
              <p className="text-xs text-text-primary leading-relaxed">{s.point}</p>
              {s.quote && (
                <p className="text-[11px] font-mono text-text-muted italic border-l-2 pl-2"
                  style={{ borderColor: "var(--accent-green)" }}>
                  "{s.quote}"
                </p>
              )}
            </div>
          )) : <p className="text-xs text-text-muted font-mono italic">None identified</p>}
        </div>
        <div className="glass-panel p-4 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={13} className="text-accent-red" />
            <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider">Weaknesses</h3>
          </div>
          {data.weaknesses?.length > 0 ? data.weaknesses.map((w, i) => (
            <div key={i} className="space-y-1">
              <p className="text-xs text-text-primary leading-relaxed">{w.point}</p>
              {w.fix && (
                <div className="flex items-start gap-1.5">
                  <ArrowRight size={10} className="text-accent-gold shrink-0 mt-0.5" />
                  <p className="text-[11px] font-mono" style={{ color: "var(--accent-gold)" }}>{w.fix}</p>
                </div>
              )}
            </div>
          )) : <p className="text-xs text-text-muted font-mono italic">None identified</p>}
        </div>
      </div>

      {/* Topper comparison */}
      {data.topper_comparison && (
        <div className="glass-panel p-4 space-y-3 animate-rise" style={{ animationDelay: "180ms" }}>
          <div className="flex items-center gap-2">
            <Award size={13} className="text-accent-gold" />
            <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider">Topper vs Your Answer</h3>
          </div>
          {data.topper_comparison.what_topper_does_differently?.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono text-text-muted">What toppers do differently</p>
              {data.topper_comparison.what_topper_does_differently.map((d, i) => (
                <div key={i} className="flex items-start gap-2">
                  <ChevronRight size={11} className="text-accent-gold shrink-0 mt-0.5" />
                  <p className="text-xs text-text-secondary">{d}</p>
                </div>
              ))}
            </div>
          )}
          {data.topper_comparison.constitutional_statutory_references?.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono text-text-muted">Constitutional / Statutory references missed</p>
              <div className="flex flex-wrap gap-1.5">
                {data.topper_comparison.constitutional_statutory_references.map((r, i) => (
                  <span key={i} className="text-[11px] font-mono px-2 py-0.5 rounded-full"
                    style={{ background: "var(--accent-purple-dim)", color: "var(--accent-purple)", border: "1px solid rgba(139,92,246,0.2)" }}>
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}
          {data.topper_comparison.data_points_missing?.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono text-text-muted">Data points / reports to add</p>
              <div className="flex flex-wrap gap-1.5">
                {data.topper_comparison.data_points_missing.map((d, i) => (
                  <span key={i} className="text-[11px] font-mono px-2 py-0.5 rounded-full"
                    style={{ background: "var(--accent-blue-dim)", color: "var(--accent-blue)", border: "1px solid rgba(59,130,246,0.2)" }}>
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Topper's model answer */}
      {data.topper_answer && (
        <div className="animate-rise" style={{ animationDelay: "220ms" }}>
          <button
            onClick={() => setTopperExpanded(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 border"
            style={{
              background: topperExpanded ? "var(--accent-gold-dim)" : "var(--bg-muted)",
              borderColor: topperExpanded ? "rgba(245,158,11,0.3)" : "var(--bg-border)",
            }}
          >
            <div className="flex items-center gap-2">
              <PenLine size={13} className="text-accent-gold" />
              <span className="text-sm font-display font-semibold text-text-primary">Topper's Model Answer</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{ background: "var(--accent-gold-dim)", color: "var(--accent-gold)" }}>
                AIR 1–10 Standard
              </span>
            </div>
            <ChevronDown size={14} className={`text-text-muted transition-transform duration-300 ${topperExpanded ? "rotate-180" : ""}`} />
          </button>

          {topperExpanded && (
            <div className="glass-panel mt-2 p-5 animate-slide-up">
              <div className="flex justify-end mb-3">
                <button onClick={handleCopy} className="btn-ghost flex items-center gap-1.5 text-xs">
                  {copied ? <CheckCheck size={11} className="text-accent-green" /> : <Copy size={11} />}
                  {copied ? "Copied!" : "Copy answer"}
                </button>
              </div>
              <div className="prose-zone">
                {data.topper_answer.split("\n").filter(Boolean).map((para, i) => (
                  <p key={i} className="text-sm text-text-primary leading-8 mb-3 last:mb-0">{para}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Priority actions */}
      {data.priority_actions?.length > 0 && (
        <div className="glass-panel p-4 space-y-2 animate-rise" style={{ animationDelay: "260ms" }}>
          <div className="flex items-center gap-2 mb-1">
            <Zap size={13} className="text-accent-gold" />
            <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider">Priority Actions</h3>
          </div>
          {data.priority_actions.map((a, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-bg-border last:border-0">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0"
                style={{ background: "var(--accent-gold-dim)", color: "var(--accent-gold)" }}>
                {i + 1}
              </span>
              <p className="text-sm text-text-primary leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}

// ─── Main AIWorkspace ──────────────────────────────────────────────────────────
export default function AIworkspace({ initialQuestion = null, user = null, onNavigateAuth }) {
  if (!user) return <AuthGate feature="AI Workspace" onNavigateAuth={onNavigateAuth} />;

  const [question, setQuestion] = useState(initialQuestion?.text || "");
  const [answer, setAnswer] = useState("");
  const [paper, setPaper] = useState(initialQuestion?.paper || "GS2");
  const [evaluating, setEvaluating] = useState(false);
  const [evalData, setEvalData] = useState(null);
  const [rawStream, setRawStream] = useState("");
  const [error, setError] = useState(null);
  const [showSamples, setShowSamples] = useState(false);
  const [mobileTab, setMobileTab] = useState("answer");

  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;

  const handleEvaluate = useCallback(async () => {
    if (!question.trim()) { setError("Please enter the question first."); return; }
    if (wordCount < 20) { setError("Write at least 20 words before requesting evaluation."); return; }

    setError(null);
    setEvalData(null);
    setRawStream("");
    setEvaluating(true);
    setMobileTab("eval");

    let fullText = "";

    try {
      await evaluateAnswer(
        { question, answer, paper },
        (chunk) => {
          fullText += chunk;
          setRawStream(fullText);
        },
        (finalResponse) => {
          try {
            const parsed = typeof finalResponse === 'string' ? JSON.parse(finalResponse) : finalResponse;
            if (parsed.success && parsed.data) {
              setEvalData(parsed.data);
            } else {
              setEvalData(parsed);
            }
          } catch {
            const match = fullText.match(/\{[\s\S]*\}/);
            if (match) {
              try { setEvalData(JSON.parse(match[0])); } catch { }
            }
          }
          setEvaluating(false);
        }
      );
    } catch (e) {
      setError(e.message || "Evaluation failed. Check server connection.");
      setEvaluating(false);
    }
  }, [question, answer, paper, wordCount]);

  const handleReset = () => {
    setAnswer("");
    setEvalData(null);
    setRawStream("");
    setError(null);
    setMobileTab("answer");
  };

  const loadSample = (sample) => {
    setQuestion(sample.text);
    setPaper(sample.paper);
    setShowSamples(false);
    setEvalData(null);
    setError(null);
  };

  return (
    <div className="flex flex-col animate-fade-in" style={{ minHeight: "calc(100vh - 56px)" }}>

      {/* ── Top toolbar ── */}
      <div className="flex flex-wrap items-center gap-2 px-3 sm:px-5 py-3 border-b border-bg-border bg-bg-surface shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "var(--accent-gold-dim)" }}>
            <Cpu size={12} className="text-accent-gold" />
          </div>
          <h1 className="font-display font-semibold text-sm text-text-primary">Mains Workspace</h1>
        </div>

        {/* Paper selector */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {PAPER_OPTIONS.map((p) => (
            <button
              key={p}
              onClick={() => setPaper(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${paper === p
                  ? "font-semibold shadow-sm"
                  : "text-text-muted hover:text-text-secondary hover:bg-bg-muted"
                }`}
              style={paper === p ? { background: "var(--accent-gold)", color: "var(--bg-base)" } : {}}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <div className="relative">
            <button
              onClick={() => setShowSamples(v => !v)}
              className="btn-ghost flex items-center gap-1 text-xs"
            >
              <BookOpen size={12} />
              <span className="hidden sm:inline">Samples</span>
              <ChevronDown size={11} className={`transition-transform ${showSamples ? "rotate-180" : ""}`} />
            </button>
            {showSamples && (
              <div className="absolute right-0 top-full mt-1 w-72 sm:w-80 bg-bg-elevated border border-bg-border rounded-xl shadow-2xl z-10 overflow-hidden animate-slide-up">
                {SAMPLE_QUESTIONS.map((s, i) => (
                  <button key={i} onClick={() => loadSample(s)}
                    className="w-full text-left p-3 hover:bg-bg-muted transition-colors border-b border-bg-border last:border-0 flex gap-2"
                  >
                    <span className="label-tag text-accent-blue border-accent-blue/30 bg-accent-blue/10 shrink-0 self-start">{s.paper}</span>
                    <span className="text-xs text-text-secondary leading-relaxed">{s.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleReset} className="btn-ghost flex items-center gap-1 text-xs">
            <RefreshCw size={11} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* ── Question input ── */}
      <div className="px-3 sm:px-5 py-3 border-b border-bg-border bg-bg-surface shrink-0">
        <div className="flex items-start gap-2.5">
          <span className="text-xs font-mono mt-2.5 shrink-0 font-bold" style={{ color: "var(--accent-gold)" }}>Q.</span>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Paste or type the Mains question here…"
            rows={2}
            className="flex-1 bg-bg-muted border border-bg-border rounded-xl px-3 py-2.5 text-sm text-text-primary
                       font-body leading-relaxed focus:outline-none focus:border-accent-gold/40 transition-colors
                       placeholder:text-text-muted"
          />
        </div>
      </div>

      {/* ── Mobile tab switcher ── */}
      <div className="md:hidden flex border-b border-bg-border bg-bg-surface shrink-0">
        <button
          onClick={() => setMobileTab("answer")}
          className={`flex-1 py-2.5 text-xs font-mono transition-all ${mobileTab === "answer" ? "border-b-2 font-semibold" : "text-text-muted"
            }`}
          style={mobileTab === "answer" ? { color: "var(--accent-gold)", borderColor: "var(--accent-gold)" } : {}}
        >
          Your Answer
        </button>
        <button
          onClick={() => setMobileTab("eval")}
          className={`flex-1 py-2.5 text-xs font-mono transition-all flex items-center justify-center gap-1.5 ${mobileTab === "eval" ? "border-b-2 font-semibold" : "text-text-muted"
            }`}
          style={mobileTab === "eval" ? { color: "var(--accent-gold)", borderColor: "var(--accent-gold)" } : {}}
        >
          <Cpu size={11} className={evaluating ? "animate-pulse" : ""} />
          AI Mentor
          {evalData && !evaluating && <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent-green)" }} />}
        </button>
      </div>

      {/* ── Split panes ── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* Answer pane */}
        <div
          className={`flex-1 flex flex-col border-b md:border-b-0 md:border-r border-bg-border ${mobileTab !== "answer" ? "hidden md:flex" : "flex"
            }`}
          style={{ minHeight: "300px" }}
        >
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-bg-border bg-bg-surface shrink-0">
            <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider">Your Answer</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full transition-colors ${wordCount >= 250 ? "bg-accent-green" : wordCount >= 100 ? "bg-yellow-400" : "bg-bg-border"
                  }`} />
                <span className={`text-xs font-mono ${wordCount >= 250 ? "text-accent-green" : wordCount >= 100 ? "text-yellow-400" : "text-text-muted"
                  }`}>{wordCount}w</span>
              </div>
              <span className="text-[10px] font-mono text-text-muted hidden sm:inline">
                {wordCount < 100 ? "Too short" : wordCount < 200 ? "10M range" : wordCount < 300 ? "15M range" : "Good length"}
              </span>
            </div>
          </div>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={`Write your ${paper} answer here.\n\nStructure:\n  • Introduction — set context with a hook\n  • Body — 2–3 multi-dimensional paragraphs\n  • Way Forward — actionable recommendations\n  • Conclusion — forward-looking close\n\n150–200w for 10M | 250–300w for 15M`}
            className="flex-1 bg-bg-base px-4 sm:px-5 py-4 text-text-primary font-body text-sm leading-8
                       focus:outline-none placeholder:text-text-muted/40 placeholder:text-sm overflow-y-auto"
            style={{ minHeight: "200px" }}
          />

          <div className="px-3 sm:px-4 py-3 border-t border-bg-border bg-bg-surface shrink-0 flex items-center gap-2 sm:gap-3">
            {error ? (
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <AlertTriangle size={12} className="text-accent-red shrink-0" />
                <span className="text-xs text-accent-red font-mono truncate">{error}</span>
              </div>
            ) : (
              <div className="flex-1" />
            )}
            <button
              onClick={handleEvaluate}
              disabled={evaluating || !question.trim() || wordCount < 5}
              className="btn-primary flex items-center gap-1.5 whitespace-nowrap"
            >
              {evaluating
                ? <><Cpu size={14} className="animate-spin" />Analysing…</>
                : <><Send size={14} />Evaluate with AI</>
              }
            </button>
          </div>
        </div>

        {/* Evaluation pane */}
        <div
          className={`flex-1 flex flex-col bg-bg-surface ${mobileTab !== "eval" ? "hidden md:flex" : "flex"
            }`}
          style={{ minHeight: "300px" }}
        >
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-bg-border shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles size={12} className={evaluating ? "text-accent-gold animate-pulse" : "text-text-muted"} />
              <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider">AI Mentor</span>
              {evaluating && <span className="text-[10px] font-mono text-accent-gold animate-pulse">● live</span>}
            </div>
            {evalData && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-text-muted">
                  {evalData.keywords?.present?.length || 0} keywords used
                </span>
              </div>
            )}
          </div>

          <EvaluationPanel data={evalData} evaluating={evaluating} rawStream={rawStream} />
        </div>
      </div>

      <style>{`
        .prose-zone p { font-family: 'DM Sans', sans-serif; }
        .stream-cursor::after {
          content: "▋";
          animation: blink 1s step-end infinite;
          color: var(--accent-gold);
          margin-left: 2px;
        }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}