// ─── IST date helpers ──────────────────────────────────────────────────────
// Bug fixed: code was using `new Date().toISOString().split("T")[0]`, which
// reads the date in UTC. Render/most hosts run servers in UTC, so for an
// India-based user (UTC+5:30) the "day" doesn't roll over until 5:30 AM IST
// instead of 12:00 AM IST — that's why streaks/daily-logs weren't resetting
// at midnight. These helpers shift to IST wall-clock time before formatting,
// regardless of the server's actual system timezone.

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function toIST(date = new Date()) {
  return new Date(date.getTime() + IST_OFFSET_MS);
}

// "YYYY-MM-DD" in IST
function getISTDateString(date = new Date()) {
  return toIST(date).toISOString().split("T")[0];
}

// Calendar day-of-week (0=Sun..6=Sat) in IST
function getISTDay(date = new Date()) {
  return toIST(date).getUTCDay();
}

module.exports = { getISTDateString, getISTDay, toIST, IST_OFFSET_MS };
