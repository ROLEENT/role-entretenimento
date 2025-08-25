import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { HighlightSliderCard, CityEnum } from './HighlightSliderCard';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface CityHighlightSliderProps {
  city: CityEnum;
  title: string;
  citySlug?: string;
}

interface Highlight {
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
}

export const CityHighlightSlider = ({ city, title, citySlug }: CityHighlightSliderProps) => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCityHighlights = async () => {
      try {
        setLoading(true);
        
        // First try to get highlights with likes from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        let { data: highlightsWithLikes, error } = await supabase
          .from('highlights')
          .select('*')
          .eq('city', city as any)
          .eq('is_published', true as any)
          .gte('event_date', thirtyDaysAgo.toISOString().split('T')[0])
          .gt('like_count', 0)
          .order('like_count', { ascending: false })
          .order('event_date', { ascending: false })
          .limit(5);

        if (error) throw error;

        // If we don't have enough highlights with likes, fill with recent ones
        if (!highlightsWithLikes || highlightsWithLikes.length < 5) {
          const { data: recentHighlights, error: recentError } = await supabase
            .from('highlights')
            .select('*')
            .eq('city', city as any)
            .eq('is_published', true as any)
            .order('event_date', { ascending: false, nullsFirst: false })
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: false })
            .limit(5);

          if (recentError) throw recentError;

          // Combine and deduplicate
          const combined = [...(highlightsWithLikes || [])];
          const existingIds = new Set(combined.map((h: any) => h.id));
          
          (recentHighlights || []).forEach((highlight: any) => {
            if (!existingIds.has(highlight.id) && combined.length < 5) {
              combined.push(highlight);
            }
          });

          setHighlights(combined as any);
        } else {
          setHighlights(highlightsWithLikes as any);
        }
      } catch (error) {
        console.error('Error fetching city highlights:', error);
        setHighlights([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCityHighlights();
  }, [city]);

  if (loading) {
    return (
      <section className="py-8">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex-none w-80">
              <Skeleton className="aspect-[16/10] w-full mb-4" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (highlights.length === 0) {
    return null; // Don't show section if no highlights
  }

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        {citySlug && (
          <Button variant="outline" size="sm" asChild>
            <Link to={`/destaques/${citySlug}`}>
              Ver todos de {title}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        )}
      </div>
      
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {highlights.map((highlight) => (
            <CarouselItem 
              key={highlight.id} 
              className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
            >
              <HighlightSliderCard highlight={highlight} />
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {highlights.length > 3 && (
          <>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </>
        )}
      </Carousel>
    </section>
  );
};