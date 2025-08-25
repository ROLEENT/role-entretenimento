import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  userIds?: string[];
  eventId?: string;
  targetAll?: boolean;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const payload: PushNotificationPayload = await req.json();

    if (!payload.title || !payload.body) {
      return new Response(
        JSON.stringify({ error: 'Title and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar subscrições baseado no target
    let query = supabase.from('push_subscriptions').select('*');

    if (payload.userIds?.length) {
      query = query.in('user_id', payload.userIds);
    } else if (payload.eventId) {
      query = query.eq('event_id', payload.eventId);
    } else if (!payload.targetAll) {
      return new Response(
        JSON.stringify({ error: 'Must specify userIds, eventId, or targetAll' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: subscriptions, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching subscriptions:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subscriptions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No subscriptions found', sent: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Configurar VAPID (Web Push)
    const vapidDetails = {
      subject: 'mailto:admin@roleentretenimento.com',
      publicKey: Deno.env.get('VAPID_PUBLIC_KEY') || '',
      privateKey: Deno.env.get('VAPID_PRIVATE_KEY') || '',
    };

    const webpush = await import('npm:web-push@3.6.6');
    webpush.setVapidDetails(vapidDetails.subject, vapidDetails.publicKey, vapidDetails.privateKey);

    let successCount = 0;
    let failureCount = 0;

    // Enviar notificações
    for (const subscription of subscriptions) {
      try {
        const notificationPayload = JSON.stringify({
          title: payload.title,
          body: payload.body,
          icon: payload.icon || '/favicon.png',
          badge: payload.badge || '/favicon.png',
          data: {
            url: payload.url || '/',
            eventId: payload.eventId,
          },
        });

        await webpush.sendNotification(
          subscription.subscription,
          notificationPayload
        );

        successCount++;
      } catch (error: any) {
        console.error(`Failed to send to subscription ${subscription.id}:`, error);
        failureCount++;

        // Se a subscrição é inválida, removê-la
        if (error.statusCode === 410 || error.statusCode === 404) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('id', subscription.id);
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Push notifications sent',
        sent: successCount,
        failed: failureCount,
        total: subscriptions.length,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-push-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});