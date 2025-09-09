import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import SEOHead from '@/components/SEOHead';
import { SafeHTML } from '@/components/ui/safe-html';
import { ReviewSystem } from '@/components/reviews/ReviewSystem';
import { LikeSystem } from '@/components/events/LikeSystem';
import EventCheckIn from '@/components/events/EventCheckIn';
import PushNotifications from '@/components/events/PushNotifications';
import RelatedEvents from '@/components/events/RelatedEvents';
import { SmallLoginCta } from '@/components/events/SmallLoginCta';
import { CompactEngagementSystem } from '@/components/CompactEngagementSystem';
import { useComments } from '@/hooks/useComments';
import { useEventViews } from '@/hooks/useEventViews';
import { reviewService } from '@/services/eventService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Share2, 
  Bookmark, 
  Flag,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

// New components for the remodeled layout
import { EventBreadcrumb } from '@/components/events/EventBreadcrumb';
import { EventHeroSection } from '@/components/events/EventHeroSection';
import { EventTicketsSection } from '@/components/events/EventTicketsSection';
import { EventLineupSection } from '@/components/events/EventLineupSection';
import { EventOrganizerCard } from '@/components/events/EventOrganizerCard';
import { EventLinksCard } from '@/components/events/EventLinksCard';
import { EventMoodTagsCard } from '@/components/events/EventMoodTagsCard';
import { EventLocationCard } from '@/components/events/EventLocationCard';
// StickyTicketCTA removed per user request
import { EventCurationSection } from '@/components/events/EventCurationSection';
import { EventSEO } from '@/components/events/EventSEO';
import { useCurationDrawer } from '@/hooks/useCurationDrawer';
import { useCurationData } from '@/hooks/useCurationData';
import { CurationCriteriaDrawer } from '@/components/events/CurationCriteriaDrawer';
import { formatWeekdayPtBR } from '@/utils/dateUtils';
import '../styles/mobile-event-layout.css';

const EventDetailPageV2 = () => {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [venue, setVenue] = useState(null);
  const [organizer, setOrganizer] = useState(null);
  const [partners, setPartners] = useState([]);
  const [lineup, setLineup] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [visualArtists, setVisualArtists] = useState([]);
  const [fallbackArtists, setFallbackArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const { user, session } = useAuth();
  const { isOpen: curationDrawerOpen, openDrawer, closeDrawer } = useCurationDrawer();
  const { data: curationData } = useCurationData(event?.id || '');
  
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
        console.error('EventDetailPageV2 query error:', error);
        throw error;
      }
      
      if (!data) {
        setError(new Error('Evento não encontrado'));
        return;
      }
      
      setEvent(data);
      
      // Fetch venue data if venue_id exists
      if (data.venue_id) {
        const { data: venueData, error: venueError } = await supabase
          .from('venues')
          .select('*')
          .eq('id', data.venue_id)
          .single();
          
        if (venueError) {
          console.error('Venue query error:', venueError);
        } else {
          setVenue(venueData);
        }
      }
      
      // Fetch organizer data if organizer_id exists
      if (data.organizer_id) {
        const { data: organizerData, error: organizerError } = await supabase
          .from('organizers')
          .select('*')
          .eq('id', data.organizer_id)
          .single();
          
        if (organizerError) {
          console.error('Organizer query error:', organizerError);
        } else {
          setOrganizer(organizerData);
        }
      }
      // Fetch lineup data - corrigindo para usar event_lineup_slots
      if (data.id) {
        const { data: lineupData, error: lineupError } = await supabase
          .from('event_lineup_slots')
          .select(`
            id,
            slot_name,
            start_time,
            end_time,
            stage,
            position,
            is_headliner,
            event_lineup_slot_artists (
              id,
              artist_id,
              artist_name,
              position,
              role,
              artists (
                id,
                stage_name,
                slug,
                profile_image_url,
                bio_short,
                city
              )
            )
          `)
          .eq('event_id', data.id)
          .order('position', { ascending: true });
          
        if (lineupError) {
          console.error('Lineup query error:', lineupError);
        } else {
          // Keep the hierarchical structure - DON'T flatten!
          setLineup(lineupData || []);
        }
        
        // If no structured lineup data but event has tags, fetch known artists for fallback
        if ((!lineupData || lineupData.length === 0) && data.tags?.length > 0) {
          const { data: artistsData, error: artistsError } = await supabase
            .from('artists')
            .select('id, stage_name, slug, profile_image_url, bio_short')
            .in('slug', ['tupy', '598', 'andrey-pinheiro', 'dane-tone'])
            .order('stage_name');
            
          if (artistsError) {
            console.error('Fallback artists query error:', artistsError);
          } else {
            setFallbackArtists(artistsData || []);
          }
        }
      }
      
    } catch (err) {
      console.error('Error fetching event:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const reviewsData = await reviewService.getEventReviews(event.id);
      setReviews(reviewsData || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleAddReview = async (rating: number, comment?: string) => {
    try {
      await reviewService.addReview(event.id, rating, comment);
      await fetchReviews();
      toast.success('Avaliação adicionada com sucesso!');
    } catch (error: any) {
      console.error('Error adding review:', error);
      toast.error(error.message || 'Erro ao adicionar avaliação');
    }
  };

  const formatPrice = () => {
    if (event?.ticket_min_price && event?.ticket_max_price) {
      if (event.ticket_min_price === event.ticket_max_price) {
        return `R$ ${event.ticket_min_price}`;
      }
      return `R$ ${event.ticket_min_price} - R$ ${event.ticket_max_price}`;
    }
    if (event?.ticket_min_price) {
      return `R$ ${event.ticket_min_price}`;
    }
    return 'Consulte valores';
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      return format(new Date(timeString), "HH:mm", { locale: ptBR });
    } catch {
      return timeString;
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Confira este evento: ${event.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado para a área de transferência!');
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Evento removido dos favoritos' : 'Evento salvo nos favoritos');
  };

  const handleReport = () => {
    toast.success('Obrigado pelo feedback. Nossa equipe irá analisar.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
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

  return (
    <div className="min-h-screen bg-background mobile-event-container">
      <Header />
      <SEOHead 
        title={event ? `${event.title} - ${event.city}` : 'Evento'} 
        description={event?.description || 'Detalhes do evento'}
        image={event?.cover_url}
        canonical={`${window.location.origin}/evento/${event?.slug || slug}`}
      />
      
      <EventSEO event={event} />
      
      <main className="pb-16 lg:pb-8">
        {/* Breadcrumb */}
        {event && (
          <nav aria-label="Breadcrumb" className="mb-6 px-4 max-w-[680px] mx-auto mobile-breadcrumb">
            <div className="mobile-breadcrumb-content">
              <span>Início</span>
              <span> › </span>
              <span>{event.city}</span>
              <span> › </span>
              <span 
                className="text-foreground font-medium text-ellipsis overflow-hidden whitespace-nowrap max-w-[120px] md:max-w-[200px]"
                aria-label={event.title}
                title={event.title}
              >
                {event.title}
              </span>
            </div>
          </nav>
        )}
        
        {/* Hero Section */}
        {event && <EventHeroSection event={event} venue={venue} formatPrice={formatPrice} formatTime={formatTime} />}
        
        {/* Badges Section - Mobile First */}
        {event && (
          <div className="px-4 max-w-[680px] mx-auto mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              {event.highlight_type === 'curatorial' && (
                <div className="mobile-highlight-badge curatorial">
                  ✨ Destaque curatorial
                </div>
              )}
              {(event.highlight_type === 'vitrine' || event.highlight_type === 'sponsored') && (
                <div className="mobile-highlight-badge vitrine">
                  📢 Vitrine patrocinada
                </div>
              )}
              
              {/* Botão único de curadoria */}
              {(event.highlight_type === 'curatorial' || event.highlight_type === 'editorial') && event.curatorial_criteria && (
                <Button
                  id="curation-open"
                  variant="ghost"
                  size="sm"
                  onClick={openDrawer}
                  className="text-xs text-[#c77dff] hover:text-[#c77dff] hover:bg-[#c77dff]/10"
                >
                  Como escolhemos este destaque?
                </Button>
              )}
            </div>
          </div>
        )}
        
        {/* Tickets Section */}
        {event && <EventTicketsSection event={event} formatPrice={formatPrice} />}
        
        {/* Action Bar - Mobile Grid */}
        <div className="px-4 max-w-[680px] mx-auto mb-6">
          <div className="mobile-action-grid">
            <button
              onClick={handleShare}
              className="mobile-action-button"
              aria-label="Compartilhar evento"
            >
              <Share2 className="h-4 w-4" />
              <span>Compartilhar</span>
            </button>
            
            <button
              onClick={handleBookmark}
              className="mobile-action-button"
              aria-label={isBookmarked ? 'Remover dos salvos' : 'Salvar evento'}
            >
              <Bookmark className={cn(
                "h-4 w-4",
                isBookmarked && "fill-current"
              )} />
              <span>{isBookmarked ? 'Salvo' : 'Salvar'}</span>
            </button>
            
            <button
              onClick={handleReport}
              className="mobile-action-button"
              aria-label="Reportar evento"
            >
              <Flag className="h-4 w-4" />
              <span>Reportar</span>
            </button>
          </div>
        </div>
        
        {/* Main Content - Two column layout */}
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Curation Section */}
              {(event.highlight_type === 'curatorial' || event.highlight_type === 'editorial') && (
                <div className="mobile-curation-card">
                  <div className="mobile-curation-content">
                    <EventCurationSection 
                      eventId={event.id}
                      highlightType={event.highlight_type}
                    />
                  </div>
                </div>
              )}
              
              {/* Description Section */}
              {event.description && (
                <Card className="rounded-xl">
                  <CardContent className="p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-semibold mb-4">Descrição</h2>
                    <div className="prose prose-sm max-w-none text-[15px] md:text-base">
                      <SafeHTML content={event.description} />
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Lineup Section */}
              <EventLineupSection 
                lineup={lineup} 
                performances={performances} 
                visualArtists={visualArtists}
                event={event}
                fallbackArtists={fallbackArtists}
              />
              
              {/* Location Section with Map */}
              <EventLocationCard event={event} venue={venue} />
            </div>
            
            {/* Right Column - Sidebar (desktop only) */}
            <div className="hidden lg:block space-y-6">
              {/* Organizer Card */}
              <EventOrganizerCard organizer={organizer} venue={venue} />
              
              {/* Official Links */}
              <EventLinksCard event={event} partners={partners} />
              
              {/* Mood/Tags */}
              <EventMoodTagsCard event={event} />
              
              {/* Location Summary (smaller) */}
              <Card className="rounded-xl">
                <CardContent className="p-4">
                  <h4 className="font-medium text-sm text-muted-foreground mb-2 uppercase tracking-wide">
                    Local
                  </h4>
                  {venue?.slug ? (
                    <Link 
                      to={`/perfil/${venue.slug}`}
                      className="font-medium hover:text-primary transition-colors cursor-pointer"
                    >
                      {event.location_name || venue?.name}
                    </Link>
                  ) : (
                    <p className="font-medium">
                      {event.location_name || venue?.name}
                      {venue && !venue.slug && console.warn('Local sem slug definido:', venue.name)}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">{event.city}</p>
                  {venue?.opening_hours && typeof venue.opening_hours === 'object' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {(() => {
                        const hours = venue.opening_hours as Record<string, string>;
                        const todayEntries = Object.entries(hours).filter(([_, time]) => time && time.trim());
                        if (todayEntries.length === 0) return null;
                        const firstEntry = todayEntries[0];
                        const weekdayPtBR = formatWeekdayPtBR(firstEntry[0]);
                        return `${weekdayPtBR}: ${firstEntry[1]}`;
                      })()}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Mobile: Organizer & Links Cards */}
          <div className="lg:hidden space-y-4 mt-6">
            <EventOrganizerCard organizer={organizer} venue={venue} />
            <EventLinksCard event={event} partners={partners} />
            <EventMoodTagsCard event={event} />
          </div>
          
          {/* Comments & Reviews */}
          <div className="mt-8 md:mt-12 space-y-6 md:space-y-8">
            {commentsResult?.showComments && (
              <div>
                <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Comentários</h2>
                <Card className="rounded-xl">
                  <CardContent className="p-4 md:p-6">
                    <p className="text-muted-foreground text-sm md:text-base">Sistema de comentários em desenvolvimento</p>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <div>
              <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Avaliações</h2>
              <ReviewSystem
                itemId={event.id}
                itemType="event"
                reviews={reviews}
                onReviewAdded={fetchReviews}
                onAddReview={handleAddReview}
                loading={reviewsLoading}
              />
            </div>
          </div>
          
          {/* Related Events */}
          <div className="mt-8 md:mt-12">
            <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Você também pode gostar</h2>
            <RelatedEvents 
              currentEventId={event.id}
              city={event.city}
              categories={event.genres || []}
            />
          </div>
        </div>
      </main>
      
      {/* Sticky CTA for Mobile - removed per user request */}
      
      {/* Curation Criteria Drawer - Modal de leitura pública */}
      {event && event.curatorial_criteria && (
        <CurationCriteriaDrawer
          open={curationDrawerOpen}
          onOpenChange={closeDrawer}
          eventTitle={event.title}
          curatorialCriteria={event.curatorial_criteria}
        />
      )}
      
      <Footer />
      <BackToTop />
    </div>
  );
};

export default EventDetailPageV2;