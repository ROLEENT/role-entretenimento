import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Schema de validação
const NewsletterSchema = z.object({
  email: z.string().email('Email inválido').max(255),
  name: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  preferences: z.array(z.string()).optional()
});

// Rate limiting simples em memória
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // máximo 5 tentativas
const RATE_WINDOW = 60 * 60 * 1000; // 1 hora

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const clientData = rateLimitMap.get(ip);
  
  if (!clientData || now > clientData.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (clientData.count >= RATE_LIMIT) {
    return false;
  }
  
  clientData.count++;
  return true;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ ok: false, error: 'Método não permitido' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Muitas tentativas. Tente novamente em 1 hora.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const body = await req.json();
    
    // Validação com Zod
    const validationResult = NewsletterSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: 'Dados inválidos',
          details: validationResult.error.issues.map(issue => issue.message)
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const newsletterData = validationResult.data;

    // Verificar se email já existe
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, status')
      .eq('email', newsletterData.email.toLowerCase())
      .single();

    if (existing) {
      if (existing.status === 'confirmed') {
        return new Response(
          JSON.stringify({ ok: false, error: 'Este email já está inscrito na newsletter.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Se existe mas não confirmado, atualizar
      const { error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({
          name: newsletterData.name || null,
          city: newsletterData.city || null,
          preferences: newsletterData.preferences || null,
          subscribed_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Erro ao atualizar subscriber:', updateError);
        return new Response(
          JSON.stringify({ ok: false, error: 'Erro interno. Tente novamente.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Criar novo subscriber
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email: newsletterData.email.toLowerCase(),
          name: newsletterData.name || null,
          city: newsletterData.city || null,
          preferences: newsletterData.preferences || null,
          status: 'pending',
          source: 'website'
        });

      if (insertError) {
        console.error('Erro ao inserir subscriber:', insertError);
        return new Response(
          JSON.stringify({ ok: false, error: 'Erro interno. Tente novamente.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('Newsletter signup:', { email: newsletterData.email, city: newsletterData.city });

    return new Response(
      JSON.stringify({ ok: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro no endpoint de newsletter:', error);
    return new Response(
      JSON.stringify({ ok: false, error: 'Erro interno. Tente novamente.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);