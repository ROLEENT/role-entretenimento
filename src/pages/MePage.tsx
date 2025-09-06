import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePublicAuth } from '@/hooks/usePublicAuth';
import { PublicAuthDialog } from '@/components/auth/PublicAuthDialog';
import { MapPin, User, Mail, Phone, Globe, Instagram, Calendar, Heart, Users } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  city: string;
  phone: string;
  instagram: string;
  website: string;
  birth_date: string;
  is_profile_public: boolean;
  preferred_genres: string[];
  accessibility_notes: string;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  saved_events_count: number;
  attendances_count: number;
  following_count: number;
}

export default function MePage() {
  const { user, isAuthenticated } = usePublicAuth();
  const { toast } = useToast();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    bio: '',
    city: '',
    phone: '',
    instagram: '',
    website: '',
    birth_date: '',
    is_profile_public: false,
    preferred_genres: [] as string[],
    accessibility_notes: ''
  });

  const availableGenres = [
    'Eletrônica', 'House', 'Techno', 'Trance', 'Progressive', 'Minimal',
    'Rock', 'Pop', 'Hip Hop', 'R&B', 'Funk', 'Reggae', 'Jazz', 'Blues',
    'Samba', 'Pagode', 'MPB', 'Forró', 'Sertanejo', 'Indie', 'Alternative'
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    fetchProfile();
  }, [isAuthenticated, user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get or create profile
      const { data: profileData, error: profileError } = await supabase
        .from('users_public')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, call ensure_user_profile
        const { error: ensureError } = await supabase.rpc('ensure_user_profile', {
          p_username: `user_${user.id.slice(0, 8)}`,
          p_display_name: user.email?.split('@')[0] || 'Usuário',
          p_avatar_url: null
        });

        if (ensureError) {
          console.error('Error creating profile:', ensureError);
          toast({
            title: "Erro",
            description: "Erro ao criar perfil. Tente novamente.",
            variant: "destructive"
          });
          return;
        }

        // Fetch the newly created profile
        const { data: newProfileData, error: newProfileError } = await supabase
          .from('users_public')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (newProfileError) {
          console.error('Error fetching new profile:', newProfileError);
          return;
        }

        setProfile(newProfileData);
        setFormData({
          username: newProfileData.username || '',
          display_name: newProfileData.display_name || '',
          bio: newProfileData.bio || '',
          city: newProfileData.city || '',
          phone: newProfileData.phone || '',
          instagram: newProfileData.instagram || '',
          website: newProfileData.website || '',
          birth_date: newProfileData.birth_date || '',
          is_profile_public: newProfileData.is_profile_public || false,
          preferred_genres: newProfileData.preferred_genres || [],
          accessibility_notes: newProfileData.accessibility_notes || ''
        });
      } else if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      } else {
        setProfile(profileData);
        setFormData({
          username: profileData.username || '',
          display_name: profileData.display_name || '',
          bio: profileData.bio || '',
          city: profileData.city || '',
          phone: profileData.phone || '',
          instagram: profileData.instagram || '',
          website: profileData.website || '',
          birth_date: profileData.birth_date || '',
          is_profile_public: profileData.is_profile_public || false,
          preferred_genres: profileData.preferred_genres || [],
          accessibility_notes: profileData.accessibility_notes || ''
        });
      }

      // Fetch user stats
      const { data: statsData } = await supabase.rpc('get_user_stats', {
        p_user_id: user.id
      });

      if (statsData && statsData.length > 0) {
        setStats(statsData[0]);
      }

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('users_public')
        .update({
          username: formData.username,
          display_name: formData.display_name,
          bio: formData.bio,
          city: formData.city,
          phone: formData.phone,
          instagram: formData.instagram,
          website: formData.website,
          birth_date: formData.birth_date || null,
          is_profile_public: formData.is_profile_public,
          preferred_genres: formData.preferred_genres,
          accessibility_notes: formData.accessibility_notes,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Erro",
          description: "Erro ao salvar perfil. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Perfil salvo com sucesso!"
      });

      // Refresh profile
      fetchProfile();

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleGenre = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_genres: prev.preferred_genres.includes(genre)
        ? prev.preferred_genres.filter(g => g !== genre)
        : [...prev.preferred_genres, genre]
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Necessário</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Você precisa estar logado para editar seu perfil.
            </p>
            <Button onClick={() => setShowAuthDialog(true)} className="w-full">
              Fazer Login
            </Button>
          </CardContent>
        </Card>

        <PublicAuthDialog
          open={showAuthDialog}
          onOpenChange={setShowAuthDialog}
          defaultTab="signin"
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Meu Perfil</h1>
          <p className="text-muted-foreground">
            Configure suas informações e preferências
          </p>
        </div>

        {/* Stats Card */}
        {stats && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Heart className="h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">{stats.saved_events_count}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Eventos Salvos</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">{stats.attendances_count}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Presenças</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">{stats.following_count}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Seguindo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar & Basic Info */}
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Nome de usuário</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Seu nome de usuário"
                    />
                  </div>
                  <div>
                    <Label htmlFor="display_name">Nome de exibição</Label>
                    <Input
                      id="display_name"
                      value={formData.display_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                      placeholder="Como você quer ser chamado"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Conte um pouco sobre você..."
                rows={3}
              />
            </div>

            <Separator />

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contato</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Cidade
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Sua cidade"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram" className="flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    value={formData.instagram}
                    onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                    placeholder="@seuinstagram"
                  />
                </div>
                <div>
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://seusite.com"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Preferences */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Preferências</h3>
              <div className="space-y-4">
                <div>
                  <Label>Gêneros Musicais Favoritos</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableGenres.map((genre) => (
                      <Badge
                        key={genre}
                        variant={formData.preferred_genres.includes(genre) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleGenre(genre)}
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="accessibility_notes">Notas de Acessibilidade</Label>
                  <Textarea
                    id="accessibility_notes"
                    value={formData.accessibility_notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, accessibility_notes: e.target.value }))}
                    placeholder="Informe sobre necessidades especiais de acessibilidade..."
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Privacy */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Privacidade</h3>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Perfil Público</Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir que outros usuários vejam seu perfil
                  </p>
                </div>
                <Switch
                  checked={formData.is_profile_public}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_profile_public: checked }))}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? "Salvando..." : "Salvar Perfil"}
              </Button>
              {formData.is_profile_public && profile?.username && (
                <Button variant="outline" asChild>
                  <a href={`/u/${profile.username}`} target="_blank" rel="noopener noreferrer">
                    Ver Perfil Público
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}