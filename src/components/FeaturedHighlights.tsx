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
  const [selectedCity, setSelectedCity] = useState<string>('porto_alegre');

  const cities = [
    { value: 'porto_alegre', label: 'Porto Alegre, RS' },
    { value: 'sao_paulo', label: 'São Paulo, SP' },
    { value: 'rio_de_janeiro', label: 'Rio de Janeiro, RJ' },
    { value: 'florianopolis', label: 'Florianópolis, SC' },
    { value: 'curitiba', label: 'Curitiba, PR' }
  ];

  // Fetch top 2 highlights for selected city
  useEffect(() => {
    const fetchCityHighlights = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('highlights')
          .select('*')
          .eq('is_published', true)
          .eq('city', selectedCity)
          .order('like_count', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(2);

        if (fetchError) throw fetchError;
        setHighlights(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar destaques');
      } finally {
        setLoading(false);
      }
    };

    fetchCityHighlights();
  }, [selectedCity]);

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
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            DESTAQUES POPULARES EM 🇧🇷 BRASIL
          </h2>
          
          {/* City Selector */}
          <div className="flex justify-center mb-8">
            <div className="w-64">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma cidade" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.value} value={city.value}>
                      {city.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Two Large Cards Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {highlights.map((highlight) => (
            <Card
              key={highlight.id}
              className="group overflow-hidden bg-gradient-card hover:shadow-elevated transition-all duration-500 hover:-translate-y-2 border-0"
            >
              <div className="relative overflow-hidden">
                <img
                  src={getImageUrl(highlight.image_url)}
                  alt={`${highlight.event_title} em ${highlight.venue}`}
                  className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
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

              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-foreground line-clamp-2">
                    {highlight.event_title}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span className="text-lg font-medium">{highlight.like_count || 0}</span>
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center text-muted-foreground mb-3">
                  <MapPin className="mr-2 h-5 w-5" />
                  <span className="text-base font-medium">{highlight.venue}</span>
                </div>
                
                <p className="text-base text-muted-foreground line-clamp-3">
                  {highlight.role_text}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {highlight.selection_reasons.slice(0, 3).map((reason, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {reason}
                    </Badge>
                  ))}
                  {highlight.selection_reasons.length > 3 && (
                    <Badge variant="outline" className="text-sm">
                      +{highlight.selection_reasons.length - 3}
                    </Badge>
                  )}
                </div>

                <Button
                  className="w-full bg-gradient-primary hover:opacity-90 text-white font-bold text-lg py-6 rounded-full"
                  asChild
                >
                  <Link to={`/destaque/${highlight.id}`}>
                    Ver Destaque
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
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
            <p className="text-muted-foreground text-lg mb-2">
              Nenhum destaque encontrado para {cities.find(c => c.value === selectedCity)?.label}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Experimente selecionar outra cidade para ver os destaques disponíveis
            </p>
            <Button 
              variant="outline" 
              onClick={() => setSelectedCity('porto_alegre')}
              className="rounded-full"
            >
              Ver Porto Alegre
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedHighlights;