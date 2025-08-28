import { useState, useEffect } from 'react';
import { Share2, MapPin, Calendar, DollarSign, CalendarPlus, Users, Music, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type FavoriteEvent } from '@/hooks/useFavorites';
import { usePersonalCalendar } from '@/hooks/usePersonalCalendar';
import { useAuth } from '@/hooks/useAuth';
import { StarRatingDisplay } from '@/components/ui/star-rating';
import { reviewStatsService } from '@/services/reviewService';
import { useNativeShare } from '@/hooks/useNativeShare';
import { useCommentCount } from '@/hooks/useCommentCount';
import { CompactEngagementSystem } from './CompactEngagementSystem';
import ShareDialog from './ShareDialog';
import { MobileSafeImage } from './ui/mobile-safe-image';
import { useResponsive } from '@/hooks/useResponsive';
import { MessageCircle } from 'lucide-react';

interface EventCardProps {
  event: FavoriteEvent & {
    price: number;
    description?: string;
  };
  className?: string;
}

const EventCard = ({ event, className }: EventCardProps) => {
  const { shareOrFallback } = useNativeShare();
  const { addFavoriteToCalendar } = usePersonalCalendar();
  const { user } = useAuth();
  const { isMobile } = useResponsive();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0 });
  const { commentCount } = useCommentCount(event.id, 'event');

  useEffect(() => {
    const fetchReviewStats = async () => {
      try {
        const stats = await reviewStatsService.getEventReviewStats(event.id);
        setReviewStats(stats);
      } catch (error) {
        console.error('Error fetching review stats:', error);
      }
    };

    fetchReviewStats();
  }, [event.id]);

  const handleShare = () => {
    const eventUrl = `${window.location.origin}/event/${event.id}`;
    const shareData = {
      title: event.title,
      text: `Confira este evento: ${event.title} em ${event.city}`,
      url: eventUrl
    };

    shareOrFallback(shareData, () => setShowShareDialog(true));
  };

  const handleAddToCalendar = () => {
    if (!user) {
      // Redirecionar para login se não estiver logado
      window.location.href = '/auth';
      return;
    }
    addFavoriteToCalendar(event.id);
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Gratuito' : `R$ ${price.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <>
      <Card className={`group hover-lift overflow-hidden transition-all duration-300 hover:shadow-lg ${className}`}>
        <div className="relative overflow-hidden">
          <MobileSafeImage
            src={event.image || '/placeholder.svg'}
            alt={event.title}
            className={`w-full transition-transform duration-500 group-hover:scale-105 ${isMobile ? 'h-40' : 'h-48'} object-cover`}
            loading="lazy"
            sizes={isMobile ? '(max-width: 768px) 100vw' : '(max-width: 1024px) 50vw, 33vw'}
          />
          <div className={`absolute top-3 right-3 flex ${isMobile ? 'gap-1' : 'gap-2'}`}>
            <Button
              size="sm"
              variant="secondary"
              className={`touch-target bg-background/80 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-background/90 ${isMobile ? 'h-8 w-8 p-0' : 'h-8 w-8 p-0'}`}
              onClick={handleAddToCalendar}
              title="Adicionar ao calendário"
            >
              <CalendarPlus className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className={`touch-target bg-background/80 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-background/90 group ${isMobile ? 'h-8 w-8 p-0' : 'h-8 w-8 p-0'}`}
              onClick={handleShare}
            >
              <Share2 className={`transition-transform duration-200 group-hover:rotate-12 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </Button>
          </div>
          <Badge className="absolute top-3 left-3">
            {event.category}
          </Badge>
        </div>
        
        <CardContent className={`space-y-3 ${isMobile ? 'p-3' : 'p-4'}`}>
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{event.city}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>{formatPrice(event.price)}</span>
            </div>
            {commentCount > 0 && (
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span>{commentCount} comentário{commentCount !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {reviewStats.totalReviews > 0 && (
            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              <StarRatingDisplay 
                rating={reviewStats.averageRating} 
                totalReviews={reviewStats.totalReviews}
                size="sm"
              />
            </div>
          )}

          {event.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {event.description}
            </p>
          )}

          {/* Compact Engagement System with Like Button */}
          <div className="border-t pt-3">
            <CompactEngagementSystem 
              entityId={event.id}
              entityType="event"
              showCounts={true}
            />
          </div>

          <div className="flex gap-2">
            <Button className="flex-1 transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
              Ver Detalhes
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="transition-all duration-200 hover:scale-[1.02]"
              onClick={() => window.location.href = `/musica?evento=${event.id}&titulo=${encodeURIComponent(event.title)}`}
              title="Descobrir música do evento"
            >
              <Music className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="transition-all duration-200 hover:scale-[1.02]"
              onClick={() => window.location.href = `/grupos?evento=${event.id}`}
              title="Procurar companhia para este evento"
            >
              <Users className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <ShareDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        event={event}
      />
    </>
  );
};

export default EventCard;