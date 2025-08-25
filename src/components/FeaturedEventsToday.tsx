import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { eventsData } from "@/data/eventsData";
import { citiesData } from "@/data/citiesData";
import { useState } from "react";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { MobileSafeImage } from "@/components/ui/mobile-safe-image";
import { useResponsive } from "@/hooks/useResponsive";

const FeaturedEventsToday = () => {
  const [selectedCity, setSelectedCity] = useState('sao-paulo');
  const { isMobile, isTablet } = useResponsive();
  
  // Get available cities
  const cities = Object.keys(citiesData);
  
  // Filter events by selected city and get featured ones
  const featuredEvents = eventsData
    .filter(event => {
      const cityData = citiesData[selectedCity];
      return cityData && event.location?.toLowerCase().includes(cityData.name.toLowerCase());
    })
    .filter(event => event.featured)
    .slice(0, 2);

  return (
    <section className={`${isMobile ? 'py-8' : 'py-16'} bg-gradient-to-br from-primary/5 to-secondary/5`}>
      <ResponsiveContainer className="container mx-auto" padding={isMobile ? 'sm' : 'md'}>
        <div className="text-center mb-12">
          <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl md:text-5xl'} font-bold text-foreground mb-6`}>
            EVENTOS POPULARES EM 🇧🇷 BRASIL
          </h2>
          
          <div className="flex justify-center mb-8">
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className={`${isMobile ? 'w-full max-w-xs h-10' : 'w-64 h-12'} text-lg font-medium touch-target`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cities.map((cityKey) => (
                  <SelectItem key={cityKey} value={cityKey} className="text-lg">
                    {citiesData[cityKey].name}, {citiesData[cityKey].state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {featuredEvents.length > 0 ? (
          <ResponsiveGrid 
            cols={{ default: 1, lg: 2 }} 
            gap={isMobile ? 'md' : 'lg'} 
            className="mb-12"
          >
            {featuredEvents.map((event) => (
              <Card 
                key={event.id} 
                className="group hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden bg-card border-2 hover:border-primary/30"
              >
                <div className="relative overflow-hidden">
                  <MobileSafeImage
                    src={event.image}
                    alt={event.title}
                    className={`w-full ${isMobile ? 'h-56' : 'h-80'} object-cover group-hover:scale-105 transition-transform duration-500`}
                    loading="lazy"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    DESTAQUE
                  </div>
                  <div className="absolute top-4 right-4 bg-background/95 backdrop-blur-sm text-foreground px-3 py-2 rounded-full text-sm font-semibold border">
                    {event.genre}
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
                      <span className="text-base font-medium">{event.venue}, {event.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Clock className="w-5 h-5 text-primary" />
                      <span className="text-base font-medium">{event.time}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Users className="w-5 h-5 text-primary" />
                      <span className="text-base font-medium">{event.attendees} interessados</span>
                    </div>
                  </div>

                  <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
                    <span className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-primary`}>
                      {event.price === 0 ? 'GRATUITO' : `R$ ${event.price}`}
                    </span>
                    <Button 
                      size={isMobile ? "default" : "lg"} 
                      className={`${isMobile ? 'w-full' : 'px-8 py-3'} text-base font-semibold group-hover:scale-105 transition-transform touch-target`}
                    >
                      Ver Evento
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ResponsiveGrid>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              Nenhum evento destacado encontrado para {citiesData[selectedCity]?.name}.
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
            <Link to={`/eventos/${selectedCity}`}>
              Ver Todos os Eventos em {citiesData[selectedCity]?.name}
            </Link>
          </Button>
        </div>
      </ResponsiveContainer>
    </section>
  );
};

export default FeaturedEventsToday;