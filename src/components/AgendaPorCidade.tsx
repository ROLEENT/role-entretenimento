import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Clock, Star, Crown, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useResponsive } from "@/hooks/useResponsive";
import { supabase } from "@/integrations/supabase/client";
import LazyImage from "@/components/LazyImage";

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

  const getCurationBadge = (index: number, isHighlighted?: boolean) => {
    if (index === 0 && isHighlighted) {
      return { label: "Em alta", icon: Zap, variant: "destructive" as const };
    }
    if (index === 1) {
      return { label: "Exclusivo ROLÊ", icon: Crown, variant: "default" as const };
    }
    if (index === 2) {
      return { label: "Destaque", icon: Star, variant: "secondary" as const };
    }
    return null;
  };

  useEffect(() => {
    const fetchEventsByCity = async () => {
      try {
        setLoading(true);
        const eventsPromises = cities.map(async (city) => {
          const { data, error } = await supabase
            .from('agenda')
            .select('id, title, city, cover_url, start_at, venue_name, tags')
            .eq('city', city.name)
            .eq('is_published', true)
            .gte('start_at', new Date().toISOString())
            .order('start_at', { ascending: true })
            .limit(3);

          if (error) throw error;
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
      } finally {
        setLoading(false);
      }
    };

    fetchEventsByCity();
  }, []);

  if (loading) {
    return (
      <section className={`${isMobile ? 'py-16' : 'py-24'} bg-background`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`font-heading font-bold text-foreground ${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'} mb-4`}>
              AGENDA POR CIDADE
            </h2>
          </div>
          <div className="grid gap-8">
            {cities.map((city) => (
              <div key={city.name} className="animate-pulse">
                <h3 className="h-8 bg-muted rounded mb-4 w-48"></h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-64 bg-muted rounded-lg"></div>
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
              <div key={city.name} className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className={`font-heading font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'} flex items-center gap-3`}>
                    <MapPin className="h-8 w-8 text-primary" />
                    {city.name}
                  </h3>
                  <Button variant="outline" asChild>
                    <Link to={`/agenda/${city.slug}`}>
                      Ver todos da cidade
                    </Link>
                  </Button>
                </div>

                {events.length > 0 ? (
                  <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'} gap-6`}>
                    {events.map((event, index) => {
                      const curationBadge = getCurationBadge(index, index === 0);
                      
                      return (
                        <Card key={event.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-2 hover:border-primary/20">
                          <div className="relative">
                            <LazyImage
                              src={event.cover_url || '/assets/city-placeholder.jpg'}
                              alt={event.title}
                              className={`w-full ${isMobile ? 'h-48' : 'h-56'} object-cover group-hover:scale-105 transition-transform duration-500`}
                            />
                            
                            {/* Selo de curadoria */}
                            {curationBadge && (
                              <div className="absolute top-3 left-3">
                                <Badge variant={curationBadge.variant} className="flex items-center gap-1 px-3 py-1 text-xs font-bold shadow-lg">
                                  <curationBadge.icon className="h-3 w-3" />
                                  {curationBadge.label}
                                </Badge>
                              </div>
                            )}
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                          </div>
                          
                          <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                            <h4 className={`font-bold text-foreground ${isMobile ? 'text-lg' : 'text-xl'} mb-3 line-clamp-2 group-hover:text-primary transition-colors`}>
                              {event.title}
                            </h4>
                            
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <CalendarDays className="h-4 w-4 text-primary" />
                                <span>
                                  {new Date(event.start_at).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              
                              {event.venue_name && (
                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                  <MapPin className="h-4 w-4 text-primary" />
                                  <span className="truncate">{event.venue_name}</span>
                                </div>
                              )}
                            </div>

                            {/* Tags */}
                            {event.tags && event.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-4">
                                {event.tags.slice(0, 2).map((tag, tagIndex) => (
                                  <Badge key={tagIndex} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Nenhum evento disponível para {city.name}</p>
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