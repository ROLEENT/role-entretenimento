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
      {/* Sobre */}
      <section id="visao" className="rounded-2xl border p-4">
        <h2 className="font-semibold mb-2">Sobre</h2>
        {profile.bio || profile.bio_short ? (
          <div className="text-sm leading-6 text-muted-foreground line-clamp-6" id="bio">
            {profile.bio || profile.bio_short}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Sem bio ainda.</p>
        )}
        {(profile.bio || profile.bio_short) && (
          <button
            className="mt-2 text-sm underline"
            onClick={() => document.getElementById('bio')?.classList.toggle('line-clamp-6')}
          >
            ver mais
          </button>
        )}
      </section>

      {/* Ações Rápidas */}
      <section className="rounded-2xl border p-4">
        <h2 className="font-semibold mb-3">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {renderTypeSpecificCTA()}
        </div>
      </section>

      {/* Conteúdos */}
      <section id="conteudos" className="rounded-2xl border p-4">
        <h2 className="font-semibold mb-3">Conteúdos</h2>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CalendarIcon className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <h3 className="font-medium text-muted-foreground mb-1">Sem conteúdos ainda</h3>
          <p className="text-sm text-muted-foreground/70">
            Este perfil ainda não publicou conteúdos.
          </p>
        </div>
      </section>

      {/* Mídia */}
      <section id="midia" className="rounded-2xl border p-4">
        <h2 className="font-semibold mb-3">Fotos e vídeos</h2>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CalendarIcon className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <h3 className="font-medium text-muted-foreground mb-1">Sem mídia ainda</h3>
          <p className="text-sm text-muted-foreground/70">
            Este perfil ainda não tem fotos ou vídeos.
          </p>
        </div>
      </section>

      {/* Avaliações */}
      <section id="avaliacoes" className="rounded-2xl border p-4">
        <h2 className="font-semibold mb-3">Avaliações</h2>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <StarIcon className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <h3 className="font-medium text-muted-foreground mb-1">Sem avaliações ainda</h3>
          <p className="text-sm text-muted-foreground/70">
            Este perfil ainda não recebeu avaliações.
          </p>
        </div>
      </section>
    </div>
  );
}