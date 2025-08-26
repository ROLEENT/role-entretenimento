import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Token Inválido - ROLÊ</title>
            <style>
              body { 
                font-family: system-ui, sans-serif; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                min-height: 100vh; 
                margin: 0;
                background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
              }
              .container { 
                text-align: center; 
                background: white; 
                padding: 40px; 
                border-radius: 12px; 
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                max-width: 400px;
              }
              .error { color: #ef4444; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="error">❌ Token Inválido</h1>
              <p>O link de confirmação é inválido ou está corrompido.</p>
              <p>Tente se inscrever novamente.</p>
            </div>
          </body>
        </html>
      `, {
        headers: { "Content-Type": "text/html", ...corsHeaders }
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Confirm subscription using the database function
    const { data: confirmed, error: confirmError } = await supabase
      .rpc('confirm_newsletter_subscription', { p_token: token });

    if (confirmError) {
      console.error('Error confirming subscription:', confirmError);
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Erro - ROLÊ</title>
            <style>
              body { 
                font-family: system-ui, sans-serif; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                min-height: 100vh; 
                margin: 0;
                background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
              }
              .container { 
                text-align: center; 
                background: white; 
                padding: 40px; 
                border-radius: 12px; 
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                max-width: 400px;
              }
              .error { color: #ef4444; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="error">⚠️ Erro</h1>
              <p>Ocorreu um erro ao confirmar sua inscrição.</p>
              <p>Tente novamente mais tarde.</p>
            </div>
          </body>
        </html>
      `, {
        headers: { "Content-Type": "text/html", ...corsHeaders }
      });
    }

    if (!confirmed) {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Link Expirado - ROLÊ</title>
            <style>
              body { 
                font-family: system-ui, sans-serif; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                min-height: 100vh; 
                margin: 0;
                background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
              }
              .container { 
                text-align: center; 
                background: white; 
                padding: 40px; 
                border-radius: 12px; 
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                max-width: 400px;
              }
              .warning { color: #f59e0b; }
              .button {
                display: inline-block;
                background: linear-gradient(135deg, #8B5CF6, #06B6D4);
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 8px;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="warning">⏰ Link Expirado</h1>
              <p>Este link de confirmação expirou ou já foi usado.</p>
              <p>Inscreva-se novamente para receber um novo link.</p>
              <a href="/" class="button">Voltar ao ROLÊ</a>
            </div>
          </body>
        </html>
      `, {
        headers: { "Content-Type": "text/html", ...corsHeaders }
      });
    }

    // Success page
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Inscrição Confirmada - ROLÊ</title>
          <style>
            body { 
              font-family: system-ui, sans-serif; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              min-height: 100vh; 
              margin: 0;
              background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
            }
            .container { 
              text-align: center; 
              background: white; 
              padding: 40px; 
              border-radius: 12px; 
              box-shadow: 0 10px 25px rgba(0,0,0,0.1);
              max-width: 500px;
            }
            .success { color: #10b981; }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #8B5CF6, #06B6D4);
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              margin-top: 20px;
              font-weight: 600;
            }
            .features {
              text-align: left;
              margin: 20px 0;
              background: #f9fafb;
              padding: 20px;
              border-radius: 8px;
            }
            .features ul {
              margin: 0;
              padding-left: 20px;
            }
            .features li {
              margin-bottom: 8px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="success">🎉 Inscrição Confirmada!</h1>
            <p>Parabéns! Sua inscrição na newsletter do <strong>ROLÊ</strong> foi confirmada com sucesso.</p>
            
            <div class="features">
              <h3>O que você receberá:</h3>
              <ul>
                <li>🎵 Destaques semanais dos melhores eventos</li>
                <li>🎭 Novos eventos na sua cidade</li>
                <li>🎪 Recomendações personalizadas</li>
                <li>🎨 Conteúdo exclusivo sobre cultura</li>
              </ul>
            </div>
            
            <p>Agora você está pronto para descobrir os melhores eventos da sua cidade!</p>
            <a href="/" class="button">Explorar Eventos</a>
          </div>
        </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html", ...corsHeaders }
    });

  } catch (error: any) {
    console.error("Error in newsletter-confirm function:", error);
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Erro - ROLÊ</title>
          <style>
            body { 
              font-family: system-ui, sans-serif; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              min-height: 100vh; 
              margin: 0;
              background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
            }
            .container { 
              text-align: center; 
              background: white; 
              padding: 40px; 
              border-radius: 12px; 
              box-shadow: 0 10px 25px rgba(0,0,0,0.1);
              max-width: 400px;
            }
            .error { color: #ef4444; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">❌ Erro</h1>
            <p>Ocorreu um erro inesperado.</p>
            <p>Tente novamente mais tarde.</p>
          </div>
        </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html", ...corsHeaders }
    });
  }
};

serve(handler);