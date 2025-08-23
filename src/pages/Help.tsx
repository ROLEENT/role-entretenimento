import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { HelpCircle, MessageSquare, Phone, Mail } from "lucide-react";

const Help = () => {
  const faqs = [
    {
      question: "Como cadastrar um evento?",
      answer: "Para cadastrar um evento, acesse a página de criação de eventos no painel administrativo (/admin/event/create). Você precisará ter uma conta de organizador aprovada. Preencha todas as informações necessárias, incluindo data, local, descrição e imagens. Nosso time fará a curadoria do evento antes da publicação."
    },
    {
      question: "Como funcionam os destaques editoriais?",
      answer: "Os destaques editoriais são curados pela nossa equipe e publicados semanalmente na seção /destaques. Selecionamos eventos e experiências que consideramos relevantes para a cena cultural de cada cidade. A curadoria considera critérios como originalidade, qualidade artística e impacto cultural."
    },
    {
      question: "Como posso anunciar no ROLÊ?",
      answer: "Para propostas comerciais e anúncios, entre em contato através do nosso formulário de contato ou WhatsApp. Oferecemos diferentes formatos de parceria, sempre alinhados com nossa linha editorial. Priorizamos colaborações que agregam valor à nossa comunidade."
    },
    {
      question: "Como editar meus dados de usuário?",
      answer: "Acesse seu dashboard em /perfil e vá até a seção 'Configurações de conta'. Lá você pode atualizar seu nome de exibição, configurar preferências de notificação e gerenciar sua conta. O email não pode ser alterado por questões de segurança."
    },
    {
      question: "Como funciona o sistema de favoritos?",
      answer: "Você pode marcar eventos como favoritos clicando no ícone de coração em qualquer evento. Seus favoritos ficam salvos no seu perfil (/perfil) e você pode visualizá-los a qualquer momento. Em breve, implementaremos notificações para eventos favoritos."
    },
    {
      question: "Como receber notificações de eventos?",
      answer: "Configure suas preferências de notificação no seu perfil (/perfil). Você pode escolher receber alertas por email sobre novos eventos na sua cidade, lembretes de eventos favoritos e nossa newsletter semanal com os destaques editoriais."
    },
    {
      question: "Posso cancelar minha conta?",
      answer: "Sim, você pode solicitar o cancelamento da sua conta através do nosso formulário de contato ou email. Seus dados serão removidos conforme nossa política de privacidade e a LGPD. O processo leva até 15 dias úteis para ser concluído."
    },
    {
      question: "Como denunciar conteúdo inadequado?",
      answer: "Se você encontrar conteúdo inadequado ou suspeito, entre em contato conosco imediatamente através dos canais oficiais. Analisamos todas as denúncias e tomamos as medidas cabíveis para manter nossa comunidade segura e respeitosa."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Ajuda e Suporte – ROLÊ ENTRETENIMENTO | FAQ</title>
        <meta 
          name="description" 
          content="Central de ajuda do ROLÊ ENTRETENIMENTO. Encontre respostas para suas dúvidas sobre eventos, conta de usuário e nossa plataforma." 
        />
        <meta property="og:title" content="Ajuda e Suporte – ROLÊ ENTRETENIMENTO" />
        <meta property="og:description" content="Central de ajuda com perguntas frequentes e suporte." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://roleentretenimento.com/ajuda" />
        <link rel="canonical" href="https://roleentretenimento.com/ajuda" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })}
        </script>
      </Helmet>

      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Ajuda e Suporte
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Central de ajuda do ROLÊ ENTRETENIMENTO
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              
              {/* FAQ Header */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <HelpCircle className="h-6 w-6" />
                    Perguntas Frequentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Encontre respostas rápidas para as dúvidas mais comuns sobre nossa plataforma.
                  </p>
                </CardContent>
              </Card>

              {/* FAQ Accordion */}
              <Card className="mb-8">
                <CardContent className="pt-6">
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-muted-foreground leading-relaxed">
                            {faq.answer}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>

              {/* Contact Support */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Ainda precisa de ajuda?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    Nossa equipe está pronta para ajudar! Entre em contato através dos canais oficiais:
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Phone className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">WhatsApp</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Para suporte rápido e direto
                        </p>
                        <Button asChild className="w-full">
                          <a 
                            href="https://wa.me/5551980704353" 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            Conversar no WhatsApp
                          </a>
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Mail className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">Email</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Para questões mais complexas
                        </p>
                        <Button variant="outline" asChild className="w-full">
                          <a href="mailto:contato@roleentretenimento.com">
                            Enviar email
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Horário de Atendimento</h4>
                    <div className="text-sm text-muted-foreground">
                      <p>Segunda a Sexta: 9h às 18h</p>
                      <p>Sábado: 9h às 14h</p>
                      <p>Domingo: Não atendemos</p>
                    </div>
                  </div>
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

export default Help;