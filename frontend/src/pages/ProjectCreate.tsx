import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { createProject } from "@/lib/api";
import type { ProjectInsert, ProjectType, TimeCriticality } from "@/integrations/supabase/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const projectTypes: ProjectType[] = [
  "Effizienz",
  "Umsatz",
  "Qualität",
  "Risiko",
  "Service",
  "Compliance",
  "Wissen / Transparenz",
];

const timeCriticalityValues: TimeCriticality[] = [
  "Niedrig",
  "Mittel",
  "Hoch",
  "Kritisch",
];

const formSchema = z.object({
  name: z.string().min(3, "Projektname muss mindestens 3 Zeichen lang sein"),
  department: z.string().min(1, "Fachbereich ist erforderlich"),
  contact: z.string().optional(),
  sponsor: z.string().optional(),
  problem: z.string().min(10, "Problemstellung muss mindestens 10 Zeichen lang sein"),
  target_vision: z.string().min(10, "Zielbild muss mindestens 10 Zeichen lang sein"),
  strategic_relevance: z.string().optional(),
  project_type: z.string().optional(),
  time_criticality: z.string().optional(),
  user_count: z.coerce.number().int().positive().optional().or(z.literal("")),
  vendor: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProjectCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      department: "",
      contact: "",
      sponsor: "",
      problem: "",
      target_vision: "",
      strategic_relevance: "",
      project_type: "",
      time_criticality: "",
      user_count: "",
      vendor: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ProjectInsert) => createProject(data),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Projekt erfolgreich erstellt");
      navigate(`/projekte/${project.id}`);
    },
    onError: (error: Error) => {
      toast.error(`Fehler beim Erstellen: ${error.message}`);
    },
  });

  function onSubmit(values: FormValues) {
    const data: ProjectInsert = {
      created_by: "anonymous",
      name: values.name,
      department: values.department,
      contact: values.contact || null,
      sponsor: values.sponsor || null,
      problem: values.problem,
      target_vision: values.target_vision,
      strategic_relevance: values.strategic_relevance || null,
      project_type: (values.project_type as ProjectType) || null,
      time_criticality: (values.time_criticality as TimeCriticality) || null,
      user_count: typeof values.user_count === "number" ? values.user_count : null,
      vendor: values.vendor || null,
      status: "Idee",
      maturity_level: 1,
      priority_class: null,
      recommendation: null,
      score_business_value: null,
      score_feasibility: null,
      score_risk: null,
      score_roi: null,
      score_strategic_fit: null,
      one_time_costs: null,
      recurring_costs: null,
      estimated_savings: null,
    };
    mutation.mutate(data);
  }

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>
        <h1 className="text-3xl font-bold">Neues Projekt erstellen</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Grunddaten */}
          <Card>
            <CardHeader>
              <CardTitle>Grunddaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Projektname *</FormLabel>
                    <FormControl>
                      <Input placeholder="Name des Projekts" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fachbereich *</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. IT, Marketing, Vertrieb" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ansprechpartner</FormLabel>
                      <FormControl>
                        <Input placeholder="Name des Ansprechpartners" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sponsor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sponsor</FormLabel>
                      <FormControl>
                        <Input placeholder="Name des Sponsors" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Beschreibung */}
          <Card>
            <CardHeader>
              <CardTitle>Beschreibung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="problem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Problemstellung *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Beschreiben Sie das Problem, das gelöst werden soll"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_vision"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zielbild *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Beschreiben Sie das angestrebte Zielbild"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="strategic_relevance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Strategische Relevanz</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Warum ist dieses Projekt strategisch relevant?"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Klassifizierung */}
          <Card>
            <CardHeader>
              <CardTitle>Klassifizierung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="project_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Projekttyp</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Projekttyp wählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projectTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time_criticality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zeitkritikalität</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Zeitkritikalität wählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeCriticalityValues.map((val) => (
                            <SelectItem key={val} value={val}>
                              {val}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="user_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nutzeranzahl</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Geschätzte Anzahl der Nutzer"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vendor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anbieter/Vendor</FormLabel>
                      <FormControl>
                        <Input placeholder="Name des Anbieters" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="flex justify-end">
            <Button type="submit" disabled={mutation.isPending} size="lg">
              {mutation.isPending ? "Wird erstellt..." : "Projekt erstellen"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
