import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CityEventStats {
  city: string;
  slug: string;
  count: number;
}

const fetchCityEventStats = async (): Promise<CityEventStats[]> => {
  // Get current date without time to include today's events
  const todayStr = new Date().toISOString().split('T')[0];
  
  console.log('🔍 Fetching city event stats from date:', todayStr);

  const { data, error } = await supabase
    .from('events')
    .select('city')
    .eq('status', 'published')
    .gte('date_start', todayStr);

  if (error) {
    console.error('Error fetching city stats:', error);
    throw error;
  }

  // Count events by city
  const cityCount: Record<string, number> = {};
  (data || []).forEach((item) => {
    if (item.city) {
      cityCount[item.city] = (cityCount[item.city] || 0) + 1;
    }
  });

  // Convert to array with slugs
  const cityStats: CityEventStats[] = Object.entries(cityCount).map(([city, count]) => ({
    city,
    slug: city.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, ''),
    count,
  }));

  console.log('📊 City stats:', cityStats);
  return cityStats;
};

export const useCityEventStats = () => {
  return useQuery({
    queryKey: ['city-event-stats'],
    queryFn: fetchCityEventStats,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};