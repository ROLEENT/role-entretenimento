import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Processing event reminders...');

    // Buscar eventos que começam em 1 hora
    const oneHourFromNow = new Date();
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);
    
    const startTime = new Date(oneHourFromNow.getTime() - 15 * 60 * 1000); // 15min antes
    const endTime = new Date(oneHourFromNow.getTime() + 15 * 60 * 1000);   // 15min depois

    const { data: upcomingEvents, error: eventsError } = await supabase
      .from('events')
      .select(`
        id,
        title,
        date_start,
        city,
        venues(name)
      `)
      .gte('date_start', startTime.toISOString())
      .lte('date_start', endTime.toISOString())
      .eq('status', 'active');

    if (eventsError) {
      console.error('Error fetching upcoming events:', eventsError);
      throw eventsError;
    }

    if (!upcomingEvents || upcomingEvents.length === 0) {
      console.log('No upcoming events found');
      return new Response(JSON.stringify({ success: true, processed: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let totalNotificationsSent = 0;
    let totalNotificationsFailed = 0;

    // Processar cada evento
    for (const event of upcomingEvents) {
      console.log(`Processing reminders for event: ${event.title}`);

      // Buscar usuários que favoritaram este evento
      const { data: favorites, error: favError } = await supabase
        .from('event_favorites')
        .select(`
          user_id,
          push_subscriptions!inner(*)
        `)
        .eq('event_id', event.id);

      if (favError) {
        console.error(`Error fetching favorites for event ${event.id}:`, favError);
        continue;
      }

      // Enviar lembretes para cada usuário
      for (const favorite of favorites || []) {
        try {
          // Verificar se usuário pode receber notificação
          const { data: canReceive } = await supabase
            .rpc('can_receive_notification', {
              p_user_id: favorite.user_id,
              p_notification_type: 'event_reminders'
            });

          if (!canReceive) {
            console.log(`User ${favorite.user_id} cannot receive reminder`);
            continue;
          }

          // Enviar notificação push
          const pushData = {
            title: `⏰ Lembrete: ${event.title}`,
            body: `Seu evento começa em 1 hora! ${event.venues?.name ? `Local: ${event.venues.name}` : ''}`,
            icon: '/favicon.png',
            badge: '/favicon.png',
            url: `/events/${event.id}`,
            data: {
              event_id: event.id,
              type: 'event_reminder'
            }
          };

          const { error: pushError } = await supabase.functions.invoke('send-push-notification', {
            body: {
              title: pushData.title,
              body: pushData.body,
              userIds: [favorite.user_id],
              url: pushData.url
            }
          });

          if (pushError) {
            console.error(`Failed to send reminder to user ${favorite.user_id}:`, pushError);
            totalNotificationsFailed++;
          } else {
            // Incrementar contador de notificações do usuário
            await supabase.rpc('increment_notification_count', {
              p_user_id: favorite.user_id
            });
            
            totalNotificationsSent++;
            console.log(`Reminder sent to user ${favorite.user_id} for event ${event.title}`);
          }

        } catch (error) {
          console.error(`Error processing reminder for user ${favorite.user_id}:`, error);
          totalNotificationsFailed++;
        }
      }
    }

    console.log(`Total reminders sent: ${totalNotificationsSent}, failed: ${totalNotificationsFailed}`);

    return new Response(JSON.stringify({ 
      success: true,
      events_processed: upcomingEvents.length,
      sent: totalNotificationsSent,
      failed: totalNotificationsFailed
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in notify-event-reminder function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);