import { Helmet } from "react-helmet";
import { PublicLayout } from "@/components/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Handshake, Megaphone, Star, Users, Mail } from "lucide-react";

const Parcerias = () => {
  return (
    <PublicLayout>
      <Helmet>
        <title>Parcerias - Colabore com o ROLÊ | ROLÊ ENTRETENIMENTO</title>
        <meta 
          name="description" 
          content="Oportunidades de parcerias com o ROLÊ ENTRETENIMENTO. Co-marketing, mídia, branded content e colaborações estratégicas para marcas e organizações." 
        />
        <meta property="og:title" content="Parcerias - Colabore com o ROLÊ" />
        <meta property="og:description" content="Descubra oportunidades de parcerias e colaborações com o ROLÊ ENTRETENIMENTO." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://roleentretenimento.com/institucional/parcerias" />
        <meta name="twitter:card" content="summary" />
        <link rel="canonical" href="https://roleentretenimento.com/institucional/parcerias" />
      </Helmet>

      <main className="pt-20 pb-16">
        {/* Breadcrumb */}
        <section className="container mx-auto px-4 py-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/institucional">Institucional</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbPage>Parcerias</BreadcrumbPage>
            </BreadcrumbList>
          </Breadcrumb>
        </section>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Parcerias
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Conectamos marcas e organizações com audiências culturais autênticas através de colaborações estratégicas, 
                co-marketing e branded content.
              </p>
            </div>
          </div>
        </section>

        {/* Partnership Types */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Oportunidades de Parceria</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Megaphone className="h-6 w-6 text-primary" />
                      Co-marketing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Campanhas conjuntas para amplificar o alcance de marcas e eventos. 
                      Criamos narrativas autênticas que conectam produtos e serviços com o público cultural.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Star className="h-6 w-6 text-primary" />
                      Branded Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Conteúdo editorial patrocinado que integra naturalmente marcas às nossas coberturas culturais, 
                      mantendo a credibilidade e relevância para nossa audiência.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Users className="h-6 w-6 text-primary" />
                      Mídia & Patrocínio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Oportunidades de patrocínio em nossos canais digitais, eventos e coberturas especiais. 
                      Visibilidade qualificada para marcas alinhadas com nossos valores.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Why Partner With Us */}
              <div className="bg-card rounded-lg p-8 mb-12">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Handshake className="h-7 w-7 text-primary" />
                  Por que ser nosso parceiro?
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold mb-3">Audiência Engajada</h4>
                    <p className="text-muted-foreground mb-6">
                      Comunidade ativa e apaixonada por cultura, eventos e experiências autênticas.
                    </p>
                    
                    <h4 className="font-semibold mb-3">Credibilidade Editorial</h4>
                    <p className="text-muted-foreground">
                      Anos de experiência em curadoria cultural e relacionamento próximo com produtores, artistas e venues.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Alcance Multiplataforma</h4>
                    <p className="text-muted-foreground mb-6">
                      Presença consolidada em redes sociais, plataforma digital e eventos presenciais.
                    </p>
                    
                    <h4 className="font-semibold mb-3">Conteúdo de Qualidade</h4>
                    <p className="text-muted-foreground">
                      Produção editorial consistente e diferenciada, focada em experiências que realmente importam.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact CTA */}
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Vamos conversar?</h3>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Entre em contato para discutir oportunidades de parceria e colaboração. 
                  Estamos sempre abertos a propostas criativas e alinhadas com nossos valores.
                </p>
                <Button size="lg" asChild>
                  <a href="mailto:contato@roleentretenimento.com" className="inline-flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Falar sobre Parceria
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
};

export default Parcerias;