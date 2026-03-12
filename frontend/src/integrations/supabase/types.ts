// =============================================================================
// KI-Projekte-Navigator – Database Schema Types
// =============================================================================

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type AppRole = "admin" | "fachbereich" | "reviewer" | "management";

export type ProjectStatus =
  | "Idee"
  | "In Bewertung"
  | "Pilot"
  | "Umsetzung"
  | "Live"
  | "Gestoppt";

export type PriorityClass =
  | "Sofort angehen"
  | "Pilotieren"
  | "Vorarbeit nötig"
  | "Stoppen";

export type TimeCriticality = "Niedrig" | "Mittel" | "Hoch" | "Kritisch";

export type ProjectType =
  | "Effizienz"
  | "Umsatz"
  | "Qualität"
  | "Risiko"
  | "Service"
  | "Compliance"
  | "Wissen / Transparenz";

export type DecisionType =
  | "Go"
  | "No-Go"
  | "Pilot"
  | "Vertagt"
  | "Eskalation";

export type RiskSeverity = "Niedrig" | "Mittel" | "Hoch" | "Kritisch";

export type DependencyStatus = "Offen" | "In Arbeit" | "Erledigt";

export type SprintStatus = "Geplant" | "Aktiv" | "Abgeschlossen";

export type TaskStatus = "Offen" | "In Arbeit" | "Erledigt";

// ---------------------------------------------------------------------------
// Core entity – Project
// ---------------------------------------------------------------------------

export interface Project {
  id: string;
  created_by: string;
  name: string;
  department: string;
  contact: string | null;
  sponsor: string | null;
  problem: string;
  target_vision: string;
  project_type: ProjectType | null;
  status: ProjectStatus;
  priority_class: PriorityClass | null;
  time_criticality: TimeCriticality | null;
  strategic_relevance: string | null;
  vendor: string | null;
  user_count: number | null;
  maturity_level: number;
  recommendation: string | null;
  score_business_value: number | null;
  score_feasibility: number | null;
  score_risk: number | null;
  score_roi: number | null;
  score_strategic_fit: number | null;
  one_time_costs: number | null;
  recurring_costs: number | null;
  estimated_savings: number | null;
  created_at: string;
  updated_at: string;
}

export type ProjectInsert = Omit<Project, "id" | "created_at" | "updated_at">;
export type ProjectUpdate = Partial<ProjectInsert>;

/** Extended view that includes aggregated relation counts. */
export interface ProjectOverview extends Project {
  risk_count: number;
  kpi_count: number;
  dependency_count: number;
  assessment_count: number;
}

// ---------------------------------------------------------------------------
// Relational tables
// ---------------------------------------------------------------------------

export interface ProjectRisk {
  id: string;
  project_id: string;
  description: string;
  severity: RiskSeverity;
  mitigation: string | null;
  owner: string | null;
  created_at: string;
  updated_at: string;
}

export type ProjectRiskInsert = Omit<ProjectRisk, "id" | "created_at" | "updated_at">;
export type ProjectRiskUpdate = Partial<ProjectRiskInsert>;

export interface ProjectDependency {
  id: string;
  project_id: string;
  description: string;
  status: DependencyStatus;
  blocker: boolean;
  responsible: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export type ProjectDependencyInsert = Omit<ProjectDependency, "id" | "created_at" | "updated_at">;
export type ProjectDependencyUpdate = Partial<ProjectDependencyInsert>;

export interface ProjectStakeholder {
  id: string;
  project_id: string;
  name: string;
  role: string;
  department: string | null;
  influence: string | null;
  contact_info: string | null;
  created_at: string;
}

export type ProjectStakeholderInsert = Omit<ProjectStakeholder, "id" | "created_at">;
export type ProjectStakeholderUpdate = Partial<ProjectStakeholderInsert>;

export interface ProjectSystem {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  integration_type: string | null;
  status: string | null;
  created_at: string;
}

export type ProjectSystemInsert = Omit<ProjectSystem, "id" | "created_at">;
export type ProjectSystemUpdate = Partial<ProjectSystemInsert>;

export interface ProjectKPI {
  id: string;
  project_id: string;
  name: string;
  unit: string | null;
  target_value: number | null;
  current_value: number | null;
  baseline_value: number | null;
  measurement_frequency: string | null;
  created_at: string;
  updated_at: string;
}

export type ProjectKPIInsert = Omit<ProjectKPI, "id" | "created_at" | "updated_at">;
export type ProjectKPIUpdate = Partial<ProjectKPIInsert>;

export interface ProjectAssessment {
  id: string;
  project_id: string;
  assessed_by: string;
  score_business_value: number | null;
  score_feasibility: number | null;
  score_risk: number | null;
  score_roi: number | null;
  score_strategic_fit: number | null;
  comment: string | null;
  created_at: string;
}

export type ProjectAssessmentInsert = Omit<ProjectAssessment, "id" | "created_at">;

export interface ProjectDecision {
  id: string;
  project_id: string;
  decided_by: string;
  decision: DecisionType;
  rationale: string | null;
  conditions: string | null;
  decided_at: string;
  created_at: string;
}

export type ProjectDecisionInsert = Omit<ProjectDecision, "id" | "created_at">;

export interface ProjectComment {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export type ProjectCommentInsert = Omit<ProjectComment, "id" | "created_at" | "updated_at">;

export interface ROIScenario {
  id: string;
  project_id: string;
  label: string;
  factor: number;
  annual_savings: number;
  net_benefit: number;
  roi_percent: number;
  break_even_months: number;
  created_at: string;
}

export type ROIScenarioInsert = Omit<ROIScenario, "id" | "created_at">;

export interface ActivityLog {
  id: string;
  project_id: string;
  user_id: string;
  action: string;
  details: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  department: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export type UserRoleInsert = Omit<UserRole, "id" | "created_at">;

export interface Sprint {
  id: string;
  project_id: string;
  name: string;
  goal: string | null;
  status: SprintStatus;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export type SprintInsert = Omit<Sprint, "id" | "created_at" | "updated_at">;
export type SprintUpdate = Partial<SprintInsert>;

export interface SprintTask {
  id: string;
  sprint_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assignee: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export type SprintTaskInsert = Omit<SprintTask, "id" | "created_at" | "updated_at">;
export type SprintTaskUpdate = Partial<SprintTaskInsert>;
