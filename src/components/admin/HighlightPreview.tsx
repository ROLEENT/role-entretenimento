import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, ExternalLink, Heart } from "lucide-react";

interface HighlightPreviewProps {
  highlight: {
    city: string;
    event_title: string;
    venue: string;
    ticket_url?: string;
    role_text: string;
    selection_reasons: string[];
    image_url?: string;
    photo_credit?: string;
    event_date?: string;
    like_count?: number;
  };
  getImageUrl: (url: string) => string;
  getCityDisplayName: (city: string) => string;
}

const HighlightPreview = ({ highlight, getImageUrl, getCityDisplayName }: HighlightPreviewProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data não informada';
    
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="relative overflow-hidden">
        <img
          src={getImageUrl(highlight.image_url || '')}
          alt={`${highlight.event_title} - ${highlight.venue}`}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.jpg';
          }}
        />
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-white/90 text-foreground">
            <Calendar className="mr-1 h-3 w-3" />
            {formatDate(highlight.event_date)}
          </Badge>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {highlight.photo_credit && (
          <div className="absolute bottom-2 right-2">
            <Badge variant="outline" className="bg-black/50 text-white text-xs">
              {highlight.photo_credit}
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="text-xl font-bold text-foreground">
            {getCityDisplayName(highlight.city)}
          </span>
          <div className="flex items-center space-x-1">
            <Heart className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium">{highlight.like_count || 0}</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h3 className="font-bold text-lg mb-1">{highlight.event_title}</h3>
          <div className="flex items-center text-muted-foreground mb-2">
            <MapPin className="mr-1 h-4 w-4" />
            <span className="text-sm">{highlight.venue}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {highlight.role_text}
        </p>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Motivos do destaque:</p>
          <div className="flex flex-wrap gap-1">
            {highlight.selection_reasons.map((reason, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {reason}
              </Badge>
            ))}
          </div>
        </div>

        {highlight.ticket_url && (
          <Button 
            className="w-full" 
            asChild
          >
            <a 
              href={highlight.ticket_url} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Ver Ingressos
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default HighlightPreview;