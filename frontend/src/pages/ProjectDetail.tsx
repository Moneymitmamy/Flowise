import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  AlertTriangle,
  Plus,
  CheckCircle2,
  XCircle,
  Users,
  Calendar,
  Building2,
  User,
  Target,
} from "lucide-react";

import {
  fetchProject,
  fetchProjectRisks,
  fetchProjectKPIs,
  fetchProjectDependencies,
  fetchProjectStakeholders,
  updateProject,
  createProjectRisk,
  createProjectKPI,
  createProjectDependency,
} from "@/lib/api";
import {
  calculateWeightedScore,
  getRecommendation,
  getScoreColor,
  getScoreWarnings,
  calculateROIScenarios,
  WEIGHTS,
} from "@/lib/scoring";
import { checkCompleteness } from "@/lib/completeness";
import type {
  Project,
  ProjectStatus,
  ProjectUpdate,
  RiskSeverity,
  DependencyStatus,
} from "@/integrations/supabase/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---------------------------------------------------------------------------
// Status -> CSS class mapping
// ---------------------------------------------------------------------------

const STATUS_CLASS_MAP: Record<ProjectStatus, string> = {
  Idee: "status-idea",
  "In Bewertung": "status-review",
  Pilot: "status-pilot",
  Umsetzung: "status-implementation",
  Live: "status-live",
  Gestoppt: "status-stopped",
};

// ---------------------------------------------------------------------------
// EUR formatter
// ---------------------------------------------------------------------------

const eurFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

// ---------------------------------------------------------------------------
// Score dimension labels
// ---------------------------------------------------------------------------

const SCORE_LABELS: Record<string, string> = {
  business_value: "Business Value",
  feasibility: "Machbarkeit",
  risk: "Risiko",
  roi: "ROI",
  strategic_fit: "Strategischer Fit",
};

const SCORE_FIELD_MAP: Record<string, keyof Project> = {
  business_value: "score_business_value",
  feasibility: "score_feasibility",
  risk: "score_risk",
  roi: "score_roi",
  strategic_fit: "score_strategic_fit",
};

// ---------------------------------------------------------------------------
// Severity badge variants
// ---------------------------------------------------------------------------

function severityVariant(s: RiskSeverity): string {
  switch (s) {
    case "Kritisch":
      return "bg-red-100 text-red-800 border-red-200";
    case "Hoch":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "Mittel":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Niedrig":
      return "bg-green-100 text-green-800 border-green-200";
  }
}

function depStatusVariant(s: DependencyStatus): string {
  switch (s) {
    case "Erledigt":
      return "bg-green-100 text-green-800 border-green-200";
    case "In Arbeit":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Offen":
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="h-4 w-full max-w-md" />
      <Skeleton className="h-10 w-full max-w-xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ===========================================================================
// Main Component
// ===========================================================================

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ---- Data fetching ----
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => fetchProject(id!),
    enabled: !!id,
  });

  const { data: risks = [] } = useQuery({
    queryKey: ["project-risks", id],
    queryFn: () => fetchProjectRisks(id!),
    enabled: !!id,
  });

  const { data: kpis = [] } = useQuery({
    queryKey: ["project-kpis", id],
    queryFn: () => fetchProjectKPIs(id!),
    enabled: !!id,
  });

  const { data: dependencies = [] } = useQuery({
    queryKey: ["project-dependencies", id],
    queryFn: () => fetchProjectDependencies(id!),
    enabled: !!id,
  });

  const { data: stakeholders = [] } = useQuery({
    queryKey: ["project-stakeholders", id],
    queryFn: () => fetchProjectStakeholders(id!),
    enabled: !!id,
  });

  // ---- Mutations ----
  const updateMutation = useMutation({
    mutationFn: (data: ProjectUpdate) => updateProject(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      toast.success("Projekt aktualisiert");
    },
    onError: (err: Error) => {
      toast.error("Fehler beim Speichern: " + err.message);
    },
  });

  const createRiskMutation = useMutation({
    mutationFn: createProjectRisk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-risks", id] });
      toast.success("Risiko hinzugefuegt");
    },
  });

  const createKPIMutation = useMutation({
    mutationFn: createProjectKPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-kpis", id] });
      toast.success("KPI hinzugefuegt");
    },
  });

  const createDepMutation = useMutation({
    mutationFn: createProjectDependency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-dependencies", id] });
      toast.success("Abhaengigkeit hinzugefuegt");
    },
  });

  // ---- Loading state ----
  if (projectLoading) {
    return <DetailSkeleton />;
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <h2 className="text-xl font-semibold">Projekt nicht gefunden</h2>
        <Button variant="outline" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurueck zur Uebersicht
        </Button>
      </div>
    );
  }

  // ---- Computed values ----
  const weightedScore = calculateWeightedScore(project);
  const recommendation = getRecommendation(weightedScore);
  const scoreColor = getScoreColor(weightedScore);
  const warnings = getScoreWarnings(project);
  const completeness = checkCompleteness(
    project,
    kpis.length,
    risks.length,
    dependencies.length,
  );

  return (
    <div className="space-y-6">
      {/* ================================================================= */}
      {/* Header */}
      {/* ================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            aria-label="Zurueck"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
          <Badge className={STATUS_CLASS_MAP[project.status]}>
            {project.status}
          </Badge>
          <span className={`text-lg font-semibold ${scoreColor}`}>
            {weightedScore.toFixed(1)} / 5.0
          </span>
          <Badge variant="outline">{recommendation}</Badge>
        </div>

        {/* Completeness bar */}
        <div className="flex items-center gap-3 max-w-md">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Vollstaendigkeit
          </span>
          <Progress value={completeness.percentage} className="flex-1" />
          <span className="text-sm font-medium">{completeness.percentage}%</span>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Tabs */}
      {/* ================================================================= */}
      <Tabs defaultValue="uebersicht">
        <TabsList className="flex-wrap">
          <TabsTrigger value="uebersicht">Uebersicht</TabsTrigger>
          <TabsTrigger value="bewertung">Bewertung</TabsTrigger>
          <TabsTrigger value="finanzen">Finanzen</TabsTrigger>
          <TabsTrigger value="risiken">Risiken</TabsTrigger>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
          <TabsTrigger value="abhaengigkeiten">Abhaengigkeiten</TabsTrigger>
        </TabsList>

        {/* ---- Tab: Uebersicht ---- */}
        <TabsContent value="uebersicht">
          <OverviewTab
            project={project}
            warnings={warnings}
          />
        </TabsContent>

        {/* ---- Tab: Bewertung ---- */}
        <TabsContent value="bewertung">
          <ScoringTab
            project={project}
            weightedScore={weightedScore}
            onSave={(data) => updateMutation.mutate(data)}
            isSaving={updateMutation.isPending}
          />
        </TabsContent>

        {/* ---- Tab: Finanzen ---- */}
        <TabsContent value="finanzen">
          <FinancesTab
            project={project}
            onSave={(data) => updateMutation.mutate(data)}
            isSaving={updateMutation.isPending}
          />
        </TabsContent>

        {/* ---- Tab: Risiken ---- */}
        <TabsContent value="risiken">
          <RisksTab
            risks={risks}
            projectId={id!}
            onCreate={(data) => createRiskMutation.mutate(data)}
            isCreating={createRiskMutation.isPending}
          />
        </TabsContent>

        {/* ---- Tab: KPIs ---- */}
        <TabsContent value="kpis">
          <KPIsTab
            kpis={kpis}
            projectId={id!}
            onCreate={(data) => createKPIMutation.mutate(data)}
            isCreating={createKPIMutation.isPending}
          />
        </TabsContent>

        {/* ---- Tab: Abhaengigkeiten ---- */}
        <TabsContent value="abhaengigkeiten">
          <DependenciesTab
            dependencies={dependencies}
            projectId={id!}
            onCreate={(data) => createDepMutation.mutate(data)}
            isCreating={createDepMutation.isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ===========================================================================
// Tab: Uebersicht
// ===========================================================================

function OverviewTab({
  project,
  warnings,
}: {
  project: Project;
  warnings: string[];
}) {
  const infoCards: { label: string; value: string | number | null; icon: React.ReactNode }[] = [
    { label: "Fachbereich", value: project.department, icon: <Building2 className="h-4 w-4" /> },
    { label: "Ansprechpartner", value: project.contact, icon: <User className="h-4 w-4" /> },
    { label: "Sponsor", value: project.sponsor, icon: <User className="h-4 w-4" /> },
    { label: "Projekttyp", value: project.project_type, icon: <Target className="h-4 w-4" /> },
    { label: "Zeitkritikalitaet", value: project.time_criticality, icon: <Calendar className="h-4 w-4" /> },
    { label: "Nutzeranzahl", value: project.user_count, icon: <Users className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6 mt-4">
      {/* Info cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {infoCards.map((item) => (
          <Card key={item.label}>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              {item.icon}
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base font-semibold">
                {item.value ?? <span className="text-muted-foreground">--</span>}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Problemstellung */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Problemstellung</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{project.problem || "--"}</p>
        </CardContent>
      </Card>

      {/* Zielbild */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Zielbild</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{project.target_vision || "--"}</p>
        </CardContent>
      </Card>

      {/* Strategische Relevanz */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Strategische Relevanz</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">
            {project.strategic_relevance || "--"}
          </p>
        </CardContent>
      </Card>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold">Warnungen</h3>
          {warnings.map((w, i) => (
            <Alert key={i} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Hinweis</AlertTitle>
              <AlertDescription>{w}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// Tab: Bewertung (Scoring)
// ===========================================================================

function ScoringTab({
  project,
  weightedScore,
  onSave,
  isSaving,
}: {
  project: Project;
  weightedScore: number;
  onSave: (data: ProjectUpdate) => void;
  isSaving: boolean;
}) {
  const [scores, setScores] = useState<Record<string, number>>({
    business_value: project.score_business_value ?? 0,
    feasibility: project.score_feasibility ?? 0,
    risk: project.score_risk ?? 0,
    roi: project.score_roi ?? 0,
    strategic_fit: project.score_strategic_fit ?? 0,
  });

  const handleChange = (key: string, val: number) => {
    setScores((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = () => {
    const data: ProjectUpdate = {};
    for (const [key, value] of Object.entries(scores)) {
      const field = SCORE_FIELD_MAP[key] as keyof ProjectUpdate;
      (data as Record<string, number>)[field as string] = value;
    }
    onSave(data);
  };

  return (
    <div className="space-y-6 mt-4 max-w-2xl">
      {Object.entries(SCORE_LABELS).map(([key, label]) => (
        <div key={key} className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">{label}</Label>
            <span className="text-sm text-muted-foreground">
              Gewicht: {(WEIGHTS[key as keyof typeof WEIGHTS] * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Slider
              min={0}
              max={5}
              step={0.5}
              value={[scores[key]]}
              onValueChange={([v]) => handleChange(key, v)}
              className="flex-1"
            />
            <span className="w-10 text-right text-sm font-semibold">
              {scores[key].toFixed(1)}
            </span>
          </div>
        </div>
      ))}

      <Separator />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Gewichteter Gesamtscore</p>
          <p className={`text-2xl font-bold ${getScoreColor(weightedScore)}`}>
            {weightedScore.toFixed(2)} / 5.0
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Speichern..." : "Bewertung speichern"}
        </Button>
      </div>
    </div>
  );
}

// ===========================================================================
// Tab: Finanzen (Finances)
// ===========================================================================

function FinancesTab({
  project,
  onSave,
  isSaving,
}: {
  project: Project;
  onSave: (data: ProjectUpdate) => void;
  isSaving: boolean;
}) {
  const [oneTime, setOneTime] = useState(project.one_time_costs ?? 0);
  const [recurring, setRecurring] = useState(project.recurring_costs ?? 0);
  const [savings, setSavings] = useState(project.estimated_savings ?? 0);

  const scenarios = calculateROIScenarios(oneTime, recurring, savings);

  const handleSave = () => {
    onSave({
      one_time_costs: oneTime,
      recurring_costs: recurring,
      estimated_savings: savings,
    });
  };

  return (
    <div className="space-y-6 mt-4">
      {/* Input fields */}
      <div className="grid gap-4 sm:grid-cols-3 max-w-3xl">
        <div className="space-y-2">
          <Label>Einmalkosten</Label>
          <Input
            type="number"
            min={0}
            value={oneTime}
            onChange={(e) => setOneTime(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label>Laufende Kosten (jaehrlich)</Label>
          <Input
            type="number"
            min={0}
            value={recurring}
            onChange={(e) => setRecurring(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label>Erwartete Einsparungen (jaehrlich)</Label>
          <Input
            type="number"
            min={0}
            value={savings}
            onChange={(e) => setSavings(Number(e.target.value))}
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? "Speichern..." : "Finanzdaten speichern"}
      </Button>

      <Separator />

      {/* ROI Scenarios */}
      <div>
        <h3 className="text-base font-semibold mb-3">ROI-Szenarien</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Szenario</TableHead>
              <TableHead className="text-right">Jaehrl. Einsparungen</TableHead>
              <TableHead className="text-right">Nettonutzen</TableHead>
              <TableHead className="text-right">ROI %</TableHead>
              <TableHead className="text-right">Break-even (Monate)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scenarios.map((s) => (
              <TableRow key={s.label}>
                <TableCell className="font-medium">{s.label}</TableCell>
                <TableCell className="text-right">
                  {eurFormatter.format(s.annualSavings)}
                </TableCell>
                <TableCell className="text-right">
                  <span className={s.netBenefit >= 0 ? "text-green-600" : "text-red-600"}>
                    {eurFormatter.format(s.netBenefit)}
                  </span>
                </TableCell>
                <TableCell className="text-right">{s.roiPercent.toFixed(1)}%</TableCell>
                <TableCell className="text-right">
                  {s.breakEvenMonths >= 0 ? `${s.breakEvenMonths} Mon.` : "--"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ===========================================================================
// Tab: Risiken (Risks)
// ===========================================================================

function RisksTab({
  risks,
  projectId,
  onCreate,
  isCreating,
}: {
  risks: { id: string; description: string; severity: RiskSeverity; mitigation: string | null; owner: string | null }[];
  projectId: string;
  onCreate: (data: {
    project_id: string;
    description: string;
    severity: RiskSeverity;
    mitigation: string | null;
    owner: string | null;
  }) => void;
  isCreating: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [desc, setDesc] = useState("");
  const [severity, setSeverity] = useState<RiskSeverity>("Mittel");
  const [mitigation, setMitigation] = useState("");
  const [owner, setOwner] = useState("");

  const handleAdd = () => {
    if (!desc.trim()) return;
    onCreate({
      project_id: projectId,
      description: desc.trim(),
      severity,
      mitigation: mitigation.trim() || null,
      owner: owner.trim() || null,
    });
    setDesc("");
    setMitigation("");
    setOwner("");
    setSeverity("Mittel");
    setOpen(false);
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">
          Risiken ({risks.length})
        </h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" /> Risiko hinzufuegen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neues Risiko</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Beschreibung</Label>
                <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Schwere</Label>
                <Select value={severity} onValueChange={(v) => setSeverity(v as RiskSeverity)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Niedrig">Niedrig</SelectItem>
                    <SelectItem value="Mittel">Mittel</SelectItem>
                    <SelectItem value="Hoch">Hoch</SelectItem>
                    <SelectItem value="Kritisch">Kritisch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mitigation</Label>
                <Textarea value={mitigation} onChange={(e) => setMitigation(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Verantwortlich</Label>
                <Input value={owner} onChange={(e) => setOwner(e.target.value)} />
              </div>
              <Button onClick={handleAdd} disabled={isCreating || !desc.trim()} className="w-full">
                {isCreating ? "Speichern..." : "Hinzufuegen"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {risks.length === 0 ? (
        <p className="text-sm text-muted-foreground">Keine Risiken erfasst.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Beschreibung</TableHead>
              <TableHead>Schwere</TableHead>
              <TableHead>Mitigation</TableHead>
              <TableHead>Verantwortlich</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {risks.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="max-w-xs">{r.description}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={severityVariant(r.severity)}>
                    {r.severity}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs">{r.mitigation || "--"}</TableCell>
                <TableCell>{r.owner || "--"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

// ===========================================================================
// Tab: KPIs
// ===========================================================================

function KPIsTab({
  kpis,
  projectId,
  onCreate,
  isCreating,
}: {
  kpis: {
    id: string;
    name: string;
    unit: string | null;
    target_value: number | null;
    current_value: number | null;
    baseline_value: number | null;
  }[];
  projectId: string;
  onCreate: (data: {
    project_id: string;
    name: string;
    unit: string | null;
    target_value: number | null;
    current_value: number | null;
    baseline_value: number | null;
    measurement_frequency: string | null;
  }) => void;
  isCreating: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");
  const [baseline, setBaseline] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    onCreate({
      project_id: projectId,
      name: name.trim(),
      unit: unit.trim() || null,
      target_value: target ? Number(target) : null,
      current_value: current ? Number(current) : null,
      baseline_value: baseline ? Number(baseline) : null,
      measurement_frequency: null,
    });
    setName("");
    setUnit("");
    setTarget("");
    setCurrent("");
    setBaseline("");
    setOpen(false);
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">KPIs ({kpis.length})</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" /> KPI hinzufuegen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuer KPI</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Einheit</Label>
                <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="z.B. %, Stunden, EUR" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Zielwert</Label>
                  <Input type="number" value={target} onChange={(e) => setTarget(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Aktueller Wert</Label>
                  <Input type="number" value={current} onChange={(e) => setCurrent(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Baseline</Label>
                  <Input type="number" value={baseline} onChange={(e) => setBaseline(e.target.value)} />
                </div>
              </div>
              <Button onClick={handleAdd} disabled={isCreating || !name.trim()} className="w-full">
                {isCreating ? "Speichern..." : "Hinzufuegen"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {kpis.length === 0 ? (
        <p className="text-sm text-muted-foreground">Keine KPIs definiert.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Einheit</TableHead>
              <TableHead className="text-right">Zielwert</TableHead>
              <TableHead className="text-right">Aktueller Wert</TableHead>
              <TableHead className="text-right">Baseline</TableHead>
              <TableHead>Fortschritt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kpis.map((k) => {
              const progress =
                k.target_value != null && k.target_value > 0 && k.current_value != null
                  ? Math.min(100, Math.round((k.current_value / k.target_value) * 100))
                  : null;
              return (
                <TableRow key={k.id}>
                  <TableCell className="font-medium">{k.name}</TableCell>
                  <TableCell>{k.unit || "--"}</TableCell>
                  <TableCell className="text-right">{k.target_value ?? "--"}</TableCell>
                  <TableCell className="text-right">{k.current_value ?? "--"}</TableCell>
                  <TableCell className="text-right">{k.baseline_value ?? "--"}</TableCell>
                  <TableCell className="w-32">
                    {progress != null ? (
                      <div className="flex items-center gap-2">
                        <Progress value={progress} className="flex-1" />
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {progress}%
                        </span>
                      </div>
                    ) : (
                      "--"
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

// ===========================================================================
// Tab: Abhaengigkeiten (Dependencies)
// ===========================================================================

function DependenciesTab({
  dependencies,
  projectId,
  onCreate,
  isCreating,
}: {
  dependencies: {
    id: string;
    description: string;
    status: DependencyStatus;
    blocker: boolean;
    responsible: string | null;
    due_date: string | null;
  }[];
  projectId: string;
  onCreate: (data: {
    project_id: string;
    description: string;
    status: DependencyStatus;
    blocker: boolean;
    responsible: string | null;
    due_date: string | null;
  }) => void;
  isCreating: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState<DependencyStatus>("Offen");
  const [blocker, setBlocker] = useState(false);
  const [responsible, setResponsible] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleAdd = () => {
    if (!desc.trim()) return;
    onCreate({
      project_id: projectId,
      description: desc.trim(),
      status,
      blocker,
      responsible: responsible.trim() || null,
      due_date: dueDate || null,
    });
    setDesc("");
    setStatus("Offen");
    setBlocker(false);
    setResponsible("");
    setDueDate("");
    setOpen(false);
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">
          Abhaengigkeiten ({dependencies.length})
        </h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" /> Abhaengigkeit hinzufuegen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neue Abhaengigkeit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Beschreibung</Label>
                <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as DependencyStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Offen">Offen</SelectItem>
                    <SelectItem value="In Arbeit">In Arbeit</SelectItem>
                    <SelectItem value="Erledigt">Erledigt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="blocker-check"
                  checked={blocker}
                  onChange={(e) => setBlocker(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="blocker-check">Blocker</Label>
              </div>
              <div className="space-y-2">
                <Label>Verantwortlich</Label>
                <Input value={responsible} onChange={(e) => setResponsible(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Faelligkeitsdatum</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <Button onClick={handleAdd} disabled={isCreating || !desc.trim()} className="w-full">
                {isCreating ? "Speichern..." : "Hinzufuegen"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {dependencies.length === 0 ? (
        <p className="text-sm text-muted-foreground">Keine Abhaengigkeiten erfasst.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Beschreibung</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Blocker</TableHead>
              <TableHead>Verantwortlich</TableHead>
              <TableHead>Faelligkeitsdatum</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dependencies.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="max-w-xs">{d.description}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={depStatusVariant(d.status)}>
                    {d.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {d.blocker ? (
                    <XCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </TableCell>
                <TableCell>{d.responsible || "--"}</TableCell>
                <TableCell>
                  {d.due_date
                    ? new Date(d.due_date).toLocaleDateString("de-DE")
                    : "--"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
