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
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum evento encontrado para este período.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}