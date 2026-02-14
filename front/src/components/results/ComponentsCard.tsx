import { Server, Database, Shield, Globe, Box, Cpu } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Component } from "@/lib/types";

interface ComponentsCardProps {
  components: Component[];
}

const typeIcons: Record<string, typeof Server> = {
  external: Globe,
  gateway: Shield,
  service: Server,
  database: Database,
  queue: Box,
  cache: Cpu,
};

const trustZoneColors: Record<string, string> = {
  external:
    "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  internet:
    "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  public:
    "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  dmz: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  internal:
    "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  private: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
};

export function ComponentsCard({ components }: ComponentsCardProps) {
  return (
    <Card className="border-border/50 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Box className="h-5 w-5 text-accent" />
          Identified Components
          <Badge variant="secondary" className="ml-auto">
            {components.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {components.map((component) => {
            const Icon = typeIcons[component.type] || Server;
            return (
              <div
                key={component.id}
                className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <Icon className="h-4 w-4 text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium break-words">{component.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {component.type}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`shrink-0 text-xs capitalize whitespace-nowrap ${trustZoneColors[component.trust_zone]}`}
                >
                  {component.trust_zone}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
