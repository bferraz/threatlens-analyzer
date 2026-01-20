import { Shield } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onAnalyzeClick: () => void;
}

export function Header({ onAnalyzeClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
            <Shield className="h-5 w-5 text-accent-foreground" />
          </div>
          <span className="text-xl font-semibold tracking-tight">ThreatLens</span>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button onClick={onAnalyzeClick} className="hidden sm:flex">
            Analyze Diagram
          </Button>
        </div>
      </div>
    </header>
  );
}
