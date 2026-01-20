import { ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Threat, Component, STRIDE_LABELS, STRIDE_COLORS, StrideCategory } from "@/lib/types";

interface ThreatsCardProps {
  threats: Threat[];
  components: Component[];
  showSeverity: boolean;
}

const severityColors: Record<string, string> = {
  low: "severity-low",
  medium: "severity-medium",
  high: "severity-high",
};

export function ThreatsCard({ threats, components, showSeverity }: ThreatsCardProps) {
  const getComponentName = (id: string) => {
    return components.find((c) => c.id === id)?.name || id;
  };

  // Group threats by component
  const threatsByComponent = threats.reduce((acc, threat) => {
    if (!acc[threat.targetId]) {
      acc[threat.targetId] = [];
    }
    acc[threat.targetId].push(threat);
    return acc;
  }, {} as Record<string, Threat[]>);

  return (
    <Card className="border-border/50 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldAlert className="h-5 w-5 text-accent" />
          Threat Model (STRIDE)
          <Badge variant="secondary" className="ml-auto">
            {threats.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="space-y-2">
          {Object.entries(threatsByComponent).map(([componentId, componentThreats]) => (
            <AccordionItem
              key={componentId}
              value={componentId}
              className="rounded-lg border border-border/50 bg-muted/30 px-3"
            >
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{getComponentName(componentId)}</span>
                  <Badge variant="outline" className="text-xs">
                    {componentThreats.length} threats
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <div className="space-y-2">
                  {componentThreats.map((threat, index) => (
                    <div
                      key={index}
                      className="rounded-md border border-border/50 bg-card p-3"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs font-semibold ${STRIDE_COLORS[threat.category as StrideCategory]}`}
                        >
                          {threat.category} - {STRIDE_LABELS[threat.category as StrideCategory]}
                        </Badge>
                        {showSeverity && (
                          <Badge
                            variant="outline"
                            className={`text-xs capitalize ${severityColors[threat.severity]}`}
                          >
                            {threat.severity}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium">{threat.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {threat.description}
                      </p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
