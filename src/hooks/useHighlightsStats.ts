import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HighlightsStats {
  totalHighlights: number;
  totalCities: number;
  isLoading: boolean;
  error: string | null;
}

export const useHighlightsStats = (): HighlightsStats => {
  const [stats, setStats] = useState<HighlightsStats>({
    totalHighlights: 0,
    totalCities: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats(prev => ({ ...prev, isLoading: true, error: null }));

        // Count published highlights
        const { count: highlightsCount, error: highlightsError } = await supabase
          .from('highlights')
          .select('*', { count: 'exact', head: true })
          .eq('is_published', true);

        if (highlightsError) throw highlightsError;

        // Count distinct cities with published highlights
        const { data: citiesData, error: citiesError } = await supabase
          .from('highlights')
          .select('city')
          .eq('is_published', true);

        if (citiesError) throw citiesError;

        const uniqueCities = new Set(citiesData?.map(item => item.city) || []);

        setStats({
          totalHighlights: highlightsCount || 0,
          totalCities: uniqueCities.size,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching highlights stats:', error);
        setStats(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erro ao carregar estatísticas',
        }));
      }
    };

    fetchStats();
  }, []);

  return stats;
};