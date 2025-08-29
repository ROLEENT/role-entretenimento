import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useResponsive } from "@/hooks/useResponsive";
import { supabase } from "@/integrations/supabase/client";
import LazyImage from "@/components/LazyImage";

interface BlogPost {
  id: string;
  title: string;
  excerpt?: string;
  cover_image?: string;
  published_at: string;
  read_time?: number;
  city?: string;
  slug: string;
}

const BlocoRevista = () => {
  const { isMobile } = useResponsive();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('blog_posts')
          .select('id, title, excerpt, cover_image, published_at, read_time, city, slug')
          .eq('published', true)
          .order('published_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        setPosts(data || []);
      } catch (error) {
        console.error('Erro ao carregar posts do blog:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  const getReadTimeText = (readTime?: number) => {
    if (!readTime) return "5 min";
    return `${readTime} min`;
  };

  if (loading) {
    return (
      <section className={`${isMobile ? 'py-16' : 'py-24'} bg-gradient-to-br from-muted/20 to-background`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-pulse">
            <div className="h-12 bg-muted rounded mb-4 w-80 mx-auto"></div>
            <div className="h-6 bg-muted rounded w-96 mx-auto"></div>
          </div>
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'} gap-8`}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-lg mb-4"></div>
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`${isMobile ? 'py-16' : 'py-24'} bg-gradient-to-br from-muted/20 to-background relative overflow-hidden`}>
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className={`font-heading font-bold text-foreground ${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'} mb-6`}>
            HISTÓRIAS DO ROLÊ
          </h2>
          <p className={`text-muted-foreground ${isMobile ? 'text-lg' : 'text-xl'} max-w-3xl mx-auto mb-8`}>
            Artigos, entrevistas e reflexões que atravessam a cena
          </p>
        </div>

        {posts.length > 0 ? (
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-8' : 'grid-cols-1 md:grid-cols-3 gap-8'} mb-12`}>
            {posts.map((post, index) => (
              <Card key={post.id} className="group hover:shadow-xl transition-all duration-500 overflow-hidden border-2 hover:border-primary/20 bg-card/80 backdrop-blur-sm">
                <div className="relative">
                  <LazyImage
                    src={post.cover_image || '/assets/city-placeholder.jpg'}
                    alt={post.title}
                    className={`w-full ${isMobile ? 'h-48' : 'h-56'} object-cover group-hover:scale-105 transition-transform duration-500`}
                  />
                  
                  {/* Editorial Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                      EDITORIAL
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                </div>
                
                <CardContent className={`${isMobile ? 'p-5' : 'p-6'}`}>
                  <h3 className={`font-bold text-foreground ${isMobile ? 'text-lg' : 'text-xl'} mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-tight`}>
                    {post.title}
                  </h3>
                  
                  {post.excerpt && (
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{getReadTimeText(post.read_time)} de leitura</span>
                    </div>
                    
                    {post.city && (
                      <div className="text-xs text-primary font-medium">
                        {post.city}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              Em breve, novos artigos e histórias
            </p>
          </div>
        )}

        <div className="text-center">
          <Button 
            size="lg" 
            variant="outline"
            className="group px-8 py-6 text-lg rounded-full border-2 hover:shadow-lg"
            asChild
          >
            <Link to="/destaques">
              <BookOpen className="mr-3 h-6 w-6" />
              Ler mais
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlocoRevista;