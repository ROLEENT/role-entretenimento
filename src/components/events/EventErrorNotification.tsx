import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';

interface EventErrorNotificationProps {
  error: Error;
  onRetry?: () => void;
  onDismiss?: () => void;
  showTechnicalDetails?: boolean;
}

export const EventErrorNotification: React.FC<EventErrorNotificationProps> = ({
  error,
  onRetry,
  onDismiss,
  showTechnicalDetails = false
}) => {
  const getErrorMessage = (error: Error) => {
    const message = error.message.toLowerCase();
    
    if (message.includes('module') || message.includes('mime type')) {
      return {
        title: 'Erro de Carregamento',
        description: 'Problema ao carregar recursos do sistema. Isto pode ser um erro temporário.',
        suggestion: 'Tente recarregar a página ou entre em contato com o suporte.'
      };
    }
    
    if (message.includes('network') || message.includes('fetch')) {
      return {
        title: 'Erro de Conexão',
        description: 'Problema de conectividade com o servidor.',
        suggestion: 'Verifique sua conexão com a internet e tente novamente.'
      };
    }
    
    if (message.includes('authentication') || message.includes('unauthorized')) {
      return {
        title: 'Erro de Autenticação',
        description: 'Sua sessão pode ter expirado.',
        suggestion: 'Faça login novamente para continuar.'
      };
    }
    
    if (message.includes('validation') || message.includes('required')) {
      return {
        title: 'Dados Inválidos',
        description: 'Alguns campos obrigatórios não foram preenchidos corretamente.',
        suggestion: 'Verifique os campos marcados em vermelho e corrija os erros.'
      };
    }
    
    return {
      title: 'Erro Inesperado',
      description: 'Ocorreu um erro que não foi possível identificar.',
      suggestion: 'Tente novamente ou entre em contato com o suporte.'
    };
  };

  const errorInfo = getErrorMessage(error);

  return (
    <Alert variant="destructive" className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        {errorInfo.title}
        {onDismiss && (
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            ×
          </Button>
        )}
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p>{errorInfo.description}</p>
        <p className="text-sm">{errorInfo.suggestion}</p>
        
        {showTechnicalDetails && (
          <details className="mt-2">
            <summary className="cursor-pointer text-sm font-medium">
              Detalhes técnicos
            </summary>
            <pre className="mt-2 bg-destructive/5 p-2 rounded text-xs overflow-auto max-h-32">
              {error.stack || error.message}
            </pre>
          </details>
        )}
        
        <div className="flex gap-2 pt-2">
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          )}
          
          <Button variant="outline" size="sm" asChild>
            <a 
              href="https://docs.lovable.dev/tips-tricks/troubleshooting" 
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Ajuda
            </a>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default EventErrorNotification;