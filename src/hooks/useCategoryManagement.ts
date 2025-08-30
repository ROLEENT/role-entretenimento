import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Category {
  id: string;
  name: string;
  slug: string;
  kind: 'revista' | 'agenda' | 'ambos';
  color: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export const useCategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch categories with admin privileges
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (fetchError) {
        throw fetchError;
      }

      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar categorias');
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  // Create category
  const createCategory = async (categoryData: Omit<Category, 'id' | 'created_at'>) => {
    try {
      if (!user?.email) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase.rpc('admin_manage_category', {
        p_admin_email: user.email,
        p_action: 'create',
        p_name: categoryData.name,
        p_slug: categoryData.slug,
        p_kind: categoryData.kind,
        p_description: categoryData.description,
        p_color: categoryData.color,
        p_is_active: categoryData.is_active
      });

      if (error) {
        throw error;
      }

      toast.success('Categoria criada com sucesso');
      await fetchCategories(); // Refresh list
      return data[0];
    } catch (err) {
      console.error('Error creating category:', err);
      toast.error('Erro ao criar categoria');
      throw err;
    }
  };

  // Update category
  const updateCategory = async (id: string, categoryData: Partial<Omit<Category, 'id' | 'created_at'>>) => {
    try {
      if (!user?.email) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase.rpc('admin_manage_category', {
        p_admin_email: user.email,
        p_action: 'update',
        p_category_id: id,
        p_name: categoryData.name,
        p_slug: categoryData.slug,
        p_kind: categoryData.kind,
        p_description: categoryData.description,
        p_color: categoryData.color,
        p_is_active: categoryData.is_active
      });

      if (error) {
        throw error;
      }

      toast.success('Categoria atualizada com sucesso');
      await fetchCategories(); // Refresh list
      return data[0];
    } catch (err) {
      console.error('Error updating category:', err);
      toast.error('Erro ao atualizar categoria');
      throw err;
    }
  };

  // Delete category (soft delete)
  const deleteCategory = async (id: string) => {
    try {
      if (!user?.email) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase.rpc('admin_manage_category', {
        p_admin_email: user.email,
        p_action: 'delete',
        p_category_id: id
      });

      if (error) {
        throw error;
      }

      toast.success('Categoria inativada com sucesso');
      await fetchCategories(); // Refresh list
      return data[0];
    } catch (err) {
      console.error('Error deleting category:', err);
      toast.error('Erro ao inativar categoria');
      throw err;
    }
  };

  // Get categories by kind
  const getCategoriesByKind = (kind: 'revista' | 'agenda' | 'ambos') => {
    return categories.filter(category => 
      category.is_active && (category.kind === kind || category.kind === 'ambos')
    );
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoriesByKind
  };
};