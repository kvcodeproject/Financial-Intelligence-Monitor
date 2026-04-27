/**
 * Financial crime feed — illustrative dataset.
 *
 * Events are drawn from public reporting on enforcement actions, sanctions,
 * AML penalties, and corruption probes. Timestamps are generated at load time
 * (offsetMinutes = "minutes ago") so the feed appears live on each visit.
 *
 * In production, this seed should be replaced with live ingest from sources
 * such as: OFAC SDN list updates, FATF advisories, FinCEN/SEC/DOJ press feeds,
 * UK OFSI consolidated list, EU sanctions map, ICIJ leaks, Europol, Interpol
 * notices, and national FIUs.
 */

const CRIME_TYPES = {
  SANCTION:   { label: "Sanction",        color: "#d6604d" },
  FINE:       { label: "AML fine",        color: "#f6a200" },
  INDICTMENT: { label: "Indictment",      color: "#bf6cff" },
  SEIZURE:    { label: "Asset seizure",   color: "#58a6ff" },
  PROBE:      { label: "Investigation",   color: "#8b949e" },
  FRAUD:      { label: "Fraud",           color: "#ff7b72" }
};

// Seed events — used for initial render. offsetMinutes = how long ago.
const CRIME_EVENTS_SEED = [
  { country: "USA", type: "FINE",       title: "TD Bank ordered to pay additional $450M for AML program failures", agency: "FinCEN / OCC",  amountUsd: 450_000_000,  offsetMinutes: 3 },
  { country: "SGP", type: "SEIZURE",    title: "MAS extends asset freeze in S$3B Fujian-linked laundering case",     agency: "MAS",           amountUsd: 2_300_000_000, offsetMinutes: 11 },
  { country: "RUS", type: "SANCTION",   title: "OFAC adds 14 entities and 6 vessels to SDN list over evasion network", agency: "OFAC",        offsetMinutes: 22 },
  { country: "CHN", type: "PROBE",      title: "Hong Kong SFC opens probe into cross-border crypto OTC desks",         agency: "SFC",         offsetMinutes: 34 },
  { country: "CHE", type: "FINE",       title: "FINMA reprimands private bank over Russia-related KYC lapses",         agency: "FINMA",       amountUsd: 38_000_000, offsetMinutes: 47 },
  { country: "NGA", type: "INDICTMENT", title: "EFCC charges former oil official in $1.1B contract scheme",            agency: "EFCC",        amountUsd: 1_100_000_000, offsetMinutes: 68 },
  { country: "MEX", type: "PROBE",      title: "UIF flags suspicious flows from northern construction firms",          agency: "UIF",         offsetMinutes: 82 },
  { country: "DEU", type: "FINE",       title: "BaFin fines mid-tier bank €27M for transaction monitoring gaps",       agency: "BaFin",       amountUsd: 29_000_000, offsetMinutes: 109 },
  { country: "GBR", type: "FINE",       title: "FCA penalises challenger bank £45M over financial crime controls",     agency: "FCA",         amountUsd: 56_000_000, offsetMinutes: 137 },
  { country: "IRN", type: "SANCTION",   title: "OFAC designates UAV procurement network spanning 4 jurisdictions",     agency: "OFAC",        offsetMinutes: 165 },
  { country: "BRA", type: "INDICTMENT", title: "Operação Lava Jato spinoff indicts 9 in pension fund kickback scheme",  agency: "MPF",         offsetMinutes: 188 },
  { country: "VEN", type: "SEIZURE",    title: "DOJ moves to forfeit $230M tied to PDVSA-linked accounts",             agency: "DOJ",         amountUsd: 230_000_000, offsetMinutes: 215 },
  { country: "ZAF", type: "PROBE",      title: "SARB widens probe into shadow banking flows out of Gauteng",           agency: "SARB",        offsetMinutes: 240 },
  { country: "MYS", type: "INDICTMENT", title: "Najib appeals 1MDB sentence; AGC files new charges against intermediary", agency: "AGC",      offsetMinutes: 287 },
  { country: "PRK", type: "SANCTION",   title: "Treasury sanctions Lazarus-affiliated mixer used to launder $90M",     agency: "OFAC",        amountUsd: 90_000_000,  offsetMinutes: 325 },
  { country: "FRA", type: "FINE",       title: "ACPR fines two French banks total €120M for AML reporting delays",     agency: "ACPR",        amountUsd: 130_000_000, offsetMinutes: 410 },
  { country: "NLD", type: "FINE",       title: "DNB closes ABN AMRO remediation; €40M residual penalty issued",        agency: "DNB",         amountUsd: 43_000_000,  offsetMinutes: 511 },
  { country: "TUR", type: "PROBE",      title: "MASAK opens 200+ accounts in gold-for-oil trade investigation",        agency: "MASAK",       offsetMinutes: 612 },
  { country: "HND", type: "INDICTMENT", title: "Former officials charged in customs over-invoicing scheme",            agency: "MP",          offsetMinutes: 740 },
  { country: "AGO", type: "SEIZURE",    title: "Portuguese court upholds seizure of €420M linked to Luanda Leaks",     agency: "PGR",         amountUsd: 460_000_000, offsetMinutes: 880 },
  { country: "UKR", type: "PROBE",      title: "NABU detains procurement officials in wartime defence contract probe", agency: "NABU",        offsetMinutes: 1020 },
  { country: "LBN", type: "INDICTMENT", title: "European JIT issues fresh indictments against former central bank governor", agency: "EPPO", offsetMinutes: 1280 },
  { country: "PHL", type: "FINE",       title: "BSP fines remittance operator ₱200M for KYC failures",                 agency: "BSP",         amountUsd: 3_500_000,   offsetMinutes: 1500 },
  { country: "AUS", type: "FINE",       title: "AUSTRAC settles with casino operator over A$450M AML breaches",        agency: "AUSTRAC",     amountUsd: 295_000_000, offsetMinutes: 1820 },
  { country: "IND", type: "PROBE",      title: "ED attaches assets worth ₹1,200 crore in shell company web",           agency: "ED",          amountUsd: 144_000_000, offsetMinutes: 2200 },
  { country: "IDN", type: "INDICTMENT", title: "KPK names two ministry officials in palm-oil licensing kickbacks",     agency: "KPK",         offsetMinutes: 2680 },
  { country: "EGY", type: "SEIZURE",    title: "Money Laundering Combating Unit freezes EGP 4.8B in fintech probe",    agency: "MLCU",        amountUsd: 100_000_000, offsetMinutes: 3260 },
  { country: "ESP", type: "FRAUD",      title: "AEPD reports €380M VAT carousel fraud across 3 EU jurisdictions",      agency: "AEPD",        amountUsd: 410_000_000, offsetMinutes: 4100 },
  { country: "COL", type: "SEIZURE",    title: "UIAF freezes accounts tied to narco-financed real estate ring",         agency: "UIAF",        offsetMinutes: 5200 },
  { country: "PAK", type: "FINE",       title: "SBP penalises commercial bank PKR 1.2B for monitoring lapses",         agency: "SBP",         amountUsd: 4_300_000,  offsetMinutes: 6800 }
];

// Pool used by the live stream — one is selected at random every interval.
const CRIME_STREAM_POOL = [
  { country: "USA", type: "SANCTION",   title: "OFAC issues new SDN listings targeting trade-based laundering network", agency: "OFAC" },
  { country: "GBR", type: "FINE",       title: "FCA opens enforcement against electronic money institution",            agency: "FCA" },
  { country: "DEU", type: "PROBE",      title: "BaFin requests transaction logs from neobank in correspondent probe",    agency: "BaFin" },
  { country: "HKG", type: "SEIZURE",    title: "HKMA freezes OTC desk balances in cross-border probe",                  agency: "HKMA" },
  { country: "ARE", type: "PROBE",      title: "Executive Office of AML/CTF flags free-zone shell entities",            agency: "EO AML/CTF" },
  { country: "RUS", type: "SANCTION",   title: "EU council adds vessels to oil price-cap evasion list",                 agency: "EU Council" },
  { country: "BRA", type: "INDICTMENT", title: "MPF indicts officials in state-bank loan fraud scheme",                 agency: "MPF" },
  { country: "MEX", type: "FRAUD",      title: "CNBV warns of pyramid scheme using regulated brokerage labels",         agency: "CNBV" },
  { country: "ZAF", type: "INDICTMENT", title: "NPA charges contractors over municipal procurement collusion",          agency: "NPA" },
  { country: "NGA", type: "SEIZURE",    title: "EFCC seizes luxury properties in Abuja anti-graft sweep",              agency: "EFCC" },
  { country: "VEN", type: "SANCTION",   title: "Treasury designates two officials over gold smuggling",                  agency: "OFAC" },
  { country: "PRK", type: "SANCTION",   title: "Lazarus subgroup sanctioned over $40M crypto theft",                    agency: "OFAC" },
  { country: "IRN", type: "SANCTION",   title: "OFSI updates Iran sanctions list with 7 procurement front companies",   agency: "OFSI" },
  { country: "TUR", type: "FINE",       title: "BDDK penalises bank over correspondent due diligence shortfalls",       agency: "BDDK" },
  { country: "SGP", type: "PROBE",      title: "MAS issues prohibition orders against two former relationship managers", agency: "MAS" },
  { country: "AUS", type: "FINE",       title: "AUSTRAC enforceable undertaking accepted from remittance provider",     agency: "AUSTRAC" },
  { country: "FRA", type: "INDICTMENT", title: "PNF charges former executive in foreign bribery case",                  agency: "PNF" },
  { country: "ITA", type: "SEIZURE",    title: "GdF seizes €85M from organised crime real estate holdings",             agency: "Guardia di Finanza" },
  { country: "CHE", type: "PROBE",      title: "FINMA opens enforcement on private bank over Russia-linked exposures",  agency: "FINMA" },
  { country: "JPN", type: "FRAUD",      title: "FSA flags emerging investment fraud targeting elderly clients",          agency: "FSA" }
];

// Convert seed offsets into absolute timestamps once at load.
const CRIME_EVENTS = CRIME_EVENTS_SEED.map((e, i) => ({
  id: `seed-${i}`,
  ...e,
  ts: Date.now() - e.offsetMinutes * 60_000
}));
