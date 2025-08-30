import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Schema de validação
const ApplicationSchema = z.object({
  full_name: z.string().min(2, 'Nome completo é obrigatório').max(100),
  email: z.string().email('Email inválido').max(255),
  phone: z.string().max(20).optional(),
  portfolio_url: z.string().url('URL inválida').optional().or(z.literal('')),
  role: z.string().max(50).optional(),
  message: z.string().max(2000).optional(),
  lgpd_consent: z.boolean().refine(val => val === true, {
    message: 'Você deve aceitar os termos de privacidade'
  })
});

// Rate limiting simples em memória
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // máximo 5 tentativas
const RATE_WINDOW = 15 * 60 * 1000; // 15 minutos

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
        JSON.stringify({ ok: false, error: 'Muitas tentativas. Tente novamente em 15 minutos.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const body = await req.json();
    
    // Validação com Zod
    const validationResult = ApplicationSchema.safeParse(body);
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

    const applicationData = validationResult.data;

    // Inserir na tabela applications
    const { error } = await supabase
      .from('applications')
      .insert({
        full_name: applicationData.full_name,
        email: applicationData.email,
        phone: applicationData.phone || null,
        portfolio_url: applicationData.portfolio_url || null,
        role: applicationData.role || null,
        message: applicationData.message || null,
        lgpd_consent: applicationData.lgpd_consent,
        source: 'website',
        status: 'new'
      });

    if (error) {
      console.error('Erro ao inserir candidatura:', error);
      return new Response(
        JSON.stringify({ ok: false, error: 'Erro interno. Tente novamente.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Candidatura recebida:', { email: applicationData.email, role: applicationData.role });

    return new Response(
      JSON.stringify({ ok: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro no endpoint de candidatura:', error);
    return new Response(
      JSON.stringify({ ok: false, error: 'Erro interno. Tente novamente.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);