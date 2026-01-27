import { ArrowRight, ArrowLeftRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataFlow, Component } from "@/lib/types";

interface DataFlowsCardProps {
  dataFlows: DataFlow[];
  components: Component[];
}

export function DataFlowsCard({ dataFlows, components }: DataFlowsCardProps) {
  const getComponentName = (id: string) => {
    return components.find((c) => c.id === id)?.name || id;
  };

  return (
    <Card className="border-border/50 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ArrowRight className="h-5 w-5 text-accent" />
          Fluxos de Dados Detectados
          <Badge variant="secondary" className="ml-auto">
            {dataFlows.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {dataFlows.map((flow, index) => (
            <div
              key={index}
              className="rounded-lg border border-border/50 bg-muted/30 p-3 transition-colors hover:bg-muted/50"
            >
              <div className="mb-2 flex items-start gap-2 text-sm font-medium">
                <span className="break-words">
                  {getComponentName(flow.from)}
                </span>
                {flow.direction === "bidirectional" ? (
                  <ArrowLeftRight className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                ) : (
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                )}
                <span className="break-words">{getComponentName(flow.to)}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-xs">
                  {flow.protocol}
                </Badge>
                {flow.data_types.map((type) => (
                  <Badge key={type} variant="secondary" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
