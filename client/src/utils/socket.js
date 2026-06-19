import { io } from "socket.io-client";

// Same env var as utils/api.js, minus the trailing /api — socket.io connects
// at the server root, not under /api.
const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

let _socket = null;

// Connect (or reuse the existing connection) for the given auth token.
// Safe to call repeatedly — no-ops if already connected with the same token.
export function connectSocket(token) {
  if (!token) return null;
  if (_socket && _socket.auth?.token === token && _socket.connected) return _socket;

  if (_socket) {
    _socket.disconnect();
    _socket = null;
  }

  _socket = io(SOCKET_URL, {
    auth: { token },
    // Start with polling so the HTTP upgrade handshake succeeds in all
    // environments (including Render's reverse proxy). The client auto-upgrades
    // to WebSocket once polling succeeds.  Starting with "websocket" first
    // causes immediate hard failures in environments that require the upgrade
    // handshake, producing the console spam we see in dev.
    transports: ["polling", "websocket"],
    reconnection: true,
    reconnectionAttempts: 10,        // stop after 10 tries, not forever
    reconnectionDelay: 2000,         // 2 s initial back-off
    reconnectionDelayMax: 30_000,    // cap at 30 s
    timeout: 10_000,
  });

  _socket.on("connect_error", (err) => {
    // Suppress the noisy "WebSocket connection failed" spam — one clean warning
    // is enough.  The client will retry automatically per reconnectionAttempts.
    console.warn("[socket] connect error:", err.message);
  });

  return _socket;
}

export function disconnectSocket() {
  if (_socket) {
    _socket.disconnect();
    _socket = null;
  }
}

export function getSocket() {
  return _socket;
}