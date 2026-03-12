import { supabase } from "../integrations/supabase/client";
import type {
  Project,
  ProjectInsert,
  ProjectUpdate,
  ProjectRisk,
  ProjectRiskInsert,
  ProjectRiskUpdate,
  ProjectKPI,
  ProjectKPIInsert,
  ProjectKPIUpdate,
  ProjectDependency,
  ProjectDependencyInsert,
  ProjectDependencyUpdate,
  ProjectStakeholder,
  ProjectStakeholderInsert,
  ProjectStakeholderUpdate,
  ProjectSystem,
  ProjectSystemInsert,
  ProjectSystemUpdate,
  ProjectAssessment,
  ProjectAssessmentInsert,
  ProjectDecision,
  ProjectDecisionInsert,
  ProjectComment,
  ProjectCommentInsert,
  ROIScenario,
  ROIScenarioInsert,
  ActivityLog,
  Notification,
  Profile,
  UserRole,
  UserRoleInsert,
  Sprint,
  SprintInsert,
  SprintUpdate,
  SprintTask,
  SprintTaskInsert,
  SprintTaskUpdate,
} from "../integrations/supabase/types";

// =============================================================================
// Helpers
// =============================================================================

/**
 * Throws with the Supabase error message when `error` is truthy.
 */
function throwOnError<T>(result: { data: T | null; error: unknown }): T {
  if (result.error) {
    const msg =
      typeof result.error === "object" && result.error !== null && "message" in result.error
        ? (result.error as { message: string }).message
        : String(result.error);
    throw new Error(msg);
  }
  return result.data as T;
}

// =============================================================================
// Projects
// =============================================================================

export async function fetchProjects(): Promise<Project[]> {
  if (!supabase) return [];
  const result = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  return throwOnError(result) ?? [];
}

export async function fetchProject(id: string): Promise<Project | null> {
  if (!supabase) return null;
  const result = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();
  return throwOnError(result);
}

export async function createProject(data: ProjectInsert): Promise<Project> {
  if (!supabase) return { id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...data } as Project;
  const result = await supabase.from("projects").insert(data).select().single();
  return throwOnError(result);
}

export async function updateProject(id: string, data: ProjectUpdate): Promise<Project> {
  if (!supabase) return { id, created_at: "", updated_at: new Date().toISOString(), ...data } as unknown as Project;
  const result = await supabase.from("projects").update(data).eq("id", id).select().single();
  return throwOnError(result);
}

export async function deleteProject(id: string): Promise<void> {
  if (!supabase) return;
  const result = await supabase.from("projects").delete().eq("id", id);
  throwOnError(result);
}

// =============================================================================
// Project Risks
// =============================================================================

export async function fetchProjectRisks(projectId: string): Promise<ProjectRisk[]> {
  if (!supabase) return [];
  const result = await supabase.from("project_risks").select("*").eq("project_id", projectId).order("created_at");
  return throwOnError(result) ?? [];
}

export async function createProjectRisk(data: ProjectRiskInsert): Promise<ProjectRisk> {
  if (!supabase) return { id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...data } as ProjectRisk;
  const result = await supabase.from("project_risks").insert(data).select().single();
  return throwOnError(result);
}

export async function updateProjectRisk(id: string, data: ProjectRiskUpdate): Promise<ProjectRisk> {
  if (!supabase) return { id, created_at: "", updated_at: new Date().toISOString(), ...data } as unknown as ProjectRisk;
  const result = await supabase.from("project_risks").update(data).eq("id", id).select().single();
  return throwOnError(result);
}

export async function deleteProjectRisk(id: string): Promise<void> {
  if (!supabase) return;
  const result = await supabase.from("project_risks").delete().eq("id", id);
  throwOnError(result);
}

// =============================================================================
// Project KPIs
// =============================================================================

export async function fetchProjectKPIs(projectId: string): Promise<ProjectKPI[]> {
  if (!supabase) return [];
  const result = await supabase.from("project_kpis").select("*").eq("project_id", projectId).order("created_at");
  return throwOnError(result) ?? [];
}

export async function createProjectKPI(data: ProjectKPIInsert): Promise<ProjectKPI> {
  if (!supabase) return { id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...data } as ProjectKPI;
  const result = await supabase.from("project_kpis").insert(data).select().single();
  return throwOnError(result);
}

export async function updateProjectKPI(id: string, data: ProjectKPIUpdate): Promise<ProjectKPI> {
  if (!supabase) return { id, created_at: "", updated_at: new Date().toISOString(), ...data } as unknown as ProjectKPI;
  const result = await supabase.from("project_kpis").update(data).eq("id", id).select().single();
  return throwOnError(result);
}

export async function deleteProjectKPI(id: string): Promise<void> {
  if (!supabase) return;
  const result = await supabase.from("project_kpis").delete().eq("id", id);
  throwOnError(result);
}

// =============================================================================
// Project Dependencies
// =============================================================================

export async function fetchProjectDependencies(projectId: string): Promise<ProjectDependency[]> {
  if (!supabase) return [];
  const result = await supabase.from("project_dependencies").select("*").eq("project_id", projectId).order("created_at");
  return throwOnError(result) ?? [];
}

export async function createProjectDependency(data: ProjectDependencyInsert): Promise<ProjectDependency> {
  if (!supabase) return { id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...data } as ProjectDependency;
  const result = await supabase.from("project_dependencies").insert(data).select().single();
  return throwOnError(result);
}

export async function updateProjectDependency(id: string, data: ProjectDependencyUpdate): Promise<ProjectDependency> {
  if (!supabase) return { id, created_at: "", updated_at: new Date().toISOString(), ...data } as unknown as ProjectDependency;
  const result = await supabase.from("project_dependencies").update(data).eq("id", id).select().single();
  return throwOnError(result);
}

export async function deleteProjectDependency(id: string): Promise<void> {
  if (!supabase) return;
  const result = await supabase.from("project_dependencies").delete().eq("id", id);
  throwOnError(result);
}

// =============================================================================
// Project Stakeholders
// =============================================================================

export async function fetchProjectStakeholders(projectId: string): Promise<ProjectStakeholder[]> {
  if (!supabase) return [];
  const result = await supabase.from("project_stakeholders").select("*").eq("project_id", projectId).order("created_at");
  return throwOnError(result) ?? [];
}

export async function createProjectStakeholder(data: ProjectStakeholderInsert): Promise<ProjectStakeholder> {
  if (!supabase) return { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...data } as ProjectStakeholder;
  const result = await supabase.from("project_stakeholders").insert(data).select().single();
  return throwOnError(result);
}

export async function updateProjectStakeholder(id: string, data: ProjectStakeholderUpdate): Promise<ProjectStakeholder> {
  if (!supabase) return { id, created_at: "", ...data } as unknown as ProjectStakeholder;
  const result = await supabase.from("project_stakeholders").update(data).eq("id", id).select().single();
  return throwOnError(result);
}

export async function deleteProjectStakeholder(id: string): Promise<void> {
  if (!supabase) return;
  const result = await supabase.from("project_stakeholders").delete().eq("id", id);
  throwOnError(result);
}

// =============================================================================
// Project Systems
// =============================================================================

export async function fetchProjectSystems(projectId: string): Promise<ProjectSystem[]> {
  if (!supabase) return [];
  const result = await supabase.from("project_systems").select("*").eq("project_id", projectId).order("created_at");
  return throwOnError(result) ?? [];
}

export async function createProjectSystem(data: ProjectSystemInsert): Promise<ProjectSystem> {
  if (!supabase) return { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...data } as ProjectSystem;
  const result = await supabase.from("project_systems").insert(data).select().single();
  return throwOnError(result);
}

export async function updateProjectSystem(id: string, data: ProjectSystemUpdate): Promise<ProjectSystem> {
  if (!supabase) return { id, created_at: "", ...data } as unknown as ProjectSystem;
  const result = await supabase.from("project_systems").update(data).eq("id", id).select().single();
  return throwOnError(result);
}

export async function deleteProjectSystem(id: string): Promise<void> {
  if (!supabase) return;
  const result = await supabase.from("project_systems").delete().eq("id", id);
  throwOnError(result);
}

// =============================================================================
// Project Assessments
// =============================================================================

export async function fetchProjectAssessments(projectId: string): Promise<ProjectAssessment[]> {
  if (!supabase) return [];
  const result = await supabase.from("project_assessments").select("*").eq("project_id", projectId).order("created_at", { ascending: false });
  return throwOnError(result) ?? [];
}

export async function createProjectAssessment(data: ProjectAssessmentInsert): Promise<ProjectAssessment> {
  if (!supabase) return { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...data } as ProjectAssessment;
  const result = await supabase.from("project_assessments").insert(data).select().single();
  return throwOnError(result);
}

// =============================================================================
// Project Decisions
// =============================================================================

export async function fetchProjectDecisions(projectId: string): Promise<ProjectDecision[]> {
  if (!supabase) return [];
  const result = await supabase.from("project_decisions").select("*").eq("project_id", projectId).order("decided_at", { ascending: false });
  return throwOnError(result) ?? [];
}

export async function createProjectDecision(data: ProjectDecisionInsert): Promise<ProjectDecision> {
  if (!supabase) return { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...data } as ProjectDecision;
  const result = await supabase.from("project_decisions").insert(data).select().single();
  return throwOnError(result);
}

// =============================================================================
// Project Comments
// =============================================================================

export async function fetchProjectComments(projectId: string): Promise<ProjectComment[]> {
  if (!supabase) return [];
  const result = await supabase.from("project_comments").select("*").eq("project_id", projectId).order("created_at", { ascending: false });
  return throwOnError(result) ?? [];
}

export async function createProjectComment(data: ProjectCommentInsert): Promise<ProjectComment> {
  if (!supabase) return { id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...data } as ProjectComment;
  const result = await supabase.from("project_comments").insert(data).select().single();
  return throwOnError(result);
}

// =============================================================================
// ROI Scenarios
// =============================================================================

export async function fetchROIScenarios(projectId: string): Promise<ROIScenario[]> {
  if (!supabase) return [];
  const result = await supabase.from("roi_scenarios").select("*").eq("project_id", projectId).order("factor");
  return throwOnError(result) ?? [];
}

export async function saveROIScenarios(projectId: string, scenarios: Omit<ROIScenarioInsert, "project_id">[]): Promise<ROIScenario[]> {
  if (!supabase) {
    return scenarios.map((s) => ({
      id: crypto.randomUUID(),
      project_id: projectId,
      created_at: new Date().toISOString(),
      ...s,
    })) as ROIScenario[];
  }

  // Delete existing scenarios for the project, then insert new ones
  await supabase.from("roi_scenarios").delete().eq("project_id", projectId);
  const rows = scenarios.map((s) => ({ ...s, project_id: projectId }));
  const result = await supabase.from("roi_scenarios").insert(rows).select();
  return throwOnError(result) ?? [];
}

// =============================================================================
// Activity Logs
// =============================================================================

export async function fetchActivityLogs(projectId: string): Promise<ActivityLog[]> {
  if (!supabase) return [];
  const result = await supabase.from("activity_logs").select("*").eq("project_id", projectId).order("created_at", { ascending: false });
  return throwOnError(result) ?? [];
}

// =============================================================================
// Notifications
// =============================================================================

export async function fetchNotifications(userId: string): Promise<Notification[]> {
  if (!supabase) return [];
  const result = await supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  return throwOnError(result) ?? [];
}

export async function markNotificationRead(id: string): Promise<void> {
  if (!supabase) return;
  const result = await supabase.from("notifications").update({ read: true }).eq("id", id);
  throwOnError(result);
}

// =============================================================================
// Profiles
// =============================================================================

export async function fetchProfiles(): Promise<Profile[]> {
  if (!supabase) return [];
  const result = await supabase.from("profiles").select("*").order("display_name");
  return throwOnError(result) ?? [];
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null;
  const result = await supabase.from("profiles").select("*").eq("id", userId).single();
  return throwOnError(result);
}

// =============================================================================
// User Roles
// =============================================================================

export async function fetchUserRoles(userId: string): Promise<UserRole[]> {
  if (!supabase) return [];
  const result = await supabase.from("user_roles").select("*").eq("user_id", userId);
  return throwOnError(result) ?? [];
}

export async function assignRole(data: UserRoleInsert): Promise<UserRole> {
  if (!supabase) return { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...data } as UserRole;
  const result = await supabase.from("user_roles").insert(data).select().single();
  return throwOnError(result);
}

export async function removeRole(id: string): Promise<void> {
  if (!supabase) return;
  const result = await supabase.from("user_roles").delete().eq("id", id);
  throwOnError(result);
}

// =============================================================================
// Sprints
// =============================================================================

export async function fetchSprints(projectId: string): Promise<Sprint[]> {
  if (!supabase) return [];
  const result = await supabase.from("sprints").select("*").eq("project_id", projectId).order("created_at");
  return throwOnError(result) ?? [];
}

export async function createSprint(data: SprintInsert): Promise<Sprint> {
  if (!supabase) return { id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...data } as Sprint;
  const result = await supabase.from("sprints").insert(data).select().single();
  return throwOnError(result);
}

export async function updateSprint(id: string, data: SprintUpdate): Promise<Sprint> {
  if (!supabase) return { id, created_at: "", updated_at: new Date().toISOString(), ...data } as unknown as Sprint;
  const result = await supabase.from("sprints").update(data).eq("id", id).select().single();
  return throwOnError(result);
}

// =============================================================================
// Sprint Tasks
// =============================================================================

export async function fetchSprintTasks(sprintId: string): Promise<SprintTask[]> {
  if (!supabase) return [];
  const result = await supabase.from("sprint_tasks").select("*").eq("sprint_id", sprintId).order("created_at");
  return throwOnError(result) ?? [];
}

export async function createSprintTask(data: SprintTaskInsert): Promise<SprintTask> {
  if (!supabase) return { id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...data } as SprintTask;
  const result = await supabase.from("sprint_tasks").insert(data).select().single();
  return throwOnError(result);
}

export async function updateSprintTask(id: string, data: SprintTaskUpdate): Promise<SprintTask> {
  if (!supabase) return { id, created_at: "", updated_at: new Date().toISOString(), ...data } as unknown as SprintTask;
  const result = await supabase.from("sprint_tasks").update(data).eq("id", id).select().single();
  return throwOnError(result);
}
