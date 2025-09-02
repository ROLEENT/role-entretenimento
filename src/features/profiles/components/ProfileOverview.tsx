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
    <div className="space-y-4">
      {/* Quick Actions - Compacto */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {renderTypeSpecificCTA()}
        </CardContent>
      </Card>

      {/* Bio Preview - Com clamp */}
      {profile.bio_short && (
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm leading-6 text-muted-foreground line-clamp-3">
              {profile.bio_short}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Events - Formato scanável */}
      {upcomingEvents.length > 0 ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Próximos Eventos
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs">
                ver todos
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {upcomingEvents.slice(0, 2).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="text-center min-w-[3rem]">
                    <div className="text-xl font-bold leading-none">
                      {format(event.date, "dd")}
                    </div>
                    <div className="text-xs uppercase text-muted-foreground">
                      {format(event.date, "MMM", { locale: ptBR })}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium truncate">{event.title}</h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {event.location}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-xs">
                  Ver
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarIcon className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <h3 className="font-medium text-muted-foreground mb-1">Sem eventos por enquanto</h3>
            <p className="text-sm text-muted-foreground/70 mb-3">
              Siga para ser avisado de novos eventos
            </p>
            <Button variant="outline" size="sm">
              Seguir perfil
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