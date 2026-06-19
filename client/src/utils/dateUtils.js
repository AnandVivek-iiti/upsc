// ─── IST date helpers ──────────────────────────────────────────────────────
// Mirrors backend/src/utils/dateUtils.js. The dashboard was keying "today"
// off `date.toISOString().split("T")[0]` (UTC), while the day-of-week label
// came from `date.getDay()` (browser local time). For an IST user those two
// can point at different calendar dates near midnight, and the UTC date
// doesn't roll over until 5:30 AM IST — causing the timer/streak to look like
// it "doesn't reset at midnight" and weekly/monthly bars to land on the wrong
// day. Pinning everything to IST (regardless of system clock) fixes both.

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export function toIST(date = new Date()) {
  return new Date(date.getTime() + IST_OFFSET_MS);
}

// "YYYY-MM-DD" in IST
export function getISTDateString(date = new Date()) {
  return toIST(date).toISOString().split("T")[0];
}

// Calendar day-of-week (0=Sun..6=Sat) in IST — use instead of date.getDay()
// whenever you also used getISTDateString() for the same Date, so the label
// and the bucket always agree.
export function getISTDay(date = new Date()) {
  return toIST(date).getUTCDay();
}
