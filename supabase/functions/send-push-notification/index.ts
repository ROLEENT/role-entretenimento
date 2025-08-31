import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  badge?: string;
  icon?: string;
}

interface RequestBody {
  admin_email: string;
  notification: NotificationPayload;
  target_emails?: string[]; // Para envio específico
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { admin_email, notification, target_emails }: RequestBody = await req.json();

    console.log('Sending push notification:', { admin_email, notification, target_emails });

    // Verify admin
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', admin_email)
      .eq('is_active', true)
      .single();

    if (adminError || !adminUser) {
      console.error('Admin verification failed:', adminError);
      return new Response(
        JSON.stringify({ error: 'Admin não autorizado' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get subscriptions
    let query = supabase
      .from('admin_push_subscriptions')
      .select('*')
      .eq('is_active', true);

    // Filter by target emails if specified
    if (target_emails && target_emails.length > 0) {
      query = query.in('admin_email', target_emails);
    }

    const { data: subscriptions, error: subsError } = await query;

    if (subsError) {
      console.error('Error fetching subscriptions:', subsError);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar assinantes' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No active subscriptions found');
      return new Response(
        JSON.stringify({ message: 'Nenhum assinante ativo encontrado', sent_count: 0 }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Found ${subscriptions.length} active subscriptions`);

    // Prepare notification payload
    const notificationPayload = {
      title: notification.title,
      body: notification.body,
      icon: notification.icon || '/favicon.ico',
      badge: notification.badge || '/favicon.ico',
      data: {
        url: notification.url || '/',
        timestamp: Date.now()
      },
      requireInteraction: true,
      tag: `admin-notification-${Date.now()}`
    };

    // Send notifications
    const sendPromises = subscriptions.map(async (subscription) => {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        };

        // Use Web Push API
        const response = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': `key=${vapidPrivateKey}`,
            'Content-Type': 'application/json',
            'TTL': '86400'
          },
          body: JSON.stringify({
            to: subscription.endpoint.split('/').pop(),
            notification: notificationPayload,
            data: notificationPayload.data
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to send to ${subscription.admin_email}:`, errorText);
          
          // If subscription is invalid, mark as inactive
          if (response.status === 410) {
            await supabase
              .from('admin_push_subscriptions')
              .update({ is_active: false })
              .eq('id', subscription.id);
          }
          
          return { success: false, email: subscription.admin_email, error: errorText };
        }

        console.log(`Notification sent successfully to ${subscription.admin_email}`);
        return { success: true, email: subscription.admin_email };
      } catch (error) {
        console.error(`Error sending to ${subscription.admin_email}:`, error);
        return { success: false, email: subscription.admin_email, error: error.message };
      }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter(r => r.success).length;
    const failures = results.filter(r => !r.success);

    console.log(`Sent ${successCount}/${subscriptions.length} notifications successfully`);
    
    if (failures.length > 0) {
      console.error('Failed notifications:', failures);
    }

    // Log notification sent
    await supabase
      .from('system_logs')
      .insert({
        level: 'info',
        message: `Push notification sent to ${successCount} admin(s): ${notification.title}`,
        module: 'push_notifications',
        metadata: {
          sender: admin_email,
          notification: notification,
          sent_count: successCount,
          failed_count: failures.length,
          target_emails: target_emails
        }
      });

    return new Response(
      JSON.stringify({ 
        message: `Notificação enviada para ${successCount} assinante(s)`,
        sent_count: successCount,
        failed_count: failures.length,
        failures: failures.length > 0 ? failures : undefined
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in send-push-notification function:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})