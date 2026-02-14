import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mitigation, Component } from "@/lib/types";

interface MitigationsCardProps {
  mitigations: Mitigation[];
  components: Component[];
}

export function MitigationsCard({
  mitigations,
  components,
}: MitigationsCardProps) {
  const getComponentName = (id: string) => {
    return components.find((c) => c.id === id)?.name || id;
  };

  const totalSteps = mitigations.reduce((acc, m) => acc + m.steps.length, 0);

  return (
    <Card className="border-border/50 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CheckCircle className="h-5 w-5 text-accent" />
          Recommended Mitigations
          <Badge variant="secondary" className="ml-auto">
            {totalSteps} steps
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mitigations.map((mitigation, mIndex) => (
            <div
              key={mIndex}
              className="rounded-lg border border-border/50 bg-muted/30 p-4"
            >
              <div className="mb-3 flex items-center gap-2">
                <p className="font-medium">{mitigation.title}</p>
                <Badge variant="outline" className="text-xs">
                  {getComponentName(mitigation.targetId)}
                </Badge>
              </div>
              <ul className="space-y-2 list-disc list-inside">
                {mitigation.steps.map((step, sIndex) => (
                  <li key={sIndex} className="text-sm text-muted-foreground">
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
