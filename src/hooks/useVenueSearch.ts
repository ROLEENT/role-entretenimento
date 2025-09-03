import { supabase } from '@/integrations/supabase/client';
import { ComboboxAsyncOption } from '@/components/ui/combobox-async';

export const useVenueSearch = () => {
  const searchVenues = async (query: string): Promise<ComboboxAsyncOption[]> => {
    try {
      let supabaseQuery = supabase
        .from('venues')
        .select('id, name, city, address, type')
        .eq('status', 'active');

      if (query.trim()) {
        // Busca por nome, cidade ou endereço
        supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,city.ilike.%${query}%,address.ilike.%${query}%`);
      }

      const { data, error } = await supabaseQuery
        .order('name')
        .limit(20);

      if (error) {
        console.error('Erro ao buscar locais:', error);
        return [];
      }

      return (data || []).map(venue => ({
        id: venue.id,
        name: venue.name,
        city: venue.city,
        value: venue.id,
        subtitle: venue.address || undefined,
      }));
    } catch (error) {
      console.error('Erro ao buscar locais:', error);
      return [];
    }
  };

  const getVenueById = async (id: string): Promise<ComboboxAsyncOption | null> => {
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('id, name, city, address, type')
        .eq('id', id)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        city: data.city,
        value: data.id,
        subtitle: data.address || undefined,
      };
    } catch (error) {
      console.error('Erro ao buscar local:', error);
      return null;
    }
  };

  return {
    searchVenues,
    getVenueById,
  };
};