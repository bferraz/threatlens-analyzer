import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface MermaidPreviewProps {
  code: string;
  className?: string;
}

export function MermaidPreview({ code, className = "" }: MermaidPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!code.trim()) {
      setSvg("");
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const renderDiagram = async () => {
      try {
        // Dynamic import mermaid
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: document.documentElement.classList.contains("dark") ? "dark" : "default",
          securityLevel: "loose",
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: "basis",
          },
        });

        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(id, code);
        setSvg(renderedSvg);
        setError(null);
      } catch (err) {
        setError("Invalid Mermaid syntax");
        setSvg("");
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(renderDiagram, 100);
    return () => clearTimeout(timeoutId);
  }, [code]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center rounded-lg border border-border bg-muted/30 p-8 ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-sm text-destructive ${className}`}>
        {error}
      </div>
    );
  }

  if (!svg && !code.trim()) {
    return (
      <div className={`flex items-center justify-center rounded-lg border border-border bg-muted/30 p-8 text-sm text-muted-foreground ${className}`}>
        Enter Mermaid code to see preview
      </div>
    );
  }

  if (!svg) {
    return (
      <div className={`flex items-center justify-center rounded-lg border border-border bg-muted/30 p-8 ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-auto rounded-lg border border-border bg-card p-4 ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
