import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { useAdminToast } from '@/hooks/useAdminToast';
import { useArtistManagement } from '@/hooks/useArtistManagement';
import { useDebounce } from '@/hooks/useDebounce';

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

export default function AdminArtistsList() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [artistTypeFilter, setArtistTypeFilter] = useState('all');
  
  const { showSuccess, showError } = useAdminToast();
  const { getArtists, deleteArtist, loading } = useArtistManagement();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const loadArtists = useCallback(async () => {
    try {
      const filters = {
        search: debouncedSearchTerm,
        status: statusFilter === 'all' ? undefined : statusFilter,
        city: cityFilter === 'all' ? undefined : cityFilter,
        artist_type: artistTypeFilter === 'all' ? undefined : artistTypeFilter
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
      showSuccess('Artista removido com sucesso');
      await loadArtists();
    } catch (error) {
      showError(error, 'Erro ao remover artista');
    }
  };

  const handleSearch = (query: string) => {
    setSearchTerm(query);
  };

  const handleFilter = (key: string, value: string) => {
    switch (key) {
      case 'status':
        setStatusFilter(value);
        break;
      case 'city':
        setCityFilter(value);
        break;
      case 'artist_type':
        setArtistTypeFilter(value);
        break;
    }
  };

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

  const columns = [
    {
      key: 'profile',
      label: 'Perfil',
      render: (_, artist: Artist) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            {artist.profile_image_url ? (
              <img
                src={artist.profile_image_url}
                alt={artist.stage_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-semibold text-muted-foreground">
                {artist.stage_name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <div className="font-semibold">{artist.stage_name}</div>
            <div className="text-sm text-muted-foreground">@{artist.instagram}</div>
          </div>
        </div>
      )
    },
    {
      key: 'type_city',
      label: 'Tipo & Cidade',
      render: (_, artist: Artist) => (
        <div className="space-y-1">
          <div className="text-sm font-medium">{getTypeLabel(artist.artist_type)}</div>
          <div className="text-sm text-muted-foreground">{artist.city}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, artist: Artist) => getStatusBadge(artist.status)
    }
  ];

  const filters = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'active', label: 'Ativo' },
        { value: 'inactive', label: 'Inativo' }
      ]
    },
    {
      key: 'city',
      label: 'Cidade',
      type: 'select' as const,
      options: [
        { value: 'São Paulo', label: 'São Paulo' },
        { value: 'Rio de Janeiro', label: 'Rio de Janeiro' },
        { value: 'Curitiba', label: 'Curitiba' },
        { value: 'Porto Alegre', label: 'Porto Alegre' },
        { value: 'Florianópolis', label: 'Florianópolis' }
      ]
    },
    {
      key: 'artist_type',
      label: 'Tipo',
      type: 'select' as const,
      options: [
        { value: 'banda', label: 'Banda' },
        { value: 'dj', label: 'DJ' },
        { value: 'solo', label: 'Solo' },
        { value: 'drag', label: 'Drag' }
      ]
    }
  ];

  const actions = [
    {
      type: 'edit' as const,
      href: (artist: Artist) => `/admin-v2/artists/${artist.id}/edit`
    },
    {
      type: 'delete' as const,
      requiresRole: 'admin' as const
    }
  ];

  return (
    <AdminDataTable
      title="Artistas"
      description="Gerencie artistas e performers da plataforma"
      data={artists}
      columns={columns}
      filters={filters}
      actions={actions}
      loading={loading}
      createButton={{
        label: "Novo Artista",
        href: "/admin-v2/artists/create"
      }}
      onDelete={handleDelete}
      onSearch={handleSearch}
      onFilter={handleFilter}
      searchPlaceholder="Buscar por nome ou Instagram..."
      emptyMessage="Nenhum artista encontrado com os filtros aplicados."
    />
  );
}