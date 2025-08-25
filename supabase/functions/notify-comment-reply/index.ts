import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CommentReplyPayload {
  parent_comment_id: string;
  replier_user_id: string;
  content: string;
  entity_type: 'event' | 'highlight';
  entity_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { parent_comment_id, replier_user_id, content, entity_type, entity_id }: CommentReplyPayload = await req.json();

    console.log('Processing comment reply notification:', { parent_comment_id, entity_type, entity_id });

    // Buscar o comentário pai e seu autor
    let parentComment;
    let entityTitle = '';

    if (entity_type === 'event') {
      const { data: comment, error: commentError } = await supabase
        .from('event_comments')
        .select(`
          user_id,
          content,
          events(title)
        `)
        .eq('id', parent_comment_id)
        .single();

      if (commentError) {
        console.error('Error fetching parent comment:', commentError);
        throw commentError;
      }

      parentComment = comment;
      entityTitle = comment.events?.title || 'evento';
    } else {
      const { data: comment, error: commentError } = await supabase
        .from('highlight_comments')
        .select(`
          user_id,
          content,
          highlights(event_title)
        `)
        .eq('id', parent_comment_id)
        .single();

      if (commentError) {
        console.error('Error fetching parent comment:', commentError);
        throw commentError;
      }

      parentComment = comment;
      entityTitle = comment.highlights?.event_title || 'destaque';
    }

    // Não notificar se o usuário está respondendo o próprio comentário
    if (parentComment.user_id === replier_user_id) {
      console.log('User replying to own comment, skipping notification');
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verificar se usuário pode receber notificação
    const { data: canReceive } = await supabase
      .rpc('can_receive_notification', {
        p_user_id: parentComment.user_id,
        p_notification_type: 'comment_replies'
      });

    if (!canReceive) {
      console.log(`User ${parentComment.user_id} cannot receive reply notification`);
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Buscar nome do usuário que respondeu
    const { data: replierProfile } = await supabase
      .from('profiles')
      .select('display_name, username')
      .eq('user_id', replier_user_id)
      .single();

    const replierName = replierProfile?.display_name || replierProfile?.username || 'Usuário';

    // Enviar notificação push
    const pushData = {
      title: `💬 ${replierName} respondeu seu comentário`,
      body: `"${content.slice(0, 80)}${content.length > 80 ? '...' : ''}" em ${entityTitle}`,
      icon: '/favicon.png',
      badge: '/favicon.png',
      url: `/${entity_type === 'event' ? 'events' : 'highlights'}/${entity_id}`,
      data: {
        entity_id,
        entity_type,
        comment_id: parent_comment_id,
        type: 'comment_reply'
      }
    };

    const { error: pushError } = await supabase.functions.invoke('send-push-notification', {
      body: {
        title: pushData.title,
        body: pushData.body,
        userIds: [parentComment.user_id],
        url: pushData.url
      }
    });

    if (pushError) {
      console.error(`Failed to send reply notification:`, pushError);
      throw pushError;
    }

    // Incrementar contador de notificações do usuário
    await supabase.rpc('increment_notification_count', {
      p_user_id: parentComment.user_id
    });

    console.log(`Reply notification sent to user ${parentComment.user_id}`);

    return new Response(JSON.stringify({ 
      success: true,
      sent: 1,
      recipient: parentComment.user_id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in notify-comment-reply function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);