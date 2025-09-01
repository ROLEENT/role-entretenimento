import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import ProfileCard from '@/features/profiles/ProfileCard';
import { useAuth } from '@/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Plus, Eye, Settings, BarChart3, Heart } from 'lucide-react';

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

export default function UserDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProfiles: 0,
    publicProfiles: 0,
    draftProfiles: 0,
    totalViews: 0,
    totalFollowers: 0
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    fetchUserProfiles();
  }, [isAuthenticated, user]);

  const fetchUserProfiles = async () => {
    if (!user) return;
    
    try {
      // Buscar perfis do usuário
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

      // Calcular estatísticas
      const totalProfiles = userProfiles?.length || 0;
      const publicProfiles = userProfiles?.filter(p => p.visibility === 'public').length || 0;
      const draftProfiles = userProfiles?.filter(p => p.visibility === 'draft').length || 0;

      // Buscar estatísticas de seguidores (simulado por enquanto)
      let totalFollowers = 0;
      if (userProfiles && userProfiles.length > 0) {
        const profileIds = userProfiles.map(p => p.id);
        const { count } = await supabase
          .from('followers')
          .select('*', { count: 'exact', head: true })
          .in('profile_id', profileIds);
        totalFollowers = count || 0;
      }

      setStats({
        totalProfiles,
        publicProfiles,
        draftProfiles,
        totalViews: 0, // Implementar analytics depois
        totalFollowers
      });
    } catch (error) {
      console.error('Erro ao buscar perfis:', error);
      toast.error('Erro ao carregar perfis');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Meus Perfis</h1>
            <p className="text-muted-foreground">Gerencie seus perfis públicos</p>
          </div>
          <Button asChild>
            <Link to="/criar/perfil">
              <Plus className="w-4 h-4 mr-2" />
              Criar Novo Perfil
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <User className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalProfiles}</p>
                  <p className="text-sm text-muted-foreground">Total de Perfis</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Eye className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.publicProfiles}</p>
                  <p className="text-sm text-muted-foreground">Perfis Públicos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Settings className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.draftProfiles}</p>
                  <p className="text-sm text-muted-foreground">Rascunhos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalFollowers}</p>
                  <p className="text-sm text-muted-foreground">Total Seguidores</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        {profiles.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum perfil criado ainda</h3>
              <p className="text-muted-foreground mb-6">
                Crie seu primeiro perfil público para começar a se conectar com a comunidade.
              </p>
              <Button asChild>
                <Link to="/criar/perfil">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Perfil
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">Todos ({stats.totalProfiles})</TabsTrigger>
              <TabsTrigger value="public">Públicos ({stats.publicProfiles})</TabsTrigger>
              <TabsTrigger value="draft">Rascunhos ({stats.draftProfiles})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles.map((profile) => (
                  <div key={profile.id} className="relative">
                    <ProfileCard p={profile} />
                    {profile.visibility !== 'public' && (
                      <Badge 
                        variant="secondary" 
                        className="absolute top-2 right-2"
                      >
                        {profile.visibility === 'draft' ? 'Rascunho' : 'Privado'}
                      </Badge>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/perfil/@${profile.handle}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="public" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles.filter(p => p.visibility === 'public').map((profile) => (
                  <div key={profile.id}>
                    <ProfileCard p={profile} />
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/perfil/@${profile.handle}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="draft" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles.filter(p => p.visibility === 'draft').map((profile) => (
                  <div key={profile.id}>
                    <ProfileCard p={profile} />
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/perfil/@${profile.handle}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          Visualizar
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button size="sm">Publicar</Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}