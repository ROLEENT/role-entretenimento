import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { MapPin, Calendar, ArrowRight, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import HighlightSkeleton from './HighlightSkeleton';
import { formatHighlightDateShort } from "@/utils/dateUtils";
import { LikeSystem } from "./events/LikeSystem";

const FeaturedHighlights = () => {
  const [highlights, setHighlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cities = [
    'porto_alegre',
    'sao_paulo', 
    'rio_de_janeiro',
    'florianopolis',
    'curitiba'
  ];

  // Fetch 1 highlight per city (most recent/liked)
  useEffect(() => {
    const fetchMultiCityHighlights = async () => {
      try {
        setLoading(true);
        setError(null);

        const allHighlights: any[] = [];
        
        // Buscar 1 destaque por cidade
        for (const city of cities) {
          const { data, error: fetchError } = await supabase
            .from('highlights')
            .select('*')
            .eq('is_published', true)
            .eq('city', city)
            .order('like_count', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(1);

          if (fetchError) throw fetchError;
          if (data && data.length > 0) {
            allHighlights.push(data[0]);
          }
        }

        setHighlights(allHighlights);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar destaques');
      } finally {
        setLoading(false);
      }
    };

    fetchMultiCityHighlights();
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

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              DESTAQUES POPULARES EM 🇧🇷 BRASIL
            </h2>
            <div className="flex justify-center mb-6">
              <div className="w-64">
                <div className="h-10 bg-muted/50 rounded-md animate-pulse" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <HighlightSkeleton />
            <HighlightSkeleton />
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Destaques pelo Brasil
          </h2>
          <p className="text-muted-foreground text-lg">
            Os melhores eventos de cada capital brasileira
          </p>
        </div>

        {/* Carrossel Horizontal - Sympla Style */}
        <div className="relative">
          {/* Fade gradients nas bordas */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none md:w-16"></div>
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none md:w-16"></div>
          
          <div 
            className="featured-highlights-carousel overflow-x-auto scrollbar-hide pb-4 mb-8"
            style={{ 
              scrollBehavior: 'smooth',
              scrollSnapType: 'x mandatory'
            }}
          >
            <div className="flex gap-3 px-6 md:gap-4 md:px-8 min-w-full">
              {highlights.map((highlight) => (
                <Link 
                  key={highlight.id} 
                  to={`/destaque/${highlight.id}`}
                  className="block flex-shrink-0 w-[280px] md:w-[320px] featured-highlight-card"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 bg-card/80 backdrop-blur-sm h-full hover:bg-card">
                    <div className="relative overflow-hidden">
                      <img
                        src={getImageUrl(highlight.image_url)}
                        alt={`${highlight.event_title} em ${highlight.venue}`}
                        className="w-full h-40 md:h-44 object-cover group-hover:scale-105 transition-transform duration-700"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.jpg';
                        }}
                      />
                      
                      {/* Enhanced gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                      
                      <div className="absolute top-2 left-3">
                        <Badge className="bg-primary/95 text-primary-foreground text-xs font-medium backdrop-blur-sm shadow-sm">
                          <MapPin className="w-3 h-3 mr-1" />
                          {getCityDisplayName(highlight.city)}
                        </Badge>
                      </div>
                      
                      <div className="absolute top-2 right-3">
                        <div className="bg-black/80 backdrop-blur-sm rounded-full">
                          <LikeSystem 
                            entityId={highlight.id} 
                            entityType="highlight" 
                            initialLikeCount={highlight.like_count || 0} 
                            showCount={true}
                          />
                        </div>
                      </div>
                      
                      {/* Título na parte inferior da imagem */}
                      <div className="absolute bottom-2 left-3 right-3">
                        <h3 className="font-bold text-white text-sm md:text-base line-clamp-2 drop-shadow-lg">
                          {highlight.event_title}
                        </h3>
                      </div>
                    </div>

                    <CardContent className="p-3 md:p-4 space-y-2 md:space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center text-muted-foreground text-xs md:text-sm">
                          <span className="line-clamp-1 font-medium">{highlight.venue}</span>
                        </div>

                        {highlight.event_date && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span className="font-medium">{formatHighlightDateShort(highlight.event_date)}</span>
                          </div>
                        )}
                      </div>

                      {highlight.selection_reasons && highlight.selection_reasons.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {highlight.selection_reasons.slice(0, 2).map((reason: string, index: number) => (
                            <Badge 
                              key={index}
                              variant="outline" 
                              className="text-xs px-2 py-0.5 border-primary/30 text-primary bg-primary/10 hover:bg-primary/20"
                            >
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Button variant="outline" className="rounded-full" asChild>
            <Link to="/destaques">
              Ver todos os destaques
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Empty State */}
        {highlights.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">
              Nenhum destaque encontrado no momento
            </p>
            <Button variant="outline" asChild>
              <Link to="/eventos">Ver Vitrine Cultural</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedHighlights;