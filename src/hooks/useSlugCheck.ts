import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SlugCheckOptions {
  table: 'artists' | 'organizers' | 'venues';
  excludeId?: string;
  debounceMs?: number;
}

export function useSlugCheck({ table, excludeId, debounceMs = 500 }: SlugCheckOptions) {
  const [checking, setChecking] = useState(false);
  const [lastCheckedSlug, setLastCheckedSlug] = useState<string>('');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const checkSlug = async (slug: string): Promise<{ available: boolean; exists: boolean }> => {
    if (!slug.trim()) {
      setIsAvailable(null);
      return { available: true, exists: false };
    }

    if (slug === lastCheckedSlug) {
      return { available: isAvailable || false, exists: !isAvailable };
    }

    try {
      setChecking(true);
      setLastCheckedSlug(slug);

      const requestBody = {
        table,
        slug: slug.trim(),
        ...(excludeId && { excludeId }),
      };

      // Call edge function using Supabase functions
      const { data, error } = await supabase.functions.invoke('slug-check', {
        body: requestBody,
      });

      if (error) {
        console.error('Slug check error:', error);
        setIsAvailable(null);
        return { available: false, exists: true };
      }

      const available = data?.available || false;
      setIsAvailable(available);
      
      return {
        available,
        exists: data?.exists || false,
      };
    } catch (error) {
      console.error('Slug check error:', error);
      setIsAvailable(null);
      return { available: false, exists: true };
    } finally {
      setChecking(false);
    }
  };

  return {
    checkSlug,
    checking,
    isAvailable,
    lastCheckedSlug,
  };
}