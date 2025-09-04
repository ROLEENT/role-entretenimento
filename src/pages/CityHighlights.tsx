import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { citiesData, CityData } from '@/data/citiesData';
import { useEventsByCity } from '@/hooks/useEventsByCity';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import CityHeroSection from '@/components/CityHeroSection';
import CityFilters from '@/components/CityFilters';
import CityMap from '@/components/CityMap';
import CityReviews from '@/components/CityReviews';
import EventCalendar from '@/components/EventCalendar';
import EventCard from '@/components/EventCard';
import ScrollAnimationWrapper from '@/components/ScrollAnimationWrapper';
import { Toaster } from '@/components/ui/sonner';

const CityHighlights = () => {
  const { cidade } = useParams<{ cidade: string }>();
  const [cityData, setCityData] = useState<CityData | null>(null);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);

  // Get actual city name from slug
  const actualCityName = cidade && citiesData[cidade] ? citiesData[cidade].name : '';
  
  const { data: events = [], isLoading: eventsLoading, error } = useEventsByCity(actualCityName);

  useEffect(() => {
    if (cidade && citiesData[cidade]) {
      setCityData(citiesData[cidade]);
      setFilteredEvents(events);
    }
  }, [cidade, events]);

  const handleFilterChange = (filters: any) => {
    let filtered = events.filter(event => 
      event.city === cityData?.name
    );

    // Apply filters
    if (filters.search) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        (event.venue?.name || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        event.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.genre) {
      filtered = filtered.filter(event => 
        event.genres && event.genres.includes(filters.genre)
      );
    }

    if (filters.priceRange) {
      filtered = filtered.filter(event => {
        const price = event.price_min || 0;
        switch (filters.priceRange) {
          case 'free': return price === 0;
          case '0-30': return price > 0 && price <= 30;
          case '30-60': return price > 30 && price <= 60;
          case '60-100': return price > 60 && price <= 100;
          case '100-200': return price > 100 && price <= 200;
          case '200+': return price > 200;
          default: return true;
        }
      });
    }

    setFilteredEvents(filtered);
  };

  if (eventsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-lg">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!cityData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-3xl font-bold mb-4">Cidade não encontrada</h1>
            <p className="text-muted-foreground mb-8">
              A cidade "{cidade}" não foi encontrada em nossa base de dados.
            </p>
            <Button onClick={() => window.history.back()} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        {/* Back Navigation */}
        <div className="bg-background border-b">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={() => window.history.back()} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar aos Destaques
            </Button>
          </div>
        </div>

        {/* Hero Section */}
        <ScrollAnimationWrapper>
          <CityHeroSection city={cityData} />
        </ScrollAnimationWrapper>

        {/* Filters */}
        <ScrollAnimationWrapper>
          <CityFilters onFilterChange={handleFilterChange} />
        </ScrollAnimationWrapper>

        {/* Events Grid and Map */}
        <ScrollAnimationWrapper>
          <section className="py-12 bg-background">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">
                    Eventos em Destaque
                  </h2>
                  <p className="text-muted-foreground">
                    {filteredEvents.length} eventos encontrados em {cityData.name}
                  </p>
                </div>
                <Button className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Ver Todos os Eventos
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Events Grid */}
                <div className="lg:col-span-2">
                  {filteredEvents.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-muted-foreground">
                        Nenhum evento encontrado com os filtros selecionados.
                      </p>
                    </div>
                  ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {filteredEvents.map((event) => (
                         <EventCard
                           key={event.id}
                           event={{
                             ...event,
                             venue: event.venue?.name || event.location_name || '',
                             location: event.address || '',
                             time: event.date_start ? new Date(event.date_start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '',
                             date: event.date_start ? new Date(event.date_start).toLocaleDateString('pt-BR') : '',
                             genre: event.genres?.[0] || '',
                             category: event.genres?.[0] || '',
                             attendees: 0,
                             price: event.price_min || 0,
                             image: event.image_url || event.cover_url || '/placeholder.svg',
                             featured: event.highlight_type !== 'none',
                             coordinates: event.venue?.location ? { 
                               lat: parseFloat(event.venue.location.split(',')[0]) || 0, 
                               lng: parseFloat(event.venue.location.split(',')[1]) || 0 
                             } : undefined
                           }}
                         />
                       ))}
                     </div>
                  )}
                </div>

                {/* Map */}
                <div className="lg:col-span-1">
                  <div className="sticky top-24">
                    <h3 className="text-xl font-semibold mb-4">Mapa dos Eventos</h3>
                    <CityMap
                      events={filteredEvents}
                      center={[cityData.coordinates.lng, cityData.coordinates.lat]}
                      className="w-full h-96 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ScrollAnimationWrapper>

        {/* Calendar */}
        <ScrollAnimationWrapper>
          <EventCalendar />
        </ScrollAnimationWrapper>

        {/* Reviews */}
        <ScrollAnimationWrapper>
          <CityReviews 
            cityName={cityData.name}
            overallRating={cityData.stats.rating}
            totalReviews={cityData.stats.reviews}
          />
        </ScrollAnimationWrapper>

        {/* CTA Section */}
        <ScrollAnimationWrapper>
          <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Descubra Mais de {cityData.name}
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Explore todos os eventos, venues e experiências que {cityData.name} tem a oferecer. 
                Não perca nenhuma novidade da cena local!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Ver Todos os Eventos
                </Button>
                <Button size="lg" variant="outline">
                  Seguir {cityData.name}
                </Button>
              </div>
            </div>
          </section>
        </ScrollAnimationWrapper>
      </main>

      <Footer />
      <BackToTop />
      <Toaster />
    </div>
  );
};

export default CityHighlights;