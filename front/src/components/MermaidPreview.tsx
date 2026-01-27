import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Loader2 } from "lucide-react";

// Initialize mermaid once
mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: "basis",
  },
});

interface MermaidPreviewProps {
  code: string;
  className?: string;
}

export function MermaidPreview({ code, className = "" }: MermaidPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!code.trim()) {
      setSvg("");
      setError(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const renderDiagram = async () => {
      try {
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(id, code);
        
        if (isMounted) {
          setSvg(renderedSvg);
          setError(null);
        }
      } catch (err) {
        console.error("Mermaid render error:", err);
        if (isMounted) {
          setError("Invalid Mermaid syntax");
          setSvg("");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Small delay to debounce rapid changes
    const timeoutId = setTimeout(renderDiagram, 150);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
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

  return (
    <div
      ref={containerRef}
      className={`overflow-auto rounded-lg border border-border bg-card p-4 ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
