import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, MapPin, Calendar, Bookmark, Users, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserAuth } from '@/hooks/useUserAuth';
import { useSocialActions } from '@/hooks/useSocialActions';

interface PublicProfile {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  city_preferences: string[];
  genre_preferences: string[];
  is_profile_public: boolean;
  created_at: string;
}

interface UserSaves {
  id: string;
  event_id: string;
  collection: string;
  created_at: string;
  // event info would be joined
  event?: {
    title: string;
    image_url?: string;
    date_start: string;
    city?: string;
  };
}

interface UserAttendance {
  id: string;
  event_id: string;
  status: 'going' | 'maybe' | 'went';
  show_publicly: boolean;
  updated_at: string;
  // event info would be joined
  event?: {
    title: string;
    image_url?: string;
    date_start: string;
    city?: string;
  };
}

interface UserFollows {
  id: string;
  entity_type: string;
  entity_uuid?: string;
  entity_slug?: string;
  created_at: string;
  // entity info would be joined based on type
  entity?: {
    name: string;
    image_url?: string;
  };
}

export const PublicProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useUserAuth();
  const { toggleFollow, getFollowState } = useSocialActions();
  
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [saves, setSaves] = useState<UserSaves[]>([]);
  const [attendance, setAttendance] = useState<UserAttendance[]>([]);
  const [follows, setFollows] = useState<UserFollows[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = currentUser && profile && currentUser.id === profile.id;
  const canFollow = currentUser && !isOwnProfile;

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('users_public')
          .select('*')
          .eq('username', username)
          .eq('is_profile_public', true)
          .single();

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            setError('Perfil não encontrado');
          } else {
            throw profileError;
          }
          return;
        }

        setProfile(profileData);

        // Fetch saves (only if public or own profile)
        if (isOwnProfile || profileData.is_profile_public) {
          const { data: savesData } = await supabase
            .from('saves')
            .select(`
              *,
              event:agenda_itens(title, image_url, date_start, city)
            `)
            .eq('user_id', profileData.id)
            .order('created_at', { ascending: false })
            .limit(20);
          
          setSaves(savesData || []);
        }

        // Fetch attendance (only public ones or own profile)
        const attendanceQuery = supabase
          .from('attendance')
          .select(`
            *,
            event:agenda_itens(title, image_url, date_start, city)
          `)
          .eq('user_id', profileData.id)
          .order('updated_at', { ascending: false })
          .limit(20);

        if (!isOwnProfile) {
          attendanceQuery.eq('show_publicly', true);
        }

        const { data: attendanceData } = await attendanceQuery;
        setAttendance(attendanceData || []);

        // Fetch follows (only if public or own profile)
        if (isOwnProfile || profileData.is_profile_public) {
          const { data: followsData } = await supabase
            .from('follows')
            .select('*')
            .eq('user_id', profileData.id)
            .order('created_at', { ascending: false })
            .limit(20);
          
          setFollows(followsData || []);
        }

      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, currentUser]);

  const handleFollow = async () => {
    if (!profile) return;
    
    try {
      await toggleFollow('user', profile.id);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">
              {error || 'Perfil não encontrado'}
            </h2>
            <p className="text-muted-foreground">
              Este perfil não existe ou não é público.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const followState = getFollowState('user', profile.id);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24 mx-auto md:mx-0">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-2xl">
                {profile.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">
                  {profile.display_name || profile.username}
                </h1>
                {profile.display_name && (
                  <span className="text-muted-foreground">@{profile.username}</span>
                )}
              </div>
              
              {profile.bio && (
                <p className="text-muted-foreground mb-4">{profile.bio}</p>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {profile.city_preferences.map((city) => (
                  <Badge key={city} variant="secondary">
                    <MapPin className="h-3 w-3 mr-1" />
                    {city}
                  </Badge>
                ))}
                {profile.genre_preferences.map((genre) => (
                  <Badge key={genre} variant="outline">
                    {genre}
                  </Badge>
                ))}
              </div>

              {canFollow && (
                <Button
                  onClick={handleFollow}
                  disabled={followState.loading}
                  variant={followState.following ? "outline" : "default"}
                >
                  <Heart className={`h-4 w-4 mr-2 ${followState.following ? 'fill-current' : ''}`} />
                  {followState.following ? 'Seguindo' : 'Seguir'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="saves">Salvos</TabsTrigger>
          <TabsTrigger value="attendance">Presenças</TabsTrigger>
          <TabsTrigger value="following">Seguindo</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sobre</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Membro desde</h4>
                  <p className="text-muted-foreground">
                    {new Date(profile.created_at).toLocaleDateString('pt-BR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                {profile.city_preferences.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Cidades de interesse</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.city_preferences.map((city) => (
                        <Badge key={city} variant="secondary">{city}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.genre_preferences.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Gêneros musicais</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.genre_preferences.map((genre) => (
                        <Badge key={genre} variant="outline">{genre}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saves" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bookmark className="h-5 w-5" />
                Eventos Salvos ({saves.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {saves.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum evento salvo ainda.
                </p>
              ) : (
                <div className="space-y-4">
                  {saves.map((save) => (
                    <div key={save.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      {save.event?.image_url && (
                        <img
                          src={save.event.image_url}
                          alt={save.event.title}
                          className="h-16 w-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium">{save.event?.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {save.event?.date_start && new Date(save.event.date_start).toLocaleDateString('pt-BR')}
                          {save.event?.city && (
                            <>
                              <span>•</span>
                              <MapPin className="h-4 w-4" />
                              {save.event.city}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Presenças ({attendance.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {attendance.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma presença registrada ainda.
                </p>
              ) : (
                <div className="space-y-4">
                  {attendance.map((att) => (
                    <div key={att.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      {att.event?.image_url && (
                        <img
                          src={att.event.image_url}
                          alt={att.event.title}
                          className="h-16 w-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{att.event?.title}</h4>
                          <Badge 
                            variant={
                              att.status === 'going' ? 'default' : 
                              att.status === 'maybe' ? 'secondary' : 'outline'
                            }
                          >
                            {att.status === 'going' ? 'Vai' : 
                             att.status === 'maybe' ? 'Talvez' : 'Foi'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {att.event?.date_start && new Date(att.event.date_start).toLocaleDateString('pt-BR')}
                          {att.event?.city && (
                            <>
                              <span>•</span>
                              <MapPin className="h-4 w-4" />
                              {att.event.city}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="following" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Seguindo ({follows.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {follows.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Não está seguindo ninguém ainda.
                </p>
              ) : (
                <div className="space-y-4">
                  {follows.map((follow) => (
                    <div key={follow.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {follow.entity_type}
                          </Badge>
                          <span className="font-medium">
                            {follow.entity_slug || follow.entity_uuid}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};