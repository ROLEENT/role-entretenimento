import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { getRecentActivity, type RecentActivityItem } from '@/data/dashboard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function RecentActivityTable() {
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoggedError, setHasLoggedError] = useState(false);

  useEffect(() => {
    const loadActivity = async () => {
      try {
        setLoading(true);
        const data = await getRecentActivity();
        setActivities(data);
      } catch (error) {
        if (!hasLoggedError) {
          console.error('Failed to load recent activity:', error);
          setHasLoggedError(true);
        }
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    loadActivity();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default">Publicado</Badge>;
      case 'draft':
        return <Badge variant="secondary">Rascunho</Badge>;
      case 'scheduled':
        return <Badge variant="outline">Agendado</Badge>;
      default:
        return <Badge variant="outline">{status || 'N/A'}</Badge>;
    }
  };

  return (
    <Card className="dashboard-card" role="region" aria-label="Atividade recente do sistema">
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Item</TableHead>
                <TableHead scope="col" className="hidden sm:table-cell">Status</TableHead>
                <TableHead scope="col">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow 
                    key={i} 
                    role="status" 
                    aria-live="polite"
                    aria-label="Carregando atividade"
                  >
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  </TableRow>
                ))
              ) : activities.length > 0 ? (
                activities.map((activity) => (
                  <TableRow 
                    key={activity.id} 
                    className="cursor-pointer hover:bg-muted/50 focus-within:bg-muted/50"
                    onClick={() => {
                      if (activity.id) {
                        window.location.href = `/agenda/${activity.id}`;
                      }
                    }}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && activity.id) {
                        e.preventDefault();
                        window.location.href = `/agenda/${activity.id}`;
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Ver detalhes de ${activity.title}`}
                  >
                    <TableCell className="font-medium">
                      {activity.title}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {getStatusBadge(activity.status)}
                    </TableCell>
                    <TableCell className="text-foreground/70">
                      <time dateTime={activity.updated_at}>
                        {formatDate(activity.updated_at)}
                      </time>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell 
                    colSpan={3} 
                    className="text-center text-foreground/70 py-8"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <p>Nenhuma atividade recente</p>
                      <p className="text-sm">Crie seu primeiro evento para ver a atividade aqui</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}