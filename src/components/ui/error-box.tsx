import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorBoxProps {
  title?: string;
  message: string;
  details?: string;
  onRetry?: () => void;
  onBack?: () => void;
  showBack?: boolean;
  type?: 'error' | 'warning' | 'info';
}

export function ErrorBox({ 
  title,
  message, 
  details, 
  onRetry, 
  onBack,
  showBack = true,
  type = 'error'
}: ErrorBoxProps) {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />;
      case 'info':
        return <AlertCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />;
      default:
        return <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'warning':
        return 'border-amber-500/20';
      case 'info':
        return 'border-blue-500/20';
      default:
        return 'border-destructive/20';
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card className={`${getBorderColor()}`}>
        <CardContent className="p-8 text-center">
          {getIcon()}
          <h3 className="text-lg font-semibold mb-2">
            {title || 'Oops! Algo deu errado'}
          </h3>
          <p className="text-muted-foreground mb-4">{message}</p>
          
          {details && (
            <details className="mb-4">
              <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                Ver detalhes técnicos
              </summary>
              <pre className="mt-2 text-xs text-left bg-muted p-3 rounded-md overflow-auto">
                {details}
              </pre>
            </details>
          )}
          
          <div className="flex justify-center gap-3">
            {showBack && onBack && (
              <Button onClick={onBack} variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            )}
            {onRetry && (
              <Button onClick={onRetry} variant="default" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Tentar novamente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}