# Financial Intelligence Monitor (FIM)

Interactive dashboard combining country corruption (Transparency International CPI 2024), FATF AML jurisdiction risk lists, and a simulated live financial-crime enforcement feed. Runs as a static web app or as a native desktop application packaged via Electron.

![status](https://img.shields.io/badge/status-active-3fb950) ![license](https://img.shields.io/badge/license-MIT-58a6ff) ![desktop](https://img.shields.io/badge/desktop-Win%20%C2%B7%20macOS%20%C2%B7%20Linux-1f6feb)

## Features

- **Choropleth world map** of CPI 2024 scores (D3 + TopoJSON, Natural Earth I projection).
- **FATF AML overlay** — Call-for-action and Increased-Monitoring jurisdictions surfaced in tooltip and details panel.
- **Live financial-crime feed** — sanctions, AML fines, indictments, asset seizures, investigations, fraud; new events stream every 5–13 s.
- **KPI strip** with global indicators (mean CPI, FATF counts, 24 h event volume, cleanest / most corrupt jurisdictions).
- **Country risk profile** — click any country to scope the crime feed, see CPI rank/percentile/tier, FATF status, and tracked event count.
- **Methodology** section detailing data sources, choropleth construction, and limitations.
- **Native desktop builds** for Windows (.exe), macOS (.dmg), and Linux (.AppImage / .deb) via electron-builder.

## Run as a web app

No build step required.

```bash
# Just serve the directory with any static server, e.g.
python3 -m http.server 8000
# then open http://localhost:8000
```

The map fetches `world-atlas/countries-110m.json` from jsDelivr on first load, so an internet connection is needed once.

## Run as a desktop app (development)

```bash
npm install
npm start          # launches the Electron shell
```

## Build native installers

```bash
npm run build:win      # Windows: NSIS installer (.exe) + portable (.exe)
npm run build:mac      # macOS: .dmg for x64 and arm64
npm run build:linux    # Linux: .AppImage + .deb
npm run build          # all targets for the current host platform
```

Output is written to `dist/`.

### Cross-platform releases via GitHub Actions

Push a Git tag matching `v*` to trigger the release pipeline:

```bash
git tag v1.0.0
git push origin v1.0.0
```

`.github/workflows/release.yml` runs a matrix build across `windows-latest`, `macos-latest`, and `ubuntu-latest`, then publishes installers to the GitHub Release page.

You can also trigger it manually from the **Actions** tab → **Release Desktop App** → **Run workflow**.

## Downloads

Once a release exists, installers appear at:

[https://github.com/kvcodeproject/Financial-Intelligence-Monitor/releases/latest](https://github.com/kvcodeproject/Financial-Intelligence-Monitor/releases/latest)

| Platform | Artifact |
|----------|----------|
| Windows  | `Financial-Intelligence-Monitor-Setup-<version>.exe` (NSIS) |
| Windows  | `Financial-Intelligence-Monitor-Portable-<version>.exe` |
| macOS    | `Financial-Intelligence-Monitor-<version>-x64.dmg` |
| macOS    | `Financial-Intelligence-Monitor-<version>-arm64.dmg` |
| Linux    | `Financial-Intelligence-Monitor-<version>.AppImage` |
| Linux    | `Financial-Intelligence-Monitor-<version>.deb` |

## Project layout

```
.
├── index.html              # entry point (web + Electron)
├── styles.css              # dark monitor theme
├── data.js                 # CPI 2024 scores + ISO numeric→alpha-3 join table
├── risk-data.js            # FATF black/grey lists
├── crime-data.js           # seed events + live stream pool
├── app.js                  # D3 map, tooltip, details, search, zoom
├── crime.js                # live feed renderer + filters
├── kpi.js                  # top KPI strip refresher
├── status-bar.js           # UTC clock, version pill, online status
├── electron/
│   ├── main.js             # Electron main process
│   └── preload.js          # contextBridge → window.fim
├── .github/workflows/
│   └── release.yml         # multi-platform installer build
├── package.json            # electron-builder config + scripts
└── .gitignore
```

## Data sources

| Layer            | Source |
|------------------|--------|
| CPI 2024         | [Transparency International CPI 2024](https://www.transparency.org/en/cpi/2024) |
| FATF risk lists  | [FATF — High-risk and other monitored jurisdictions](https://www.fatf-gafi.org/) |
| Geometry         | [`world-atlas`](https://github.com/topojson/world-atlas) (Natural Earth, 1:110m) |
| Crime feed       | Illustrative dataset distilled from public reporting (OFAC, OFSI, FinCEN, EU Council, FATF, FIUs). Replace with live ingest in production. |

## License

MIT
