import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useEvents, useNearbyEvents, useGeolocation } from '@/hooks/useEvents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, MapPin, Filter, Calendar, Users, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import EventCard from '@/components/EventCard';
import CityMap from '@/components/CityMap';
import SEOHead from '@/components/SEOHead';
import { citiesData } from '@/data/citiesData';
import type { EventFilters } from '@/services/eventService';

const EventsPage = () => {
  const { cidade } = useParams<{ cidade: string }>();
  const [filters, setFilters] = useState<EventFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showMap, setShowMap] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 12;

  const { location, requestLocation } = useGeolocation();
  const { events, loading, error } = useEvents({
    ...filters,
    city: cidade,
    search: searchQuery
  }, eventsPerPage * currentPage);

  const { events: nearbyEvents, loading: nearbyLoading } = useNearbyEvents(
    location?.lat,
    location?.lng,
    50
  );

  const cityData = cidade ? Object.values(citiesData).find(city => 
    city.name.toLowerCase().replace(/\s+/g, '-') === cidade.toLowerCase()
  ) : null;

  useEffect(() => {
    if (!cidade) {
      requestLocation();
    }
  }, [cidade]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters: Partial<EventFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setCurrentPage(1);
  };

  const displayEvents = cidade ? events : nearbyEvents;
  const isLoading = cidade ? loading : nearbyLoading;
  const showNearbyToggle = !cidade && location;

  const mapEvents = displayEvents
    .filter(event => event.venue?.lat && event.venue?.lng)
    .map(event => ({
      id: event.id,
      title: event.title,
      venue: event.venue?.name || 'Local não informado',
      location: event.venue?.address || `${event.city}, ${event.state}`,
      city: event.city,
      time: new Date(event.date_start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      date: new Date(event.date_start).toLocaleDateString('pt-BR'),
      genre: event.categories?.[0]?.category?.name || 'Evento',
      category: event.categories?.[0]?.category?.name || 'Evento',
      attendees: 0,
      price: event.price_min || 0,
      description: event.description || '',
      image: event.image_url || '',
      featured: false,
      coordinates: {
        lat: event.venue.lat,
        lng: event.venue.lng
      }
    }));

  const pageTitle = cidade 
    ? `Eventos em ${cityData?.name || cidade} - Role Entretenimento`
    : 'Eventos Próximos - Role Entretenimento';

  const pageDescription = cidade
    ? `Descubra os melhores eventos em ${cityData?.name || cidade}. Shows, festas, arte e muito mais!`
    : location
    ? 'Encontre eventos próximos à sua localização. Diversão garantida na sua região!'
    : 'Explore eventos incríveis em todo o Brasil. Música, arte, festas e entretenimento!';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        
        image={cityData?.image}
      />
      
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {cidade ? `Eventos em ${cityData?.name || cidade}` : 'Eventos Próximos'}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {pageDescription}
          </p>
          {showNearbyToggle && (
            <Badge variant="outline" className="mt-4">
              <MapPin className="w-3 h-3 mr-1" />
              Mostrando eventos num raio de 50km
            </Badge>
          )}
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nome do evento..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Date Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Data</label>
                <Select onValueChange={(value) => {
                  const today = new Date();
                  let dateStart, dateEnd;
                  
                  switch (value) {
                    case 'today':
                      dateStart = today.toISOString().split('T')[0];
                      dateEnd = dateStart;
                      break;
                    case 'tomorrow':
                      const tomorrow = new Date(today);
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      dateStart = tomorrow.toISOString().split('T')[0];
                      dateEnd = dateStart;
                      break;
                    case 'week':
                      dateStart = today.toISOString().split('T')[0];
                      const nextWeek = new Date(today);
                      nextWeek.setDate(nextWeek.getDate() + 7);
                      dateEnd = nextWeek.toISOString().split('T')[0];
                      break;
                    case 'month':
                      dateStart = today.toISOString().split('T')[0];
                      const nextMonth = new Date(today);
                      nextMonth.setMonth(nextMonth.getMonth() + 1);
                      dateEnd = nextMonth.toISOString().split('T')[0];
                      break;
                    default:
                      dateStart = undefined;
                      dateEnd = undefined;
                  }
                  
                  handleFilterChange({ dateStart, dateEnd });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="tomorrow">Amanhã</SelectItem>
                    <SelectItem value="week">Próximos 7 dias</SelectItem>
                    <SelectItem value="month">Próximos 30 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Preço</label>
                <Select onValueChange={(value) => {
                  let priceMin, priceMax;
                  
                  switch (value) {
                    case 'free':
                      priceMin = 0;
                      priceMax = 0;
                      break;
                    case 'low':
                      priceMin = 1;
                      priceMax = 50;
                      break;
                    case 'medium':
                      priceMin = 51;
                      priceMax = 150;
                      break;
                    case 'high':
                      priceMin = 151;
                      priceMax = undefined;
                      break;
                    default:
                      priceMin = undefined;
                      priceMax = undefined;
                  }
                  
                  handleFilterChange({ priceMin, priceMax });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Faixa de preço" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="free">Gratuito</SelectItem>
                    <SelectItem value="low">R$ 1 - R$ 50</SelectItem>
                    <SelectItem value="medium">R$ 51 - R$ 150</SelectItem>
                    <SelectItem value="high">Acima de R$ 150</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              <div className="space-y-2">
                <label className="text-sm font-medium">&nbsp;</label>
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="w-full"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Events List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Toggle Map Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {isLoading ? 'Carregando...' : `${displayEvents.length} eventos encontrados`}
                </span>
              </div>
              
              {mapEvents.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMap(!showMap)}
                  className="gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  {showMap ? 'Ocultar Mapa' : 'Mostrar Mapa'}
                </Button>
              )}
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Carregando eventos...</span>
                </div>
              </div>
            ) : error ? (
              <Card>
                <CardContent className="text-center py-8">
                  <h3 className="font-semibold mb-2">Erro ao carregar eventos</h3>
                  <p className="text-muted-foreground">{error}</p>
                </CardContent>
              </Card>
            ) : displayEvents.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Nenhum evento encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Não encontramos eventos que correspondem aos seus filtros.
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Limpar Filtros
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Events Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {displayEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={{
                        id: event.id,
                        title: event.title,
                        category: event.categories?.[0]?.category?.name || 'Evento',
                        city: event.city,
                        date: event.date_start,
                        image: event.image_url,
                        price: event.price_min || 0,
                        description: event.description
                      }}
                      
                    />
                  ))}
                </div>

                {/* Load More */}
                {events.length >= eventsPerPage * currentPage && (
                  <div className="text-center pt-6">
                    <Button
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      variant="outline"
                    >
                      Carregar Mais Eventos
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Map Sidebar */}
          {showMap && mapEvents.length > 0 && (
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Mapa dos Eventos
                  </CardTitle>
                  <CardDescription>
                    Visualize a localização dos eventos
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-96 rounded-b-lg overflow-hidden">
                    <CityMap
                      events={mapEvents}
                      center={location ? [location.lng, location.lat] : mapEvents[0] ? [mapEvents[0].coordinates.lng, mapEvents[0].coordinates.lat] : [-46.6333, -23.5505]}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
      <BackToTop />
    </div>
  );
};

export default EventsPage;