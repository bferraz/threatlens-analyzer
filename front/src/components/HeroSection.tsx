import { ArrowRight, Upload, Cpu, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onAnalyzeClick: () => void;
}

export function HeroSection({ onAnalyzeClick }: HeroSectionProps) {
  const steps = [
    {
      icon: Upload,
      title: "Upload",
      description: "Adicione seu diagrama de arquitetura ou código Mermaid",
    },
    {
      icon: Cpu,
      title: "Extração",
      description: "IA identifica componentes e fluxos de dados",
    },
    {
      icon: ShieldCheck,
      title: "STRIDE + Mitigações",
      description: "Obtenha análise abrangente de ameaças",
    },
  ];

  return (
    <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-b from-secondary/30 to-background py-20 lg:py-28">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-60 w-60 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
            <ShieldCheck className="h-4 w-4" />
            Análise de Segurança com IA
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Gere{" "}
            <span className="gradient-text">modelos de ameaças STRIDE</span> a
            partir de diagramas de arquitetura
          </h1>

          <p className="mb-10 text-lg text-muted-foreground sm:text-xl">
            Envie a arquitetura do seu sistema e obtenha análise abrangente de
            ameaças com mitigações acionáveis em segundos.
          </p>

          <Button
            size="lg"
            onClick={onAnalyzeClick}
            className="group gap-2 text-base"
          >
            Analisar Diagrama
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {/* Steps */}
        <div className="mx-auto mt-20 grid max-w-4xl gap-6 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="group relative rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-accent/30 hover:shadow-md"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="step-indicator">{index + 1}</div>
                <step.icon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-accent" />
              </div>
              <h3 className="mb-2 font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
