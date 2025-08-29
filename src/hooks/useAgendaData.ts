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

export const useAgendaData = (visibilityType: 'vitrine' | 'curadoria') => {
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [cityStats, setCityStats] = useState<CityStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgendaItems = async () => {
    try {
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      const { data, error: fetchError } = await supabase
        .from('agenda_public')
        .select('*')
        .eq('status', 'published')
        .eq('visibility_type', visibilityType)
        .gte('start_at', today.toISOString())
        .lte('start_at', thirtyDaysFromNow.toISOString())
        .order('priority', { ascending: false })
        .order('start_at', { ascending: true })
        .limit(12);

      if (fetchError) throw fetchError;

      setAgendaItems((data as AgendaItem[]) || []);
    } catch (err) {
      console.error('Error fetching agenda items:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar eventos');
    }
  };

  const fetchCityStats = async () => {
    try {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + 90);

      const { data, error: fetchError } = await supabase
        .from('agenda_public')
        .select('city')
        .eq('status', 'published')
        .gte('start_at', today.toISOString())
        .lte('start_at', futureDate.toISOString());

      if (fetchError) throw fetchError;

      // Group by city and count
      const cityCount: Record<string, number> = {};
      (data || []).forEach((item) => {
        if (item.city) {
          cityCount[item.city] = (cityCount[item.city] || 0) + 1;
        }
      });

      const stats = Object.entries(cityCount).map(([city, count]) => ({
        city,
        count,
      }));

      setCityStats(stats);
    } catch (err) {
      console.error('Error fetching city stats:', err);
    }
  };

  const refetch = async () => {
    setIsLoading(true);
    setError(null);
    
    await Promise.all([
      fetchAgendaItems(),
      fetchCityStats(),
    ]);
    
    setIsLoading(false);
  };

  useEffect(() => {
    refetch();
  }, [visibilityType]);

  return {
    agendaItems,
    cityStats,
    isLoading,
    error,
    refetch,
  };
};