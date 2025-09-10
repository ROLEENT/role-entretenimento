import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Clock, Star, Crown, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useResponsive } from "@/hooks/useResponsive";
import { supabase } from "@/integrations/supabase/client";
import LazyImage from "@/components/LazyImage";
import { cityNameToSlug } from "@/lib/cityToSlug";

interface EventData {
  id: string;
  title: string;
  city: string;
  cover_url?: string;
  start_at: string;
  venue_name?: string;
  tags?: string[];
  featured?: boolean;
}

const AgendaPorCidade = () => {
  const { isMobile } = useResponsive();
  const [eventsByCity, setEventsByCity] = useState<Record<string, EventData[]>>({});
  const [loading, setLoading] = useState(true);

  const cities = [
    { name: 'Porto Alegre', slug: 'porto-alegre' },
    { name: 'São Paulo', slug: 'sao-paulo' },
    { name: 'Rio de Janeiro', slug: 'rio-de-janeiro' },
    { name: 'Florianópolis', slug: 'florianopolis' },
    { name: 'Curitiba', slug: 'curitiba' }
  ];

  const getBadgeConfig = (index: number, tags?: string[]) => {
    // Randomly assign badges for demo purposes - you can customize this logic
    const hasHighTraffic = tags?.includes('popular') || Math.random() > 0.7;
    const isExclusive = tags?.includes('exclusive') || index === 1;
    const isRecommended = tags?.includes('recommended') || index === 2;

    if (index === 0 && hasHighTraffic) {
      return { 
        label: "Em alta", 
        icon: Zap, 
        className: "bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground border-0 shadow-xl animate-pulse px-4 py-2 text-sm font-bold",
        ariaLabel: "Evento em alta - muito procurado"
      };
    }
    if (isExclusive) {
      return { 
        label: "Exclusivo ROLÊ", 
        icon: Crown, 
        className: "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 shadow-xl px-4 py-2 text-sm font-bold",
        ariaLabel: "Evento exclusivo da curadoria ROLÊ"
      };
    }
    if (isRecommended) {
      return { 
        label: "Recomendado", 
        icon: Star, 
        className: "bg-gradient-to-r from-accent to-accent/80 text-accent-foreground border-0 shadow-xl px-4 py-2 text-sm font-bold",
        ariaLabel: "Evento recomendado pela curadoria"
      };
    }
    return null;
  };

  useEffect(() => {
    const fetchEventsByCity = async () => {
      try {
        setLoading(true);
        
        // Mapeamento de slug para código da cidade
        const citySlugToCode: Record<string, string> = {
          'porto_alegre': 'POA',
          'sao_paulo': 'SP', 
          'rio_de_janeiro': 'RJ',
          'florianopolis': 'FLN',
          'curitiba': 'CWB'
        };

        const eventsPromises = cities.map(async (city) => {
          const cityCode = citySlugToCode[city.slug] || city.name;
          
          const { data, error } = await supabase
            .from('agenda_itens')
            .select('id, title, city, cover_url, start_at, tags')
            .eq('city', cityCode)
            .eq('status', 'published')
            .gte('start_at', new Date().toISOString())
            .order('start_at', { ascending: true })
            .limit(3);

          if (error) {
            console.error(`Erro ao carregar eventos para ${city.name}:`, error);
            return { city: city.name, events: [] };
          }
          
          return { city: city.name, events: data || [] };
        });

        const results = await Promise.all(eventsPromises);
        const eventsByCityObj = results.reduce((acc, { city, events }) => {
          acc[city] = events;
          return acc;
        }, {} as Record<string, EventData[]>);

        setEventsByCity(eventsByCityObj);
      } catch (error) {
        console.error('Erro ao carregar eventos por cidade:', error);
        // Em caso de erro, não refazer o fetch - mostrar empty state
      } finally {
        setLoading(false);
      }
    };

    // Só executa uma vez
    if (!loading && Object.keys(eventsByCity).length === 0) {
      fetchEventsByCity();
    }
  }, []); // Dependência vazia para evitar loops

  if (loading) {
    return (
      <section className={`${isMobile ? 'py-16' : 'py-24'} bg-background`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`font-heading font-bold text-foreground ${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'} mb-4`}>
              AGENDA POR CIDADE
            </h2>
          </div>
          <div className="space-y-12">
            {cities.map((city) => (
              <div key={city.name} className="animate-pulse">
                <div className="flex items-center justify-between mb-6">
                  <div className="h-8 bg-muted rounded w-48"></div>
                  <div className="h-10 bg-muted rounded w-40"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-4">
                      <div className="h-48 bg-muted rounded-lg"></div>
                      <div className="space-y-2">
                        <div className="h-6 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`${isMobile ? 'py-16' : 'py-24'} bg-background`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className={`font-heading font-bold text-foreground ${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'} mb-6`}>
            AGENDA POR CIDADE
          </h2>
          <p className={`text-muted-foreground ${isMobile ? 'text-lg' : 'text-xl'} max-w-3xl mx-auto`}>
            Bloco principal com 3 cards por cidade
          </p>
        </div>

        <div className="space-y-16">
          {cities.map((city) => {
            const events = eventsByCity[city.name] || [];
            
            return (
              <div key={city.name} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className={`font-heading font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'} flex items-center gap-3`}>
                    <MapPin className="h-7 w-7 text-primary" />
                    {city.name}
                  </h3>
                  <Button 
                    variant="outline" 
                    asChild
                    className="hover:bg-primary hover:text-primary-foreground transition-all duration-200 border-primary/20 hover:border-primary"
                  >
                    <Link to={`/agenda/cidade/${cityNameToSlug(city.name)}`}>
                      Ver todos da cidade
                    </Link>
                  </Button>
                </div>

                {events.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event, index) => {
                      const badgeConfig = getBadgeConfig(index, event.tags);
                      
                      return (
                        <Link key={event.id} to={`/agenda/${event.id}`} className="block group">
                          <Card className="h-full hover:shadow-xl transition-all duration-300 overflow-hidden border hover:border-primary/30 hover:scale-[1.02] transform">
                            <div className="relative">
                              <LazyImage
                                src={event.cover_url || '/city-placeholder.jpg'}
                                alt={`Foto do evento ${event.title} em ${event.venue_name || 'local não informado'}`}
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              
                              {/* Selo de Curadoria */}
                              {badgeConfig && (
                                <div className="absolute top-2 left-2">
                                  <div className="agenda-badge">
                                    <badgeConfig.icon className="h-3 w-3" />
                                    {badgeConfig.label}
                                  </div>
                                </div>
                              )}
                              
                              {/* Gradient Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                            </div>
                            
                            <CardContent className="p-5 flex flex-col flex-1">
                              <h4 className="font-bold text-foreground text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                                {event.title}
                              </h4>
                              
                              {/* Meta Information */}
                              <div className="space-y-2 mb-4 flex-1">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                  <CalendarDays className="h-4 w-4 text-primary flex-shrink-0" />
                                  <span className="font-medium">
                                    {new Date(event.start_at).toLocaleDateString('pt-BR', {
                                      weekday: 'short',
                                      day: '2-digit',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                
                                {event.venue_name && (
                                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                    <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                                    <span className="truncate font-medium">{event.venue_name}</span>
                                  </div>
                                )}
                              </div>

                              {/* Tags */}
                              {event.tags && event.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {event.tags.slice(0, 2).map((tag, tagIndex) => (
                                    <Badge 
                                      key={tagIndex} 
                                      variant="outline" 
                                      className="text-xs px-2 py-1 text-muted-foreground border-muted-foreground/30 hover:border-primary hover:text-primary transition-colors"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                  {event.tags.length > 2 && (
                                    <Badge 
                                      variant="outline" 
                                      className="text-xs px-2 py-1 text-muted-foreground border-muted-foreground/30"
                                    >
                                      +{event.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed border-muted">
                    <div className="max-w-md mx-auto">
                      <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-lg font-medium mb-2">Nenhum evento disponível</p>
                      <p className="text-sm">Novos eventos em {city.name} serão adicionados em breve</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AgendaPorCidade;