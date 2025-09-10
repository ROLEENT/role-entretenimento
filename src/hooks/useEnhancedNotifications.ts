import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAnimatedToast } from './useAnimatedToast';
import { useAuth } from './useAuth';

interface NotificationConfig {
  entityId: string;
  entityType: 'event' | 'highlight' | 'blog';
  userId?: string;
}

export const useEnhancedNotifications = ({ entityId, entityType, userId }: NotificationConfig) => {
  const { showAnimatedToast } = useAnimatedToast();
  const { user } = useAuth();

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

    // Subscribe to new comments with enhanced notifications
    const subscription = supabase
      .channel(`enhanced_${tableName}_notifications_${entityId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: tableName,
        filter: `${entityType === 'blog' ? 'post' : entityType}_id=eq.${entityId}`
      }, (payload) => {
        const comment = payload.new as any;
        
        // Don't show notification for own comments
        if (comment.user_id === user?.id) return;
        
        if (entityType === 'event') {
          showAnimatedToast({
            title: 'Alguém comentou no rolê! 💬',
            description: 'Confira o que estão falando sobre este evento',
            icon: 'share',
            duration: 5000,
          });
        } else if (entityType === 'highlight') {
          showAnimatedToast({
            title: 'Novo comentário! 💭',
            description: 'Alguém comentou neste destaque',
            icon: 'share',
            duration: 5000,
          });
        } else if (entityType === 'blog' && comment.is_approved) {
          showAnimatedToast({
            title: 'Novo comentário aprovado! 🎉',
            description: `${comment.author_name} comentou no artigo`,
            icon: 'success',
            duration: 5000,
          });
        }
      })
      .subscribe();

    // Subscribe to likes and reactions for events
    if (entityType === 'event') {
      const likesChannel = supabase
        .channel(`event_likes_${entityId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'event_likes',
          filter: `event_id=eq.${entityId}`
        }, (payload) => {
          const like = payload.new as any;
          if (like.user_id === user?.id) return;
          
          showAnimatedToast({
            title: 'Alguém curtiu o rolê! ❤️',
            description: 'Seu evento está fazendo sucesso',
            icon: 'heart',
            duration: 3000,
          });
        })
        .subscribe();

      const reactionsChannel = supabase
        .channel(`event_reactions_${entityId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'event_reactions',
          filter: `event_id=eq.${entityId}`
        }, (payload) => {
          const reaction = payload.new as any;
          if (reaction.user_id === user?.id) return;
          
          const reactionTexts = {
            going: 'Alguém vai participar! 🎉',
            interested: 'Alguém se interessou! 🤔',
            maybe: 'Alguém está pensando... 🤷',
            not_going: 'Feedback recebido 📝'
          };
          
          showAnimatedToast({
            title: reactionTexts[reaction.reaction_type as keyof typeof reactionTexts] || 'Nova reação!',
            description: 'O público está reagindo ao seu evento',
            icon: 'star',
            duration: 3000,
          });
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
        supabase.removeChannel(likesChannel);
        supabase.removeChannel(reactionsChannel);
      };
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [entityId, entityType, user?.id, showAnimatedToast]);
};