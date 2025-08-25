import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailRequest {
  type: 'signup' | 'password-reset' | 'magic-link';
  email: string;
  confirmUrl?: string;
  resetUrl?: string;
  magicLink?: string;
  displayName?: string;
}

const getEmailTemplate = (type: string, data: any) => {
  const baseStyles = `
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
  `;

  switch (type) {
    case 'signup':
      return `
        <html>
          <head><style>${baseStyles}</style></head>
          <body>
            <div style="padding: 40px 20px;">
              <div class="container">
                <div class="header">
                  <h1>🎉 Bem-vindo ao ROLÊ!</h1>
                </div>
                <div class="content">
                  <h2>Olá ${data.displayName || 'novo usuário'}!</h2>
                  <p>Ficamos muito felizes em ter você conosco! Para completar seu cadastro, clique no botão abaixo para confirmar seu email:</p>
                  <a href="${data.confirmUrl}" class="button">Confirmar Email</a>
                  <p>Após confirmar, você poderá:</p>
                  <ul>
                    <li>💖 Favoritar eventos</li>
                    <li>🔔 Receber recomendações personalizadas</li>
                    <li>👥 Seguir outros usuários</li>
                    <li>💬 Comentar em eventos</li>
                  </ul>
                  <p><small>Se você não criou esta conta, pode ignorar este email.</small></p>
                </div>
                <div class="footer">
                  ROLÊ - Descubra os melhores eventos da sua cidade<br>
                  © 2024 ROLÊ. Todos os direitos reservados.
                </div>
              </div>
            </div>
          </body>
        </html>
      `;
    
    case 'password-reset':
      return `
        <html>
          <head><style>${baseStyles}</style></head>
          <body>
            <div style="padding: 40px 20px;">
              <div class="container">
                <div class="header">
                  <h1>🔒 Redefinir Senha</h1>
                </div>
                <div class="content">
                  <h2>Solicitação de Nova Senha</h2>
                  <p>Recebemos uma solicitação para redefinir sua senha no ROLÊ. Clique no botão abaixo para criar uma nova senha:</p>
                  <a href="${data.resetUrl}" class="button">Redefinir Senha</a>
                  <p><strong>⚠️ Este link expira em 1 hora por segurança.</strong></p>
                  <p><small>Se você não solicitou a redefinição de senha, pode ignorar este email. Sua senha atual permanecerá inalterada.</small></p>
                </div>
                <div class="footer">
                  ROLÊ - Descubra os melhores eventos da sua cidade<br>
                  © 2024 ROLÊ. Todos os direitos reservados.
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

    default:
      return '';
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, confirmUrl, resetUrl, displayName }: AuthEmailRequest = await req.json();

    let subject = '';
    let htmlContent = '';

    switch (type) {
      case 'signup':
        subject = '🎉 Bem-vindo ao ROLÊ! Confirme seu email';
        htmlContent = getEmailTemplate('signup', { confirmUrl, displayName });
        break;
      
      case 'password-reset':
        subject = '🔒 Redefinir sua senha no ROLÊ';
        htmlContent = getEmailTemplate('password-reset', { resetUrl });
        break;
      
      default:
        throw new Error('Tipo de email inválido');
    }

    const emailResponse = await resend.emails.send({
      from: "ROLÊ <noreply@resend.dev>",
      to: [email],
      subject,
      html: htmlContent,
    });

    console.log("Email enviado com sucesso:", emailResponse);

    return new Response(JSON.stringify({ success: true, messageId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erro ao enviar email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);