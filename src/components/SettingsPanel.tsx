import { Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export interface AnalysisSettings {
  analysisDepth: "quick" | "full";
  reportFormat: "markdown" | "pdf";
  includeSeverity: boolean;
  includeAssumptions: boolean;
}

interface SettingsPanelProps {
  settings: AnalysisSettings;
  onSettingsChange: (settings: AnalysisSettings) => void;
}

export function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
  return (
    <Card className="border-border/50 shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="h-5 w-5 text-accent" />
          Analysis Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="depth">Analysis Depth</Label>
          <Select
            value={settings.analysisDepth}
            onValueChange={(v) =>
              onSettingsChange({ ...settings, analysisDepth: v as "quick" | "full" })
            }
          >
            <SelectTrigger id="depth">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quick">Quick (Faster)</SelectItem>
              <SelectItem value="full">Full (Comprehensive)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="format">Report Format</Label>
          <Select
            value={settings.reportFormat}
            onValueChange={(v) =>
              onSettingsChange({ ...settings, reportFormat: v as "markdown" | "pdf" })
            }
          >
            <SelectTrigger id="format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="markdown">Markdown</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="severity">Include Severity</Label>
            <p className="text-xs text-muted-foreground">Show Low/Med/High ratings</p>
          </div>
          <Switch
            id="severity"
            checked={settings.includeSeverity}
            onCheckedChange={(v) => onSettingsChange({ ...settings, includeSeverity: v })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="assumptions">Include Assumptions</Label>
            <p className="text-xs text-muted-foreground">Show uncertainties & assumptions</p>
          </div>
          <Switch
            id="assumptions"
            checked={settings.includeAssumptions}
            onCheckedChange={(v) => onSettingsChange({ ...settings, includeAssumptions: v })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
