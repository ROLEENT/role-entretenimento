import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OptionItem {
  id: string;
  name: string;
}

export const useArtistTypesOptions = () => {
  const [loading, setLoading] = useState(false);

  const searchArtistTypes = async (query: string): Promise<OptionItem[]> => {
    setLoading(true);
    try {
      const queryParams = query ? `?q=${encodeURIComponent(query)}` : '';
      const { data, error } = await supabase.functions.invoke(`options/artist-types${queryParams}`, {
        method: 'GET',
      });

      if (error) {
        console.error('Error searching artist types:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error searching artist types:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createArtistType = async (name: string): Promise<OptionItem | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('options/artist-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name })
      });

      if (error) {
        console.error('Error creating artist type:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating artist type:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    searchArtistTypes,
    createArtistType,
    loading,
  };
};