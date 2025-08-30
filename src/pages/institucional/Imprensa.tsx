import { Helmet } from "react-helmet";
import { PublicLayout } from "@/components/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Newspaper, Download, Mail, Phone, Users } from "lucide-react";

const Imprensa = () => {
  return (
    <PublicLayout>
      <Helmet>
        <title>Imprensa - Press Kit e Contatos | ROLÊ ENTRETENIMENTO</title>
        <meta 
          name="description" 
          content="Área de imprensa do ROLÊ ENTRETENIMENTO. Press kit, contatos para assessoria de imprensa e materiais para veículos de comunicação." 
        />
        <meta property="og:title" content="Imprensa - Press Kit e Contatos" />
        <meta property="og:description" content="Materiais de imprensa e contatos para assessoria do ROLÊ ENTRETENIMENTO." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://roleentretenimento.com/institucional/imprensa" />
        <meta name="twitter:card" content="summary" />
        <link rel="canonical" href="https://roleentretenimento.com/institucional/imprensa" />
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
              <BreadcrumbPage>Imprensa</BreadcrumbPage>
            </BreadcrumbList>
          </Breadcrumb>
        </section>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Imprensa
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Materiais de imprensa, press kit e contatos para veículos de comunicação interessados em cobrir 
                ou entrevistar o ROLÊ ENTRETENIMENTO.
              </p>
            </div>
          </div>
        </section>

        {/* Press Kit & Contacts */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Press Contacts */}
              <div className="grid md:grid-cols-2 gap-8 mb-16">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Mail className="h-6 w-6 text-primary" />
                      Assessoria de Imprensa
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Para entrevistas, pautas e informações institucionais
                    </p>
                    <div className="space-y-2">
                      <Button variant="outline" asChild className="w-full justify-start">
                        <a href="mailto:imprensa@roleentretenimento.com">
                          <Mail className="h-4 w-4 mr-2" />
                          imprensa@roleentretenimento.com
                        </a>
                      </Button>
                      <Button variant="outline" asChild className="w-full justify-start">
                        <a href="https://wa.me/5551980704353" target="_blank" rel="noopener noreferrer">
                          <Phone className="h-4 w-4 mr-2" />
                          WhatsApp: (51) 98070-4353
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Download className="h-6 w-6 text-primary" />
                      Press Kit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Materiais institucionais disponíveis para download
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">• Logotipos em alta resolução</p>
                      <p className="text-sm text-muted-foreground">• Fotos institucionais</p>
                      <p className="text-sm text-muted-foreground">• Fact sheet da empresa</p>
                      <p className="text-sm text-muted-foreground">• Biografias da equipe</p>
                      <Button variant="outline" className="w-full mt-4">
                        <Download className="h-4 w-4 mr-2" />
                        Baixar Press Kit (em breve)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* About Section */}
              <Card className="mb-12">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-primary" />
                    Sobre o ROLÊ ENTRETENIMENTO
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-muted-foreground mb-4">
                      O ROLÊ ENTRETENIMENTO é uma plataforma de curadoria cultural independente que conecta pessoas 
                      com as melhores experiências culturais do Brasil. Fundado com o propósito de democratizar o 
                      acesso à cultura de qualidade, o ROLÊ se tornou referência na descoberta e divulgação de eventos, 
                      artistas e experiências autênticas.
                    </p>
                    <p className="text-muted-foreground mb-4">
                      Com uma abordagem editorial diferenciada, priorizamos a qualidade sobre a quantidade, 
                      oferecendo uma seleção cuidadosa de eventos que realmente valem a pena. Nossa equipe de 
                      curadores especializados vivencia e avalia cada experiência antes de recomendá-la para 
                      nossa comunidade.
                    </p>
                    <p className="text-muted-foreground">
                      Através de nossa plataforma digital e presença em redes sociais, alcançamos milhares de 
                      pessoas apaixonadas por cultura, música, arte e entretenimento em todo o país.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Spotify Embed */}
              <Card className="mb-12">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Newspaper className="h-6 w-6 text-primary" />
                    Na Mídia
                  </CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Confira nossa participação no programa da Rádio Gaúcha ZH
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="my-6">
                    <iframe
                      data-testid="embed-iframe"
                      style={{ borderRadius: 12 }}
                      src="https://open.spotify.com/embed/episode/0AsnMtAcgFPuWkK9Cs2qYZ?utm_source=generator"
                      width="100%"
                      height="352"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Episódio da Rádio Gaúcha ZH sobre cultura e entretenimento
                  </p>
                </CardContent>
              </Card>

              {/* Media Coverage Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle>Cobertura na Mídia</CardTitle>
                  <p className="text-muted-foreground">
                    Principais aparições e menções do ROLÊ ENTRETENIMENTO na imprensa
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Newspaper className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Seção em construção. Em breve, você encontrará aqui nosso histórico de aparições na mídia.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
};

export default Imprensa;