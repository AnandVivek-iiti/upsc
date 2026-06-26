// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";
import PWAInstallPrompt from "./components/PWAInstallPrompt";

const updateSW = registerSW({
  onNeedRefresh() {
    console.log("[PWA] Update available.");
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
  <App /> 
);
