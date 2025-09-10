import React from 'react';
import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, ExternalLink, Star, Crown, Sparkles, Heart, Share2, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format, isToday, isTomorrow, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EnhancedEventCardProps {
  event: {
    id: string;
    title: string;
    subtitle?: string;
    summary?: string;
    city?: string;
    location_name?: string;
    date_start?: string;
    date_end?: string;
    image_url?: string;
    cover_url?: string;
    highlight_type?: 'none' | 'curatorial' | 'vitrine' | 'editorial' | 'sponsored';
    is_sponsored?: boolean;
    age_rating?: string;
    genres?: string[];
    slug?: string;
    ticket_url?: string;
    status?: 'upcoming' | 'past' | 'today';
  };
  variant?: 'minimal' | 'compact' | 'standard' | 'featured' | 'hero';
  showSocialActions?: boolean;
  className?: string;
  onClick?: () => void;
}

const highlightStyles = {
  none: {
    gradient: '',
    badge: null,
    icon: null,
    glow: '',
    border: 'border-border',
  },
  curatorial: {
    gradient: 'bg-gradient-to-br from-primary/10 via-background to-primary/5',
    badge: { text: 'Destaque', variant: 'secondary' as const, color: 'text-primary' },
    icon: Star,
    glow: 'shadow-lg shadow-primary/20',
    border: 'border-primary/30',
  },
  vitrine: {
    gradient: 'bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-red-500/10',
    badge: { text: 'Vitrine', variant: 'default' as const, color: 'text-yellow-700' },
    icon: Crown,
    glow: 'shadow-xl shadow-yellow-500/30',
    border: 'border-yellow-500/40',
  }
};

const SocialActions = ({ eventId, compact = false }: { eventId: string; compact?: boolean }) => {
  const actions = [
    { icon: Heart, label: 'Curtir', count: '12' },
    { icon: Bookmark, label: 'Salvar' },
    { icon: Share2, label: 'Compartilhar' }
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {actions.map(({ icon: Icon, label, count }, index) => (
          <Button 
            key={index}
            variant="ghost" 
            size="sm"
            className="h-8 px-2 gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Icon className="h-3 w-3" />
            {count && <span className="text-xs">{count}</span>}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {actions.map(({ icon: Icon, label, count }, index) => (
          <Button 
            key={index}
            variant="ghost" 
            size="sm"
            className="gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Icon className="h-4 w-4" />
            {count && <span className="text-sm">{count}</span>}
          </Button>
        ))}
      </div>
    </div>
  );
};

export function EnhancedEventCard({ 
  event, 
  variant = 'standard',
  showSocialActions = true,
  className,
  onClick 
}: EnhancedEventCardProps) {
  const config = highlightStyles[event.highlight_type || 'none'];
  const IconComponent = config?.icon;
  
  const formatEventDate = (dateStart?: string) => {
    if (!dateStart) return '';
    
    const date = new Date(dateStart);
    
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    if (isYesterday(date)) return 'Ontem';
    
    return format(date, 'dd MMM', { locale: ptBR });
  };

  const formatDetailedDate = (dateStart?: string) => {
    if (!dateStart) return '';
    
    const date = new Date(dateStart);
    return format(date, 'EEEE, dd MMMM • HH:mm', { locale: ptBR });
  };

  // Minimal variant - apenas essencial
  if (variant === 'minimal') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={cn("group cursor-pointer", className)}
        onClick={onClick}
      >
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {event.image_url ? (
              <img 
                src={event.image_url} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
              {event.title}
            </h4>
            <p className="text-xs text-muted-foreground truncate">
              {formatEventDate(event.date_start)} • {event.location_name}
            </p>
          </div>
          
          {config.badge && (
            <Badge variant={config.badge.variant} className="text-xs px-2 py-0 h-5">
              {IconComponent && <IconComponent className="h-3 w-3 mr-1" />}
              {config.badge.text}
            </Badge>
          )}
        </div>
      </motion.div>
    );
  }

  // Compact variant
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

              <div className="flex-1 min-w-0 space-y-2">
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">
                  {event.title}
                </h3>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatEventDate(event.date_start)}</span>
                  </div>
                  
                  {event.location_name && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{event.location_name}</span>
                    </div>
                  )}
                </div>

                {showSocialActions && (
                  <SocialActions eventId={event.id} compact />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Hero variant - máximo destaque
  if (variant === 'hero') {
    return (
      <motion.div
        whileHover={{ scale: 1.02, y: -8 }}
        className={cn("group cursor-pointer", className)}
        onClick={onClick}
      >
        <Card className={cn(
          "overflow-hidden transition-all duration-700",
          config.border,
          config.glow,
          config.gradient,
          "relative"
        )}>
          {/* Background Effects */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.2),transparent)]" />
          </div>

          {/* Hero Image */}
          <div className="relative h-64 bg-gradient-to-br from-muted to-muted/60">
            {event.cover_url || event.image_url ? (
              <img 
                src={event.cover_url || event.image_url} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Sparkles className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
            
            {config.badge && (
              <div className="absolute top-4 left-4">
                <Badge 
                  variant={config.badge.variant}
                  className="text-sm px-3 py-1 shadow-lg backdrop-blur-sm"
                >
                  {IconComponent && <IconComponent className="h-4 w-4 mr-1" />}
                  {config.badge.text}
                </Badge>
              </div>
            )}

            {event.age_rating && (
              <div className="absolute top-4 right-4">
                <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                  {event.age_rating}
                </Badge>
              </div>
            )}
          </div>

          <CardContent className="p-6 relative">
            <div className="mb-4">
              <h2 className="text-2xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                {event.title}
              </h2>
              {event.subtitle && (
                <p className="text-muted-foreground mt-2 line-clamp-2">
                  {event.subtitle}
                </p>
              )}
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-base">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="font-medium">{formatDetailedDate(event.date_start)}</span>
              </div>
              
              {event.location_name && (
                <div className="flex items-center gap-3 text-base text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span>{event.location_name}</span>
                  {event.city && <span>• {event.city}</span>}
                </div>
              )}
            </div>

            {event.genres && event.genres.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {event.genres.slice(0, 4).map((genre, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {event.summary && (
              <p className="text-muted-foreground line-clamp-3 mb-6">
                {event.summary}
              </p>
            )}

            {showSocialActions && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="mb-6 pb-6 border-b border-border"
              >
                <SocialActions eventId={event.id} />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {event.ticket_url && (
                  <Button 
                    size="lg" 
                    className="gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(event.ticket_url, '_blank');
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Comprar Ingressos
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Standard variant (padrão melhorado)
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className={cn("group cursor-pointer", className)}
      onClick={onClick}
    >
      <Card className={cn(
        "overflow-hidden transition-all duration-300",
        config.border,
        config.glow,
        config.gradient
      )}>
        <div className="relative h-48 bg-gradient-to-br from-muted to-muted/60">
          {event.image_url ? (
            <img 
              src={event.image_url} 
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Calendar className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
          
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

          {event.age_rating && (
            <div className="absolute top-3 right-3">
              <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-xs">
                {event.age_rating}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2 mb-3">
            {event.title}
          </h3>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDetailedDate(event.date_start)}</span>
            </div>
            
            {event.location_name && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{event.location_name}</span>
                {event.city && <span>• {event.city}</span>}
              </div>
            )}
          </div>

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

          {event.summary && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {event.summary}
            </p>
          )}

          {showSocialActions && (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="pt-4 border-t border-border"
            >
              <SocialActions eventId={event.id} compact />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}