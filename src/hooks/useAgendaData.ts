import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AgendaItem {
  id: string;
  title: string;
  subtitle?: string;
  city?: string;
  start_at?: string;
  end_at?: string;
  cover_url?: string;
  alt_text?: string;
  visibility_type?: 'vitrine' | 'curadoria';
  status?: string;
  priority?: number;
  ticket_url?: string;
  slug?: string;
}

export interface CityStats {
  city: string;
  count: number;
}

export interface AgendaStats {
  totalEvents: number;
  totalCities: number;
  isLoading: boolean;
}

export const useAgendaData = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<AgendaItem[]>([]);
  const [cityStats, setCityStats] = useState<CityStats[]>([]);
  const [stats, setStats] = useState<AgendaStats>({
    totalEvents: 0,
    totalCities: 0,
    isLoading: true
  });
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUpcomingEvents = async () => {
    try {
      setIsLoadingEvents(true);
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      const { data, error: fetchError } = await supabase
        .from('agenda_public')
        .select('*')
        .eq('status', 'published')
        .gte('start_at', today.toISOString())
        .lte('start_at', thirtyDaysFromNow.toISOString())
        .order('priority', { ascending: false })
        .order('start_at', { ascending: true })
        .limit(12);

      if (fetchError) throw fetchError;

      setUpcomingEvents((data as AgendaItem[]) || []);
    } catch (err) {
      console.error('Error fetching upcoming events:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar eventos');
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, isLoading: true }));
      const today = new Date();

      const { data, error: fetchError } = await supabase
        .from('agenda_public')
        .select('city')
        .eq('status', 'published')
        .gte('start_at', today.toISOString());

      if (fetchError) throw fetchError;

      // Calculate stats
      const cityCount: Record<string, number> = {};
      (data || []).forEach((item) => {
        if (item.city) {
          cityCount[item.city] = (cityCount[item.city] || 0) + 1;
        }
      });

      const statsArray = Object.entries(cityCount).map(([city, count]) => ({
        city,
        count,
      }));

      setCityStats(statsArray);
      
      // Update animated stats
      const totalEvents = Object.values(cityCount).reduce((sum, count) => sum + count, 0);
      const totalCities = Object.keys(cityCount).length;
      
      setStats({
        totalEvents,
        totalCities,
        isLoading: false
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      setStats(prev => ({ ...prev, isLoading: false }));
    }
  };

  const refetch = async () => {
    setError(null);
    await Promise.all([
      fetchUpcomingEvents(),
      fetchStats(),
    ]);
  };

  useEffect(() => {
    refetch();
  }, []);

  return {
    upcomingEvents,
    cityStats,
    stats,
    isLoadingEvents,
    error,
    refetch,
  };
};