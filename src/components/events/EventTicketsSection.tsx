import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ticket, ExternalLink } from 'lucide-react';

interface EventTicketsSectionProps {
  event: any;
  formatPrice: () => string;
}

export function EventTicketsSection({ event, formatPrice }: EventTicketsSectionProps) {
  // Parse ticket tiers from ticketing data or create single tier from price
  const getTicketTiers = () => {
    if (event.ticketing?.tiers && Array.isArray(event.ticketing.tiers)) {
      return event.ticketing.tiers;
    }
    
    // Fallback to single tier from price data
    return [{
      name: 'Ingresso',
      price: event.price_min || 0,
      currency: event.currency || 'BRL',
      link: event.ticket_url || event.ticketing?.url,
      available: true
    }];
  };

  const ticketTiers = getTicketTiers();

  const formatTicketPrice = (price: number, currency: string = 'BRL') => {
    if (price === 0) return 'Gratuito';
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'BRL' ? 'BRL' : 'USD'
    }).format(price);
  };

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-primary" />
          Ingressos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {ticketTiers.map((tier, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
          >
            <div className="flex-1">
              <h4 className="font-medium">{tier.name}</h4>
              <p className="text-lg font-bold text-primary">
                {formatTicketPrice(tier.price, tier.currency)}
              </p>
            </div>
            
            {tier.link && tier.available && (
              <Button asChild size="sm" className="ml-4">
                <a 
                  href={tier.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  Comprar
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
            
            {!tier.available && (
              <Button size="sm" disabled className="ml-4">
                Esgotado
              </Button>
            )}
          </div>
        ))}
        
        {!event.ticket_url && !event.ticketing?.url && (
          <div className="text-center py-4 text-muted-foreground">
            <p>Ingressos em breve</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}