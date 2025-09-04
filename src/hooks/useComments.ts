import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseCommentsResult {
  data: any[];
  loading: boolean;
  error: Error | null;
  showComments: boolean;
}

export function useComments(eventId: string | null, session: any): UseCommentsResult {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    const fetchComments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data: commentsData, error: fetchError } = await supabase
          .from('blog_comments')
          .select('*')
          .eq('post_id', eventId)
          .eq('is_approved', true)
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        setData(commentsData || []);
      } catch (err) {
        setError(err as Error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [eventId]);

  // Regra: mostrar comentários só se API retornou OK, tem dados E usuário está logado
  const showComments = !error && data.length > 0 && session;

  return {
    data,
    loading,
    error,
    showComments
  };
}