import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { getSystemHealth } from '@/data/health';
import type { SystemHealth } from '@/data/health';
import { CheckCircle, AlertCircle, XCircle, Settings, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HealthCard() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHealth = async () => {
      try {
        setLoading(true);
        const data = await getSystemHealth();
        setHealth(data);
      } catch (error) {
        console.error('Failed to load system health:', error);
        // Safe fallback - never leave health as null
        setHealth({
          database: { status: 'error', message: 'Erro de conexão' },
          storage: { status: 'error', message: 'Não acessível' },
          schema: { status: 'warning', message: 'n/d' }
        });
      } finally {
        setLoading(false);
      }
    };

    loadHealth();
  }, []);

  const getStatusIcon = (status: 'ok' | 'warning' | 'error') => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: 'ok' | 'warning' | 'error') => {
    switch (status) {
      case 'ok':
        return <Badge variant="default">OK</Badge>;
      case 'warning':
        return <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">Atenção</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
    }
  };

  // Safe defaults for when health data is not loaded
  const safeHealth = health || {
    database: { status: 'error' as const, message: 'Carregando...' },
    storage: { status: 'error' as const, message: 'Carregando...' },
    schema: { status: 'warning' as const, message: 'n/d' }
  };

  return (
    <Card role="region" aria-label="Status do sistema">
      <CardHeader>
        <CardTitle>Status do Sistema</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" 
            role="status" 
            aria-label="Carregando status do sistema"
          >
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4" aria-live="polite">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Database Status */}
              <div className="flex items-center gap-3" role="status">
                {getStatusIcon(safeHealth.database.status)}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium" id="db-status">Banco</div>
                  <div className="text-xs text-muted-foreground truncate" aria-describedby="db-status">
                    {safeHealth.database.message}
                  </div>
                  <div className="mt-1">
                    {getStatusBadge(safeHealth.database.status)}
                  </div>
                </div>
              </div>

              {/* Storage Status */}
              <div className="flex items-center gap-3" role="status">
                {getStatusIcon(safeHealth.storage.status)}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium" id="storage-status">Storage</div>
                  <div className="text-xs text-muted-foreground truncate" aria-describedby="storage-status">
                    {safeHealth.storage.message}
                  </div>
                  <div className="mt-1">
                    {getStatusBadge(safeHealth.storage.status)}
                  </div>
                </div>
              </div>

              {/* Schema Version */}
              <div className="flex items-center gap-3" role="status">
                {getStatusIcon(safeHealth.schema.status)}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium" id="schema-status">Versão</div>
                  <div className="text-xs text-muted-foreground truncate" aria-describedby="schema-status">
                    {safeHealth.schema.message}
                  </div>
                  <div className="mt-1">
                    {getStatusBadge(safeHealth.schema.status)}
                  </div>
                </div>
              </div>
            </div>

            {/* Help text for issues */}
            {(safeHealth.database.status === 'error' || safeHealth.storage.status === 'error') && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">
                  <strong>Problemas detectados:</strong> Verifique a conexão com o Supabase ou consulte os logs para mais detalhes.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end pt-2 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                asChild
                aria-label="Ver detalhes nos logs do sistema"
              >
                <a href="/gestao/logs" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" aria-hidden="true" />
                  Ver detalhes
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}