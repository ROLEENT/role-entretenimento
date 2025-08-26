import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewsletterSignupRequest {
  email: string;
  name?: string;
  city?: string;
  preferences?: {
    events?: boolean;
    highlights?: boolean;
    weekly?: boolean;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const { email, name, city, preferences }: NewsletterSignupRequest = await req.json();

    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Email válido é obrigatório" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate confirmation token
    const { data: tokenData, error: tokenError } = await supabase
      .rpc('generate_confirmation_token');

    if (tokenError) {
      console.error('Error generating token:', tokenError);
      return new Response(
        JSON.stringify({ error: "Erro interno do servidor" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const confirmationToken = tokenData;

    // Check if email already exists
    const { data: existingSubscriber, error: checkError } = await supabase
      .from('newsletter_subscribers')
      .select('email, status')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing subscriber:', checkError);
      return new Response(
        JSON.stringify({ error: "Erro interno do servidor" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (existingSubscriber) {
      if (existingSubscriber.status === 'confirmed') {
        return new Response(
          JSON.stringify({ message: "Este email já está confirmado na nossa newsletter!" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      // Update existing pending subscription
      const { error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({
          name,
          city,
          preferences: preferences || { events: true, highlights: true, weekly: true },
          confirmation_token: confirmationToken,
          subscribed_at: new Date().toISOString()
        })
        .eq('email', email);

      if (updateError) {
        console.error('Error updating subscriber:', updateError);
        return new Response(
          JSON.stringify({ error: "Erro ao atualizar inscrição" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    } else {
      // Insert new subscriber
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email,
          name,
          city,
          preferences: preferences || { events: true, highlights: true, weekly: true },
          confirmation_token: confirmationToken,
          status: 'pending'
        });

      if (insertError) {
        console.error('Error inserting subscriber:', insertError);
        return new Response(
          JSON.stringify({ error: "Erro ao criar inscrição" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Send confirmation email
    const confirmationUrl = `https://nutlcbnruabjsxecqpnd.supabase.co/functions/v1/newsletter-confirm?token=${confirmationToken}`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirme sua inscrição - ROLÊ</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #8B5CF6, #06B6D4);
              color: white;
              padding: 30px 20px;
              text-align: center;
              border-radius: 12px 12px 0 0;
            }
            .content {
              background: #fff;
              padding: 30px;
              border: 1px solid #e5e7eb;
              border-radius: 0 0 12px 12px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #8B5CF6, #06B6D4);
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              color: #6b7280;
              font-size: 14px;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Bem-vindo ao ROLÊ!</h1>
            <p>Confirme sua inscrição para receber os melhores eventos</p>
          </div>
          <div class="content">
            <p>Olá${name ? ` ${name}` : ''}! 👋</p>
            
            <p>Obrigado por se inscrever na newsletter do <strong>ROLÊ</strong>! Para começar a receber nossos destaques semanais com os melhores eventos culturais, clique no botão abaixo para confirmar sua inscrição:</p>
            
            <div style="text-align: center;">
              <a href="${confirmationUrl}" class="button">✅ Confirmar Inscrição</a>
            </div>
            
            <p><strong>O que você vai receber:</strong></p>
            <ul>
              <li>🎵 Destaques semanais dos melhores eventos</li>
              <li>🎭 Novos eventos na sua cidade</li>
              <li>🎪 Recomendações personalizadas</li>
              <li>🎨 Conteúdo exclusivo sobre cultura e entretenimento</li>
            </ul>
            
            <p>Este link de confirmação expira em 7 dias. Se você não solicitou esta inscrição, pode ignorar este email.</p>
          </div>
          <div class="footer">
            <p>ROLÊ - Descubra os melhores eventos da sua cidade</p>
          </div>
        </body>
      </html>
    `;

    const { error: emailError } = await resend.emails.send({
      from: "ROLÊ <newsletter@roleentretenimento.com>",
      to: [email],
      subject: "Confirme sua inscrição na newsletter do ROLÊ",
      html: emailHtml,
    });

    if (emailError) {
      console.error("Error sending confirmation email:", emailError);
      // Don't fail the request if email fails, subscription is still created
    }

    return new Response(
      JSON.stringify({ 
        message: "Inscrição realizada! Verifique seu email para confirmar.",
        requiresConfirmation: true 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in newsletter-signup function:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);