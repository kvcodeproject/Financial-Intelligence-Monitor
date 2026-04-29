/* global CPI_DATA, FATF_STATUS, GTI_DATA, SANCTIONS_DATA */
"use strict";

const SANCTIONS_BOOST = {
  comprehensive: 12,
  sectoral:      8,
  targeted:      5,
  restrictive:   3
};

window.fimRisk = function (alpha3) {
  const cpi = alpha3 && CPI_DATA[alpha3];
  if (!cpi) return null;

  const fatf = FATF_STATUS[alpha3];
  const fatfBoost = fatf
    ? (fatf.tier === "BLACK" ? 15 : fatf.tier === "GREY" ? 8 : 0)
    : 0;

  const recent = (typeof window.crimeRecent === "function")
    ? window.crimeRecent(30 * 24 * 60 * 60 * 1000).filter((e) => e.country === alpha3)
    : [];
  const activityBoost = Math.min(10, recent.length * 1.2);

  const sanc = (typeof SANCTIONS_DATA !== "undefined") ? SANCTIONS_DATA[alpha3] : null;
  const sanctionsBoost = sanc ? (SANCTIONS_BOOST[sanc.severity] || 0) : 0;

  const gti = (typeof GTI_DATA !== "undefined") ? GTI_DATA[alpha3] : null;
  const gtiBoost = gti ? Math.min(8, gti.score * 0.8) : 0;

  const baseRisk = 100 - cpi.score;
  const total = Math.max(0, Math.min(100, Math.round(
    baseRisk + fatfBoost + activityBoost + sanctionsBoost + gtiBoost
  )));

  let tier, color;
  if      (total >= 80) { tier = "Severe";   color = "#ff5b5b"; }
  else if (total >= 60) { tier = "Elevated"; color = "#f6a200"; }
  else if (total >= 40) { tier = "Moderate"; color = "#f6e58d"; }
  else if (total >= 20) { tier = "Low";      color = "#74c476"; }
  else                  { tier = "Minimal";  color = "#1b6f3a"; }

  return {
    total,
    tier,
    color,
    components: {
      baseRisk,
      fatfBoost,
      activityBoost: Math.round(activityBoost * 10) / 10,
      sanctionsBoost,
      gtiBoost: Math.round(gtiBoost * 10) / 10
    }
  };
};
