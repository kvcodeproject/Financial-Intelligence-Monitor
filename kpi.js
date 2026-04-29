/* global CPI_DATA, FATF_BLACK, FATF_GREY, SANCTIONS_DATA, GTI_DATA */

const KPI_REFRESH_MS = 5000;

const els = {
  countries:      document.getElementById("kpi-countries"),
  meanCpi:        document.getElementById("kpi-mean-cpi"),
  fatf:           document.getElementById("kpi-fatf"),
  events:         document.getElementById("kpi-events"),
  cleanest:       document.getElementById("kpi-cleanest"),
  worst:          document.getElementById("kpi-worst"),
  sanctioned:     document.getElementById("kpi-sanctioned"),
  sanctionedSub:  document.getElementById("kpi-sanctioned-sub"),
  gtiTop:         document.getElementById("kpi-gti-top")
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

  if (els.sanctioned && typeof SANCTIONS_DATA !== "undefined") {
    const codes = Object.keys(SANCTIONS_DATA);
    const tally = codes.reduce((acc, c) => {
      const sev = SANCTIONS_DATA[c].severity;
      acc[sev] = (acc[sev] || 0) + 1;
      return acc;
    }, {});
    els.sanctioned.textContent = codes.length;
    if (els.sanctionedSub) {
      els.sanctionedSub.textContent =
        `${tally.comprehensive || 0} comp · ${tally.sectoral || 0} sect · ${(tally.targeted || 0) + (tally.restrictive || 0)} targ`;
    }
  }

  if (els.gtiTop && typeof GTI_DATA !== "undefined") {
    const gtiEntries = Object.entries(GTI_DATA);
    let topA3 = null, topScore = -Infinity;
    gtiEntries.forEach(([a3, v]) => {
      if (v.score > topScore) { topScore = v.score; topA3 = a3; }
    });
    const name = topA3 && CPI_DATA[topA3] ? CPI_DATA[topA3].name : topA3;
    els.gtiTop.textContent = `${name} (${topScore.toFixed(2)})`;
  }
}

function refreshLiveStats() {
  const stats = (typeof window.crimeStats === "function") ? window.crimeStats() : null;
  if (!stats) {
    els.events.textContent = "—";
    return;
  }
  els.events.textContent = stats.last24h.toLocaleString();
}
