import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Timeline } from "@/components/ui/timeline";
import { CalendarIcon, MapPinIcon, ClockIcon } from "lucide-react";
import { Profile } from "@/features/profiles/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useProfileEvents, ProfileEvent } from "@/features/profiles/hooks/useProfileEvents";
import { useNavigate } from "react-router-dom";
import { getEventDetailUrl } from "@/utils/eventRouting";

interface ProfileAgendaProps {
  profile: Profile;
}

export function ProfileAgenda({ profile }: ProfileAgendaProps) {
  const navigate = useNavigate();
  
  // Fetch real events data
  const { data: allEvents = [], isLoading } = useProfileEvents(profile.handle, profile.type);

  // Convert events to timeline format
  const timelineEvents = allEvents.map(event => ({
    id: event.id,
    title: event.title,
    date: event.starts_at || new Date().toISOString(),
    location: event.location_name,
    city: event.city,
    image_url: event.cover_url,
    type: profile.type,
    slug: event.slug
  }));

  const handleEventClick = (event: any) => {
    // Find the full event data
    const fullEvent = allEvents.find(e => e.id === event.id);
    if (fullEvent) {
      navigate(getEventDetailUrl(fullEvent));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Agenda de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="flex">
                    <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 m-4" />
                    <div className="flex-1 p-4 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (timelineEvents.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Agenda de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-8 text-center">
                <CalendarIcon className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-blue-800 dark:text-blue-200">
                  Agenda de Eventos
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                  Nenhum evento encontrado. A agenda será atualizada em breve com os próximos shows e apresentações.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" className="bg-background/50">
                    Receber notificações
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Seguir {profile.type === 'local' ? 'local' : profile.type === 'artista' ? 'artista' : 'organizador'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Agenda de Eventos</CardTitle>
          <p className="text-sm text-muted-foreground">
            Acompanhe os próximos eventos e apresentações
          </p>
        </CardHeader>
        <CardContent>
          <Timeline 
            events={timelineEvents}
            variant="compact"
            showPastEvents={true}
            maxPastEvents={10}
            onEventClick={handleEventClick}
          />
        </CardContent>
      </Card>
    </div>
  );
}