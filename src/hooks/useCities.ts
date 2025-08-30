import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface City {
  id: number;
  name: string;
  uf: string;
  slug: string;
}

export function useCities() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCities() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('cities')
          .select('id, name, uf, slug')
          .order('name', { ascending: true });

        if (error) {
          throw error;
        }

        setCities(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar cidades');
      } finally {
        setLoading(false);
      }
    }

    fetchCities();
  }, []);

  return { cities, loading, error };
}