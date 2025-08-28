import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Star, Clock, MapPin } from 'lucide-react';
import { useUpcomingData } from '@/hooks/useDashboardData';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const UpcomingEvents = () => {
  const { data: upcoming, isLoading, error } = useUpcomingData();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-destructive">
          Erro ao carregar eventos próximos
          <button 
            onClick={() => window.location.reload()} 
            className="block mx-auto mt-2 text-sm underline"
          >
            Recarregar
          </button>
        </div>
      </Card>
    );
  }

  const todayEvents = upcoming?.today.events || [];
  const todayHighlights = upcoming?.today.highlights || [];
  const next7DaysEvents = upcoming?.next7Days.events || [];
  const next7DaysHighlights = upcoming?.next7Days.highlights || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Hoje */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Hoje
          </CardTitle>
          <CardDescription>
            Eventos e destaques programados para hoje
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todayEvents.length === 0 && todayHighlights.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Nada programado para hoje
            </div>
          ) : (
            <div className="space-y-3">
              {/* Eventos hoje */}
              {todayEvents.map((event) => (
                <div
                  key={`event-${event.id}`}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(`/admin-v2/events/${event.id}/edit`)}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="font-medium text-sm">{event.title}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{event.city}</span>
                        <span>•</span>
                        <span>
                          {format(new Date(event.date_start), 'HH:mm', { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="default" className="text-xs">
                    Evento
                  </Badge>
                </div>
              ))}

              {/* Destaques hoje */}
              {todayHighlights.map((highlight) => (
                <div
                  key={`highlight-${highlight.id}`}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(`/admin-v2/highlights/${highlight.id}/edit`)}
                >
                  <div className="flex items-center gap-3">
                    <Star className="h-4 w-4 text-purple-500" />
                    <div>
                      <div className="font-medium text-sm">{highlight.event_title}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{highlight.city}</span>
                        <span>•</span>
                        <span>
                          {format(new Date(highlight.event_date), 'HH:mm', { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Destaque
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Próximos 7 dias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximos 7 Dias
          </CardTitle>
          <CardDescription>
            Eventos e destaques programados para a semana
          </CardDescription>
        </CardHeader>
        <CardContent>
          {next7DaysEvents.length === 0 && next7DaysHighlights.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Nada programado para os próximos 7 dias
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {/* Eventos próximos 7 dias */}
              {next7DaysEvents.map((event) => (
                <div
                  key={`event-${event.id}`}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(`/admin-v2/events/${event.id}/edit`)}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="font-medium text-sm">{event.title}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{event.city}</span>
                        <span>•</span>
                        <span>
                          {format(new Date(event.date_start), 'dd/MM HH:mm', { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="default" className="text-xs">
                    Evento
                  </Badge>
                </div>
              ))}

              {/* Destaques próximos 7 dias */}
              {next7DaysHighlights.map((highlight) => (
                <div
                  key={`highlight-${highlight.id}`}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(`/admin-v2/highlights/${highlight.id}/edit`)}
                >
                  <div className="flex items-center gap-3">
                    <Star className="h-4 w-4 text-purple-500" />
                    <div>
                      <div className="font-medium text-sm">{highlight.event_title}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{highlight.city}</span>
                        <span>•</span>
                        <span>
                          {format(new Date(highlight.event_date), 'dd/MM HH:mm', { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Destaque
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};