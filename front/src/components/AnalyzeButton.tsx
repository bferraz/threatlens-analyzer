import { Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalyzeButtonProps {
  isLoading: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

export function AnalyzeButton({
  isLoading,
  isDisabled,
  onClick,
}: AnalyzeButtonProps) {
  return (
    <Button
      size="lg"
      className="w-full gap-2 text-base"
      disabled={isDisabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <Zap className="h-5 w-5" />
          Analyze Architecture
        </>
      )}
    </Button>
  );
}
