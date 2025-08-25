import { useState, useEffect } from 'react';
import { Heart, Share2, MapPin, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFavorites, type FavoriteEvent } from '@/hooks/useFavorites';
import { StarRatingDisplay } from '@/components/ui/star-rating';
import { reviewStatsService } from '@/services/reviewService';
import { useNativeShare } from '@/hooks/useNativeShare';
import { useCommentCount } from '@/hooks/useCommentCount';
import ShareDialog from './ShareDialog';
import LazyImage from './LazyImage';
import { MessageCircle } from 'lucide-react';

interface EventCardProps {
  event: FavoriteEvent & {
    price: number;
    description?: string;
  };
  className?: string;
}

const EventCard = ({ event, className }: EventCardProps) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { shareOrFallback } = useNativeShare();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0 });
  const { commentCount } = useCommentCount(event.id, 'event');
  const favorite = isFavorite(event.id);

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
          <LazyImage
            src={event.image || '/placeholder.svg'}
            alt={event.title}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-background/90"
              onClick={() => toggleFavorite(event)}
            >
              <Heart className={`h-4 w-4 transition-all duration-300 ${
                favorite 
                  ? 'fill-destructive text-destructive animate-pulse' 
                  : 'hover:scale-110'
              }`} />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-background/90 group"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
            </Button>
          </div>
          <Badge className="absolute top-3 left-3">
            {event.category}
          </Badge>
        </div>
        
        <CardContent className="p-4 space-y-3">
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

          <Button className="w-full transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
            Ver Detalhes
          </Button>
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