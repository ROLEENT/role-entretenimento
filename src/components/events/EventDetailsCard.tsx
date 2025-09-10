import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, Clock, Users, ExternalLink, Heart, Share2, Download } from 'lucide-react';
import { useFavorites } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import LazyImage from '@/components/LazyImage';
import ShareDialog from '@/components/ShareDialog';

interface EventDetailsCardProps {
  event: any;
}

const EventDetailsCard = ({ event }: EventDetailsCardProps) => {
  const [shareOpen, setShareOpen] = useState(false);
  const { addFavorite, removeFavorite, isFavorited } = useFavorites();
  const { isAuthenticated } = useAuth();

  const handleFavoriteClick = () => {
    if (isFavorited(event.id)) {
      removeFavorite(event.id);
    } else {
      addFavorite(event.id);
    }
  };

  const formatPrice = (min?: number, max?: number) => {
    if (!min && !max) return 'Gratuito';
    if (min === 0) return 'Gratuito';
    if (!max || min === max) return `R$ ${min}`;
    return `R$ ${min} - R$ ${max}`;
  };

  const generateCalendarUrl = () => {
    const startDate = new Date(event.date_start);
    const endDate = event.date_end ? new Date(event.date_end) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    
    const formatDateForCalendar = (date: Date) => {
      return date.toISOString().replace(/[:-]/g, '').split('.')[0] + 'Z';
    };

    const details = [
      event.description,
      event.venue?.name,
      event.venue?.address,
      event.external_url
    ].filter(Boolean).join('\n\n');

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${formatDateForCalendar(startDate)}/${formatDateForCalendar(endDate)}`,
      details,
      location: event.venue?.address || `${event.city}, ${event.state}`,
      sf: 'true',
      output: 'xml'
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const downloadICS = () => {
    const startDate = new Date(event.date_start);
    const endDate = event.date_end ? new Date(event.date_end) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    
    const formatDateForICS = (date: Date) => {
      return date.toISOString().replace(/[:-]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Role Entretenimento//NONSGML//PT',
      'BEGIN:VEVENT',
      `UID:${event.id}@roleentretenimento.com`,
      `DTSTAMP:${formatDateForICS(new Date())}`,
      `DTSTART:${formatDateForICS(startDate)}`,
      `DTEND:${formatDateForICS(endDate)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || ''}`,
      `LOCATION:${event.venue?.address || `${event.city}, ${event.state}`}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Card className="overflow-hidden">
        {event.image_url && (
          <div className="relative h-64 md:h-80">
            <LazyImage
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-2 mb-2">
                {event.categories?.map((cat: any) => (
                  <Badge key={cat.category.id} variant="secondary">
                    {cat.category.name}
                  </Badge>
                ))}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
                {event.title}
              </h1>
            </div>
          </div>
        )}

        <CardHeader className={!event.image_url ? 'pb-4' : 'pt-6'}>
          {!event.image_url && (
            <>
              <div className="flex items-center gap-2 mb-2">
                {event.categories?.map((cat: any) => (
                  <Badge key={cat.category.id} variant="secondary">
                    {cat.category.name}
                  </Badge>
                ))}
              </div>
              <CardTitle className="text-2xl md:text-3xl">
                {event.title}
              </CardTitle>
            </>
          )}
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant={isFavorited(event.id) ? "default" : "outline"}
              size="sm"
              onClick={handleFavoriteClick}
              disabled={!isAuthenticated}
              className="gap-2"
            >
              <Heart className={`w-4 h-4 ${isFavorited(event.id) ? 'fill-current' : ''}`} />
              {isFavorited(event.id) ? 'Favoritado' : 'Favoritar'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareOpen(true)}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              Compartilhar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(generateCalendarUrl(), '_blank')}
              className="gap-2"
            >
              <Calendar className="w-4 h-4" />
              Google Calendar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={downloadICS}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download .ics
            </Button>
            
            {event.external_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(event.external_url, '_blank')}
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Site do Evento
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Event Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>
                  {format(new Date(event.date_start), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>
                  {format(new Date(event.date_start), 'HH:mm')}
                  {event.date_end && ` - ${format(new Date(event.date_end), 'HH:mm')}`}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{event.city}, {event.state}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {formatPrice(event.price_min, event.price_max)}
                </p>
              </div>
            </div>
          </div>

          {event.description && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Sobre o Evento</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            </>
          )}

          {/* Venue Info */}
          {event.venue && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Local</h3>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{event.venue.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.venue.address}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {event.venue.city}, {event.venue.state}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Organizer Info */}
          {event.organizer && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Organizador</h3>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {event.organizer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{event.organizer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.organizer.contact_email}
                    </p>
                    {event.organizer.site && (
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto"
                        onClick={() => window.open(event.organizer.site, '_blank')}
                      >
                        Site oficial
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ShareDialog
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        event={{
          id: event.id,
          title: event.title,
          category: event.categories?.[0]?.category?.name || 'Evento',
          city: event.city,
          date: event.date_start,
          image: event.image_url
        }}
      />
    </>
  );
};

export default EventDetailsCard;