import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StickyTicketCTAProps {
  event: any;
  formatPrice: () => string;
}

export function StickyTicketCTA({ event, formatPrice }: StickyTicketCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA when user scrolls past hero section
      const heroHeight = window.innerHeight * 0.6; // Approximate hero height
      setIsVisible(window.scrollY > heroHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!event.ticket_url && !event.ticketing?.url) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t transition-transform duration-300 z-50 md:hidden",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <Button 
        asChild 
        size="lg" 
        className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-semibold min-h-[48px]"
      >
        <a 
          href={event.ticket_url || event.ticketing?.url} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <Ticket className="h-5 w-5 mr-2" />
          Ingressos a partir de {formatPrice()}
        </a>
      </Button>
    </div>
  );
}