import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink, Ticket, Calendar } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { StarRatingDisplay } from "@/components/ui/star-rating";
import { reviewStatsService } from "@/services/reviewService";
import { formatHighlightDate } from "@/utils/dateUtils";

type CityEnum = 'porto_alegre' | 'sao_paulo' | 'rio_de_janeiro' | 'florianopolis' | 'curitiba';

interface HighlightCardProps {
  highlight: {
    id: string;
    city: CityEnum;
    event_title: string;
    venue: string;
    ticket_url?: string | null;
    event_date: string | null;
    role_text: string;
    selection_reasons: string[];
    image_url: string;
    photo_credit?: string | null;
    sort_order: number;
    like_count: number;
    created_at: string;
    updated_at: string;
  };
}

const HighlightCard = ({ highlight }: HighlightCardProps) => {
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0 });

  useEffect(() => {
    const fetchReviewStats = async () => {
      try {
        const stats = await reviewStatsService.getHighlightReviewStats(highlight.id);
        setReviewStats(stats);
      } catch (error) {
        console.error('Error fetching highlight review stats:', error);
      }
    };

    fetchReviewStats();
  }, [highlight.id]);

  const formatCity = (city: CityEnum) => {
    const cities: Record<CityEnum, string> = {
      'porto_alegre': 'Porto Alegre',
      'sao_paulo': 'São Paulo',
      'rio_de_janeiro': 'Rio de Janeiro',
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
      <div className="relative h-64 md:h-72">
        <ImageWithFallback
          src={getImageUrl(highlight.image_url) || ''}
          alt={highlight.event_title}
          className="w-full h-full object-cover"
          aspectRatio="video"
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
              {formatHighlightDate(highlight.event_date)}
            </div>
          </div>

          {/* Reviews Section */}
          {reviewStats.totalReviews > 0 && (
            <div className="mb-4">
              <StarRatingDisplay 
                rating={reviewStats.averageRating} 
                totalReviews={reviewStats.totalReviews}
                size="sm"
              />
            </div>
          )}
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