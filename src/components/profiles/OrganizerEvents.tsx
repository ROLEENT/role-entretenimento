import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useProfileEvents } from '@/features/profiles/hooks/useProfileEvents';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Link } from 'react-router-dom';

interface OrganizerEventsProps {
  organizerId: string;
}

export function OrganizerEvents({ organizerId }: OrganizerEventsProps) {
  const [activeTab, setActiveTab] = useState('upcoming');
  const { data: events, isLoading, error } = useProfileEvents(organizerId, 'organizador');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Eventos Organizados</CardTitle>
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
          <CardTitle>Eventos Organizados</CardTitle>
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
                src={event.image_url || '/placeholder.svg'} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium truncate">{event.title}</h3>
                <Badge 
                  variant={event.event_type === 'upcoming' ? 'default' : 'secondary'}
                  className="text-xs flex-shrink-0"
                >
                  {event.event_type === 'upcoming' ? 'Confirmado' : 'Realizado'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(event.date_start), 'dd MMM', { locale: ptBR })}
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(event.date_start), 'HH:mm')}
                </div>
                
                {event.venue_name && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {event.venue_name}
                  </div>
                )}
              </div>
              
              {event.artists && event.artists.length > 0 && (
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {event.artists.slice(0, 3).join(', ')}
                  {event.artists.length > 3 && ` +${event.artists.length - 3}`}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Eventos Organizados</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">
              Próximos ({events?.upcoming.length || 0})
            </TabsTrigger>
            <TabsTrigger value="past">
              Passados ({events?.past.length || 0})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="space-y-4 mt-6">
            {events?.upcoming.length ? (
              events.upcoming.map(renderEvent)
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum evento próximo agendado
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past" className="space-y-4 mt-6">
            {events?.past.length ? (
              events.past.map(renderEvent)
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