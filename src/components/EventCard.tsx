import { useState } from 'react';
import { Heart, Share2, MapPin, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFavorites, type FavoriteEvent } from '@/hooks/useFavorites';
import ShareDialog from './ShareDialog';
import LazyImage from './LazyImage';

interface EventCardProps {
  event: FavoriteEvent & {
    price: number;
    description?: string;
  };
  className?: string;
}

const EventCard = ({ event, className }: EventCardProps) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const favorite = isFavorite(event.id);

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
      <Card className={`group hover-scale overflow-hidden ${className}`}>
        <div className="relative">
          <LazyImage
            src={event.image || '/placeholder.svg'}
            alt={event.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
              onClick={() => toggleFavorite(event)}
            >
              <Heart className={`h-4 w-4 ${favorite ? 'fill-destructive text-destructive' : ''}`} />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowShareDialog(true)}
            >
              <Share2 className="h-4 w-4" />
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
          </div>

          {event.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {event.description}
            </p>
          )}

          <Button className="w-full">
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