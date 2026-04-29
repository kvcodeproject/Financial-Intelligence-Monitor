/* global d3, CPI_DATA, GTI_DATA, SANCTIONS_DATA, SANCTIONS_SEVERITY, GTI_TIERS */
"use strict";

const NO_DATA = "#2d333b";

const cpiScale = d3.scaleLinear()
  .domain([0, 25, 50, 75, 100])
  .range(["#7a0d0d", "#d6604d", "#f6e58d", "#74c476", "#1b6f3a"])
  .clamp(true);

const gtiScale = d3.scaleLinear()
  .domain([0, 2, 4, 6, 8, 10])
  .range(["#1b6f3a", "#74c476", "#f6e58d", "#f6a200", "#d6604d", "#7a0d0d"])
  .clamp(true);

const riskScale = d3.scaleLinear()
  .domain([0, 25, 50, 75, 100])
  .range(["#1b6f3a", "#74c476", "#f6e58d", "#d6604d", "#7a0d0d"])
  .clamp(true);

const MODES = {
  cpi: {
    label: "CPI 2024",
    fill(a3) {
      const c = CPI_DATA && CPI_DATA[a3];
      return c ? cpiScale(c.score) : NO_DATA;
    },
    legend() {
      const stops = [0, 25, 50, 75, 100].map((v) => `${cpiScale(v)} ${v}%`).join(", ");
      return `
        <div style="margin-bottom:4px;color:var(--text);">CPI 2024 score</div>
        <div class="scale">
          <div class="gradient" style="background: linear-gradient(to right, ${stops});"></div>
        </div>
        <div class="ticks"><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></div>
        <div style="margin-top:6px;"><span class="nd"></span>No data</div>`;
    }
  },
  gti: {
    label: "Terrorism (GTI)",
    fill(a3) {
      const g = (typeof GTI_DATA !== "undefined") ? GTI_DATA[a3] : null;
      return g ? gtiScale(g.score) : NO_DATA;
    },
    legend() {
      const stops = [0, 2, 4, 6, 8, 10]
        .map((v) => `${gtiScale(v)} ${(v / 10) * 100}%`).join(", ");
      return `
        <div style="margin-bottom:4px;color:var(--text);">GTI 2024 impact (0–10)</div>
        <div class="scale">
          <div class="gradient" style="background: linear-gradient(to right, ${stops});"></div>
        </div>
        <div class="ticks"><span>0</span><span>2</span><span>4</span><span>6</span><span>8</span><span>10</span></div>
        <div style="margin-top:6px;"><span class="nd"></span>No data</div>`;
    }
  },
  sanctions: {
    label: "Sanctions",
    fill(a3) {
      const s = (typeof SANCTIONS_DATA !== "undefined") ? SANCTIONS_DATA[a3] : null;
      if (!s) return NO_DATA;
      const t = SANCTIONS_SEVERITY && SANCTIONS_SEVERITY[s.severity];
      return t ? t.color : NO_DATA;
    },
    legend() {
      const tiers = SANCTIONS_SEVERITY ? Object.entries(SANCTIONS_SEVERITY)
        .sort((a, b) => b[1].rank - a[1].rank) : [];
      const swatches = tiers.map(([, t]) => `
        <span class="legend-swatch"><span class="sw" style="background:${t.color}"></span>${t.label}</span>`).join("");
      return `
        <div style="margin-bottom:4px;color:var(--text);">Active sanctions</div>
        <div class="legend-rows">${swatches}</div>
        <div style="margin-top:6px;"><span class="nd"></span>None tracked</div>`;
    }
  },
  risk: {
    label: "Composite risk",
    fill(a3) {
      const r = (typeof window.fimRisk === "function") ? window.fimRisk(a3) : null;
      return r ? riskScale(r.total) : NO_DATA;
    },
    legend() {
      const stops = [0, 25, 50, 75, 100].map((v) => `${riskScale(v)} ${v}%`).join(", ");
      return `
        <div style="margin-bottom:4px;color:var(--text);">Composite risk (0–100)</div>
        <div class="scale">
          <div class="gradient" style="background: linear-gradient(to right, ${stops});"></div>
        </div>
        <div class="ticks"><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></div>
        <div style="margin-top:6px;"><span class="nd"></span>No data</div>`;
    }
  }
};

window.fimMapMode = "cpi";
window.fimHeatmapModes = MODES;

window.fimSetMapMode = function (mode) {
  if (!MODES[mode]) return;
  window.fimMapMode = mode;
  document.querySelectorAll("[data-heatmap]").forEach((b) => {
    b.classList.toggle("on", b.dataset.heatmap === mode);
  });
  if (typeof window.fimRedrawMap === "function") window.fimRedrawMap();
  if (typeof window.fimRedrawLegend === "function") window.fimRedrawLegend();
  if (window.fimAudit) window.fimAudit.log("MAP_MODE", mode, MODES[mode].label);
};

document.querySelectorAll("[data-heatmap]").forEach((btn) => {
  btn.addEventListener("click", () => window.fimSetMapMode(btn.dataset.heatmap));
});
