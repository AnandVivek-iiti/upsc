import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
let isApplyingUpdate = false;

const updateSW = registerSW({
  onNeedRefresh() {
    if (isApplyingUpdate) return;
    isApplyingUpdate = true;
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