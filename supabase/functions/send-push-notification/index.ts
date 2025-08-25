import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PushNotificationPayload {
  eventId?: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  userIds?: string[];
  targetAll?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse request body
    const payload: PushNotificationPayload = await req.json();
    console.log('Push notification payload:', payload);

    const { eventId, title, body, icon, badge, data, userIds, targetAll } = payload;

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: 'Title and body are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Query subscriptions based on targeting
    let subscriptionsQuery = supabase
      .from('push_subscriptions')
      .select('subscription, user_id');

    if (userIds && userIds.length > 0) {
      // Target specific users
      subscriptionsQuery = subscriptionsQuery.in('user_id', userIds);
    } else if (eventId) {
      // Target users subscribed to specific event
      subscriptionsQuery = subscriptionsQuery.eq('event_id', eventId);
    } else if (!targetAll) {
      // Default: no targeting means no notifications
      return new Response(
        JSON.stringify({ error: 'Must specify userIds, eventId, or targetAll=true' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { data: subscriptions, error: subscriptionsError } = await subscriptionsQuery;

    if (subscriptionsError) {
      console.error('Error fetching subscriptions:', subscriptionsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subscriptions' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No subscriptions found for the specified criteria');
      return new Response(
        JSON.stringify({ 
          message: 'No active subscriptions found',
          sent: 0
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Found ${subscriptions.length} subscriptions`);

    // VAPID configuration
    const vapidSubject = 'mailto:contato@roleentretenimento.com';
    const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI6YrrfuLNJ-vNWEKOH3H8xqM2Gz-8dA4K9E4GBXqsXI7s1iKp6Zx8oC0I';
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY') || 'bFjw8uj7L5rDq9k6N4mS7pWc3hY2vX9zT1qA8uE5rI0';

    // Prepare notification payload
    const notificationPayload = {
      title,
      body,
      icon: icon || '/favicon.png',
      badge: badge || '/favicon.png',
      data: {
        url: eventId ? `/evento/${eventId}` : '/',
        eventId,
        timestamp: new Date().toISOString(),
        ...data
      },
      actions: [
        {
          action: 'view',
          title: 'Ver Evento'
        }
      ]
    };

    // Send push notifications
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const subscription of subscriptions) {
      try {
        const pushSubscription = subscription.subscription;
        
        // Import web-push dynamically
        const webpush = await import('https://esm.sh/web-push@3.6.6');
        
        // Set VAPID details
        webpush.setVapidDetails(
          vapidSubject,
          vapidPublicKey,
          vapidPrivateKey
        );

        // Send notification
        const result = await webpush.sendNotification(
          pushSubscription,
          JSON.stringify(notificationPayload)
        );

        console.log(`Notification sent successfully to user ${subscription.user_id}`);
        results.push({
          userId: subscription.user_id,
          success: true,
          status: result.statusCode
        });
        successCount++;

      } catch (error) {
        console.error(`Failed to send notification to user ${subscription.user_id}:`, error);
        
        // Remove invalid subscriptions
        if (error.statusCode === 410 || error.statusCode === 404) {
          console.log(`Removing invalid subscription for user ${subscription.user_id}`);
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', subscription.user_id)
            .eq('subscription', subscription.subscription);
        }

        results.push({
          userId: subscription.user_id,
          success: false,
          error: error.message
        });
        failureCount++;
      }
    }

    console.log(`Push notifications sent: ${successCount} successful, ${failureCount} failed`);

    return new Response(
      JSON.stringify({
        message: 'Push notifications processed',
        sent: successCount,
        failed: failureCount,
        total: subscriptions.length,
        details: results
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in push notification function:', error);
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
})