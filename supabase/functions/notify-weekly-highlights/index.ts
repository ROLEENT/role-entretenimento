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

    console.log('Processing weekly highlights notification...');

    // Verificar se é segunda-feira entre 9h e 10h (horário de Brasília)
    const now = new Date();
    const brazilTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    const currentDay = brazilTime.getDay(); // 0 = domingo, 1 = segunda
    const currentHour = brazilTime.getHours();

    // Para testes, permitir qualquer dia/hora. Em produção, descomentar a validação abaixo:
    // if (currentDay !== 1 || currentHour < 9 || currentHour >= 10) {
    //   console.log('Not Monday 9AM Brazil time, skipping weekly highlights');
    //   return new Response(JSON.stringify({ success: true, skipped: true, reason: 'Not scheduled time' }), {
    //     headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    //   });
    // }

    // Buscar destaques da semana passada
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: weeklyHighlights, error: highlightsError } = await supabase
      .from('highlights')
      .select(`
        id,
        event_title,
        city,
        venue,
        event_date,
        image_url
      `)
      .eq('is_published', true)
      .gte('created_at', oneWeekAgo.toISOString())
      .order('sort_order', { ascending: true })
      .limit(5);

    if (highlightsError) {
      console.error('Error fetching weekly highlights:', highlightsError);
      throw highlightsError;
    }

    if (!weeklyHighlights || weeklyHighlights.length === 0) {
      console.log('No highlights found for this week');
      return new Response(JSON.stringify({ success: true, skipped: true, reason: 'No highlights' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Buscar todos os usuários que podem receber notificação semanal
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select(`
        user_id,
        subscription
      `);

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      throw subError;
    }

    let notificationsSent = 0;
    let notificationsFailed = 0;

    // Enviar notificações para usuários elegíveis
    for (const subscription of subscriptions || []) {
      try {
        // Verificar se usuário pode receber notificação semanal
        const { data: canReceive } = await supabase
          .rpc('can_receive_notification', {
            p_user_id: subscription.user_id,
            p_notification_type: 'weekly_highlights'
          });

        if (!canReceive) {
          console.log(`User ${subscription.user_id} cannot receive weekly highlights`);
          continue;
        }

        // Criar lista de cidades dos destaques
        const cities = [...new Set(weeklyHighlights.map(h => h.city))];
        const cityList = cities.length > 2 
          ? `${cities.slice(0, 2).join(', ')} e mais ${cities.length - 2}`
          : cities.join(' e ');

        // Enviar notificação push
        const pushData = {
          title: `🌟 Destaques da Semana no Rolê`,
          body: `${weeklyHighlights.length} eventos incríveis em ${cityList}. Confira agora!`,
          icon: '/favicon.png',
          badge: '/favicon.png',
          url: '/highlights',
          data: {
            type: 'weekly_highlights',
            highlights_count: weeklyHighlights.length,
            cities: cities
          }
        };

        const { error: pushError } = await supabase.functions.invoke('send-push-notification', {
          body: {
            title: pushData.title,
            body: pushData.body,
            userIds: [subscription.user_id],
            url: pushData.url
          }
        });

        if (pushError) {
          console.error(`Failed to send weekly highlights to user ${subscription.user_id}:`, pushError);
          notificationsFailed++;
        } else {
          // Incrementar contador de notificações do usuário
          await supabase.rpc('increment_notification_count', {
            p_user_id: subscription.user_id
          });
          
          notificationsSent++;
          console.log(`Weekly highlights sent to user ${subscription.user_id}`);
        }

      } catch (error) {
        console.error(`Error processing weekly highlight for user ${subscription.user_id}:`, error);
        notificationsFailed++;
      }
    }

    console.log(`Weekly highlights sent: ${notificationsSent}, failed: ${notificationsFailed}`);

    return new Response(JSON.stringify({ 
      success: true,
      highlights_count: weeklyHighlights.length,
      sent: notificationsSent,
      failed: notificationsFailed,
      cities: [...new Set(weeklyHighlights.map(h => h.city))]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in notify-weekly-highlights function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);