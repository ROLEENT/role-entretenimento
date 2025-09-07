import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { useAdminSession } from '@/hooks/useAdminSession';

interface SlugCheckResult {
  available: boolean;
  loading: boolean;
  error: string | null;
}

export const useSlugValidation = (table: 'agenda_itens' | 'artists' | 'venues' | 'organizers' | 'blog_posts') => {
  const { adminEmail } = useAdminSession();
  const [result, setResult] = useState<SlugCheckResult>({
    available: true,
    loading: false,
    error: null
  });

  const checkSlug = useCallback(async (slug: string, excludeId?: string) => {
    if (!slug || slug.length < 3) {
      setResult({ available: false, loading: false, error: null });
      return;
    }

    setResult({ available: true, loading: true, error: null });

    try {
      // Use admin client if available, otherwise regular client
      const client = adminEmail ? createAdminClient(adminEmail) : supabase;
      
      let query = client
        .from(table)
        .select('id')
        .eq('slug', slug)
        .limit(1);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Slug check error:', error);
        setResult({ 
          available: false, 
          loading: false, 
          error: 'Erro ao verificar slug' 
        });
        return;
      }

      const available = !data || data.length === 0;
      setResult({ 
        available, 
        loading: false, 
        error: null 
      });

    } catch (error) {
      console.error('Slug validation error:', error);
      setResult({ 
        available: false, 
        loading: false, 
        error: 'Erro na verificação' 
      });
    }
  }, [table, adminEmail]);

  const generateSlug = useCallback((text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }, []);

  return {
    ...result,
    checkSlug,
    generateSlug
  };
};