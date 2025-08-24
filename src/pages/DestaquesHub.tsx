import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Clock, ArrowRight } from "lucide-react";
import { useBlogData, getCitiesWithPosts, getLatestPostByCity, BlogPost } from "@/hooks/useBlogData";
import { citiesData } from "@/data/citiesData";
import { getFeaturedEventHighlights } from "@/data/eventHighlights";
import ScrollAnimationWrapper from "@/components/ScrollAnimationWrapper";
import ArticleCard from "@/components/blog/ArticleCard";
import EventHighlightCard from "@/components/EventHighlightCard";
import { Skeleton } from "@/components/ui/skeleton";

const DestaquesHub = () => {
  const { posts: allPosts, isLoading } = useBlogData();
  const [citiesWithContent, setCitiesWithContent] = useState<string[]>([]);
  const [latestPosts, setLatestPosts] = useState<Record<string, BlogPost>>({});

  useEffect(() => {
    const loadCitiesData = async () => {
      try {
        const cities = await getCitiesWithPosts();
        setCitiesWithContent(cities);

        // Get latest post for each city
        const latestPostsData: Record<string, BlogPost> = {};
        for (const city of cities) {
          const latestPost = await getLatestPostByCity(city);
          if (latestPost) {
            latestPostsData[city] = latestPost;
          }
        }
        setLatestPosts(latestPostsData);
      } catch (error) {
        console.error("Error loading cities data:", error);
      }
    };

    loadCitiesData();
  }, []);

  const featuredPosts = allPosts.filter(post => post.featured).slice(0, 6);
  const featuredEventHighlights = getFeaturedEventHighlights();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-3/4 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Destaques Culturais | ROLÊ - Agenda Cultural Completa"
        description="Explore os destaques culturais das principais cidades do Brasil. Eventos, shows, festivais e experiências culturais selecionadas pela equipe ROLÊ."
        url="https://roleentretenimento.com/destaques"
      />
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
          <div className="relative container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
                Destaques Culturais
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Descubra os melhores eventos, shows e experiências culturais nas principais cidades do Brasil. 
                Conteúdo exclusivo e curadoria especializada para você não perder nada.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Badge variant="outline" className="px-4 py-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  Atualizado semanalmente
                </Badge>
                <Badge variant="outline" className="px-4 py-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  {citiesWithContent.length} cidades
                </Badge>
                <Badge variant="outline" className="px-4 py-2">
                  <Clock className="w-4 h-4 mr-2" />
                  {allPosts.length} artigos publicados
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Event Highlights */}
        {featuredEventHighlights.length > 0 && (
          <ScrollAnimationWrapper>
            <section className="py-16">
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold mb-4 text-center">Destaques da Semana</h2>
                <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
                  Eventos selecionados pela nossa equipe editorial com base em relevância cultural, 
                  qualidade artística e impacto na cena local.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {featuredEventHighlights.map((event) => (
                    <EventHighlightCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            </section>
          </ScrollAnimationWrapper>
        )}

        {/* Featured Articles */}
        {featuredPosts.length > 0 && (
          <ScrollAnimationWrapper>
            <section className="py-16 bg-muted/20">
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold mb-8 text-center">Artigos Editoriais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredPosts.map((post) => (
                    <ArticleCard key={post.id} post={post} showCity={true} />
                  ))}
                </div>
              </div>
            </section>
          </ScrollAnimationWrapper>
        )}

        {/* Cities Grid */}
        <ScrollAnimationWrapper>
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-8 text-center">Explore por Cidade</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(citiesData).map(([slug, cityData]) => {
                  const hasContent = citiesWithContent.includes(slug);
                  const latestPost = latestPosts[slug];
                  
                  return (
                    <Card key={slug} className="group hover-lift overflow-hidden">
                      <div className="relative h-48">
                        <img
                          src={cityData.image}
                          alt={`Eventos em ${cityData.name}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                        <div className="absolute top-4 right-4">
                          <Badge variant={hasContent ? "default" : "secondary"}>
                            {hasContent ? "Ativo" : "Em breve"}
                          </Badge>
                        </div>
                        <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="text-xl font-bold mb-1">{cityData.name}</h3>
                          <p className="text-sm opacity-90">{cityData.state}</p>
                        </div>
                      </div>
                      
                      <CardContent className="p-6">
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {cityData.description}
                        </p>
                        
                        {latestPost && (
                          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Último artigo:</p>
                            <p className="font-medium text-sm line-clamp-2">{latestPost.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(latestPost.published_at || latestPost.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        )}
                        
                        <Button 
                          asChild 
                          variant={hasContent ? "default" : "outline"}
                          className="w-full"
                          disabled={!hasContent}
                        >
                          <Link to={`/destaques/${slug}`}>
                            {hasContent ? "Ver Destaques" : "Em breve"}
                            {hasContent && <ArrowRight className="w-4 h-4 ml-2" />}
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        </ScrollAnimationWrapper>

        {/* Latest Articles */}
        {allPosts.length > 0 && (
          <ScrollAnimationWrapper>
            <section className="py-16">
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold mb-8 text-center">Últimos Artigos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allPosts.slice(0, 9).map((post) => (
                    <ArticleCard key={post.id} post={post} showCity={true} />
                  ))}
                </div>
              </div>
            </section>
          </ScrollAnimationWrapper>
        )}
      </main>
      
      <Footer />
      <BackToTop />
    </div>
  );
};

export default DestaquesHub;