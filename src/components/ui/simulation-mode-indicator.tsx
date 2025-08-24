import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lightbulb } from "lucide-react";

interface SimulationModeIndicatorProps {
  className?: string;
}

export function SimulationModeIndicator({ className }: SimulationModeIndicatorProps) {
  return (
    <Alert className={`border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200 ${className}`}>
      <Lightbulb className="h-4 w-4" />
      <AlertDescription>
        <strong>Modo Simulação Ativo:</strong> As operações serão simuladas com feedback visual, 
        mas não serão persistidas no banco de dados devido às limitações do ambiente atual.
      </AlertDescription>
    </Alert>
  );
}