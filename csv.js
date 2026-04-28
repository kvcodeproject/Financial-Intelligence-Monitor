/* global CPI_DATA, CRIME_TYPES */
"use strict";

let currentScope = null;
document.addEventListener("country:select", (e) => {
  currentScope = e.detail && e.detail.alpha3 ? e.detail.alpha3 : null;
});

const csvBtn = document.getElementById("btn-csv");
if (csvBtn) csvBtn.addEventListener("click", runCsv);

function runCsv() {
  const all = (typeof window.crimeRecent === "function")
    ? window.crimeRecent(7 * 24 * 60 * 60 * 1000)
    : [];
  const events = currentScope ? all.filter((e) => e.country === currentScope) : all;

  const header = [
    "timestamp_iso", "country_alpha3", "country_name", "type",
    "title", "agency", "amount_usd", "source_url", "submitter", "notes"
  ];
  const rows = events.map((e) => [
    new Date(e.ts).toISOString(),
    e.country,
    (CPI_DATA[e.country] && CPI_DATA[e.country].name) || "",
    (CRIME_TYPES[e.type] && CRIME_TYPES[e.type].label) || e.type,
    e.title,
    e.agency || "",
    e.amountUsd != null ? e.amountUsd : "",
    e.sourceUrl || "",
    e.submitter || "",
    e.notes || ""
  ]);

  const csv = [header, ...rows]
    .map((r) => r.map(esc).join(","))
    .join("\r\n");

  const filename = currentScope
    ? `fim-events-${currentScope}-${dateStamp()}.csv`
    : `fim-events-global-${dateStamp()}.csv`;

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  window.fimAudit && window.fimAudit.log("EXPORT_CSV",
    currentScope || "global",
    `${events.length} rows`);
  window.fimModal && window.fimModal.toast(`Exported ${filename}`, "ok");
}

function esc(v) { return `"${String(v).replace(/"/g, '""')}"`; }
function dateStamp() { return new Date().toISOString().slice(0, 10); }
