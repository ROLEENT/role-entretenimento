import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface UserCalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime: string;
  all_day: boolean;
  location?: string;
  color: string;
  event_id?: string;
  source: 'favorite' | 'attending' | 'interested' | 'manual';
  reminder_minutes: number[];
}

export interface CalendarFilters {
  startDate?: Date;
  endDate?: Date;
  source?: 'favorite' | 'attending' | 'interested' | 'manual';
}

interface EventData {
  id: string;
  title: string;
  summary?: string;
  start_at: string;
  end_at?: string;
  venues?: {
    name: string;
    address?: string;
  };
}

interface FavoriteEventData {
  event_id: string;
  events: EventData;
}

interface CheckinEventData {
  event_id: string;
  events: EventData;
}

export const useUserCalendar = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<UserCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar eventos do usuário baseado em favoritos e check-ins
  const loadUserEvents = useCallback(async (filters: CalendarFilters = {}) => {
    if (!user) return;

    try {
      setLoading(true);
      const now = new Date();
      
      // Buscar favoritos
      const { data: favoriteEvents, error: favError } = await supabase
        .from('event_favorites')
        .select(`
          event_id,
          events!inner (
            id,
            title,
            summary,
            start_at,
            end_at,
            venue_id,
            venues (name, address)
          )
        `)
        .eq('user_id', user.id);

      if (favError) throw favError;

      // Buscar check-ins (eventos que o usuário confirmou presença)
      const { data: checkinEvents, error: checkinError } = await supabase
        .from('event_checkins')
        .select(`
          event_id,
          events!inner (
            id,
            title,
            summary,
            start_at,
            end_at,
            venue_id,
            venues (name, address)
          )
        `)
        .eq('user_id', user.id);

      if (checkinError) throw checkinError;

      // Buscar eventos manuais do calendário pessoal
      let manualQuery = supabase
        .from('user_calendar_events')
        .select('*')
        .eq('user_id', user.id);

      if (filters.startDate) {
        manualQuery = manualQuery.gte('start_datetime', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        manualQuery = manualQuery.lte('start_datetime', filters.endDate.toISOString());
      }

      const { data: manualEvents, error: manualError } = await manualQuery;
      if (manualError) throw manualError;

      // Processar e combinar eventos
      const allEvents: UserCalendarEvent[] = [];

      // Adicionar favoritos
      favoriteEvents?.forEach((fav: any) => {
        const event = fav.events;
        if (event && event.start_at) {
          allEvents.push({
            id: `fav-${event.id}`,
            title: event.title,
            description: event.summary || '',
            start_datetime: event.start_at,
            end_datetime: event.end_at || event.start_at,
            all_day: false,
            location: event.venues?.name || '',
            color: '#3B82F6',
            event_id: event.id,
            source: 'favorite',
            reminder_minutes: [15]
          });
        }
      });

      // Adicionar check-ins (apenas se não for favorito)
      checkinEvents?.forEach((checkin: any) => {
        const event = checkin.events;
        if (event && event.start_at) {
          const existingFav = allEvents.find(e => e.event_id === event.id);
          if (!existingFav) {
            allEvents.push({
              id: `checkin-${event.id}`,
              title: event.title,
              description: event.summary || '',
              start_datetime: event.start_at,
              end_datetime: event.end_at || event.start_at,
              all_day: false,
              location: event.venues?.name || '',
              color: '#10B981',
              event_id: event.id,
              source: 'attending',
              reminder_minutes: [15]
            });
          } else {
            // Atualizar cor para indicar que é favorito E confirmado
            existingFav.color = '#8B5CF6';
          }
        }
      });

      // Adicionar eventos manuais
      manualEvents?.forEach(manual => {
        allEvents.push({
          id: manual.id,
          title: manual.title,
          description: manual.description || '',
          start_datetime: manual.start_datetime,
          end_datetime: manual.end_datetime,
          all_day: manual.all_day,
          location: manual.location || '',
          color: manual.color,
          source: 'manual',
          reminder_minutes: manual.reminder_minutes || [15]
        });
      });

      // Filtrar por data se especificado
      let filteredEvents = allEvents;
      if (filters.startDate || filters.endDate) {
        filteredEvents = allEvents.filter(event => {
          const eventDate = new Date(event.start_datetime);
          if (filters.startDate && eventDate < filters.startDate) return false;
          if (filters.endDate && eventDate > filters.endDate) return false;
          return true;
        });
      }

      // Filtrar por fonte se especificado
      if (filters.source) {
        filteredEvents = filteredEvents.filter(event => event.source === filters.source);
      }

      // Ordenar por data
      filteredEvents.sort((a, b) => 
        new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
      );

      setEvents(filteredEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar eventos');
      toast.error('Erro ao carregar eventos do calendário');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Gerar URL para download do ICS
  const generateICSUrl = useCallback(() => {
    if (!user) return null;
    
    // Usando edge function para gerar ICS
    const baseUrl = 'https://nutlcbnruabjsxecqpnd.supabase.co/functions/v1';
    return `${baseUrl}/calendar-ics?user_id=${user.id}`;
  }, [user]);

  // Gerar conteúdo ICS localmente (fallback)
  const generateICSContent = useCallback(() => {
    if (!events.length) return null;

    const now = new Date();
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ROLÊ//Personal Calendar//PT',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Meus Eventos ROLÊ',
      'X-WR-TIMEZONE:America/Sao_Paulo'
    ];

    // Adicionar apenas eventos futuros
    const futureEvents = events.filter(event => 
      new Date(event.start_datetime) >= now
    );

    futureEvents.forEach(event => {
      const startDate = new Date(event.start_datetime);
      const endDate = new Date(event.end_datetime);
      
      icsContent.push(
        'BEGIN:VEVENT',
        `UID:role-${event.id}@roleentretenimento.com`,
        `DTSTART:${formatDate(startDate)}`,
        `DTEND:${formatDate(endDate)}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description || ''}`,
        `LOCATION:${event.location || ''}`,
        `STATUS:CONFIRMED`,
        `CREATED:${formatDate(now)}`,
        `LAST-MODIFIED:${formatDate(now)}`,
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');
    
    return icsContent.join('\r\n');
  }, [events]);

  // Download do arquivo ICS
  const downloadICS = useCallback(() => {
    const icsContent = generateICSContent();
    if (!icsContent) {
      toast.error('Nenhum evento para exportar');
      return;
    }

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'meus-eventos-role.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success('Calendário baixado com sucesso!');
  }, [generateICSContent]);

  useEffect(() => {
    if (user) {
      loadUserEvents();
    }
  }, [user, loadUserEvents]);

  return {
    events,
    loading,
    error,
    loadUserEvents,
    generateICSUrl,
    downloadICS,
    clearError: () => setError(null)
  };
};