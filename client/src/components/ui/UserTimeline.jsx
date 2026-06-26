/**
 * UserTimeline.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Feature 8 - Study Session Timeline
 *
 * Renders a chronological event log of study sessions.
 * Can be used in two modes:
 *
 *   Mode A - Today's inline timeline (pass `events` prop from useSubjectTimer):
 *     <UserTimeline events={todayTimeline} compact />
 *
 *   Mode B - Full paginated history (fetches from GET /api/subject-sessions/timeline):
 *     <UserTimeline userId={userId} isLoggedIn={isLoggedIn} />
 *
 * Visual design:
 *   - Vertical connector line between events
 *   - Subject-colored dot for each event
 *   - Time in IST format (12h)
 *   - Session duration on "end" events
 *   - "Today" / yesterday / date labels as section dividers
 */

import { useState, useEffect, useCallback } from "react";
import { Clock, RefreshCw } from "lucide-react";
import { SUBJECT_COLORS, SUBJECT_ICONS } from "../../hooks/useSubjectTimer";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function authHeaders() {
  const token = localStorage.getItem("upsc_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── Formatters ───────────────────────────────────────────────────────────────
function fmtTime(epochMs) {
  return new Date(Number(epochMs)).toLocaleTimeString("en-IN", {
    hour:   "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

function fmtHM(secs) {
  if (!secs) return "0m";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function dateLabel(dateStr) {
  if (!dateStr) return "";
  const today     = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateStr === today)     return "Today";
  if (dateStr === yesterday) return "Yesterday";
  // Format as "12 Jun 2026"
  const [y, m, d] = dateStr.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

// ─── Single event row ─────────────────────────────────────────────────────────
function TimelineEvent({ event, isLast }) {
  const color   = SUBJECT_COLORS[event.subject] || "#94a3b8";
  const icon    = SUBJECT_ICONS[event.subject]  || "📚";
  const isStart = event.type === "session_start";

  return (
    <div className="flex gap-3 relative">
      {/* Connector line */}
      {!isLast && (
        <div
          className="absolute left-[13px] top-6 w-px"
          style={{
            height: "calc(100% - 4px)",
            background: `linear-gradient(180deg, ${color}40 0%, transparent 100%)`,
          }}
        />
      )}

      {/* Dot */}
      <div className="relative shrink-0 mt-1">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[11px]"
          style={{
            background: isStart ? `${color}20` : `${color}12`,
            border: `1.5px solid ${isStart ? color : `${color}50`}`,
          }}
        >
          {isStart ? "▶" : "■"}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-4 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-medium text-text-primary leading-snug">
              <span className="mr-1">{icon}</span>
              {event.label}
            </p>
            {event.duration && !isStart && (
              <span
                className="inline-block mt-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{ background: `${color}14`, color }}
              >
                {fmtHM(event.duration)}
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-text-muted shrink-0 mt-0.5">
            {fmtTime(event.time)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main UserTimeline ────────────────────────────────────────────────────────
/**
 * Props:
 *   events      - pre-fetched events array (today's timeline from useSubjectTimer)
 *   compact     - if true, shows only 6 events with no pagination
 *   userId      - enables self-fetching mode (full timeline)
 *   isLoggedIn  - guards the self-fetching mode
 */
export default function UserTimeline({
  events:    externalEvents = null,
  compact    = false,
  userId     = null,
  isLoggedIn = false,
}) {
  const [events,  setEvents]  = useState(externalEvents || []);
  const [loading, setLoading] = useState(false);
  const [offset,  setOffset]  = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const LIMIT = compact ? 6 : 30;

  // Self-fetch mode - only used when no externalEvents provided
  const fetchEvents = useCallback(async (newOffset = 0) => {
    if (!isLoggedIn || !userId || externalEvents !== null) return;
    setLoading(true);
    try {
      const res  = await fetch(
        `${BASE}/subject-sessions/timeline?limit=${LIMIT}&offset=${newOffset}`,
        { headers: authHeaders() }
      );
      const json = await res.json();
      if (json.success) {
        setEvents((prev) => newOffset === 0 ? json.events : [...prev, ...json.events]);
        setHasMore(json.events.length === LIMIT);
        setOffset(newOffset + json.events.length);
      }
    } catch { /* non-fatal */ }
    finally  { setLoading(false); }
  }, [isLoggedIn, userId, externalEvents, LIMIT]);

  useEffect(() => {
    if (externalEvents !== null) {
      setEvents(externalEvents);
    } else {
      fetchEvents(0);
    }
  }, [externalEvents, fetchEvents]);

  // Group events by date for section dividers
  const grouped = (() => {
    const map = new Map(); // date → events[]
    for (const e of events) {
      const key = e.date || new Date(Number(e.time)).toISOString().slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(e);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  })();

  if (!isLoggedIn && externalEvents === null) {
    return (
      <p className="text-[11px] font-mono text-text-muted py-2">
        Sign in to see your study timeline.
      </p>
    );
  }

  if (!loading && events.length === 0) {
    return (
      <div className="py-4 text-center">
        <Clock size={20} className="text-text-muted mx-auto mb-2" />
        <p className="text-sm font-mono text-text-muted">No study sessions recorded yet.</p>
        <p className="text-xs text-text-muted mt-1">Start a timer session to see your timeline.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header (only in self-fetch mode) */}
      {externalEvents === null && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={13} className="text-accent-gold" />
            <h3 className="text-sm font-display font-semibold text-text-primary">Study Timeline</h3>
          </div>
          <button
            onClick={() => fetchEvents(0)}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-bg-muted transition-colors"
          >
            <RefreshCw size={11} className={`text-text-muted ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      )}

      {/* Grouped event list */}
      <div>
        {grouped.map(([date, dateEvents]) => (
          <div key={date} className="mb-3">
            {/* Date divider */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                {dateLabel(date)}
              </span>
              <div className="flex-1 h-px bg-bg-border/50" />
            </div>

            {/* Events for this date */}
            <div>
              {dateEvents.map((event, i) => (
                <TimelineEvent
                  key={`${event.type}-${event.time}`}
                  event={event}
                  isLast={i === dateEvents.length - 1}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton loader */}
      {loading && (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-bg-muted shrink-0 mt-1" />
              <div className="flex-1 space-y-1.5 pb-4">
                <div className="h-3 bg-bg-muted rounded w-3/4" />
                <div className="h-2.5 bg-bg-muted rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      {!compact && hasMore && !loading && externalEvents === null && (
        <button
          onClick={() => fetchEvents(offset)}
          className="w-full py-2 text-[11px] font-mono text-text-muted hover:text-text-primary
                     border border-bg-border rounded-lg hover:bg-bg-muted transition-colors"
        >
          Load more
        </button>
      )}
    </div>
  );
}