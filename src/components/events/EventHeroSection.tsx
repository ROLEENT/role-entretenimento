import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LazyImage from '@/components/LazyImage';
import { Ticket, Calendar, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { HighlightBadge } from './HighlightBadge';
import { CurationInfoBar } from './CurationInfoBar';
import { CurationCriteriaDrawer } from './CurationCriteriaDrawer';
import { useCurationData } from '@/hooks/useCurationData';

interface EventHeroSectionProps {
  event: any;
  venue?: any;
  formatPrice: () => string;
  formatTime: (timeString: string) => string;
}

export function EventHeroSection({ event, venue, formatPrice, formatTime }: EventHeroSectionProps) {
  const [showCriteriaDrawer, setShowCriteriaDrawer] = useState(false);
  const { data: curationData } = useCurationData(event.id);
  return (
    <section className="relative w-full px-4 max-w-[680px] mx-auto">
      {/* Hero Image - 16:9 com border-radius responsivo */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
        <LazyImage 
          src={event.cover_url || event.image_url} 
          alt={event.cover_alt || event.title} 
          className="w-full h-full object-cover" 
        />
        
        {/* Gradient Overlay apenas no desktop para CTA */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent md:from-background/80 md:via-background/20" />
        
        {/* Badge de destaque - mobile: linha própria acima do título */}
        <div className="absolute top-4 left-4 z-10 md:top-4 md:left-4">
          <HighlightBadge 
            type={event.highlight_type as any}
            isSponsored={event.is_sponsored}
            className="text-xs px-3 py-1 rounded-full"
          />
        </div>
        
        {/* Desktop CTA removed per user request */}
        
        {/* Event Title Overlay - removido do mobile */}
        <div className="hidden md:block absolute bottom-0 left-0 right-0 p-6 text-primary-foreground">
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

      {/* Mobile: Content below image */}
      <div className="md:hidden mt-4 space-y-4">
        {/* Badge no mobile (caso não tenha sido mostrado na imagem) */}
        {event.highlight_type && event.highlight_type !== 'none' && (
          <div className="flex">
            <HighlightBadge 
              type={event.highlight_type as any}
              isSponsored={event.is_sponsored}
              className="text-xs px-3 py-1 rounded-full"
            />
          </div>
        )}
        
        {/* Title */}
        <h1 className="text-[clamp(22px,6vw,28px)] leading-tight font-bold mt-2">
          {event.title}
        </h1>
        
        {/* Meta info */}
        <div className="flex flex-wrap gap-2 text-sm leading-relaxed opacity-90">
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

        {/* Mobile CTA removed per user request */}
      </div>

      {/* Faixa contextual compacta */}
      {event.highlight_type && event.highlight_type !== 'none' && (
        <div className="mt-4">
          <CurationInfoBar
            type={event.highlight_type as any}
            onShowCriteria={() => setShowCriteriaDrawer(true)}
          />
        </div>
      )}

      {/* Drawer de critérios - Modal de leitura pública */}
      {event.curatorial_criteria && (
        <CurationCriteriaDrawer
          open={showCriteriaDrawer}
          onOpenChange={setShowCriteriaDrawer}
          eventTitle={event.title}
          curatorialCriteria={event.curatorial_criteria}
        />
      )}
    </section>
  );
}