import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import { AdminArtistFilters } from '@/components/admin/agents/AdminArtistFilters';
import { AdminArtistTable } from '@/components/admin/agents/AdminArtistTable';
import { useAdminArtistsData } from '@/hooks/useAdminArtistsData';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ImageRecoveryButton } from '@/components/admin/utils/ImageRecoveryButton';
import { ArtistProtectionPanel } from '@/components/admin/ArtistProtectionPanel';

const AdminV3ArtistsList: React.FC = () => {
  const {
    artists,
    cities,
    artistTypes,
    filters,
    isLoading,
    error,
    updateFilters,
    duplicateArtist,
    updateArtistStatus,
    deleteArtist,
    isDuplicating,
    isUpdatingStatus,
    isDeleting
  } = useAdminArtistsData();

  const breadcrumbs = [
    { label: 'Admin', path: '/admin-v3' },
    { label: 'Agentes', path: '/admin-v3/agentes' },
    { label: 'Artistas' },
  ];

  const actions = (
    <div className="flex gap-2">
      <ImageRecoveryButton />
      <Button asChild>
        <Link to="/admin-v3/agentes/artistas/create">
          <Plus className="h-4 w-4 mr-2" />
          Novo Artista
        </Link>
      </Button>
    </div>
  );

  if (error) {
    return (
      <AdminPageWrapper
        title="Artistas"
        description="Gerencie os artistas cadastrados no sistema"
        breadcrumbs={breadcrumbs}
        actions={actions}
      >
        <div className="text-center py-8">
          <p className="text-destructive">Erro ao carregar artistas: {error.message}</p>
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="Artistas"
      description="Gerencie os artistas cadastrados no sistema"
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      <Tabs defaultValue="artists" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="artists">Lista de Artistas</TabsTrigger>
          <TabsTrigger value="protection">Sistema de Proteção</TabsTrigger>
        </TabsList>
        
        <TabsContent value="artists" className="space-y-6">
          {/* Filters */}
          <AdminArtistFilters
            filters={filters}
            cities={cities}
            artistTypes={artistTypes}
            onFiltersChange={updateFilters}
            totalCount={artists?.length}
          />

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          )}

          {/* Artists Table */}
          {!isLoading && (
            <AdminArtistTable
              artists={artists || []}
              onDuplicate={duplicateArtist}
              onStatusChange={updateArtistStatus}
              onDelete={deleteArtist}
              isLoading={isDuplicating || isUpdatingStatus || isDeleting}
            />
          )}

          {/* Empty State */}
          {!isLoading && artists && artists.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 mb-4 text-muted-foreground">
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum artista encontrado</h3>
              <p className="text-muted-foreground mb-6">
                {filters.search || filters.status !== 'all' || filters.city !== 'all' || filters.artistType !== 'all'
                  ? 'Tente ajustar os filtros para encontrar artistas.'
                  : 'Comece cadastrando seu primeiro artista.'}
              </p>
              <Button asChild>
                <Link to="/admin-v3/agentes/artistas/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro Artista
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="protection">
          <ArtistProtectionPanel />
        </TabsContent>
      </Tabs>
    </AdminPageWrapper>
  );
};

export default AdminV3ArtistsList;