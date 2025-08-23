import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Search, Shield, Handshake } from "lucide-react";

const OrganizerTerms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Termos do Organizador – ROLÊ ENTRETENIMENTO | Parceria Cultural</title>
        <meta 
          name="description" 
          content="Termos e condições para organizadores de eventos na plataforma ROLÊ ENTRETENIMENTO. Trabalhamos em colaboração para fortalecer a cena cultural." 
        />
        <meta property="og:title" content="Termos do Organizador – ROLÊ ENTRETENIMENTO" />
        <meta property="og:description" content="Parceria para fortalecimento da cena cultural independente." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://roleentretenimento.com/termos-organizador" />
        <link rel="canonical" href="https://roleentretenimento.com/termos-organizador" />
      </Helmet>

      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Termos do Organizador
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Parceria para fortalecimento da cena cultural independente
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              
              {/* Registration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    1. Cadastro e Envio de Informações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Dados verdadeiros</h3>
                    <p className="text-muted-foreground">
                      Organizadores devem fornecer informações verdadeiras, completas e atualizadas 
                      sobre seus eventos, incluindo datas, horários, locais, preços e descrições precisas.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Materiais de qualidade</h3>
                    <p className="text-muted-foreground">
                      Imagens e conteúdos enviados devem ser de alta qualidade, originais ou 
                      com autorização de uso, e representar fielmente o evento.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Prazos</h3>
                    <p className="text-muted-foreground">
                      Eventos devem ser cadastrados com pelo menos 7 dias de antecedência para 
                      permitir nossa curadoria editorial e divulgação adequada.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Contatos atualizados</h3>
                    <p className="text-muted-foreground">
                      Manter informações de contato sempre atualizadas para comunicação 
                      eficiente com nossa equipe.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Curation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    2. Processo de Curadoria
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 text-primary">Nossa curadoria editorial</h3>
                    <p className="text-muted-foreground">
                      Cada evento enviado passa por análise criteriosa de nossa equipe editorial. 
                      Consideramos os seguintes aspectos:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                      <li><strong>Relevância cultural:</strong> Alinhamento com nossa linha editorial</li>
                      <li><strong>Qualidade artística:</strong> Valor cultural e criativo do evento</li>
                      <li><strong>Originalidade:</strong> Propostas inovadoras e diferenciadas</li>
                      <li><strong>Impacto social:</strong> Contribuição para a cena local</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Tempo de análise</h3>
                    <p className="text-muted-foreground">
                      A análise editorial leva entre 2 a 5 dias úteis. Eventos com propostas 
                      especiais ou que requeiram maior investigação podem demorar mais.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Feedback</h3>
                    <p className="text-muted-foreground">
                      Fornecemos feedback construtivo sobre eventos não aprovados, sempre 
                      buscando apoiar o desenvolvimento da cena cultural.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Responsibility */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    3. Responsabilidades do Organizador
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Veracidade dos dados</h3>
                    <p className="text-muted-foreground">
                      Organizadores são integralmente responsáveis pela veracidade de todas 
                      as informações enviadas, incluindo datas, preços, programação e 
                      detalhes logísticos.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Atualizações</h3>
                    <p className="text-muted-foreground">
                      Comunicar imediatamente qualquer alteração no evento (data, local, 
                      cancelamento) para que possamos atualizar nossos canais.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Direitos autorais</h3>
                    <p className="text-muted-foreground">
                      Garantir que possuem todos os direitos necessários sobre materiais 
                      enviados (imagens, textos, músicas) ou autorização de terceiros.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Conformidade legal</h3>
                    <p className="text-muted-foreground">
                      Eventos devem estar em conformidade com todas as leis locais, 
                      licenças necessárias e normas de segurança.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* ROLE Rights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    4. Direitos do ROLÊ ENTRETENIMENTO
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Curadoria editorial</h3>
                    <p className="text-muted-foreground">
                      O ROLÊ se reserva o direito de recusar eventos que não estejam 
                      alinhados com nossa linha editorial, valores ou padrões de qualidade.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Edição de conteúdo</h3>
                    <p className="text-muted-foreground">
                      Podemos editar textos e materiais para adequação ao nosso estilo 
                      editorial, sempre mantendo a essência e informações principais do evento.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Remoção de conteúdo</h3>
                    <p className="text-muted-foreground">
                      Remover conteúdos que violem nossos termos, sejam inadequados ou 
                      que causem conflitos com nossa comunidade.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Partnership */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Handshake className="h-5 w-5" />
                    5. Parceria e Colaboração
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 text-primary">Trabalhamos em colaboração</h3>
                    <p className="text-muted-foreground">
                      Nossa relação é baseada em parceria genuína para fortalecimento da 
                      cena cultural. Buscamos apoiar organizadores comprometidos com 
                      qualidade e inovação.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Transparência</h3>
                    <p className="text-muted-foreground">
                      Mantemos comunicação aberta sobre nossos processos, critérios de 
                      curadoria e feedback sobre os eventos submetidos.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Desenvolvimento da cena</h3>
                    <p className="text-muted-foreground">
                      Priorizamos o fortalecimento da cena cultural local, dando espaço 
                      especial para novos talentos e propostas inovadoras.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Suporte</h3>
                    <p className="text-muted-foreground">
                      Oferecemos orientações para melhorar a apresentação de eventos e 
                      maximizar o alcance dentro de nossa comunidade.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Contact */}
              <Card>
                <CardHeader>
                  <CardTitle>6. Comunicação e Suporte</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Para dúvidas sobre estes termos, submissão de eventos ou parcerias:
                  </p>
                  <div className="space-y-2 text-muted-foreground">
                    <p>• <strong>Email:</strong> contato@roleentretenimento.com</p>
                    <p>• <strong>WhatsApp:</strong> +55 51 98070-4353</p>
                    <p>• <strong>Painel do organizador:</strong> /admin (para organizadores cadastrados)</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    <strong>Última atualização:</strong> Janeiro de 2025<br />
                    <strong>Vigência:</strong> Estes termos se aplicam a todos os eventos submetidos a partir desta data.
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

export default OrganizerTerms;