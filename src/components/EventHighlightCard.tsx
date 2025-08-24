import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink, Ticket } from "lucide-react";

interface EventHighlight {
  id: string;
  title: string;
  venue: string;
  location: string;
  ticketUrl?: string;
  editorialText: string;
  selectionReasons: string[];
  image: string;
  photoCredit: string;
  date: string;
  time: string;
  genre: string;
  price: number;
  city: string;
}

interface EventHighlightCardProps {
  event: EventHighlight;
}

const EventHighlightCard = ({ event }: EventHighlightCardProps) => {
  return (
    <Card className="overflow-hidden bg-card border hover-lift transition-all duration-300">
      {/* Event Image */}
      <div className="relative h-64 md:h-72">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Genre Badge */}
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-white/90 text-foreground">
            {event.genre}
          </Badge>
        </div>
        
        {/* Photo Credit */}
        <div className="absolute bottom-2 right-2">
          <span className="text-xs text-white/80 bg-black/50 px-2 py-1 rounded">
            {event.photoCredit}
          </span>
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        {/* Event Title */}
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-2 leading-tight">
            {event.title}
          </h3>
          
          {/* Event Details */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {event.venue}, {event.location}
            </div>
            <div>{event.date} • {event.time}</div>
            <div>R$ {event.price}</div>
          </div>
        </div>

        {/* Ticket Button */}
        {event.ticketUrl && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mb-4"
            asChild
          >
            <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer">
              <Ticket className="w-4 h-4 mr-2" />
              Comprar Ingresso
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </Button>
        )}

        {/* Editorial Text */}
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-foreground mb-2 text-sm uppercase tracking-wide">
              Por que está nos Destaques
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {event.editorialText}
            </p>
          </div>

          {/* Selection Reasons */}
          <div>
            <h4 className="font-semibold text-foreground mb-2 text-sm uppercase tracking-wide">
              Nossos Motivos
            </h4>
            <div className="flex flex-wrap gap-2">
              {event.selectionReasons.map((reason, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs px-2 py-1"
                >
                  {reason}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventHighlightCard;