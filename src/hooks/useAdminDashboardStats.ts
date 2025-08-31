import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  events: {
    total: number;
    published: number;
    draft: number;
    upcoming: number;
  };
  cities: {
    total: number;
    withEvents: number;
  };
  artists: {
    total: number;
    active: number;
  };
  venues: {
    total: number;
    active: number;
  };
}

interface EventsByCity {
  city: string;
  count: number;
}

interface EventsByMonth {
  month: string;
  count: number;
}

export const useAdminDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [eventsByCity, setEventsByCity] = useState<EventsByCity[]>([]);
  const [eventsByMonth, setEventsByMonth] = useState<EventsByMonth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch events stats using the correct column name 'starts_at'
        const { data: eventsData, error: eventsError } = await supabase
          .from('agenda_itens')
          .select('status, city, starts_at');

        if (eventsError) throw eventsError;

        // Fetch artists stats
        const { count: artistsTotal, error: artistsError } = await supabase
          .from('artists')
          .select('*', { count: 'exact', head: true });

        if (artistsError) throw artistsError;

        const { count: artistsActive, error: artistsActiveError } = await supabase
          .from('artists')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        if (artistsActiveError) throw artistsActiveError;

        // Fetch venues stats
        const { count: venuesTotal, error: venuesError } = await supabase
          .from('venues')
          .select('*', { count: 'exact', head: true });

        if (venuesError) throw venuesError;

        // Process events data
        const now = new Date();
        const events = eventsData || [];
        
        const publishedEvents = events.filter(e => e.status === 'published');
        const draftEvents = events.filter(e => e.status === 'draft');
        const upcomingEvents = events.filter(e => 
          e.status === 'published' && 
          e.starts_at && 
          new Date(e.starts_at) > now
        );

        // Process cities data
        const citiesWithEvents = new Set(events.filter(e => e.city).map(e => e.city));
        
        // Events by city
        const cityMap = new Map<string, number>();
        events.forEach(event => {
          if (event.city) {
            cityMap.set(event.city, (cityMap.get(event.city) || 0) + 1);
          }
        });
        
        const eventsByCityData = Array.from(cityMap.entries())
          .map(([city, count]) => ({ city, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Events by month (last 6 months)
        const monthMap = new Map<string, number>();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        events.forEach(event => {
          if (event.starts_at) {
            const eventDate = new Date(event.starts_at);
            if (eventDate >= sixMonthsAgo) {
              const monthKey = eventDate.toLocaleDateString('pt-BR', { 
                month: 'short', 
                year: 'numeric' 
              });
              monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
            }
          }
        });

        const eventsByMonthData = Array.from(monthMap.entries())
          .map(([month, count]) => ({ month, count }))
          .sort((a, b) => a.month.localeCompare(b.month));

        setStats({
          events: {
            total: events.length,
            published: publishedEvents.length,
            draft: draftEvents.length,
            upcoming: upcomingEvents.length,
          },
          cities: {
            total: citiesWithEvents.size,
            withEvents: citiesWithEvents.size,
          },
          artists: {
            total: artistsTotal || 0,
            active: artistsActive || 0,
          },
          venues: {
            total: venuesTotal || 0,
            active: venuesTotal || 0,
          },
        });

        setEventsByCity(eventsByCityData);
        setEventsByMonth(eventsByMonthData);

      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar estatísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { 
    stats, 
    eventsByCity, 
    eventsByMonth, 
    loading, 
    error 
  };
};