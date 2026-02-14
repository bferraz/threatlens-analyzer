import { AlertTriangle, HelpCircle, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AnalysisResult,
  STRIDE_LABELS,
  STRIDE_COLORS,
  StrideCategory,
} from "@/lib/types";

interface SummaryPanelProps {
  result: AnalysisResult;
  showAssumptions: boolean;
}

export function SummaryPanel({ result, showAssumptions }: SummaryPanelProps) {
  // Count threats by category
  const strideCounts = result.threats.reduce(
    (acc, threat) => {
      acc[threat.category] = (acc[threat.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Count threats by severity
  const severityCounts = result.threats.reduce(
    (acc, threat) => {
      acc[threat.severity] = (acc[threat.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Top 5 high-severity threats
  const topRisks = result.threats
    .filter(
      (t) =>
        t.severity === "critical" ||
        t.severity === "high" ||
        t.severity === "medium",
    )
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Severity Summary */}
      <Card className="border-border/50 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-accent" />
            Risk Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-4 gap-2 text-center">
            <div className="rounded-lg bg-purple-900/20 p-3">
              <p className="text-2xl font-bold text-purple-300">
                {severityCounts.critical || 0}
              </p>
              <p className="text-xs text-muted-foreground">Critical</p>
            </div>
            <div className="rounded-lg bg-destructive/10 p-3">
              <p className="text-2xl font-bold text-destructive">
                {severityCounts.high || 0}
              </p>
              <p className="text-xs text-muted-foreground">High</p>
            </div>
            <div className="rounded-lg bg-warning/10 p-3">
              <p className="text-2xl font-bold text-warning">
                {severityCounts.medium || 0}
              </p>
              <p className="text-xs text-muted-foreground">Medium</p>
            </div>
            <div className="rounded-lg bg-success/10 p-3">
              <p className="text-2xl font-bold text-success">
                {severityCounts.low || 0}
              </p>
              <p className="text-xs text-muted-foreground">Low</p>
            </div>
          </div>

          {/* STRIDE Categories */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              By Category
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(["S", "T", "R", "I", "D", "E"] as StrideCategory[]).map(
                (cat) => (
                  <div
                    key={cat}
                    className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
                  >
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium ${STRIDE_COLORS[cat]}`}
                    >
                      {cat}
                    </Badge>
                    <span className="text-sm font-medium">
                      {strideCounts[cat] || 0}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Risks */}
      <Card className="border-border/50 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-accent" />
            Top Risks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {topRisks.map((risk, index) => (
              <li
                key={index}
                className="flex items-start gap-2 rounded-md bg-muted/50 p-2 text-sm"
              >
                <Badge
                  variant="outline"
                  className={`shrink-0 text-xs capitalize ${
                    risk.severity === "critical"
                      ? "severity-critical"
                      : risk.severity === "high"
                        ? "severity-high"
                        : "severity-medium"
                  }`}
                >
                  {risk.severity}
                </Badge>
                <span className="line-clamp-2">{risk.title}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Assumptions & Uncertainties */}
      {showAssumptions &&
        (result.assumptions.length > 0 || result.uncertainties.length > 0) && (
          <Card className="border-border/50 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <HelpCircle className="h-5 w-5 text-accent" />
                Observations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.assumptions.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">
                    Assumptions
                  </p>
                  <ul className="space-y-1.5">
                    {result.assumptions.map((item, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.uncertainties.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">
                    Uncertainties
                  </p>
                  <ul className="space-y-1.5">
                    {result.uncertainties.map((item, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
    </div>
  );
}
