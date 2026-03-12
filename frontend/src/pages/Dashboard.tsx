import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { FolderKanban, ClipboardCheck, Cog, Radio } from "lucide-react";

import { fetchProjects } from "@/lib/api";
import { calculateWeightedScore, getRecommendation, getScoreColor } from "@/lib/scoring";
import type { ProjectStatus } from "@/integrations/supabase/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
// Loading skeleton
// ---------------------------------------------------------------------------

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Summary cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-5 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export default function Dashboard() {
  const navigate = useNavigate();

  const {
    data: projects = [],
    isLoading,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <DashboardSkeleton />
      </div>
    );
  }

  const totalCount = projects.length;
  const reviewCount = projects.filter((p) => p.status === "In Bewertung").length;
  const implementationCount = projects.filter((p) => p.status === "Umsetzung").length;
  const liveCount = projects.filter((p) => p.status === "Live").length;

  const summaryCards = [
    {
      title: "Gesamt-Projekte",
      value: totalCount,
      icon: FolderKanban,
    },
    {
      title: "In Bewertung",
      value: reviewCount,
      icon: ClipboardCheck,
    },
    {
      title: "In Umsetzung",
      value: implementationCount,
      icon: Cog,
    },
    {
      title: "Live",
      value: liveCount,
      icon: Radio,
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          {totalCount} {totalCount === 1 ? "Projekt" : "Projekte"} im Portfolio
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alle Projekte</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Fachbereich</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead>Empfehlung</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Keine Projekte vorhanden.
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => {
                  const score = calculateWeightedScore(project);
                  const recommendation = getRecommendation(score);
                  const scoreColor = getScoreColor(score);
                  const statusClass = STATUS_CLASS_MAP[project.status] ?? "";

                  return (
                    <TableRow
                      key={project.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/projekte/${project.id}`)}
                    >
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>{project.department}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusClass}>
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${scoreColor}`}>
                        {score > 0 ? score.toFixed(1) : "\u2013"}
                      </TableCell>
                      <TableCell>{score > 0 ? recommendation : "\u2013"}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
