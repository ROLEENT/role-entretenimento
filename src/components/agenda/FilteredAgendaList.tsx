import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface AgendaFilters {
  search?: string;
  status?: string;
  city?: string;
  tags?: string[];
}

interface AgendaItem {
  id: string;
  title: string;
  subtitle?: string;
  city?: string;
  starts_at?: string;
  end_at?: string;
  cover_url?: string;
  alt_text?: string;
  slug?: string;
  ticket_url?: string;
  location_name?: string;
  tags?: string[];
  priority?: number;
}

interface FilteredAgendaListProps {
  filters: AgendaFilters;
  limit?: number;
  showViewMore?: boolean;
}

const fetchFilteredEvents = async (filters: AgendaFilters, limit?: number): Promise<AgendaItem[]> => {
  const today = new Date();

  let query = supabase
    .from('agenda_itens')
    .select('*')
    .eq('status', 'published')
    .is('deleted_at', null);

  // Apply date filters based on status
  if (filters.status === 'this_week') {
    const endOfWeek = new Date();
    endOfWeek.setDate(today.getDate() + 7);
    query = query.gte('starts_at', today.toISOString()).lte('starts_at', endOfWeek.toISOString());
  } else if (filters.status === 'this_month') {
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    query = query.gte('starts_at', today.toISOString()).lte('starts_at', endOfMonth.toISOString());
  } else if (filters.status === 'upcoming' || !filters.status || filters.status === 'all') {
    query = query.gte('starts_at', today.toISOString());
  }

  // Apply other filters
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,subtitle.ilike.%${filters.search}%,location_name.ilike.%${filters.search}%`);
  }

  if (filters.city) {
    query = query.eq('city', filters.city);
  }

  if (filters.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags);
  }

  query = query
    .order('priority', { ascending: false })
    .order('starts_at', { ascending: true });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data as AgendaItem[]) || [];
};

export function FilteredAgendaList({ filters, limit, showViewMore = false }: FilteredAgendaListProps) {
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['filtered-agenda-events', filters, limit],
    queryFn: () => fetchFilteredEvents(filters, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Skeleton className="w-20 h-20 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Erro ao carregar eventos. Tente novamente.</p>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Nenhum evento encontrado</h3>
          <p className="text-muted-foreground">
            Tente ajustar os filtros para encontrar mais eventos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Card key={event.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex gap-4">
              {/* Event Image */}
              {event.cover_url && (
                <div className="flex-shrink-0">
                  <img
                    src={event.cover_url}
                    alt={event.alt_text || event.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Event Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg leading-tight mb-1">
                      {event.title}
                    </h3>
                    {event.subtitle && (
                      <p className="text-muted-foreground text-sm mb-2">
                        {event.subtitle}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
                      {event.starts_at && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(event.starts_at)}
                        </div>
                      )}
                      {event.city && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.city}
                        </div>
                      )}
                      {event.location_name && (
                        <span>• {event.location_name}</span>
                      )}
                    </div>

                    {/* Tags */}
                    {event.tags && event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {event.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {event.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{event.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    {event.ticket_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={event.ticket_url} target="_blank" rel="noopener noreferrer">
                          <Ticket className="w-4 h-4 mr-1" />
                          Ingressos
                        </a>
                      </Button>
                    )}
                    <Button size="sm" asChild>
                      <Link to={`/agenda/${event.slug || event.id}`}>
                        Ver mais
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* View More Button */}
      {showViewMore && events.length >= (limit || 10) && (
        <div className="text-center pt-4">
          <Button variant="outline" asChild>
            <Link to="/agenda/todos">Ver todos os eventos</Link>
          </Button>
        </div>
      )}
    </div>
  );
}