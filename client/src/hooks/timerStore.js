/**
 * timerStore.js
 * ─────────────
 * Module-level singleton for the study timer.
 * Lives outside React so it survives any page/view change.
 * Components subscribe via setInterval or a custom event.
 *
 * API:
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

function load() {
  try {
    return JSON.parse(localStorage.getItem(`upsc-timer-${todayKey()}`) || "{}").elapsed || 0;
  } catch {
    return 0;
  }
}

function persist(secs) {
  localStorage.setItem(`upsc-timer-${todayKey()}`, JSON.stringify({ elapsed: secs }));
}

const _listeners = new Set();

function notify() {
  _listeners.forEach((fn) => fn({ elapsed: store.elapsed, running: store.running }));
}

let _interval = null;

const store = {
  elapsed: load(),
  running: false,

  /** Seed from server hours (called once after data fetch) */
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

// Sync on page hide (tab switch, close)
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) persist(store.elapsed);
  });
}

export default store;
export { todayKey };