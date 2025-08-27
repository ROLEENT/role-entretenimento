import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { MobileSafeImage } from "@/components/ui/mobile-safe-image";
import { useResponsive } from "@/hooks/useResponsive";
import { supabase } from "@/integrations/supabase/client";
import { LikeSystem } from "@/components/events/LikeSystem";

const FeaturedEventsToday = () => {
  const [selectedCity, setSelectedCity] = useState('São Paulo');
  const [events, setEvents] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isMobile, isTablet } = useResponsive();
  
  // Fetch available cities
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('city, state')
          .eq('status', 'active');
        
        if (error) throw error;
        
        if (data) {
          const uniqueCities = [...new Set(data.map(event => event.city))];
          setCities(uniqueCities);
          if (uniqueCities.length > 0 && !uniqueCities.includes(selectedCity)) {
            setSelectedCity(uniqueCities[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
        setCities([]);
      }
    };
    
    fetchCities();
  }, [selectedCity]);

  // Fetch events for selected city
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('status', 'active')
          .eq('city', selectedCity)
          .gte('date_start', new Date().toISOString())
          .order('date_start', { ascending: true })
          .limit(2);
        
        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (selectedCity) {
      fetchEvents();
    }
  }, [selectedCity]);

  return (
    <section className={`${isMobile ? 'py-8' : 'py-16'} bg-gradient-to-br from-primary/5 to-secondary/5`}>
      <ResponsiveContainer className="container mx-auto" padding={isMobile ? 'sm' : 'md'}>
        <div className="text-center mb-12">
          <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl md:text-5xl'} font-bold text-foreground mb-6`}>
            VITRINE CULTURAL POPULAR EM 🇧🇷 BRASIL
          </h2>
          
          <div className="flex justify-center mb-8">
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className={`${isMobile ? 'w-full max-w-xs h-10' : 'w-64 h-12'} text-lg font-medium touch-target`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city} value={city} className="text-lg">
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">Carregando eventos...</p>
          </div>
        ) : events.length > 0 ? (
          <ResponsiveGrid 
            cols={{ default: 1, lg: 2 }} 
            gap={isMobile ? 'md' : 'lg'} 
            className="mb-12"
          >
            {events.map((event) => (
              <Card 
                key={event.id} 
                className="group hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden bg-card border-2 hover:border-primary/30"
              >
                <div className="relative overflow-hidden">
                  <MobileSafeImage
                    src={event.image_url || '/assets/city-placeholder.jpg'}
                    alt={event.title}
                    className={`w-full ${isMobile ? 'h-56' : 'h-80'} object-cover group-hover:scale-105 transition-transform duration-500`}
                    loading="lazy"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    DESTAQUE
                  </div>
                  <div className="absolute top-4 right-4 bg-background/95 backdrop-blur-sm text-foreground px-3 py-2 rounded-full text-sm font-semibold border">
                    {event.city}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                  <h3 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'} mb-4 text-foreground group-hover:text-primary transition-colors leading-tight`}>
                    {event.title}
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span className="text-base font-medium">{event.city}, {event.state}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Clock className="w-5 h-5 text-primary" />
                      <span className="text-base font-medium">
                        {new Date(event.date_start).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
                    <div className="flex items-center gap-4">
                      <span className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-primary`}>
                        {event.price_min === 0 ? 'GRATUITO' : `R$ ${event.price_min}${event.price_max && event.price_max !== event.price_min ? ` - R$ ${event.price_max}` : ''}`}
                      </span>
                      <LikeSystem 
                        entityId={event.id} 
                        entityType="event" 
                        showCount={true}
                      />
                    </div>
                    <Button 
                      size={isMobile ? "default" : "lg"} 
                      className={`${isMobile ? 'w-full' : 'px-8 py-3'} text-base font-semibold group-hover:scale-105 transition-transform touch-target`}
                      asChild
                    >
                      <Link to={event.external_url || `/evento/${event.id}`}>
                        Ver Evento
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ResponsiveGrid>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              Nenhum evento encontrado para {selectedCity}.
            </p>
          </div>
        )}

        <div className="text-center">
          <Button 
            variant="outline" 
            size={isMobile ? "default" : "lg"} 
            asChild 
            className={`${isMobile ? 'w-full max-w-sm' : 'px-8 py-3'} text-lg touch-target`}
          >
            <Link to={`/eventos`}>
              Ver Toda a Vitrine Cultural
            </Link>
          </Button>
        </div>
      </ResponsiveContainer>
    </section>
  );
};

export default FeaturedEventsToday;