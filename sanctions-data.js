/**
 * Country-level sanctions exposure — illustrative compilation of major
 * active sanctions programs (≈ early 2025 snapshot).
 *
 * Severity tiers (from broadest to narrowest):
 *   comprehensive  full / near-full embargo or extensive financial isolation
 *   sectoral       industry- or sector-specific restrictions (energy, finance, defence)
 *   targeted       SDN-style designations of individuals / entities only
 *   restrictive    arms / dual-use / travel bans only
 *   none           no active programs (default — country omitted from this map)
 *
 * Authoritative sources to cross-check:
 *   OFAC SDN + sanctions programs    https://ofac.treasury.gov/sanctions-programs-and-country-information
 *   UK OFSI consolidated list        https://www.gov.uk/government/publications/financial-sanctions-consolidated-list-of-targets
 *   EU sanctions map                 https://www.sanctionsmap.eu/
 *   UN Security Council              https://main.un.org/securitycouncil/en/sanctions/information
 *   Swiss SECO, Australian DFAT, Canadian SEMA, Japan METI
 */

const SANCTIONS_AS_OF = "2025-02";

const SANCTIONS_SEVERITY = {
  comprehensive: { rank: 4, label: "Comprehensive embargo", color: "#7a0d0d" },
  sectoral:      { rank: 3, label: "Sectoral",              color: "#d6604d" },
  targeted:      { rank: 2, label: "Targeted designations", color: "#f6a200" },
  restrictive:   { rank: 1, label: "Restrictive measures",  color: "#58a6ff" }
};

// alpha-3 -> { severity, programs[], sinceYear, summary, designations? }
const SANCTIONS_DATA = {
  RUS: {
    severity: "comprehensive",
    programs: ["OFAC", "UK OFSI", "EU", "Canada", "Switzerland", "Japan", "Australia", "New Zealand"],
    sinceYear: 2014,
    designations: 5400,
    summary: "Comprehensive financial, trade and sectoral sanctions following the 2022 invasion of Ukraine; G7+ oil price cap; SWIFT disconnection of major banks; sweeping SDN designations of individuals, entities and vessels."
  },
  BLR: {
    severity: "comprehensive",
    programs: ["OFAC", "UK OFSI", "EU", "Canada", "Switzerland"],
    sinceYear: 2006,
    designations: 1200,
    summary: "Comprehensive sectoral and financial sanctions in response to the 2020 election crackdown and complicity in the war against Ukraine."
  },
  PRK: {
    severity: "comprehensive",
    programs: ["UN Security Council", "OFAC", "UK", "EU", "Japan", "South Korea", "Australia"],
    sinceYear: 2006,
    designations: 1400,
    summary: "UNSC-mandated comprehensive sanctions over the nuclear and ballistic-missile programs; bans on trade, finance, military, luxury goods, and overseas labour."
  },
  IRN: {
    severity: "comprehensive",
    programs: ["OFAC", "UK OFSI", "EU", "Canada", "UN partial"],
    sinceYear: 1979,
    designations: 4200,
    summary: "Long-standing US trade and financial embargo; nuclear-related secondary sanctions; UAV/missile sanctions; SDGT designations across IRGC, Quds Force, MOIS networks."
  },
  SYR: {
    severity: "comprehensive",
    programs: ["OFAC", "UK OFSI", "EU", "Canada"],
    sinceYear: 2011,
    designations: 950,
    summary: "Comprehensive sanctions enacted from 2011 over the civil war and chemical weapons use; Caesar Act extraterritorial measures since 2020 (under selective easing post-Assad)."
  },
  CUB: {
    severity: "comprehensive",
    programs: ["OFAC"],
    sinceYear: 1962,
    designations: 380,
    summary: "Long-standing US trade, financial and travel embargo; designation as State Sponsor of Terrorism (re-designated 2021)."
  },
  VEN: {
    severity: "sectoral",
    programs: ["OFAC", "UK OFSI", "EU", "Canada", "Switzerland"],
    sinceYear: 2017,
    designations: 220,
    summary: "Sectoral sanctions on the oil, gold and financial sectors plus targeted designations of regime officials; selective licences in 2023-24 conditioned on electoral progress."
  },
  MMR: {
    severity: "sectoral",
    programs: ["OFAC", "UK OFSI", "EU", "Canada"],
    sinceYear: 2021,
    designations: 175,
    summary: "Sanctions on the military regime, MOGE oil and gas revenues, gemstone trade, and arms-procurement networks following the 2021 coup."
  },
  SDN: {
    severity: "targeted",
    programs: ["UN Security Council", "OFAC", "UK", "EU"],
    sinceYear: 2005,
    designations: 60,
    summary: "Darfur-related UN sanctions (arms embargo + designations); US/UK/EU additions during the 2023-24 SAF–RSF civil war for actors threatening peace."
  },
  ZWE: {
    severity: "targeted",
    programs: ["UK OFSI", "EU"],
    sinceYear: 2002,
    designations: 25,
    summary: "EU and UK targeted sanctions on individuals linked to human-rights abuses; US lifted broad sanctions in 2024 retaining Magnitsky designations."
  },
  ERI: {
    severity: "restrictive",
    programs: ["OFAC", "EU"],
    sinceYear: 2009,
    designations: 15,
    summary: "Targeted Magnitsky-style designations on regime officials; legacy UN arms embargo lifted in 2018."
  },
  LBY: {
    severity: "targeted",
    programs: ["UN Security Council", "OFAC", "UK", "EU"],
    sinceYear: 2011,
    designations: 90,
    summary: "UNSC arms embargo and asset-freeze regime; designations against actors threatening political stability."
  },
  YEM: {
    severity: "targeted",
    programs: ["UN Security Council", "OFAC", "UK", "EU"],
    sinceYear: 2014,
    designations: 110,
    summary: "UN sanctions on individuals threatening peace and security; SDGT designations against the Houthis (Ansarallah) by the US in 2024."
  },
  SOM: {
    severity: "targeted",
    programs: ["UN Security Council", "OFAC", "UK", "EU"],
    sinceYear: 1992,
    designations: 70,
    summary: "UN arms embargo with carve-outs; SDGT designations against Al-Shabaab and ISIS-Somalia."
  },
  CAF: {
    severity: "targeted",
    programs: ["UN Security Council", "OFAC", "UK", "EU"],
    sinceYear: 2013,
    designations: 35,
    summary: "UNSC arms embargo (modified); designations against armed-group leaders."
  },
  COD: {
    severity: "targeted",
    programs: ["UN Security Council", "OFAC", "UK", "EU"],
    sinceYear: 2003,
    designations: 45,
    summary: "UN arms embargo on non-state actors; Magnitsky designations on senior officials and mining-network principals."
  },
  NIC: {
    severity: "targeted",
    programs: ["OFAC", "UK", "EU", "Canada"],
    sinceYear: 2018,
    designations: 110,
    summary: "Targeted Global Magnitsky designations on Ortega regime officials, security forces and judicial actors."
  },
  IRQ: {
    severity: "targeted",
    programs: ["UN Security Council", "OFAC"],
    sinceYear: 1990,
    designations: 25,
    summary: "Legacy UN designations against former regime figures; targeted measures under Iraq-related Magnitsky and Iran-aligned militia programs."
  },
  SSD: {
    severity: "targeted",
    programs: ["UN Security Council", "OFAC", "UK", "EU"],
    sinceYear: 2014,
    designations: 28,
    summary: "UNSC arms embargo and designations on actors threatening peace, security or stability."
  },
  LBN: {
    severity: "targeted",
    programs: ["OFAC", "UK", "EU"],
    sinceYear: 2001,
    designations: 350,
    summary: "SDGT/SDN designations against Hezbollah financiers, money services businesses and procurement networks; EU CFSP targeted designations since 2022."
  },
  MLI: {
    severity: "targeted",
    programs: ["EU", "UK", "ECOWAS legacy"],
    sinceYear: 2017,
    designations: 18,
    summary: "EU/UK CFSP designations against actors obstructing the political transition and Wagner-linked entities; UN regime expired in 2023 after Russian veto."
  },
  GIN: {
    severity: "targeted",
    programs: ["EU", "UK", "ECOWAS legacy"],
    sinceYear: 2021,
    designations: 12,
    summary: "EU and UK targeted measures following the 2021 coup; some lifted, some retained pending transition milestones."
  },
  HTI: {
    severity: "targeted",
    programs: ["UN Security Council", "OFAC", "UK", "Canada"],
    sinceYear: 2022,
    designations: 22,
    summary: "UNSC sanctions regime adopted in 2022 targeting gang leaders and their financial enablers; Canadian Magnitsky designations on political and business elites."
  },
  HKG: {
    severity: "sectoral",
    programs: ["OFAC", "UK"],
    sinceYear: 2020,
    designations: 30,
    summary: "Targeted designations under the Hong Kong Autonomy Act of officials implementing the National Security Law; export-control changes."
  },
  CHN: {
    severity: "targeted",
    programs: ["OFAC", "UK", "EU", "Canada"],
    sinceYear: 2020,
    designations: 95,
    summary: "Targeted designations on officials and entities tied to Xinjiang human-rights abuses and Hong Kong; expanding Section 1260H / NDAA-listed military-industrial firms."
  },
  ISR: {
    severity: "targeted",
    programs: ["OFAC", "UK", "EU", "Canada"],
    sinceYear: 2024,
    designations: 12,
    summary: "Magnitsky-style designations introduced in 2024 against extremist West Bank settlers and outposts engaged in violence; sectoral measures by individual EU states."
  },
  KHM: {
    severity: "targeted",
    programs: ["OFAC"],
    sinceYear: 2017,
    designations: 8,
    summary: "Targeted Magnitsky designations on military and political figures linked to corruption and rights abuses."
  },
  ETH: {
    severity: "targeted",
    programs: ["OFAC", "EU"],
    sinceYear: 2021,
    designations: 14,
    summary: "Targeted measures relating to the Tigray conflict; AGOA suspension; Magnitsky designations on military and security actors."
  }
};

// Convenience helpers
function sanctionsFor(alpha3) {
  return SANCTIONS_DATA[alpha3] || null;
}

function sanctionsTier(alpha3) {
  const s = SANCTIONS_DATA[alpha3];
  return s ? SANCTIONS_SEVERITY[s.severity] : null;
}
