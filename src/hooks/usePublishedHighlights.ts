import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PublishedHighlight {
  id: string;
  city: 'porto_alegre' | 'sao_paulo' | 'rio_de_janeiro' | 'florianopolis' | 'curitiba';
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
  like_count: number;
  created_at: string;
  updated_at: string;
}

export const usePublishedHighlights = (limit?: number) => {
  const [highlights, setHighlights] = useState<PublishedHighlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHighlights = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('highlights')
        .select('*')
        .eq('is_published', true as any)
        .order('sort_order', { ascending: false })
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setHighlights((data as any) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar destaques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHighlights();
  }, [limit]);

  const refreshHighlights = () => {
    fetchHighlights();
  };

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '/placeholder.svg';
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    return `https://nutlcbnruabjsxecqpnd.supabase.co/storage/v1/object/public/highlights/${imageUrl}`;
  };

  const getCityDisplayName = (city: string) => {
    const cityNames: Record<string, string> = {
      'porto_alegre': 'Porto Alegre',
      'sao_paulo': 'São Paulo',
      'rio_de_janeiro': 'Rio de Janeiro',
      'florianopolis': 'Florianópolis',
      'curitiba': 'Curitiba'
    };
    return cityNames[city] || city;
  };

  return {
    highlights,
    loading,
    error,
    refreshHighlights,
    getImageUrl,
    getCityDisplayName
  };
};