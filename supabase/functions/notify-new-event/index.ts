import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewEventPayload {
  event_id: string;
  title: string;
  city: string;
  date_start: string;
  venue?: string;
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

    const { event_id, title, city, date_start, venue }: NewEventPayload = await req.json();

    console.log('Processing new event notification:', { event_id, title, city });

    // Buscar usuários que podem receber notificação de novos eventos na cidade
    const { data: eligibleUsers, error: usersError } = await supabase
      .rpc('can_receive_notification', { 
        p_user_id: '00000000-0000-0000-0000-000000000000', // dummy ID para teste inicial
        p_notification_type: 'new_events' 
      });

    if (usersError) {
      console.error('Error checking notification eligibility:', usersError);
      throw usersError;
    }

    // Buscar subscrições de push de usuários na cidade ou com interesse
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select(`
        *,
        profiles!inner(user_id, location, preferences_json)
      `)
      .or(`profiles.location.ilike.%${city}%`);

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      throw subError;
    }

    let notificationsSent = 0;
    let notificationsFailed = 0;

    // Enviar notificações para usuários elegíveis
    for (const subscription of subscriptions || []) {
      try {
        // Verificar se usuário pode receber notificação
        const { data: canReceive } = await supabase
          .rpc('can_receive_notification', {
            p_user_id: subscription.profiles?.user_id,
            p_notification_type: 'new_events'
          });

        if (!canReceive) {
          console.log(`User ${subscription.profiles?.user_id} cannot receive notification`);
          continue;
        }

        // Enviar notificação push
        const pushData = {
          title: `🎵 Novo evento em ${city}!`,
          body: `${title} ${venue ? `no ${venue}` : ''} - ${new Date(date_start).toLocaleDateString('pt-BR')}`,
          icon: '/favicon.png',
          badge: '/favicon.png',
          url: `/events/${event_id}`,
          data: {
            event_id,
            type: 'new_event',
            city
          }
        };

        const { error: pushError } = await supabase.functions.invoke('send-push-notification', {
          body: {
            title: pushData.title,
            body: pushData.body,
            userIds: [subscription.profiles?.user_id],
            url: pushData.url
          }
        });

        if (pushError) {
          console.error(`Failed to send push to user ${subscription.profiles?.user_id}:`, pushError);
          notificationsFailed++;
        } else {
          // Incrementar contador de notificações do usuário
          await supabase.rpc('increment_notification_count', {
            p_user_id: subscription.profiles?.user_id
          });
          
          notificationsSent++;
          console.log(`Push notification sent to user ${subscription.profiles?.user_id}`);
        }

      } catch (error) {
        console.error(`Error processing subscription ${subscription.id}:`, error);
        notificationsFailed++;
      }
    }

    console.log(`Notifications sent: ${notificationsSent}, failed: ${notificationsFailed}`);

    return new Response(JSON.stringify({ 
      success: true,
      sent: notificationsSent,
      failed: notificationsFailed
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in notify-new-event function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);