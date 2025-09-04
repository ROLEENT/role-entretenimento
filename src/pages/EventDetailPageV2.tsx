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
import { StickyTicketCTA } from '@/components/events/StickyTicketCTA';

const EventDetailPageV2 = () => {
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
        console.error('EventDetailPageV2 query error:', error);
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

  // Helper functions
  const formatPrice = () => {
    if (!event.price_min && !event.price_max) return 'Preço a consultar';
    if (event.price_min === 0) return 'Gratuito';
    if (event.price_min === event.price_max) return `R$ ${event.price_min}`;
    return `R$ ${event.price_min}${event.price_max ? ` - R$ ${event.price_max}` : '+'}`;
  };

  const formatTime = (timeString) => {
    return format(new Date(timeString), 'HH:mm', { locale: ptBR });
  };

  // Action handlers
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
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`${event.title} | ROLÊ`} 
        description={event.seo_description || event.summary || event.description?.substring(0, 160) || `${event.title} em ${event.city}`}
        image={event.og_image_url || event.cover_url || event.image_url}
      />
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <EventBreadcrumb event={event} />
        
        {/* Hero Section */}
        <EventHeroSection 
          event={event} 
          venue={venue} 
          formatPrice={formatPrice} 
          formatTime={formatTime} 
        />
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between my-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
            <Button variant="outline" size="sm" onClick={handleBookmark}>
              <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
              {isBookmarked ? 'Salvo' : 'Salvar'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleReport}>
              <Flag className="h-4 w-4 mr-2" />
              Reportar
            </Button>
          </div>
          
          <CompactEngagementSystem entityId={event.id} entityType="event" />
        </div>
        
        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tickets Section */}
            <EventTicketsSection event={event} formatPrice={formatPrice} />
            
            {/* Description Section */}
            {event.description && (
              <Card className="rounded-lg">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Descrição</h2>
                  <div className="prose prose-sm max-w-none">
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
            />
            
            {/* Location Section with Map */}
            <EventLocationCard event={event} venue={venue} />
          </div>
          
          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Organizer Card */}
            <EventOrganizerCard partners={partners} venue={venue} />
            
            {/* Official Links */}
            <EventLinksCard event={event} partners={partners} />
            
            {/* Mood/Tags */}
            <EventMoodTagsCard event={event} />
            
            {/* Location Summary (smaller) */}
            <Card className="rounded-lg">
              <CardContent className="p-4">
                <h4 className="font-medium text-sm text-muted-foreground mb-2 uppercase tracking-wide">
                  Local
                </h4>
                <p className="font-medium">{event.location_name || venue?.name}</p>
                <p className="text-sm text-muted-foreground">{event.city}</p>
                {venue?.opening_hours && (
                  <p className="text-sm text-muted-foreground mt-1">{venue.opening_hours}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Comments & Reviews */}
        <div className="mt-12 space-y-8">
          {commentsResult?.showComments && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Comentários</h2>
              <Card className="rounded-lg">
                <CardContent className="p-6">
                  <p className="text-muted-foreground">Sistema de comentários em desenvolvimento</p>
                </CardContent>
              </Card>
            </div>
          )}
          
          <div>
            <h2 className="text-2xl font-bold mb-6">Avaliações</h2>
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
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Você também pode gostar</h2>
          <RelatedEvents 
            currentEventId={event.id}
            city={event.city}
            categories={event.genres || []}
          />
        </div>
      </main>
      
      {/* Sticky CTA for Mobile */}
      <StickyTicketCTA event={event} formatPrice={formatPrice} />
      
      <Footer />
      <BackToTop />
    </div>
  );
};

export default EventDetailPageV2;