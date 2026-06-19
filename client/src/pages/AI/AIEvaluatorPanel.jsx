
import { useState, useCallback } from "react";
import {
    Sparkles, Cpu, AlertTriangle, CheckCircle2, XCircle, Minus,
    TrendingUp, TrendingDown, Key, FileText, Award, Star,
    ArrowRight, ChevronRight, PenLine, ChevronDown, Copy,
    CheckCheck, Zap, RefreshCw, LogIn,
} from "lucide-react";
import { evaluateAnswer } from "../../hooks/useAI";

// ─── sub-components ───────────────────────────────────────────────────────────

function ScoreRing({ score }) {
    const r = 34, circ = 2 * Math.PI * r;
    const dash = (score / 10) * circ;
    const color = score >= 7 ? "var(--accent-green)" : score >= 5 ? "var(--accent-gold)" : "var(--accent-red)";
    return (
        <div className="relative w-[76px] h-[76px] shrink-0">
            <svg viewBox="0 0 76 76" className="w-full h-full -rotate-90">
                <circle cx="38" cy="38" r={r} fill="none" stroke="var(--bg-border)" strokeWidth="5" />
                <circle cx="38" cy="38" r={r} fill="none" stroke={color} strokeWidth="5"
                    strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                    style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.34,1.56,.64,1)" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-bold text-xl leading-none" style={{ color }}>{score}</span>
                <span className="text-[10px] font-mono text-text-muted">/10</span>
            </div>
        </div>
    );
}

function KeyChip({ word, type }) {
    const s = {
        present: { bg: "var(--accent-green-dim)", color: "var(--accent-green)", border: "rgba(16,185,129,.25)" },
        missing: { bg: "var(--accent-red-dim)", color: "var(--accent-red)", border: "rgba(239,68,68,.25)" },
        bonus: { bg: "var(--accent-gold-dim)", color: "var(--accent-gold)", border: "rgba(245,158,11,.25)" },
    }[type];
    const Icon = type === "present" ? CheckCircle2 : type === "missing" ? XCircle : Star;
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium"
            style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
            <Icon size={9} />{word}
        </span>
    );
}

const RATING_CFG = {
    Strong: { color: "var(--accent-green)", bg: "var(--accent-green-dim)", Icon: CheckCircle2 },
    Adequate: { color: "var(--accent-gold)", bg: "var(--accent-gold-dim)", Icon: Minus },
    Weak: { color: "var(--accent-red)", bg: "var(--accent-red-dim)", Icon: TrendingDown },
    Missing: { color: "var(--accent-red)", bg: "var(--accent-red-dim)", Icon: XCircle },
};

function StructureRow({ label, rating, comment }) {
    const cfg = RATING_CFG[rating] || RATING_CFG.Weak;
    const { Icon } = cfg;
    return (
        <div className="flex items-start gap-3 py-2.5 border-b border-bg-border last:border-0">
            <div className="flex items-center gap-1.5 w-28 shrink-0 pt-0.5">
                <Icon size={12} style={{ color: cfg.color }} />
                <span className="text-xs font-mono text-text-muted">{label}</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0"
                style={{ background: cfg.bg, color: cfg.color }}>{rating}</span>
            <p className="text-xs text-text-secondary leading-relaxed flex-1">{comment}</p>
        </div>
    );
}

function EvalResult({ data, provider }) {
    const [topperOpen, setTopperOpen] = useState(false);
    const [copied, setCopied] = useState(false);

  const isSample = false;

    const copy = () => {
        navigator.clipboard.writeText(data.topper_answer || "");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-3 mt-4">

            {/* Provider badge */}
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                    style={isSample
                        ? { background: "var(--accent-gold-dim)", color: "var(--accent-gold)", borderColor: "rgba(245,158,11,.3)" }
                        : { background: "var(--accent-green-dim)", color: "var(--accent-green)", borderColor: "rgba(16,185,129,.3)" }}>
                    {isSample ? "⚠ Sample (AI provider unavailable)" : `✓ Evaluated by ${provider}`}
                </span>
            </div>

            {/* Score + rationale */}
            <div className="glass-panel p-4 flex items-center gap-4">
                <ScoreRing score={data.score} />
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-1">Examiner Score</p>
                    <p className="text-sm text-text-primary leading-relaxed">{data.score_rationale}</p>
                </div>
            </div>
            {data.examiner_verdict && (
                <div className="glass-panel p-4 mt-3">
                    <div className="flex items-center gap-2 mb-2">
                        <Award size={13} className="text-accent-gold" />
                        <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider">
                            Examiner Verdict
                        </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span
                            className="text-[11px] font-mono px-2 py-0.5 rounded-full"
                            style={{
                                background: "var(--accent-gold-dim)",
                                color: "var(--accent-gold)",
                                border: "1px solid rgba(245,158,11,.25)"
                            }}
                        >
                            {data.examiner_verdict.band}
                        </span>
                    </div>

                    {data.examiner_verdict.why_not_higher && (
                        <p className="text-sm text-text-secondary leading-relaxed">
                            <strong>Why not higher?</strong>{" "}
                            {data.examiner_verdict.why_not_higher}
                        </p>
                    )}
                </div>
            )}
            {/* Keywords */}
            {data.keywords && (
                <div className="glass-panel p-4 space-y-2.5">
                    <div className="flex items-center gap-2">
                        <Key size={13} className="text-accent-gold" />
                        <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider">Keyword Analysis</h3>
                    </div>
                    {data.keywords.present?.length > 0 && (
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-mono text-text-muted flex items-center gap-1">
                                <CheckCircle2 size={9} className="text-accent-green" /> Used ({data.keywords.present.length})
                            </p>
                            <div className="flex flex-wrap gap-1.5">{data.keywords.present.map(k => <KeyChip key={k} word={k} type="present" />)}</div>
                        </div>
                    )}
                    {data.keywords.bonus?.length > 0 && (
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-mono text-text-muted">Bonus</p>
                            <div className="flex flex-wrap gap-1.5">{data.keywords.bonus.map(k => <KeyChip key={k} word={k} type="bonus" />)}</div>
                        </div>
                    )}
                    {data.keywords.missing?.length > 0 && (
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-mono text-text-muted flex items-center gap-1">
                                <XCircle size={9} className="text-accent-red" /> Missing ({data.keywords.missing.length})
                            </p>
                            <div className="flex flex-wrap gap-1.5">{data.keywords.missing.map(k => <KeyChip key={k} word={k} type="missing" />)}</div>
                        </div>
                    )}
                </div>
            )}

            {/* Structure */}
            {data.structure && (
                <div className="glass-panel p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <FileText size={13} className="text-accent-gold" />
                        <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider">Structure Breakdown</h3>
                    </div>
                    <StructureRow label="Introduction" rating={data.structure.intro?.rating} comment={data.structure.intro?.comment} />
                    <StructureRow label="Body" rating={data.structure.body?.rating} comment={data.structure.body?.comment} />
                    <StructureRow label="Way Forward" rating={data.structure.way_forward?.rating} comment={data.structure.way_forward?.comment} />
                    <StructureRow label="Conclusion" rating={data.structure.conclusion?.rating} comment={data.structure.conclusion?.comment} />
                </div>
            )}

            {/* Strengths + Weaknesses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.strengths?.length > 0 && (
                    <div className="glass-panel p-4 space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp size={13} className="text-accent-green" />
                            <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider">Strengths</h3>
                        </div>
                        {data.strengths.map((s, i) => (
                            <p key={i} className="text-xs text-text-primary leading-relaxed">{typeof s === "string" ? s : s.point}</p>
                        ))}
                    </div>
                )}
                {data.weaknesses?.length > 0 && (
                    <div className="glass-panel p-4 space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingDown size={13} className="text-accent-red" />
                            <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider">To Improve</h3>
                        </div>
                        {data.weaknesses.map((w, i) => (
                            <div key={i} className="space-y-1">
                                <p className="text-xs text-text-primary leading-relaxed"> {typeof w === "string" ? w : w.point}</p>
                                {typeof w === "object" && w.fix && (
                                    <div className="flex items-start gap-1.5">
                                        <ArrowRight size={10} className="text-accent-gold shrink-0 mt-0.5" />
                                        <p className="text-[11px] font-mono" style={{ color: "var(--accent-gold)" }}>{w.fix}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Topper comparison */}
            {data.topper_comparison && (
                <div className="glass-panel p-4 space-y-3">
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
                            <p className="text-[10px] font-mono text-text-muted">References to add</p>
                            <div className="flex flex-wrap gap-1.5">
                                {data.topper_comparison.constitutional_statutory_references.map((r, i) => (
                                    <span key={i} className="text-[11px] font-mono px-2 py-0.5 rounded-full"
                                        style={{ background: "var(--accent-purple-dim,rgba(139,92,246,.1))", color: "var(--accent-purple,#8b5cf6)", border: "1px solid rgba(139,92,246,.2)" }}>
                                        {r}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {data.topper_comparison.data_points_missing?.length > 0 && (
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-mono text-text-muted">Data to add</p>
                            <div className="flex flex-wrap gap-1.5">
                                {data.topper_comparison.data_points_missing.map((d, i) => (
                                    <span key={i} className="text-[11px] font-mono px-2 py-0.5 rounded-full"
                                        style={{ background: "var(--accent-blue-dim,rgba(59,130,246,.1))", color: "var(--accent-blue,#3b82f6)", border: "1px solid rgba(59,130,246,.2)" }}>
                                        {d}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Topper answer collapsible */}
            {data.topper_answer && (
                <div>
                    <button onClick={() => setTopperOpen(v => !v)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 border"
                        style={{
                            background: topperOpen ? "var(--accent-gold-dim)" : "var(--bg-muted)",
                            borderColor: topperOpen ? "rgba(245,158,11,.3)" : "var(--bg-border)",
                        }}>
                        <div className="flex items-center gap-2">
                            <PenLine size={13} className="text-accent-gold" />
                            <span className="text-sm font-semibold text-text-primary">Topper's Model Answer</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                                style={{ background: "var(--accent-gold-dim)", color: "var(--accent-gold)" }}>AIR 1–10 Standard</span>
                        </div>
                        <ChevronDown size={14} className={`text-text-muted transition-transform duration-300 ${topperOpen ? "rotate-180" : ""}`} />
                    </button>
                    {topperOpen && (
                        <div className="glass-panel mt-2 p-5">
                            <div className="flex justify-end mb-3">
                                <button onClick={copy} className="btn-ghost flex items-center gap-1.5 text-xs">
                                    {copied ? <CheckCheck size={11} className="text-accent-green" /> : <Copy size={11} />}
                                    {copied ? "Copied!" : "Copy"}
                                </button>
                            </div>
                            {data.topper_answer.split("\n").filter(Boolean).map((para, i) => (
                                <p key={i} className="text-sm text-text-primary leading-8 mb-3 last:mb-0">{para}</p>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Priority actions */}
            {data.priority_actions?.length > 0 && (
                <div className="glass-panel p-4 space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                        <Zap size={13} className="text-accent-gold" />
                        <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider">Priority Actions</h3>
                    </div>
                    {data.priority_actions.map((a, i) => (
                        <div key={i} className="flex items-start gap-3 py-2 border-b border-bg-border last:border-0">
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0"
                                style={{ background: "var(--accent-gold-dim)", color: "var(--accent-gold)" }}>{i + 1}</span>
                            <p className="text-sm text-text-primary leading-relaxed">{a}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function AIEvaluatorPanel({ question, paper, answer, isLoggedIn }) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [provider, setProvider] = useState(null);
    const [error, setError] = useState(null);

    const wordCount = (answer || "").trim().split(/\s+/).filter(Boolean).length;

    const handleEvaluate = useCallback(async () => {
        if (!question?.trim()) { setError("No question loaded."); return; }
        if (wordCount < 20) { setError("Write at least 20 words before evaluating."); return; }

        setError(null); setResult(null); setLoading(true);
        try {
            const res = await evaluateAnswer({ question, answer, paper: paper || "GS2" });
            setResult(res.data);
            setProvider(res.provider_used);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [question, answer, paper, wordCount]);

    const reset = () => { setResult(null); setError(null); };

    // Not logged in
    if (!isLoggedIn) {
        return (
            <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl border"
                style={{ background: "var(--accent-gold-dim)", borderColor: "rgba(245,158,11,.25)" }}>
                <LogIn size={14} className="text-accent-gold shrink-0" />
                <p className="text-xs font-mono" style={{ color: "var(--accent-gold)" }}>
                    Sign in to unlock AI answer evaluation (Gemini · GPT-4 · Claude · Groq)
                </p>
            </div>
        );
    }

    return (
        <div className="mt-4">
            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-bg-border" />
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
                    style={{ background: "var(--accent-gold-dim)", border: "1px solid rgba(245,158,11,.2)" }}>
                    <Sparkles size={11} className="text-accent-gold" />
                    <span className="text-[11px] font-mono font-semibold" style={{ color: "var(--accent-gold)" }}>AI Evaluation</span>
                </div>
                <div className="flex-1 h-px bg-bg-border" />
            </div>

            {!result && !loading && (
                <>
                    {error && (
                        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
                            <AlertTriangle size={12} className="text-red-400 shrink-0" />
                            <p className="text-xs font-mono text-red-400">{error}</p>
                        </div>
                    )}
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-mono ${wordCount >= 200 ? "text-accent-green" : wordCount >= 80 ? "text-yellow-400" : "text-text-muted"}`}>
                            {wordCount}w — {wordCount < 80 ? "too short" : wordCount < 150 ? "10M range" : wordCount < 250 ? "15M range" : "good length"}
                        </span>
                    </div>
                    <button onClick={handleEvaluate} disabled={wordCount < 5}
                        className="btn-primary flex items-center justify-center gap-2 w-full">
                        <Sparkles size={13} /> Evaluate Answer with AI
                    </button>
                    <p className="text-[10px] font-mono text-text-muted text-center mt-1.5">
                        Uses Gemini 2.5 Flash · GPT-4o · Claude · Groq (auto-fallback) · 5 evaluations/day
                    </p>
                </>
            )}

            {loading && (
                <div className="glass-panel p-6 flex flex-col items-center gap-3">
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 rounded-full border-2 border-accent-gold/20 animate-ping" />
                        <div className="absolute inset-2 rounded-full border-2 border-t-accent-gold border-accent-gold/10 animate-spin" />
                        <Cpu size={16} className="absolute inset-0 m-auto text-accent-gold" />
                    </div>
                    <p className="text-sm font-semibold text-text-primary">Mentor is analysing…</p>
                    <p className="text-[11px] font-mono text-text-muted">Trying Gemini → GPT-4 → Claude → Groq</p>
                </div>
            )}

            {result && (
                <>
                    <EvalResult data={result} provider={provider} />
                    <button onClick={reset} className="btn-ghost flex items-center gap-1.5 text-xs mt-4 mx-auto">
                        <RefreshCw size={11} /> Evaluate a different answer
                    </button>
                </>
            )}
        </div>
    );
}