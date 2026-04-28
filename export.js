/* global CPI_DATA, FATF_STATUS, CRIME_TYPES */
"use strict";

const exportBtn = document.getElementById("btn-export");
if (exportBtn) exportBtn.addEventListener("click", runExport);

let currentScope = null;
document.addEventListener("country:select", (e) => {
  currentScope = e.detail && e.detail.alpha3 ? e.detail.alpha3 : null;
});

async function runExport() {
  if (!window.docx) {
    window.fimModal && window.fimModal.toast("docx library not loaded", "err");
    return;
  }
  const D = window.docx;
  const { Document, Packer, Paragraph, TextRun, HeadingLevel,
          Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } = D;

  const scope = currentScope;
  const cpi = scope && CPI_DATA[scope];
  const fatf = scope && FATF_STATUS[scope];
  const stats = (typeof window.crimeStats === "function") ? window.crimeStats() : null;
  const allEvents = (typeof window.crimeRecent === "function")
    ? window.crimeRecent(7 * 24 * 60 * 60 * 1000)
    : [];
  const events = scope ? allEvents.filter((e) => e.country === scope) : allEvents;
  const reportTitle = scope
    ? `FIM Country Report — ${cpi ? cpi.name : scope}`
    : `FIM Global Brief`;
  const dateStr = new Date().toISOString().slice(0, 10);

  const children = [];

  children.push(heading(reportTitle, HeadingLevel.TITLE));
  children.push(line(`Generated ${dateStr} · Financial Intelligence Monitor`, true));
  children.push(blank());

  // --- Section 1: Profile
  children.push(heading("1. Country profile", HeadingLevel.HEADING_1));
  if (scope && cpi) {
    children.push(table([
      ["Country",            `${cpi.name} (${scope})`],
      ["CPI 2024 score",     `${cpi.score} / 100`],
      ["FATF AML status",    fatf ? `${fatf.label} (${fatf.tier})` : "Not listed"],
      ["Tracked events",     `${(stats && stats.byCountry[scope]) || 0} in feed`],
      ["Period covered",     `Last 7 days (rolling)`]
    ], D));
  } else {
    children.push(line("Global view — no specific country selected. The brief covers all events captured in the live feed."));
    if (stats) {
      children.push(blank());
      children.push(table([
        ["Total events tracked", `${stats.total}`],
        ["Last 24 hours",        `${stats.last24h}`],
        ["Distinct jurisdictions", `${Object.keys(stats.byCountry).length}`]
      ], D));
    }
  }

  // --- Section 2: Recent activity
  children.push(blank());
  children.push(heading("2. Recent activity", HeadingLevel.HEADING_1));
  if (events.length === 0) {
    children.push(line("No events recorded for the selected scope in the active window."));
  } else {
    const rows = [["When", "Country", "Type", "Headline", "Agency", "Amount (USD)"]]
      .concat(events.slice(0, 40).map((e) => ([
        new Date(e.ts).toISOString().replace("T", " ").slice(0, 16),
        countryName(e.country),
        (CRIME_TYPES[e.type] && CRIME_TYPES[e.type].label) || e.type,
        e.title,
        e.agency || "—",
        e.amountUsd ? formatUsd(e.amountUsd) : "—"
      ])));
    children.push(table(rows, D, true));
  }

  // --- Section 3: Detected anomalies
  const alertList = collectAlertText();
  children.push(blank());
  children.push(heading("3. Detected anomalies", HeadingLevel.HEADING_1));
  if (alertList.length === 0) {
    children.push(line("No anomalies detected in the active window."));
  } else {
    alertList.forEach((a) => children.push(bullet(`[${a.severity}] ${a.title} — ${a.detail}`)));
  }

  // --- Section 4: Methodology + disclaimer
  children.push(blank());
  children.push(heading("4. Methodology & caveats", HeadingLevel.HEADING_1));
  children.push(line(
    "CPI 2024: Transparency International's Corruption Perceptions Index, 0–100 (higher = cleaner). " +
    "FATF lists: Black list = High-Risk Jurisdictions subject to a Call for Action; Grey list = Jurisdictions under Increased Monitoring."
  ));
  children.push(line(
    "Live feed: illustrative dataset distilled from public reporting. In production, replace with live ingest from OFAC, OFSI, EU Council, FATF, FinCEN, SEC, DOJ, Europol and national FIU sources. Treat events in this report as analyst input, not breaking news."
  ));
  children.push(blank());
  children.push(line(`Source: ${window.location.href}`, true));

  const doc = new Document({
    creator: "Financial Intelligence Monitor",
    title: reportTitle,
    description: "Auto-generated CPI + FATF + financial-crime brief",
    styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
    sections: [{ children }]
  });

  const blob = await Packer.toBlob(doc);
  const filename = `${reportTitle.replace(/[^\w\-]+/g, "_")}_${dateStr}.docx`;
  download(blob, filename);
  if (window.fimAudit) window.fimAudit.log("EXPORT_DOCX", scope || "global", `${events.length} events`);
  window.fimModal && window.fimModal.toast(`Exported ${filename}`, "ok");
}

function heading(text, level) {
  return new window.docx.Paragraph({
    text,
    heading: level,
    spacing: { before: 200, after: 120 }
  });
}
function line(text, italic) {
  return new window.docx.Paragraph({
    children: [new window.docx.TextRun({ text, italics: !!italic })],
    spacing: { after: 80 }
  });
}
function bullet(text) {
  return new window.docx.Paragraph({
    text,
    bullet: { level: 0 },
    spacing: { after: 40 }
  });
}
function blank() {
  return new window.docx.Paragraph({});
}
function table(rows, D, hasHeader) {
  const tableRows = rows.map((r, i) => new D.TableRow({
    children: r.map((cell) => new D.TableCell({
      children: [new D.Paragraph({
        children: [new D.TextRun({
          text: String(cell),
          bold: hasHeader && i === 0
        })]
      })],
      width: { size: Math.floor(9000 / r.length), type: D.WidthType.DXA },
      shading: hasHeader && i === 0 ? { fill: "1f6feb" } : undefined
    }))
  }));
  return new D.Table({
    rows: tableRows,
    width: { size: 9000, type: D.WidthType.DXA }
  });
}

function collectAlertText() {
  const items = document.querySelectorAll("#alerts-list li.alert:not(.empty)");
  return Array.from(items).map((li) => ({
    severity: (li.querySelector(".alert-sev") || {}).textContent || "",
    title:    (li.querySelector(".alert-title") || {}).textContent || "",
    detail:   (li.querySelector(".alert-detail") || {}).textContent || ""
  }));
}
function countryName(a3) {
  return (CPI_DATA[a3] && CPI_DATA[a3].name) || a3;
}
function formatUsd(n) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}
function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
