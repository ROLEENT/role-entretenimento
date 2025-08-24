import { AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EnvironmentBannerProps {
  className?: string;
}

export function EnvironmentBanner({ className }: EnvironmentBannerProps) {
  return (
    <Alert className={`border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200 ${className}`}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <strong>🔧 Modo Demonstração Ativo:</strong> Todas as operações de edição são simuladas. 
        Mudanças são temporárias e aparecem na interface, mas não persistem no banco de dados.
      </AlertDescription>
    </Alert>
  );
}