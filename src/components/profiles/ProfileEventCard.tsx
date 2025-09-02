import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPinIcon, TicketIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Event {
  id: string;
  title: string;
  date: Date;
  location: string;
  venue: string;
  price: string;
  status: 'available' | 'sold-out';
  tags?: string[];
}

interface ProfileEventCardProps {
  event: Event;
  compact?: boolean;
}

export function ProfileEventCard({ event, compact = false }: ProfileEventCardProps) {
  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-3">
          <div className="text-center min-w-[3rem]">
            <div className="text-xl font-bold leading-none">
              {format(event.date, "dd")}
            </div>
            <div className="text-xs uppercase text-muted-foreground">
              {format(event.date, "MMM", { locale: ptBR })}
            </div>
          </div>
          <div className="min-w-0">
            <h4 className="font-medium truncate">{event.title}</h4>
            <p className="text-sm text-muted-foreground truncate">
              {event.venue} • {event.location.split(',')[0]}
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline">
          <TicketIcon className="w-4 h-4 mr-1" />
          Ver
        </Button>
      </div>
    );
  }

  return (
    <article className="rounded-xl border bg-card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{event.title}</h3>
          <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              {format(event.date, "dd 'de' MMMM", { locale: ptBR })}
            </span>
            <span className="flex items-center gap-1">
              <MapPinIcon className="h-4 w-4" />
              {event.venue}
            </span>
          </div>
        </div>
        
        <div className="text-right ml-4">
          <div className="font-medium text-sm">{event.price}</div>
          <Badge 
            variant={event.status === 'available' ? 'default' : 'destructive'}
            className="text-xs mt-1"
          >
            {event.status === 'available' ? 'Disponível' : 'Esgotado'}
          </Badge>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {event.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        <Button size="sm" disabled={event.status === 'sold-out'}>
          <TicketIcon className="w-4 h-4 mr-1" />
          {event.status === 'available' ? 'Ingressos' : 'Esgotado'}
        </Button>
      </div>
    </article>
  );
}