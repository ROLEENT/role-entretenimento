import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Mail, CheckCircle, XCircle } from "lucide-react";

const SpamPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Política Antispam – ROLÊ ENTRETENIMENTO | Comunicação Respeitosa</title>
        <meta 
          name="description" 
          content="Somos contra spam. Não enviamos mensagens sem consentimento. Comunicação clara, objetiva e respeitosa é nosso compromisso." 
        />
        <meta property="og:title" content="Política Antispam – ROLÊ ENTRETENIMENTO" />
        <meta property="og:description" content="Nosso compromisso com uma comunicação respeitosa e livre de spam." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://roleentretenimento.com/politica-spam" />
        <link rel="canonical" href="https://roleentretenimento.com/politica-spam" />
      </Helmet>

      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Política Antispam
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Nosso compromisso com uma comunicação respeitosa
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              
              {/* Main Principle */}
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Shield className="h-6 w-6" />
                    Somos contra spam.
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed">
                    O ROLÊ ENTRETENIMENTO tem o compromisso de manter uma comunicação 
                    clara, objetiva e respeitosa com nossa comunidade.
                  </p>
                </CardContent>
              </Card>

              {/* What We Don't Do */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-destructive" />
                    O que NÃO fazemos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <p>Não enviamos mensagens sem consentimento explícito</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <p>Não compartilhamos ou vendemos sua lista de contatos</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <p>Não enviamos emails promocionais excessivos</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <p>Não usamos assuntos enganosos ou clickbait</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* What We Do */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Nossos compromissos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p>Enviamos apenas conteúdo relevante sobre eventos e cultura</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p>Respeitamos a frequência de envio (máximo 2 emails por semana)</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p>Incluímos sempre a opção de descadastro em todos os emails</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p>Mantemos nossos contatos seguros e protegidos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Unsubscribe */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Cancelamento de emails
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    <strong>Você pode cancelar o recebimento de emails a qualquer momento.</strong>
                  </p>
                  <div className="space-y-2 text-muted-foreground">
                    <p>• Clique no link "Descadastrar" no final de qualquer email nosso</p>
                    <p>• Responda qualquer email nosso solicitando o descadastro</p>
                    <p>• Entre em contato via WhatsApp ou formulário de contato</p>
                    <p>• Acesse suas configurações no perfil da plataforma</p>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    O descadastro é processado imediatamente, mas pode levar até 48h para ser efetivado 
                    em todos os nossos sistemas.
                  </p>
                </CardContent>
              </Card>

              {/* Communication Standards */}
              <Card>
                <CardHeader>
                  <CardTitle>Padrões de Comunicação</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Nosso compromisso é manter uma comunicação clara, objetiva e respeitosa:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• <strong>Transparência:</strong> Identificamos claramente o remetente</li>
                    <li>• <strong>Relevância:</strong> Enviamos apenas conteúdo relacionado à nossa curadoria</li>
                    <li>• <strong>Frequência:</strong> Respeitamos limites de envio para não sobrecarregar</li>
                    <li>• <strong>Qualidade:</strong> Priorizamos conteúdo de valor sobre quantidade</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Report Spam */}
              <Card className="border-destructive/20">
                <CardHeader>
                  <CardTitle className="text-destructive">Recebeu spam em nosso nome?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Qualquer mensagem recebida em nome do ROLÊ fora destas regras deve ser 
                    desconsiderada e pode ser um golpe.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Se você receber alguma comunicação suspeita que alegue ser do ROLÊ ENTRETENIMENTO, 
                    entre em contato conosco imediatamente através dos canais oficiais.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    <strong>Última atualização:</strong> Janeiro de 2025<br />
                    Esta política pode ser atualizada periodicamente para melhor atender nossa comunidade.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SpamPolicy;