import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink, Ticket, Calendar } from "lucide-react";

interface HighlightCardProps {
  highlight: {
    id: string;
    city: string;
    event_title: string;
    venue: string;
    ticket_url?: string;
    event_date: string;
    role_text: string;
    selection_reasons: string[];
    image_url?: string;
    photo_credit?: string;
    sort_order: number;
    is_published: boolean;
  };
}

const HighlightCard = ({ highlight }: HighlightCardProps) => {
  const formatCity = (city: string) => {
    const cities: Record<string, string> = {
      'rio_de_janeiro': 'Rio de Janeiro',
      'sao_paulo': 'São Paulo',
      'porto_alegre': 'Porto Alegre',
      'florianopolis': 'Florianópolis',
      'curitiba': 'Curitiba'
    };
    return cities[city] || city;
  };

  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return null;
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    return `https://nutlcbnruabjsxecqpnd.supabase.co/storage/v1/object/public/highlights/${imageUrl}`;
  };

  return (
    <Card className="overflow-hidden bg-card border hover:shadow-lg transition-all duration-300">
      {/* Event Image */}
      {highlight.image_url && (
        <div className="relative h-64 md:h-72">
          <img
            src={getImageUrl(highlight.image_url)}
            alt={highlight.event_title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* City Badge */}
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="bg-white/90 text-foreground">
              {formatCity(highlight.city)}
            </Badge>
          </div>
          
          {/* Photo Credit */}
          {highlight.photo_credit && (
            <div className="absolute bottom-2 right-2">
              <span className="text-xs text-white/80 bg-black/50 px-2 py-1 rounded">
                {highlight.photo_credit}
              </span>
            </div>
          )}
        </div>
      )}

      <CardContent className="p-6 space-y-4">
        {/* Event Title */}
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-2 leading-tight">
            {highlight.event_title}
          </h3>
          
          {/* Event Details */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {highlight.venue}
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(highlight.event_date).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>

        {/* Ticket Button */}
        {highlight.ticket_url && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mb-4"
            asChild
          >
            <a href={highlight.ticket_url} target="_blank" rel="noopener noreferrer">
              <Ticket className="w-4 h-4 mr-2" />
              Comprar Ingresso
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </Button>
        )}

        {/* ROLÊ Editorial Text */}
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-foreground mb-2 text-sm uppercase tracking-wide">
              Por que está nos Destaques
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {highlight.role_text}
            </p>
          </div>

          {/* Selection Reasons */}
          <div>
            <h4 className="font-semibold text-foreground mb-2 text-sm uppercase tracking-wide">
              Nossos Motivos
            </h4>
            <div className="flex flex-wrap gap-2">
              {highlight.selection_reasons.map((reason, index) => (
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

export default HighlightCard;