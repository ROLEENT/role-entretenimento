import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Users, ExternalLink, Monitor, Smartphone } from 'lucide-react';
import { EventFormV3 } from '@/schemas/event-v3';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventPreviewCardProps {
  data: EventFormV3;
  variant?: 'desktop' | 'mobile';
  className?: string;
}

export const EventPreviewCard = ({ 
  data, 
  variant = 'desktop',
  className 
}: EventPreviewCardProps) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd 'de' MMMM", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'HH:mm', { locale: ptBR });
    } catch {
      return '';
    }
  };

  const isMobile = variant === 'mobile';

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {isMobile ? (
          <Smartphone className="h-4 w-4" />
        ) : (
          <Monitor className="h-4 w-4" />
        )}
        <span>Preview {isMobile ? 'Mobile' : 'Desktop'}</span>
      </div>
      
      <Card className={`overflow-hidden ${
        isMobile ? 'max-w-sm mx-auto' : 'max-w-md'
      }`}>
        {/* Cover Image */}
        {data.cover_url && (
          <div className={`relative ${isMobile ? 'h-48' : 'h-56'}`}>
            <img
              src={data.cover_url}
              alt={data.cover_alt || data.title}
              className="w-full h-full object-cover"
            />
            
            {/* Highlight Badge */}
            {data.highlight_type !== 'none' && (
              <div className="absolute top-3 left-3">
                <Badge 
                  variant={data.highlight_type === 'vitrine' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {data.highlight_type === 'vitrine' ? 'Vitrine Cultural' : 'Destaque'}
                </Badge>
              </div>
            )}
            
            {/* Sponsored Badge */}
            {data.is_sponsored && (
              <div className="absolute top-3 right-3">
                <Badge variant="outline" className="text-xs bg-white/90">
                  Patrocinado
                </Badge>
              </div>
            )}
          </div>
        )}
        
        <CardHeader className={`pb-3 ${isMobile ? 'p-4' : ''}`}>
          <div className="space-y-2">
            <h3 className={`font-bold line-clamp-2 ${
              isMobile ? 'text-lg' : 'text-xl'
            }`}>
              {data.title || 'Título do Evento'}
            </h3>
            
            {data.description && (
              <p className={`text-muted-foreground line-clamp-3 ${
                isMobile ? 'text-sm' : 'text-base'
              }`}>
                {data.description}
              </p>
            )}
          </div>
        </CardHeader>
        
        <CardContent className={`space-y-3 ${isMobile ? 'p-4 pt-0' : 'pt-0'}`}>
          {/* Date and Time */}
          {data.start_utc && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{formatDate(data.start_utc)}</span>
              {formatTime(data.start_utc) && (
                <>
                  <Clock className="h-3 w-3 text-muted-foreground ml-2" />
                  <span className="text-muted-foreground">{formatTime(data.start_utc)}</span>
                </>
              )}
            </div>
          )}
          
          {/* Venue and City */}
          {data.city && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{data.city}</span>
            </div>
          )}
          
          {/* Artists */}
          {data.artists_names && data.artists_names.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {data.artists_names.slice(0, 3).join(', ')}
                {data.artists_names.length > 3 && ` +${data.artists_names.length - 3}`}
              </span>
            </div>
          )}
          
          {/* Tags */}
          {data.tags && data.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {data.tags.slice(0, isMobile ? 3 : 4).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {data.tags.length > (isMobile ? 3 : 4) && (
                <Badge variant="outline" className="text-xs">
                  +{data.tags.length - (isMobile ? 3 : 4)}
                </Badge>
              )}
            </div>
          )}
          
          {/* Ticket Info */}
          {data.ticketing && (
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  {data.ticketing.min_price && data.ticketing.max_price ? (
                    <span className="font-medium">
                      R$ {data.ticketing.min_price} - R$ {data.ticketing.max_price}
                    </span>
                  ) : data.ticketing.min_price ? (
                    <span className="font-medium">
                      A partir de R$ {data.ticketing.min_price}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Preço não informado</span>
                  )}
                </div>
                
                {data.ticketing.url && (
                  <Button size="sm" variant="outline" className="h-8">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    {isMobile ? 'Ver' : 'Ingressos'}
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {/* Performance and Visual Art counts */}
          {(data.performances?.length || data.visual_art?.length) && (
            <div className="pt-2 border-t text-xs text-muted-foreground">
              {data.performances?.length && (
                <span>{data.performances.length} performance(s)</span>
              )}
              {data.performances?.length && data.visual_art?.length && (
                <span className="mx-2">•</span>
              )}
              {data.visual_art?.length && (
                <span>{data.visual_art.length} artista(s) visual(is)</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};