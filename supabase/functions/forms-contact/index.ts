import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Schema de validação
const ContactSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório').max(100),
  email: z.string().email('Email inválido').max(255),
  subject: z.string().max(200).optional(),
  message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres').max(2000)
});

// Rate limiting simples em memória
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 3; // máximo 3 mensagens
const RATE_WINDOW = 10 * 60 * 1000; // 10 minutos

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
        JSON.stringify({ ok: false, error: 'Muitas mensagens. Tente novamente em 10 minutos.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const body = await req.json();
    
    // Validação com Zod
    const validationResult = ContactSchema.safeParse(body);
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

    const contactData = validationResult.data;

    // Hash do email para privacidade
    const emailHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(contactData.email.toLowerCase())
    );
    const emailHashHex = Array.from(new Uint8Array(emailHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Inserir na tabela contact_messages
    const { error } = await supabase
      .from('contact_messages')
      .insert({
        name: contactData.name,
        email_hash: emailHashHex,
        subject: contactData.subject || 'Mensagem do site',
        message: contactData.message,
        status: 'pending'
      });

    if (error) {
      console.error('Erro ao inserir mensagem de contato:', error);
      return new Response(
        JSON.stringify({ ok: false, error: 'Erro interno. Tente novamente.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Mensagem de contato recebida:', { 
      name: contactData.name, 
      subject: contactData.subject 
    });

    return new Response(
      JSON.stringify({ ok: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro no endpoint de contato:', error);
    return new Response(
      JSON.stringify({ ok: false, error: 'Erro interno. Tente novamente.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);