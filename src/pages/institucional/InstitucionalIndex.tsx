import { Helmet } from "react-helmet";
import { PublicLayout } from "@/components/PublicLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Building2, Users, FileText, ArrowRight } from "lucide-react";
import BlogBreadcrumbs from "@/components/blog/BlogBreadcrumbs";

const InstitucionalIndex = () => {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Institucional", isCurrentPage: true },
  ];

  const institutionalPages = [
    {
      title: "Parcerias",
      description: "Descubra oportunidades de colaboração e parceria com o ROLÊ ENTRETENIMENTO",
      href: "/institucional/parcerias",
      icon: Building2,
    },
    {
      title: "Trabalhe Conosco",
      description: "Encontre oportunidades de carreira e faça parte da nossa equipe",
      href: "/institucional/trabalhe-conosco",
      icon: Users,
    },
    {
      title: "Imprensa",
      description: "Materiais de imprensa, contatos e informações para mídia",
      href: "/institucional/imprensa",
      icon: FileText,
    },
  ];

  return (
    <PublicLayout>
      <Helmet>
        <title>Institucional - ROLÊ ENTRETENIMENTO</title>
        <meta name="description" content="Informações institucionais do ROLÊ ENTRETENIMENTO. Conheça nossas parcerias, oportunidades de trabalho e materiais de imprensa." />
        <meta property="og:title" content="Institucional - ROLÊ ENTRETENIMENTO" />
        <meta property="og:description" content="Informações institucionais do ROLÊ ENTRETENIMENTO. Conheça nossas parcerias, oportunidades de trabalho e materiais de imprensa." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://roleentretenimento.com/institucional" />
        <meta name="twitter:card" content="summary" />
        <link rel="canonical" href="https://roleentretenimento.com/institucional" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <BlogBreadcrumbs items={breadcrumbItems} />
        
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Institucional</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Conheça mais sobre o ROLÊ ENTRETENIMENTO, nossas parcerias, 
            oportunidades de carreira e materiais para imprensa.
          </p>
        </section>

        {/* Institutional Pages Grid */}
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {institutionalPages.map((page) => {
            const IconComponent = page.icon;
            return (
              <Link key={page.href} to={page.href} className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary/20 group-hover:scale-105">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {page.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {page.description}
                    </CardDescription>
                    <div className="flex items-center text-primary font-medium group-hover:gap-2 transition-all">
                      Saiba mais
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </section>
      </div>
    </PublicLayout>
  );
};

export default InstitucionalIndex;