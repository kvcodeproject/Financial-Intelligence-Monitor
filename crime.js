/* global CPI_DATA, CRIME_EVENTS, CRIME_STREAM_POOL, CRIME_TYPES */

const STREAM_INTERVAL_MS = 9000;     // a new event arrives every ~9s
const STREAM_JITTER_MS   = 4000;     // +/- jitter
const MAX_EVENTS         = 120;

const feedEl    = document.getElementById("crime-feed");
const liveDot   = document.getElementById("crime-live-dot");
const liveLabel = document.getElementById("crime-live-label");
const pauseBtn  = document.getElementById("crime-pause");
const filterBox = document.getElementById("crime-filters");
const scopeEl   = document.getElementById("crime-scope");
const clearBtn  = document.getElementById("crime-scope-clear");
const countEl   = document.getElementById("crime-count");

const state = {
  events: CRIME_EVENTS.slice().sort((a, b) => b.ts - a.ts),
  activeTypes: new Set(Object.keys(CRIME_TYPES)),
  countryFilter: null,
  paused: false,
  streamTimer: null,
  tickTimer: null,
  nextId: CRIME_EVENTS.length
};

initCrimePanel();

window.crimeStats = function () {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const last24h = state.events.filter((e) => e.ts >= cutoff).length;
  const byCountry = {};
  state.events.forEach((e) => {
    byCountry[e.country] = (byCountry[e.country] || 0) + 1;
  });
  return { total: state.events.length, last24h, byCountry };
};

window.crimeRecent = function (windowMs) {
  const cutoff = Date.now() - windowMs;
  return state.events.filter((e) => e.ts >= cutoff);
};

window.crimeAddEvent = function (ev) {
  const event = {
    id: `user-${state.nextId++}`,
    ts: ev.ts || Date.now(),
    fresh: true,
    country: ev.country,
    type: ev.type,
    title: ev.title,
    agency: ev.agency,
    amountUsd: ev.amountUsd,
    sourceUrl: ev.sourceUrl,
    submitter: ev.submitter,
    notes: ev.notes
  };
  state.events.unshift(event);
  if (state.events.length > MAX_EVENTS) state.events.length = MAX_EVENTS;
  renderFeed();
  setTimeout(() => {
    event.fresh = false;
    const node = feedEl && feedEl.querySelector(`li[data-id="${event.id}"]`);
    if (node) node.classList.remove("fresh");
  }, 2000);
  return event;
};

function initCrimePanel() {
  if (!feedEl) return;
  renderFilters();
  renderFeed();
  scheduleStream();
  state.tickTimer = setInterval(refreshTimestamps, 30_000);

  pauseBtn.addEventListener("click", togglePause);
  clearBtn.addEventListener("click", () => setCountryFilter(null));

  document.addEventListener("country:select", (e) => {
    setCountryFilter(e.detail && e.detail.alpha3 ? e.detail.alpha3 : null);
  });
}

function renderFilters() {
  filterBox.innerHTML = Object.entries(CRIME_TYPES)
    .map(([key, t]) => `
      <button type="button" class="chip ${state.activeTypes.has(key) ? "on" : ""}" data-type="${key}">
        <span class="dot" style="background:${t.color}"></span>${t.label}
      </button>`)
    .join("");
  filterBox.querySelectorAll("button.chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      const t = btn.dataset.type;
      if (state.activeTypes.has(t)) state.activeTypes.delete(t);
      else state.activeTypes.add(t);
      btn.classList.toggle("on");
      renderFeed();
    });
  });
}

function renderFeed() {
  const visible = state.events.filter(passesFilters);
  countEl.textContent = `${visible.length} event${visible.length === 1 ? "" : "s"}`;
  if (!visible.length) {
    feedEl.innerHTML = `<li class="empty">No events match the current filters.</li>`;
    return;
  }
  feedEl.innerHTML = visible.map(renderEvent).join("");
}

function renderEvent(ev) {
  const t = CRIME_TYPES[ev.type] || { label: ev.type, color: "#888" };
  const cpi = CPI_DATA[ev.country];
  const country = cpi ? cpi.name : ev.country;
  const amount = ev.amountUsd ? ` • ${formatUsd(ev.amountUsd)}` : "";
  return `
    <li class="event ${ev.fresh ? "fresh" : ""}" data-id="${ev.id}">
      <div class="event-head">
        <span class="badge" style="background:${t.color}1a;color:${t.color};border-color:${t.color}55;">${t.label}</span>
        <span class="country" data-alpha3="${ev.country}">${country}</span>
        <span class="time" title="${new Date(ev.ts).toLocaleString()}">${relTime(ev.ts)}</span>
      </div>
      <div class="event-title">${escapeHtml(ev.title)}</div>
      <div class="event-meta">${escapeHtml(ev.agency || "—")}${amount}</div>
    </li>`;
}

function passesFilters(ev) {
  if (!state.activeTypes.has(ev.type)) return false;
  if (state.countryFilter && ev.country !== state.countryFilter) return false;
  return true;
}

function setCountryFilter(alpha3) {
  state.countryFilter = alpha3;
  if (alpha3) {
    const name = (CPI_DATA[alpha3] && CPI_DATA[alpha3].name) || alpha3;
    scopeEl.innerHTML = `Scope: <strong>${escapeHtml(name)}</strong>`;
    clearBtn.hidden = false;
  } else {
    scopeEl.textContent = "Scope: global";
    clearBtn.hidden = true;
  }
  renderFeed();
}

function scheduleStream() {
  if (state.streamTimer) clearTimeout(state.streamTimer);
  if (state.paused) return;
  const delay = STREAM_INTERVAL_MS + (Math.random() * 2 - 1) * STREAM_JITTER_MS;
  state.streamTimer = setTimeout(() => {
    pushStreamEvent();
    scheduleStream();
  }, delay);
}

function pushStreamEvent() {
  const template = CRIME_STREAM_POOL[Math.floor(Math.random() * CRIME_STREAM_POOL.length)];
  const ev = {
    id: `stream-${state.nextId++}`,
    ...template,
    ts: Date.now(),
    fresh: true
  };
  state.events.unshift(ev);
  if (state.events.length > MAX_EVENTS) state.events.length = MAX_EVENTS;
  renderFeed();
  setTimeout(() => {
    ev.fresh = false;
    const node = feedEl.querySelector(`li[data-id="${ev.id}"]`);
    if (node) node.classList.remove("fresh");
  }, 2000);
}

function togglePause() {
  state.paused = !state.paused;
  pauseBtn.textContent = state.paused ? "Resume" : "Pause";
  liveDot.classList.toggle("paused", state.paused);
  liveLabel.textContent = state.paused ? "Paused" : "Live";
  if (!state.paused) scheduleStream();
}

function refreshTimestamps() {
  feedEl.querySelectorAll("li.event").forEach((li) => {
    const id = li.dataset.id;
    const ev = state.events.find((e) => e.id === id);
    if (!ev) return;
    const span = li.querySelector(".time");
    if (span) span.textContent = relTime(ev.ts);
  });
}

function relTime(ts) {
  const diff = Math.max(0, Date.now() - ts);
  const s = Math.floor(diff / 1000);
  if (s < 45) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function formatUsd(n) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[c]);
}
