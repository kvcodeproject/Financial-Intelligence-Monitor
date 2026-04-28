"use strict";

const KEY = "fim:audit";
const MAX = 200;

const KIND_LABELS = {
  SELECT:        "Country select",
  SUBMIT:        "Intel submitted",
  SHARE_COPY:    "Permalink copied",
  SHARE_SEND:    "Channel pushed",
  EXPORT_DOCX:   "DOCX export",
  EXPORT_CSV:    "CSV export",
  WATCH_ADD:     "Watchlist add",
  WATCH_REMOVE:  "Watchlist remove",
  AUDIT_CLEAR:   "Audit cleared"
};

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}
function save(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX))); } catch {}
}

window.fimAudit = {
  log(kind, scope, detail) {
    const entry = { ts: Date.now(), kind, scope: scope || "", detail: detail || "" };
    const list = [entry, ...load()];
    save(list);
    document.dispatchEvent(new CustomEvent("audit:append", { detail: entry }));
    return entry;
  },
  list() { return load(); },
  clear() {
    save([]);
    document.dispatchEvent(new CustomEvent("audit:append", { detail: null }));
  },
  labels: KIND_LABELS
};

const auditBtn = document.getElementById("btn-audit");
if (auditBtn) auditBtn.addEventListener("click", openAuditModal);

function openAuditModal() {
  const entries = load();
  const rows = entries.length
    ? entries.map((e) => `
        <tr>
          <td class="mono">${new Date(e.ts).toISOString().replace("T", " ").slice(0, 19)}</td>
          <td><span class="audit-kind audit-${e.kind}">${KIND_LABELS[e.kind] || e.kind}</span></td>
          <td>${escape(e.scope)}</td>
          <td>${escape(e.detail)}</td>
        </tr>`).join("")
    : `<tr><td colspan="4" class="empty">No audit entries yet.</td></tr>`;

  const html = `
    <div class="audit">
      <p class="form-lead">Local action log (last ${MAX}). Stored in browser localStorage; not synced.</p>
      <div class="audit-actions">
        <button type="button" class="btn" id="audit-export">Export CSV</button>
        <button type="button" class="btn" id="audit-clear">Clear log</button>
        <span class="form-hint">${entries.length} entr${entries.length === 1 ? "y" : "ies"}</span>
      </div>
      <div class="audit-table-wrap">
        <table class="audit-table">
          <thead><tr><th>Time (UTC)</th><th>Action</th><th>Scope</th><th>Detail</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;

  window.fimModal.open({
    title: "Audit log",
    content: html,
    onMount: (body) => {
      body.querySelector("#audit-export").addEventListener("click", () => exportCsv(load()));
      body.querySelector("#audit-clear").addEventListener("click", () => {
        if (!confirm("Clear all audit entries? This cannot be undone.")) return;
        window.fimAudit.clear();
        window.fimAudit.log("AUDIT_CLEAR", "", "");
        window.fimModal.close();
        window.fimModal.toast("Audit log cleared", "ok");
      });
    }
  });
}

function exportCsv(list) {
  const header = ["timestamp_iso", "kind", "scope", "detail"];
  const rows = list.map((e) => [new Date(e.ts).toISOString(), e.kind, e.scope, e.detail]);
  const csv = [header, ...rows].map((r) =>
    r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
  ).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fim-audit-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  window.fimModal.toast("Audit log exported", "ok");
}

function escape(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}
