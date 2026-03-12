import type { Project } from "../integrations/supabase/types";

// ---------------------------------------------------------------------------
// Entscheidungsreife (Decision-Readiness Check)
// ---------------------------------------------------------------------------

export type CompletenessLevel =
  | "unvollständig"
  | "in Bewertung"
  | "entscheidungsreif";

export interface CompletenessResult {
  level: CompletenessLevel;
  percentage: number;
  missingFields: string[];
}

interface FieldCheck {
  label: string;
  check: (
    project: Partial<Project>,
    counts: RelationCounts,
  ) => boolean;
}

interface RelationCounts {
  kpiCount: number;
  riskCount: number;
  dependencyCount: number;
}

// Pflichtfelder für Entscheidungsreife
const REQUIRED_CHECKS: FieldCheck[] = [
  {
    label: "Projektname",
    check: (p) => !!p.name,
  },
  {
    label: "Fachbereich",
    check: (p) => !!p.department,
  },
  {
    label: "Problemstellung",
    check: (p) => !!p.problem,
  },
  {
    label: "Zielbild",
    check: (p) => !!p.target_vision,
  },
  {
    label: "Projekttyp",
    check: (p) => p.project_type != null,
  },
  {
    label: "Ansprechpartner",
    check: (p) => !!p.contact,
  },
  {
    label: "Sponsor",
    check: (p) => !!p.sponsor,
  },
  {
    label: "Strategische Relevanz",
    check: (p) => !!p.strategic_relevance,
  },
  {
    label: "Zeitkritikalität",
    check: (p) => p.time_criticality != null,
  },
  {
    label: "Nutzeranzahl",
    check: (p) => p.user_count != null && p.user_count > 0,
  },
  {
    label: "Bewertung: Business Value",
    check: (p) => p.score_business_value != null,
  },
  {
    label: "Bewertung: Machbarkeit",
    check: (p) => p.score_feasibility != null,
  },
  {
    label: "Bewertung: Risiko",
    check: (p) => p.score_risk != null,
  },
  {
    label: "Bewertung: ROI",
    check: (p) => p.score_roi != null,
  },
  {
    label: "Bewertung: Strategischer Fit",
    check: (p) => p.score_strategic_fit != null,
  },
  {
    label: "Einmalkosten",
    check: (p) => p.one_time_costs != null,
  },
  {
    label: "Laufende Kosten",
    check: (p) => p.recurring_costs != null,
  },
  {
    label: "Erwartete Einsparungen",
    check: (p) => p.estimated_savings != null,
  },
  {
    label: "Mindestens 1 KPI definiert",
    check: (_p, c) => c.kpiCount > 0,
  },
  {
    label: "Mindestens 1 Risiko erfasst",
    check: (_p, c) => c.riskCount > 0,
  },
];

/**
 * Prüft die Entscheidungsreife eines Projekts.
 *
 * - < 50 %  → "unvollständig"
 * - < 100 % → "in Bewertung"
 * - 100 %   → "entscheidungsreif"
 */
export function checkCompleteness(
  project: Partial<Project>,
  kpiCount: number,
  riskCount: number,
  dependencyCount: number,
): CompletenessResult {
  const counts: RelationCounts = { kpiCount, riskCount, dependencyCount };
  const missingFields: string[] = [];

  for (const { label, check } of REQUIRED_CHECKS) {
    if (!check(project, counts)) {
      missingFields.push(label);
    }
  }

  const fulfilled = REQUIRED_CHECKS.length - missingFields.length;
  const percentage = Math.round((fulfilled / REQUIRED_CHECKS.length) * 100);

  let level: CompletenessLevel;
  if (percentage >= 100) {
    level = "entscheidungsreif";
  } else if (percentage >= 50) {
    level = "in Bewertung";
  } else {
    level = "unvollständig";
  }

  return { level, percentage, missingFields };
}
