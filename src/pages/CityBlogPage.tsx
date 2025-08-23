import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, FileText, MapPin } from "lucide-react";
import { getCityPosts } from "@/hooks/useBlogData";
import { citiesData } from "@/data/citiesData";
import ArticleCard from "@/components/blog/ArticleCard";
import ScrollAnimationWrapper from "@/components/ScrollAnimationWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import BlogBreadcrumbs from "@/components/blog/BlogBreadcrumbs";
import cityPlaceholder from "@/assets/city-placeholder.jpg";

const CityBlogPage = () => {
  const { cidade } = useParams();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const cityData = cidade ? citiesData[cidade] : null;

  useEffect(() => {
    const loadCityPosts = async () => {
      if (cidade && cityData) {
        // Update page title and meta
        document.title = `Destaques de ${cityData.name} | ROLÊ`;
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', `Descubra os melhores eventos e experiências culturais de ${cityData.name}. ${cityData.description}`);
        }
        
        setIsLoading(true);
        try {
          const cityPosts = await getCityPosts(cidade);
          setPosts(cityPosts.sort((a, b) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime()));
        } catch (error) {
          console.error("Error loading posts:", error);
          setPosts([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadCityPosts();
  }, [cidade, cityData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!cityData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Cidade não encontrada</h1>
          <p className="text-muted-foreground mb-6">
            A cidade solicitada não foi encontrada em nossa base de dados.
          </p>
          <Button asChild>
            <Link to="/destaques">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Destaques
            </Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* City Hero */}
        <section className="relative py-20 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url(${cityData.image})`,
              backgroundSize: 'cover'
            }}
            onError={(e) => {
              e.currentTarget.style.backgroundImage = `url(${cityPlaceholder})`;
            }}
          />
          <div className="absolute inset-0 bg-black/50" />
          
          <div className="relative container mx-auto px-4">
            <BlogBreadcrumbs 
              items={[
                { label: "Início", href: "/" },
                { label: "Destaques", href: "/destaques" },
                { label: cityData.name, isCurrentPage: true }
              ]}
            />
            
            <div className="text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Destaques de {cityData.name}
              </h1>
              <p className="text-xl mb-6 max-w-2xl">
                {cityData.description}
              </p>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{cityData.state}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>{posts.length} artigos publicados</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Atualizado semanalmente</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Articles Timeline */}
        <ScrollAnimationWrapper>
          <section className="py-16">
            <div className="container mx-auto px-4">
              {posts.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold">Timeline de Artigos</h2>
                    <Badge variant="outline" className="px-3 py-1">
                      {posts.length} {posts.length === 1 ? 'artigo' : 'artigos'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
                      <ArticleCard key={post.id} post={post} showCity={false} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-4">Em breve</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Estamos preparando conteúdos incríveis sobre a cena cultural de {cityData.name}. 
                    Volte em breve para conferir nossos destaques semanais!
                  </p>
                  <Button asChild>
                    <Link to="/destaques">
                      Ver outras cidades
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </section>
        </ScrollAnimationWrapper>
      </main>
      
      <Footer />
      <BackToTop />
    </div>
  );
};

export default CityBlogPage;