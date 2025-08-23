import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Heart, Sparkles } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Quem Somos – ROLÊ ENTRETENIMENTO | Curadoria Cultural Independente</title>
        <meta 
          name="description" 
          content="O ROLÊ ENTRETENIMENTO é uma ponte entre a cena cultural e o público rolezeiro. Criamos narrativas, oferecemos curadoria editorial e celebramos a diversidade da vida noturna." 
        />
        <meta property="og:title" content="Quem Somos – ROLÊ ENTRETENIMENTO" />
        <meta property="og:description" content="Curadoria independente de eventos, cultura e experiências. Fortalecemos a cultura independente e alternativa." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://roleentretenimento.com/sobre" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Quem Somos – ROLÊ ENTRETENIMENTO" />
        <meta name="twitter:description" content="Curadoria independente de eventos, cultura e experiências." />
        <link rel="canonical" href="https://roleentretenimento.com/sobre" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "ROLÊ ENTRETENIMENTO",
            "description": "A cultura como ponto de encontro - curadoria independente de eventos e cultura urbana",
            "url": "https://roleentretenimento.com",
            "foundingDate": "2003",
            "founder": {
              "@type": "Person",
              "name": "FIIH"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+55-51-98070-4353",
              "contactType": "Customer Service",
              "email": "contato@roleentretenimento.com"
            },
            "sameAs": [
              "https://instagram.com/role.ent",
              "https://tiktok.com/@role.ent",
              "https://www.youtube.com/@roleent"
            ]
          })}
        </script>
      </Helmet>

      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Quem Somos
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Uma ponte entre a cena cultural e o público rolezeiro
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="mb-12">
                <CardContent className="p-8 md:p-12">
                  <div className="prose prose-lg max-w-none">
                    <p className="text-lg leading-relaxed mb-6">
                      O <strong>ROLÊ ENTRETENIMENTO</strong> nasceu como uma ponte entre a cena cultural e o público rolezeiro. 
                      Nosso propósito é inspirar, conectar e amplificar experiências que vão muito além de eventos: 
                      criamos narrativas, oferecemos curadoria editorial e celebramos a diversidade da vida noturna.
                    </p>
                    
                    <p className="text-lg leading-relaxed">
                      Nossa missão é fortalecer a cultura independente e alternativa, valorizando artistas, coletivos 
                      e produtores que transformam a cidade em palco. Mais do que uma agenda, somos um espaço de encontro 
                      entre pessoas, música, arte e criatividade.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Values Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center">
                  <CardContent className="p-6">
                    <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Conexão</h3>
                    <p className="text-sm text-muted-foreground">
                      Conectamos pessoas através da cultura e experiências únicas
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Curadoria</h3>
                    <p className="text-sm text-muted-foreground">
                      Selecionamos o que realmente importa na cena cultural
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Independência</h3>
                    <p className="text-sm text-muted-foreground">
                      Valorizamos a cultura independente e alternativa
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Criatividade</h3>
                    <p className="text-sm text-muted-foreground">
                      Celebramos a diversidade e inovação cultural
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

export default About;