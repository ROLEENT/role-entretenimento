import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OptionItem {
  id: string;
  name: string;
}

export const useGenresOptions = () => {
  const [loading, setLoading] = useState(false);

  const searchGenres = async (query: string): Promise<OptionItem[]> => {
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

      return data || [];
    } catch (error) {
      console.error('Error searching genres:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createGenre = async (name: string): Promise<OptionItem | null> => {
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
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating genre:', error);
      return null;
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