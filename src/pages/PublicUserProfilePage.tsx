import { Helmet } from 'react-helmet-async';
import { useParams, Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, MapPin, Music, Heart, Calendar, Users } from 'lucide-react';
import { useUserProfile, useUserStats } from '@/hooks/useUserProfile';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { UserSavedEvents } from '@/components/profile/UserSavedEvents';
import { UserAttendances } from '@/components/profile/UserAttendances';
import { UserFollowing } from '@/components/profile/UserFollowing';

export default function PublicUserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { data: profile, isLoading, error } = useUserProfile(username);
  const { data: stats } = useUserStats(profile?.id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !profile) {
    return <Navigate to="/404" replace />;
  }

  if (!profile.is_profile_public) {
    return (
      <div className="container mx-auto py-8">
        <Helmet>
          <title>Perfil Privado - Rolezeiro</title>
        </Helmet>
        
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center text-center py-8">
            <Lock className="h-12 w-12 text-muted-foreground mb-4" />
            <h1 className="text-xl font-semibold mb-2">Perfil Privado</h1>
            <p className="text-muted-foreground">
              Este usuário optou por manter seu perfil privado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Helmet>
        <title>{profile.display_name || profile.username} - Rolezeiro</title>
        <meta name="description" content={profile.bio || `Perfil de ${profile.display_name || profile.username} no Rolezeiro`} />
      </Helmet>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar_url || ''} alt={profile.display_name || profile.username} />
              <AvatarFallback className="text-xl">
                {getInitials(profile.display_name || profile.username)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl font-bold">{profile.display_name || profile.username}</h1>
                <p className="text-muted-foreground">@{profile.username}</p>
              </div>
              
              {profile.bio && (
                <p className="text-foreground">{profile.bio}</p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {stats && (
                  <>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {stats.saved_events_count} salvos
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {stats.attendances_count} presenças
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {stats.following_count} seguindo
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {profile.city_preferences?.map((city) => (
                  <Badge key={city} variant="secondary" className="gap-1">
                    <MapPin className="h-3 w-3" />
                    {city}
                  </Badge>
                ))}
                {profile.genre_preferences?.map((genre) => (
                  <Badge key={genre} variant="outline" className="gap-1">
                    <Music className="h-3 w-3" />
                    {genre}
                  </Badge>
                ))}
              </div>
              
              {profile.accessibility_notes && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Notas de Acessibilidade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{profile.accessibility_notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="salvos">Salvos</TabsTrigger>
          <TabsTrigger value="presencas">Presenças</TabsTrigger>
          <TabsTrigger value="seguindo">Seguindo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="perfil" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sobre</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Cidades de Interesse</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.city_preferences?.length ? (
                      profile.city_preferences.map((city) => (
                        <Badge key={city} variant="secondary">{city}</Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">Nenhuma cidade especificada</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Gêneros Favoritos</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.genre_preferences?.length ? (
                      profile.genre_preferences.map((genre) => (
                        <Badge key={genre} variant="outline">{genre}</Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">Nenhum gênero especificado</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="salvos">
          <UserSavedEvents userId={profile.id} isPublic />
        </TabsContent>
        
        <TabsContent value="presencas">
          <UserAttendances userId={profile.id} isPublic />
        </TabsContent>
        
        <TabsContent value="seguindo">
          <UserFollowing userId={profile.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}