import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple rate limiter
const rateLimiter = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // 5 requests
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
  console.error(`[forms-contact] ${message}:`, {
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
    const requiredFields = ['name', 'email', 'message'];
    for (const field of requiredFields) {
      if (!body[field]) {
        logError('Missing required field', null, { field, body: { ...body, message: '[REDACTED]' } });
        return new Response(
          JSON.stringify({ ok: false, error: `Campo obrigatório: ${field}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
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

    // Message length validation
    if (body.message.length < 10) {
      logError('Message too short', null, { messageLength: body.message.length });
      return new Response(
        JSON.stringify({ ok: false, error: 'Mensagem deve ter pelo menos 10 caracteres' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Hash email for LGPD compliance
    const emailHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body.email));
    const emailHashHex = Array.from(new Uint8Array(emailHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Insert into database
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([{
        name: body.name,
        email_hash: emailHashHex,
        subject: body.subject || null,
        message: body.message,
        status: 'pending'
      }])
      .select();

    if (error) {
      logError('Database error', error, { body: { ...body, message: '[REDACTED]' } });
      return new Response(
        JSON.stringify({ ok: false, error: 'Erro interno do servidor' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send notification email (optional, only if RESEND_API_KEY is available)
    try {
      const resendKey = Deno.env.get('RESEND_API_KEY');
      if (resendKey) {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'ROLÊ <noreply@roleentretenimento.com>',
            to: ['contato@roleentretenimento.com'],
            subject: `Nova mensagem de contato: ${body.subject || 'Sem assunto'}`,
            html: `
              <h2>Nova mensagem de contato</h2>
              <p><strong>Nome:</strong> ${body.name}</p>
              <p><strong>Email:</strong> ${body.email}</p>
              <p><strong>Assunto:</strong> ${body.subject || 'Não informado'}</p>
              <p><strong>Mensagem:</strong></p>
              <p>${body.message}</p>
              <hr>
              <p><small>Acesse o painel admin para responder.</small></p>
            `,
          }),
        });

        if (!emailResponse.ok) {
          logError('Email notification failed', await emailResponse.text());
        }
      }
    } catch (emailError) {
      logError('Email notification error', emailError);
      // Don't fail the request if email fails
    }

    console.log(`[forms-contact] Success: New contact message from ${body.email}`);

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