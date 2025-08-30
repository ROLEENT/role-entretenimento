import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple rate limiter
const rateLimiter = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 3; // 3 requests
const RATE_WINDOW = 60000; // per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const current = rateLimiter.get(ip);
  
  if (!current || now > current.resetTime) {
    rateLimiter.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (current.count >= RATE_LIMIT) {
    return false;
  }
  
  current.count++;
  return true;
}

function logError(message: string, error: any, context?: any) {
  console.error(`[forms-newsletter] ${message}:`, {
    error: error?.message || error,
    stack: error?.stack,
    context
  });
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ ok: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      logError('Rate limit exceeded', null, { ip });
      return new Response(
        JSON.stringify({ ok: false, error: 'Too many requests' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    
    // Validate required fields
    if (!body.email) {
      logError('Missing email', null, { body });
      return new Response(
        JSON.stringify({ ok: false, error: 'Email é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      logError('Invalid email format', null, { email: body.email });
      return new Response(
        JSON.stringify({ ok: false, error: 'Email inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Check if email already exists
    const { data: existing } = await supabase
      .from('newsletter_subscriptions')
      .select('id, status')
      .eq('email', body.email)
      .single();

    if (existing) {
      if (existing.status === 'confirmed') {
        return new Response(
          JSON.stringify({ ok: false, error: 'Este email já está inscrito' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Reactivate subscription
        const { error: updateError } = await supabase
          .from('newsletter_subscriptions')
          .update({ status: 'confirmed', updated_at: new Date().toISOString() })
          .eq('id', existing.id);

        if (updateError) {
          logError('Database update error', updateError, { email: body.email });
          return new Response(
            JSON.stringify({ ok: false, error: 'Erro interno do servidor' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`[forms-newsletter] Reactivated: ${body.email}`);
        return new Response(
          JSON.stringify({ ok: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Insert new subscription
    const { data, error } = await supabase
      .from('newsletter_subscriptions')
      .insert([{
        email: body.email,
        name: body.name || null,
        city: body.city || null,
        preferences: body.preferences || [],
        status: 'confirmed' // Direct confirmation for now
      }])
      .select();

    if (error) {
      logError('Database error', error, { email: body.email });
      return new Response(
        JSON.stringify({ ok: false, error: 'Erro interno do servidor' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[forms-newsletter] Success: New subscription ${body.email}`);

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logError('Unexpected error', error);
    return new Response(
      JSON.stringify({ ok: false, error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});