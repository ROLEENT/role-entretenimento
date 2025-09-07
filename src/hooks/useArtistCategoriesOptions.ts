import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SelectOption {
  label: string;
  value: string;
}

export const useArtistCategoriesOptions = () => {
  const [loading, setLoading] = useState(false);

  const searchArtistCategories = async (query: string): Promise<SelectOption[]> => {
    setLoading(true);
    try {
      const queryParams = query ? `?q=${encodeURIComponent(query)}` : '';
      const { data, error } = await supabase.functions.invoke(`options/artist-categories${queryParams}`, {
        method: 'GET',
      });

      if (error) {
        console.error('Error searching artist categories:', error);
        return [];
      }

      return (data || []).map(item => ({
        label: item.name,
        value: item.id
      }));
    } catch (error) {
      console.error('Error searching artist categories:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createArtistCategory = async (name: string): Promise<SelectOption> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('options/artist-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name })
      });

      if (error) {
        console.error('Error creating artist category:', error);
        throw error;
      }

      return {
        label: data.name,
        value: data.id
      };
    } catch (error) {
      console.error('Error creating artist category:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    searchArtistCategories,
    createArtistCategory,
    loading,
  };
};