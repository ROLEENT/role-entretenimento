import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LazyImage from '@/components/LazyImage';
import { Ticket, Calendar, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface EventHeroSectionProps {
  event: any;
  venue?: any;
  formatPrice: () => string;
  formatTime: (timeString: string) => string;
}

export function EventHeroSection({ event, venue, formatPrice, formatTime }: EventHeroSectionProps) {
  return (
    <section className="relative w-full">
      {/* Hero Image - 16:9 */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
        <LazyImage 
          src={event.cover_url || event.image_url} 
          alt={event.cover_alt || event.title} 
          className="w-full h-full object-cover" 
        />
        
        {/* Gradient Overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Badge de tipo de destaque */}
        {(event.highlight_type && event.highlight_type !== 'none') && (
          <div className="absolute top-4 left-4">
            <Badge 
              className={cn(
                "font-medium text-xs px-3 py-1",
                event.highlight_type === 'editorial' && "bg-primary text-primary-foreground",
                event.highlight_type === 'showcase' && "bg-blue-500 text-white",
                event.highlight_type === 'sponsored' && "bg-green-500 text-white"
              )}
            >
              {event.highlight_type === 'editorial' && '✨ Destaque Curatorial'}
              {event.highlight_type === 'showcase' && '🎭 Vitrine Cultural'}
              {event.highlight_type === 'sponsored' && '📢 Patrocinado'}
            </Badge>
          </div>
        )}
        
        {/* CTA de ingressos - sempre visível */}
        <div className="absolute bottom-4 right-4">
          <Button 
            asChild 
            size="lg" 
            className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold min-h-[48px] shadow-lg"
          >
            <a 
              href={event.ticket_url || event.ticketing?.url || '#ingressos'} 
              target={event.ticket_url ? "_blank" : "_self"}
              rel={event.ticket_url ? "noopener noreferrer" : undefined}
            >
              <Ticket className="h-5 w-5 mr-2" />
              Ingressos a partir de {formatPrice()}
            </a>
          </Button>
        </div>
        
        {/* Event Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 leading-tight">
            {event.title}
          </h1>
          
          {/* Event Meta Info */}
          <div className="flex flex-wrap gap-4 text-sm md:text-base">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(event.date_start), "dd 'de' MMMM", { locale: ptBR })}
              </span>
            </div>
            
            {event.doors_open_utc && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {formatTime(event.doors_open_utc)}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>
                {event.location_name || venue?.name} • {event.city}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}