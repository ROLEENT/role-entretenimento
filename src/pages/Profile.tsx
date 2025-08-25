import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { UserCard } from '@/components/UserCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useFollow } from '@/hooks/useFollow';
import { useUserSearch } from '@/hooks/useUserSearch';
import EventCard from '@/components/EventCard';
import { User, Edit2, Save, X, Loader2, LogOut, Heart, Calendar, MapPin, ExternalLink, UserCheck, Users, UserPlus, AtSign, Settings, Bell } from 'lucide-react';
import { NotificationSettings } from '@/components/NotificationSettings';
import { toast } from 'sonner';

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut, updateProfile } = useAuth();
  const { favorites, loading: favoritesLoading } = useFavorites();
  const { stats, loading: followLoading, toggleFollow, getFollowers, getFollowing } = useFollow(username ? user?.id : undefined);
  const { validateUsername } = useUserSearch();
  
  const [loading, setLoading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [tempDisplayName, setTempDisplayName] = useState('');
  const [tempUsername, setTempUsername] = useState('');
  const [tempBio, setTempBio] = useState('');
  const [tempLocation, setTempLocation] = useState('');
  const [tempWebsite, setTempWebsite] = useState('');
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('favorites');

  const isOwnProfile = !username || username === user?.profile?.username;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    
    if (user) {
      const name = user.profile?.display_name || user.user_metadata?.full_name || '';
      setDisplayName(name);
      setTempDisplayName(name);
      setTempUsername(user.profile?.username || '');
      setTempBio(user.profile?.bio || '');
      setTempLocation(user.profile?.location || '');
      setTempWebsite(user.profile?.website || '');
    }
  }, [user, authLoading, navigate]);

  const handleSaveDisplayName = async () => {
    if (!tempDisplayName.trim()) {
      toast.error('O nome não pode estar vazio');
      return;
    }

    setLoading(true);
    try {
      const { error } = await updateProfile({ display_name: tempDisplayName.trim() });
      
      if (error) {
        console.error('Erro detalhado ao atualizar nome:', error);
        
        if (error.message?.includes('RLS') || error.message?.includes('policy')) {
          toast.error('Erro de autenticação. Faça login novamente.');
          navigate('/auth');
          return;
        }
        
        throw error;
      }

      setDisplayName(tempDisplayName.trim());
      setIsEditingName(false);
      toast.success('Nome atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar nome:', error);
      
      if (error.message?.includes('Sessão não encontrada')) {
        toast.error('Sessão expirada. Faça login novamente.');
        navigate('/auth');
      } else {
        toast.error('Erro ao atualizar nome. Tente novamente.');
      }
      
      setTempDisplayName(displayName);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUsername = async () => {
    if (!tempUsername.trim()) {
      toast.error('Username não pode estar vazio');
      return;
    }

    const cleanUsername = tempUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    
    if (cleanUsername !== tempUsername.trim()) {
      toast.error('Username deve conter apenas letras, números e underscore');
      return;
    }

    setLoading(true);
    try {
      const isValid = await validateUsername(cleanUsername);
      if (!isValid) {
        toast.error('Username inválido ou já está em uso');
        setLoading(false);
        return;
      }

      const { error } = await updateProfile({ username: cleanUsername });
      
      if (error) {
        console.error('Erro detalhado ao atualizar username:', error);
        
        if (error.message?.includes('RLS') || error.message?.includes('policy')) {
          toast.error('Erro de autenticação. Faça login novamente.');
          navigate('/auth');
          return;
        }
        
        throw error;
      }

      setIsEditingUsername(false);
      toast.success('Username atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar username:', error);
      
      if (error.message?.includes('Sessão não encontrada')) {
        toast.error('Sessão expirada. Faça login novamente.');
        navigate('/auth');
      } else {
        toast.error('Erro ao atualizar username. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBio = async () => {
    setLoading(true);
    try {
      const { error } = await updateProfile({ bio: tempBio.trim() });
      
      if (error) {
        console.error('Erro detalhado ao atualizar bio:', error);
        
        if (error.message?.includes('RLS') || error.message?.includes('policy')) {
          toast.error('Erro de autenticação. Faça login novamente.');
          navigate('/auth');
          return;
        }
        
        throw error;
      }

      setIsEditingBio(false);
      toast.success('Bio atualizada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar bio:', error);
      
      if (error.message?.includes('Sessão não encontrada')) {
        toast.error('Sessão expirada. Faça login novamente.');
        navigate('/auth');
      } else {
        toast.error('Erro ao atualizar bio. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const { error } = await updateProfile({
        location: tempLocation.trim(),
        website: tempWebsite.trim()
      });
      
      if (error) {
        console.error('Erro detalhado ao atualizar perfil:', error);
        
        if (error.message?.includes('RLS') || error.message?.includes('policy')) {
          toast.error('Erro de autenticação. Faça login novamente.');
          navigate('/auth');
          return;
        }
        
        throw error;
      }

      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      
      if (error.message?.includes('Sessão não encontrada')) {
        toast.error('Sessão expirada. Faça login novamente.');
        navigate('/auth');
      } else {
        toast.error('Erro ao atualizar perfil. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFollowers = async () => {
    if (!user) return;
    const followersData = await getFollowers(user.id);
    setFollowers(followersData);
  };

  const loadFollowing = async () => {
    if (!user) return;
    const followingData = await getFollowing(user.id);
    setFollowing(followingData);
  };

  const handleCancelEditName = () => {
    setTempDisplayName(displayName);
    setIsEditingName(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userInitials = displayName?.slice(0, 2).toUpperCase() || user.email?.slice(0, 2).toUpperCase() || '??';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Meu Perfil – ROLÊ ENTRETENIMENTO" />
      <Header />
      
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.profile?.avatar_url} />
                  <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {isEditingName ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={tempDisplayName}
                          onChange={(e) => setTempDisplayName(e.target.value)}
                          className="text-2xl font-bold"
                          placeholder="Digite seu nome"
                        />
                        <Button size="sm" onClick={handleSaveDisplayName} disabled={loading}>
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEditName}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-3xl font-bold text-foreground">
                          {displayName || 'Usuário'}
                        </h2>
                        {user.profile?.is_verified && (
                          <UserCheck className="h-6 w-6 text-primary" />
                        )}
                        {isOwnProfile && (
                          <Button size="sm" variant="ghost" onClick={() => setIsEditingName(true)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Username */}
                  <div className="flex items-center gap-2 mb-2">
                    {isEditingUsername ? (
                      <div className="flex items-center gap-2">
                        <AtSign className="h-4 w-4 text-muted-foreground" />
                        <Input
                          value={tempUsername}
                          onChange={(e) => setTempUsername(e.target.value)}
                          placeholder="username"
                          className="text-sm"
                        />
                        <Button size="sm" onClick={handleSaveUsername} disabled={loading}>
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setIsEditingUsername(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <AtSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {user.profile?.username || 'Definir username'}
                        </span>
                        {isOwnProfile && (
                          <Button size="sm" variant="ghost" onClick={() => setIsEditingUsername(true)}>
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  <div className="mb-4">
                    {isEditingBio ? (
                      <div className="space-y-2">
                        <Textarea
                          value={tempBio}
                          onChange={(e) => setTempBio(e.target.value)}
                          placeholder="Conte um pouco sobre você..."
                          className="resize-none"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveBio} disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setIsEditingBio(false)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <p className="text-muted-foreground text-sm flex-1">
                          {user.profile?.bio || (isOwnProfile ? 'Adicione uma bio...' : '')}
                        </p>
                        {isOwnProfile && (
                          <Button size="sm" variant="ghost" onClick={() => setIsEditingBio(true)}>
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Stats and metadata */}
                  <div className="flex flex-wrap gap-4 text-sm mb-4">
                    <span>
                      <span className="font-semibold">{stats.following_count}</span>{' '}
                      <span className="text-muted-foreground">Seguindo</span>
                    </span>
                    <span>
                      <span className="font-semibold">{stats.followers_count}</span>{' '}
                      <span className="text-muted-foreground">Seguidores</span>
                    </span>
                    {user.profile?.location && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{user.profile.location}</span>
                      </div>
                    )}
                    {user.profile?.website && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <ExternalLink className="h-3 w-3" />
                        <a 
                          href={user.profile.website.startsWith('http') ? user.profile.website : `https://${user.profile.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary"
                        >
                          Website
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 items-center">
                    {user.profile?.is_admin && (
                      <Badge variant="secondary">Admin</Badge>
                    )}
                    <Badge variant="outline" className="gap-1">
                      <Heart className="h-3 w-3" />
                      {favorites.length} favoritos
                    </Badge>
                    {isOwnProfile && (
                      <Button variant="outline" size="sm" onClick={handleSignOut}>
                        <LogOut className="h-4 w-4 mr-1" />
                        Sair
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="favorites">Favoritos</TabsTrigger>
              <TabsTrigger value="followers">Seguidores</TabsTrigger>
              <TabsTrigger value="following">Seguindo</TabsTrigger>
              {isOwnProfile && <TabsTrigger value="settings">Configurações</TabsTrigger>}
              {isOwnProfile && <TabsTrigger value="calendar">Calendário</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="favorites" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Eventos Favoritos ({favorites.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {favoritesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : favorites.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {favorites.map((favorite) => (
                        <EventCard
                          key={favorite.id}
                          event={{
                            ...favorite,
                            price: favorite.price || 0,
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <h3 className="font-medium mb-1">Nenhum evento favoritado</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Explore eventos e adicione seus favoritos aqui
                      </p>
                      <Button asChild>
                        <Link to="/eventos">Explorar Eventos</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="followers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Seguidores ({stats.followers_count})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={loadFollowers} className="mb-4">
                    Carregar Seguidores
                  </Button>
                  {followers.length > 0 ? (
                    <div className="space-y-2">
                      {followers.map((follower) => (
                        <UserCard
                          key={follower.user_id}
                          user={follower}
                          variant="compact"
                          showFollowButton={false}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhum seguidor ainda
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="following" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Seguindo ({stats.following_count})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={loadFollowing} className="mb-4">
                    Carregar Seguindo
                  </Button>
                  {following.length > 0 ? (
                    <div className="space-y-2">
                      {following.map((follow) => (
                        <UserCard
                          key={follow.user_id}
                          user={follow}
                          variant="compact"
                          showFollowButton={false}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Não está seguindo ninguém ainda
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {isOwnProfile && (
              <TabsContent value="settings" className="space-y-4">
                {/* Configurações de Notificações */}
                <NotificationSettings />
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Configurações do Perfil
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={user.email || ''} disabled className="bg-muted" />
                        <p className="text-sm text-muted-foreground mt-1">
                          O email não pode ser alterado
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="location">Localização</Label>
                        <Input 
                          id="location"
                          value={tempLocation}
                          onChange={(e) => setTempLocation(e.target.value)}
                          placeholder="Sua cidade"
                        />
                      </div>

                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input 
                          id="website"
                          value={tempWebsite}
                          onChange={(e) => setTempWebsite(e.target.value)}
                          placeholder="https://seusite.com"
                        />
                      </div>

                      <Button onClick={handleSaveProfile} disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Salvar Alterações
                      </Button>
                      
                      <div>
                        <Label>Data de Cadastro</Label>
                        <p className="text-sm text-muted-foreground">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
            
            {isOwnProfile && (
              <TabsContent value="calendar" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Calendário Pessoal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <h3 className="font-medium mb-1">Em breve</h3>
                      <p className="text-sm text-muted-foreground">
                        Funcionalidade de calendário será implementada em breve
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;