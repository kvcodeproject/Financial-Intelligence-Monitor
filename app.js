/* global d3, topojson, CPI_DATA, NUMERIC_TO_ALPHA3, CPI_YEAR */

const WORLD_ATLAS_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json";

const NO_DATA_COLOR = "#2d333b";

// Diverging-style sequential ramp: red (corrupt) -> yellow -> green (clean).
const colorScale = d3
  .scaleLinear()
  .domain([0, 25, 50, 75, 100])
  .range(["#7a0d0d", "#d6604d", "#f6e58d", "#74c476", "#1b6f3a"])
  .clamp(true);

const svg = d3.select("#map");
const tooltip = d3.select("#tooltip");
const detailsEl = document.getElementById("details");
const searchInput = document.getElementById("search");
const resultCountEl = document.getElementById("result-count");

let countriesGroup;
let pathGenerator;
let projection;
let countryFeatures = [];
let selectedAlpha3 = null;
let rankByAlpha3 = {};

init();

async function init() {
  computeRanks();
  renderLegend();

  let topology;
  try {
    topology = await d3.json(WORLD_ATLAS_URL);
  } catch (err) {
    showLoadError(err);
    return;
  }
  const countries = topojson.feature(topology, topology.objects.countries);
  countryFeatures = countries.features;

  setupSvg();
  drawCountries();
  attachZoom();
  bindSearch();
  window.addEventListener("resize", debounce(handleResize, 150));
}

function computeRanks() {
  const sorted = Object.entries(CPI_DATA)
    .map(([alpha3, info]) => ({ alpha3, score: info.score }))
    .sort((a, b) => b.score - a.score);
  let lastScore = null;
  let lastRank = 0;
  sorted.forEach((entry, i) => {
    const rank = entry.score === lastScore ? lastRank : i + 1;
    rankByAlpha3[entry.alpha3] = rank;
    lastScore = entry.score;
    lastRank = rank;
  });
}

function setupSvg() {
  const { width, height } = svgSize();
  projection = d3
    .geoNaturalEarth1()
    .scale(width / 6.3)
    .translate([width / 2, height / 1.85]);
  pathGenerator = d3.geoPath(projection);

  svg.attr("viewBox", `0 0 ${width} ${height}`);
  countriesGroup = svg.append("g").attr("class", "countries");

  // Background to capture deselect clicks.
  svg
    .insert("rect", ":first-child")
    .attr("class", "map-bg")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "transparent")
    .on("click", () => clearSelection());
}

function drawCountries() {
  countriesGroup
    .selectAll("path.country")
    .data(countryFeatures, (d) => d.id)
    .join("path")
    .attr("class", "country")
    .attr("d", pathGenerator)
    .attr("fill", (d) => fillFor(d))
    .on("mousemove", (event, d) => showTooltip(event, d))
    .on("mouseleave", hideTooltip)
    .on("click", (event, d) => {
      event.stopPropagation();
      selectCountry(alpha3Of(d));
    });
}

function fillFor(feature) {
  const a3 = alpha3Of(feature);
  const cpi = a3 ? CPI_DATA[a3] : null;
  return cpi ? colorScale(cpi.score) : NO_DATA_COLOR;
}

function alpha3Of(feature) {
  const id = String(feature.id).padStart(3, "0");
  return NUMERIC_TO_ALPHA3[id] || null;
}

function showTooltip(event, feature) {
  const a3 = alpha3Of(feature);
  const cpi = a3 ? CPI_DATA[a3] : null;
  const name = (cpi && cpi.name) || (feature.properties && feature.properties.name) || "Unknown";
  const rank = a3 ? rankByAlpha3[a3] : null;
  const total = Object.keys(CPI_DATA).length;

  const html = cpi
    ? `<strong>${escapeHtml(name)}</strong>
       <div class="score" style="color:${colorScale(cpi.score)}">${cpi.score}<span style="font-size:11px;color:var(--muted);"> / 100</span></div>
       <div class="rank">Rank ${rank} of ${total} • CPI ${CPI_YEAR}</div>`
    : `<strong>${escapeHtml(name)}</strong>
       <div class="rank">No CPI ${CPI_YEAR} data</div>`;

  const [x, y] = d3.pointer(event, svg.node());
  tooltip
    .style("left", x + "px")
    .style("top", y + "px")
    .html(html)
    .attr("hidden", null);
}

function hideTooltip() {
  tooltip.attr("hidden", true);
}

function selectCountry(alpha3) {
  selectedAlpha3 = alpha3;
  countriesGroup
    .selectAll("path.country")
    .classed("matched", (d) => alpha3Of(d) === alpha3);
  renderDetails(alpha3);
  const name = (CPI_DATA[alpha3] && CPI_DATA[alpha3].name) || alpha3;
  document.dispatchEvent(new CustomEvent("country:select", { detail: { alpha3, name } }));
}

function clearSelection() {
  selectedAlpha3 = null;
  countriesGroup.selectAll("path.country").classed("matched", false);
  detailsEl.innerHTML = `<p class="hint">Hover or click any country to see details.</p>`;
  document.dispatchEvent(new CustomEvent("country:select", { detail: { alpha3: null, name: null } }));
}

function renderDetails(alpha3) {
  const cpi = alpha3 ? CPI_DATA[alpha3] : null;
  if (!cpi) {
    detailsEl.innerHTML = `<p class="hint">No CPI ${CPI_YEAR} data for the selected territory.</p>`;
    return;
  }
  const total = Object.keys(CPI_DATA).length;
  const rank = rankByAlpha3[alpha3];
  const tier = scoreTier(cpi.score);

  detailsEl.innerHTML = `
    <h2>${escapeHtml(cpi.name)} <small style="color:var(--muted);font-weight:400;">(${alpha3})</small></h2>
    <div class="grid">
      <div class="stat">
        <div class="label">CPI ${CPI_YEAR} score</div>
        <div class="value" style="color:${colorScale(cpi.score)}">${cpi.score}<span style="font-size:12px;color:var(--muted);"> / 100</span></div>
      </div>
      <div class="stat">
        <div class="label">Global rank</div>
        <div class="value">${rank}<span style="font-size:12px;color:var(--muted);"> / ${total}</span></div>
      </div>
      <div class="stat">
        <div class="label">Percentile</div>
        <div class="value">${Math.round(((total - rank + 1) / total) * 100)}<span style="font-size:12px;color:var(--muted);">th</span></div>
      </div>
      <div class="stat">
        <div class="label">Tier</div>
        <div class="value" style="font-size:14px;">${tier}</div>
      </div>
    </div>`;
}

function scoreTier(s) {
  if (s >= 80) return "Very clean";
  if (s >= 65) return "Clean";
  if (s >= 50) return "Mixed";
  if (s >= 30) return "Corrupt";
  return "Highly corrupt";
}

function bindSearch() {
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) {
      countriesGroup.selectAll("path.country").classed("dimmed", false).classed("matched", (d) => alpha3Of(d) === selectedAlpha3);
      resultCountEl.textContent = "";
      return;
    }
    let matches = 0;
    countriesGroup.selectAll("path.country").each(function (d) {
      const a3 = alpha3Of(d);
      const name = (a3 && CPI_DATA[a3] && CPI_DATA[a3].name) || (d.properties && d.properties.name) || "";
      const hit = name.toLowerCase().includes(q) || (a3 && a3.toLowerCase().includes(q));
      d3.select(this).classed("dimmed", !hit).classed("matched", !!hit);
      if (hit) matches++;
    });
    resultCountEl.textContent = matches === 1 ? "1 match" : `${matches} matches`;
  });
}

function attachZoom() {
  const zoom = d3
    .zoom()
    .scaleExtent([1, 8])
    .on("zoom", (event) => {
      countriesGroup.attr("transform", event.transform);
      countriesGroup.selectAll("path.country").attr("stroke-width", 0.4 / event.transform.k);
    });
  svg.call(zoom);
}

function renderLegend() {
  const legend = d3.select("#legend");
  const stops = [0, 25, 50, 75, 100]
    .map((v) => `${colorScale(v)} ${v}%`)
    .join(", ");
  legend.html(`
    <div style="margin-bottom:4px;color:var(--text);">CPI ${CPI_YEAR} score</div>
    <div class="scale">
      <div class="gradient" style="background: linear-gradient(to right, ${stops});"></div>
    </div>
    <div class="ticks"><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></div>
    <div style="margin-top:6px;"><span class="nd"></span>No data</div>
  `);
}

function svgSize() {
  const node = svg.node();
  const rect = node.getBoundingClientRect();
  const width = Math.max(320, rect.width || node.clientWidth || 960);
  const height = Math.max(280, rect.height || node.clientHeight || 540);
  return { width, height };
}

function handleResize() {
  if (!projection) return;
  const { width, height } = svgSize();
  projection.scale(width / 6.3).translate([width / 2, height / 1.85]);
  svg.attr("viewBox", `0 0 ${width} ${height}`);
  svg.select("rect.map-bg").attr("width", width).attr("height", height);
  countriesGroup.selectAll("path.country").attr("d", pathGenerator);
}

function showLoadError(err) {
  console.error(err);
  detailsEl.innerHTML = `<p style="color:#ff7b72;">Failed to load world geometry. Check your internet connection (the map fetches TopoJSON from jsdelivr).</p>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[c]);
}

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
