import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AdminV3Guard } from '@/components/AdminV3Guard';
import { AdminV3Header } from '@/components/AdminV3Header';
import { AdminBreadcrumb } from '@/components/ui/unified-breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Music, 
  MapPin, 
  Instagram,
  Filter,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Artist {
  id: string;
  stage_name: string;
  slug: string;
  artist_type: string;
  city?: string;
  instagram?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const ARTIST_TYPES = [
  { value: 'artist', label: 'Artista' },
  { value: 'band', label: 'Banda' },
  { value: 'dj', label: 'DJ' },
  { value: 'collective', label: 'Coletivo' },
  { value: 'producer', label: 'Produtor' }
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' }
];

const CITIES = [
  'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília', 
  'Porto Alegre', 'Curitiba', 'Florianópolis', 'Salvador',
  'Recife', 'Fortaleza', 'Goiânia', 'Manaus'
];

function ArtistsContent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [artistType, setArtistType] = useState(searchParams.get('type') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  
  // Pagination
  const limit = 20;
  const offset = parseInt(searchParams.get('offset') || '0');

  const loadArtists = useCallback(async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('artists')
        .select('*', { count: 'exact' })
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (search) {
        query = query.or(`stage_name.ilike.%${search}%,slug.ilike.%${search}%`);
      }
      if (artistType) {
        query = query.eq('artist_type', artistType);
      }
      if (status) {
        query = query.eq('status', status);
      }
      if (city) {
        query = query.eq('city', city);
      }

      const { data, error, count } = await query;
      
      if (error) throw error;
      
      setArtists(data || []);
      setTotal(count || 0);
      
    } catch (error) {
      console.error('Erro ao carregar artistas:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar artistas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [search, artistType, status, city, offset, toast]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (artistType) params.set('type', artistType);
    if (status) params.set('status', status);
    if (city) params.set('city', city);
    if (offset > 0) params.set('offset', offset.toString());
    
    setSearchParams(params);
  }, [search, artistType, status, city, offset, setSearchParams]);

  useEffect(() => {
    loadArtists();
  }, [loadArtists]);

  const handleDelete = async (artist: Artist) => {
    try {
      const { error } = await supabase
        .from('artists')
        .delete()
        .eq('id', artist.id);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: `Artista ${artist.stage_name} removido`
      });
      
      loadArtists();
    } catch (error) {
      console.error('Erro ao deletar artista:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover artista",
        variant: "destructive"
      });
    }
  };

  const clearFilters = () => {
    setSearch('');
    setArtistType('');
    setStatus('');
    setCity('');
    setSearchParams({});
  };

  const hasFilters = search || artistType || status || city;

  const handlePagination = (direction: 'next' | 'prev') => {
    const newOffset = direction === 'next' ? offset + limit : Math.max(0, offset - limit);
    const params = new URLSearchParams(searchParams);
    if (newOffset > 0) {
      params.set('offset', newOffset.toString());
    } else {
      params.delete('offset');
    }
    setSearchParams(params);
  };

  const getTypeLabel = (type: string) => {
    return ARTIST_TYPES.find(t => t.value === type)?.label || type;
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
        Ativo
      </Badge>
    ) : (
      <Badge variant="secondary">
        Inativo
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Artistas</h1>
          <p className="text-muted-foreground">
            {total} {total === 1 ? 'artista' : 'artistas'} encontrado{total === 1 ? '' : 's'}
          </p>
        </div>
        <Button onClick={() => navigate('/admin-v3/artists/create')} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Artista
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={artistType} onValueChange={setArtistType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                
                {ARTIST_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                
                {STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={city} onValueChange={setCity}>
              <SelectTrigger>
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                
                {CITIES.map(cityOption => (
                  <SelectItem key={cityOption} value={cityOption}>
                    {cityOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Limpar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Artists List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Lista de Artistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded">
                  <Skeleton className="w-12 h-12 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
          ) : artists.length === 0 ? (
            <div className="text-center py-12">
              <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum artista encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {hasFilters ? 'Tente ajustar os filtros ou' : 'Comece'} criando o primeiro artista.
              </p>
              <Button onClick={() => navigate('/admin-v3/artists/create')}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Artista
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {artists.map((artist) => (
                <div key={artist.id} className="flex items-center gap-4 p-4 border rounded hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium">{artist.stage_name}</h3>
                      <Badge variant="outline">{getTypeLabel(artist.artist_type)}</Badge>
                      {getStatusBadge(artist.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>@{artist.slug}</span>
                      {artist.city && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {artist.city}
                        </div>
                      )}
                      {artist.instagram && (
                        <div className="flex items-center gap-1">
                          <Instagram className="w-3 h-3" />
                          Instagram
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin-v3/artists/${artist.id}/edit`)}
                      className="gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                          Apagar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja apagar o artista <strong>{artist.stage_name}</strong>? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(artist)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Apagar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {offset + 1} a {Math.min(offset + limit, total)} de {total} artistas
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handlePagination('prev')}
              disabled={offset === 0}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePagination('next')}
              disabled={offset + limit >= total}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminV3Artists() {
  return (
    <AdminV3Guard>
      <div className="min-h-screen bg-background">
        <AdminV3Header />
        <div className="pt-16 p-6">
          <div className="max-w-7xl mx-auto">
            <AdminBreadcrumb 
              items={[
                { label: 'Dashboard', path: '/admin-v3' },
                { label: 'Artistas' }
              ]} 
            />
            <ArtistsContent />
          </div>
        </div>
      </div>
    </AdminV3Guard>
  );
}