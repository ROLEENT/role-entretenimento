import { MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MobileSafeImage } from './ui/mobile-safe-image';
import { formatEventDateTime } from '@/utils/dateUtils';
import { useNavigate } from 'react-router-dom';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    slug?: string;
    cover_url?: string;
    alt_text?: string;
    city?: string;
    venue?: string;
    start_at?: string;
    end_at?: string;
    tags?: string[];
    // Backwards compatibility
    image?: string;
    date?: string;
    time?: string;
    category?: string;
    price?: number;
    description?: string;
  };
  className?: string;
}

const EventCard = ({ event, className }: EventCardProps) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    const slug = event.slug || event.id;
    navigate(`/evento/${slug}`);
  };

  const handlePrefetch = () => {
    // Prefetch logic can be implemented here if needed
  };

  const displayTags = event.tags?.slice(0, 2) || [];
  const extraTagsCount = (event.tags?.length || 0) - 2;
  const location = event.venue || event.city || '';
  
  // Support both new and legacy date formats
  const startDate = event.start_at || event.date;
  const endDate = event.end_at;
  const eventTime = event.time;
  
  const period = startDate 
    ? formatEventDateTime(startDate, endDate || eventTime) 
    : '';

  return (
    <Card 
      className={`group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 ${className}`}
      onClick={handleClick}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      tabIndex={0}
      role="button"
      aria-label={`Ver detalhes do evento ${event.title}`}
    >
      <div className="relative overflow-hidden">
        <div className="aspect-[3/2]">
          <MobileSafeImage
            src={event.cover_url || event.image || '/placeholder.svg'}
            alt={event.alt_text || `Foto do evento ${event.title} em ${event.venue || 'local não informado'}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>
        
        {location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        )}
        
        <div className="text-sm text-muted-foreground">
          {period}
        </div>

        {displayTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {displayTags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {extraTagsCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                +{extraTagsCount}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventCard;