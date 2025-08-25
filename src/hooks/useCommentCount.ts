import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCommentCount = (entityId: string, entityType: 'event' | 'highlight' | 'blog') => {
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        let query;
        
        switch (entityType) {
          case 'event':
            query = supabase
              .from('event_comments')
              .select('*', { count: 'exact', head: true })
              .eq('event_id', entityId);
            break;
          case 'highlight':
            query = supabase
              .from('highlight_comments')
              .select('*', { count: 'exact', head: true })
              .eq('highlight_id', entityId);
            break;
          case 'blog':
            query = supabase
              .from('blog_comments')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', entityId)
              .eq('is_approved', true);
            break;
          default:
            return;
        }

        const { count, error } = await query;
        
        if (error) {
          console.error('Error fetching comment count:', error);
          return;
        }
        
        setCommentCount(count || 0);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommentCount();

    // Subscribe to real-time changes
    const getTableName = () => {
      switch (entityType) {
        case 'event': return 'event_comments';
        case 'highlight': return 'highlight_comments';
        case 'blog': return 'blog_comments';
        default: return null;
      }
    };

    const tableName = getTableName();
    if (!tableName) return;

    const subscription = supabase
      .channel(`${tableName}_count_${entityId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: tableName,
        filter: `${entityType}_id=eq.${entityId}`
      }, () => {
        fetchCommentCount();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [entityId, entityType]);

  return { commentCount, loading };
};