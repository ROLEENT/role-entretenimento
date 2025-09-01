import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  cityFilter?: string;
  categoryFilter?: string;
}

interface PushSubscription {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  city_pref?: string;
}

// Base64 URL decode function
function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// JWT creation for VAPID
async function createJWT(vapidPrivateKey: string, audience: string): Promise<string> {
  const header = {
    typ: 'JWT',
    alg: 'ES256'
  };

  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 3600,
    sub: 'mailto:admin@example.com'
  };

  const encoder = new TextEncoder();
  const headerBytes = encoder.encode(JSON.stringify(header));
  const payloadBytes = encoder.encode(JSON.stringify(payload));

  const headerB64 = btoa(String.fromCharCode(...headerBytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  const payloadB64 = btoa(String.fromCharCode(...payloadBytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const unsignedToken = `${headerB64}.${payloadB64}`;
  
  // Import VAPID private key
  const keyData = base64UrlDecode(vapidPrivateKey);
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    {
      name: 'ECDSA',
      namedCurve: 'P-256'
    },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    {
      name: 'ECDSA',
      hash: 'SHA-256'
    },
    cryptoKey,
    encoder.encode(unsignedToken)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `${unsignedToken}.${signatureB64}`;
}

async function sendPushNotification(
  subscription: PushSubscription, 
  payload: PushPayload,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const url = new URL(subscription.endpoint);
    const audience = `${url.protocol}//${url.host}`;
    
    const jwt = await createJWT(vapidPrivateKey, audience);
    
    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || '/',
      icon: '/favicon.png',
      badge: '/favicon.png'
    });

    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `vapid t=${jwt}, k=${vapidPublicKey}`,
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        'TTL': '86400'
      },
      body: notificationPayload
    });

    if (!response.ok) {
      throw new Error(`Push service error: ${response.status} ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Push notification error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;

    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { title, body, url, cityFilter, categoryFilter }: PushPayload = await req.json();

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: 'Title and body are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get filtered subscriptions
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .rpc('get_filtered_subscriptions', {
        p_city_filter: cityFilter || null,
        p_category_filter: categoryFilter || null
      });

    if (subscriptionsError) {
      throw subscriptionsError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No subscriptions found matching filters',
          sent: 0,
          failed: 0
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Send notifications
    const results = await Promise.allSettled(
      subscriptions.map((sub: PushSubscription) => 
        sendPushNotification(sub, { title, body, url, cityFilter, categoryFilter }, vapidPublicKey, vapidPrivateKey)
      )
    );

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    // Log results
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const subscription = subscriptions[i];
      
      if (result.status === 'fulfilled' && result.value.success) {
        sent++;
        // Log successful send
        await supabase.from('notification_logs').insert({
          subscription_id: subscription.id,
          title,
          body,
          url: url || null,
          city_filter: cityFilter || null,
          category_filter: categoryFilter || null,
          status: 'sent',
          sent_at: new Date().toISOString()
        });
      } else {
        failed++;
        const errorMsg = result.status === 'fulfilled' 
          ? result.value.error 
          : result.reason?.message || 'Unknown error';
        
        errors.push(errorMsg || 'Unknown error');
        
        // Log failed send
        await supabase.from('notification_logs').insert({
          subscription_id: subscription.id,
          title,
          body,
          url: url || null,
          city_filter: cityFilter || null,
          category_filter: categoryFilter || null,
          status: 'failed',
          error_message: errorMsg
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Push notifications processed',
        sent,
        failed,
        total: subscriptions.length,
        errors: errors.slice(0, 5) // Return first 5 errors only
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Send push notification error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});