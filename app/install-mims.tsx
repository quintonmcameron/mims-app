"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** Registers the service worker (layout). Required for install prompt on many browsers. */
export function PwaSetup() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}

/** Home-screen card: install MIMS as a desktop / dock app (same domain, same build). */
export function InstallMimsBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setInstalled(isStandaloneDisplay());
    if (localStorage.getItem("mimsInstallDismissed") === "1") setDismissed(true);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferred(null);
  };

  const handleDismiss = () => {
    localStorage.setItem("mimsInstallDismissed", "1");
    setDismissed(true);
  };

  if (installed || dismissed) return null;

  return (
    <div
      className="card"
      style={{
        marginTop: 16,
        borderColor: "rgba(232,197,122,0.28)",
        background: "rgba(232,197,122,0.04)",
        padding: "16px 18px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            Desktop app
          </div>
          <p style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
            Install MIMS on your Mac or PC
          </p>
          <p className="muted small" style={{ margin: 0, lineHeight: 1.5 }}>
            Same app and domain as the website — opens full-width on your Mac or PC with a Dock or taskbar icon.
            Ideal for filling a deal while you&apos;re on a call.
          </p>
          {!deferred && (
            <p className="helper" style={{ marginTop: 10, marginBottom: 0 }}>
              <strong>Chrome / Edge:</strong> menu (⋮) → Install MIMS.
              <br />
              <strong>Safari (Mac):</strong> File → Add to Dock.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss install hint"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-3)",
            cursor: "pointer",
            fontSize: 18,
            lineHeight: 1,
            padding: 4,
          }}
        >
          ×
        </button>
      </div>
      {deferred && (
        <button
          type="button"
          className="btn btn-primary"
          style={{ width: "100%", marginTop: 14 }}
          onClick={handleInstall}
        >
          Install MIMS
        </button>
      )}
    </div>
  );
}
