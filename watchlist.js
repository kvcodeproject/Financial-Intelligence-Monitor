/* global CPI_DATA, FATF_STATUS */
"use strict";

const KEY = "fim:watchlist";
const REFRESH_MS = 5000;

const listEl = document.getElementById("watchlist-list");
const countEl = document.getElementById("watchlist-count");
const emptyEl = document.getElementById("watchlist-empty");

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}
function save(arr) {
  try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch {}
}

window.fimWatchlist = {
  list:    () => load(),
  has:     (a3) => load().includes(a3),
  add(a3) {
    const cur = load();
    if (!cur.includes(a3)) {
      cur.push(a3);
      save(cur);
      const name = (CPI_DATA[a3] && CPI_DATA[a3].name) || a3;
      window.fimAudit && window.fimAudit.log("WATCH_ADD", name, a3);
      document.dispatchEvent(new CustomEvent("watchlist:change"));
      window.fimModal && window.fimModal.toast(`${name} added to watchlist`, "ok");
    }
  },
  remove(a3) {
    const cur = load().filter((c) => c !== a3);
    save(cur);
    const name = (CPI_DATA[a3] && CPI_DATA[a3].name) || a3;
    window.fimAudit && window.fimAudit.log("WATCH_REMOVE", name, a3);
    document.dispatchEvent(new CustomEvent("watchlist:change"));
    window.fimModal && window.fimModal.toast(`${name} removed from watchlist`, "ok");
  },
  toggle(a3) {
    if (this.has(a3)) this.remove(a3);
    else this.add(a3);
  }
};

if (listEl) {
  render();
  document.addEventListener("watchlist:change", render);
  setInterval(render, REFRESH_MS);
}

let lastSeenCounts = {};

function render() {
  const items = load();
  if (countEl) countEl.textContent = items.length;
  if (!items.length) {
    if (emptyEl) emptyEl.hidden = false;
    listEl.innerHTML = "";
    return;
  }
  if (emptyEl) emptyEl.hidden = true;

  const stats = (typeof window.crimeStats === "function") ? window.crimeStats() : { byCountry: {} };

  listEl.innerHTML = items.map((a3) => {
    const cpi = CPI_DATA[a3];
    const name = cpi ? cpi.name : a3;
    const fatf = FATF_STATUS[a3];
    const fatfBadge = fatf
      ? `<span class="wl-fatf" style="color:${fatf.color}">${fatf.tier}</span>`
      : "";
    const risk = window.fimRisk ? window.fimRisk(a3) : null;
    const events = (stats.byCountry && stats.byCountry[a3]) || 0;
    const newCount = Math.max(0, events - (lastSeenCounts[a3] || 0));
    const newBadge = newCount > 0 ? `<span class="wl-new">+${newCount}</span>` : "";

    return `
      <li class="wl-item" data-alpha3="${a3}">
        <div class="wl-main">
          <div class="wl-name">${escape(name)} <span class="wl-iso">${a3}</span> ${fatfBadge}</div>
          <div class="wl-stats">
            ${risk ? `<span class="wl-risk" style="color:${risk.color}">Risk ${risk.total}</span> · ` : ""}
            <span>${events} event${events === 1 ? "" : "s"}</span>
            ${newBadge}
          </div>
        </div>
        <button type="button" class="wl-remove" data-remove="${a3}" title="Remove from watchlist">×</button>
      </li>`;
  }).join("");

  listEl.querySelectorAll(".wl-item").forEach((li) => {
    li.addEventListener("click", (e) => {
      if (e.target.matches("[data-remove]")) return;
      const a3 = li.dataset.alpha3;
      const name = (CPI_DATA[a3] && CPI_DATA[a3].name) || a3;
      document.dispatchEvent(new CustomEvent("country:select", { detail: { alpha3: a3, name } }));
    });
  });
  listEl.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.fimWatchlist.remove(btn.dataset.remove);
    });
  });

  // Update last-seen counts AFTER rendering so +N shows once.
  items.forEach((a3) => {
    lastSeenCounts[a3] = (stats.byCountry && stats.byCountry[a3]) || 0;
  });
}

function escape(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}
