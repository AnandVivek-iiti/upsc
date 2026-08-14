import { useState, useEffect, useCallback, useRef } from "react";
import {
    Brain, Clock, RefreshCw, LogIn,
    Calendar, AlertCircle, Flame, BookOpen, Target, Zap, Trash2,
} from "lucide-react";
import { getSpacedRepetition, deleteRevisionItem } from "../../hooks/useAI";

const SWIPE_DISMISS_THRESHOLD = 84;

function daysBetween(dateStr) {
    const today = new Date().toISOString().split("T")[0];
    const diff = Math.ceil((new Date(dateStr) - new Date(today)) / 86400000);
    return diff;
}

// Square checkbox with a bold green checkmark, styled after the reference
// green-check icon  - outline only when unselected, solid green check when selected.
function CheckboxIcon({ checked }) {
    const color = checked ? "var(--accent-green,#10b981)" : "var(--text-muted)";
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ pointerEvents: "none" }}>
            <rect x="4" y="4" width="16" height="16" rx="3"
                stroke={color} strokeWidth={checked ? 2.2 : 1.6} />
            {checked && (
                <path d="M6.5 12.3L10.3 16.2L17.8 7.2"
                    stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            )}
        </svg>
    );
}
function ReviewItem({ item, onDismiss, selected, onToggleSelect, onSelectMouseDown, onSelectMouseEnter, swipeEnabled }) {
    const [dragX, setDragX] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const startX = useRef(0);
    const days = daysBetween(item.next_review);
    const isOverdue = days < 0;
    const isDueToday = days === 0;

    const commitDismiss = () => {
        setLeaving(true);
        setTimeout(() => onDismiss?.(item), 180);
    };

    // Swipe-to-dismiss is mobile/touch only  - on laptop the only way to
    // clear an item is checkbox selection + the Clear button.
    const handlePointerDown = (e) => {
        if (!swipeEnabled) return;
        startX.current = e.clientX;
        setDragging(true);
    };
    const handlePointerMove = (e) => {
        if (!swipeEnabled || !dragging) return;
        setDragX(Math.min(0, e.clientX - startX.current));
    };
    const endDrag = () => {
        if (!swipeEnabled || !dragging) return;
        setDragging(false);
        if (dragX < -SWIPE_DISMISS_THRESHOLD) {
            setDragX(-320);
            commitDismiss();
        } else {
            setDragX(0);
        }
    };
    return (
        <div className="relative overflow-hidden">
            {/* Reveal layer behind the card, shown while swiping  - touch devices only */}
            {swipeEnabled && (
                <div className="absolute inset-0 flex items-center justify-end pr-4"
                    style={{ background: "var(--accent-red-dim,rgba(239,68,68,.12))" }}>
                    <Trash2 size={14} style={{ color: "var(--accent-red,#ef4444)" }} />
                </div>
            )}

            <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                className={`relative flex items-center gap-3 py-2.5 px-0.5 border-b border-bg-border last:border-0 select-none ${swipeEnabled ? "touch-pan-y" : ""}`}
                style={{
                    background: "var(--bg-surface, var(--bg-base))",
                    transform: `translateX(${dragX}px)`,
                    opacity: leaving ? 0 : 1,
                    transition: dragging ? "none" : "transform 0.25s cubic-bezier(0.16,1,0.3,1), opacity 0.18s ease",
                    cursor: swipeEnabled ? (dragging ? "grabbing" : "grab") : "default",
                }}
            >
                <button
                    type="button"
                    onClick={swipeEnabled ? () => onToggleSelect?.(item.id) : undefined}
                    onMouseDown={!swipeEnabled ? () => onSelectMouseDown?.(item.id) : undefined}
                    onMouseEnter={!swipeEnabled ? () => onSelectMouseEnter?.(item.id) : undefined}
                    onDragStart={(e) => e.preventDefault()}
                    className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-all"
                    title={selected ? "Deselect" : "Select to clear"}
                >
                    <CheckboxIcon checked={selected} />
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
        </div>
    );
}

export default function AIRevisionPanel({ isLoggedIn, compact = false, onNavigate }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedIds, setSelectedIds] = useState(() => new Set());
    // Swipe-to-dismiss only makes sense on touch devices; on laptop (mouse/
    // trackpad, no coarse pointer) clearing is checkbox selection + Clear button.
    const [swipeEnabled] = useState(() =>
        typeof window !== "undefined" && window.matchMedia
            ? window.matchMedia("(pointer: coarse)").matches
            : false
    );
    // Click-and-drag multi-select (laptop only): mousedown on a checkbox picks
    // the paint value (select/deselect), then dragging across other rows'
    // checkboxes while the mouse stays down applies that same value to each.
    const isDragSelectingRef = useRef(false);
    const dragPaintValueRef = useRef(true);

    useEffect(() => {
        const stopDragSelect = () => { isDragSelectingRef.current = false; };
        window.addEventListener("mouseup", stopDragSelect);
        return () => window.removeEventListener("mouseup", stopDragSelect);
    }, []);

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

    // Optimistic dismiss: remove locally right away for snappy feedback,
    // persist via DELETE in the background, roll back + surface the error
    // banner if it fails so the item doesn't silently reappear on refresh.
    const handleDismiss = useCallback((item) => {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        setSelectedIds((prev) => {
            if (!prev.has(item.id)) return prev;
            const next = new Set(prev);
            next.delete(item.id);
            return next;
        });

        deleteRevisionItem(item.id).catch(() => {
            setItems((prev) => [...prev, item]);
            setError("Couldn't clear that item  - try again.");
        });
    }, []);

    const toggleSelect = useCallback((id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }, []);

    const setItemSelected = useCallback((id, value) => {
        setSelectedIds((prev) => {
            if (prev.has(id) === value) return prev;
            const next = new Set(prev);
            if (value) next.add(id); else next.delete(id);
            return next;
        });
    }, []);

    // First checkbox in a drag decides whether the drag selects or deselects;
    // every checkbox the pointer then passes over (while still held down)
    // gets painted with that same value.
    const handleSelectMouseDown = useCallback((id) => {
        isDragSelectingRef.current = true;
        setSelectedIds((prev) => {
            const willSelect = !prev.has(id);
            dragPaintValueRef.current = willSelect;
            const next = new Set(prev);
            if (willSelect) next.add(id); else next.delete(id);
            return next;
        });
    }, []);

    const handleSelectMouseEnter = useCallback((id) => {
        if (!isDragSelectingRef.current) return;
        setItemSelected(id, dragPaintValueRef.current);
    }, [setItemSelected]);

    const clearSelected = useCallback(() => {
        const toClear = items.filter((i) => selectedIds.has(i.id));
        toClear.forEach((item) => handleDismiss(item));
    }, [items, selectedIds, handleDismiss]);

    const allSelected = items.length > 0 && selectedIds.size === items.length;
    const toggleSelectAll = useCallback(() => {
        setSelectedIds((prev) => (prev.size === items.length ? new Set() : new Set(items.map((i) => i.id))));
    }, [items]);

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
                <div className="flex items-center gap-1.5">
                    {hasItems && !swipeEnabled && (
                        <button
                            type="button"
                            onClick={toggleSelectAll}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-mono transition-all hover:bg-bg-muted"
                            style={{ color: "var(--text-muted)" }}
                            title={allSelected ? "Deselect all" : "Select all"}
                        >
                            <CheckboxIcon checked={allSelected} />
                            {allSelected ? "Deselect all" : "Select all"}
                        </button>
                    )}
                    {selectedIds.size > 0 && (
                        <button
                            type="button"
                            onClick={clearSelected}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono transition-all"
                            style={{ background: "var(--accent-green,#10b981)", color: "white" }}
                            title="Clear selected items"
                        >
                            <Trash2 size={11} /> Clear ({selectedIds.size})
                        </button>
                    )}
                    <button type="button" onClick={load} className="btn-ghost p-1.5 rounded-lg" title="Refresh">
                        <RefreshCw size={12} className={loading ? "animate-spin text-accent-gold" : "text-text-muted"} />
                    </button>
                </div>
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
                                {overdue.map(item => <ReviewItem key={item.id} item={item} onDismiss={handleDismiss} selected={selectedIds.has(item.id)} onToggleSelect={toggleSelect} onSelectMouseDown={handleSelectMouseDown} onSelectMouseEnter={handleSelectMouseEnter} swipeEnabled={swipeEnabled} />)}
                            </div>
                        )}

                        {dueToday.length > 0 && (
                            <div className="mt-3">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <Calendar size={12} className="text-accent-gold" />
                                    <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Due Today ({dueToday.length})</p>
                                </div>
                                {dueToday.map(item => <ReviewItem key={item.id} item={item} onDismiss={handleDismiss} selected={selectedIds.has(item.id)} onToggleSelect={toggleSelect} onSelectMouseDown={handleSelectMouseDown} onSelectMouseEnter={handleSelectMouseEnter} swipeEnabled={swipeEnabled} />)}
                            </div>
                        )}

                        {!compact && upcoming.length > 0 && (
                            <div className="mt-3">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <Clock size={12} className="text-text-muted" />
                                    <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Upcoming ({upcoming.length})</p>
                                </div>
                                {upcoming.slice(0, 5).map(item => <ReviewItem key={item.id} item={item} onDismiss={handleDismiss} selected={selectedIds.has(item.id)} onToggleSelect={toggleSelect} onSelectMouseDown={handleSelectMouseDown} onSelectMouseEnter={handleSelectMouseEnter} swipeEnabled={swipeEnabled} />)}
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
                                <span className="opacity-60"> - AI will add them automatically.</span>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}