import { Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Profile } from "@/features/profiles/api";

interface ProfileEventListMobileProps {
  profile: Profile;
  limit?: number;
}

export function ProfileEventListMobile({ profile, limit }: ProfileEventListMobileProps) {
  // Mock data - replace with actual events data
  const events = [
    {
      id: "1",
      title: "Show de Rock na Cidade",
      date: "2024-01-15",
      time: "20:00",
      venue: "Casa de Shows",
      city: "São Paulo",
    },
    {
      id: "2", 
      title: "Festival de Música",
      date: "2024-01-22",
      time: "19:00",
      venue: "Parque da Cidade",
      city: "Rio de Janeiro",
    },
  ];

  const displayEvents = limit ? events.slice(0, limit) : events;

  if (displayEvents.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground mb-4">
          Nenhum evento encontrado
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.location.href = '/agenda'}
        >
          Conferir Revista
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayEvents.map((event) => (
        <Card key={event.id} className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="space-y-2">
              <h4 className="font-medium text-foreground line-clamp-1">
                {event.title}
              </h4>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(event.date).toLocaleDateString('pt-BR')} • {event.time}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{event.venue} • {event.city}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {limit && events.length > limit && (
        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={() => {/* navigate to full agenda */}}
        >
          Ver todos os eventos ({events.length})
        </Button>
      )}
    </div>
  );
}