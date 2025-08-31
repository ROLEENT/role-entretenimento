import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { getSystemHealth, SystemHealth } from '@/data/dashboard';
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
        setHealth({
          database: { status: 'error', message: 'Erro de conexão' },
          storage: { status: 'error', message: 'Não acessível' },
          schema: { status: 'error', message: 'Não detectada' }
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
        return <Badge variant="outline" className="text-amber-600 border-amber-300">Atenção</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
    }
  };

  return (
    <Card className="dashboard-card">
      <CardHeader>
        <CardTitle>Status do Sistema</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-muted animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-20 bg-muted rounded animate-pulse mb-1" />
                  <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(health?.database.status || 'error')}
                <div className="flex-1">
                  <div className="text-sm font-medium">Database</div>
                  <div className="text-xs text-muted-foreground">
                    {health?.database.message || 'Erro'}
                  </div>
                  {getStatusBadge(health?.database.status || 'error')}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getStatusIcon(health?.storage.status || 'error')}
                <div className="flex-1">
                  <div className="text-sm font-medium">Storage</div>
                  <div className="text-xs text-muted-foreground">
                    {health?.storage.message || 'Erro'}
                  </div>
                  {getStatusBadge(health?.storage.status || 'error')}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getStatusIcon(health?.schema.status || 'error')}
                <div className="flex-1">
                  <div className="text-sm font-medium">Schema</div>
                  <div className="text-xs text-muted-foreground">
                    {health?.schema.message || 'Erro'}
                  </div>
                  {getStatusBadge(health?.schema.status || 'error')}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" size="sm" asChild>
                <a href="/gestao/logs" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Ver logs
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}