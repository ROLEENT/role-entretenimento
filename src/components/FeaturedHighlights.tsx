import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { MapPin, Calendar, ArrowRight, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import HighlightSkeleton from './HighlightSkeleton';
import { formatHighlightDateShort } from "@/utils/dateUtils";

const FeaturedHighlights = () => {
  const [highlights, setHighlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch top 12 most liked highlights globally
  useEffect(() => {
    const fetchTopHighlights = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('highlights')
          .select('*')
          .eq('is_published', true)
          .order('like_count', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(12);

        if (fetchError) throw fetchError;
        setHighlights(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar destaques');
      } finally {
        setLoading(false);
      }
    };

    fetchTopHighlights();
  }, []);

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '/placeholder.svg';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `https://nutlcbnruabjsxecqpnd.supabase.co/storage/v1/object/public/highlights/${imageUrl}`;
  };

  const getCityDisplayName = (city: string) => {
    const cityNames: Record<string, string> = {
      'porto_alegre': 'Porto Alegre',
      'sao_paulo': 'São Paulo',
      'rio_de_janeiro': 'Rio de Janeiro',
      'florianopolis': 'Florianópolis',
      'curitiba': 'Curitiba'
    };
    return cityNames[city] || city;
  };

  const itemsPerSlide = 3;
  const totalSlides = Math.ceil(highlights.length / itemsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const getVisibleHighlights = () => {
    const start = currentSlide * itemsPerSlide;
    return highlights.slice(start, start + itemsPerSlide);
  };


  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Destaques da Semana
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <HighlightSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-muted-foreground">Erro ao carregar destaques: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            🔥 Top Destaques do ROLÊ
          </h2>
          <p className="text-muted-foreground mb-6">Os eventos mais curtidos de todas as cidades</p>
          <Button variant="outline" className="rounded-full" asChild>
              <Link to="/destaques">
                Ver todos os destaques
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          {totalSlides > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-lg"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-lg"
                onClick={nextSlide}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Carousel Content */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {highlights
                      .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                      .map((highlight) => (
                      <Card
                        key={highlight.id}
                        className="group overflow-hidden bg-gradient-card hover:shadow-elevated transition-all duration-500 hover:-translate-y-2 border-0"
                      >
                        <div className="relative overflow-hidden">
                          <img
                            src={getImageUrl(highlight.image_url)}
                            alt={`${highlight.event_title} em ${highlight.venue}`}
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.jpg';
                            }}
                          />
                          <div className="absolute top-4 left-4">
                            <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
                              {getCityDisplayName(highlight.city)}
                            </Badge>
                          </div>
                          <div className="absolute top-4 right-4">
                            <Badge variant="outline" className="bg-black/50 text-white text-xs">
                              <Calendar className="mr-1 h-3 w-3" />
                              {formatHighlightDateShort(highlight.event_date)}
                            </Badge>
                          </div>
                          {highlight.photo_credit && (
                            <div className="absolute bottom-2 right-2">
                              <Badge variant="outline" className="bg-black/50 text-white text-xs">
                                {highlight.photo_credit}
                              </Badge>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        </div>

                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center justify-between">
                            <span className="text-lg font-bold text-foreground line-clamp-1">
                              {highlight.event_title}
                            </span>
                            <div className="flex items-center space-x-1">
                              <Heart className="h-4 w-4 text-red-500" />
                              <span className="text-sm font-medium">{highlight.like_count || 0}</span>
                            </div>
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <div className="flex items-center text-muted-foreground mb-2">
                            <MapPin className="mr-1 h-4 w-4" />
                            <span className="text-sm">{highlight.venue}</span>
                          </div>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {highlight.role_text}
                          </p>
                          
                          <div className="flex flex-wrap gap-1">
                            {highlight.selection_reasons.slice(0, 2).map((reason, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {reason}
                              </Badge>
                            ))}
                            {highlight.selection_reasons.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{highlight.selection_reasons.length - 2}
                              </Badge>
                            )}
                          </div>

                          <Button
                            className="w-full bg-gradient-primary hover:opacity-90 text-white font-medium rounded-full"
                            asChild
                          >
                            <Link to={`/destaque/${highlight.id}`}>
                              Ver Destaque
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          {totalSlides > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          )}
        </div>

        {highlights.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Nenhum destaque publicado no momento
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Volte em breve para ver os novos destaques da cena cultural!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedHighlights;