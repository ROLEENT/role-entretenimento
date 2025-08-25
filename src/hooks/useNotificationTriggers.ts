import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useNotificationTriggers = () => {
  const { user } = useAuth();

  // Trigger para novos eventos
  const triggerNewEventNotification = async (eventData: {
    event_id: string;
    title: string;
    city: string;
    date_start: string;
    venue?: string;
  }) => {
    try {
      const { error } = await supabase.functions.invoke('notify-new-event', {
        body: eventData
      });
      
      if (error) {
        console.error('Error triggering new event notification:', error);
      }
    } catch (error) {
      console.error('Error invoking new event notification:', error);
    }
  };

  // Trigger para resposta de comentário
  const triggerCommentReplyNotification = async (replyData: {
    parent_comment_id: string;
    replier_user_id: string;
    content: string;
    entity_type: 'event' | 'highlight';
    entity_id: string;
  }) => {
    try {
      const { error } = await supabase.functions.invoke('notify-comment-reply', {
        body: replyData
      });
      
      if (error) {
        console.error('Error triggering comment reply notification:', error);
      }
    } catch (error) {
      console.error('Error invoking comment reply notification:', error);
    }
  };

  // Trigger para destaques semanais (admin only)
  const triggerWeeklyHighlightsNotification = async () => {
    try {
      const { error } = await supabase.functions.invoke('notify-weekly-highlights', {
        body: {}
      });
      
      if (error) {
        console.error('Error triggering weekly highlights notification:', error);
      }
    } catch (error) {
      console.error('Error invoking weekly highlights notification:', error);
    }
  };

  // Configurar listeners para mudanças em tempo real
  useEffect(() => {
    if (!user) return;

    // Listener para novos eventos
    const eventsChannel = supabase
      .channel('new-events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'events'
        },
        (payload) => {
          console.log('New event detected:', payload.new);
          // Trigger automático para novos eventos
          if (payload.new && payload.new.status === 'active') {
            triggerNewEventNotification({
              event_id: payload.new.id,
              title: payload.new.title,
              city: payload.new.city,
              date_start: payload.new.date_start,
              venue: payload.new.venue
            });
          }
        }
      )
      .subscribe();

    // Listener para novos comentários de eventos
    const eventCommentsChannel = supabase
      .channel('event-comments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_comments'
        },
        (payload) => {
          console.log('New event comment:', payload.new);
          // Trigger automático para respostas se tem parent_id
          if (payload.new && payload.new.parent_id && payload.new.user_id !== user.id) {
            triggerCommentReplyNotification({
              parent_comment_id: payload.new.parent_id,
              replier_user_id: payload.new.user_id,
              content: payload.new.content,
              entity_type: 'event',
              entity_id: payload.new.event_id
            });
          }
        }
      )
      .subscribe();

    // Listener para novos comentários de highlights
    const highlightCommentsChannel = supabase
      .channel('highlight-comments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'highlight_comments'
        },
        (payload) => {
          console.log('New highlight comment:', payload.new);
          // Trigger automático para respostas se tem parent_id
          if (payload.new && payload.new.parent_id && payload.new.user_id !== user.id) {
            triggerCommentReplyNotification({
              parent_comment_id: payload.new.parent_id,
              replier_user_id: payload.new.user_id,
              content: payload.new.content,
              entity_type: 'highlight',
              entity_id: payload.new.highlight_id
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(eventsChannel);
      supabase.removeChannel(eventCommentsChannel);
      supabase.removeChannel(highlightCommentsChannel);
    };
  }, [user]);

  return {
    triggerNewEventNotification,
    triggerCommentReplyNotification,
    triggerWeeklyHighlightsNotification
  };
};