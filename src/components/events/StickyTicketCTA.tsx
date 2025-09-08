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
        "fixed top-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-md border-b transition-transform duration-300 z-30 md:hidden",
        "safe-area-padding-top",
        isVisible ? "translate-y-0" : "-translate-y-full"
      )}
      style={{
        paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))',
        paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))'
      }}
    >
      <Button 
        asChild 
        size="default" 
        className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-medium min-h-[40px] rounded-lg text-sm"
      >
        <a 
          href={event.ticket_url || event.ticketing?.url} 
          target="_blank" 
          rel="noopener noreferrer"
          aria-label={`Comprar ingressos para ${event.title}`}
        >
          <Ticket className="h-5 w-5 mr-2" />
          Ingressos a partir de {formatPrice()}
        </a>
      </Button>
    </div>
  );
}