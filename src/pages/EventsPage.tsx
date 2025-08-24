import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import SEOHead from '@/components/SEOHead';
import EventCard from '@/components/EventCard';
import EventSkeleton from '@/components/EventSkeleton';
import EventsFilters from '@/components/events/EventsFilters';
import EventsMap from '@/components/events/EventsMap';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Filter, Grid3X3, Map, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const EVENTS_PER_PAGE = 12;

interface EventFilters {
  city?: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  dateStart?: string;
  dateEnd?: string;
}

interface EventData {
  id: string;
  title: string;
  description: string;
  city: string;
  date_start: string;
  date_end: string;
  price_min: number;
  price_max: number;
  image_url: string;
  status: string;
  venue?: {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  categories?: Array<{
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

const EventsPage = () => {
  const { cidade } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [activeView, setActiveView] = useState<'grid' | 'map'>('grid');

  // Initialize filters from URL
  const getFiltersFromURL = useCallback((): EventFilters => {
    const filters: EventFilters = {};
    
    if (searchParams.get('city')) filters.city = searchParams.get('city')!;
    if (searchParams.get('category')) filters.category = searchParams.get('category')!;
    if (searchParams.get('priceMin')) filters.priceMin = parseFloat(searchParams.get('priceMin')!);
    if (searchParams.get('priceMax')) filters.priceMax = parseFloat(searchParams.get('priceMax')!);
    if (searchParams.get('dateStart')) filters.dateStart = searchParams.get('dateStart')!;
    if (searchParams.get('dateEnd')) filters.dateEnd = searchParams.get('dateEnd')!;
    
    return filters;
  }, [searchParams]);

  const [filters, setFilters] = useState<EventFilters>(getFiltersFromURL());

  // Update URL when filters change
  const updateURLWithFilters = useCallback((newFilters: EventFilters, page: number = 1) => {
    const params = new URLSearchParams();
    
    if (newFilters.city) params.set('city', newFilters.city);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.priceMin !== undefined) params.set('priceMin', newFilters.priceMin.toString());
    if (newFilters.priceMax !== undefined) params.set('priceMax', newFilters.priceMax.toString());
    if (newFilters.dateStart) params.set('dateStart', newFilters.dateStart);
    if (newFilters.dateEnd) params.set('dateEnd', newFilters.dateEnd);
    if (page > 1) params.set('page', page.toString());
    
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  // Load events with filters
  const fetchEvents = useCallback(async (page: number = 1, currentFilters: EventFilters = filters) => {
    try {
      setLoading(true);
      
      // Build query
      let query = supabase
        .from('events')
        .select(`
          *,
          venue:venues(*),
          categories:event_categories(category:categories(*))
        `, { count: 'exact' })
        .eq('status', 'active');

      // Apply filters
      if (currentFilters.city) {
        query = query.eq('city', currentFilters.city);
      }
      
      if (currentFilters.category) {
        query = query.eq('categories.category.slug', currentFilters.category);
      }
      
      if (currentFilters.priceMin !== undefined) {
        query = query.gte('price_min', currentFilters.priceMin);
      }
      
      if (currentFilters.priceMax !== undefined) {
        query = query.lte('price_max', currentFilters.priceMax);
      }
      
      if (currentFilters.dateStart) {
        query = query.gte('date_start', currentFilters.dateStart);
      }
      
      if (currentFilters.dateEnd) {
        query = query.lte('date_end', currentFilters.dateEnd + 'T23:59:59');
      }

      // Apply ordering and pagination
      query = query
        .order('date_start', { ascending: true })
        .range((page - 1) * EVENTS_PER_PAGE, page * EVENTS_PER_PAGE - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      setEvents(data || []);
      setTotalEvents(count || 0);
      setTotalPages(Math.ceil((count || 0) / EVENTS_PER_PAGE));
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast.error('Erro ao carregar eventos: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initialize page from URL
  useEffect(() => {
    const pageFromURL = parseInt(searchParams.get('page') || '1');
    setCurrentPage(pageFromURL);
    
    const filtersFromURL = getFiltersFromURL();
    setFilters(filtersFromURL);
    
    fetchEvents(pageFromURL, filtersFromURL);
  }, [searchParams, getFiltersFromURL, fetchEvents]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: EventFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    updateURLWithFilters(newFilters, 1);
    fetchEvents(1, newFilters);
  }, [updateURLWithFilters, fetchEvents]);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    const emptyFilters: EventFilters = {};
    setFilters(emptyFilters);
    setCurrentPage(1);
    setSearchParams({}, { replace: true });
    fetchEvents(1, emptyFilters);
  }, [setSearchParams, fetchEvents]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    updateURLWithFilters(filters, page);
    fetchEvents(page, filters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters, updateURLWithFilters, fetchEvents]);

  // Handle event selection from map
  const handleEventSelect = useCallback((eventId: string) => {
    navigate(`/evento/${eventId}`);
  }, [navigate]);

  const pageTitle = cidade && cidade !== 'todos' 
    ? `Eventos em ${cidade} | ROLÊ` 
    : 'Todos os Eventos | ROLÊ';

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={pageTitle} 
        description="Descubra os melhores eventos do Brasil com filtros avançados e mapa interativo" 
      />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {cidade && cidade !== 'todos' ? `Eventos em ${cidade}` : 'Todos os Eventos'}
          </h1>
          <p className="text-muted-foreground">
            {totalEvents > 0 && (
              `${totalEvents} evento${totalEvents !== 1 ? 's' : ''} encontrado${totalEvents !== 1 ? 's' : ''}`
            )}
          </p>
        </div>

        {/* Filters */}
        <EventsFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          isLoading={loading}
        />

        {/* View Toggle */}
        <div className="mb-6">
          <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'grid' | 'map')}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="grid" className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4" />
                Grade
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <Map className="h-4 w-4" />
                Mapa
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        {activeView === 'grid' ? (
          <>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {Array.from({ length: 6 }).map((_, i) => <EventSkeleton key={i} />)}
              </div>
            ) : events.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {events.map((event) => (
                    <EventCard 
                      key={event.id}
                      event={{
                        id: event.id,
                        title: event.title,
                        category: event.categories?.[0]?.category?.name || 'Evento',
                        city: event.city,
                        date: event.date_start,
                        image: event.image_url,
                        price: event.price_min,
                        description: event.description
                      }}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className="min-w-[40px]"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {hasActiveFilters ? 'Nenhum evento encontrado com os filtros aplicados' : 'Nenhum evento encontrado'}
                  </h3>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={handleClearFilters} className="mt-4">
                      Limpar filtros
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <EventsMap 
            events={events} 
            onEventSelect={handleEventSelect}
            className="h-[600px]"
          />
        )}
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default EventsPage;