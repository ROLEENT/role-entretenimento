import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CategoryFormData {
  name: string;
  description: string;
  slug: string;
  color: string;
  type: 'general' | 'event' | 'blog';
}

export const useCategoryManagement = () => {
  const [loading, setLoading] = useState(false);

  const createCategory = useCallback(async (data: CategoryFormData) => {
    try {
      setLoading(true);
      
      const { data: category, error } = await supabase
        .from('categories')
        .insert({
          name: data.name,
          description: data.description || null,
          slug: data.slug,
          color: data.color,
          type: data.type
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Categoria criada com sucesso!');
      return category;
    } catch (error: any) {
      console.error('Error creating category:', error);
      toast.error(error.message || 'Erro ao criar categoria');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (categoryId: string, data: CategoryFormData) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('categories')
        .update({
          name: data.name,
          description: data.description || null,
          slug: data.slug,
          color: data.color,
          type: data.type
        })
        .eq('id', categoryId);

      if (error) throw error;
      
      toast.success('Categoria atualizada com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast.error(error.message || 'Erro ao atualizar categoria');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCategories = useCallback(async (type?: string) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('categories')
        .select('*')
        .order('name');

      if (type && type !== 'all') {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast.error(error.message || 'Erro ao carregar categorias');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (categoryId: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
      
      toast.success('Categoria removida com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(error.message || 'Erro ao remover categoria');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    createCategory,
    updateCategory,
    getCategories,
    deleteCategory
  };
};