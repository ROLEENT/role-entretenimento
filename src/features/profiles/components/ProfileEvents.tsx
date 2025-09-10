import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock } from "lucide-react";
import { useProfileEvents } from "../hooks/useProfileEvents";
import { ProfileContentSkeleton } from "@/components/skeletons/ProfileContentSkeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProfileEventsProps {
  profileUserId: string;
  profileType: 'artista' | 'local' | 'organizador';
}

export function ProfileEvents({ profileUserId, profileType }: ProfileEventsProps) {
  const { data: events, isLoading, error } = useProfileEvents(profileUserId, profileType);

  if (isLoading) {
    return <ProfileContentSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Erro ao carregar eventos</p>
        </CardContent>
      </Card>
    );
  }

  if (!events || events.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum evento encontrado</h3>
          <p className="text-muted-foreground">
            Este perfil ainda não possui eventos cadastrados.
          </p>
        </CardContent>
      </Card>
    );
  }

  const upcomingEvents = events.filter(event => 
    event.starts_at && new Date(event.starts_at) > new Date()
  );
  
  const pastEvents = events.filter(event => 
    event.starts_at && new Date(event.starts_at) <= new Date()
  );

  return (
    <div className="space-y-6">
      {upcomingEvents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Próximos Eventos</h3>
          <div className="grid gap-4">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {pastEvents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Eventos Passados</h3>
          <div className="grid gap-4">
            {pastEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EventCard({ event }: { event: any }) {
  const isUpcoming = event.starts_at && new Date(event.starts_at) > new Date();

  return (
    <Card className={`${!isUpcoming ? 'opacity-75' : ''} hover:shadow-md transition-shadow`}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {event.cover_url && (
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={event.cover_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-semibold text-base leading-tight truncate">
                {event.title}
              </h4>
              {!isUpcoming && (
                <Badge variant="outline" className="text-xs">
                  Realizado
                </Badge>
              )}
            </div>
            
            {event.subtitle && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {event.subtitle}
              </p>
            )}
            
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              {event.starts_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(event.starts_at), "d 'de' MMMM", { locale: ptBR })}
                </div>
              )}
              
              {event.starts_at && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(event.starts_at), "HH:mm")}
                </div>
              )}
              
              {(event.city || event.location_name) && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {event.location_name || event.city}
                </div>
              )}
            </div>
            
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {event.tags.slice(0, 3).map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {event.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{event.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}