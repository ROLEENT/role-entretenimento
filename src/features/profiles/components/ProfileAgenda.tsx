import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, MapPinIcon, ClockIcon, TicketIcon } from "lucide-react";
import { Profile } from "@/features/profiles/api";
import { format, isAfter, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useProfileEvents, ProfileEvent } from "@/features/profiles/hooks/useProfileEvents";
import { useNavigate } from "react-router-dom";
import { getEventDetailUrl } from "@/utils/eventRouting";

interface ProfileAgendaProps {
  profile: Profile;
}

export function ProfileAgenda({ profile }: ProfileAgendaProps) {
  const [filterType, setFilterType] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const navigate = useNavigate();
  
  // Fetch real events data
  const { data: allEvents = [], isLoading } = useProfileEvents(profile.handle, profile.type);

  const filteredEvents = allEvents.filter(event => {
    if (!event.starts_at) return filterType === 'all';
    
    const today = startOfDay(new Date());
    const eventDate = startOfDay(new Date(event.starts_at));
    
    switch (filterType) {
      case 'upcoming':
        return isAfter(eventDate, today) || eventDate.getTime() === today.getTime();
      case 'past':
        return isBefore(eventDate, today);
      default:
        return true;
    }
  });

  const EventCard = ({ event }: { event: ProfileEvent }) => (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(getEventDetailUrl(event))}
    >
      <div className="flex">
        <div className="w-24 h-24 bg-muted flex-shrink-0">
          <img 
            src={event.cover_url || "/placeholder.svg"} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <h3 className="font-semibold text-sm">{event.title}</h3>
              {event.subtitle && (
                <p className="text-xs text-muted-foreground">{event.subtitle}</p>
              )}
              
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  {event.starts_at 
                    ? format(new Date(event.starts_at), "dd/MM/yyyy", { locale: ptBR })
                    : 'Data a definir'
                  }
                </span>
                <span className="flex items-center gap-1">
                  <ClockIcon className="h-3 w-3" />
                  {event.starts_at 
                    ? format(new Date(event.starts_at), "HH:mm", { locale: ptBR })
                    : 'Horário a definir'
                  }
                </span>
                <span className="flex items-center gap-1">
                  <MapPinIcon className="h-3 w-3" />
                  {event.location_name} • {event.city}
                </span>
              </div>

              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {event.tags.slice(0, 3).map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-2 ml-4">
              <Badge 
                variant={event.status === 'published' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {event.status === 'published' ? 'Publicado' : event.status}
              </Badge>
              
              <Button size="sm" variant="outline" className="text-xs">
                <TicketIcon className="h-3 w-3 mr-1" />
                Ver mais
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Agenda de Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={filterType} onValueChange={(value) => setFilterType(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming">Próximos</TabsTrigger>
              <TabsTrigger value="past">Realizados</TabsTrigger>
              <TabsTrigger value="all">Todos</TabsTrigger>
            </TabsList>
            
            <TabsContent value={filterType} className="mt-6">
              <div className="space-y-4">
                {isLoading ? (
                  // Loading state
                  Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="flex">
                        <div className="w-24 h-24 bg-muted flex-shrink-0" />
                        <div className="flex-1 p-4 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                          <div className="h-3 bg-muted rounded w-2/3" />
                        </div>
                      </div>
                    </Card>
                  ))
                ) : filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))
                ) : (
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-8 text-center">
                      <CalendarIcon className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-3 text-blue-800 dark:text-blue-200">
                        {filterType === 'upcoming' ? 'Próximos Shows' : 
                         filterType === 'past' ? 'Eventos Passados' : 'Agenda Completa'}
                      </h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                        {filterType === 'upcoming' 
                          ? 'Não há eventos programados no momento. Fique de olho para não perder os próximos shows!'
                          : filterType === 'past'
                          ? 'Este perfil ainda não realizou eventos cadastrados na plataforma.'
                          : 'Nenhum evento encontrado. A agenda será atualizada em breve.'}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button variant="outline" className="bg-background/50">
                          Receber notificações
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          Seguir {profile.type === 'local' ? 'local' : profile.type === 'artista' ? 'artista' : 'organizador'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}