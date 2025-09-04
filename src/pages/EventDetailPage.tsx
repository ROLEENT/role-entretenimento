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
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Ticket, 
  Share2, 
  Bookmark, 
  Flag, 
  ExternalLink,
  Music2,
  Users,
  Image as ImageIcon,
  PlayCircle,
  Instagram,
  Globe,
  ChevronRight,
  Star
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCommentNotifications } from '@/hooks/useCommentNotifications';

const EventDetailPage = () => {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [venue, setVenue] = useState(null);
  const [partners, setPartners] = useState([]);
  const [lineup, setLineup] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [visualArtists, setVisualArtists] = useState([]);
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
      
      // Fetch main event data
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq(isUUID ? 'id' : 'slug', eventSlug)
        .eq('status', 'published')
        .maybeSingle();

      if (error) {
        console.error('EventDetailPage query error:', error);
        throw error;
      }
      
      if (!data) {
        setError('Evento não encontrado');
        return;
      }
      
      setEvent(data);
      
      // Fetch all related data in parallel
      const [venueResult, partnersResult, lineupResult, performancesResult, visualArtistsResult] = await Promise.all([
        // Venue data
        data.venue_id ? supabase
          .from('venues')
          .select('*')
          .eq('id', data.venue_id)
          .single() : { data: null },
        
        // Partners/Organizers data
        supabase
          .from('event_partners')
          .select(`
            *,
            partners(id, name, image_url, website, instagram)
          `)
          .eq('event_id', data.id)
          .order('position'),
          
        // Lineup data with artists
        supabase
          .from('event_lineup_slots')
          .select(`
            *,
            event_lineup_slot_artists(
              *,
              artists(id, stage_name, slug, profile_image_url)
            )
          `)
          .eq('event_id', data.id)
          .order('position'),
          
        // Performances data
        supabase
          .from('event_performances')
          .select('*')
          .eq('event_id', data.id)
          .order('position'),
          
        // Visual artists data
        supabase
          .from('event_visual_artists')
          .select('*')
          .eq('event_id', data.id)
          .order('position')
      ]);
      
      // Set all the data
      if (venueResult.data) setVenue(venueResult.data);
      if (partnersResult.data) setPartners(partnersResult.data);
      if (lineupResult.data) setLineup(lineupResult.data);
      if (performancesResult.data) setPerformances(performancesResult.data);
      if (visualArtistsResult.data) setVisualArtists(visualArtistsResult.data);
      
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
          <Button asChild><Link to="/agenda">Ver Todos os Eventos</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  // Helper functions
  const getHighlightBadge = () => {
    if (event.highlight_type === 'editorial') {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-300">✨ Destaque Editorial</Badge>;
    }
    if (event.highlight_type === 'vitrine') {
      return <Badge className="bg-purple-100 text-purple-800 border-purple-300">💎 Vitrine Cultural</Badge>;
    }
    return null;
  };

  const formatPrice = () => {
    if (!event.price_min && !event.price_max) return 'Preço a consultar';
    if (event.price_min === 0) return 'Gratuito';
    if (event.price_min === event.price_max) return `R$ ${event.price_min}`;
    return `R$ ${event.price_min}${event.price_max ? ` - R$ ${event.price_max}` : '+'}`;
  };

  const formatTime = (timeString) => {
    return format(new Date(timeString), 'HH:mm', { locale: ptBR });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`${event.title} | ROLÊ`} 
        description={event.seo_description || event.summary || event.description?.substring(0, 160) || `${event.title} em ${event.city}`}
        image={event.og_image_url || event.cover_url || event.image_url}
      />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Conteúdo Principal - 2 colunas em desktop */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cabeçalho Forte do Evento */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {/* Capa 16:9 */}
                <div className="relative aspect-video w-full">
                  <LazyImage 
                    src={event.cover_url || event.image_url} 
                    alt={event.cover_alt || event.title} 
                    className="w-full h-full object-cover" 
                  />
                  {/* Badge de destaque sobre a imagem */}
                  {getHighlightBadge() && (
                    <div className="absolute top-4 left-4">
                      {getHighlightBadge()}
                    </div>
                  )}
                  {/* Botão de ingressos sobre a imagem */}
                  {(event.ticket_url || event.ticketing?.url) && (
                    <div className="absolute bottom-4 right-4">
                      <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white font-semibold">
                        <a href={event.ticket_url || event.ticketing?.url} target="_blank" rel="noopener noreferrer">
                          <Ticket className="h-5 w-5 mr-2" />
                          Comprar Ingressos
                        </a>
                      </Button>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {/* Título e ações */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h1 className="text-3xl lg:text-4xl font-bold mb-2">{event.title}</h1>
                      {event.subtitle && (
                        <p className="text-xl text-muted-foreground mb-4">{event.subtitle}</p>
                      )}
                    </div>
                    
                    {/* Acessos rápidos */}
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => setShareOpen(true)}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Flag className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Metadados essenciais em chips */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    {/* Data e hora */}
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-full min-h-[44px]">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        {format(new Date(event.date_start), "dd/MM", { locale: ptBR })} às {format(new Date(event.date_start), 'HH:mm', { locale: ptBR })}
                      </span>
                    </div>

                    {/* Portas abrem */}
                    {event.doors_open_utc && (
                      <div className="inline-flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-full min-h-[44px]">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>Portas: {formatTime(event.doors_open_utc)}</span>
                      </div>
                    )}

                    {/* Preço */}
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-full font-semibold min-h-[44px]">
                      <Ticket className="h-4 w-4" />
                      <span>{formatPrice()}</span>
                    </div>

                    {/* Classificação etária */}
                    {event.age_rating && (
                      <div className="inline-flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-800 rounded-full min-h-[44px]">
                        <span className="font-semibold">{event.age_rating === 'L' ? 'Livre' : `${event.age_rating}+`}</span>
                      </div>
                    )}
                  </div>

                  {/* Metadados clicáveis */}
                  <div className="space-y-4 mb-6">
                    {/* Local */}
                    {venue ? (
                      <Link 
                        to={`/locais/${venue.slug}`} 
                        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg transition-colors min-h-[44px]"
                      >
                        <MapPin className="h-4 w-4" />
                        <span>{venue.name}, {event.city}</span>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    ) : event.location_name ? (
                      <div className="inline-flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg min-h-[44px]">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location_name}, {event.city}</span>
                      </div>
                    ) : null}

                    {/* Link do mapa */}
                    {event.links?.map && (
                      <a
                        href={event.links.map}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-800 rounded-lg transition-colors ml-2 min-h-[44px]"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Ver no mapa</span>
                      </a>
                    )}

                    {/* Organizadores */}
                    {partners && partners.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Organização</h4>
                        <div className="flex flex-wrap gap-2">
                          {partners.map((partner) => (
                            <Link
                              key={partner.id}
                              to={`/organizadores/${partner.partners?.name?.toLowerCase().replace(/\s+/g, '-')}`}
                              className="inline-flex items-center gap-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg transition-colors min-h-[44px]"
                            >
                              <Users className="h-4 w-4" />
                              <span>{partner.display_name || partner.partners?.name}</span>
                              {partner.is_main && <span className="text-xs">• principal</span>}
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Gêneros e Tags */}
                    {(event.genres || event.tags) && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Gêneros e Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {event.genres?.map(genre => (
                            <Link
                              key={genre}
                              to={`/agenda?genre=${encodeURIComponent(genre)}`}
                              className="inline-flex items-center gap-1 px-3 py-2 bg-pink-50 hover:bg-pink-100 text-pink-800 rounded-lg transition-colors text-sm min-h-[44px]"
                            >
                              <Music2 className="h-3 w-3" />
                              {genre}
                            </Link>
                          ))}
                          {event.tags?.map(tag => (
                            <Link
                              key={tag}
                              to={`/agenda?tag=${encodeURIComponent(tag)}`}
                              className="inline-flex items-center gap-1 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors text-sm min-h-[44px]"
                            >
                              #{tag}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lineup de Verdade */}
            {lineup && lineup.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music2 className="h-5 w-5" />
                    Lineup
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lineup.map((slot) => (
                      <div key={slot.id} className="border-l-4 border-primary pl-4 py-2">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {/* Horário */}
                            {slot.start_time && (
                              <div className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                {formatTime(slot.start_time)}
                                {slot.end_time && `–${formatTime(slot.end_time)}`}
                              </div>
                            )}
                            {/* Palco */}
                            {slot.stage && (
                              <Badge variant="outline">{slot.stage}</Badge>
                            )}
                          </div>
                          {slot.is_headliner && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 mr-1" />
                              Headliner
                            </Badge>
                          )}
                        </div>

                        {/* Artistas com B2B */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {slot.event_lineup_slot_artists?.map((artistData, index) => (
                            <React.Fragment key={artistData.id || index}>
                              {index > 0 && <span className="text-muted-foreground font-bold mx-1"> x </span>}
                              {artistData.artists?.slug ? (
                                <Link
                                  to={`/artistas/${artistData.artists.slug}`}
                                  className="font-medium text-primary hover:underline"
                                >
                                  {artistData.artists.stage_name || artistData.artist_name}
                                </Link>
                              ) : (
                                <span className="font-medium">
                                  {artistData.artist_name}
                                </span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>

                        {/* Notas do slot */}
                        {slot.notes && (
                          <p className="text-sm text-muted-foreground italic">{slot.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Outras Sessões - Performances */}
            {performances && performances.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Performances</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performances.map((performance) => (
                      <div key={performance.id} className="border-l-4 border-orange-400 pl-4 py-2">
                        <div className="flex items-center gap-3 mb-2">
                          {performance.start_time && (
                            <div className="text-sm font-mono bg-muted px-2 py-1 rounded">
                              {formatTime(performance.start_time)}
                              {performance.duration_minutes && ` (${performance.duration_minutes}min)`}
                            </div>
                          )}
                          {performance.stage && (
                            <Badge variant="outline">{performance.stage}</Badge>
                          )}
                        </div>
                        <h4 className="font-medium">{performance.performer_name}</h4>
                        {performance.performance_type && (
                          <p className="text-sm text-muted-foreground">{performance.performance_type}</p>
                        )}
                        {performance.description && (
                          <p className="text-sm mt-2">{performance.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Artistas Visuais */}
            {visualArtists && visualArtists.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Arte Visual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visualArtists.map((artist) => (
                      <div key={artist.id} className="p-4 border rounded-lg">
                        <h4 className="font-medium">{artist.artist_name}</h4>
                        {artist.art_type && (
                          <p className="text-sm text-muted-foreground">{artist.art_type}</p>
                        )}
                        {artist.installation_location && (
                          <p className="text-sm text-muted-foreground">📍 {artist.installation_location}</p>
                        )}
                        {artist.description && (
                          <p className="text-sm mt-2">{artist.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Galeria */}
            {event.gallery && event.gallery.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Galeria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {event.gallery.map((image, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden">
                        <LazyImage 
                          src={image.url || image} 
                          alt={image.alt || `Galeria ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer" 
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Links Extras */}
            {event.links && Object.keys(event.links).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {event.links.site && (
                      <Button variant="outline" asChild>
                        <a href={event.links.site} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4 mr-2" />
                          Site
                        </a>
                      </Button>
                    )}
                    {event.links.instagram && (
                      <Button variant="outline" asChild>
                        <a href={event.links.instagram} target="_blank" rel="noopener noreferrer">
                          <Instagram className="h-4 w-4 mr-2" />
                          Instagram
                        </a>
                      </Button>
                    )}
                    {event.links.playlist && (
                      <Button variant="outline" asChild>
                        <a href={event.links.playlist} target="_blank" rel="noopener noreferrer">
                          <Music2 className="h-4 w-4 mr-2" />
                          Playlist
                        </a>
                      </Button>
                    )}
                    {event.links.video && (
                      <Button variant="outline" asChild>
                        <a href={event.links.video} target="_blank" rel="noopener noreferrer">
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Vídeo
                        </a>
                      </Button>
                    )}
                    {event.links.previous_edition && (
                      <Button variant="outline" asChild>
                        <a href={event.links.previous_edition} target="_blank" rel="noopener noreferrer">
                          <ChevronRight className="h-4 w-4 mr-2" />
                          Edição Anterior
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Resumo e Sobre */}
            {event.summary && (
              <Card>
                <CardHeader>
                  <CardTitle>Resumo</CardTitle>
                </CardHeader>
                <CardContent>
                  <SafeHTML 
                    content={event.summary}
                    className="prose prose-sm max-w-none"
                  />
                </CardContent>
              </Card>
            )}

            {event.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Sobre o Evento</CardTitle>
                </CardHeader>
                <CardContent>
                  <SafeHTML 
                    content={event.description}
                    className="prose prose-sm max-w-none"
                  />
                </CardContent>
              </Card>
            )}

            {/* Sistema de reviews e comentários */}
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

          {/* Sidebar - 1 coluna */}
          <div className="space-y-6">
            <EventCheckIn eventId={event.id} eventTitle={event.title} />
            <PushNotifications eventId={event.id} />
            
            {/* Local do Evento */}
            {venue && (
              <Card>
                <CardHeader>
                  <CardTitle>Local do Evento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Link to={`/locais/${venue.slug}`} className="font-medium hover:text-primary">
                        {venue.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">{venue.address}</p>
                      <p className="text-sm text-muted-foreground">{event.city}, {venue.state}</p>
                    </div>
                    
                    {venue.latitude && venue.longitude && (
                      <div className="h-48 rounded-lg overflow-hidden">
                        <CityMap 
                          events={[{
                            id: event.id,
                            title: event.title,
                            venue: venue.name,
                            location: venue.address,
                            city: event.city,
                            time: format(new Date(event.date_start), 'HH:mm'),
                            date: event.date_start,
                            genre: event.genres?.[0] || 'Evento',
                            category: 'Evento',
                            attendees: 0,
                            price: event.price_min,
                            description: event.description || '',
                            image: event.image_url || '',
                            featured: false,
                            coordinates: {
                              lat: venue.latitude,
                              lng: venue.longitude
                            }
                          }]}
                          center={[venue.longitude, venue.latitude]}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <RelatedEvents 
              currentEventId={event.id} 
              city={event.city}
              categories={event.genres || []}
            />
          </div>
        </div>
      </main>

      <ShareDialog 
        isOpen={shareOpen} 
        onClose={() => setShareOpen(false)} 
        event={{
          id: event.id,
          title: event.title,
          category: event.genres?.[0] || 'Evento',
          city: event.city,
          date: event.date_start,
          image: event.cover_url || event.image_url
        }} 
      />
      <Footer />
      <BackToTop />
    </div>
  );
};

export default EventDetailPage;