import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
// ── Register PWA service worker ──────────────────────────────────────────────
// autoUpdate is set in vite.config.js → the SW updates silently in background.
// We still wire up a callback so we can show a subtle "Updated — refresh" toast
// if needed in the future.
const updateSW = registerSW({
  onNeedRefresh() {
    // Could show a toast; for now auto-refresh silently.
    updateSW(true);
  },
  onOfflineReady() {
    console.log("[PWA] App ready for offline use.");
  },
});
window.__pwaPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  window.__pwaPrompt = e;
});
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);