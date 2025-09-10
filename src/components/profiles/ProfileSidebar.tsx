import { Profile } from "@/features/profiles/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Mail } from "lucide-react";
import { useProfileEvents } from '@/features/profiles/hooks/useProfileEvents';
import { useProfileSimilar } from '@/features/profiles/hooks/useProfileSimilar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface ProfileSidebarProps {
  profile: Profile;
}

export function ProfileSidebar({ profile }: ProfileSidebarProps) {
  const { data: events, isLoading: eventsLoading } = useProfileEvents(
    profile.user_id || '', 
    profile.type as 'artista' | 'local' | 'organizador'
  );
  
  const { data: similarProfiles, isLoading: similarLoading } = useProfileSimilar(
    profile.id || '',
    profile.tags || [],
    profile.type
  );

  const upcomingEvents = events?.filter(event => new Date(event.starts_at) > new Date()) || [];
  const nextThreeEvents = upcomingEvents.slice(0, 3);
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
          {eventsLoading ? (
            <LoadingSpinner size="sm" />
          ) : nextThreeEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhum evento agendado
            </p>
          ) : (
            <ul className="space-y-4">
              {nextThreeEvents.map((event) => {
                const eventDate = parseISO(event.starts_at);
                return (
                  <li key={event.id} className="flex items-start gap-3">
                    <div className="text-center min-w-[40px]">
                      <div className="text-lg font-bold leading-none">
                        {format(eventDate, 'dd', { locale: ptBR })}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase">
                        {format(eventDate, 'MMM', { locale: ptBR })}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/evento/${event.id}`}
                        className="block hover:bg-muted/50 rounded p-1 -m-1"
                      >
                        <p className="font-medium text-sm truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.city} {event.location_name && `• ${event.location_name}`}
                        </p>
                      </Link>
                    </div>
                  </li>
                );
              })}
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
          {profile.tags && profile.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.tags.map((tag) => (
                <Link 
                  key={tag} 
                  to={`/tag/${tag}`} 
                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full hover:bg-primary/20 hover:scale-105 transition-all duration-200"
                >
                  {tag}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-2 text-center">
              Nenhuma tag definida
            </p>
          )}
        </CardContent>
      </Card>

      {/* Parecido com */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Artistas similares</CardTitle>
        </CardHeader>
        <CardContent>
          {similarLoading ? (
            <LoadingSpinner size="sm" />
          ) : similarProfiles && similarProfiles.length > 0 ? (
            <ul className="space-y-3">
              {similarProfiles.slice(0, 4).map((similar) => (
                <li key={similar.id} className="flex items-center gap-3">
                  <img 
                    src={similar.avatar_url || '/placeholder.svg'} 
                    alt={similar.name} 
                    className="w-8 h-8 rounded-full object-cover" 
                  />
                  <Link 
                    to={`/perfil/${similar.handle}`} 
                    className="text-sm hover:text-primary transition-colors flex-1 min-w-0"
                  >
                    <div className="truncate">{similar.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {similar.city}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground py-2 text-center">
              Nenhum perfil similar encontrado
            </p>
          )}
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