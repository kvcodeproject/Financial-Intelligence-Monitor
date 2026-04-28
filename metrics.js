/* global CPI_DATA, FATF_STATUS, FATF_BLACK */
"use strict";

const REFRESH_MS = 5000;
const VOLUME_WINDOW_MS = 15 * 60 * 1000;
const VOLUME_THRESHOLD = 3;
const AMOUNT_THRESHOLD = 500_000_000;
const BLACKLIST_WINDOW_MS = 60 * 60 * 1000;
const TYPE_CLUSTER_WINDOW_MS = 60 * 60 * 1000;
const TYPE_CLUSTER_THRESHOLD = 5;

const listEl = document.getElementById("alerts-list");
const countEl = document.getElementById("alerts-count");
const kpiAlertsEl = document.getElementById("kpi-alerts");

if (listEl) {
  refresh();
  setInterval(refresh, REFRESH_MS);
}

function refresh() {
  const events = (typeof window.crimeRecent === "function")
    ? window.crimeRecent(TYPE_CLUSTER_WINDOW_MS)
    : [];
  const alerts = detect(events);
  render(alerts);
  if (kpiAlertsEl) kpiAlertsEl.textContent = alerts.length;
}

function detect(events) {
  const now = Date.now();
  const out = [];

  // 1. Volume spike per country (last 15 min, ≥3 events)
  const byCountryRecent = {};
  events.forEach((e) => {
    if (now - e.ts <= VOLUME_WINDOW_MS) {
      (byCountryRecent[e.country] = byCountryRecent[e.country] || []).push(e);
    }
  });
  Object.entries(byCountryRecent).forEach(([c, list]) => {
    if (list.length >= VOLUME_THRESHOLD) {
      out.push({
        severity: "high",
        kind: "VOLUME",
        country: c,
        title: `Activity spike: ${list.length} events in 15 min`,
        detail: `${countryName(c)} — ${list.length} disclosures across ${uniqueTypes(list)} categories`,
        ts: list[0].ts
      });
    }
  });

  // 2. FATF black-list activity (any event in last hour)
  events.forEach((e) => {
    if (FATF_BLACK.includes(e.country) && now - e.ts <= BLACKLIST_WINDOW_MS) {
      out.push({
        severity: "critical",
        kind: "BLACKLIST",
        country: e.country,
        title: `FATF call-for-action jurisdiction activity`,
        detail: `${countryName(e.country)} • ${e.title}`,
        ts: e.ts
      });
    }
  });

  // 3. High-amount alert
  events.forEach((e) => {
    if (e.amountUsd && e.amountUsd >= AMOUNT_THRESHOLD) {
      out.push({
        severity: e.amountUsd >= 1_000_000_000 ? "critical" : "high",
        kind: "AMOUNT",
        country: e.country,
        title: `Material amount: ${formatUsd(e.amountUsd)}`,
        detail: `${countryName(e.country)} • ${e.title}`,
        ts: e.ts
      });
    }
  });

  // 4. Type clustering (≥5 events of same type in last hour)
  const byType = {};
  events.forEach((e) => {
    if (now - e.ts <= TYPE_CLUSTER_WINDOW_MS) {
      (byType[e.type] = byType[e.type] || []).push(e);
    }
  });
  Object.entries(byType).forEach(([t, list]) => {
    if (list.length >= TYPE_CLUSTER_THRESHOLD) {
      out.push({
        severity: "medium",
        kind: "CLUSTER",
        country: null,
        title: `${t} cluster: ${list.length} in last hour`,
        detail: `Cross-jurisdiction concentration of ${t.toLowerCase()} events`,
        ts: list[0].ts
      });
    }
  });

  // De-duplicate (same kind + country)
  const seen = new Set();
  return out.filter((a) => {
    const key = `${a.kind}|${a.country || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => severityRank(b.severity) - severityRank(a.severity) || b.ts - a.ts);
}

function render(alerts) {
  if (countEl) countEl.textContent = alerts.length;
  if (!alerts.length) {
    listEl.innerHTML = `<li class="alert empty">No anomalies detected in the active window.</li>`;
    return;
  }
  listEl.innerHTML = alerts.map((a) => `
    <li class="alert sev-${a.severity}" data-country="${a.country || ""}">
      <div class="alert-head">
        <span class="alert-sev">${a.severity.toUpperCase()}</span>
        <span class="alert-kind">${a.kind}</span>
        <span class="alert-time">${rel(a.ts)}</span>
      </div>
      <div class="alert-title">${escape(a.title)}</div>
      <div class="alert-detail">${escape(a.detail)}</div>
    </li>`).join("");

  listEl.querySelectorAll("li.alert").forEach((li) => {
    li.addEventListener("click", () => {
      const a3 = li.dataset.country;
      if (a3) document.dispatchEvent(new CustomEvent("country:select", { detail: { alpha3: a3, name: countryName(a3) } }));
    });
  });
}

function countryName(a3) {
  return (CPI_DATA[a3] && CPI_DATA[a3].name) || a3;
}
function uniqueTypes(list) {
  return new Set(list.map((e) => e.type)).size;
}
function severityRank(s) {
  return { critical: 3, high: 2, medium: 1, low: 0 }[s] || 0;
}
function formatUsd(n) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n}`;
}
function rel(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}
function escape(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}
