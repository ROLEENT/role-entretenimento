import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, Star, Crown, Sparkles, ExternalLink, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EventSocialActions } from "./EventSocialActions";

interface EventCardV3Props {
  event: {
    id: string;
    title: string;
    subtitle?: string;
    summary?: string;
    city?: string;
    location_name?: string;
    date_start?: string;
    date_end?: string;
    doors_open_utc?: string;
    image_url?: string;
    cover_url?: string;
    price_min?: number;
    price_max?: number;
    currency?: string;
    highlight_type?: 'none' | 'curatorial' | 'vitrine' | 'editorial' | 'sponsored';
    is_sponsored?: boolean;
    age_rating?: string;
    genres?: string[];
    slug?: string;
    ticket_url?: string;
    lineup?: Array<{ name: string; is_headliner?: boolean }>;
  };
  variant?: 'default' | 'compact' | 'grid' | 'featured';
  className?: string;
  onClick?: () => void;
}

const highlightConfig = {
  none: {
    gradient: '',
    badge: null,
    icon: null,
    glow: '',
    border: 'border-border',
  },
  curatorial: {
    gradient: 'bg-gradient-to-br from-primary/10 via-background to-primary/5',
    badge: { text: 'Destaque Curatorial', variant: 'secondary' as const },
    icon: Star,
    glow: 'shadow-lg shadow-primary/20',
    border: 'border-primary/30',
  },
  vitrine: {
    gradient: 'bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-red-500/10',
    badge: { text: 'Vitrine Cultural', variant: 'default' as const },
    icon: Crown,
    glow: 'shadow-xl shadow-yellow-500/30',
    border: 'border-yellow-500/40',
  }
};

export function EventCardV3({ 
  event, 
  variant = 'default', 
  className,
  onClick 
}: EventCardV3Props) {
  // Normalize highlight_type for backward compatibility
  const normalizedHighlightType = (() => {
    const type = event.highlight_type || 'none';
    if (type === 'editorial') return 'curatorial';
    if (type === 'sponsored') return 'vitrine';
    return type;
  })();
  
  const config = highlightConfig[normalizedHighlightType] || highlightConfig.none;
  const IconComponent = config?.icon;
  
  const formatEventDate = (dateStart?: string, dateEnd?: string) => {
    if (!dateStart) return '';
    
    const start = new Date(dateStart);
    const end = dateEnd ? new Date(dateEnd) : null;
    
    if (end && start.toDateString() !== end.toDateString()) {
      return `${format(start, 'dd MMM', { locale: ptBR })} - ${format(end, 'dd MMM', { locale: ptBR })}`;
    }
    
    return format(start, 'dd MMM • HH:mm', { locale: ptBR });
  };

  const formatPrice = (min?: number, max?: number, currency = 'BRL') => {
    if (!min && !max) return 'Grátis';
    if (min === max) return `R$ ${min}`;
    if (min && max) return `R$ ${min} - R$ ${max}`;
    if (min) return `A partir de R$ ${min}`;
    return `Até R$ ${max}`;
  };

  const headliners = event.lineup?.filter(artist => artist.is_headliner).slice(0, 2) || [];
  const hasMoreArtists = (event.lineup?.length || 0) > 2;

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={cn("group cursor-pointer", className)}
        onClick={onClick}
      >
        <Card className={cn(
          "overflow-hidden transition-all duration-300",
          config.border,
          config.glow,
          config.gradient
        )}>
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Image */}
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {event.image_url ? (
                  <img 
                    src={event.image_url} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                
                {/* Highlight Badge */}
                {config.badge && (
                  <div className="absolute -top-1 -right-1">
                    <Badge 
                      variant={config.badge.variant}
                      className="text-xs px-1 py-0 h-5"
                    >
                      {IconComponent && <IconComponent className="h-3 w-3" />}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                  {event.title}
                </h3>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatEventDate(event.date_start, event.date_end)}</span>
                </div>
                
                {event.location_name && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{event.location_name}</span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-medium text-primary">
                  {formatPrice(event.price_min, event.price_max)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (variant === 'featured') {
    return (
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        className={cn("group cursor-pointer", className)}
        onClick={onClick}
      >
        <Card className={cn(
          "overflow-hidden transition-all duration-500",
          config.border,
          config.glow,
          config.gradient,
          "relative"
        )}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]" />
          </div>

          {/* Hero Image */}
          <div className="relative h-48 bg-gradient-to-br from-muted to-muted/60">
            {event.cover_url || event.image_url ? (
              <img 
                src={event.cover_url || event.image_url} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Sparkles className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
            
            {/* Highlight Badge */}
            {config.badge && (
              <div className="absolute top-3 left-3">
                <Badge 
                  variant={config.badge.variant}
                  className="text-sm px-3 py-1 shadow-lg backdrop-blur-sm"
                >
                  {IconComponent && <IconComponent className="h-4 w-4 mr-1" />}
                  {config.badge.text}
                </Badge>
              </div>
            )}

            {/* Age Rating */}
            {event.age_rating && (
              <div className="absolute top-3 right-3">
                <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                  {event.age_rating}
                </Badge>
              </div>
            )}
          </div>

          <CardContent className="p-6 relative">
            {/* Title & Subtitle */}
            <div className="mb-4">
              <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                {event.title}
              </h3>
              {event.subtitle && (
                <p className="text-muted-foreground mt-1 line-clamp-1">
                  {event.subtitle}
                </p>
              )}
            </div>

            {/* Event Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{formatEventDate(event.date_start, event.date_end)}</span>
              </div>
              
              {event.location_name && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location_name}</span>
                  {event.city && <span>• {event.city}</span>}
                </div>
              )}

              {event.doors_open_utc && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Abertura: {format(new Date(event.doors_open_utc), 'HH:mm')}</span>
                </div>
              )}
            </div>

            {/* Lineup */}
            {headliners.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Lineup</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {headliners.map((artist, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {artist.name}
                    </Badge>
                  ))}
                  {hasMoreArtists && (
                    <Badge variant="outline" className="text-xs">
                      +{(event.lineup?.length || 0) - 2} mais
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Genres */}
            {event.genres && event.genres.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {event.genres.slice(0, 3).map((genre, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            {event.summary && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {event.summary}
              </p>
            )}

            {/* Social Actions */}
            <div 
              onClick={(e) => e.stopPropagation()}
              className="mb-4 pb-4 border-b border-border"
            >
              <EventSocialActions eventId={event.id} />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-primary">
                {formatPrice(event.price_min, event.price_max)}
              </div>
              
              {event.ticket_url && (
                <Button 
                  size="sm" 
                  className="gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(event.ticket_url, '_blank');
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                  Ingressos
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn("group cursor-pointer", className)}
      onClick={onClick}
    >
      <Card className={cn(
        "overflow-hidden transition-all duration-300",
        config.border,
        config.glow,
        config.gradient
      )}>
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-muted to-muted/60">
          {event.image_url ? (
            <img 
              src={event.image_url} 
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Calendar className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
          
          {/* Highlight Badge */}
          {config.badge && (
            <div className="absolute top-3 left-3">
              <Badge 
                variant={config.badge.variant}
                className="text-xs shadow-lg backdrop-blur-sm"
              >
                {IconComponent && <IconComponent className="h-3 w-3 mr-1" />}
                {config.badge.text}
              </Badge>
            </div>
          )}

          {/* Price */}
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-background/90 text-foreground shadow-lg backdrop-blur-sm">
              {formatPrice(event.price_min, event.price_max)}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2 mb-2">
            {event.title}
          </h3>

          {/* Date & Location */}
          <div className="space-y-1 mb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatEventDate(event.date_start, event.date_end)}</span>
            </div>
            
            {event.location_name && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{event.location_name}</span>
                {event.city && <span>• {event.city}</span>}
              </div>
            )}
          </div>

          {/* Summary */}
          {event.summary && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {event.summary}
            </p>
          )}

          {/* Social Actions */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="pt-3 border-t border-border"
          >
            <EventSocialActions eventId={event.id} compact />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}