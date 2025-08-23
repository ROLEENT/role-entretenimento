import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, ArrowRight } from "lucide-react";
import { useBlogData, BlogPost } from "@/hooks/useBlogData";
import ScrollAnimationWrapper from "@/components/ScrollAnimationWrapper";
import { Skeleton } from "@/components/ui/skeleton";

const FeaturedBlogPosts = () => {
  const { posts, isLoading } = useBlogData();
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    if (posts.length > 0) {
      // Get featured posts or latest posts if no featured ones
      const featured = posts.filter(post => post.featured).slice(0, 3);
      if (featured.length === 0) {
        setFeaturedPosts(posts.slice(0, 3));
      } else {
        setFeaturedPosts(featured);
      }
    }
  }, [posts]);

  if (isLoading) {
    return (
      <ScrollAnimationWrapper>
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Skeleton className="h-8 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
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
          </div>
        </section>
      </ScrollAnimationWrapper>
    );
  }

  if (featuredPosts.length === 0) {
    return null;
  }

  return (
    <ScrollAnimationWrapper>
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Destaques da Semana
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Confira os melhores eventos e experiências culturais selecionados pela nossa equipe
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredPosts.map((post, index) => (
              <Card key={post.id} className="group hover-lift overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={post.cover_image || "/banner-home.png"}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                  {index === 0 && (
                    <Badge className="absolute top-4 left-4">
                      Destaque Principal
                    </Badge>
                  )}
                  <div className="absolute bottom-4 left-4 text-white">
                    <Badge variant="secondary" className="mb-2">
                      <MapPin className="w-3 h-3 mr-1" />
                      {post.city}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {post.summary}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      {post.reading_time || 5} min de leitura
                    </div>
                    <Button asChild size="sm" variant="ghost">
                      <Link to={`/destaques/${post.city}/${post.slug_data}`}>
                        Ler mais
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Button asChild size="lg" variant="outline">
              <Link to="/destaques">
                Ver Todos os Destaques
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </ScrollAnimationWrapper>
  );
};

export default FeaturedBlogPosts;