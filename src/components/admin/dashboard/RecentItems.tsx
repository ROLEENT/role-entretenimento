import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Edit, Star, Calendar, Building, Users } from 'lucide-react';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const RecentItems = () => {
  const { data: recentItems, isLoading, error } = useRecentActivity();
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    switch (type) {
      case 'highlight': return Star;
      case 'event': return Calendar;
      case 'venue': return Building;
      case 'organizer': return Users;
      default: return Edit;
    }
  };

  const getEditUrl = (item: any) => {
    switch (item.type) {
      case 'highlight': return `/admin-highlight-editor?id=${item.id}`;
      case 'event': return `/admin-event-edit/${item.id}`;
      case 'venue': return '/admin-venues-management';
      case 'organizer': return '/admin-organizers';
      default: return '#';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'highlight': return 'Destaque';
      case 'event': return 'Evento';
      case 'venue': return 'Local';
      case 'organizer': return 'Organizador';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Itens Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Itens Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-destructive">
          Erro ao carregar itens recentes
          <button 
            onClick={() => window.location.reload()} 
            className="block mx-auto mt-2 text-sm underline"
          >
            Recarregar
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Itens Recentes
        </CardTitle>
        <CardDescription>
          5 itens editados recentemente
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!recentItems || recentItems.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Nenhum item editado recentemente
          </div>
        ) : (
          <div className="space-y-4">
            {recentItems.map((item) => {
              const Icon = getIcon(item.type);
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">{item.title}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{getTypeLabel(item.type)}</span>
                        {item.city && (
                          <>
                            <span>•</span>
                            <span>{item.city}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(item.updatedAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status && (
                      <Badge 
                        variant={item.status === 'published' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {item.status}
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(getEditUrl(item))}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};