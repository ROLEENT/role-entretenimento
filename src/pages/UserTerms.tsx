import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, Shield, BookOpen, AlertTriangle } from "lucide-react";

const UserTerms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Termos de Uso do Usuário – ROLÊ ENTRETENIMENTO | Termos do Rolezeiro</title>
        <meta 
          name="description" 
          content="Termos de uso para usuários da plataforma ROLÊ ENTRETENIMENTO. Nossa missão é inspirar, não comercializar." 
        />
        <meta property="og:title" content="Termos de Uso do Usuário – ROLÊ ENTRETENIMENTO" />
        <meta property="og:description" content="Termos e condições para uso da plataforma ROLÊ." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://roleentretenimento.com/termos-usuario" />
        <link rel="canonical" href="https://roleentretenimento.com/termos-usuario" />
      </Helmet>

      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Termos do Rolezeiro
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Termos de uso para usuários da plataforma ROLÊ ENTRETENIMENTO
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              
              {/* Acceptance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    1. Aceitação dos Termos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed">
                    Ao acessar e utilizar a plataforma ROLÊ ENTRETENIMENTO, você automaticamente 
                    concorda com estes Termos de Uso. Se você não concorda com algum ponto destes 
                    termos, recomendamos que não utilize nossos serviços.
                  </p>
                </CardContent>
              </Card>

              {/* Platform Purpose */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    2. Finalidade da Plataforma
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 text-primary">Nossa missão é inspirar, não comercializar</h3>
                    <p className="text-muted-foreground">
                      O ROLÊ ENTRETENIMENTO é um espaço de curadoria cultural, não de venda direta de eventos. 
                      Nosso objetivo é conectar você com experiências culturais relevantes e fortalecer 
                      a cena independente.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Curadoria editorial</h3>
                    <p className="text-muted-foreground">
                      Oferecemos conteúdo editorial, recomendações personalizadas e uma agenda 
                      curada de eventos culturais para melhorar sua experiência na cena local.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Responsibility */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    3. Responsabilidades e Limitações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Curadoria de informações</h3>
                    <p className="text-muted-foreground">
                      Fazemos curadoria cuidadosa das informações publicadas, mas não nos 
                      responsabilizamos por mudanças realizadas por terceiros, como:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                      <li>Alterações de datas, horários ou locais</li>
                      <li>Mudanças de preços ou disponibilidade</li>
                      <li>Cancelamentos de eventos</li>
                      <li>Problemas técnicos de terceiros</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Recomendação</h3>
                    <p className="text-muted-foreground">
                      Sempre confirme informações diretamente com os organizadores antes de 
                      se deslocar para qualquer evento.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Copyright */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    4. Direitos Autorais e Propriedade Intelectual
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Conteúdo da plataforma</h3>
                    <p className="text-muted-foreground">
                      Todo conteúdo publicado no site (textos, imagens, design, curadoria) 
                      pertence ao ROLÊ ENTRETENIMENTO ou aos respectivos autores, quando indicado.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Uso permitido</h3>
                    <p className="text-muted-foreground">
                      Você pode compartilhar nosso conteúdo desde que cite a fonte e não o utilize 
                      para fins comerciais sem autorização prévia.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Prohibited Conduct */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    5. Condutas Proibidas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">São expressamente vedadas as seguintes práticas:</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• <strong>Uso indevido:</strong> Utilizar a plataforma para fins ilegais ou não autorizados</li>
                    <li>• <strong>Plágio:</strong> Copiar nosso conteúdo sem autorização ou créditos</li>
                    <li>• <strong>Difamação:</strong> Publicar comentários ofensivos ou difamatórios</li>
                    <li>• <strong>Spam:</strong> Enviar mensagens não solicitadas ou propaganda excessiva</li>
                    <li>• <strong>Violação de dados:</strong> Tentar acessar informações privadas de outros usuários</li>
                    <li>• <strong>Conteúdo prejudicial:</strong> Compartilhar vírus, malware ou conteúdo malicioso</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Updates */}
              <Card>
                <CardHeader>
                  <CardTitle>6. Modificações dos Termos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Estes termos podem ser atualizados periodicamente para refletir mudanças 
                    em nossos serviços ou na legislação. Recomendamos que você revise esta 
                    página regularmente. O uso continuado da plataforma após as alterações 
                    constitui aceitação dos novos termos.
                  </p>
                </CardContent>
              </Card>

              {/* Contact */}
              <Card>
                <CardHeader>
                  <CardTitle>7. Dúvidas e Contato</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Para esclarecimentos sobre estes termos ou qualquer questão relacionada 
                    ao uso da plataforma, entre em contato conosco:
                  </p>
                  <div className="space-y-2 text-muted-foreground">
                    <p>• <strong>Email:</strong> contato@roleentretenimento.com</p>
                    <p>• <strong>WhatsApp:</strong> +55 51 98070-4353</p>
                    <p>• <strong>Formulário:</strong> Página de contato em nossa plataforma</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    <strong>Última atualização:</strong> Janeiro de 2025<br />
                    <strong>Vigência:</strong> Estes termos são válidos a partir do momento em que você acessa nossa plataforma.
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

export default UserTerms;