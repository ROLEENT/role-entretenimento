import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink } from "lucide-react";
import { formatEventDateTime } from "@/utils/dateUtils";

export type CityEnum = 'porto_alegre' | 'florianopolis' | 'curitiba' | 'sao_paulo' | 'rio_de_janeiro';

interface HighlightSliderCardProps {
  highlight: {
    id: string;
    event_title: string;
    venue: string;
    event_date: string | null;
    event_time?: string | null;
    ticket_price?: string | null;
    image_url: string;
    city: CityEnum;
    photo_credit: string | null;
    ticket_url: string | null;
    like_count: number;
  };
}

const formatCity = (city: CityEnum): string => {
  const cityMap = {
    porto_alegre: 'Porto Alegre',
    florianopolis: 'Florianópolis',
    curitiba: 'Curitiba',
    sao_paulo: 'São Paulo',
    rio_de_janeiro: 'Rio de Janeiro'
  };
  return cityMap[city] || city;
};

const getCityColor = (city: CityEnum): string => {
  const colorMap = {
    porto_alegre: 'bg-city-porto-alegre',
    florianopolis: 'bg-city-florianopolis', 
    curitiba: 'bg-city-curitiba',
    sao_paulo: 'bg-city-sao-paulo',
    rio_de_janeiro: 'bg-city-rio-de-janeiro'
  };
  return colorMap[city] || 'bg-primary';
};

export const HighlightSliderCard = ({ highlight }: HighlightSliderCardProps) => {
  const getImageUrl = (imageUrl: string): string => {
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    return `https://nutlcbnruabjsxecqpnd.supabase.co/storage/v1/object/public/highlights/${imageUrl}`;
  };


  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-0 bg-card/50 backdrop-blur-sm">
      <div className="relative">
        <div className="aspect-[16/10] overflow-hidden">
          <img
            src={getImageUrl(highlight.image_url)}
            alt={`${highlight.event_title} em ${formatCity(highlight.city)}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
        
        {/* City Badge */}
        <Badge 
          className={`absolute top-3 left-3 ${getCityColor(highlight.city)} text-white border-0 text-xs font-medium`}
        >
          {formatCity(highlight.city)}
        </Badge>

        {/* Photo Credit */}
        {highlight.photo_credit && (
          <div className="absolute bottom-2 right-2 bg-background/80 text-foreground text-xs px-2 py-1 rounded backdrop-blur-sm">
            {highlight.photo_credit}
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {highlight.event_title}
          </h3>
          
          <p className="text-xs text-muted-foreground">
            {highlight.venue}
          </p>

          {(highlight.event_date || highlight.event_time) && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{formatEventDateTime(highlight.event_date, highlight.event_time)}</span>
            </div>
          )}

          {highlight.ticket_price && (
            <div className="text-xs font-medium text-primary">
              {highlight.ticket_price}
            </div>
          )}
        </div>

        {highlight.ticket_url && (
          <Button 
            size="sm" 
            className="w-full text-xs"
            onClick={() => window.open(highlight.ticket_url!, '_blank')}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Ver Evento
          </Button>
        )}
      </CardContent>
    </Card>
  );
};