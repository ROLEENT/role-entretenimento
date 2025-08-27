import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink, Ticket, Calendar, Share2, MessageCircle } from "lucide-react";
import { useCommentCount } from '@/hooks/useCommentCount';
import { MobileSafeImage } from "@/components/ui/mobile-safe-image";
import { StarRatingDisplay } from "@/components/ui/star-rating";
import { reviewStatsService } from "@/services/reviewService";
import { useNativeShare } from "@/hooks/useNativeShare";
import { useResponsive } from "@/hooks/useResponsive";
import { formatHighlightDate, formatEventDateTime } from "@/utils/dateUtils";
import { EngagementSystem } from "./EngagementSystem";
import { toast } from 'sonner';

type CityEnum = 'porto_alegre' | 'sao_paulo' | 'rio_de_janeiro' | 'florianopolis' | 'curitiba';

interface HighlightCardProps {
  highlight: {
    id: string;
    city: CityEnum;
    event_title: string;
    venue: string;
    ticket_url?: string | null;
    event_date: string | null;
    event_time?: string | null;
    ticket_price?: string | null;
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
  const { shareOrFallback } = useNativeShare();
  const { isMobile, isTablet } = useResponsive();
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0 });
  const { commentCount } = useCommentCount(highlight.id, 'highlight');

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

  const handleShare = () => {
    const highlightUrl = `${window.location.origin}/destaque/${highlight.id}`;
    const shareData = {
      title: highlight.event_title,
      text: `Confira este destaque: ${highlight.event_title} em ${formatCity(highlight.city)}`,
      url: highlightUrl
    };

    shareOrFallback(shareData, () => {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(highlightUrl);
      toast.success('Link copiado para a área de transferência!');
    });
  };

  return (
    <Card className="group overflow-hidden bg-card border hover-lift transition-all duration-300 hover:shadow-xl">
      {/* Event Image */}
      <div className={`relative ${isMobile ? 'h-48' : isTablet ? 'h-56' : 'h-72'}`}>
        <MobileSafeImage
          src={getImageUrl(highlight.image_url) || ''}
          alt={highlight.event_title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 rounded-t-lg"
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* City Badge and Share Button */}
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-white/90 text-foreground">
            {formatCity(highlight.city)}
          </Badge>
        </div>
        <div className="absolute top-4 right-4">
          <Button
            size={isMobile ? "sm" : "sm"}
            variant="secondary"
            className={`${isMobile ? 'h-10 w-10 p-0' : 'h-8 w-8 p-0'} bg-white/90 hover:bg-white transition-all duration-200 hover:scale-110 group touch-target`}
            onClick={handleShare}
          >
            <Share2 className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} text-foreground transition-transform duration-200 group-hover:rotate-12`} />
          </Button>
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

      <CardContent className={`${isMobile ? 'p-4' : 'p-6'} space-y-4`}>
        {/* Event Title */}
        <div>
          <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-foreground mb-2 leading-tight`}>
            {highlight.event_title}
          </h3>
          
          {/* Event Details */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {highlight.venue}
            </div>
            {(highlight.event_date || highlight.event_time) && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {formatEventDateTime(highlight.event_date, highlight.event_time)}
              </div>
            )}
            {commentCount > 0 && (
              <div className="flex items-center">
                <MessageCircle className="w-4 h-4 mr-1" />
                {commentCount} comentário{commentCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Ticket Price */}
          {highlight.ticket_price && (
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full">
                <Ticket className="w-4 h-4" />
                <span className="font-medium text-sm">{highlight.ticket_price}</span>
              </div>
            </div>
          )}

          {/* Reviews Section */}
          {reviewStats.totalReviews > 0 && (
            <div className="mb-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <StarRatingDisplay 
                rating={reviewStats.averageRating} 
                totalReviews={reviewStats.totalReviews}
                size="sm"
              />
            </div>
          )}
        </div>

        {/* Engagement System */}
        <div className="border-t pt-4 mb-4">
          <EngagementSystem 
            entityId={highlight.id}
            entityType="highlight"
            size="sm"
            variant="default"
            showCounts={true}
          />
        </div>

        {/* Ticket Button */}
        {highlight.ticket_url && (
          <Button 
            variant="outline" 
            size={isMobile ? "default" : "sm"}
            className="w-full mb-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-md group touch-target"
            asChild
          >
            <a href={highlight.ticket_url} target="_blank" rel="noopener noreferrer">
              <Ticket className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:rotate-12" />
              Comprar Ingresso
              <ExternalLink className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
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