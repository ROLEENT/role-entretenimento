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
      let queryBuilder = supabase
        .from('genres')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (query) {
        queryBuilder = queryBuilder.ilike('name', `%${query}%`);
      }

      const { data, error } = await queryBuilder.limit(50);

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
      // Generate slug from name
      const slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const { data, error } = await supabase
        .from('genres')
        .upsert({ name, slug, is_active: true }, { onConflict: 'slug' })
        .select('id, name')
        .single();

      if (error) {
        console.error('Error creating genre:', error);
        throw new Error(error.message || 'Failed to create genre');
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