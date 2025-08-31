import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
};

interface HealthCheckResult {
  ok: boolean;
  timestamp: string;
  checks: {
    database: boolean;
    supabase_config: boolean;
    edge_function: boolean;
  };
  data?: any;
  error?: string;
  version?: string;
}

Deno.serve(async (req) => {
  console.log(`[health-check] ${req.method} ${req.url}`);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const timestamp = new Date().toISOString();
  const result: HealthCheckResult = {
    ok: false,
    timestamp,
    checks: {
      database: false,
      supabase_config: false,
      edge_function: true, // Se chegou aqui, edge function está ok
    },
    version: '1.0.0'
  };

  try {
    // Verificar configuração do Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      result.error = 'Configuração do Supabase incompleta';
      result.checks.supabase_config = false;
      return new Response(
        JSON.stringify(result),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    result.checks.supabase_config = true;

    // Testar conexão com o banco
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fazer uma query simples para testar conectividade
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, created_at')
      .limit(1);

    if (error) {
      console.error('[health-check] Database error:', error);
      result.error = `Erro no banco: ${error.message}`;
      result.checks.database = false;
      return new Response(
        JSON.stringify(result),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    result.checks.database = true;
    result.ok = true;
    result.data = {
      posts_available: Array.isArray(data) ? data.length > 0 : false,
      sample_post: data?.[0] || null,
      environment: {
        deno_version: Deno.version.deno,
        typescript_version: Deno.version.typescript,
      }
    };

    console.log('[health-check] All checks passed');

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (e) {
    console.error('[health-check] Fatal error:', e);
    result.error = `Erro fatal: ${e instanceof Error ? e.message : String(e)}`;
    
    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});