
import { useState, useEffect, useCallback } from "react";
import {
    Brain, Clock, CheckCircle2, Plus, RefreshCw, LogIn,
    Calendar, AlertCircle, Flame, BookOpen,
} from "lucide-react";
import { getSpacedRepetition, addToRevisionQueue } from "../../hooks/useAI";

const DIFFICULTY_OPTIONS = [
    { value: "hard", label: "Hard", color: "var(--accent-red)", days: 1 },
    { value: "medium", label: "Medium", color: "var(--accent-gold)", days: 3 },
    { value: "easy", label: "Easy", color: "var(--accent-green)", days: 7 },
];

const PAPER_OPTIONS = ["GS1", "GS2", "GS3", "GS4", "Essay", "CSAT", "General"];

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

export default function AIRevisionPanel({ isLoggedIn, compact = false }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [addOpen, setAddOpen] = useState(false);
    const [topic, setTopic] = useState("");
    const [paper, setPaper] = useState("GS2");
    const [diff, setDiff] = useState("medium");
    const [adding, setAdding] = useState(false);
    const [addMsg, setAddMsg] = useState(null);

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

    const handleAdd = async () => {
        if (!topic.trim()) return;
        setAdding(true); setAddMsg(null);
        try {
            const res = await addToRevisionQueue({ topic: topic.trim(), paper, difficulty: diff });
            setAddMsg(`Added "${res.item.topic}" — next review in ${res.item.interval_days}d`);
            setTopic(""); setAddOpen(false);
            load();
        } catch (e) {
            setAddMsg(e.message);
        } finally {
            setAdding(false);
        }
    };

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
                <div className="flex items-center gap-2">
                    <button onClick={load} className="btn-ghost p-1.5 rounded-lg" title="Refresh">
                        <RefreshCw size={12} className={loading ? "animate-spin text-accent-gold" : "text-text-muted"} />
                    </button>
                    <button onClick={() => setAddOpen(v => !v)}
                        className="flex items-center gap-1 text-xs font-mono px-2.5 py-1.5 rounded-lg transition-all"
                        style={{ background: "var(--accent-gold)", color: "var(--bg-base)" }}>
                        <Plus size={11} /> Add Topic
                    </button>
                </div>
            </div>

            {/* Add form */}
            {addOpen && (
                <div className="px-4 py-3 border-b border-bg-border bg-bg-muted space-y-3">
                    <input
                        value={topic} onChange={e => setTopic(e.target.value)}
                        placeholder="Topic name (e.g. Governor's Role, MSP, GS4 Ethics)"
                        className="w-full bg-bg-base border border-bg-border rounded-xl px-3 py-2 text-sm text-text-primary
                       focus:outline-none focus:border-accent-gold/40 transition-colors placeholder:text-text-muted"
                    />
                    <div className="flex gap-2 flex-wrap">
                        <select value={paper} onChange={e => setPaper(e.target.value)}
                            className="bg-bg-base border border-bg-border rounded-lg px-2 py-1.5 text-xs font-mono text-text-primary focus:outline-none">
                            {PAPER_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <div className="flex gap-1">
                            {DIFFICULTY_OPTIONS.map(d => (
                                <button key={d.value} onClick={() => setDiff(d.value)}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border"
                                    style={diff === d.value
                                        ? { background: `${d.color}20`, color: d.color, borderColor: `${d.color}40` }
                                        : { borderColor: "var(--bg-border)", color: "var(--text-muted)" }}>
                                    {d.label} ({d.days}d)
                                </button>
                            ))}
                        </div>
                        <button onClick={handleAdd} disabled={!topic.trim() || adding}
                            className="btn-primary flex items-center gap-1 text-xs px-3 py-1.5 ml-auto">
                            {adding ? <RefreshCw size={11} className="animate-spin" /> : <Plus size={11} />}
                            {adding ? "Adding…" : "Add"}
                        </button>
                    </div>
                    {addMsg && (
                        <p className="text-[11px] font-mono" style={{ color: addMsg.includes("Added") ? "var(--accent-green)" : "var(--accent-red)" }}>
                            {addMsg}
                        </p>
                    )}
                </div>
            )}

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

                {!loading && items.length === 0 && (
                    <div className="text-center py-8 space-y-2">
                        <BookOpen size={28} className="mx-auto text-text-muted opacity-40" />
                        <p className="text-sm text-text-muted">No topics in queue yet.</p>
                        <p className="text-xs font-mono text-text-muted">Add topics above to start spaced repetition.</p>
                    </div>
                )}

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
            </div>
        </div>
    );
}