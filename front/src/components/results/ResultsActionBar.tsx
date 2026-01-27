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

export function ResultsActionBar({
  result,
  onNewAnalysis,
}: ResultsActionBarProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      toast({
        title: "Copiado!",
        description: "JSON da análise copiado para área de transferência",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Falha ao copiar",
        description: "Não foi possível copiar para área de transferência",
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
        title: "Baixado!",
        description: "Relatório salvo com sucesso",
      });
    } catch {
      toast({
        title: "Falha no download",
        description: "Não foi possível baixar o relatório",
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
        Nova Análise
      </Button>
      <Button
        variant="outline"
        onClick={handleDownload}
        disabled={downloading}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        {downloading ? "Baixando..." : "Baixar Relatório"}
      </Button>
      <Button variant="outline" onClick={handleCopyJson} className="gap-2">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copiado!" : "Copiar JSON"}
      </Button>
    </div>
  );
}
