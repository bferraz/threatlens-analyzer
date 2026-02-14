import { AnalysisResult } from "@/lib/types";
import {
  ComponentsCard,
  DataFlowsCard,
  ThreatsCard,
  MitigationsCard,
  SummaryPanel,
  ResultsActionBar,
} from "./results";

interface ResultsSectionProps {
  result: AnalysisResult;
  showSeverity: boolean;
  showAssumptions: boolean;
  onNewAnalysis: () => void;
}

export function ResultsSection({
  result,
  showSeverity,
  showAssumptions,
  onNewAnalysis,
}: ResultsSectionProps) {
  return (
    <section className="py-12">
      <div className="container">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Analysis Results
            </h2>
            <p className="text-muted-foreground">
              {result.components.length} components, {result.data_flows.length}{" "}
              flows, {result.threats.length} threats identified
            </p>
          </div>
          <ResultsActionBar result={result} onNewAnalysis={onNewAnalysis} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content - 2 columns */}
          <div className="space-y-6 lg:col-span-2">
            <div className="grid gap-6 md:grid-cols-2">
              <ComponentsCard components={result.components} />
              <DataFlowsCard
                dataFlows={result.data_flows}
                components={result.components}
              />
            </div>
            <ThreatsCard
              threats={result.threats}
              components={result.components}
              showSeverity={showSeverity}
            />
            <MitigationsCard
              mitigations={result.mitigations}
              components={result.components}
            />
          </div>

          {/* Summary sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <SummaryPanel result={result} showAssumptions={showAssumptions} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
