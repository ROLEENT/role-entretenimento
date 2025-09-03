import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SelectOption {
  label: string;
  value: string;
  id: string;
  name: string;
}

export const useVenuesOptions = () => {
  const [loading, setLoading] = useState(false);

  const searchVenues = async (query: string): Promise<SelectOption[]> => {
    setLoading(true);
    try {
      const queryParams = query ? `?q=${encodeURIComponent(query)}` : '';
      const { data, error } = await supabase.functions.invoke(`options/venues${queryParams}`, {
        method: 'GET',
      });

      if (error) {
        console.error('Error searching venues:', error);
        return [];
      }

      return (data?.items || []).map(item => ({
        label: `${item.name}${item.city ? ` - ${item.city}` : ''}`,
        value: item.id,
        id: item.id,
        name: item.name
      }));
    } catch (error) {
      console.error('Error searching venues:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createVenue = async (name: string): Promise<SelectOption> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('options/venues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name })
      });

      if (error) {
        console.error('Error creating venue:', error);
        throw error;
      }

      return {
        label: `${data.name}${data.city ? ` - ${data.city}` : ''}`,
        value: data.id,
        id: data.id,
        name: data.name
      };
    } catch (error) {
      console.error('Error creating venue:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    searchVenues,
    createVenue,
    loading,
  };
};