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
              <p>O link de descadastro é inválido ou está corrompido.</p>
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

    // Unsubscribe using the database function
    const { data: unsubscribed, error: unsubscribeError } = await supabase
      .rpc('unsubscribe_newsletter', { p_token: token });

    if (unsubscribeError) {
      console.error('Error unsubscribing:', unsubscribeError);
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
              <p>Ocorreu um erro ao processar seu descadastro.</p>
              <p>Tente novamente mais tarde.</p>
            </div>
          </body>
        </html>
      `, {
        headers: { "Content-Type": "text/html", ...corsHeaders }
      });
    }

    if (!unsubscribed) {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Link Inválido - ROLÊ</title>
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
              <h1 class="warning">⚠️ Link Inválido</h1>
              <p>Este link de descadastro não é válido ou você já foi descadastrado.</p>
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
          <title>Descadastro Realizado - ROLÊ</title>
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
            .feedback {
              background: #f9fafb;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="success">✅ Descadastro Realizado</h1>
            <p>Sua inscrição na newsletter do <strong>ROLÊ</strong> foi cancelada com sucesso.</p>
            
            <div class="feedback">
              <p><strong>Sentiremos sua falta!</strong> 😢</p>
              <p>Você não receberá mais nossos emails, mas pode sempre se inscrever novamente quando quiser.</p>
            </div>
            
            <p>Continue explorando os melhores eventos da sua cidade no nosso site!</p>
            <a href="/" class="button">Explorar Eventos</a>
          </div>
        </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html", ...corsHeaders }
    });

  } catch (error: any) {
    console.error("Error in newsletter-unsubscribe function:", error);
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