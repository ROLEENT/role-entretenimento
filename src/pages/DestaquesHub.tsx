import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, ArrowRight } from "lucide-react";
import { blogPosts, getLatestPostByCity } from "@/data/blogData";
import { citiesData } from "@/data/citiesData";
import ArticleCard from "@/components/blog/ArticleCard";
import ScrollAnimationWrapper from "@/components/ScrollAnimationWrapper";
import cityPlaceholder from "@/assets/city-placeholder.jpg";

const DestaquesHub = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Update page title and meta
  useState(() => {
    document.title = "Destaques ROLÊ | Curadoria Cultural Semanal";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', "Curadoria editorial semanal das melhores experiências culturais do Brasil. Descubra os rolês que vão marcar a sua cidade.");
    }
  });
  
  // Get featured posts and city previews
  const featuredPosts = blogPosts.filter(post => post.featured);
  const cities = Object.values(citiesData);
  
  // Filter posts based on search
  const filteredPosts = blogPosts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
          <div className="relative container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Destaques <span className="text-primary">ROLÊ</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Curadoria editorial semanal das melhores experiências culturais do Brasil.
              Descubra os rolês que vão marcar a sua cidade.
            </p>
            
            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar artigos, cidades ou tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </section>

        {/* Featured Articles */}
        {!searchQuery && (
          <ScrollAnimationWrapper>
            <section className="py-16 bg-muted/30">
              <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold">Destaques da Semana</h2>
                  <Badge variant="secondary" className="px-3 py-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Esta semana
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredPosts.map((post) => (
                    <ArticleCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            </section>
          </ScrollAnimationWrapper>
        )}

        {/* Cities Preview */}
        {!searchQuery && (
          <ScrollAnimationWrapper>
            <section className="py-16">
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold mb-8 text-center">Explore por Cidade</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cities.map((city) => {
                    const latestPost = getLatestPostByCity(city.id);
                    
                    return (
                      <Card key={city.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                        <div className="relative overflow-hidden">
                          <img 
                            src={city.image} 
                            alt={city.name}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = cityPlaceholder;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-2xl font-bold text-white mb-2">{city.name}</h3>
                            <p className="text-gray-200 text-sm">{city.state}</p>
                          </div>
                        </div>
                        
                        <CardContent className="p-6">
                          {latestPost ? (
                            <>
                              <div className="mb-4">
                                <h4 className="font-semibold mb-2 line-clamp-2">
                                  {latestPost.title}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {latestPost.weekRange} • {latestPost.readTime} min
                                </p>
                              </div>
                              
                              <Button asChild variant="outline" className="w-full group">
                                <Link to={`/destaques/${city.id}`}>
                                  Ver todos os artigos
                                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                              </Button>
                            </>
                          ) : (
                            <>
                              <p className="text-muted-foreground mb-4">
                                Em breve, artigos sobre a cena cultural de {city.name}.
                              </p>
                              <Button disabled variant="outline" className="w-full">
                                Em breve
                              </Button>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </section>
          </ScrollAnimationWrapper>
        )}

        {/* Search Results */}
        {searchQuery && (
          <ScrollAnimationWrapper>
            <section className="py-16">
              <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold mb-6">
                  Resultados para "{searchQuery}" ({filteredPosts.length})
                </h2>
                
                {filteredPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPosts.map((post) => (
                      <ArticleCard key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      Nenhum artigo encontrado para sua busca.
                    </p>
                    <Button onClick={() => setSearchQuery("")} variant="outline">
                      Ver todos os artigos
                    </Button>
                  </div>
                )}
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