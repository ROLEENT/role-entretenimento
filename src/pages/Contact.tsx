import { useState } from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular envio do formulário
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Mensagem enviada com sucesso! Responderemos em breve.");
    setIsSubmitting(false);
    
    // Reset form
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Contato – Fale com o ROLÊ | ROLÊ ENTRETENIMENTO</title>
        <meta 
          name="description" 
          content="Canal oficial de comunicação do ROLÊ ENTRETENIMENTO. Entre em contato para suporte, dúvidas, parcerias e propostas comerciais." 
        />
        <meta property="og:title" content="Contato – Fale com o ROLÊ" />
        <meta property="og:description" content="Entre em contato conosco para suporte, parcerias e propostas comerciais." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://roleentretenimento.com/contato" />
        <meta name="twitter:card" content="summary" />
        <link rel="canonical" href="https://roleentretenimento.com/contato" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contato – ROLÊ ENTRETENIMENTO",
            "description": "Entre em contato com nossa equipe",
            "mainEntity": {
              "@type": "Organization",
              "name": "ROLÊ ENTRETENIMENTO",
              "contactPoint": [
                {
                  "@type": "ContactPoint",
                  "telephone": "+55-51-98070-4353",
                  "contactType": "Customer Service"
                },
                {
                  "@type": "ContactPoint", 
                  "email": "contato@roleentretenimento.com",
                  "contactType": "Customer Service"
                }
              ]
            }
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
                Fale com o ROLÊ
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Este é o canal oficial de comunicação do ROLÊ ENTRETENIMENTO. 
                Aqui você pode falar com nossa equipe para suporte, dúvidas, parcerias e propostas comerciais.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Envie sua mensagem
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome *</Label>
                      <Input
                        id="name"
                        name="name"
                        required
                        placeholder="Seu nome completo"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="seu@email.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject">Assunto</Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="Assunto da sua mensagem"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Mensagem *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        placeholder="Digite sua mensagem aqui..."
                        rows={6}
                      />
                    </div>
                    
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      WhatsApp
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Para contato direto e respostas rápidas
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
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Email Institucional
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Para propostas comerciais e parcerias
                    </p>
                    <Button variant="outline" asChild className="w-full">
                      <a href="mailto:contato@roleentretenimento.com">
                        contato@roleentretenimento.com
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">Horário de Atendimento</h3>
                    <p className="text-sm text-muted-foreground">
                      Segunda a Sexta: 9h às 18h<br />
                      Sábado: 9h às 14h<br />
                      Domingo: Não atendemos
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;