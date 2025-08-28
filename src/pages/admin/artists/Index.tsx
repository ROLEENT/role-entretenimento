import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, Filter, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAdminToast } from '@/hooks/useAdminToast';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useArtistManagement } from '@/hooks/useArtistManagement';
import { useDebounce } from '@/hooks/useDebounce';
import { withAdminAuth } from '@/components/withAdminAuth';
import { useSecureAuth } from '@/hooks/useSecureAuth';

interface Artist {
  id: string;
  stage_name: string;
  artist_type: string;
  city: string;
  instagram: string;
  status: string;
  profile_image_url?: string;
  created_at: string;
}

function AdminArtistsIndex() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [artistTypeFilter, setArtistTypeFilter] = useState('all');
  const { showSuccess, showError } = useAdminToast();
  const { getArtists, deleteArtist, loading } = useArtistManagement();
  
  // ETAPA 1: Usar o sistema de auth com RBAC
  const { role, canDelete, isAdmin } = useSecureAuth();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const loadArtists = useCallback(async () => {
    try {
      const filters = {
        search: debouncedSearchTerm,
        status: statusFilter,
        city: cityFilter,
        artist_type: artistTypeFilter
      };
      
      const artistsData = await getArtists(filters);
      setArtists(artistsData);
    } catch (error) {
      showError(error, 'Erro ao carregar artistas');
    }
  }, [getArtists, debouncedSearchTerm, statusFilter, cityFilter, artistTypeFilter, showError]);

  useEffect(() => {
    loadArtists();
  }, [loadArtists]);

  const handleDelete = async (artistId: string) => {
    try {
      await deleteArtist(artistId);
      await loadArtists(); // Recarregar lista após exclusão
    } catch (error) {
      showError(error, 'Erro ao remover artista');
    }
  };

  // Artists are already filtered on the server side, so we just use them directly
  const filteredArtists = artists;

  const getTypeLabel = (type: string) => {
    const types = {
      banda: 'Banda',
      dj: 'DJ',
      solo: 'Solo',
      drag: 'Drag'
    };
    return types[type as keyof typeof types] || type;
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? 
      <Badge variant="secondary" className="bg-green-100 text-green-800">Ativo</Badge> :
      <Badge variant="outline">Inativo</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Artistas</h1>
          <p className="text-muted-foreground">
            Gerencie artistas e performers da plataforma
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {role}
            </Badge>
            {canDelete && (
              <Badge variant="secondary">Pode deletar</Badge>
            )}
          </div>
        </div>
        <Button asChild>
          <Link to="/admin-v2/artists/create">
            <Plus className="mr-2 h-4 w-4" />
            Novo Artista
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou Instagram..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cidades</SelectItem>
                <SelectItem value="São Paulo">São Paulo</SelectItem>
                <SelectItem value="Rio de Janeiro">Rio de Janeiro</SelectItem>
                <SelectItem value="Curitiba">Curitiba</SelectItem>
                <SelectItem value="Porto Alegre">Porto Alegre</SelectItem>
                <SelectItem value="Florianópolis">Florianópolis</SelectItem>
              </SelectContent>
            </Select>

            <Select value={artistTypeFilter} onValueChange={setArtistTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tipo de Artista" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="banda">Banda</SelectItem>
                <SelectItem value="dj">DJ</SelectItem>
                <SelectItem value="solo">Artista Solo</SelectItem>
                <SelectItem value="drag">Drag</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Artistas ({filteredArtists.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredArtists.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || cityFilter !== 'all' || artistTypeFilter !== 'all' 
                ? 'Nenhum artista encontrado com os filtros aplicados.' 
                : 'Nenhum artista cadastrado ainda.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredArtists.map((artist) => (
                <div
                  key={artist.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                      {artist.profile_image_url ? (
                        <img
                          src={artist.profile_image_url}
                          alt={artist.stage_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-semibold text-muted-foreground">
                          {artist.stage_name.charAt(0)}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{artist.stage_name}</h3>
                        {getStatusBadge(artist.status)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{getTypeLabel(artist.artist_type)}</span>
                        <span>•</span>
                        <span>{artist.city}</span>
                        <span>•</span>
                        <span>{artist.instagram}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/admin-v2/artists/${artist.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    
                    {/* ETAPA 1: Botão deletar apenas para admins */}
                    {canDelete ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o artista "{artist.stage_name}"? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(artist.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <Button variant="outline" size="sm" disabled title="Apenas admins podem deletar">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ETAPA 1: Exportar componente protegido que requer role 'editor' ou superior
export default withAdminAuth(AdminArtistsIndex, 'editor');