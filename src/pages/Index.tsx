import { useRef, useState } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { ExampleDiagram } from "@/components/ExampleDiagram";
import { DiagramInput } from "@/components/DiagramInput";
import { SettingsPanel, AnalysisSettings } from "@/components/SettingsPanel";
import { AnalyzeButton } from "@/components/AnalyzeButton";
import { ResultsSection } from "@/components/ResultsSection";
import { AnalysisResult } from "@/lib/types";
import { analyzeArchitecture } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const Index = () => {
  const analyzerRef = useRef<HTMLDivElement>(null);

  // Input state
  const [inputType, setInputType] = useState<"image" | "mermaid">("mermaid");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [mermaidText, setMermaidText] = useState("");

  // Settings state
  const [settings, setSettings] = useState<AnalysisSettings>({
    analysisDepth: "full",
    reportFormat: "markdown",
    includeSeverity: true,
    includeAssumptions: true,
  });

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const scrollToAnalyzer = () => {
    analyzerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isInputValid =
    inputType === "image" ? !!imageFile : mermaidText.trim().length > 0;

  const handleAnalyze = async () => {
    if (!isInputValid) return;

    setIsAnalyzing(true);
    setStatusMessage("Preparing analysis...");
    setResult(null);

    try {
      setStatusMessage("Analyzing diagram structure...");
      await new Promise((r) => setTimeout(r, 500));

      setStatusMessage("Identifying components and data flows...");
      await new Promise((r) => setTimeout(r, 500));

      setStatusMessage("Generating STRIDE threat model...");

      const analysisResult = await analyzeArchitecture(
        inputType === "mermaid"
          ? {
              inputType: "mermaid",
              mermaidText,
              ...settings,
            }
          : {
              inputType: "image",
              imageFile: imageFile!,
              ...settings,
            },
      );

      setResult(analysisResult);
      setStatusMessage(null);

      toast({
        title: "Analysis Complete",
        description: `Found ${analysisResult.threats.length} threats across ${analysisResult.components.length} components`,
      });

      // Scroll to results
      setTimeout(() => {
        document
          .getElementById("results")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      setStatusMessage(null);
      toast({
        title: "Analysis Failed",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewAnalysis = () => {
    setResult(null);
    setImageFile(null);
    setMermaidText("");
    scrollToAnalyzer();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onAnalyzeClick={scrollToAnalyzer} />

      <main>
        <HeroSection onAnalyzeClick={scrollToAnalyzer} />
        <ExampleDiagram />

        {/* Analyzer Section */}
        <section
          ref={analyzerRef}
          id="analyzer"
          className="border-b border-border/50 py-16"
        >
          <div className="container">
            <div className="mb-10 text-center">
              <h2 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Analyze Your Architecture
              </h2>
              <p className="text-muted-foreground">
                Upload a diagram image or paste Mermaid code to get started
              </p>
            </div>

            <div className="mx-auto max-w-5xl">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <DiagramInput
                    inputType={inputType}
                    onInputTypeChange={setInputType}
                    imageFile={imageFile}
                    onImageChange={setImageFile}
                    mermaidText={mermaidText}
                    onMermaidChange={setMermaidText}
                  />
                </div>
                <div className="space-y-4">
                  <SettingsPanel
                    settings={settings}
                    onSettingsChange={setSettings}
                  />
                  <AnalyzeButton
                    isLoading={isAnalyzing}
                    isDisabled={!isInputValid}
                    onClick={handleAnalyze}
                  />

                  {/* Status Message */}
                  {statusMessage && (
                    <Card className="border-accent/30 bg-accent/5">
                      <CardContent className="flex items-center gap-3 p-4">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                        <p className="text-sm text-accent">{statusMessage}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Validation hint */}
                  {!isInputValid && !isAnalyzing && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      {inputType === "image"
                        ? "Upload a diagram image to continue"
                        : "Enter Mermaid code to continue"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Results Section */}
        {result && (
          <div id="results">
            <ResultsSection
              result={result}
              showSeverity={settings.includeSeverity}
              showAssumptions={settings.includeAssumptions}
              onNewAnalysis={handleNewAnalysis}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>ThreatLens — AI-Powered STRIDE Threat Modeling</p>
          <p className="mt-1 text-xs">Development Mode: Using mock data</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
