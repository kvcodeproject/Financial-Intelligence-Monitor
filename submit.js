/* global CPI_DATA, CRIME_TYPES */
"use strict";

const submitBtn = document.getElementById("btn-submit");
if (submitBtn) submitBtn.addEventListener("click", openSubmit);

function openSubmit() {
  const countryOptions = Object.entries(CPI_DATA)
    .sort((a, b) => a[1].name.localeCompare(b[1].name))
    .map(([a3, info]) => `<option value="${a3}">${info.name} (${a3})</option>`)
    .join("");

  const typeOptions = Object.entries(CRIME_TYPES)
    .map(([k, t]) => `<option value="${k}">${t.label}</option>`)
    .join("");

  const html = `
    <form id="submit-form" class="form">
      <p class="form-lead">Log an enforcement action, sanction, fine, indictment, asset seizure, investigation, or fraud event. Submitted entries appear in the live feed and propagate to the metrics engine.</p>
      <label>Country <select name="country" required>${countryOptions}</select></label>
      <label>Event type <select name="type" required>${typeOptions}</select></label>
      <label>Headline <input name="title" type="text" required maxlength="180" placeholder="e.g. Regulator opens AML probe into…" /></label>
      <div class="form-row">
        <label>Issuing agency <input name="agency" type="text" required maxlength="80" placeholder="e.g. OFAC, FCA, FinCEN" /></label>
        <label>Amount (USD, optional) <input name="amountUsd" type="number" min="0" step="1000" placeholder="e.g. 250000000" /></label>
      </div>
      <div class="form-row">
        <label>Source URL (optional) <input name="sourceUrl" type="url" placeholder="https://…" /></label>
        <label>Submitted by <input name="submitter" type="text" maxlength="60" placeholder="analyst@team" /></label>
      </div>
      <label>Notes (optional) <textarea name="notes" rows="3" maxlength="600" placeholder="Internal context, severity rationale, related cases…"></textarea></label>
      <div class="form-actions">
        <span class="form-hint">All submissions are local to this session and broadcast to the in-page feed.</span>
        <button type="submit" class="btn primary">Submit to feed</button>
      </div>
    </form>`;

  window.fimModal.open({
    title: "Submit financial-crime intel",
    content: html,
    onMount: (body) => {
      const form = body.querySelector("#submit-form");
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const ev = {
          country: fd.get("country"),
          type: fd.get("type"),
          title: (fd.get("title") || "").toString().trim(),
          agency: (fd.get("agency") || "").toString().trim(),
          amountUsd: fd.get("amountUsd") ? Number(fd.get("amountUsd")) : undefined,
          sourceUrl: fd.get("sourceUrl") || undefined,
          submitter: fd.get("submitter") || "anonymous",
          notes: fd.get("notes") || undefined
        };
        if (typeof window.crimeAddEvent === "function") {
          window.crimeAddEvent(ev);
          if (window.fimAudit) window.fimAudit.log("SUBMIT", ev.country, ev.title);
          window.fimModal.toast(`Submitted: ${ev.title.slice(0, 50)}`, "ok");
          window.fimModal.close();
        } else {
          window.fimModal.toast("Crime feed not ready", "err");
        }
      });
    }
  });
}
