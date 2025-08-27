import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HighlightAdmin {
  id: string;
  city: string;
  event_title: string;
  venue: string;
  ticket_url: string | null;
  role_text: string;
  selection_reasons: string[];
  image_url: string;
  photo_credit: string | null;
  event_date: string | null;
  event_time?: string | null;
  ticket_price?: string | null;
  sort_order: number;
  is_published: boolean;
  like_count: number;
  created_at: string;
  updated_at: string;
}

export const useHighlightsAdmin = () => {
  const [highlights, setHighlights] = useState<HighlightAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHighlights = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('highlights')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const highlightsList = Array.isArray(data) ? data : [];
      setHighlights(highlightsList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar destaques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHighlights();
  }, []);

  const refreshHighlights = () => {
    fetchHighlights();
  };

  return {
    highlights,
    loading,
    error,
    refreshHighlights
  };
};