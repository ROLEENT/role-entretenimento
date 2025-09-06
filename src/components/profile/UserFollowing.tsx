import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, MapPin, Music, Building, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface FollowedEntity {
  id: string;
  entity_type: 'artist' | 'venue' | 'organizer' | 'city' | 'tag';
  entity_uuid?: string;
  entity_slug?: string;
  created_at: string;
  // Joined data
  entity_name?: string;
  entity_details?: any;
}

interface UserFollowingProps {
  userId: string;
}

export function UserFollowing({ userId }: UserFollowingProps) {
  const [following, setFollowing] = useState<FollowedEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'artist' | 'venue' | 'organizer' | 'city' | 'tag'>('all');

  useEffect(() => {
    if (!userId) return;

    const fetchFollowing = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('follows')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Enrich with entity details
        const enrichedFollowing = await Promise.all(
          (data || []).map(async (follow) => {
            let entityDetails = null;
            let entityName = follow.entity_slug || 'Unknown';

            try {
              switch (follow.entity_type) {
                case 'artist':
                  if (follow.entity_uuid) {
                    const { data: artist } = await supabase
                      .from('artists')
                      .select('stage_name, city')
                      .eq('id', follow.entity_uuid)
                      .single();
                    entityDetails = artist;
                    entityName = artist?.stage_name || entityName;
                  }
                  break;
                
                case 'venue':
                  if (follow.entity_uuid) {
                    const { data: venue } = await supabase
                      .from('venues')
                      .select('name, city')
                      .eq('id', follow.entity_uuid)
                      .single();
                    entityDetails = venue;
                    entityName = venue?.name || entityName;
                  }
                  break;
                
                case 'organizer':
                  if (follow.entity_uuid) {
                    const { data: organizer } = await supabase
                      .from('organizers')
                      .select('name')
                      .eq('id', follow.entity_uuid)
                      .single();
                    entityDetails = organizer;
                    entityName = organizer?.name || entityName;
                  }
                  break;
                
                case 'city':
                case 'tag':
                  entityName = follow.entity_slug || entityName;
                  break;
              }
            } catch (error) {
              console.error(`Error fetching ${follow.entity_type} details:`, error);
            }

            return {
              ...follow,
              entity_name: entityName,
              entity_details: entityDetails,
            };
          })
        );

        setFollowing(enrichedFollowing);
      } catch (error) {
        console.error('Error fetching following:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowing();
  }, [userId]);

  const filteredFollowing = filter === 'all' 
    ? following 
    : following.filter(f => f.entity_type === filter);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  const getEntityIcon = (type: string) => {
    const icons = {
      artist: Music,
      venue: Building,
      organizer: Users,
      city: MapPin,
      tag: Tag,
    };
    return icons[type as keyof typeof icons] || Users;
  };

  const getEntityTypeLabel = (type: string) => {
    const labels = {
      artist: 'Artista',
      venue: 'Local',
      organizer: 'Organizador',
      city: 'Cidade',
      tag: 'Tag',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getFilterCounts = () => {
    return {
      all: following.length,
      artist: following.filter(f => f.entity_type === 'artist').length,
      venue: following.filter(f => f.entity_type === 'venue').length,
      organizer: following.filter(f => f.entity_type === 'organizer').length,
      city: following.filter(f => f.entity_type === 'city').length,
      tag: following.filter(f => f.entity_type === 'tag').length,
    };
  };

  const counts = getFilterCounts();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Seguindo</h3>
        <Badge variant="secondary">{following.length}</Badge>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Todos ({counts.all})
        </Button>
        {counts.artist > 0 && (
          <Button
            variant={filter === 'artist' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('artist')}
          >
            Artistas ({counts.artist})
          </Button>
        )}
        {counts.venue > 0 && (
          <Button
            variant={filter === 'venue' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('venue')}
          >
            Locais ({counts.venue})
          </Button>
        )}
        {counts.organizer > 0 && (
          <Button
            variant={filter === 'organizer' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('organizer')}
          >
            Organizadores ({counts.organizer})
          </Button>
        )}
        {counts.city > 0 && (
          <Button
            variant={filter === 'city' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('city')}
          >
            Cidades ({counts.city})
          </Button>
        )}
        {counts.tag > 0 && (
          <Button
            variant={filter === 'tag' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('tag')}
          >
            Tags ({counts.tag})
          </Button>
        )}
      </div>

      {filteredFollowing.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {filter === 'all' ? 'Seguindo' : `${getEntityTypeLabel(filter)}s`}
            </CardTitle>
            <CardDescription>
              Nenhum {filter === 'all' ? 'item' : getEntityTypeLabel(filter).toLowerCase()} seguido encontrado.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredFollowing.map((follow) => {
            const Icon = getEntityIcon(follow.entity_type);
            
            return (
              <Card key={follow.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-muted rounded-full">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{follow.entity_name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {getEntityTypeLabel(follow.entity_type)}
                        </Badge>
                      </div>
                      
                      {follow.entity_details?.city && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {follow.entity_details.city}
                        </p>
                      )}
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        Seguindo desde {new Date(follow.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}