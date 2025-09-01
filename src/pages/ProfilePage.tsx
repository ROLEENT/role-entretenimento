import React, { useState, useEffect } from 'react';
import { useUserAuth } from '@/hooks/useUserAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Mail, Globe, MapPin, Edit2, Save, X, Camera } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProfileData {
  display_name: string;
  username: string;
  bio: string;
  website: string;
  location: string;
  avatar_url: string;
  followers_count: number;
  following_count: number;
  is_verified: boolean;
}

const ProfilePage = () => {
  const { user, updateProfile } = useUserAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    display_name: '',
    username: '',
    bio: '',
    website: '',
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
          website: data.website || '',
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
      website: profileData.website,
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

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-8">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Meu Perfil</CardTitle>
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
            <CardDescription>
              Gerencie suas informações pessoais e configurações de perfil
            </CardDescription>
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
                <h3 className="text-lg font-semibold">
                  {profileData.display_name || 'Nome não definido'}
                  {profileData.is_verified && (
                    <span className="ml-2 text-blue-500">✓</span>
                  )}
                </h3>
                <p className="text-muted-foreground">
                  @{profileData.username || 'username-não-definido'}
                </p>
                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                  <span>{profileData.followers_count} seguidores</span>
                  <span>{profileData.following_count} seguindo</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Profile Information */}
            <div className="grid gap-6">
              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="display_name">Nome de exibição</Label>
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

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Nome de usuário</Label>
                {isEditing ? (
                  <Input
                    id="username"
                    placeholder="@seuusername"
                    value={editData.username || ''}
                    onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">@</span>
                    <span>{profileData.username || 'Não informado'}</span>
                  </div>
                )}
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user.email}</span>
                  <span className="text-xs text-muted-foreground">(não pode ser alterado)</span>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    placeholder="Conte um pouco sobre você..."
                    value={editData.bio || ''}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    rows={4}
                  />
                ) : (
                  <p className="text-sm">{profileData.bio || 'Não informado'}</p>
                )}
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                {isEditing ? (
                  <Input
                    id="website"
                    placeholder="https://seusite.com"
                    value={editData.website || ''}
                    onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    {profileData.website ? (
                      <a 
                        href={profileData.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {profileData.website}
                      </a>
                    ) : (
                      <span>Não informado</span>
                    )}
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Localização</Label>
                {isEditing ? (
                  <Input
                    id="location"
                    placeholder="Cidade, País"
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
            </div>
          </CardContent>
        </Card>

        {/* Info Alert */}
        <Alert>
          <AlertDescription>
            Seu perfil é público e pode ser visto por outros usuários da plataforma.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default ProfilePage;