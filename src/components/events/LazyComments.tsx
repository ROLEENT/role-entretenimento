import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LazyCommentsProps {
  eventId: string;
  className?: string;
}

// Lazy import for the actual comments component
const EventCommentsV2 = React.lazy(() => 
  import('./EventCommentsV2').then(module => ({ default: module.EventComments }))
);

export function LazyComments({ eventId, className }: LazyCommentsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [loadComments, setLoadComments] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoadComments = () => {
    setLoadComments(true);
  };

  if (!isVisible) {
    return (
      <div ref={observerRef} className={`min-h-[200px] ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <MessageCircle className="h-6 w-6 animate-pulse text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Carregando seção de comentários...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!loadComments) {
    return (
      <Card className={className}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comentários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              Veja o que a galera está falando sobre este rolê
            </p>
            <Button 
              onClick={handleLoadComments}
              variant="outline"
              className="animate-scale-in"
            >
              Carregar comentários
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <React.Suspense 
      fallback={
        <Card className={className}>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <MessageCircle className="h-6 w-6 animate-pulse text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Carregando os comentários do rolê...</span>
            </div>
          </CardContent>
        </Card>
      }
    >
      <EventCommentsV2 eventId={eventId} className={className} />
    </React.Suspense>
  );
}