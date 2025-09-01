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
import { User, Edit2, Save, X, Loader2, LogOut, Heart, Calendar, MapPin, ExternalLink, UserCheck, Users, UserPlus, AtSign, Settings, Bell, Trophy, Ticket, CheckCircle, Star } from 'lucide-react';
import { NotificationSettings } from '@/components/NotificationSettings';
import { AvatarUpload } from '@/components/AvatarUpload';
import PointsDisplay from '@/components/PointsDisplay';
import BadgeDisplay from '@/components/BadgeDisplay';
import { useGamification } from '@/hooks/useGamification';
import { useUserEngagement } from '@/hooks/useUserEngagement';
import { UserProfileDashboard } from '@/components/UserProfileDashboard';
import { toast } from 'sonner';

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut, updateProfile } = useAuth();
  const { favorites, loading: favoritesLoading } = useFavorites();
  const { stats, loading: followLoading, toggleFollow, getFollowers, getFollowing } = useFollow(username ? user?.id : undefined);
  const { validateUsername } = useUserSearch();
  const { userBadges, userPoints, getLevelDetails } = useGamification();
  const { interests, tickets, attendance, likes, loading: engagementLoading } = useUserEngagement();
  
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

  const isOwnProfile = !username || username === user?.user_metadata?.username;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    
    if (user) {
      const name = user.user_metadata?.display_name || user.user_metadata?.full_name || '';
      setDisplayName(name);
      setTempDisplayName(name);
      setTempUsername(user.user_metadata?.username || '');
      setTempBio(user.user_metadata?.bio || '');
      setTempLocation(user.user_metadata?.location || '');
      setTempWebsite(user.user_metadata?.website || '');
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

  const handleAvatarChange = async (avatarUrl: string) => {
    setLoading(true);
    try {
      const { error } = await updateProfile({ avatar_url: avatarUrl });
      
      if (error) {
        console.error('Erro ao atualizar avatar:', error);
        
        if (error.message?.includes('RLS') || error.message?.includes('policy')) {
          toast.error('Erro de autenticação. Faça login novamente.');
          navigate('/auth');
          return;
        }
        
        throw error;
      }

      toast.success('Avatar atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar avatar:', error);
      
      if (error.message?.includes('Sessão não encontrada')) {
        toast.error('Sessão expirada. Faça login novamente.');
        navigate('/auth');
      } else {
        toast.error('Erro ao atualizar avatar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
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
                {isOwnProfile ? (
                  <AvatarUpload
                    currentAvatar={user.user_metadata?.avatar_url}
                    onAvatarChange={handleAvatarChange}
                    size="lg"
                    userName={displayName || user.email || 'Usuário'}
                  />
                ) : (
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
                  </Avatar>
                )}
                
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    {isEditingName ? (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
                        <Input
                          value={tempDisplayName}
                          onChange={(e) => setTempDisplayName(e.target.value)}
                          className="text-xl sm:text-2xl font-bold"
                          placeholder="Digite seu nome"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveDisplayName} disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEditName}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                            {displayName || 'Usuário'}
                          </h2>
                          {user.user_metadata?.is_verified && (
                            <UserCheck className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        {isOwnProfile && (
                          <Button size="sm" variant="ghost" onClick={() => setIsEditingName(true)} className="self-start sm:self-center">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Username */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    {isEditingUsername ? (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
                        <div className="flex items-center gap-2">
                          <AtSign className="h-4 w-4 text-muted-foreground" />
                          <Input
                            value={tempUsername}
                            onChange={(e) => setTempUsername(e.target.value)}
                            placeholder="username"
                            className="text-sm"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveUsername} disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setIsEditingUsername(false)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
                        <div className="flex items-center gap-1">
                          <AtSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {user.user_metadata?.username || 'Definir username'}
                          </span>
                        </div>
                        {isOwnProfile && (
                          <Button size="sm" variant="ghost" onClick={() => setIsEditingUsername(true)} className="self-start sm:self-center">
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
                          {user.user_metadata?.bio || (isOwnProfile ? 'Adicione uma bio...' : '')}
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
                    {user.user_metadata?.location && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{user.user_metadata.location}</span>
                      </div>
                    )}
                    {user.user_metadata?.website && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <ExternalLink className="h-3 w-3" />
                        <a 
                          href={user.user_metadata.website.startsWith('http') ? user.user_metadata.website : `https://${user.user_metadata.website}`}
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
                      {(user.user_metadata?.role === 'admin' || user.user_metadata?.role === 'editor') && (
                        <Badge variant="secondary">Admin</Badge>
                      )}
                     
                     {/* Pontos de gamificação */}
                     {userPoints && (
                       <PointsDisplay compact className="mr-2" />
                     )}
                     
                      <Badge variant="outline" className="gap-1">
                        <Heart className="h-3 w-3" />
                        {favorites.length} favoritos
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Star className="h-3 w-3" />
                        {interests.length} interesses
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Ticket className="h-3 w-3" />
                        {tickets.length} ingressos
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {attendance.length} comparecimentos
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
            <TabsList className="grid w-full grid-cols-6 lg:grid-cols-8">
              <TabsTrigger value="favorites">Favoritos</TabsTrigger>
              <TabsTrigger value="interests">Interesses</TabsTrigger>
              <TabsTrigger value="tickets">Ingressos</TabsTrigger>
              <TabsTrigger value="attendance">Presença</TabsTrigger>
              <TabsTrigger value="likes">Curtidas</TabsTrigger>
              <TabsTrigger value="badges">Conquistas</TabsTrigger>
              {isOwnProfile && <TabsTrigger value="settings">Config.</TabsTrigger>}
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

            {/* Interests Tab */}
            <TabsContent value="interests" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Eventos de Interesse ({interests.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {engagementLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : interests.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {interests.map((interest) => (
                        <EventCard
                          key={interest.id}
                          event={{
                            ...interest.events,
                            price: interest.events?.price || 0,
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Star className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <h3 className="font-medium mb-1">Nenhum interesse registrado</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Demonstre interesse em eventos para vê-los aqui
                      </p>
                      <Button asChild>
                        <Link to="/eventos">Explorar Eventos</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tickets Tab */}
            <TabsContent value="tickets" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="h-5 w-5" />
                    Ingressos Comprados ({tickets.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {engagementLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : tickets.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {tickets.map((ticket) => (
                        <EventCard
                          key={ticket.id}
                          event={{
                            ...ticket.events,
                            price: ticket.events?.price || 0,
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <h3 className="font-medium mb-1">Nenhum ingresso registrado</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Marque quando comprar ingressos para vê-los aqui
                      </p>
                      <Button asChild>
                        <Link to="/eventos">Explorar Eventos</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Attendance Tab */}
            <TabsContent value="attendance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Eventos que Comparecerá ({attendance.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {engagementLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : attendance.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {attendance.map((attend) => (
                        <EventCard
                          key={attend.id}
                          event={{
                            ...attend.events,
                            price: attend.events?.price || 0,
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <h3 className="font-medium mb-1">Nenhuma presença confirmada</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Confirme presença em eventos para vê-los aqui
                      </p>
                      <Button asChild>
                        <Link to="/eventos">Explorar Eventos</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Likes Tab */}
            <TabsContent value="likes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Destaques Curtidos ({likes.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {engagementLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : likes.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {likes.map((like) => (
                        <Card key={like.id} className="group hover:shadow-md transition-shadow">
                          <div className="aspect-video relative overflow-hidden rounded-t-lg">
                            <img 
                              src={like.highlights?.image_url} 
                              alt={like.highlights?.event_title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-medium text-sm mb-1">{like.highlights?.event_title}</h3>
                            <p className="text-xs text-muted-foreground mb-2">{like.highlights?.venue}</p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{like.highlights?.city}</span>
                              <span>{new Date(like.highlights?.event_date).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <Button asChild size="sm" className="w-full mt-3">
                              <Link to={`/destaques/${like.highlights?.id}`}>Ver Destaque</Link>
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <h3 className="font-medium mb-1">Nenhum destaque curtido</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Curta destaques para vê-los aqui
                      </p>
                      <Button asChild>
                        <Link to="/destaques">Ver Destaques</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="badges" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pontos do usuário */}
                <PointsDisplay showDetails={true} />
                
                {/* Badges conquistados */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Badges Conquistados</span>
                      <Badge variant="secondary">
                        {userBadges.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userBadges.length > 0 ? (
                      <div className="grid grid-cols-4 gap-3">
                        {userBadges.map((userBadge) => (
                          <BadgeDisplay
                            key={userBadge.id}
                            badge={userBadge.badge}
                            earned={true}
                            earnedAt={userBadge.earned_at}
                            size="md"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Nenhum badge conquistado ainda</p>
                        <p className="text-sm mt-1">Participe de eventos para ganhar badges!</p>
                        <Button asChild className="mt-4">
                          <Link to="/conquistas">Ver Sistema de Conquistas</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
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