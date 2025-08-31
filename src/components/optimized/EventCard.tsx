/**
 * Optimized Event Card Component
 * 
 * High-performance event card with lazy loading and memoization.
 */

import React, { useMemo, useCallback, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock, Users, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useImagePreloader, useIntersectionObserver } from '@/utils/performance';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    slug: string;
    date_start: string;
    date_end?: string;
    city: string;
    state?: string;
    image_url?: string;
    price_min?: number;
    price_max?: number;
    venue?: {
      name: string;
      address?: string;
    };
    organizer?: {
      name: string;
    };
    categories?: Array<{
      name: string;
      slug: string;
    }>;
  };
  variant?: 'default' | 'compact' | 'featured';
  showDescription?: boolean;
  className?: string;
  onLike?: (eventId: string) => void;
  isLiked?: boolean;
  priority?: boolean;
}

const EventCard = React.memo<EventCardProps>(({
  event,
  variant = 'default',
  showDescription = false,
  className,
  onLike,
  isLiked = false,
  priority = false
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Preload image if priority
  const preloadedImages = useImagePreloader(
    priority && event.image_url ? [event.image_url] : []
  );
  
  // Lazy load for non-priority images
  const intersectionRef = useIntersectionObserver(
    useCallback(() => {
      if (!priority && event.image_url && !imageLoaded) {
        const img = new Image();
        img.onload = () => setImageLoaded(true);
        img.onerror = () => setImageError(true);
        img.src = event.image_url;
      }
    }, [priority, event.image_url, imageLoaded]),
    { threshold: 0.1 }
  );
  
  // Memoize formatted dates
  const formattedDate = useMemo(() => {
    const startDate = new Date(event.date_start);
    const endDate = event.date_end ? new Date(event.date_end) : null;
    
    const dayMonth = format(startDate, 'dd MMM', { locale: ptBR });
    const time = format(startDate, 'HH:mm');
    const weekday = format(startDate, 'EEEE', { locale: ptBR });
    
    return {
      dayMonth,
      time,
      weekday,
      hasEndDate: !!endDate,
      endTime: endDate ? format(endDate, 'HH:mm') : null
    };
  }, [event.date_start, event.date_end]);
  
  // Memoize price display
  const priceDisplay = useMemo(() => {
    if (!event.price_min) return 'Gratuito';
    if (!event.price_max || event.price_min === event.price_max) {
      return `R$ ${event.price_min.toFixed(2)}`;
    }
    return `R$ ${event.price_min.toFixed(2)} - R$ ${event.price_max.toFixed(2)}`;
  }, [event.price_min, event.price_max]);
  
  // Memoized like handler
  const handleLike = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLike?.(event.id);
  }, [onLike, event.id]);
  
  // Check if image should be shown
  const shouldShowImage = useMemo(() => {
    if (!event.image_url) return false;
    if (priority) return preloadedImages.has(event.image_url);
    return imageLoaded;
  }, [event.image_url, priority, preloadedImages, imageLoaded]);
  
  const cardVariants = {
    default: 'h-full',
    compact: 'h-32',
    featured: 'h-64 md:h-80'
  };
  
  const contentVariants = {
    default: 'p-4',
    compact: 'p-3',
    featured: 'p-6'
  };
  
  return (
    <Card 
      ref={intersectionRef}
      className={cn(
        'group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        cardVariants[variant],
        className
      )}
    >
      <Link to={`/eventos/${event.slug}`} className="block h-full">
        {/* Image Section */}
        {event.image_url && (
          <div className="relative overflow-hidden bg-muted">
            {shouldShowImage && !imageError ? (
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
              />
            ) : (
              <div className="w-full h-32 bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-muted-foreground/40" />
              </div>
            )}
            
            {/* Like Button */}
            {onLike && (
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white/90"
                onClick={handleLike}
              >
                <Heart 
                  className={cn(
                    'h-4 w-4 transition-colors',
                    isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'
                  )} 
                />
              </Button>
            )}
            
            {/* Price Badge */}
            <Badge 
              variant="secondary" 
              className="absolute bottom-2 left-2 bg-white/90 text-black"
            >
              {priceDisplay}
            </Badge>
          </div>
        )}
        
        <CardContent className={contentVariants[variant]}>
          {/* Categories */}
          {event.categories && event.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {event.categories.slice(0, 2).map((category) => (
                <Badge key={category.slug} variant="outline" className="text-xs">
                  {category.name}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Title */}
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          
          {/* Date & Time */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Calendar className="h-4 w-4" />
            <span className="capitalize">{formattedDate.weekday}</span>
            <span>•</span>
            <span>{formattedDate.dayMonth}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                {formattedDate.time}
                {formattedDate.hasEndDate && ` - ${formattedDate.endTime}`}
              </span>
            </div>
          </div>
          
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <MapPin className="h-4 w-4" />
            <span className="truncate">
              {event.venue?.name || event.city}
              {event.venue?.name && `, ${event.city}`}
            </span>
          </div>
          
          {/* Organizer */}
          {event.organizer && variant !== 'compact' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="truncate">{event.organizer.name}</span>
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
});

EventCard.displayName = 'EventCard';

export default EventCard;