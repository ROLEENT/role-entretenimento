import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Music, MapPin, Calendar, UserMinus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserAuth } from '@/hooks/useUserAuth';
import { toast } from '@/hooks/use-toast';

interface FollowedEntity {
  id: string;
  entity_type: string;
  entity_uuid?: string;
  entity_slug?: string;
  created_at: string;
  artist?: {
    id: string;
    stage_name: string;
    profile_image_url?: string;
    city?: string;
  };
  venue?: {
    id: string;
    name: string;
    city?: string;
  };
  organizer?: {
    id: string;
    name: string;
    city?: string;
  };
}

export function UserFollowing() {
  const { user } = useUserAuth();
  const [following, setFollowing] = useState<FollowedEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');

  useEffect(() => {
    if (!user) return;
    fetchFollowing();
  }, [user]);

  const fetchFollowing = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          *,
          artist:artists(id, stage_name, profile_image_url, city),
          venue:venues(id, name, city),
          organizer:organizers(id, name, city)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFollowing(data || []);
    } catch (error) {
      console.error('Error fetching following:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar perfis seguidos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const unfollow = async (follow: FollowedEntity) => {
    try {
      const { error } = await supabase.rpc('toggle_follow', {
        p_entity_type: follow.entity_type,
        p_entity_uuid: follow.entity_uuid,
        p_entity_slug: follow.entity_slug
      });

      if (error) throw error;

      setFollowing(following.filter(f => f.id !== follow.id));
      toast({
        title: "Deixou de seguir",
        description: "Você não segue mais este perfil"
      });
    } catch (error) {
      console.error('Error unfollowing:', error);
      toast({
        title: "Erro",
        description: "Falha ao deixar de seguir",
        variant: "destructive"
      });
    }
  };

  const filteredFollowing = following.filter(follow => {
    if (selectedTab === 'all') return true;
    return follow.entity_type === selectedTab;
  });

  const getCounts = () => {
    return {
      all: following.length,
      artist: following.filter(f => f.entity_type === 'artist').length,
      venue: following.filter(f => f.entity_type === 'venue').length,
      organizer: following.filter(f => f.entity_type === 'organizer').length,
    };
  };

  const counts = getCounts();

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse flex items-center space-x-4">
                <div className="h-12 w-12 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (following.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Ainda não segue ninguém</h3>
          <p className="text-muted-foreground">
            Comece a seguir artistas, locais e organizadores para receber notificações sobre novos eventos
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            Todos ({counts.all})
          </TabsTrigger>
          <TabsTrigger value="artist">
            <Music className="h-4 w-4 mr-1" />
            Artistas ({counts.artist})
          </TabsTrigger>
          <TabsTrigger value="venue">
            <MapPin className="h-4 w-4 mr-1" />
            Locais ({counts.venue})
          </TabsTrigger>
          <TabsTrigger value="organizer">
            <Calendar className="h-4 w-4 mr-1" />
            Organizadores ({counts.organizer})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          <div className="space-y-4">
            {filteredFollowing.map((follow) => (
              <Card key={follow.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
                        {follow.entity_type === 'artist' && <Music className="h-6 w-6" />}
                        {follow.entity_type === 'venue' && <MapPin className="h-6 w-6" />}
                        {follow.entity_type === 'organizer' && <Calendar className="h-6 w-6" />}
                      </div>
                      
                      <div>
                        <h3 className="font-semibold">
                          {follow.artist?.stage_name || 
                           follow.venue?.name || 
                           follow.organizer?.name}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {follow.entity_type === 'artist' && 'Artista'}
                            {follow.entity_type === 'venue' && 'Local'}
                            {follow.entity_type === 'organizer' && 'Organizador'}
                          </Badge>
                          
                          {(follow.artist?.city || follow.venue?.city || follow.organizer?.city) && (
                            <span>
                              • {follow.artist?.city || follow.venue?.city || follow.organizer?.city}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-1">
                          Seguindo desde {new Date(follow.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => unfollow(follow)}
                      className="flex items-center gap-2"
                    >
                      <UserMinus className="h-4 w-4" />
                      Deixar de seguir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}