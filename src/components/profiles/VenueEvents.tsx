import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useProfileEvents } from '@/features/profiles/hooks/useProfileEvents';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Link } from 'react-router-dom';

interface VenueEventsProps {
  venueId: string;
}

export function VenueEvents({ venueId }: VenueEventsProps) {
  const [activeTab, setActiveTab] = useState('upcoming');
  const { data: events = [], isLoading, error } = useProfileEvents(venueId, 'local');

  // Separate events by type
  const now = new Date();
  const upcomingEvents = events.filter(event => new Date(event.starts_at) >= now);
  const pastEvents = events.filter(event => new Date(event.starts_at) < now);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Eventos no Local</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Eventos no Local</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          Erro ao carregar eventos
        </CardContent>
      </Card>
    );
  }

  const renderEvent = (event: any) => (
    <Link key={event.id} to={`/eventos/${event.slug}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex gap-4">
          <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
            <img 
              src={event.cover_url || '/placeholder.svg'} 
              alt={event.title}
              className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium truncate">{event.title}</h3>
              <Badge 
                variant={new Date(event.starts_at) >= new Date() ? 'default' : 'secondary'}
                className="text-xs flex-shrink-0"
              >
                {new Date(event.starts_at) >= new Date() ? 'Confirmado' : 'Realizado'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(event.starts_at), 'dd MMM', { locale: ptBR })}
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(event.starts_at), 'HH:mm')}
              </div>
              
              {event.artists_names && event.artists_names.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                  {event.artists_names.slice(0, 2).join(', ')}
                  {event.artists_names.length > 2 && ` +${event.artists_names.length - 2}`}
                </div>
              )}
            </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Eventos no Local</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">
              Próximos ({upcomingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Passados ({pastEvents.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="space-y-4 mt-6">
            {upcomingEvents.length ? (
              upcomingEvents.map(renderEvent)
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum evento próximo agendado
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past" className="space-y-4 mt-6">
            {pastEvents.length ? (
              pastEvents.map(renderEvent)
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum evento passado encontrado
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}