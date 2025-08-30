import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface VenueType {
  id: number;
  name: string;
  slug: string;
}

export function useVenueTypes() {
  const [venueTypes, setVenueTypes] = useState<VenueType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVenueTypes() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('venue_types')
          .select('id, name, slug')
          .order('name', { ascending: true });

        if (error) {
          throw error;
        }

        setVenueTypes(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar tipos de local');
      } finally {
        setLoading(false);
      }
    }

    fetchVenueTypes();
  }, []);

  return { venueTypes, loading, error };
}