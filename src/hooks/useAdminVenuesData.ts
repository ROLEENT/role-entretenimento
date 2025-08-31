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
      console.log('Fetching venues with params:', { search, status, city });
      
      try {
        let query = supabase
          .from('venues')
          .select('*')
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
          throw new Error(`Erro ao carregar locais: ${error.message}`);
        }

        console.log('Venues fetched successfully:', data?.length, 'venues');
        
        // Ensure data consistency and handle null values
        const processedData = (data || []).map(venue => ({
          ...venue,
          slug: venue.slug || `venue-${venue.id}`, // Generate fallback slug
          name: venue.name || 'Nome não informado',
          city: venue.city || 'Cidade não informada',
          status: venue.status || 'inactive',
          capacity: venue.capacity || null,
          updated_at: venue.updated_at || venue.created_at
        }));

        return processedData;
      } catch (error) {
        console.error('Venues query failed:', error);
        throw error;
      }
    },
  });

  const citiesQuery = useQuery({
    queryKey: ['venues-cities'],
    queryFn: async () => {
      try {
        console.log('Fetching venue cities...');
        
        const { data, error } = await supabase
          .from('venues')
          .select('city')
          .not('city', 'is', null);

        if (error) {
          console.error('Error fetching venue cities:', error);
          throw new Error(`Erro ao carregar cidades: ${error.message}`);
        }

        // Get unique cities and filter out empty/null values
        const uniqueCities = [...new Set(
          data?.map(item => item.city)
            .filter(city => city && city.trim().length > 0) || []
        )];
        
        console.log('Cities fetched successfully:', uniqueCities);
        return uniqueCities.sort();
      } catch (error) {
        console.error('Cities query failed:', error);
        throw error;
      }
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