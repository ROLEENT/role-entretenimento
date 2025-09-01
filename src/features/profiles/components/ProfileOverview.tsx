import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon, UsersIcon, StarIcon } from "lucide-react";
import { Profile } from "@/features/profiles/api";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProfileOverviewProps {
  profile: Profile;
}

export function ProfileOverview({ profile }: ProfileOverviewProps) {
  // Mock data for upcoming events - replace with real data
  const upcomingEvents = [
    {
      id: "1",
      title: "Festival de Verão 2024",
      date: addDays(new Date(), 5),
      location: "Praia Central",
      type: "festival"
    },
    {
      id: "2", 
      title: "Show Acústico",
      date: addDays(new Date(), 12),
      location: "Café Cultural",
      type: "show"
    }
  ];

  const renderTypeSpecificCTA = () => {
    switch (profile.type) {
      case 'artista':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button size="lg" className="w-full">
              🎵 Ouvir Música
            </Button>
            <Button variant="outline" size="lg" className="w-full">
              📧 Solicitar Booking
            </Button>
          </div>
        );
      case 'local':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button size="lg" className="w-full">
              📅 Ver Programação
            </Button>
            <Button variant="outline" size="lg" className="w-full">
              🗺️ Como Chegar
            </Button>
            <Button variant="outline" size="lg" className="w-full">
              🎫 Reservas
            </Button>
          </div>
        );
      case 'organizador':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button size="lg" className="w-full">
              🎪 Próximos Eventos
            </Button>
            <Button variant="outline" size="lg" className="w-full">
              📝 Submeter Proposta
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          {renderTypeSpecificCTA()}
        </CardContent>
      </Card>

      {/* Bio Preview */}
      {profile.bio_short && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground leading-relaxed">
              {profile.bio_short}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.slice(0, 3).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-medium">{event.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      {format(event.date, "dd 'de' MMMM", { locale: ptBR })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="h-4 w-4" />
                      {event.location}
                    </span>
                  </div>
                </div>
                <Badge variant={event.type === 'festival' ? 'default' : 'secondary'}>
                  {event.type}
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              Ver todos os eventos
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Social Proof */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <StarIcon className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm">
                <span className="font-medium">João Silva</span> e <span className="font-medium">2 outros</span> avaliaram este perfil
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <UsersIcon className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm">
                <span className="font-medium">Maria Santos</span> e <span className="font-medium">5 outros</span> começaram a seguir
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}