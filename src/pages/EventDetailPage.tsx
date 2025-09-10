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
import EventCheckIn from '@/components/events/EventCheckIn';
import PushNotifications from '@/components/events/PushNotifications';
import RelatedEvents from '@/components/events/RelatedEvents';
import { ChipsList } from '@/components/ui/chips-list';
import { SmallLoginCta } from '@/components/events/SmallLoginCta';
import { useComments } from '@/hooks/useComments';
import { useEventViews } from '@/hooks/useEventViews';
import { CompactEngagementSystem } from '@/components/CompactEngagementSystem';
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
import { cn } from '@/lib/utils';
import { EventEngagement } from '@/components/events/EventEngagement';
import { LazyComments } from '@/components/events/LazyComments';
import { PostEventCheckIn } from '@/components/events/PostEventCheckIn';
import { ShareButton } from '@/components/events/ShareButton';
import { SaveEventButton } from '@/components/events/SaveEventButton';
import { useEnhancedNotifications } from '@/hooks/useEnhancedNotifications';
import { useEventAnalytics } from '@/hooks/useEventAnalytics';
import dayjs from 'dayjs';

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
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const { user, session } = useAuth();
  
  // Hook para comentários condicionais
  const commentsResult = useComments(event?.id, session);
  
  // Hook para visualizações
  const { viewCount, loading: viewsLoading } = useEventViews(event?.id);

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
        // Tentar fallback para agenda_public
        console.log('Evento não encontrado em events, tentando fallback para agenda...');
        const fallbackUrl = `/agenda/${eventSlug}`;
        
        if (fallbackUrl !== window.location.pathname) {
          console.log(`Redirecionando para: ${fallbackUrl}`);
          window.location.replace(fallbackUrl);
          return;
        }
        
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
            partners(id, name, image_url, website, instagram, slug)
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

  // Botões funcionais do cabeçalho
  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: event.title,
          text: event.summary || `${event.title} em ${event.city}`,
          url
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copiado para a área de transferência!");
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error("Erro ao compartilhar");
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }

    try {
      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('user_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('event_id', event.id);
        
        if (error) throw error;
        setIsBookmarked(false);
        toast.success("Evento removido dos salvos");
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('user_bookmarks')
          .insert({
            user_id: user.id,
            event_id: event.id
          });
        
        if (error) throw error;
        setIsBookmarked(true);
        toast.success("Evento salvo!");
      }
    } catch (error) {
      console.error('Error bookmarking:', error);
      toast.error("Erro ao salvar evento");
    }
  };

  const handleReport = () => {
    const reportUrl = `/ajuda/denunciar?eventId=${event.id}`;
    // Tentar abrir página de denúncia, fallback para email
    const newWindow = window.open(reportUrl, '_blank');
    if (!newWindow) {
      // Fallback para email se página não existir
      const mailtoUrl = `mailto:contato@roleentretenimento.com?subject=Denúncia evento ${event.slug}&body=Gostaria de reportar o evento: ${window.location.href}`;
      window.location.href = mailtoUrl;
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
          <Button asChild><Link to="/agenda">Ver Todos os Eventos</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  // Helper functions
  const formatPrice = () => {
    // Convert to numbers and handle PostgreSQL decimal values
    const minNum = event.price_min !== null && event.price_min !== undefined ? Number(event.price_min) : null;
    const maxNum = event.price_max !== null && event.price_max !== undefined ? Number(event.price_max) : null;
    
    // Both are null/undefined or both are 0
    if ((minNum === null && maxNum === null) || (minNum === 0 && maxNum === 0)) {
      return 'Gratuito';
    }
    
    // Only min is 0
    if (minNum === 0 && maxNum && maxNum > 0) {
      return `Gratuito - R$ ${maxNum}`;
    }
    
    // Both have same value
    if (minNum && maxNum && minNum === maxNum) {
      return `R$ ${minNum}`;
    }
    
    // Range
    if (minNum && maxNum) {
      return `R$ ${minNum} - R$ ${maxNum}`;
    }
    
    // Only min
    if (minNum && minNum > 0) {
      return `A partir de R$ ${minNum}`;
    }
    
    // Only max
    if (maxNum && maxNum > 0) {
      return `Até R$ ${maxNum}`;
    }
    
    // Fallback
    return 'Preço a consultar';
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
            <Card className={cn(
              "overflow-hidden",
              event.highlight_type === 'editorial' && 'border-purple-500 border-2',
              event.highlight_type === 'showcase' && 'border-blue-500 border-2',
              event.highlight_type === 'sponsored' && 'border-green-500 border-2'
            )}>
              <CardContent className="p-0">
                {/* Capa 16:9 */}
                <div className="relative aspect-video w-full">
                  <LazyImage 
                    src={event.cover_url || event.image_url} 
                    alt={event.cover_alt || event.title} 
                    className="w-full h-full object-cover" 
                  />
                  {/* Badge de tipo de destaque sobre a imagem */}
                  {(event.highlight_type && event.highlight_type !== 'none') && (
                    <div className="absolute top-4 left-4">
                      <Badge 
                        className={cn(
                          "font-medium",
                          event.highlight_type === 'editorial' && "bg-purple-100 text-purple-800 border-purple-300",
                          event.highlight_type === 'showcase' && "bg-blue-100 text-blue-800 border-blue-300",
                          event.highlight_type === 'sponsored' && "bg-green-100 text-green-800 border-green-300"
                        )}
                      >
                        {event.highlight_type === 'editorial' && '✨ Destaque Curatorial'}
                        {event.highlight_type === 'showcase' && '🎭 Vitrine Cultural'}
                        {event.highlight_type === 'sponsored' && '📢 Patrocinado'}
                      </Badge>
                    </div>
                  )}
                  {/* Botão de ingressos sobre a imagem */}
                  {(event.ticket_url || event.ticketing?.url) && (
                    <div className="absolute bottom-4 right-4">
                      <Button asChild size="default" className="bg-green-600 hover:bg-green-700 text-white font-medium min-h-[36px]">
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
                    
                    {/* Acessos rápidos funcionais */}
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={handleShare} className="min-h-[44px] min-w-[44px]">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleBookmark} className="min-h-[44px] min-w-[44px]">
                        <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleReport} className="min-h-[44px] min-w-[44px]">
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


                  {/* Gêneros e Tags limitados com "ver todos" */}
                  {(event.genres || event.tags) && (
                    <div className="space-y-4 mt-6">
                      {event.genres && event.genres.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Gêneros</h4>
                          <ChipsList
                            items={event.genres}
                            hrefBase="/agenda?genre="
                            max={6}
                            chipClassName="inline-flex items-center gap-1 px-3 py-2 bg-pink-50 hover:bg-pink-100 text-pink-800 rounded-lg transition-colors text-sm min-h-[44px]"
                          />
                        </div>
                      )}
                      
                      {event.tags && event.tags.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Tags</h4>
                          <ChipsList
                            items={event.tags}
                            hrefBase="/agenda?tag="
                            max={6}
                            chipClassName="inline-flex items-center gap-1 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors text-sm min-h-[44px]"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Line up - Seção clicável */}
            {lineup && lineup.length > 0 && (
              <section className="mt-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Music2 className="h-6 w-6" />
                  Line up
                </h2>
                <div className="divide-y border rounded-xl overflow-hidden">
                  {lineup
                    .sort((a, b) => new Date(a.start_time || 0).getTime() - new Date(b.start_time || 0).getTime())
                    .map(slot => (
                    <div key={slot.id} className="grid md:grid-cols-[120px_1fr] gap-3 p-4">
                      <div className="text-sm text-muted-foreground">
                        {slot.start_time && dayjs(slot.start_time).format("HH:mm")}
                        {slot.end_time && ` – ${dayjs(slot.end_time).format("HH:mm")}`}
                        {slot.stage && <div className="mt-1">{slot.stage}</div>}
                      </div>
                      <div>
                        <div className="text-base font-medium">
                          {slot.event_lineup_slot_artists?.sort((a, b) => a.position - b.position).map((artistData, i) => (
                            <React.Fragment key={artistData.id || artistData.artist_name || i}>
                              {i > 0 && <span className="mx-1 text-muted-foreground"> x </span>}
                              {artistData.artists?.slug ? (
                                <Link 
                                  to={`/perfil/${artistData.artists.slug}`} 
                                  className="text-primary hover:underline"
                                >
                                  {artistData.artists.stage_name || artistData.artist_name}
                                </Link>
                              ) : (
                                <span>{artistData.artist_name}</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                        {slot.notes && <div className="text-sm text-muted-foreground mt-1">{slot.notes}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
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
                      <Button variant="outline" asChild className="min-h-[44px]">
                        <a href={event.links.site} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4 mr-2" />
                          Site
                        </a>
                      </Button>
                    )}
                    {event.links.instagram && (
                      <Button variant="outline" asChild className="min-h-[44px]">
                        <a href={event.links.instagram} target="_blank" rel="noopener noreferrer">
                          <Instagram className="h-4 w-4 mr-2" />
                          Instagram
                        </a>
                      </Button>
                    )}
                    {event.links.playlist && (
                      <Button variant="outline" asChild className="min-h-[44px]">
                        <a href={event.links.playlist} target="_blank" rel="noopener noreferrer">
                          <Music2 className="h-4 w-4 mr-2" />
                          Playlist
                        </a>
                      </Button>
                    )}
                    {event.links.video && (
                      <Button variant="outline" asChild className="min-h-[44px]">
                        <a href={event.links.video} target="_blank" rel="noopener noreferrer">
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Vídeo
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

            {/* Sistema de reviews - espaço compacto quando vazio */}
            {reviews.length > 0 ? (
              <ReviewSystem
                itemId={event.id}
                itemType="event"
                reviews={reviews}
                onReviewAdded={fetchReviews}
                loading={reviewsLoading}
                onAddReview={handleAddReview}
              />
            ) : (
              <div className="flex items-center justify-center p-4 bg-muted/30 rounded-lg border border-dashed max-h-[120px]">
                <div className="text-center">
                  <Star className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Seja o primeiro a avaliar este evento
                  </p>
                  {user ? (
                    <Button size="sm" variant="outline">
                      Avaliar evento
                    </Button>
                  ) : (
                    <Link to="/auth" className="text-sm text-primary hover:underline">
                      Entrar para avaliar
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Comentários condicionais - sem toast vermelho */}
            {commentsResult.showComments ? (
              <Card>
                <CardHeader>
                  <CardTitle>Comentários</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Implementar CommentsList aqui quando a API estiver pronta */}
                  <p className="text-sm text-muted-foreground">Sistema de comentários em desenvolvimento</p>
                </CardContent>
              </Card>
            ) : (
              <SmallLoginCta />
            )}
          </div>

          {/* Sidebar - 1 coluna */}
          <div className="space-y-6">
            <EventCheckIn eventId={event.id} eventTitle={event.title} />
            <PushNotifications eventId={event.id} />
            
            {/* Sistema de Engajamento & Organizadores */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Evento & Organizadores</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {/* Interações */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Interações</h4>
                  <CompactEngagementSystem 
                    entityId={event.id}
                    entityType="event"
                    showCounts={true}
                  />
                </div>
                
                {/* Organizadores */}
                {partners && partners.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Organizadores</h4>
                    <div className="flex flex-wrap gap-2">
                      {partners.map(partner => (
                        <div 
                          key={partner.id} 
                          className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-md transition-colors text-xs"
                        >
                          {partner.partners?.slug ? (
                            <Link to={`/perfil/${partner.partners.slug}`} className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {partner.display_name || partner.partners?.name}
                              {partner.is_main && <span className="ml-1">• principal</span>}
                            </Link>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {partner.display_name || partner.partners?.name}
                              {partner.is_main && <span className="ml-1">• principal</span>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tipo de Destaque */}
                {(event.highlight_type && event.highlight_type !== 'none') && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Tipo de Destaque</h4>
                    <Badge 
                      className={cn(
                        "font-medium",
                        event.highlight_type === 'editorial' && "bg-purple-100 text-purple-800 border-purple-300",
                        event.highlight_type === 'showcase' && "bg-blue-100 text-blue-800 border-blue-300",
                        event.highlight_type === 'sponsored' && "bg-green-100 text-green-800 border-green-300"
                      )}
                    >
                      {event.highlight_type === 'editorial' && '✨ Destaque Curatorial'}
                      {event.highlight_type === 'showcase' && '🎭 Vitrine Cultural'}
                      {event.highlight_type === 'sponsored' && '📢 Patrocinado'}
                    </Badge>
                  </div>
                )}

                {/* Motivos do Destaque */}
                {(event.highlight_type && event.highlight_type !== 'none') && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      {event.highlight_type === 'editorial' && 'Por que é destaque'}
                      {event.highlight_type === 'showcase' && 'Relevância cultural'}
                      {event.highlight_type === 'sponsored' && 'Benefícios promocionais'}
                    </h4>
                    <div className="text-sm space-y-1">
                      {event.highlight_type === 'editorial' && Array.isArray(event.highlight_notes) && event.highlight_notes.length > 0 ? (
                        event.highlight_notes.slice(0, 3).map((reason, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-purple-600 mt-0.5">•</span>
                            <span className="text-purple-800">{reason}</span>
                          </div>
                        ))
                      ) : event.highlight_type === 'showcase' ? (
                        <div className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span className="text-blue-800">Projeto selecionado pela curadoria cultural</span>
                        </div>
                      ) : event.highlight_type === 'sponsored' ? (
                        <div className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">•</span>
                          <span className="text-green-800">Maior visibilidade e alcance promocional</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Contador de Visualizações */}
            {!viewsLoading && (
              <Card>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Visualizações</span>
                    <span className="font-medium">{viewCount.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Local do Evento - card compacto com link correto */}
            {(venue || event.location_name) && (
              <Card className="max-h-[400px]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Local do Evento</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div>
                      {venue?.slug ? (
                        <Link to={`/perfil/${venue.slug}`} className="font-medium hover:text-primary">
                          {venue.name}
                        </Link>
                      ) : (
                        <div className="font-medium">{venue?.name || event.location_name}</div>
                      )}
                      {(venue?.address || event.address) && (
                        <p className="text-sm text-muted-foreground">{venue?.address || event.address}</p>
                      )}
                      <p className="text-sm text-muted-foreground">{event.city}</p>
                    </div>
                    
                    {/* Link do mapa quando houver */}
                    {event.links?.map && (
                      <Button variant="outline" size="sm" asChild className="w-full min-h-[44px]">
                        <a href={event.links.map} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ver no mapa
                        </a>
                      </Button>
                    )}
                    
                    {venue?.latitude && venue?.longitude && (
                      <div className="h-32 rounded-lg overflow-hidden">
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

            {/* Share and Save Actions */}
            <div className="flex gap-3 flex-wrap mb-6">
              <ShareButton 
                eventId={event.id} 
                eventTitle={event.title}
                eventDate={dayjs(event.date_start).format('DD/MM/YYYY')}
              />
              <SaveEventButton eventId={event.id} />
            </div>
            
            {/* Event Engagement (likes, reactions) */}
            <EventEngagement eventId={event.id} eventDate={event.date_start} />
            
            {/* Post-Event Check-in (for past events) */}
            <PostEventCheckIn eventId={event.id} eventDate={event.date_start} eventTitle={event.title} />
            
            {/* Comments Section with Lazy Loading */}
            <LazyComments eventId={event.id} />

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