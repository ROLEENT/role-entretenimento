import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Link } from 'react-router-dom';

interface SavedEvent {
  id: string;
  events: {
    id: string;
    title: string;
    subtitle?: string;
    date_start: string;
    date_end?: string;
    city: string;
    location_name?: string;
    image_url?: string;
    slug: string;
  } | null;
  created_at: string;
}

interface UserSavedEventsProps {
  userId?: string;
  isOwner?: boolean;
  isPublic?: boolean;
}

export function UserSavedEvents({ userId, isOwner = false, isPublic = false }: UserSavedEventsProps) {
  const [events, setEvents] = useState<SavedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchSavedEvents = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('saved_events')
          .select(`
            id,
            created_at,
            events!inner (
              id,
              title,
              subtitle,
              date_start,
              date_end,
              city,
              location_name,
              image_url,
              slug
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        // If viewing someone else's public profile, only show public events
        if (isPublic && !isOwner) {
          query = query.eq('events.status', 'published');
        }

        const { data, error } = await query;

        if (error) throw error;
        setEvents((data as any) || []);
      } catch (error) {
        console.error('Error fetching saved events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedEvents();
  }, [userId, isOwner, isPublic]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {isOwner ? 'Seus Eventos Salvos' : 'Eventos Salvos'}
          </CardTitle>
          <CardDescription>
            {isOwner 
              ? 'Você ainda não salvou nenhum evento.'
              : 'Este usuário ainda não salvou nenhum evento público.'
            }
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {isOwner ? 'Seus Eventos Salvos' : 'Eventos Salvos'}
        </h3>
        <Badge variant="secondary">{events.length}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((savedEvent) => {
          const event = savedEvent.events;
          if (!event) return null;

          return (
            <Card key={savedEvent.id} className="overflow-hidden">
              {event.image_url && (
                <div className="aspect-video bg-muted">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h4 className="font-semibold line-clamp-2">{event.title}</h4>
                  {event.subtitle && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {event.subtitle}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(event.date_start)}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {event.location_name || event.city}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Salvo em {formatDate(savedEvent.created_at)}
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button asChild size="sm" className="w-full">
                    <Link to={`/evento/${event.slug}`}>
                      Ver Evento
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}