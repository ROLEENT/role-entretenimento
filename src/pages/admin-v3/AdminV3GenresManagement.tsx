import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { Search, Plus, Music, Activity, Eye, EyeOff, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Genre {
  id: string;
  name: string;
  slug: string;
  source: string;
  is_active: boolean;
  parent_genre_id: string | null;
  parent_name: string | null;
  created_at: string;
  updated_at: string;
}

const AdminV3GenresManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const queryClient = useQueryClient();

  const breadcrumbs = [
    { label: 'Admin', path: '/admin-v3' },
    { label: 'Configurações', path: '/admin-v3/configuracoes' },
    { label: 'Gêneros Musicais' },
  ];

  // Fetch genres with hierarchy
  const { data: genres, isLoading } = useQuery({
    queryKey: ['admin-genres', searchQuery, showInactive],
    queryFn: async () => {
      let query = supabase
        .from('genres_with_hierarchy')
        .select('*')
        .order('name');

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%, parent_name.ilike.%${searchQuery}%`);
      }

      if (!showInactive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Genre[];
    },
  });

  // Toggle genre activation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ genreId, isActive }: { genreId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('genres')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', genreId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-genres'] });
      toast.success('Status do gênero atualizado');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar gênero: ' + error.message);
    },
  });

  // Delete genre
  const deleteMutation = useMutation({
    mutationFn: async (genreId: string) => {
      const { error } = await supabase
        .from('genres')
        .delete()
        .eq('id', genreId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-genres'] });
      toast.success('Gênero removido');
    },
    onError: (error) => {
      toast.error('Erro ao remover gênero: ' + error.message);
    },
  });

  const handleToggleActive = (genre: Genre) => {
    toggleActiveMutation.mutate({
      genreId: genre.id,
      isActive: !genre.is_active,
    });
  };

  const handleDelete = (genre: Genre) => {
    if (confirm(`Tem certeza que deseja remover o gênero "${genre.name}"?`)) {
      deleteMutation.mutate(genre.id);
    }
  };

  const activeGenres = genres?.filter(g => g.is_active) || [];
  const inactiveGenres = genres?.filter(g => !g.is_active) || [];
  const hierarchicalGenres = genres?.filter(g => g.parent_name) || [];

  return (
    <AdminPageWrapper
      title="Gêneros Musicais"
      description="Gerencie os gêneros musicais disponíveis no sistema"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Gêneros</CardTitle>
              <Music className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{genres?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeGenres.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inativos</CardTitle>
              <EyeOff className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{inactiveGenres.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hierárquicos</CardTitle>
              <Plus className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{hierarchicalGenres.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros e Controles</CardTitle>
            <CardDescription>
              Busque e filtre gêneros para gerenciamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar gêneros..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-inactive"
                  checked={showInactive}
                  onCheckedChange={setShowInactive}
                />
                <label htmlFor="show-inactive" className="text-sm font-medium">
                  Mostrar inativos
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Genres List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lista de Gêneros</CardTitle>
            <CardDescription>
              {searchQuery 
                ? `Resultados para "${searchQuery}"`
                : `${genres?.length || 0} gêneros encontrados`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : genres && genres.length > 0 ? (
              <div className="space-y-3">
                {genres.map((genre) => (
                  <div
                    key={genre.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      genre.is_active 
                        ? 'bg-background border-border hover:bg-muted/50'
                        : 'bg-muted/30 border-muted opacity-75'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {genre.name}
                          </span>
                          
                          {genre.parent_name && (
                            <span className="text-sm text-muted-foreground">
                              → {genre.parent_name}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={genre.source === 'spotify' ? 'default' : 'secondary'} className="text-xs">
                            {genre.source === 'spotify' ? '🎵 Spotify' : '✏️ Manual'}
                          </Badge>
                          
                          <span className="text-xs text-muted-foreground">
                            {genre.slug}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={genre.is_active}
                        onCheckedChange={() => handleToggleActive(genre)}
                        disabled={toggleActiveMutation.isPending}
                      />
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(genre)}
                        disabled={deleteMutation.isPending}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Nenhum gênero encontrado</p>
                <p className="text-sm">
                  {searchQuery 
                    ? 'Tente ajustar sua busca ou importar mais gêneros'
                    : 'Execute o script de importação para adicionar gêneros'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Import Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Importação de Gêneros</CardTitle>
            <CardDescription>
              Como importar gêneros do Spotify para o sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Script de Importação</h4>
              <code className="text-sm text-muted-foreground bg-background p-2 rounded block">
                SUPABASE_SERVICE_ROLE=your_key node scripts/import-spotify-genres.js
              </code>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>O script irá:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Importar ~6.000 gêneros do Spotify</li>
                <li>Criar hierarquias (ex: Deep House → House)</li>
                <li>Ativar apenas gêneros principais inicialmente</li>
                <li>Permitir ativação sob demanda via este painel</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPageWrapper>
  );
};

export default AdminV3GenresManagement;