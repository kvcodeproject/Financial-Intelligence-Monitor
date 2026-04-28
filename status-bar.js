"use strict";

const APP_VERSION_FALLBACK = "1.0.0";

const utcEl       = document.getElementById("utc-time");
const dateEl      = document.getElementById("utc-date");
const sbVersion   = document.getElementById("sb-version");
const sbPlatform  = document.getElementById("sb-platform");
const sbLast      = document.getElementById("sb-last");
const sbStatusDot = document.getElementById("sb-status-dot");
const sbStatusTxt = document.getElementById("sb-status-text");

const fim = (typeof window !== "undefined" && window.fim) || null;
const version  = (fim && fim.versions && fim.versions.app) || APP_VERSION_FALLBACK;
const platform = describePlatform(fim);

if (sbVersion)  sbVersion.textContent  = `v${version}`;
if (sbPlatform) sbPlatform.textContent = platform;

document.querySelectorAll("[data-version-pill]").forEach((el) => {
  el.textContent = `v${version}`;
});

tickClock();
setInterval(tickClock, 1000);

window.addEventListener("offline", () => setStatus("offline"));
window.addEventListener("online",  () => setStatus("ok"));
setStatus(navigator.onLine === false ? "offline" : "ok");

function tickClock() {
  const now = new Date();
  if (utcEl)  utcEl.textContent  = now.toISOString().slice(11, 19);
  if (dateEl) dateEl.textContent = now.toISOString().slice(0, 10);
  if (sbLast) sbLast.textContent = now.toLocaleTimeString([], { hour12: false });
}

function setStatus(state) {
  if (!sbStatusDot || !sbStatusTxt) return;
  if (state === "offline") {
    sbStatusDot.style.background = "#ff5b5b";
    sbStatusTxt.textContent = "OFFLINE";
    sbStatusTxt.style.color = "#ff5b5b";
  } else {
    sbStatusDot.style.background = "#3fb950";
    sbStatusTxt.textContent = "OPERATIONAL";
    sbStatusTxt.style.color = "#3fb950";
  }
}

function describePlatform(f) {
  if (!f) return "Web";
  const map = { darwin: "macOS", win32: "Windows", linux: "Linux" };
  const os = map[f.platform] || f.platform || "Desktop";
  return `${os} · ${f.arch || ""}`.trim();
}
