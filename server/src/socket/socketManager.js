const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io = null;

const allowedOrigins = [
  "http://localhost:5173",
  "https://upsc-by-iitian.onrender.com",
];

function userRoom(userId) {
  return `user:${userId}`;
}

// ─── Init — call once with the http.Server instance ──────────────────────────
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // ── Auth middleware — same JWT used by REST routes ──────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token provided."));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Invalid or expired token."));
    }
  });

  io.on("connection", (socket) => {
    const room = userRoom(socket.userId);
    socket.join(room);

    // ── Personal-device timer relay ───────────────────────────────────────────
    // A tab/device broadcasts its own timer state; we relay it to every OTHER
    // socket the same user has open (other tabs/devices), so the dashboard can
    // show "studying on another device" in real time. We never persist these —
    // persistence still goes through the existing REST /daily-log endpoint.
    socket.on("timer:state", (payload) => {
      socket.to(room).emit("timer:state", {
        ...payload,
        deviceId: socket.id,
      });
    });

    socket.on("disconnect", () => {
      socket.to(room).emit("timer:state", {
        deviceId: socket.id,
        running: false,
        disconnected: true,
      });
    });
  });

  return io;
}

// ─── Emit a dashboard event to every open tab/device of one user ─────────────
function emitToUser(userId, event, payload) {
  if (!io || !userId) return;
  io.to(userRoom(userId)).emit(event, payload);
}

module.exports = { initSocket, emitToUser };
