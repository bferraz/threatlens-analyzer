import { Shield, History as HistoryIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onAnalyzeClick?: () => void;
}

export function Header({ onAnalyzeClick }: HeaderProps) {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
            <Shield className="h-5 w-5 text-accent-foreground" />
          </div>
          <span className="text-xl font-semibold tracking-tight">
            ThreatLens
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link to="/history">
              <HistoryIcon className="h-4 w-4 mr-2" />
              Histórico
            </Link>
          </Button>
          <ThemeToggle />
          {isHomePage && onAnalyzeClick ? (
            <Button onClick={onAnalyzeClick} className="hidden sm:flex">
              Analisar Diagrama
            </Button>
          ) : (
            <Button asChild className="hidden sm:flex">
              <Link to="/">Analisar Diagrama</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
