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
      let queryBuilder = supabase
        .from('artist_categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (query && query.trim()) {
        queryBuilder = queryBuilder.ilike('name', `%${query.trim()}%`);
      }

      const { data, error } = await queryBuilder;

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
      const cleanName = name.trim();
      if (!cleanName) {
        throw new Error('Nome da categoria não pode estar vazio');
      }

      // Generate slug from name
      const slug = cleanName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

      const { data, error } = await supabase
        .from('artist_categories')
        .insert({
          name: cleanName,
          slug: slug,
          is_active: true
        })
        .select('id, name')
        .single();

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