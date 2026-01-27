import { Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AnalysisSettings } from "@/types/settings.types";

export type { AnalysisSettings } from "@/types/settings.types";

interface SettingsPanelProps {
  settings: AnalysisSettings;
  onSettingsChange: (settings: AnalysisSettings) => void;
}

export function SettingsPanel({
  settings,
  onSettingsChange,
}: SettingsPanelProps) {
  return (
    <Card className="border-border/50 shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="h-5 w-5 text-accent" />
          Configurações de Análise
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="depth">Profundidade da Análise</Label>
          <Select
            value={settings.analysisDepth}
            onValueChange={(v) =>
              onSettingsChange({
                ...settings,
                analysisDepth: v as "quick" | "full",
              })
            }
          >
            <SelectTrigger id="depth">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quick">Rápida (Mais veloz)</SelectItem>
              <SelectItem value="full">Completa (Abrangente)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="format">Formato do Relatório</Label>
          <Select
            value={settings.reportFormat}
            onValueChange={(v) =>
              onSettingsChange({
                ...settings,
                reportFormat: v as ReportFormat,
              })
            }
          >
            <SelectTrigger id="format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="markdown">Markdown</SelectItem>
              {/* PDF disabled - requires GTK+ dependencies on Windows */}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="severity">Incluir Severidade</Label>
            <p className="text-xs text-muted-foreground">
              Exibir classificações Baixa/Média/Alta
            </p>
          </div>
          <Switch
            id="severity"
            checked={settings.includeSeverity}
            onCheckedChange={(v) =>
              onSettingsChange({ ...settings, includeSeverity: v })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="assumptions">Incluir Suposições</Label>
            <p className="text-xs text-muted-foreground">
              Exibir incertezas e suposições
            </p>
          </div>
          <Switch
            id="assumptions"
            checked={settings.includeAssumptions}
            onCheckedChange={(v) =>
              onSettingsChange({ ...settings, includeAssumptions: v })
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
