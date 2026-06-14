/**
 * timerStore.js — USER-SPECIFIC study timer singleton
 * ─────────────────────────────────────────────────────
 * Stores timer data per-user so study hours are never shared between accounts.
 * Key format: `upsc-timer-<userId>-<YYYY-MM-DD>`
 *
 * API:
 *   timerStore.setUser(userId)          ← MUST call after login / on init
 *   timerStore.elapsed   → number (seconds)
 *   timerStore.running   → boolean
 *   timerStore.start()
 *   timerStore.pause()
 *   timerStore.reset()
 *   timerStore.subscribe(fn)   → unsubscribe fn
 */

function todayKey() {
  return new Date().toISOString().split("T")[0];
}

// userId is set via setUser(); null = unauthenticated (no data persisted)
let _userId = null;

function storageKey() {
  if (!_userId) return null;
  return `upsc-timer-${_userId}-${todayKey()}`;
}

function load() {
  const key = storageKey();
  if (!key) return 0;
  try {
    return JSON.parse(localStorage.getItem(key) || "{}").elapsed || 0;
  } catch {
    return 0;
  }
}

function persist(secs) {
  const key = storageKey();
  if (!key) return;
  localStorage.setItem(key, JSON.stringify({ elapsed: secs }));
}

// Read stored hours for a given user+date (used by StudyChart)
export function getUserTimerHours(userId, dateStr) {
  if (!userId) return 0;
  try {
    const key = `upsc-timer-${userId}-${dateStr}`;
    const t = JSON.parse(localStorage.getItem(key) || "{}");
    return parseFloat(((t.elapsed || 0) / 3600).toFixed(2));
  } catch {
    return 0;
  }
}

const _listeners = new Set();

function notify() {
  _listeners.forEach((fn) => fn({ elapsed: store.elapsed, running: store.running }));
}

let _interval = null;

const store = {
  elapsed: 0,
  running: false,

  /** Must be called after auth resolves so the correct user's data is loaded */
  setUser(userId) {
    if (_userId === userId) return;
    // Pause any running timer before switching user
    if (store.running) {
      store.running = false;
      clearInterval(_interval);
      _interval = null;
    }
    _userId = userId || null;
    // Load this user's stored elapsed time
    store.elapsed = load();
    notify();
  },

  /** Seed from server hours (called once after data fetch, only if local has nothing) */
  seedFromServer(serverHours) {
    if (serverHours > 0 && load() === 0 && !store.running) {
      const secs = Math.round(serverHours * 3600);
      store.elapsed = secs;
      persist(secs);
      notify();
    }
  },

  start() {
    if (store.running) return;
    store.running = true;
    const base = Date.now() - store.elapsed * 1000;
    _interval = setInterval(() => {
      store.elapsed = Math.floor((Date.now() - base) / 1000);
      persist(store.elapsed);
      notify();
    }, 1000);
    notify();
  },

  pause() {
    if (!store.running) return;
    store.running = false;
    clearInterval(_interval);
    _interval = null;
    persist(store.elapsed);
    notify();
  },

  reset() {
    store.running = false;
    clearInterval(_interval);
    _interval = null;
    store.elapsed = 0;
    persist(0);
    notify();
  },

  subscribe(fn) {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },
};

// Persist on page hide
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && store.running) persist(store.elapsed);
  });
}

export default store;
export { todayKey };