import { Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Profile } from "@/features/profiles/api";
import { useProfileEvents } from "@/features/profiles/hooks/useProfileEvents";
import { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAnimatedToast } from "@/hooks/useAnimatedToast";
import { getEventDetailUrl } from "@/utils/eventRouting";

interface ProfileEventListMobileProps {
  profile: Profile;
  limit?: number;
}

export const ProfileEventListMobile = memo(function ProfileEventListMobile({ profile, limit }: ProfileEventListMobileProps) {
  const { data: events = [], isLoading, error } = useProfileEvents(profile.handle, profile.type);
  const navigate = useNavigate();
  const { showAnimatedToast } = useAnimatedToast();

  console.log(`ProfileEventListMobile - Profile: ${profile.name} (${profile.type}), Handle: ${profile.handle}`);
  console.log(`ProfileEventListMobile - Events:`, events);
  console.log(`ProfileEventListMobile - IsLoading:`, isLoading);
  console.log(`ProfileEventListMobile - Error:`, error);

  const displayEvents = limit ? events.slice(0, limit) : events;

  const handleEventClick = useCallback((event: any) => {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
    
    // Navigate to event details using correct URL
    navigate(getEventDetailUrl(event));
    
    showAnimatedToast({
      title: "Navegando para evento",
      description: event.title,
      duration: 2000
    });
  }, [navigate, showAnimatedToast]);

  const handleViewAllEvents = useCallback(() => {
    // Navegar para a aba agenda do perfil sem usar rota específica
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    console.log('Clicou em Ver todos os eventos');
    // Simples reload da página na aba agenda pode ser implementado aqui
    // Por ora, vamos apenas dar feedback visual
    showAnimatedToast({
      title: "Agenda completa",
      description: "Confira todos os eventos abaixo",
      duration: 2000
    });
  }, [showAnimatedToast]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: limit || 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

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
        <Card 
          key={event.id} 
          className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          onClick={() => handleEventClick(event)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleEventClick(event);
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={`Ver detalhes do evento ${event.title}`}
        >
          <CardContent className="p-4">
            <div className="space-y-2">
              <h4 className="font-medium text-foreground line-clamp-1">
                {event.title}
              </h4>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {event.starts_at 
                      ? new Date(event.starts_at).toLocaleDateString('pt-BR') 
                      : 'Data a definir'
                    }
                    {event.starts_at && (
                      <> • {new Date(event.starts_at).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}</>
                    )}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{event.location_name || 'Local a definir'} • {event.city || 'Cidade a definir'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {limit && events.length > limit && (
        <Button 
          variant="outline" 
          className="w-full mt-4 min-h-[44px] active:scale-95 transition-all focus:ring-2 focus:ring-primary focus:ring-offset-2"
          onClick={handleViewAllEvents}
          aria-label={`Ver todos os ${events.length} eventos`}
        >
          Ver todos os eventos ({events.length})
        </Button>
      )}
    </div>
  );
});