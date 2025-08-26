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

        {/* Carrossel Horizontal - Estilo Sympla */}
        <div className="overflow-x-auto pb-4 mb-8">
          <div className="flex gap-4 min-w-full" style={{ width: 'max-content' }}>
            {highlights.map((highlight) => (
              <Card
                key={highlight.id}
                className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-card/50 backdrop-blur-sm flex-shrink-0 w-72"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={getImageUrl(highlight.image_url)}
                    alt={`${highlight.event_title} em ${highlight.venue}`}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.jpg';
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-primary/90 text-primary-foreground text-xs">
                      {getCityDisplayName(highlight.city)}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className="flex items-center gap-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      <Heart className="w-3 h-3" />
                      <span>{highlight.like_count || 0}</span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-base line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                      {highlight.event_title}
                    </h3>
                    
                    <div className="flex items-center text-muted-foreground text-sm">
                      <MapPin className="mr-1 h-4 w-4" />
                      <span className="line-clamp-1">{highlight.venue}</span>
                    </div>

                    {highlight.event_date && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{formatHighlightDateShort(highlight.event_date)}</span>
                      </div>
                    )}
                  </div>

                  {highlight.selection_reasons && highlight.selection_reasons.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {highlight.selection_reasons.slice(0, 2).map((reason: string, index: number) => (
                        <Badge 
                          key={index}
                          variant="outline" 
                          className="text-xs px-2 py-0.5"
                        >
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Button
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <Link to={`/destaque/${highlight.id}`}>
                      Ver Destaque
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
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
              <Link to="/eventos">Ver Eventos</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedHighlights;