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
      const response = await fetch(`/api/options/genres${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        console.error('Error searching genres:', response.statusText);
        return [];
      }

      const data = await response.json();
      return (data?.items || []).map((item: any) => ({
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
      const response = await fetch('/api/options/genres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error creating genre:', errorData);
        throw new Error(errorData.error || 'Failed to create genre');
      }

      const data = await response.json();
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