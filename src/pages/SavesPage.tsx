import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bookmark, Calendar, MapPin, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserAuth } from '@/hooks/useUserAuth';
import { useSocialActions } from '@/hooks/useSocialActions';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface SavedEvent {
  id: string;
  event_id: string;
  collection: string;
  created_at: string;
  event?: {
    title: string;
    slug: string;
    image_url?: string;
    date_start: string;
    city?: string;
    subtitle?: string;
  };
}

export const SavesPage: React.FC = () => {
  const { user } = useUserAuth();
  const { toggleSave } = useSocialActions();
  const [saves, setSaves] = useState<SavedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState('default');

  useEffect(() => {
    if (!user) return;

    const fetchSaves = async () => {
      try {
        const { data, error } = await supabase
          .from('saves')
          .select(`
            *,
            event:agenda_itens(
              title,
              slug,
              image_url,
              date_start,
              city,
              subtitle
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setSaves(data || []);
      } catch (error) {
        console.error('Error fetching saves:', error);
        toast({
          title: "Erro",
          description: "Falha ao carregar eventos salvos",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSaves();
  }, [user]);

  const handleRemoveSave = async (eventId: string, collection: string) => {
    try {
      await toggleSave(eventId, collection);
      setSaves(saves.filter(save => !(save.event_id === eventId && save.collection === collection)));
    } catch (error) {
      console.error('Error removing save:', error);
    }
  };

  const collections = Array.from(new Set(saves.map(save => save.collection)));
  const filteredSaves = saves.filter(save => save.collection === selectedCollection);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Faça login para ver seus salvos</h2>
            <p className="text-muted-foreground">
              Entre na sua conta para acessar seus eventos salvos.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Meus Eventos Salvos</h1>
        <p className="text-muted-foreground">
          Eventos que você salvou para acompanhar
        </p>
      </div>

      {saves.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Nenhum evento salvo</h2>
            <p className="text-muted-foreground mb-4">
              Explore eventos e salve os que mais interessarem você.
            </p>
            <Button asChild>
              <Link to="/agenda">Explorar Eventos</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={selectedCollection} onValueChange={setSelectedCollection}>
          <TabsList className="mb-6">
            {collections.map(collection => (
              <TabsTrigger key={collection} value={collection}>
                {collection === 'default' ? 'Principais' : collection}
                <Badge variant="secondary" className="ml-2">
                  {saves.filter(save => save.collection === collection).length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {collections.map(collection => (
            <TabsContent key={collection} value={collection}>
              <div className="space-y-4">
                {filteredSaves.map((save) => (
                  <Card key={save.id}>
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        {save.event?.image_url && (
                          <img
                            src={save.event.image_url}
                            alt={save.event.title}
                            className="h-24 w-24 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold mb-1">
                                <Link 
                                  to={`/agenda/${save.event?.slug}`}
                                  className="hover:text-primary transition-colors"
                                >
                                  {save.event?.title}
                                </Link>
                              </h3>
                              {save.event?.subtitle && (
                                <p className="text-muted-foreground text-sm mb-2">
                                  {save.event.subtitle}
                                </p>
                              )}
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveSave(save.event_id, save.collection)}
                              className="flex-shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {save.event?.date_start && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(save.event.date_start).toLocaleDateString('pt-BR', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </div>
                            )}
                            
                            {save.event?.city && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {save.event.city}
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              Salvo em {new Date(save.created_at).toLocaleDateString('pt-BR')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};