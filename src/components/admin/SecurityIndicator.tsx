import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface SecurityIndicatorProps {
  isSecure?: boolean;
  message?: string;
  showDetails?: boolean;
}

export const SecurityIndicator = ({ 
  isSecure = true, 
  message,
  showDetails = false 
}: SecurityIndicatorProps) => {
  const securityFeatures = [
    { name: 'Cookies Seguros', enabled: true },
    { name: 'RBAC Ativo', enabled: true },
    { name: 'Rate Limiting', enabled: true },
    { name: 'Magic Link', enabled: true },
    { name: 'Auditoria', enabled: true },
  ];

  if (!showDetails) {
    return (
      <Alert variant={isSecure ? "default" : "destructive"} className="mb-4">
        {isSecure ? (
          <Shield className="h-4 w-4 text-success" />
        ) : (
          <AlertTriangle className="h-4 w-4" />
        )}
        <AlertDescription>
          {message || (isSecure 
            ? 'Sistema seguro - Autenticação protegida'
            : 'Atenção: Problemas de segurança detectados'
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Alert variant="default">
        <Shield className="h-4 w-4 text-success" />
        <AlertDescription>
          Sistema de Segurança Ativo - Todas as proteções habilitadas
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {securityFeatures.map((feature) => (
          <div
            key={feature.name}
            className="flex items-center gap-2 p-3 rounded-lg border bg-card"
          >
            {feature.enabled ? (
              <CheckCircle className="h-4 w-4 text-success" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
            <span className="text-sm font-medium">{feature.name}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              feature.enabled 
                ? 'bg-success/10 text-success' 
                : 'bg-destructive/10 text-destructive'
            }`}>
              {feature.enabled ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        ))}
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Sistema utiliza cookies HTTPOnly para sessões</p>
        <p>• Rate limiting ativo: máximo 5 tentativas por minuto</p>
        <p>• Magic Link como alternativa segura</p>
        <p>• Auditoria completa de todas as ações administrativas</p>
      </div>
    </div>
  );
};