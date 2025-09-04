import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ComboboxAsyncOption } from '@/components/ui/combobox-async';
import { useDebounce } from '@/hooks/useDebounce';

export interface EntityLookupOptions {
  type: 'artists' | 'organizers' | 'venues';
  limit?: number;
}

export function useEntityLookup({ type, limit = 20 }: EntityLookupOptions) {
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState<Map<string, ComboboxAsyncOption[]>>(new Map());

  const searchEntities = useCallback(async (query: string): Promise<ComboboxAsyncOption[]> => {
    if (!query.trim()) return [];

    // Check cache first
    const cacheKey = `${type}-${query}`;
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!;
    }

    try {
      setLoading(true);
      
      // Call edge function using Supabase functions
      const { data: result, error } = await supabase.functions.invoke('lookup', {
        body: {
          type,
          q: query,
          limit,
        },
      });

      if (error) {
        console.error('Lookup error:', error);
        return [];
      }

      if (!result?.data) {
        return [];
      }

      const mappedData = result.data.map((item: any) => ({
        id: item.id,
        name: item.name || item.stage_name, // Handle both name and stage_name
        value: item.id,
        subtitle: getSubtitle(item, type),
      }));

      // Cache the result
      setCache(prev => new Map(prev.set(cacheKey, mappedData)));

      return mappedData;
    } catch (error) {
      console.error('Entity lookup error:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [type, limit, cache]);

  const getEntityById = async (id: string): Promise<ComboboxAsyncOption | null> => {
    try {
      let tableName = type;
      let selectFields = 'id, name, city';
      
      if (type === 'artists') {
        selectFields = 'id, stage_name, city';
      } else if (type === 'venues') {
        selectFields = 'id, name, city, address_line';
      }

      const { data, error } = await supabase
        .from(tableName)
        .select(selectFields)
        .eq('id', id)
        .maybeSingle() as { data: any, error: any };

      if (error) {
        console.error('Get entity by ID error:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      return {
        id: data.id,
        name: data.name || data.stage_name, // Handle both name and stage_name
        value: data.id,
        subtitle: getSubtitle(data, type),
      };
    } catch (error) {
      console.error('Get entity by ID error:', error);
      return null;
    }
  };

  return {
    searchEntities,
    getEntityById,
    loading,
  };
}

function getSubtitle(item: any, type: string): string | undefined {
  switch (type) {
    case 'venues':
      return item.address_line || item.city;
    case 'artists':
    case 'organizers':
      return item.city;
    default:
      return undefined;
  }
}