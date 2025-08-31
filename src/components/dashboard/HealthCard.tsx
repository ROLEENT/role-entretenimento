import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { getSystemHealth } from '@/data/dashboard';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface SystemHealth {
  database: boolean;
  storage: boolean;
  functions: boolean;
}

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
          database: false,
          storage: false,
          functions: false
        });
      } finally {
        setLoading(false);
      }
    };

    loadHealth();
  }, []);

  const getStatusIcon = (status: boolean) => {
    if (status) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusBadge = (status: boolean, label: string) => {
    return (
      <Badge variant={status ? 'default' : 'destructive'}>
        {status ? 'OK' : 'Erro'}
      </Badge>
    );
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              {getStatusIcon(health?.database ?? false)}
              <div className="flex-1">
                <div className="text-sm font-medium">Database</div>
                {getStatusBadge(health?.database ?? false, 'Database')}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getStatusIcon(health?.storage ?? false)}
              <div className="flex-1">
                <div className="text-sm font-medium">Storage</div>
                {getStatusBadge(health?.storage ?? false, 'Storage')}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getStatusIcon(health?.functions ?? false)}
              <div className="flex-1">
                <div className="text-sm font-medium">Functions</div>
                {getStatusBadge(health?.functions ?? false, 'Functions')}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}