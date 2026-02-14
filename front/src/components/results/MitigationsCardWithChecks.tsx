import { CheckCircle, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mitigation, Component, MitigationCheck } from "@/lib/types";

interface MitigationsCardWithChecksProps {
  mitigations: Mitigation[];
  components: Component[];
  mitigationChecks: MitigationCheck[];
  onMitigationCheckToggle: (mitigation: Mitigation, stepIndex: number) => void;
  savingCheck?: string | null;
}

export function MitigationsCardWithChecks({
  mitigations,
  components,
  mitigationChecks,
  onMitigationCheckToggle,
  savingCheck,
}: MitigationsCardWithChecksProps) {
  const getComponentName = (id: string) => {
    return components.find((c) => c.id === id)?.name || id;
  };

  const getMitigationCheck = (mitigation: Mitigation, stepIndex: number) => {
    const mitigationId = `${mitigation.targetId}-${mitigation.title.toLowerCase().replace(/\s+/g, "-")}-step-${stepIndex}`;
    return mitigationChecks.find(
      (c) => c.mitigationId === mitigationId && c.stepIndex === stepIndex,
    );
  };

  const isStepCompleted = (mitigation: Mitigation, stepIndex: number) => {
    const check = getMitigationCheck(mitigation, stepIndex);
    return check?.isCompleted || false;
  };

  const totalSteps = mitigations.reduce((acc, m) => acc + m.steps.length, 0);
  const completedSteps = mitigationChecks.filter((c) => c.isCompleted).length;

  return (
    <Card className="border-border/50 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CheckCircle className="h-5 w-5 text-accent" />
          Recommended Mitigations
          <Badge variant="secondary" className="ml-auto">
            {completedSteps}/{totalSteps}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mitigations.map((mitigation, mIndex) => {
            return (
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
                    const isCompleted = isStepCompleted(mitigation, sIndex);
                    const stepMitigationId = `${mitigation.targetId}-${mitigation.title.toLowerCase().replace(/\s+/g, "-")}-step-${sIndex}`;
                    const isChecking = savingCheck === stepMitigationId;

                    return (
                      <li
                        key={sIndex}
                        className="flex cursor-pointer items-start gap-2 text-sm"
                        onClick={() =>
                          !isChecking &&
                          onMitigationCheckToggle(mitigation, sIndex)
                        }
                      >
                        {isCompleted ? (
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        ) : (
                          <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        <span
                          className={
                            isCompleted
                              ? "text-muted-foreground line-through"
                              : ""
                          }
                        >
                          {step}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
