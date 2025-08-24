import { AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EnvironmentBannerProps {
  className?: string;
}

export function EnvironmentBanner({ className }: EnvironmentBannerProps) {
  return (
    <Alert className={`border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200 ${className}`}>
      <Info className="h-4 w-4" />
      <AlertDescription>
        <strong>Ambiente de Demonstração:</strong> Este ambiente está em modo somente leitura. 
        Você pode navegar e testar todas as funcionalidades, mas as alterações não serão salvas permanentemente.
      </AlertDescription>
    </Alert>
  );
}