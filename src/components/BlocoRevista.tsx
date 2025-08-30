import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('blog_posts')
          .select('id, title, cover_image, published_at, read_time, city, slug')
          .eq('published', true)
          .order('published_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        setPosts(data || []);
      } catch (error) {
        console.error('Erro ao carregar posts do blog:', error);
        // Fallback to empty array on error
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  const nextSlide = () => {
    if (posts.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % posts.length);
    }
  };

  const prevSlide = () => {
    if (posts.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + posts.length) % posts.length);
    }
  };

  const scrollToSlide = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (isMobile && posts.length > 0) {
      scrollToSlide(currentSlide);
    }
  }, [currentSlide, isMobile, posts.length]);

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
          <div className={`${isMobile ? 'flex gap-4 overflow-hidden' : 'grid grid-cols-1 md:grid-cols-3 gap-8'}`}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`animate-pulse ${isMobile ? 'flex-shrink-0 w-80' : ''}`}>
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
          <h2 className={`font-serif font-bold text-foreground ${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'} mb-6`}>
            HISTÓRIAS DO ROLÊ
          </h2>
          <p className={`text-muted-foreground ${isMobile ? 'text-lg' : 'text-xl'} max-w-3xl mx-auto mb-8`}>
            Artigos, entrevistas e reflexões que atravessam a cena
          </p>
        </div>

        {posts.length > 0 ? (
          <>
            {isMobile ? (
              /* Mobile Carousel */
              <div className="relative mb-12">
                <div 
                  ref={carouselRef}
                  className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {posts.map((post, index) => (
                    <Link key={post.id} to={`/revista/${post.slug}`} className="flex-shrink-0 w-80 snap-start">
                      <Card className="h-full group hover:shadow-xl transition-all duration-500 overflow-hidden border hover:border-primary/30 bg-card/80 backdrop-blur-sm">
                        <div className="relative">
                          <LazyImage
                            src={post.cover_image || '/city-placeholder.jpg'}
                            alt={post.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          
                          {/* Editorial Badge */}
                          <div className="absolute top-4 left-4">
                            <div className="bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm">
                              EDITORIAL
                            </div>
                          </div>
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                        </div>
                        
                        <CardContent className="p-5">
                          <h3 className="font-serif font-bold text-foreground text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                            {post.title}
                          </h3>
                          
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                            {post.excerpt || 'Descubra mais sobre este artigo na nossa revista.'}
                          </p>
                          
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
                    </Link>
                  ))}
                </div>
                
                {/* Mobile Navigation Arrows */}
                <div className="flex justify-center items-center gap-4 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevSlide}
                    className="h-10 w-10 p-0 rounded-full"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex gap-2">
                    {posts.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentSlide ? 'bg-primary' : 'bg-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextSlide}
                    className="h-10 w-10 p-0 rounded-full"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              /* Desktop Grid */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {posts.map((post, index) => (
                  <Link key={post.id} to={`/revista/${post.slug}`} className="block group">
                    <Card className="h-full hover:shadow-xl transition-all duration-500 overflow-hidden border hover:border-primary/30 bg-card/80 backdrop-blur-sm">
                      <div className="relative">
                        <LazyImage
                          src={post.cover_image || '/city-placeholder.jpg'}
                          alt={post.title}
                          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* Editorial Badge */}
                        <div className="absolute top-4 left-4">
                          <div className="bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm">
                            EDITORIAL
                          </div>
                        </div>
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                      </div>
                      
                      <CardContent className="p-6">
                        <h3 className="font-serif font-bold text-foreground text-xl mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                          {post.title}
                        </h3>
                        
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                          {post.excerpt || 'Descubra mais sobre este artigo na nossa revista.'}
                        </p>
                        
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
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              Em breve, novos artigos e histórias
            </p>
          </div>
        )}

        <div className="text-right">
          <Button 
            size="lg" 
            variant="outline"
            className="group px-8 py-6 text-lg rounded-full border-2 hover:shadow-lg hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
            asChild
          >
            <Link to="/revista">
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