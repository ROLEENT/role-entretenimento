import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { webpush } from "npm:web-push@3.6.6";

interface PushNotificationPayload {
  title: string;
  body: string;
  userIds?: string[];
  eventId?: string;
  targetAll?: boolean;
  url?: string;
  campaignId?: string;
  notificationType?: string;
  city?: string;
  targetAudience?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload: PushNotificationPayload = await req.json();
    
    // Validações básicas
    if (!payload.title || !payload.body) {
      return new Response(
        JSON.stringify({ error: 'Title and body are required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('📧 Starting notification send process:', {
      campaignId: payload.campaignId,
      notificationType: payload.notificationType,
      targetAll: payload.targetAll,
      userIds: payload.userIds?.length,
      eventId: payload.eventId
    });

    const startTime = Date.now();
    let targetSubscriptions: any[] = [];

    // Buscar assinantes baseado nos critérios
    if (payload.targetAll) {
      const { data } = await supabase
        .from('push_subscriptions')
        .select('*');
      targetSubscriptions = data || [];
    } else if (payload.userIds && payload.userIds.length > 0) {
      const { data } = await supabase
        .from('push_subscriptions')
        .select('*')
        .in('user_id', payload.userIds);
      targetSubscriptions = data || [];
    } else if (payload.eventId) {
      const { data } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('event_id', payload.eventId);
      targetSubscriptions = data || [];
    }

    console.log(`🎯 Found ${targetSubscriptions.length} target subscriptions`);

    // Configurar VAPID
    webpush.setVapidDetails(
      'mailto:admin@example.com',
      Deno.env.get('VAPID_PUBLIC_KEY') ?? '',
      Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
    );

    let successCount = 0;
    let failureCount = 0;
    const notificationId = crypto.randomUUID();

    // Processar notificações em lotes para melhor performance
    const batchSize = 100;
    for (let i = 0; i < targetSubscriptions.length; i += batchSize) {
      const batch = targetSubscriptions.slice(i, i + batchSize);
      
      await Promise.allSettled(
        batch.map(async (sub) => {
          const sendStartTime = Date.now();
          let status = 'sent';
          let errorMessage = null;
          let deliveryTime = null;

          try {
            await webpush.sendNotification(
              sub.subscription,
              JSON.stringify({
                title: payload.title,
                body: payload.body,
                icon: '/icon-192x192.png',
                badge: '/icon-72x72.png',
                url: payload.url || '/',
                data: {
                  url: payload.url || '/',
                  notificationId,
                  eventId: payload.eventId,
                  campaignId: payload.campaignId,
                },
                actions: [
                  {
                    action: 'view',
                    title: 'Ver Detalhes',
                  }
                ]
              })
            );

            deliveryTime = Date.now() - sendStartTime;
            status = 'delivered';
            successCount++;
            
            console.log(`✅ Notification sent successfully to user ${sub.user_id}`);
          } catch (error) {
            failureCount++;
            status = 'failed';
            errorMessage = error.message;
            
            console.error(`❌ Failed to send notification to user ${sub.user_id}:`, error);

            // Remover assinatura inválida se necessário
            if (error.statusCode === 410 || error.statusCode === 404) {
              await supabase
                .from('push_subscriptions')
                .delete()
                .eq('id', sub.id);
              console.log(`🗑️ Removed invalid subscription for user ${sub.user_id}`);
            }
          }

          // Log detalhado para analytics
          await supabase.from('notification_logs').insert({
            notification_id: notificationId,
            user_id: sub.user_id,
            subscription_id: sub.id,
            notification_type: payload.notificationType || 'general',
            title: payload.title,
            message: payload.body,
            city: payload.city,
            target_audience: payload.targetAudience || 'all',
            status,
            delivery_time_ms: deliveryTime,
            error_message: errorMessage,
            event_id: payload.eventId,
            campaign_id: payload.campaignId
          });
        })
      );

      // Pequena pausa entre lotes para não sobrecarregar
      if (i + batchSize < targetSubscriptions.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const totalTime = Date.now() - startTime;

    // Atualizar métricas da campanha se fornecido campaignId
    if (payload.campaignId) {
      await supabase
        .from('notification_campaigns')
        .update({
          total_recipients: targetSubscriptions.length,
          total_sent: successCount,
          total_failed: failureCount,
          sent_at: new Date().toISOString(),
          status: 'sent'
        })
        .eq('id', payload.campaignId);
    }

    // Atualizar/criar métricas agregadas diárias
    const today = new Date().toISOString().split('T')[0];
    const { data: existingMetric } = await supabase
      .from('notification_analytics')
      .select('*')
      .eq('date', today)
      .eq('notification_type', payload.notificationType || 'general')
      .eq('city', payload.city || '')
      .single();

    if (existingMetric) {
      await supabase
        .from('notification_analytics')
        .update({
          total_sent: existingMetric.total_sent + successCount,
          total_delivered: existingMetric.total_delivered + successCount,
          total_failed: existingMetric.total_failed + failureCount,
          avg_delivery_time_ms: Math.round(
            (existingMetric.avg_delivery_time_ms + (totalTime / targetSubscriptions.length)) / 2
          )
        })
        .eq('id', existingMetric.id);
    } else {
      await supabase
        .from('notification_analytics')
        .insert({
          date: today,
          notification_type: payload.notificationType || 'general',
          city: payload.city || '',
          target_audience: payload.targetAudience || 'all',
          total_sent: successCount,
          total_delivered: successCount,
          total_failed: failureCount,
          avg_delivery_time_ms: Math.round(totalTime / targetSubscriptions.length)
        });
    }

    console.log(`📊 Notification process completed:`, {
      notificationId,
      totalTargets: targetSubscriptions.length,
      successCount,
      failureCount,
      totalTimeMs: totalTime,
      avgTimePerNotification: Math.round(totalTime / targetSubscriptions.length)
    });

    return new Response(
      JSON.stringify({
        success: true,
        notificationId,
        totalSent: successCount,
        totalFailed: failureCount,
        totalTargets: targetSubscriptions.length,
        executionTimeMs: totalTime
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('🚨 Error in send-push-notification function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});