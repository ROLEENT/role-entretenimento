import { supabase } from '@/integrations/supabase/client';
import { ComboboxAsyncOption } from '@/components/ui/combobox-async';

export const useOrganizerSearch = () => {
  const searchOrganizers = async (query: string): Promise<ComboboxAsyncOption[]> => {
    try {
      const { data, error } = await supabase
        .from('organizers')
        .select('id, name, city, contact_email')
        .or(`name.ilike.%${query}%`)
        .eq('status', 'active')
        .order('name')
        .limit(20);

      if (error) {
        console.error('Erro ao buscar organizadores:', error);
        return [];
      }

      return (data || []).map(organizer => ({
        id: organizer.id,
        name: organizer.name,
        city: organizer.city,
        value: organizer.id,
        subtitle: organizer.contact_email || undefined,
      }));
    } catch (error) {
      console.error('Erro ao buscar organizadores:', error);
      return [];
    }
  };

  const getOrganizerById = async (id: string): Promise<ComboboxAsyncOption | null> => {
    try {
      const { data, error } = await supabase
        .from('organizers')
        .select('id, name, city, contact_email')
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
        subtitle: data.contact_email || undefined,
      };
    } catch (error) {
      console.error('Erro ao buscar organizador:', error);
      return null;
    }
  };

  return {
    searchOrganizers,
    getOrganizerById,
  };
};