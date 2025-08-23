import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import SEOHead from '@/components/SEOHead';
import EventCard from '@/components/EventCard';
import EventSkeleton from '@/components/EventSkeleton';
import SearchAndFilters from '@/components/SearchAndFilters';
import GeolocationEvents from '@/components/GeolocationEvents';
import CityMap from '@/components/CityMap';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Filter, Grid3X3, Map, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useEvents } from '@/hooks/useEvents';
import { useGeolocation } from '@/hooks/useEvents';
import { useSearchAndFilter } from '@/hooks/useSearchAndFilter';
import { supabase } from '@/integrations/supabase/client';

const EVENTS_PER_PAGE = 12;

const EventsPage = () => {
  const { cidade } = useParams();
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [showMap, setShowMap] = useState(false);
  
  const { searchQuery, setSearchQuery, filters, setFilters, filteredEvents, hasActiveFilters } = useSearchAndFilter(events);
  const showingToday = searchParams.get('today') === 'true';

  useEffect(() => {
    fetchEvents();
  }, [cidade, currentPage, showingToday]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('events')
        .select(`*, venue:venues(*), categories:event_categories(category:categories(*))`)
        .eq('status', 'active')
        .order('date_start', { ascending: true });

      if (cidade && cidade !== 'todos') {
        query = query.eq('city', cidade);
      }

      if (showingToday) {
        const today = new Date().toISOString().split('T')[0];
        query = query.gte('date_start', today).lt('date_start', `${today}T23:59:59`);
      }

      const { data, error } = await query.range((currentPage - 1) * EVENTS_PER_PAGE, currentPage * EVENTS_PER_PAGE - 1);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  const displayEvents = hasActiveFilters ? filteredEvents : events;
  const pageTitle = cidade && cidade !== 'todos' ? `Eventos em ${cidade} | ROLÊ` : showingToday ? 'Eventos de Hoje | ROLÊ' : 'Todos os Eventos | ROLÊ';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={pageTitle} description="Descubra os melhores eventos do Brasil" />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">
          {showingToday ? 'Eventos de Hoje' : cidade && cidade !== 'todos' ? `Eventos em ${cidade}` : 'Todos os Eventos'}
        </h1>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <EventSkeleton key={i} />)}
          </div>
        ) : displayEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  price: event.price_min,
                  description: event.description
                }}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum evento encontrado</h3>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default EventsPage;