import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EventCard from '@/components/EventCard';
import { AdvancedEventsFilters } from '@/components/events/AdvancedEventsFilters';
import { EventsMapIntegration } from '@/components/events/EventsMapIntegration';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Search, MapPin, Calendar, Filter, Grid, Map, List } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';

interface Event {
  id: string;
  title: string;
  description?: string;
  city: string;
  date_start: string;
  date_end?: string;
  image_url?: string;
  cover_url?: string;
  price_min?: number;
  price_max?: number;
  tags?: string[];
  status: string;
  venues?: {
    id: string;
    name: string;
    address: string;
    lat?: number;
    lng?: number;
  };
  organizers?: {
    id: string;
    name: string;
    logo_url?: string;
  };
  categories?: Array<{
    category_id: string;
    categories: {
      id: string;
      name: string;
      slug: string;
      color: string;
    };
  }>;
}

interface AdvancedFilters {
  search?: string;
  city?: string;
  categories?: string[];
  priceMin?: number;
  priceMax?: number;
  dateStart?: string;
  dateEnd?: string;
  organizers?: string[];
  venues?: string[];
  tags?: string[];
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  freeOnly?: boolean;
  withImages?: boolean;
  upcoming?: boolean;
  hasCapacity?: boolean;
  minRating?: number;
}

export default function EventsPageEnhanced() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEvents, setTotalEvents] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  
  const [filters, setFilters] = useState<AdvancedFilters>({
    sortBy: 'date_start',
    sortOrder: 'asc',
    upcoming: true
  });

  const [quickSearch, setQuickSearch] = useState('');
  const debouncedSearch = useDebounce(quickSearch, 300);

  const itemsPerPage = 12;

  // Load events with advanced filtering
  const loadEvents = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('events')
        .select(`
          *,
          venues:venue_id (
            id,
            name,
            address,
            lat,
            lng
          ),
          organizers:organizer_id (
            id,
            name,
            logo_url
          ),
          event_categories (
            category_id,
            categories:category_id (
              id,
              name,
              slug,
              color
            )
          )
        `)
        .eq('status', 'published');

      // Apply filters
      if (filters.search || debouncedSearch) {
        const searchTerm = filters.search || debouncedSearch;
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (filters.city) {
        query = query.eq('city', filters.city);
      }

      if (filters.categories && filters.categories.length > 0) {
        query = query.in('event_categories.categories.slug', filters.categories);
      }

      if (filters.organizers && filters.organizers.length > 0) {
        query = query.in('organizer_id', filters.organizers);
      }

      if (filters.venues && filters.venues.length > 0) {
        query = query.in('venue_id', filters.venues);
      }

      if (filters.priceMin !== undefined) {
        query = query.gte('price_min', filters.priceMin);
      }

      if (filters.priceMax !== undefined) {
        query = query.lte('price_max', filters.priceMax);
      }

      if (filters.dateStart) {
        query = query.gte('date_start', filters.dateStart);
      }

      if (filters.dateEnd) {
        query = query.lte('date_start', filters.dateEnd);
      }

      if (filters.freeOnly) {
        query = query.eq('price_min', 0);
      }

      if (filters.withImages) {
        query = query.not('image_url', 'is', null);
      }

      if (filters.upcoming) {
        query = query.gte('date_start', new Date().toISOString());
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      // Apply sorting
      const sortField = filters.sortBy || 'date_start';
      const sortOrder = filters.sortOrder || 'asc';
      query = query.order(sortField, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setEvents(data || []);
      setTotalEvents(count || 0);
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedSearch]);

  useEffect(() => {
    loadEvents(currentPage);
  }, [loadEvents, currentPage]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      loadEvents(1);
    }
  }, [filters]);

  const handleFiltersChange = (newFilters: AdvancedFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      sortBy: 'date_start',
      sortOrder: 'asc',
      upcoming: true
    });
    setQuickSearch('');
  };

  const handleEventSelect = (eventId: string) => {
    window.location.href = `/evento/${eventId}`;
  };

  const handleLocationFilter = (city: string, bounds?: any) => {
    if (city) {
      setFilters(prev => ({ ...prev, city }));
    }
    // Could implement bounds-based filtering here
  };

  const totalPages = Math.ceil(totalEvents / itemsPerPage);
  const hasActiveFilters = Object.keys(filters).length > 3; // More than default filters

  return (
    <div className="min-h-screen bg-background">
      
      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Eventos em Destaque</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubra os melhores eventos da sua cidade com filtros avançados e mapa interativo
          </p>
        </div>

        {/* Quick Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Busca rápida por eventos..."
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                >
                  <Map className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Filters */}
        <AdvancedEventsFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={clearFilters}
          isLoading={loading}
        />

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {loading ? 'Carregando...' : `${totalEvents} evento${totalEvents !== 1 ? 's' : ''} encontrado${totalEvents !== 1 ? 's' : ''}`}
            </p>
            {hasActiveFilters && (
              <Badge variant="secondary">
                Filtros ativos
              </Badge>
            )}
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
              Grade
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Mapa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : events.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum evento encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Tente ajustar os filtros ou buscar por outros termos
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Limpar filtros
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {events.map((event) => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleEventSelect(event.id)}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-2 mb-2">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">{event.city}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.date_start).toLocaleDateString('pt-BR')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Próxima
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : events.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum evento encontrado</h3>
                  <p className="text-muted-foreground">
                    Tente ajustar os filtros ou buscar por outros termos
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleEventSelect(event.id)}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {event.image_url && (
                          <img
                            src={event.image_url}
                            alt={event.title}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <h3 className="text-lg font-semibold line-clamp-2">{event.title}</h3>
                            {event.price_min !== undefined && (
                              <Badge variant="secondary">
                                {event.price_min === 0 ? 'Gratuito' : `A partir de R$ ${event.price_min}`}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(event.date_start).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.venues?.name || event.city}
                            </div>
                          </div>

                          {event.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {event.description}
                            </p>
                          )}

                          {event.tags && event.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {event.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {event.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{event.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="map">
            <EventsMapIntegration
              events={events.filter(event => event.venues?.lat && event.venues?.lng).map(event => ({
                ...event,
                venue: event.venues ? {
                  id: event.venues.id,
                  name: event.venues.name,
                  address: event.venues.address,
                  lat: event.venues.lat!,
                  lng: event.venues.lng!
                } : undefined
              }))}
              onEventSelect={handleEventSelect}
              onLocationFilter={handleLocationFilter}
              className="h-[600px]"
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}