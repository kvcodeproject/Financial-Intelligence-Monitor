/* global CPI_DATA, FATF_STATUS */
"use strict";

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

  const baseRisk = 100 - cpi.score;
  const total = Math.max(0, Math.min(100, Math.round(baseRisk + fatfBoost + activityBoost)));

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
      activityBoost: Math.round(activityBoost * 10) / 10
    }
  };
};
