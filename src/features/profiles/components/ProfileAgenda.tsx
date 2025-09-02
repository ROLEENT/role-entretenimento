import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, MapPinIcon, ClockIcon, TicketIcon } from "lucide-react";
import { Profile } from "@/features/profiles/api";
import { format, isAfter, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProfileAgendaProps {
  profile: Profile;
}

export function ProfileAgenda({ profile }: ProfileAgendaProps) {
  const [filterType, setFilterType] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  // Mock events data - replace with real data
  const events = [
    {
      id: "1",
      title: "Festival de Verão 2024",
      subtitle: "Edição especial com grandes nomes",
      date: new Date(2024, 11, 15),
      time: "20:00",
      location: "Praia Central, Florianópolis",
      venue: "Arena da Praia",
      price: "R$ 80",
      status: "available",
      tags: ["festival", "eletrônica", "verão"],
      image: "/placeholder.svg"
    },
    {
      id: "2",
      title: "Show Acústico Intimista", 
      subtitle: "Uma noite especial de música",
      date: new Date(2024, 10, 20),
      time: "19:30",
      location: "Centro Cultural, São Paulo",
      venue: "Café Cultural SP",
      price: "R$ 45",
      status: "sold-out",
      tags: ["acústico", "intimista", "mpb"],
      image: "/placeholder.svg"
    }
  ];

  const filteredEvents = events.filter(event => {
    const today = startOfDay(new Date());
    const eventDate = startOfDay(event.date);
    
    switch (filterType) {
      case 'upcoming':
        return isAfter(eventDate, today) || eventDate.getTime() === today.getTime();
      case 'past':
        return isBefore(eventDate, today);
      default:
        return true;
    }
  });

  const EventCard = ({ event }: { event: any }) => (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex">
        <div className="w-24 h-24 bg-muted flex-shrink-0">
          <img 
            src={event.image} 
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
                  {format(event.date, "dd/MM/yyyy", { locale: ptBR })}
                </span>
                <span className="flex items-center gap-1">
                  <ClockIcon className="h-3 w-3" />
                  {event.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPinIcon className="h-3 w-3" />
                  {event.venue}
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mt-2">
                {event.tags.slice(0, 3).map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 ml-4">
              <div className="text-right">
                <div className="text-sm font-medium">{event.price}</div>
                <Badge 
                  variant={event.status === 'available' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {event.status === 'available' ? 'Disponível' : 'Esgotado'}
                </Badge>
              </div>
              
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
                {filteredEvents.length > 0 ? (
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
                          ? 'Este artista ainda não realizou eventos cadastrados na plataforma.'
                          : 'Nenhum evento encontrado. A agenda será atualizada em breve.'}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button variant="outline" className="bg-background/50">
                          Receber notificações
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          Seguir artista
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