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
    <div className="space-y-8">
      {/* Bio section - clean, no card */}
      <section id="visao" className="">
        <h2 className="text-xl font-semibold mb-4">Sobre</h2>
        {profile.bio || profile.bio_short ? (
          <div className="prose prose-sm max-w-none">
            <div className="text-sm leading-6 line-clamp-6" id="bio">
              {(profile.bio || profile.bio_short)?.split('\n').map((paragraph, index) => (
                <p key={index} className={index > 0 ? "mt-4" : ""}>
                  {paragraph}
                </p>
              ))}
            </div>
            <button
              className="mt-3 text-sm text-primary hover:underline"
              onClick={() => document.getElementById('bio')?.classList.toggle('line-clamp-6')}
            >
              ver mais
            </button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Este perfil ainda não tem biografia.</p>
        )}
      </section>

      {/* Latest content */}
      <section id="conteudos" className="">
        <h2 className="text-xl font-semibold mb-4">Último conteúdo</h2>
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-lg">
          <CalendarIcon className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="font-medium text-muted-foreground mb-1">Nenhum conteúdo publicado</h3>
          <p className="text-sm text-muted-foreground/70">
            Este perfil ainda não publicou conteúdos.
          </p>
        </div>
      </section>

      {/* Recent reviews */}
      <section id="avaliacoes" className="">
        <h2 className="text-xl font-semibold mb-4">Avaliações recentes</h2>
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-lg">
          <StarIcon className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="font-medium text-muted-foreground mb-1">Nenhuma avaliação</h3>
          <p className="text-sm text-muted-foreground/70">
            Este perfil ainda não recebeu avaliações.
          </p>
        </div>
      </section>
    </div>
  );
}