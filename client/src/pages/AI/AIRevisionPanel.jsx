import { useState, useEffect, useCallback } from "react";
import {
    Brain, Clock, CheckCircle2, RefreshCw, LogIn,
    Calendar, AlertCircle, Flame, BookOpen, Target, Zap,
} from "lucide-react";
import { getSpacedRepetition } from "../../hooks/useAI";

function daysBetween(dateStr) {
    const today = new Date().toISOString().split("T")[0];
    const diff = Math.ceil((new Date(dateStr) - new Date(today)) / 86400000);
    return diff;
}

function ReviewItem({ item, onDone }) {
    const [done, setDone] = useState(false);
    const days = daysBetween(item.next_review);
    const isOverdue = days < 0;
    const isDueToday = days === 0;

    return (
        <div className={`flex items-center gap-3 py-2.5 border-b border-bg-border last:border-0 transition-opacity ${done ? "opacity-40" : ""}`}>
            <button
                type="button"
                onClick={() => { setDone(true); onDone?.(item); }}
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${done ? "bg-accent-green border-accent-green/50" : "border-bg-border hover:border-accent-gold/50"
                    }`}>
                {done && <CheckCircle2 size={11} className="text-white" />}
            </button>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-text-primary">{item.topic}</p>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: "var(--bg-muted)", color: "var(--text-muted)", border: "1px solid var(--bg-border)" }}>
                        {item.paper}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full shrink-0"
                        style={{
                            background: isOverdue ? "var(--accent-red-dim,rgba(239,68,68,.1))" : isDueToday ? "var(--accent-gold-dim)" : "var(--bg-muted)",
                            color: isOverdue ? "var(--accent-red,#ef4444)" : isDueToday ? "var(--accent-gold)" : "var(--text-muted)",
                        }}>
                        {isOverdue ? `${Math.abs(days)}d overdue` : isDueToday ? "Due today" : `in ${days}d`}
                    </span>
                </div>
                <p className="text-[10px] font-mono text-text-muted mt-0.5">
                    Reviewed {item.review_count}x · every {item.interval_days}d · {item.difficulty}
                </p>
            </div>

            <div className="w-1.5 h-8 rounded-full shrink-0"
                style={{
                    background: item.difficulty === "hard"
                        ? "var(--accent-red,#ef4444)"
                        : item.difficulty === "easy"
                            ? "var(--accent-green,#10b981)"
                            : "var(--accent-gold)",
                }} />
        </div>
    );
}

export default function AIRevisionPanel({ isLoggedIn, compact = false, onNavigate }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        if (!isLoggedIn) return;
        setLoading(true); setError(null);
        try {
            const res = await getSpacedRepetition();
            setItems(res.items || []);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn]);

    useEffect(() => { load(); }, [load]);

    if (!isLoggedIn) {
        return (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                style={{ background: "var(--accent-gold-dim)", borderColor: "rgba(245,158,11,.25)" }}>
                <LogIn size={14} className="text-accent-gold shrink-0" />
                <p className="text-xs font-mono" style={{ color: "var(--accent-gold)" }}>
                    Sign in to use the AI-powered spaced repetition revision queue
                </p>
            </div>
        );
    }

    const overdue = items.filter(i => daysBetween(i.next_review) < 0);
    const dueToday = items.filter(i => daysBetween(i.next_review) === 0);
    const upcoming = items.filter(i => daysBetween(i.next_review) > 0);

    const hasItems = items.length > 0;

    const handleNavigate = (view) => {
        if (typeof onNavigate === 'function') {
            onNavigate(view);
        } else {
            console.warn('onNavigate is not a function', onNavigate);
        }
    };

    return (
        <div className="glass-panel overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-bg-border">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: "var(--accent-gold-dim)", border: "1px solid rgba(245,158,11,.2)" }}>
                        <Brain size={13} className="text-accent-gold" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text-primary">Revision Queue</p>
                        <p className="text-[10px] font-mono text-text-muted">
                            {loading ? "Loading…" : `${items.length} topics · ${overdue.length + dueToday.length} due`}
                        </p>
                    </div>
                </div>
                <button type="button" onClick={load} className="btn-ghost p-1.5 rounded-lg" title="Refresh">
                    <RefreshCw size={12} className={loading ? "animate-spin text-accent-gold" : "text-text-muted"} />
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 mx-4 mt-3 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
                    <AlertCircle size={12} className="text-red-400 shrink-0" />
                    <p className="text-xs font-mono text-red-400">{error}</p>
                </div>
            )}

            {/* Content */}
            <div className={`overflow-y-auto ${compact ? "max-h-64" : "max-h-96"} px-4 pb-3`}>
                {loading && items.length === 0 && (
                    <div className="flex items-center justify-center py-8">
                        <RefreshCw size={16} className="animate-spin text-accent-gold" />
                    </div>
                )}

                {!loading && !hasItems && (
                    <div className="text-center py-8 space-y-4">
                        <Brain size={32} className="mx-auto text-text-muted opacity-30" />
                        <p className="text-sm text-text-primary font-medium">No revision topics yet</p>
                        <p className="text-xs text-text-muted max-w-xs mx-auto">
                            The AI will automatically add topics based on your performance in <strong>Topicwise</strong> practice and <strong>Test Series</strong>.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2 justify-center mt-2">
                            <button
                                type="button"
                                onClick={() => handleNavigate("pre")}
                                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-mono transition-all"
                                style={{ background: "var(--accent-gold)", color: "var(--bg-base)" }}
                            >
                                <Target size={14} /> Go to Prelims Grind
                            </button>
                            <button
                                type="button"
                                onClick={() => handleNavigate("test-series")}
                                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-mono transition-all border"
                                style={{ borderColor: "var(--accent-gold)", color: "var(--accent-gold)" }}
                            >
                                <Zap size={14} /> Take Test Series
                            </button>
                        </div>
                        <p className="text-[10px] font-mono text-text-muted/60 italic">
                            Practice questions → AI detects weak areas → auto‑scheduled revisions
                        </p>
                    </div>
                )}

                {hasItems && (
                    <>
                        {overdue.length > 0 && (
                            <div className="mt-3">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <Flame size={12} className="text-accent-red" />
                                    <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Overdue ({overdue.length})</p>
                                </div>
                                {overdue.map(item => <ReviewItem key={item.id} item={item} />)}
                            </div>
                        )}

                        {dueToday.length > 0 && (
                            <div className="mt-3">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <Calendar size={12} className="text-accent-gold" />
                                    <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Due Today ({dueToday.length})</p>
                                </div>
                                {dueToday.map(item => <ReviewItem key={item.id} item={item} />)}
                            </div>
                        )}

                        {!compact && upcoming.length > 0 && (
                            <div className="mt-3">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <Clock size={12} className="text-text-muted" />
                                    <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Upcoming ({upcoming.length})</p>
                                </div>
                                {upcoming.slice(0, 5).map(item => <ReviewItem key={item.id} item={item} />)}
                                {upcoming.length > 5 && (
                                    <p className="text-[10px] font-mono text-text-muted text-center py-2">+{upcoming.length - 5} more upcoming</p>
                                )}
                            </div>
                        )}

                        {/* Small hint to add more via practice */}
                        <div className="mt-4 pt-3 border-t border-bg-border/50 text-center">
                            <p className="text-[10px] font-mono text-text-muted">
                                <span className="opacity-60">Want more topics? </span>
                                <button
                                    type="button"
                                    onClick={() => handleNavigate("topic-wise")}
                                    className="text-accent-gold hover:underline"
                                >
                                    Practice Topicwise
                                </button>
                                <span className="opacity-60"> or </span>
                                <button
                                    type="button"
                                    onClick={() => handleNavigate("test-series")}
                                    className="text-accent-gold hover:underline"
                                >
                                    take a Test
                                </button>
                                <span className="opacity-60"> — AI will add them automatically.</span>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}