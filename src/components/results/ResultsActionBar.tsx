import { RefreshCw, Download, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AnalysisResult } from "@/lib/types";
import { downloadReport } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface ResultsActionBarProps {
  result: AnalysisResult;
  onNewAnalysis: () => void;
}

export function ResultsActionBar({ result, onNewAnalysis }: ResultsActionBarProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Analysis JSON copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await downloadReport(result.reportDownloadUrl);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "threat-analysis-report.md";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "Downloaded!",
        description: "Report saved successfully",
      });
    } catch {
      toast({
        title: "Download failed",
        description: "Could not download report",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="outline" onClick={onNewAnalysis} className="gap-2">
        <RefreshCw className="h-4 w-4" />
        New Analysis
      </Button>
      <Button variant="outline" onClick={handleDownload} disabled={downloading} className="gap-2">
        <Download className="h-4 w-4" />
        {downloading ? "Downloading..." : "Download Report"}
      </Button>
      <Button variant="outline" onClick={handleCopyJson} className="gap-2">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied!" : "Copy JSON"}
      </Button>
    </div>
  );
}
