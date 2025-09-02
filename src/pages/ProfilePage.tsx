import React, { useState, useEffect } from 'react';
import { useUserAuth } from '@/hooks/useUserAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Mail, MapPin, Edit2, Save, X, Camera, Calendar, Star } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import UserPersonalCalendar from '@/components/UserPersonalCalendar';
import FavoritesPanel from '@/components/FavoritesPanel';

interface ProfileData {
  display_name: string;
  username: string;
  bio: string;
  location: string;
  avatar_url: string;
  followers_count: number;
  following_count: number;
  is_verified: boolean;
}

const ProfilePage = () => {
  const { user, updateProfile } = useUserAuth();
  const [activeTab, setActiveTab] = useState('perfil');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    display_name: '',
    username: '',
    bio: '',
    location: '',
    avatar_url: '',
    followers_count: 0,
    following_count: 0,
    is_verified: false
  });
  const [editData, setEditData] = useState<Partial<ProfileData>>({});

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfileData({
          display_name: data.display_name || '',
          username: data.username || '',
          bio: data.bio || '',
          location: data.location || '',
          avatar_url: data.avatar_url || '',
          followers_count: data.followers_count || 0,
          following_count: data.following_count || 0,
          is_verified: data.is_verified || false
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleEdit = () => {
    setEditData({
      display_name: profileData.display_name,
      username: profileData.username,
      bio: profileData.bio,
      location: profileData.location
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditData({});
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await updateProfile(editData);
      
      if (error) {
        toast({
          title: "Erro ao atualizar perfil",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram salvas com sucesso."
        });
        setProfileData({ ...profileData, ...editData });
        setIsEditing(false);
        setEditData({});
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = () => {
    if (profileData.display_name) {
      return profileData.display_name.substring(0, 2).toUpperCase();
    }
    return user?.email?.substring(0, 2).toUpperCase() || 'U';
  };

  if (!user) {
    return null;
  }

  const ProfileTab = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Meu Perfil</CardTitle>
            <CardDescription>
              Aqui você mostra quem é no ROLÊ. Atualize seu nome, cidade e uma bio rápida que conte sua vibe.
            </CardDescription>
          </div>
          {!isEditing ? (
            <Button onClick={handleEdit} variant="outline">
              <Edit2 className="w-4 h-4 mr-2" />
              Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button onClick={handleCancel} variant="outline" disabled={isLoading}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profileData.avatar_url} alt="Avatar" />
              <AvatarFallback className="text-lg">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                disabled
              >
                <Camera className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div>
            {profileData.avatar_url ? (
              <>
                <h3 className="text-lg font-semibold">
                  {profileData.display_name || 'Nome não definido'}
                </h3>
                <p className="text-muted-foreground">
                  {profileData.location || 'Cidade não informada'}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">
                Adicione uma foto para o pessoal te reconhecer no ROLÊ ✨
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Profile Information */}
        <div className="grid gap-6">
          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="display_name">Nome</Label>
            {isEditing ? (
              <Input
                id="display_name"
                placeholder="Como você quer ser chamado"
                value={editData.display_name || ''}
                onChange={(e) => setEditData({ ...editData, display_name: e.target.value })}
              />
            ) : (
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{profileData.display_name || 'Não informado'}</span>
              </div>
            )}
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label>E-mail</Label>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{user.email}</span>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Cidade</Label>
            {isEditing ? (
              <Input
                id="location"
                placeholder="Sua cidade"
                value={editData.location || ''}
                onChange={(e) => setEditData({ ...editData, location: e.target.value })}
              />
            ) : (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{profileData.location || 'Não informado'}</span>
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio curta</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Fale de você em poucas palavras. Pode ser seu estilo de festa, o som que mais curte ou algo que te represente.
            </p>
            {isEditing ? (
              <Textarea
                id="bio"
                placeholder="Conte sua vibe..."
                value={editData.bio || ''}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                rows={3}
                maxLength={200}
              />
            ) : (
              <p className="text-sm">{profileData.bio || 'Não informado'}</p>
            )}
            {isEditing && (
              <p className="text-xs text-muted-foreground">
                {(editData.bio || '').length}/200 caracteres
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CalendarTab = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">📅 Meu Calendário</h2>
        <p className="text-muted-foreground">
          Aqui ficam os eventos que você marcou como 'Quero ir' ou 'Interessado'. Acompanhe sua agenda e não perca nada.
        </p>
      </div>
      <UserPersonalCalendar />
    </div>
  );

  const FavoritesTab = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">⭐ Meus Favoritos</h2>
        <p className="text-muted-foreground">
          Artistas, festas e locais que você salvou ficam aqui. Uma lista pessoal pra acompanhar de perto tudo que você mais curte.
        </p>
      </div>
      <FavoritesPanel />
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="calendario">Meu Calendário</TabsTrigger>
          <TabsTrigger value="favoritos">Favoritos</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil">
          <ProfileTab />
        </TabsContent>

        <TabsContent value="calendario">
          <CalendarTab />
        </TabsContent>

        <TabsContent value="favoritos">
          <FavoritesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;