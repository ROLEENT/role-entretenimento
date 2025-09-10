import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSearchAndFilter } from '@/hooks/useSearchAndFilter';
import { Link } from 'react-router-dom';
import LazyImage from '@/components/LazyImage';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Event {
  id: string;
  title: string;
  city: string;
  date_start: string;
  image_url?: string;
  slug?: string;
  venue?: { name: string };
  categories?: Array<{ category: { name: string; color: string } }>;
  price_min?: number;
}

interface Highlight {
  id: string;
  event_title: string;
  city: string;
  venue: string;
  image_url: string;
  event_date?: string;
}

interface GlobalSearchProps {
  events?: Event[];
  highlights?: Highlight[];
  isOpen: boolean;
  onClose: () => void;
}

const GlobalSearch = ({ events = [], highlights = [], isOpen, onClose }: GlobalSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter events and highlights based on search query
  const filteredEvents = events.filter(event =>
    event?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event?.venue?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  const filteredHighlights = highlights.filter(highlight =>
    highlight?.event_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    highlight?.city?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
    highlight?.venue?.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 3);

  const hasResults = filteredEvents.length > 0 || filteredHighlights.length > 0;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-overlay/80 backdrop-blur-sm" 
      onClick={onClose}
      data-overlay
      aria-hidden={!isOpen}
    >
      <div className="container mx-auto px-4 pt-20" onClick={(e) => e.stopPropagation()}>
        <Card className="max-w-2xl mx-auto p-6">
          <div className="flex items-center gap-3 mb-6">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos, agenda, locais..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-0 bg-transparent text-lg"
              autoFocus
            />
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {searchQuery && (
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {/* Events Results */}
              {filteredEvents.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Eventos</h3>
                  <div className="space-y-3">
                    {filteredEvents.map((event) => (
                      <Link
                        key={event.id}
                        to={`/evento/${event.slug || event.id}`}
                        onClick={onClose}
                        className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {event.image_url && (
                            <LazyImage
                              src={event.image_url}
                              alt={event.title}
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{event.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{event.city}</span>
                              {event.venue && <span>• {event.venue.name}</span>}
                              <span>• {format(new Date(event.date_start), 'dd/MM', { locale: ptBR })}</span>
                            </div>
                            {event.categories && event.categories.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {event.categories.slice(0, 2).map((cat, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {cat.category.name}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          {event.price_min !== undefined && (
                            <div className="text-sm font-medium">
                              {event.price_min === 0 ? 'Gratuito' : `R$ ${event.price_min}`}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Highlights Results */}
              {filteredHighlights.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Agenda</h3>
                  <div className="space-y-3">
                    {filteredHighlights.map((highlight) => (
                      <Link
                        key={highlight.id}
                        to={`/destaque/${highlight.id}`}
                        onClick={onClose}
                        className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <LazyImage
                            src={highlight.image_url}
                            alt={highlight.event_title}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{highlight.event_title}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{highlight.city}</span>
                              <span>• {highlight.venue}</span>
                              {highlight.event_date && (
                                <span>• {format(new Date(highlight.event_date), 'dd/MM', { locale: ptBR })}</span>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">Destaque</Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {!hasResults && searchQuery.length > 2 && (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-medium mb-1">Nenhum resultado encontrado</h3>
                  <p className="text-sm text-muted-foreground">
                    Tente buscar por eventos, locais ou cidades
                  </p>
                </div>
              )}

              {/* Quick Actions */}
              {searchQuery.length === 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Ações Rápidas</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/agenda"
                      onClick={onClose}
                      className="p-3 rounded-lg hover:bg-muted/50 transition-colors text-center"
                    >
                      <div className="text-sm font-medium">Todos os Eventos</div>
                    </Link>
                    <Link
                      to="/agenda"
                      onClick={onClose}
                      className="p-3 rounded-lg hover:bg-muted/50 transition-colors text-center"
                    >
                      <div className="text-sm font-medium">Agenda</div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default GlobalSearch;