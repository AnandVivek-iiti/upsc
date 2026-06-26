import { getISTDateString } from "../utils/dateUtils";

function todayKey() {
  return getISTDateString();
}

// userId is set via setUser(); null = unauthenticated (no syncing)
let _userId = null;
let _socket = null;

let _autoStartAttempted = false;
let _hydrated = false;       // true once today's elapsed has been seeded from the SERVER for this page load
let _syncFn = null;          // registered by the UI: (hours) => Promise  →  POST /daily-log
let _lastSyncedSecs = 0;
let _remote = { active: false, elapsed: 0, at: 0 };

let _currentDay = null;      // IST date key (todayKey()) that `store.elapsed` currently belongs to
let _base = 0;                // Date.now() origin elapsed is computed from while running

const SYNC_EVERY_SECS = 30; // push cumulative hours to the backend this often while running

function broadcast() {
  if (!_socket || !store.running) return;
  _socket.emit("timer:state", { elapsed: store.elapsed, running: store.running });
}


// updates - no separate real-time plumbing needed here.
function syncNow() {
  if (!_syncFn || !_userId) return;
  if (store.elapsed === _lastSyncedSecs) return;
  _lastSyncedSecs = store.elapsed;
  const hours = parseFloat((store.elapsed / 3600).toFixed(2));
  _syncFn(hours);
}

/**
 * Detects whether the IST calendar day has changed since `elapsed` was last
 * tracked, and if so, closes out the old day and resets the counter to 0.
 * Returns true if a rollover happened.
 *
 * Called: every running tick, on tab refocus, and before start() - so it
 * catches the midnight crossing whether the timer is actively running or
 * was just left paused overnight.
 */
function checkDayRollover() {
  const day = todayKey();
  if (_currentDay === null) {
    _currentDay = day;
    return false;
  }
  if (day === _currentDay) return false;

  // Best-effort: flush whatever hasn't been synced yet under the OLD day
  // before wiping elapsed. Note this still lands wherever the backend's
  // /daily-log resolves "today" to (server clock), so a sync that fires
  // exactly at the boundary can occasionally be attributed to the new day —
  // acceptable since the periodic 30s sync keeps the gap to a few seconds.
  syncNow();

  _currentDay = day;
  store.elapsed = 0;
  _lastSyncedSecs = 0;
  _base = Date.now(); // re-anchor so a running timer keeps counting from 0
  notify();
  return true;
}

const _listeners = new Set();

function notify() {
  _listeners.forEach((fn) =>
    fn({ elapsed: store.elapsed, running: store.running, remote: { ..._remote } }),
  );
}

let _interval = null;
let _tickCount = 0;
let _syncTickCount = 0;

const store = {
  elapsed: 0,
  running: false,

  /** Must be called after auth resolves. Resets local state on user switch. */
  setUser(userId) {
    if (_userId === userId) return;
    if (store.running) {
      store.running = false;
      clearInterval(_interval);
      _interval = null;
    }
    _userId = userId || null;
    _hydrated = false;
    _currentDay = null;
    store.elapsed = 0;
    _lastSyncedSecs = 0;
    notify();
  },

  /** Registers the backend sync function (POST /daily-log). Call once from the UI. */
  setSyncHandler(fn) {
    _syncFn = fn;
  },

  hydrate(serverHours) {
    if (_hydrated) return;
    _hydrated = true;
    _currentDay = todayKey();
    store.elapsed = Math.round((serverHours || 0) * 3600);
    _lastSyncedSecs = store.elapsed;
    notify();
  },

  start() {
    if (store.running) return;
    checkDayRollover(); // catch "left paused, resumed after midnight"
    store.running = true;
    _base = Date.now() - store.elapsed * 1000;
    _tickCount = 0;
    _syncTickCount = 0;
    _interval = setInterval(() => {
      checkDayRollover(); // catch midnight crossing while running
      store.elapsed = Math.floor((Date.now() - _base) / 1000);
      // Broadcast to this user's other tabs/devices every ~5s, not every tick
      _tickCount = (_tickCount + 1) % 5;
      if (_tickCount === 0) broadcast();
      // Push cumulative hours to the backend every ~30s, not every tick
      _syncTickCount = (_syncTickCount + 1) % SYNC_EVERY_SECS;
      if (_syncTickCount === 0) syncNow();
      notify();
    }, 1000);
    broadcast();
    notify();
  },


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
    syncNow();
    if (_socket) _socket.emit("timer:state", { elapsed: store.elapsed, running: false });
    notify();
  },

  reset() {
    store.running = false;
    clearInterval(_interval);
    _interval = null;
    store.elapsed = 0;
    syncNow();
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

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (store.running) syncNow();
    } else {
      checkDayRollover();
    }
  });
}

export default store;
export { todayKey };