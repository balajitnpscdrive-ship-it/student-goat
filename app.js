/**
 * app.js — PWA GitHub Template Runtime
 * Reads PWA_CONFIG and wires up all PWA behaviors.
 */

(function () {
  "use strict";

  // ── Helpers ──────────────────────────────────────────────────
  const $ = (id) => document.getElementById(id);
  const cfg = window.PWA_CONFIG || {};

  // Merge defaults
  const config = Object.assign({
    name:        "GitHub App",
    shortName:   "GitApp",
    description: "A PWA wrapper for GitHub",
    targetUrl:   "https://github.com",
    displayMode: "standalone",
    themeColor:  "#0d1117",
    bgColor:     "#0d1117",
    orientation: "any",
    mode:        "redirect",
    splash: {
      title:    "Loading...",
      subtitle: "Powered by GitHub PWA Template",
    },
  }, cfg, { splash: Object.assign({}, { title: cfg.name || "Loading...", subtitle: "Powered by GitHub PWA Template" }, cfg.splash) });

  // ── Apply config to meta tags ────────────────────────────────
  document.title                           = config.name;
  $("page-title").textContent              = config.name;
  $("meta-desc").setAttribute("content",    config.description);
  $("meta-theme").setAttribute("content",   config.themeColor);
  $("meta-ms-tile").setAttribute("content", config.themeColor);
  $("meta-apple-title").setAttribute("content", config.shortName);
  $("og-title").setAttribute("content",     config.name);
  $("og-desc").setAttribute("content",      config.description);

  // ── Splash ───────────────────────────────────────────────────
  $("splash-title").textContent    = config.splash.title;
  $("splash-subtitle").textContent = config.splash.subtitle;

  // ── Install banner ───────────────────────────────────────────
  $("install-title").textContent = `Install ${config.shortName || config.name}`;

  // ── Top bar (iframe mode) ────────────────────────────────────
  $("top-bar-title").textContent = config.name;
  $("open-external-btn").href    = config.targetUrl;

  // ── Register Service Worker ──────────────────────────────────
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("sw.js")
      .then((reg) => console.log("[PWA] Service Worker registered:", reg.scope))
      .catch((err) => console.warn("[PWA] SW registration failed:", err));
  }

  // ── Offline / Online detection ───────────────────────────────
  const offlineToast = $("offline-toast");

  function updateOnlineStatus() {
    if (!navigator.onLine) {
      offlineToast.classList.add("visible");
    } else {
      offlineToast.classList.remove("visible");
    }
  }

  window.addEventListener("online",  updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);
  updateOnlineStatus();

  // ── PWA Install Prompt ───────────────────────────────────────
  let deferredPrompt = null;
  const installBanner = $("install-banner");
  const btnInstall    = $("btn-install");
  const btnDismiss    = $("btn-dismiss");

  // Check if already installed (standalone mode)
  function isStandalone() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (!isStandalone()) {
      // Delay slightly so splash finishes first
      setTimeout(() => installBanner.classList.add("visible"), 3000);
    }
  });

  btnInstall.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    installBanner.classList.remove("visible");
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log("[PWA] Install outcome:", outcome);
    deferredPrompt = null;
  });

  btnDismiss.addEventListener("click", () => {
    installBanner.classList.remove("visible");
    // Don't show again this session
    deferredPrompt = null;
  });

  window.addEventListener("appinstalled", () => {
    console.log("[PWA] App installed successfully!");
    installBanner.classList.remove("visible");
    deferredPrompt = null;
  });

  // ── Launch logic ─────────────────────────────────────────────
  function launch() {
    const splash    = $("splash");
    const appShell  = $("app-shell");
    const frame     = $("content-frame");

    if (config.mode === "iframe") {
      // Embed the target URL in an iframe
      frame.src = config.targetUrl;

      frame.addEventListener("load", () => {
        // Hide splash once iframe loads
        setTimeout(() => splash.classList.add("hidden"), 300);
        appShell.classList.add("active");
      }, { once: true });

      // Fallback: hide splash after 5s even if load doesn't fire
      setTimeout(() => {
        splash.classList.add("hidden");
        appShell.classList.add("active");
      }, 5000);

    } else {
      // Redirect mode: show splash briefly, then navigate
      setTimeout(() => {
        window.location.href = config.targetUrl;
      }, 1400);
    }
  }

  // Wait for DOM + config, then launch
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", launch);
  } else {
    launch();
  }

})();
