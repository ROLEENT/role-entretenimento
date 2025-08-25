import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import SEOHead from '@/components/SEOHead';
import LazyImage from '@/components/LazyImage';
import ShareDialog from '@/components/ShareDialog';
import CityMap from '@/components/CityMap';
import EventReviews from '@/components/events/EventReviews';
import EventComments from '@/components/events/EventComments';
import EventCheckIn from '@/components/events/EventCheckIn';
import PushNotifications from '@/components/events/PushNotifications';
import RelatedEvents from '@/components/events/RelatedEvents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Ticket, Heart, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';

const EventDetailPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    if (id) fetchEvent(id);
  }, [id]);

  const fetchEvent = async (eventId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select(`*, venue:venues(*), organizer:organizers(*), categories:event_categories(category:categories(*)), tickets(*)`)
        .eq('id', eventId)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event:', error);
      setError('Evento não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteClick = () => {
    if (!user) {
      toast.error('Faça login para favoritar eventos');
      return;
    }
    if (event) {
      toggleFavorite({
        id: event.id,
        title: event.title,
        category: event.categories?.[0]?.category?.name || 'Evento',
        city: event.city,
        date: event.date_start,
        image: event.image_url
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Evento não encontrado</h1>
          <Button asChild><Link to="/eventos">Ver Todos os Eventos</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={`${event.title} | ROLÊ`} description={event.description || `${event.title} em ${event.city}`} />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardContent className="p-6">
                {event.image_url && (
                  <LazyImage src={event.image_url} alt={event.title} className="w-full h-64 object-cover rounded-lg mb-6" />
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
                    {event.categories && event.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {event.categories.map((cat, index) => (
                          <Badge key={index} variant="secondary" style={{ backgroundColor: cat.category.color + '20', color: cat.category.color }}>
                            {cat.category.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={handleFavoriteClick} className={isFavorite(event.id) ? 'text-red-500' : ''}>
                      <Heart className={`h-4 w-4 ${isFavorite(event.id) ? 'fill-current' : ''}`} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShareOpen(true)}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="font-medium">{format(new Date(event.date_start), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>{format(new Date(event.date_start), 'HH:mm', { locale: ptBR })}</span>
                  </div>
                  {event.venue && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <span>{event.venue.name}, {event.city}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{event.price_min === 0 ? 'Gratuito' : `R$ ${event.price_min}`}</span>
                  </div>
                </div>

                {event.external_url && (
                  <Button asChild className="mb-6">
                    <a href={event.external_url} target="_blank" rel="noopener noreferrer">
                      <Ticket className="h-4 w-4 mr-2" />
                      Comprar Ingressos
                    </a>
                  </Button>
                )}

                {event.description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Sobre o Evento</h3>
                    <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: event.description }} />
                  </div>
                )}
              </CardContent>
            </Card>

            <EventReviews eventId={event.id} />
            <EventComments eventId={event.id} />
          </div>

          <div className="space-y-6">
            <EventCheckIn eventId={event.id} eventTitle={event.title} />
            <PushNotifications eventId={event.id} />
            <RelatedEvents 
              currentEventId={event.id} 
              city={event.city}
              categories={event.categories?.map((cat: any) => cat.category.name) || []}
            />
            {event.venue && (
              <Card>
                <CardHeader><CardTitle>Local do Evento</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">{event.venue.name}</h4>
                      <p className="text-sm text-muted-foreground">{event.venue.address}</p>
                      <p className="text-sm text-muted-foreground">{event.city}, {event.state}</p>
                    </div>
                    
                    {event.venue.lat && event.venue.lng && (
                      <div className="h-48 rounded-lg overflow-hidden">
                        <CityMap 
                          events={[{
                            id: event.id,
                            title: event.title,
                            venue: event.venue.name,
                            location: event.venue.address,
                            city: event.city,
                            time: format(new Date(event.date_start), 'HH:mm'),
                            date: event.date_start,
                            genre: event.categories?.[0]?.category?.name || 'Evento',
                            category: 'Evento',
                            attendees: 0,
                            price: event.price_min,
                            description: event.description || '',
                            image: event.image_url || '',
                            featured: false,
                            coordinates: {
                              lat: event.venue.lat,
                              lng: event.venue.lng
                            }
                          }]}
                          center={[event.venue.lng, event.venue.lat]}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <ShareDialog 
        isOpen={shareOpen} 
        onClose={() => setShareOpen(false)} 
        event={{
          id: event.id,
          title: event.title,
          category: event.categories?.[0]?.category?.name || 'Evento',
          city: event.city,
          date: event.date_start,
          image: event.image_url
        }} 
      />
      <Footer />
      <BackToTop />
    </div>
  );
};

export default EventDetailPage;