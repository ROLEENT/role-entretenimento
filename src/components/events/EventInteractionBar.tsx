import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Share2, 
  Heart, 
  MessageCircle, 
  Calendar,
  Flag 
} from 'lucide-react';
import { ShareButton } from '@/components/ui/share-button';
import { FavoriteButton } from '@/components/FavoriteButton';
import { toast } from 'sonner';

interface EventInteractionBarProps {
  event: any;
  className?: string;
}

export function EventInteractionBar({ event, className = "" }: EventInteractionBarProps) {
  const [showComments, setShowComments] = useState(false);

  const handleAddToCalendar = () => {
    if (!event.date_start) {
      toast.error('Data do evento não disponível');
      return;
    }

    const startDate = new Date(event.date_start);
    const endDate = event.date_end ? new Date(event.date_end) : new Date(startDate.getTime() + 3 * 60 * 60 * 1000); // 3 hours default

    // Create .ics file content
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ROLÊ//Event Calendar//PT',
      'BEGIN:VEVENT',
      `UID:${event.id}@role.com.br`,
      `DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${(event.description || '').replace(/\n/g, '\\n')}`,
      `LOCATION:${event.location_name || ''}, ${event.address || ''}, ${event.city || ''}`,
      `URL:${window.location.href}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    // Create blob and download
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Evento adicionado ao calendário!');
  };

  const handleReport = () => {
    toast.success('Obrigado pelo feedback. Nossa equipe irá analisar.');
  };

  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  return (
    <div className={`flex items-center justify-between gap-2 ${className}`}>
      {/* Left side - Primary actions */}
      <div className="flex items-center gap-2 flex-1">
        {/* Share */}
        <ShareButton
          url={window.location.href}
          title={event.title}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 px-3"
        />
        
        {/* Favorite */}
        <FavoriteButton
          eventId={event.id}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 px-3"
        />
        
        {/* Add to Calendar */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddToCalendar}
          className="flex items-center gap-2 px-3"
        >
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Agenda</span>
        </Button>
        
        {/* Comments */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleComments}
          className="flex items-center gap-2 px-3"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Comentários</span>
        </Button>
      </div>

      {/* Right side - Report */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleReport}
        className="text-muted-foreground hover:text-foreground"
      >
        <Flag className="h-4 w-4" />
      </Button>
    </div>
  );
}