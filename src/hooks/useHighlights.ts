import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type CityEnum = 'porto_alegre' | 'florianopolis' | 'curitiba' | 'sao_paulo' | 'rio_de_janeiro';

interface Highlight {
  id: string;
  event_title: string;
  venue: string;
  event_date: string | null;
  image_url: string;
  city: CityEnum;
  photo_credit: string | null;
  ticket_url: string | null;
  like_count: number;
  role_text: string;
  selection_reasons: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
  is_published: boolean;
}

export const useHighlightsByCity = (city: CityEnum) => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('highlights')
          .select('*')
        .eq('city', city as any)
        .eq('is_published', true as any)
          .order('event_date', { ascending: false, nullsFirst: false })
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

      setHighlights((data as any) || []);
      } catch (err) {
        console.error('Error fetching highlights:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setHighlights([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHighlights();
  }, [city]);

  return { highlights, loading, error };
};

export const usePublishedHighlights = () => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('highlights')
          .select('*')
          .eq('is_published', true as any)
          .order('like_count', { ascending: false })
          .order('event_date', { ascending: false, nullsFirst: false })
          .order('sort_order', { ascending: true });

        if (fetchError) throw fetchError;

        setHighlights((data as any) || []);
      } catch (err) {
        console.error('Error fetching highlights:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setHighlights([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHighlights();
  }, []);

  return { highlights, loading, error };
};