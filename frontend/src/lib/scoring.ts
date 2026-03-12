import type { Project, PriorityClass } from "../integrations/supabase/types";

// ---------------------------------------------------------------------------
// Gewichtungen (Weights)
// ---------------------------------------------------------------------------

export const WEIGHTS = {
  business_value: 0.25,
  feasibility: 0.2,
  risk: 0.2,
  roi: 0.2,
  strategic_fit: 0.15,
} as const;

type ScoreKey = keyof typeof WEIGHTS;

const SCORE_FIELDS: Record<ScoreKey, keyof Project> = {
  business_value: "score_business_value",
  feasibility: "score_feasibility",
  risk: "score_risk",
  roi: "score_roi",
  strategic_fit: "score_strategic_fit",
};

// ---------------------------------------------------------------------------
// Weighted Score (0–5)
// ---------------------------------------------------------------------------

/**
 * Berechnet den gewichteten Gesamtscore eines Projekts.
 * Fehlende Scores werden ignoriert und die Gewichte auf die vorhandenen
 * Dimensionen normalisiert.
 */
export function calculateWeightedScore(project: Partial<Project>): number {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const [key, weight] of Object.entries(WEIGHTS)) {
    const field = SCORE_FIELDS[key as ScoreKey];
    const value = project[field] as number | null | undefined;
    if (value != null) {
      weightedSum += value * weight;
      totalWeight += weight;
    }
  }

  if (totalWeight === 0) return 0;
  return weightedSum / totalWeight;
}

// ---------------------------------------------------------------------------
// Recommendation / PriorityClass
// ---------------------------------------------------------------------------

export function getRecommendation(score: number): PriorityClass {
  if (score >= 4.0) return "Sofort angehen";
  if (score >= 3.0) return "Pilotieren";
  if (score >= 2.0) return "Vorarbeit nötig";
  return "Stoppen";
}

// ---------------------------------------------------------------------------
// Score → Tailwind Color
// ---------------------------------------------------------------------------

export function getScoreColor(score: number): string {
  if (score >= 4.5) return "text-green-600";
  if (score >= 3.5) return "text-lime-600";
  if (score >= 2.5) return "text-yellow-600";
  if (score >= 1.5) return "text-orange-600";
  return "text-red-600";
}

// ---------------------------------------------------------------------------
// Warnungen bei widersprüchlichen Bewertungen
// ---------------------------------------------------------------------------

export function getScoreWarnings(project: Partial<Project>): string[] {
  const warnings: string[] = [];

  const bv = project.score_business_value ?? null;
  const risk = project.score_risk ?? null;
  const roi = project.score_roi ?? null;
  const feasibility = project.score_feasibility ?? null;
  const fit = project.score_strategic_fit ?? null;

  // Hoher ROI bei gleichzeitig hohem Risiko
  if (roi != null && roi >= 4 && risk != null && risk <= 2) {
    warnings.push(
      "Hoher ROI-Score, aber niedriger Risiko-Score – bitte Risikobewertung prüfen.",
    );
  }

  // Hoher Business Value, aber niedrige Machbarkeit
  if (bv != null && bv >= 4 && feasibility != null && feasibility <= 2) {
    warnings.push(
      "Hoher Business-Value bei niedriger Machbarkeit – Umsetzungsrisiken beachten.",
    );
  }

  // Hoher Business Value + offene Blocker (approximiert durch niedrige Feasibility)
  if (bv != null && bv >= 4 && feasibility != null && feasibility <= 1.5) {
    warnings.push(
      "Hoher Business-Value mit potenziellen Blockern – Abhängigkeiten klären.",
    );
  }

  // Niedriger strategischer Fit bei hohem ROI
  if (fit != null && fit <= 2 && roi != null && roi >= 4) {
    warnings.push(
      "Hoher ROI, aber niedrige strategische Passung – strategische Einordnung überprüfen.",
    );
  }

  // Alle Scores niedrig
  if (
    bv != null &&
    risk != null &&
    roi != null &&
    feasibility != null &&
    fit != null
  ) {
    const avg = (bv + risk + roi + feasibility + fit) / 5;
    if (avg < 2) {
      warnings.push(
        "Alle Bewertungsdimensionen unterdurchschnittlich – Projekt sollte gestoppt werden.",
      );
    }
  }

  return warnings;
}

// ---------------------------------------------------------------------------
// ROI-Szenarien
// ---------------------------------------------------------------------------

export interface ROIScenarioResult {
  label: string;
  annualSavings: number;
  netBenefit: number;
  roiPercent: number;
  breakEvenMonths: number;
}

/**
 * Berechnet drei Szenarien (Konservativ, Realistisch, Ambitioniert).
 *
 * @param oneTimeCosts  Einmalige Kosten
 * @param recurringCosts  Jährliche laufende Kosten
 * @param estimatedSavings  Geschätztes jährliches Einsparpotenzial
 */
export function calculateROIScenarios(
  oneTimeCosts: number,
  recurringCosts: number,
  estimatedSavings: number,
): ROIScenarioResult[] {
  const scenarios: { label: string; factor: number }[] = [
    { label: "Konservativ", factor: 0.6 },
    { label: "Realistisch", factor: 1.0 },
    { label: "Ambitioniert", factor: 1.4 },
  ];

  return scenarios.map(({ label, factor }) => {
    const annualSavings = estimatedSavings * factor;
    const totalCostsYear1 = oneTimeCosts + recurringCosts;
    const netBenefit = annualSavings - totalCostsYear1;
    const roiPercent =
      totalCostsYear1 > 0 ? ((annualSavings - totalCostsYear1) / totalCostsYear1) * 100 : 0;

    // Break-even in Monaten: Einmalkosten + laufende Kosten bis break-even
    // monatliche Einsparung vs. monatliche laufende Kosten
    const monthlySavings = annualSavings / 12;
    const monthlyRecurring = recurringCosts / 12;
    const netMonthly = monthlySavings - monthlyRecurring;

    const breakEvenMonths =
      netMonthly > 0 ? Math.ceil(oneTimeCosts / netMonthly) : Infinity;

    return {
      label,
      annualSavings,
      netBenefit,
      roiPercent,
      breakEvenMonths: Number.isFinite(breakEvenMonths) ? breakEvenMonths : -1,
    };
  });
}
