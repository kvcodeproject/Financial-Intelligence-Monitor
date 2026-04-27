/**
 * FATF AML/CTF jurisdiction lists — illustrative snapshot.
 *
 * BLACK list: "High-Risk Jurisdictions subject to a Call for Action".
 * GREY  list: "Jurisdictions under Increased Monitoring".
 *
 * FATF updates these at three plenaries per year (Feb / Jun / Oct).
 * Refresh from https://www.fatf-gafi.org/en/publications/High-risk-and-other-monitored-jurisdictions.html
 */

const FATF_BLACK = ["PRK", "IRN", "MMR"];

const FATF_GREY = [
  "DZA", "AGO", "BGR", "BFA", "CMR", "CIV", "COD", "HTI", "KEN",
  "LAO", "LBN", "MLI", "MCO", "MOZ", "NAM", "NPL", "NGA", "ZAF",
  "SSD", "SYR", "TZA", "VEN", "VNM", "YEM"
];

const FATF_STATUS = {};
FATF_BLACK.forEach((c) => (FATF_STATUS[c] = { tier: "BLACK", label: "Call for action", color: "#ff5b5b" }));
FATF_GREY .forEach((c) => (FATF_STATUS[c] = { tier: "GREY",  label: "Increased monitoring", color: "#f6a200" }));
