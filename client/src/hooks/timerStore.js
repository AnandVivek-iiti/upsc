
import { getISTDateString } from "../utils/dateUtils";

function todayKey() {
  return getISTDateString();
}

// userId is set via setUser(); null = unauthenticated (no data persisted)
let _userId = null;
let _socket = null;

let _autoStartAttempted = false;

// Live state mirrored from this user's OTHER open tabs/devices (read-only —
// we never let a remote tick override a session running locally).
let _remote = { active: false, elapsed: 0, at: 0 };

function broadcast() {
  if (!_socket || !store.running) return;
  _socket.emit("timer:state", { elapsed: store.elapsed, running: store.running });
}

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
  _listeners.forEach((fn) =>
    fn({ elapsed: store.elapsed, running: store.running, remote: { ..._remote } }),
  );
}

let _interval = null;
let _tickCount = 0;

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
    _tickCount = 0;
    _interval = setInterval(() => {
      store.elapsed = Math.floor((Date.now() - base) / 1000);
      persist(store.elapsed);
      // Broadcast to this user's other tabs/devices every ~5s, not every tick
      _tickCount = (_tickCount + 1) % 5;
      if (_tickCount === 0) broadcast();
      notify();
    }, 1000);
    broadcast();
    notify();
  },

  /**
   * Start the timer automatically when the app first opens, without
   * re-triggering on every later remount (e.g. SPA navigation back to the
   * Dashboard). Only does anything the first time it's called per page
   * load, and only if nothing is running yet — so it never overrides a
   * session a user already paused on purpose.
   */
  autoStart() {
    if (_autoStartAttempted) return;
    _autoStartAttempted = true;
    if (!store.running) store.start();
  },

  pause() {
    if (!store.running) return;
    store.running = false;
    clearInterval(_interval);
    _interval = null;
    persist(store.elapsed);
    if (_socket) _socket.emit("timer:state", { elapsed: store.elapsed, running: false });
    notify();
  },

  reset() {
    store.running = false;
    clearInterval(_interval);
    _interval = null;
    store.elapsed = 0;
    persist(0);
    if (_socket) _socket.emit("timer:state", { elapsed: 0, running: false });
    notify();
  },

  /** Wire a connected socket.io client for cross-tab/device real-time sync. */
  attachSocket(socket) {
    if (_socket === socket) return;
    _socket = socket;
    if (!_socket) return;
    _socket.off("timer:state");
    _socket.on("timer:state", (payload) => {
      if (payload.disconnected || !payload.running) {
        _remote = { active: false, elapsed: payload.elapsed || 0, at: Date.now() };
      } else {
        _remote = { active: true, elapsed: payload.elapsed || 0, at: Date.now() };
      }
      notify();
    });
  },

  detachSocket() {
    if (_socket) _socket.off("timer:state");
    _socket = null;
    _remote = { active: false, elapsed: 0, at: 0 };
    notify();
  },

  get remote() {
    return { ..._remote };
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