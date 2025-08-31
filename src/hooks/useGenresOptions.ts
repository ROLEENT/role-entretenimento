import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SelectOption {
  label: string;
  value: string;
}

export const useGenresOptions = () => {
  const [loading, setLoading] = useState(false);

  const searchGenres = async (query: string): Promise<SelectOption[]> => {
    setLoading(true);
    try {
      const queryParams = query ? `?q=${encodeURIComponent(query)}` : '';
      const { data, error } = await supabase.functions.invoke(`options/genres${queryParams}`, {
        method: 'GET',
      });

      if (error) {
        console.error('Error searching genres:', error);
        return [];
      }

      return (data || []).map(item => ({
        label: item.name,
        value: item.id
      }));
    } catch (error) {
      console.error('Error searching genres:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createGenre = async (name: string): Promise<SelectOption> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('options/genres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name })
      });

      if (error) {
        console.error('Error creating genre:', error);
        throw error;
      }

      return {
        label: data.name,
        value: data.id
      };
    } catch (error) {
      console.error('Error creating genre:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    searchGenres,
    createGenre,
    loading,
  };
};