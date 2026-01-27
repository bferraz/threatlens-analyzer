import { MermaidPreview } from "./MermaidPreview";

const exampleDiagram = `flowchart TB
  U[User] -->|HTTPS| APIGW[API Gateway]
  APIGW -->|HTTPS| API[Backend API]
  API --> DB[(Database)]
  API --> AUTH[Identity Provider]`;

export function ExampleDiagram() {
  return (
    <section className="border-b border-border/50 bg-muted/20 py-16">
      <div className="container">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Exemplo de Arquitetura
            </h2>
            <p className="text-muted-foreground">
              Veja como o ThreatLens analisa uma arquitetura típica de aplicação
              web
            </p>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Exemplo: Arquitetura Básica de API Web
              </span>
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                Diagrama Mermaid
              </span>
            </div>
            <MermaidPreview code={exampleDiagram} className="min-h-[280px]" />
          </div>
        </div>
      </div>
    </section>
  );
}
