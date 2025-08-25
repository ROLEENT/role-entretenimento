import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useCommentNotifications = (entityId?: string, entityType?: 'event' | 'highlight' | 'blog') => {
  useEffect(() => {
    if (!entityId || !entityType) return;

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

    // Subscribe to new comments
    const subscription = supabase
      .channel(`${tableName}_notifications_${entityId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: tableName,
        filter: `${entityType === 'blog' ? 'post' : entityType}_id=eq.${entityId}`
      }, (payload) => {
        // Show notification for new comments
        const comment = payload.new as any;
        
        if (entityType === 'blog' && comment.is_approved) {
          toast.success('Novo comentário aprovado!', {
            description: `${comment.author_name} comentou no artigo`,
            duration: 5000,
          });
        } else if (entityType !== 'blog') {
          toast.success('Novo comentário!', {
            description: 'Alguém comentou nesta página',
            duration: 5000,
          });
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [entityId, entityType]);
};