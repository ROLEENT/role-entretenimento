import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UseAdminVenuesDataProps {
  search?: string;
  status?: string;
  city?: string;
}

export const useAdminVenuesData = ({ search, status, city }: UseAdminVenuesDataProps = {}) => {
  const venuesQuery = useQuery({
    queryKey: ['admin-venues', { search, status, city }],
    queryFn: async () => {
      let query = supabase
        .from('venues')
        .select(`
          *,
          city:cities(name, slug)
        `)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
      }

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      if (city && city !== 'all') {
        query = query.eq('city', city);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching venues:', error);
        throw new Error('Erro ao carregar locais');
      }

      return data || [];
    },
  });

  const citiesQuery = useQuery({
    queryKey: ['venues-cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('city')
        .not('city', 'is', null);

      if (error) {
        console.error('Error fetching venue cities:', error);
        throw new Error('Erro ao carregar cidades');
      }

      // Get unique cities
      const uniqueCities = [...new Set(data?.map(item => item.city) || [])];
      return uniqueCities.filter(Boolean);
    },
  });

  return {
    venues: venuesQuery.data,
    cities: citiesQuery.data,
    isLoading: venuesQuery.isLoading || citiesQuery.isLoading,
    error: venuesQuery.error || citiesQuery.error,
    refetch: venuesQuery.refetch,
  };
};