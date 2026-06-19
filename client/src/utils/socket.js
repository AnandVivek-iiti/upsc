import { io } from "socket.io-client";
const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

let _socket = null;
export function connectSocket(token) {
  if (!token) return null;
  if (_socket && _socket.auth?.token === token && _socket.connected) return _socket;

  if (_socket) {
    _socket.disconnect();
    _socket = null;
  }

  _socket = io(SOCKET_URL, {
    auth: { token },
        transports: ["polling", "websocket"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 30_000, 
    timeout: 10_000,
  });

  _socket.on("connect_error", (err) => {
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