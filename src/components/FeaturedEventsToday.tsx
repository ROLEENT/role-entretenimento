import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Star, Eye, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import { useResponsive } from "@/hooks/useResponsive";
import { supabase } from "@/integrations/supabase/client";
import LazyImage from "@/components/LazyImage";

interface FeaturedEvent {
  id: string;
  title: string;
  city: string;
  cover_url?: string;
  start_at: string;
  venue_name?: string;
  tags?: string[];
  event_type: 'curadoria' | 'vitrine';
  price_min?: number;
  price_max?: number;
}

const FeaturedEventsToday = () => {
  const { isMobile } = useResponsive();
  const [selectedCity, setSelectedCity] = useState("Todas");
  const [events, setEvents] = useState<FeaturedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const cities = [
    { name: 'Todas', value: 'Todas' },
    { name: 'Porto Alegre', value: 'Porto Alegre' },
    { name: 'São Paulo', value: 'São Paulo' },
    { name: 'Rio de Janeiro', value: 'Rio de Janeiro' },
    { name: 'Florianópolis', value: 'Florianópolis' },
    { name: 'Curitiba', value: 'Curitiba' }
  ];

  const getBadgeConfig = (eventType: string, index: number) => {
    if (eventType === 'curadoria') {
      return {
        label: "Recomendado",
        icon: Star,
        className: "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg"
      };
    } else {
      return {
        label: "Vitrine Cultural",
        icon: Eye,
        className: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-lg"
      };
    }
  };

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        setLoading(true);
        
        // Create a mixed array of events from agenda (curadoria) and events (vitrine)
        const mixedEvents: FeaturedEvent[] = [];
        
        // Fetch curated events from agenda
        const { data: agendaData, error: agendaError } = await supabase
          .from('agenda_itens')
          .select('id, title, city, cover_url, start_at, location_name, tags')
          .eq('status', 'published')
          .gte('start_at', new Date().toISOString())
          .order('start_at', { ascending: true })
          .limit(2);

        if (agendaData && !agendaError) {
          const curatedEvents = agendaData.map(event => ({
            ...event,
            venue_name: event.location_name,
            event_type: 'curadoria' as const
          }));
          mixedEvents.push(...curatedEvents);
        }

        // Fetch vitrine events
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('id, title, city, image_url, date_start, tags, price_min, price_max')
          .eq('status', 'active')
          .gte('date_start', new Date().toISOString())
          .order('date_start', { ascending: true })
          .limit(1);

        if (eventsData && !eventsError) {
          const vitrineEvents = eventsData.map(event => ({
            id: event.id,
            title: event.title,
            city: event.city,
            cover_url: event.image_url,
            start_at: event.date_start,
            venue_name: undefined, // Will be handled separately if needed
            tags: event.tags,
            event_type: 'vitrine' as const,
            price_min: event.price_min,
            price_max: event.price_max
          }));
          mixedEvents.push(...vitrineEvents);
        }

        // Filter by city if not "Todas"
        const filteredEvents = selectedCity === 'Todas' 
          ? mixedEvents 
          : mixedEvents.filter(event => event.city === selectedCity);

        // Shuffle and limit to 3
        const shuffledEvents = filteredEvents.sort(() => Math.random() - 0.5).slice(0, 3);
        setEvents(shuffledEvents);

      } catch (error) {
        console.error('Erro ao carregar eventos em destaque:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedEvents();
  }, [selectedCity]);

  const formatPrice = (priceMin?: number, priceMax?: number) => {
    if (!priceMin || priceMin === 0) return "GRATUITO";
    if (!priceMax || priceMax === priceMin) return `R$ ${priceMin}`;
    return `R$ ${priceMin} - R$ ${priceMax}`;
  };

  if (loading) {
    return (
      <section className={`${isMobile ? 'py-16' : 'py-24'} bg-background`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-pulse">
            <div className="h-12 bg-muted rounded mb-4 w-80 mx-auto"></div>
            <div className="h-6 bg-muted rounded w-96 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4 animate-pulse">
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
      </section>
    );
  }

  return (
    <section className={`${isMobile ? 'py-16' : 'py-24'} bg-background relative overflow-hidden`}>
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className={`font-heading font-bold text-foreground ${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'} mb-6`}>
            EVENTOS EM DESTAQUE
          </h2>
          <p className={`text-muted-foreground ${isMobile ? 'text-lg' : 'text-xl'} max-w-3xl mx-auto mb-8`}>
            Seleção de rolês em alta e da Vitrine Cultural
          </p>
          
          {/* City Filter Dropdown */}
          <div className="flex justify-center">
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className={`${isMobile ? 'w-full max-w-xs' : 'w-64'} h-12 text-base font-medium border-2 border-primary/20 hover:border-primary transition-colors`}>
                <SelectValue placeholder="Selecione uma cidade" />
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-md border">
                {cities.map((city) => (
                  <SelectItem key={city.value} value={city.value} className="text-base">
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {events.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {events.map((event, index) => {
                const badgeConfig = getBadgeConfig(event.event_type, index);
                
                return (
                  <Link key={`${event.event_type}-${event.id}`} to={`/${event.event_type === 'curadoria' ? 'agenda' : 'evento'}/${event.id}`} className="block group">
                    <Card className="h-full hover:shadow-xl transition-all duration-300 overflow-hidden border hover:border-primary/30 hover:scale-[1.02] transform">
                      <div className="relative">
                        <LazyImage
                          src={event.cover_url || '/city-placeholder.jpg'}
                          alt={event.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* Event Type Badge */}
                        <div className="absolute top-3 left-3">
                          <Badge className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold ${badgeConfig.className}`}>
                            <badgeConfig.icon className="h-3.5 w-3.5" />
                            {badgeConfig.label}
                          </Badge>
                        </div>
                        
                        {/* City Badge */}
                        <div className="absolute top-3 right-3">
                          <Badge variant="secondary" className="text-xs font-medium bg-background/90 text-foreground">
                            {event.city}
                          </Badge>
                        </div>
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      </div>
                      
                      <CardContent className="p-6">
                        <h3 className="font-bold text-foreground text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                          {event.title}
                        </h3>
                        
                        {/* Meta Information */}
                        <div className="space-y-2 mb-4">
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

                        {/* Price */}
                        {event.event_type === 'vitrine' && (
                          <div className="mt-4 pt-4 border-t border-muted">
                            <span className="text-lg font-bold text-primary">
                              {formatPrice(event.price_min, event.price_max)}
                            </span>
                          </div>
                        )}

                        {/* Tags */}
                        {event.tags && event.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-4">
                            {event.tags.slice(0, 2).map((tag, tagIndex) => (
                              <Badge 
                                key={tagIndex} 
                                variant="outline" 
                                className="text-xs px-2 py-1 text-muted-foreground border-muted-foreground/30"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {event.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs px-2 py-1 text-muted-foreground">
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
            
            <div className="text-center">
              <Button 
                size="lg" 
                variant="outline"
                className="group px-8 py-6 text-lg rounded-full border-2 hover:shadow-lg hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
                asChild
              >
                <Link to="/eventos">
                  <Eye className="mr-3 h-6 w-6" />
                  Ver toda a Vitrine
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-16 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed border-muted">
            <div className="max-w-md mx-auto">
              <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium mb-2">Nenhum evento em destaque</p>
              <p className="text-sm">
                {selectedCity === 'Todas' 
                  ? 'Novos eventos serão adicionados em breve' 
                  : `Novos eventos em ${selectedCity} serão adicionados em breve`
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedEventsToday;