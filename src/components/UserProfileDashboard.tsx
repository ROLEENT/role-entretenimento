import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Plus, Eye, Settings, Heart, MapPin, Calendar } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string | null;
  type: 'artista' | 'local' | 'organizador';
  handle: string;
  name: string;
  city: string;
  state: string;
  country: string;
  bio_short?: string;
  avatar_url?: string;
  cover_url?: string;
  tags?: string[];
  verified?: boolean;
  visibility: 'public' | 'draft' | 'private';
  followers_count?: number;
  created_at: string;
  updated_at: string;
}

interface UserProfileDashboardProps {
  compact?: boolean;
}

export function UserProfileDashboard({ compact = false }: UserProfileDashboardProps) {
  const { user, isAuthenticated } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserProfiles();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchUserProfiles = async () => {
    if (!user) return;
    
    try {
      const { data: userProfiles, error } = await supabase
        .from('entity_profiles')
        .select(`
          id, user_id, type, handle, name, city, state, country, bio_short, 
          avatar_url, cover_url, tags, verified, visibility,
          created_at, updated_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(userProfiles || []);
    } catch (error) {
      console.error('Erro ao buscar perfis:', error);
      toast.error('Erro ao carregar perfis');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Faça login para ver seus perfis</h3>
          <Button asChild variant="outline">
            <Link to="/auth">Entrar</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <LoadingSpinner />
          <p className="mt-4 text-muted-foreground">Carregando perfis...</p>
        </CardContent>
      </Card>
    );
  }

  if (profiles.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum perfil criado</h3>
          <p className="text-muted-foreground mb-4">
            Crie seu primeiro perfil público para se conectar com a comunidade.
          </p>
          <Button asChild>
            <Link to="/criar/perfil">
              <Plus className="w-4 h-4 mr-2" />
              Criar Perfil
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'artista': return 'Artista';
      case 'local': return 'Local';
      case 'organizador': return 'Organizador';
      default: return type;
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'default';
      case 'draft': return 'secondary';
      case 'private': return 'outline';
      default: return 'secondary';
    }
  };

  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'Público';
      case 'draft': return 'Rascunho';
      case 'private': return 'Privado';
      default: return visibility;
    }
  };

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Meus Perfis</CardTitle>
            <Button size="sm" asChild>
              <Link to="/meus-perfis">Ver todos</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {profiles.slice(0, 3).map((profile) => (
            <div key={profile.id} className="flex items-center justify-between p-2 rounded-lg border">
              <div className="flex items-center gap-2">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm">{profile.name}</p>
                  <p className="text-xs text-muted-foreground">@{profile.handle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getVisibilityColor(profile.visibility)}>
                  {getVisibilityLabel(profile.visibility)}
                </Badge>
                <Button size="sm" variant="ghost" asChild>
                  <Link to={`/perfil/@${profile.handle}`}>
                    <Eye className="w-3 h-3" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
          {profiles.length > 3 && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              +{profiles.length - 3} perfis adicionais
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Meus Perfis</h2>
          <p className="text-muted-foreground">Gerencie seus perfis públicos</p>
        </div>
        <Button asChild>
          <Link to="/criar/perfil">
            <Plus className="w-4 h-4 mr-2" />
            Novo Perfil
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map((profile) => (
          <Card key={profile.id} className="overflow-hidden">
            {profile.cover_url && (
              <div className="h-32 overflow-hidden">
                <img 
                  src={profile.cover_url} 
                  alt={`${profile.name} cover`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{profile.name}</h3>
                  <p className="text-sm text-muted-foreground">@{profile.handle}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{profile.city}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline">{getTypeLabel(profile.type)}</Badge>
                <Badge variant={getVisibilityColor(profile.visibility)}>
                  {getVisibilityLabel(profile.visibility)}
                </Badge>
              </div>

              {profile.bio_short && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {profile.bio_short}
                </p>
              )}

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" asChild>
                  <Link to={`/perfil/@${profile.handle}`}>
                    <Eye className="w-4 h-4 mr-1" />
                    Ver
                  </Link>
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Settings className="w-4 h-4 mr-1" />
                  Editar
                </Button>
              </div>

              <div className="flex items-center justify-between mt-2 pt-2 border-t text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span>{profile.followers_count || 0} seguidores</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(profile.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}