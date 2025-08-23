import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Database, Users, FileText } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Política de Privacidade – ROLÊ ENTRETENIMENTO | LGPD</title>
        <meta 
          name="description" 
          content="Respeitamos a sua privacidade e seguimos a LGPD. Saiba como coletamos, usamos e protegemos suas informações pessoais." 
        />
        <meta property="og:title" content="Política de Privacidade – ROLÊ ENTRETENIMENTO" />
        <meta property="og:description" content="Como protegemos seus dados pessoais de acordo com a LGPD." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://roleentretenimento.com/politica-privacidade" />
        <link rel="canonical" href="https://roleentretenimento.com/politica-privacidade" />
      </Helmet>

      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Política de Privacidade
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Respeitamos a sua privacidade e seguimos a LGPD
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              
              {/* Intro Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Nosso Compromisso
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed">
                    Respeitamos a sua privacidade e seguimos a LGPD. Coletamos apenas informações 
                    necessárias para melhorar sua experiência na plataforma.
                  </p>
                </CardContent>
              </Card>

              {/* Data Collection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Coleta de Informações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Dados Fornecidos Voluntariamente</h3>
                    <p className="text-muted-foreground">
                      Coletamos informações que você nos fornece diretamente, como nome e email 
                      durante o cadastro, preferências de eventos e comentários.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Dados Técnicos</h3>
                    <p className="text-muted-foreground">
                      Utilizamos cookies e ferramentas de analytics para entender como você 
                      interage com nossa plataforma e melhorar nossos serviços.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Data Usage */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Uso dos Dados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• <strong>Comunicação:</strong> Para enviar newsletters, notificações sobre eventos e responder suas dúvidas</li>
                    <li>• <strong>Personalização:</strong> Para recomendar eventos de acordo com suas preferências</li>
                    <li>• <strong>Melhoria dos serviços:</strong> Para entender como você usa a plataforma e aprimorar a experiência</li>
                    <li>• <strong>Segurança:</strong> Para proteger sua conta e prevenir atividades fraudulentas</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Data Sharing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Compartilhamento de Dados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-primary mb-2">
                    Não vendemos nem repassamos informações pessoais a terceiros.
                  </p>
                  <p className="text-muted-foreground">
                    Seus dados podem ser compartilhados apenas em casos específicos: 
                    cumprimento de obrigações legais, proteção de direitos ou segurança, 
                    e com prestadores de serviços essenciais (sempre com proteção contratual).
                  </p>
                </CardContent>
              </Card>

              {/* User Rights */}
              <Card>
                <CardHeader>
                  <CardTitle>Direitos do Usuário</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">De acordo com a LGPD, você tem os seguintes direitos:</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• <strong>Acesso:</strong> Saber quais dados pessoais temos sobre você</li>
                    <li>• <strong>Correção:</strong> Solicitar a correção de dados incompletos ou incorretos</li>
                    <li>• <strong>Exclusão:</strong> Pedir a exclusão de seus dados pessoais</li>
                    <li>• <strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                    <li>• <strong>Oposição:</strong> Se opor ao tratamento de seus dados</li>
                    <li>• <strong>Revogação:</strong> Retirar seu consentimento a qualquer momento</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Contact */}
              <Card>
                <CardHeader>
                  <CardTitle>Exercer seus Direitos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Para qualquer solicitação relacionada aos seus dados pessoais, 
                    use nosso formulário de contato ou envie um email para:
                  </p>
                  <p className="text-primary font-semibold">
                    contato@roleentretenimento.com
                  </p>
                  <p className="text-sm text-muted-foreground mt-4">
                    Responderemos sua solicitação em até 15 dias úteis.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    <strong>Última atualização:</strong> Janeiro de 2025<br />
                    Esta política pode ser atualizada periodicamente. Recomendamos revisar esta página regularmente.
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

export default PrivacyPolicy;