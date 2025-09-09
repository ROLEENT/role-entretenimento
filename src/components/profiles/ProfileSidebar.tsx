import { Profile } from "@/features/profiles/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Mail } from "lucide-react";

interface ProfileSidebarProps {
  profile: Profile;
}

// Mock data - replace with real data later
const mockEvents = [
  {
    id: '1',
    day: '06',
    month: 'out',
    title: 'Festival VINIL 2024',
    city: 'São Paulo',
    venue: 'Centro',
    ticketUrl: '#'
  },
  {
    id: '2', 
    day: '15',
    month: 'nov',
    title: 'Show Acústico',
    city: 'Rio de Janeiro',
    venue: 'Lapa',
    ticketUrl: '#'
  }
];

const mockSimilar = [
  {
    slug: 'artista-1',
    display_name: 'João Silva',
    avatar_url: '/placeholder.svg'
  },
  {
    slug: 'artista-2', 
    display_name: 'Maria Santos',
    avatar_url: '/placeholder.svg'
  }
];

const mockTags = ['rock', 'indie', 'alternativo', 'nacional'];

export function ProfileSidebar({ profile }: ProfileSidebarProps) {
  return (
    <div className="space-y-6 sticky top-20">
      {/* Profile Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Informações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <span className="text-muted-foreground">Tipo:</span>
            <span className="ml-2 font-medium">
              {profile.type === 'artista' ? 'Artista' : 
               profile.type === 'local' ? 'Local' : 'Organizador'}
            </span>
          </div>
          {profile.city && (
            <div>
              <span className="text-muted-foreground">Localização:</span>
              <span className="ml-2 font-medium">
                {profile.city}{profile.state ? `, ${profile.state}` : ''}
              </span>
            </div>
          )}
          {profile.contact_email && (
            <div>
              <span className="text-muted-foreground">Email:</span>
              <a href={`mailto:${profile.contact_email}`} className="ml-2 text-primary hover:underline">
                {profile.contact_email}
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Próximos Eventos */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Próximos eventos</CardTitle>
            <a href={`/perfil/@${profile.handle}/agenda`} className="text-xs text-primary hover:underline">
              ver todos
            </a>
          </div>
        </CardHeader>
        <CardContent>
          {mockEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhum evento agendado
            </p>
          ) : (
            <ul className="space-y-4">
              {mockEvents.map((event) => (
                <li key={event.id} className="flex items-start gap-3">
                  <div className="text-center min-w-[40px]">
                    <div className="text-lg font-bold leading-none">{event.day}</div>
                    <div className="text-xs text-muted-foreground uppercase">{event.month}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.city} • {event.venue}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tags</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex flex-wrap gap-2">
            {mockTags.map((tag) => (
              <a 
                key={tag} 
                href={`/tag/${tag}`} 
                className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full hover:bg-primary/20 hover:scale-105 transition-all duration-200"
              >
                {tag}
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Parecido com */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Artistas similares</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {mockSimilar.map((artist) => (
              <li key={artist.slug} className="flex items-center gap-3">
                <img 
                  src={artist.avatar_url} 
                  alt={artist.display_name} 
                  className="w-8 h-8 rounded-full object-cover" 
                />
                <a 
                  href={`/perfil/@${artist.slug}`} 
                  className="text-sm hover:text-primary transition-colors"
                >
                  {artist.display_name}
                </a>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Contato */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Contato</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            asChild
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <a href={`mailto:${profile.contact_email || 'contato@example.com'}`}>
              Enviar mensagem
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}