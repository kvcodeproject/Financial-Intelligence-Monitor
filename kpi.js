/* global CPI_DATA, FATF_BLACK, FATF_GREY */

const KPI_REFRESH_MS = 5000;

const els = {
  countries: document.getElementById("kpi-countries"),
  meanCpi:   document.getElementById("kpi-mean-cpi"),
  fatf:      document.getElementById("kpi-fatf"),
  events:    document.getElementById("kpi-events"),
  cleanest:  document.getElementById("kpi-cleanest"),
  worst:     document.getElementById("kpi-worst")
};

if (els.countries) {
  renderStaticStats();
  refreshLiveStats();
  setInterval(refreshLiveStats, KPI_REFRESH_MS);
}

function renderStaticStats() {
  const entries = Object.entries(CPI_DATA);
  const scores = entries.map(([, v]) => v.score);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;

  let cleanest = entries[0];
  let worst = entries[0];
  entries.forEach((e) => {
    if (e[1].score > cleanest[1].score) cleanest = e;
    if (e[1].score < worst[1].score)    worst    = e;
  });

  els.countries.textContent = entries.length;
  els.meanCpi.textContent   = mean.toFixed(1);
  els.fatf.textContent      = `${FATF_BLACK.length} / ${FATF_GREY.length}`;
  els.cleanest.textContent  = `${cleanest[1].name} (${cleanest[1].score})`;
  els.worst.textContent     = `${worst[1].name} (${worst[1].score})`;
}

function refreshLiveStats() {
  const stats = (typeof window.crimeStats === "function") ? window.crimeStats() : null;
  if (!stats) {
    els.events.textContent = "—";
    return;
  }
  els.events.textContent = stats.last24h.toLocaleString();
}
