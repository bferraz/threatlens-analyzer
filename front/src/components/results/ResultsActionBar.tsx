import { RefreshCw, Copy, Check, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AnalysisResult } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { downloadReport } from "@/lib/api";

interface ResultsActionBarProps {
  result: AnalysisResult;
  onNewAnalysis: () => void;
}

export function ResultsActionBar({
  result,
  onNewAnalysis,
}: ResultsActionBarProps) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDownloadReport = async () => {
    try {
      setIsDownloading(true);
      const blob = await downloadReport(result.reportDownloadUrl);
      
      // Determine file extension from URL or default to .md
      const urlLower = result.reportDownloadUrl.toLowerCase();
      const isPdf = urlLower.includes('.pdf');
      const extension = isPdf ? 'pdf' : 'md';
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `threatlens-report-${new Date().getTime()}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: `${extension.toUpperCase()} report downloaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Could not download report",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="outline" onClick={onNewAnalysis} className="gap-2">
        <RefreshCw className="h-4 w-4" />
        New Analysis
      </Button>
      <Button 
        variant="outline" 
        onClick={handleDownloadReport} 
        className="gap-2"
        disabled={isDownloading}
      >
        <Download className="h-4 w-4" />
        {isDownloading ? "Downloading..." : "Download Report"}
      </Button>
      <Button variant="outline" onClick={handleCopyJson} className="gap-2">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied!" : "Copy JSON"}
      </Button>
    </div>
  );
}
