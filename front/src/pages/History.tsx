import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RealAnalysesService } from "@/services/real-analyses.service";
import { AnalysisSummary } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileImage,
  FileCode,
  Search,
  Shield,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Tag,
} from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";

export default function History() {
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      setLoading(true);
      const data = await RealAnalysesService.getAllAnalyses();
      setAnalyses(data);
    } catch (error) {
      console.error("Failed to load analyses:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnalyses = analyses.filter((analysis) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      analysis.name.toLowerCase().includes(searchLower) ||
      analysis.description?.toLowerCase().includes(searchLower) ||
      analysis.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  });

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy", { locale: enUS });
  };

  const getProgressPercentage = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                Analysis History
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Manage and track your security analyses
            </p>
          </div>

          {/* Search and Stats */}
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, description or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Analyses
                      </p>
                      <p className="text-3xl font-bold">{analyses.length}</p>
                    </div>
                    <Shield className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Threats
                      </p>
                      <p className="text-3xl font-bold">
                        {analyses.reduce(
                          (sum, a) => sum + a.stats.totalThreats,
                          0,
                        )}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Resolved Threats
                      </p>
                      <p className="text-3xl font-bold">
                        {analyses.reduce(
                          (sum, a) => sum + a.stats.resolvedThreats,
                          0,
                        )}
                      </p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Critical Open
                      </p>
                      <p className="text-3xl font-bold">
                        {analyses.reduce(
                          (sum, a) => sum + a.stats.criticalThreats,
                          0,
                        )}
                      </p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Analyses List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredAnalyses.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery
                    ? "No analyses found"
                    : "No saved analyses"}
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchQuery
                    ? "Try adjusting your search"
                    : "Start by creating your first security analysis"}
                </p>
                {!searchQuery && (
                  <Button asChild>
                    <Link to="/">New Analysis</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAnalyses.map((analysis) => {
                const threatProgress = getProgressPercentage(
                  analysis.stats.resolvedThreats,
                  analysis.stats.totalThreats,
                );
                const mitigationProgress = getProgressPercentage(
                  analysis.stats.completedMitigations,
                  analysis.stats.totalMitigations,
                );

                return (
                  <Card
                    key={analysis.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {analysis.diagramType === "image" ? (
                              <FileImage className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <FileCode className="h-5 w-5 text-muted-foreground" />
                            )}
                            <CardTitle className="text-xl">
                              {analysis.name}
                            </CardTitle>
                          </div>
                          {analysis.description && (
                            <CardDescription className="text-base">
                              {analysis.description}
                            </CardDescription>
                          )}
                        </div>
                        <Button asChild variant="default">
                          <Link to={`/history/${analysis.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>

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
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Threats
                            </p>
                            <p className="font-semibold">
                              {analysis.stats.totalThreats}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Resolved
                            </p>
                            <p className="font-semibold">
                              {analysis.stats.resolvedThreats}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Critical
                            </p>
                            <p className="font-semibold">
                              {analysis.stats.criticalThreats}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Mitigations
                            </p>
                            <p className="font-semibold">
                              {analysis.stats.completedMitigations}/
                              {analysis.stats.totalMitigations}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bars */}
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">
                              Threat Progress
                            </span>
                            <span className="font-medium">
                              {threatProgress}%
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                              style={{ width: `${threatProgress}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">
                              Mitigation Progress
                            </span>
                            <span className="font-medium">
                              {mitigationProgress}%
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                              style={{ width: `${mitigationProgress}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Created: {formatDate(analysis.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              Updated: {formatDate(analysis.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
