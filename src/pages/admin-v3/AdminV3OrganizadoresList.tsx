import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import { AdminOrganizerFilters } from '@/components/admin/agents/AdminOrganizerFilters';
import { AdminOrganizerTable } from '@/components/admin/agents/AdminOrganizerTable';
import { useAdminOrganizersData } from '@/hooks/useAdminOrganizersData';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const AdminV3OrganizadoresList: React.FC = () => {
  const {
    organizers,
    cities,
    organizerTypes,
    filters,
    isLoading,
    error,
    updateFilters,
    duplicateOrganizer,
    updateOrganizerStatus,
    deleteOrganizer,
    isDuplicating,
    isUpdatingStatus,
    isDeleting
  } = useAdminOrganizersData();

  const breadcrumbs = [
    { label: 'Admin', path: '/admin-v3' },
    { label: 'Agentes', path: '/admin-v3/agentes' },
    { label: 'Organizadores' },
  ];

  const actions = (
    <Button asChild>
      <Link to="/admin-v3/agentes/organizadores/create-v2">
        <Plus className="h-4 w-4 mr-2" />
        Novo Organizador
      </Link>
    </Button>
  );

  if (error) {
    return (
      <AdminPageWrapper
        title="Organizadores"
        description="Gerencie os organizadores cadastrados no sistema"
        breadcrumbs={breadcrumbs}
        actions={actions}
      >
        <div className="text-center py-8">
          <p className="text-destructive">Erro ao carregar organizadores: {error.message}</p>
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="Organizadores"
      description="Gerencie os organizadores cadastrados no sistema"
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      <div className="space-y-6">
        {/* Filters */}
        <AdminOrganizerFilters
          filters={filters}
          cities={cities}
          organizerTypes={organizerTypes}
          onFiltersChange={updateFilters}
          totalCount={organizers?.length}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        )}

        {/* Organizers Table */}
        {!isLoading && (
          <AdminOrganizerTable
            organizers={organizers || []}
            onDuplicate={duplicateOrganizer}
            onStatusChange={updateOrganizerStatus}
            onDelete={deleteOrganizer}
            isLoading={isDuplicating || isUpdatingStatus || isDeleting}
          />
        )}

        {/* Empty State */}
        {!isLoading && organizers && organizers.length === 0 && (
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum organizador encontrado</h3>
            <p className="text-muted-foreground mb-6">
              {filters.search || filters.status !== 'all' || filters.city !== 'all' || filters.organizerType !== 'all'
                ? 'Tente ajustar os filtros para encontrar organizadores.'
                : 'Comece cadastrando seu primeiro organizador.'}
            </p>
            <Button asChild>
              <Link to="/admin-v3/agentes/organizadores/create-v2">
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Primeiro Organizador
              </Link>
            </Button>
          </div>
        )}
      </div>
    </AdminPageWrapper>
  );
};

export default AdminV3OrganizadoresList;