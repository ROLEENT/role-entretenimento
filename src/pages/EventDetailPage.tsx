import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import SEOHead from '@/components/SEOHead';
import LazyImage from '@/components/LazyImage';
import ShareDialog from '@/components/ShareDialog';
import CityMap from '@/components/CityMap';
import { SafeHTML } from '@/components/ui/safe-html';
import { ReviewSystem } from '@/components/reviews/ReviewSystem';
import { reviewService } from '@/services/eventService';
import { LikeSystem } from '@/components/events/LikeSystem';
import { CommentSystem } from '@/components/events/CommentSystem';
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
import { useAuth } from '@/hooks/useAuth';
import { useCommentNotifications } from '@/hooks/useCommentNotifications';

const EventDetailPage = () => {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  
  const { user } = useAuth();
  
  // Enable comment notifications for this event (will use event.id once loaded)
  useCommentNotifications(event?.id, 'event');

  useEffect(() => {
    if (slug) {
      fetchEvent(slug);
    }
  }, [slug]);

  // Fetch reviews after event is loaded
  useEffect(() => {
    if (event?.id) {
      fetchReviews();
    }
  }, [event?.id]);

  const fetchEvent = async (eventSlug) => {
    try {
      setLoading(true);
      
      // Check if the parameter is a UUID (for backward compatibility)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventSlug);
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          *, 
          venues(id, name, address, city, state, lat, lng),
          event_lineup_slots(
            id, slot_name, start_time, end_time, stage, position, is_headliner,
            event_lineup_slot_artists(
              artist_id, artist_name, position, role
            )
          ),
          event_partners(
            id, partner_type, role, display_name, position, is_main,
            partners(id, name, image_url)
          )
        `)
        .eq(isUUID ? 'id' : 'slug', eventSlug)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        setError('Evento não encontrado');
        return;
      }
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event:', error);
      setError('Evento não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!event?.id) return;
    try {
      setReviewsLoading(true);
      const reviewsData = await reviewService.getEventReviews(event.id);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleAddReview = async (rating: number, comment?: string) => {
    if (!event?.id) throw new Error('Event ID not found');
    await reviewService.addReview(event.id, rating, comment);
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
                    <LikeSystem entityId={event.id} entityType="event" />
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
                  {event.venues && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <span>{event.venues.name}, {event.city}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{event.price_min === 0 ? 'Gratuito' : `R$ ${event.price_min}`}</span>
                  </div>
                </div>

                {event.ticket_url && (
                  <Button asChild className="mb-6">
                    <a href={event.ticket_url} target="_blank" rel="noopener noreferrer">
                      <Ticket className="h-4 w-4 mr-2" />
                      Comprar Ingressos
                    </a>
                  </Button>
                )}

                {event.summary && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Resumo</h3>
                    <SafeHTML 
                      content={event.summary}
                      className="prose prose-sm max-w-none text-muted-foreground"
                    />
                  </div>
                )}

                {event.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Sobre o Evento</h3>
                    <SafeHTML 
                      content={event.description}
                      className="prose prose-sm max-w-none text-muted-foreground"
                    />
                  </div>
                )}

                {/* Lineup Section */}
                {event.event_lineup_slots && event.event_lineup_slots.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Lineup</h3>
                    <div className="space-y-3">
                      {event.event_lineup_slots.map((slot) => (
                        <div key={slot.id} className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{slot.slot_name}</h4>
                            {slot.is_headliner && (
                              <Badge variant="secondary">Headliner</Badge>
                            )}
                          </div>
                          {slot.start_time && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {format(new Date(slot.start_time), 'HH:mm', { locale: ptBR })}
                              {slot.end_time && ` - ${format(new Date(slot.end_time), 'HH:mm', { locale: ptBR })}`}
                            </p>
                          )}
                          {slot.event_lineup_slot_artists && slot.event_lineup_slot_artists.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {slot.event_lineup_slot_artists.map((artist, index) => (
                                <Badge key={index} variant="outline">
                                  {artist.artist_name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Partners Section */}
                {event.event_partners && event.event_partners.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Organização</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {event.event_partners.map((partner) => (
                        <div key={partner.id} className="text-center p-3 bg-muted/50 rounded-lg">
                          {partner.partners?.image_url && (
                            <img 
                              src={partner.partners.image_url} 
                              alt={partner.display_name || partner.partners?.name}
                              className="w-12 h-12 mx-auto mb-2 rounded-full object-cover"
                            />
                          )}
                          <p className="text-sm font-medium">
                            {partner.display_name || partner.partners?.name}
                          </p>
                          {partner.role && (
                            <p className="text-xs text-muted-foreground capitalize">
                              {partner.role}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <ReviewSystem
              itemId={event.id}
              itemType="event"
              reviews={reviews}
              onReviewAdded={fetchReviews}
              loading={reviewsLoading}
              onAddReview={handleAddReview}
            />
            <CommentSystem entityId={event.id} entityType="event" />
          </div>

          <div className="space-y-6">
            <EventCheckIn eventId={event.id} eventTitle={event.title} />
            <PushNotifications eventId={event.id} />
            <RelatedEvents 
              currentEventId={event.id} 
              city={event.city}
              categories={event.categories?.map((cat: any) => cat.category.name) || []}
            />
            {event.venues && (
              <Card>
                <CardHeader><CardTitle>Local do Evento</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">{event.venues.name}</h4>
                      <p className="text-sm text-muted-foreground">{event.venues.address}</p>
                      <p className="text-sm text-muted-foreground">{event.city}, {event.venues.state}</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm">🎵 Integração musical disponível</p>
                      <p className="text-sm">🗺️ Mapas e direções integrados</p> 
                      <p className="text-sm">📱 Compartilhamento social otimizado</p>
                    </div>
                    {event.venues.lat && event.venues.lng && (
                      <div className="h-48 rounded-lg overflow-hidden">
                        <CityMap 
                          events={[{
                            id: event.id,
                            title: event.title,
                            venue: event.venues.name,
                            location: event.venues.address,
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
                              lat: event.venues.lat,
                              lng: event.venues.lng
                            }
                          }]}
                          center={[event.venues.lng, event.venues.lat]}
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