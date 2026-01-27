import { CheckCircle, Circle } from "lucide-react";
import { useState } from "react";
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
  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(new Set());

  const getComponentName = (id: string) => {
    return components.find((c) => c.id === id)?.name || id;
  };

  const toggleStep = (key: string) => {
    const newChecked = new Set(checkedSteps);
    if (newChecked.has(key)) {
      newChecked.delete(key);
    } else {
      newChecked.add(key);
    }
    setCheckedSteps(newChecked);
  };

  const totalSteps = mitigations.reduce((acc, m) => acc + m.steps.length, 0);
  const completedSteps = checkedSteps.size;

  return (
    <Card className="border-border/50 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CheckCircle className="h-5 w-5 text-accent" />
          Mitigações Recomendadas
          <Badge variant="secondary" className="ml-auto">
            {completedSteps}/{totalSteps}
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
              <ul className="space-y-2">
                {mitigation.steps.map((step, sIndex) => {
                  const key = `${mIndex}-${sIndex}`;
                  const isChecked = checkedSteps.has(key);
                  return (
                    <li
                      key={sIndex}
                      className="flex cursor-pointer items-start gap-2 text-sm"
                      onClick={() => toggleStep(key)}
                    >
                      {isChecked ? (
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      ) : (
                        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <span
                        className={
                          isChecked ? "text-muted-foreground line-through" : ""
                        }
                      >
                        {step}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
