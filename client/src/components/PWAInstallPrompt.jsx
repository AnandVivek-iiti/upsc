import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    ) {
      setInstalled(true);
      return;
    }

    const dismissed = sessionStorage.getItem("pwa-prompt-dismissed");
    if (dismissed) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !/crios|fxios|opios|mercury/i.test(navigator.userAgent); // real Safari only
    setIsIOS(ios);

    if (ios) {
       setShow(true);
      return;
    }
    const checkForPrompt = () => {
      if (window.__pwaPrompt) {
        setDeferredPrompt(window.__pwaPrompt);
        setShow(true);
        return true;
      }
      return false;
    };
   if (checkForPrompt()) return;
   const handler = (e) => {
      e.preventDefault();
      window.__pwaPrompt = e;
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  useEffect(() => {
    const handler = () => setShow(false);
    window.addEventListener("appinstalled", handler);
    return () => window.removeEventListener("appinstalled", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    window.__pwaPrompt = null;
    setDeferredPrompt(null);
    if (outcome === "accepted") setShow(false);
  };

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem("pwa-prompt-dismissed", "1");
  };

  if (!show || installed) return null;

  return (
   <div
  className="fixed left-4 right-4 z-[80] animate-slide-up"
  style={{
    bottom:
      "calc(var(--bottom-nav-h, 72px) + 1rem + var(--safe-bottom, 0px))",
  }}
>
      <div className="glass-panel flex items-center gap-3 px-4 py-3 max-w-sm mx-auto">
        {/* Icon */}
        <div
          className="w-9 h-9 rounded-lg bg-bg-muted flex items-center justify-center shrink-0 overflow-hidden"
          style={{ border: "1px solid rgba(245,158,11,0.2)" }}
        >
          <img src="/logo-upsc.png" alt="UPSC Mentor" className="w-full h-full object-cover" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-display font-semibold text-text-primary leading-tight">
            Install UPSC Mentor
          </p>
          {isIOS ? (
            <p className="text-[11px] text-text-muted font-mono mt-0.5 leading-tight">
              Tap <strong className="text-text-secondary">Share</strong> →{" "}
              <strong className="text-text-secondary">Add to Home Screen</strong>
            </p>
          ) : (
            <p className="text-[11px] text-text-muted font-mono mt-0.5">
              Add to home screen for offline access
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!isIOS && deferredPrompt && (
            <button
              onClick={handleInstall}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all"
              style={{
                background: "var(--accent-gold)",
                color: "var(--text-inverse)",
              }}
            >
              <Download size={11} />
              Install
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-muted transition-colors"
            aria-label="Dismiss"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
