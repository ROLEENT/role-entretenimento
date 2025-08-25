import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin, Search, Filter, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SEOHead from '@/components/SEOHead';

const EventsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    loadCategories();
    loadEvents();
    
    const cats = searchParams.get('cats');
    if (cats) {
      setSelectedCategories(cats.split(','));
    }
  }, [searchParams]);

  const loadCategories = async () => {
    try {
      const { data } = await supabase.from('music_categories').select('*').order('name');
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('events')
        .select('*, venues(name, city)')
        .eq('status', 'active')
        .order('date_start');
      setEvents(data || []);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (categorySlug: string) => {
    let newCategories;
    if (selectedCategories.includes(categorySlug)) {
      newCategories = selectedCategories.filter(cat => cat !== categorySlug);
    } else {
      newCategories = [...selectedCategories, categorySlug];
    }
    
    setSelectedCategories(newCategories);
    
    const params = new URLSearchParams(searchParams);
    if (newCategories.length > 0) {
      params.set('cats', newCategories.join(','));
    } else {
      params.delete('cats');
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchTerm('');
    setSearchParams({});
  };

  const filteredEvents = events.filter(event => {
    if (searchTerm && !event.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <>
      <SEOHead 
        title="Eventos - ROLÊ"
        description="Descubra os melhores eventos de música na sua cidade"
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Eventos</h1>
            <p className="text-muted-foreground text-lg">Descubra os melhores eventos da sua cidade</p>
          </div>

          <div className="bg-card rounded-lg p-6 mb-8 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Filtros</h2>
              {(selectedCategories.length > 0 || searchTerm) && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />Limpar
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Nome do evento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Categorias</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <Badge
                      key={category.id}
                      variant={selectedCategories.includes(category.slug) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleCategoryToggle(category.slug)}
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-muted-foreground">
              {loading ? 'Carregando...' : `${filteredEvents.length} evento(s) encontrado(s)`}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-0">
                    <div className="h-48 bg-muted rounded-t-lg"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum evento encontrado</h3>
              <Button onClick={clearFilters} variant="outline">Limpar filtros</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(event => (
                <Card key={event.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={event.image_url || '/placeholder.svg'}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(event.date_start).toLocaleDateString('pt-BR')}</span>
                        </div>
                        
                        {event.venues && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.venues.name}, {event.venues.city}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {event.price_min && (
                          <span className="font-bold text-primary">R$ {event.price_min}</span>
                        )}
                        <Button size="sm" className="ml-auto">Ver detalhes</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EventsPage;