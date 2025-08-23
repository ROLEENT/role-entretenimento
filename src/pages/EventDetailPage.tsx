import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { eventService } from '@/services/eventService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import EventDetailsCard from '@/components/events/EventDetailsCard';
import EventReviews from '@/components/events/EventReviews';
import EventComments from '@/components/events/EventComments';
import CityMap from '@/components/CityMap';
import SEOHead from '@/components/SEOHead';

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await eventService.getEventById(id);
      
      if (!data) {
        setError('Evento não encontrado');
        return;
      }
      
      setEvent(data);
    } catch (err) {
      setError('Falha ao carregar evento');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Carregando evento...</span>
            </div>
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
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <h2 className="text-xl font-semibold mb-2">Evento não encontrado</h2>
              <p className="text-muted-foreground mb-4">
                O evento que você está procurando não existe ou foi removido.
              </p>
              <Badge variant="destructive">{error}</Badge>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const eventUrl = `${window.location.origin}/evento/${event.id}`;
  const eventCategories = event.categories?.map((cat: any) => cat.category.name).join(', ') || '';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${event.title} - Eventos Role Entretenimento`}
        description={event.description || `${event.title} em ${event.city}, ${event.state}. ${eventCategories}`}
        image={event.image_url}
        url={eventUrl}
        type="article"
        publishedTime={event.date_start}
        tags={event.categories?.map((cat: any) => cat.category.name) || []}
      />
      
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Event Details */}
          <EventDetailsCard event={event} />

          {/* Map */}
          {event.venue?.lat && event.venue?.lng && (
            <Card>
              <CardContent className="p-0">
                <div className="h-64 rounded-lg overflow-hidden">
                  <CityMap
                    events={[{
                      id: event.id,
                      title: event.title,
                      venue: event.venue.name,
                      location: event.venue.address,
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
                    }]}
                    center={[event.venue.lng, event.venue.lat]}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          <EventReviews eventId={event.id} />

          {/* Comments */}
          <EventComments eventId={event.id} />
        </div>
      </main>
      
      <Footer />
      <BackToTop />
    </div>
  );
};

export default EventDetailPage;