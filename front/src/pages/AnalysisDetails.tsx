import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { RealAnalysesService } from "@/services/real-analyses.service";
import { SavedAnalysis, Threat, Mitigation } from "@/lib/types";
import { Header } from "@/components/Header";
import { ComponentsCard } from "@/components/results/ComponentsCard";
import { DataFlowsCard } from "@/components/results/DataFlowsCard";
import { ThreatsCardWithChecks } from "@/components/results/ThreatsCardWithChecks";
import { MitigationsCardWithChecks } from "@/components/results/MitigationsCardWithChecks";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Calendar,
  Tag,
  FileImage,
  FileCode,
  ListChecks,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { STRIDE_LABELS } from "@/lib/types";
import { downloadReport } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function AnalysisDetails() {
  const { id } = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<SavedAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingCheck, setSavingCheck] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (id) {
      loadAnalysis(id);
    }
  }, [id]);

  const loadAnalysis = async (analysisId: string) => {
    try {
      setLoading(true);
      const data = await RealAnalysesService.getAnalysisById(analysisId);
      setAnalysis(data);
    } catch (error) {
      console.error("Failed to load analysis:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleThreatCheckToggle = async (threat: Threat) => {
    if (!analysis) return;

    const threatCheckId = `${threat.targetId}-${threat.category}`;
    const existingCheck = analysis.threatChecks.find(
      (c) => c.threatId === threatCheckId,
    );
    const newIsResolved = !existingCheck?.isResolved;

    setSavingCheck(threatCheckId);

    try {
      await RealAnalysesService.updateThreatCheck(analysis.id, threatCheckId, {
        threatId: threatCheckId,
        isResolved: newIsResolved,
        resolvedAt: newIsResolved ? new Date().toISOString() : undefined,
      });

      // Update local state without reload
      setAnalysis((prev) => {
        if (!prev) return prev;

        const existingCheckIndex = prev.threatChecks.findIndex(
          (c) => c.threatId === threatCheckId,
        );

        const updatedChecks = [...prev.threatChecks];

        if (existingCheckIndex >= 0) {
          updatedChecks[existingCheckIndex] = {
            ...updatedChecks[existingCheckIndex],
            isResolved: newIsResolved,
            resolvedAt: newIsResolved ? new Date().toISOString() : undefined,
          };
        } else {
          updatedChecks.push({
            threatId: threatCheckId,
            isResolved: newIsResolved,
            resolvedAt: newIsResolved ? new Date().toISOString() : undefined,
          });
        }

        return {
          ...prev,
          threatChecks: updatedChecks,
          updatedAt: new Date().toISOString(),
        };
      });
    } catch (error) {
      console.error("Failed to update threat check:", error);
    } finally {
      setSavingCheck(null);
    }
  };

  const handleMitigationCheckToggle = async (
    mitigation: Mitigation,
    stepIndex: number,
  ) => {
    if (!analysis) return;

    // Create unique ID for this specific step
    const mitigationId = `${mitigation.targetId}-${mitigation.title.toLowerCase().replace(/\s+/g, "-")}-step-${stepIndex}`;
    const existingCheck = analysis.mitigationChecks.find(
      (c) => c.mitigationId === mitigationId && c.stepIndex === stepIndex,
    );
    const newIsCompleted = !existingCheck?.isCompleted;

    setSavingCheck(mitigationId);

    try {
      await RealAnalysesService.updateMitigationCheck(
        analysis.id,
        mitigationId,
        {
          mitigationId: mitigationId,
          stepIndex: stepIndex,
          isCompleted: newIsCompleted,
          completedAt: newIsCompleted ? new Date().toISOString() : undefined,
        },
      );

      // Update local state without reload
      setAnalysis((prev) => {
        if (!prev) return prev;

        const existingCheckIndex = prev.mitigationChecks.findIndex(
          (c) => c.mitigationId === mitigationId && c.stepIndex === stepIndex,
        );

        const updatedChecks = [...prev.mitigationChecks];

        if (existingCheckIndex >= 0) {
          updatedChecks[existingCheckIndex] = {
            ...updatedChecks[existingCheckIndex],
            isCompleted: newIsCompleted,
            completedAt: newIsCompleted ? new Date().toISOString() : undefined,
          };
        } else {
          updatedChecks.push({
            mitigationId: mitigationId,
            stepIndex: stepIndex,
            isCompleted: newIsCompleted,
            completedAt: newIsCompleted ? new Date().toISOString() : undefined,
          });
        }

        return {
          ...prev,
          mitigationChecks: updatedChecks,
          updatedAt: new Date().toISOString(),
        };
      });
    } catch (error) {
      console.error("Failed to update mitigation check:", error);
    } finally {
      setSavingCheck(null);
    }
  };

  const getThreatCheck = (threat: Threat) => {
    const threatCheckId = `${threat.targetId}-${threat.category}`;
    return analysis?.threatChecks.find((c) => c.threatId === threatCheckId);
  };

  const getMitigationCheck = (mitigation: Mitigation) => {
    const mitigationId = `${mitigation.targetId}-${mitigation.title.toLowerCase().replace(/\s+/g, "-")}`;
    return analysis?.mitigationChecks.find(
      (c) => c.mitigationId === mitigationId,
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy 'at' HH:mm", {
      locale: enUS,
    });
  };

  const handleDownloadReport = async () => {
    if (!analysis) return;

    try {
      setIsDownloading(true);
      const blob = await downloadReport(analysis.analysisResult.reportDownloadUrl);
      
      // Determine file extension from URL or default to .md
      const urlLower = analysis.analysisResult.reportDownloadUrl.toLowerCase();
      const isPdf = urlLower.includes('.pdf');
      const extension = isPdf ? 'pdf' : 'md';
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${analysis.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: `${extension.toUpperCase()} report downloaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Could not download report",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <Skeleton className="h-12 w-64 mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!analysis) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Analysis not found
                </h3>
                <Button asChild className="mt-4">
                  <Link to="/history">Back to History</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  const resolvedThreatsCount = analysis.threatChecks.filter(
    (c) => c.isResolved,
  ).length;
  const completedMitigationsCount = analysis.mitigationChecks.filter(
    (c) => c.isCompleted,
  ).length;

  // Calculate total steps across all mitigations
  const totalMitigationSteps = analysis.analysisResult.mitigations.reduce(
    (acc, m) => acc + m.steps.length,
    0,
  );

  const threatProgress =
    analysis.analysisResult.threats.length > 0
      ? Math.round(
          (resolvedThreatsCount / analysis.analysisResult.threats.length) * 100,
        )
      : 0;
  const mitigationProgress =
    totalMitigationSteps > 0
      ? Math.round((completedMitigationsCount / totalMitigationSteps) * 100)
      : 0;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link to="/history">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to History
              </Link>
            </Button>

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {analysis.diagramType === "image" ? (
                    <FileImage className="h-8 w-8 text-primary" />
                  ) : (
                    <FileCode className="h-8 w-8 text-primary" />
                  )}
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                    {analysis.name}
                  </h1>
                </div>
                {analysis.description && (
                  <p className="text-muted-foreground text-lg">
                    {analysis.description}
                  </p>
                )}

                {/* Tags */}
                {analysis.tags && analysis.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {analysis.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Created: {formatDate(analysis.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Updated: {formatDate(analysis.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button 
                onClick={handleDownloadReport}
                disabled={isDownloading}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                {isDownloading ? "Downloading..." : "Download Report"}
              </Button>
            </div>
          </div>

          {/* Progress Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Threat Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>
                      {resolvedThreatsCount} of{" "}
                      {analysis.analysisResult.threats.length} resolved
                    </span>
                    <span className="font-medium">{threatProgress}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                      style={{ width: `${threatProgress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListChecks className="h-5 w-5 text-blue-500" />
                  Mitigation Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>
                      {completedMitigationsCount} of {totalMitigationSteps}{" "}
                      completed
                    </span>
                    <span className="font-medium">{mitigationProgress}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                      style={{ width: `${mitigationProgress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Results - Components and DataFlows */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ComponentsCard components={analysis.analysisResult.components} />
            <DataFlowsCard
              dataFlows={analysis.analysisResult.data_flows}
              components={analysis.analysisResult.components}
            />
          </div>

          {/* Threats and Mitigations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ThreatsCardWithChecks
              threats={analysis.analysisResult.threats}
              components={analysis.analysisResult.components}
              showSeverity={true}
              threatChecks={analysis.threatChecks}
              onThreatCheckToggle={handleThreatCheckToggle}
              savingCheck={savingCheck}
            />
            <MitigationsCardWithChecks
              mitigations={analysis.analysisResult.mitigations}
              components={analysis.analysisResult.components}
              mitigationChecks={analysis.mitigationChecks}
              onMitigationCheckToggle={handleMitigationCheckToggle}
              savingCheck={savingCheck}
            />
          </div>
        </div>
      </div>
    </>
  );
}
