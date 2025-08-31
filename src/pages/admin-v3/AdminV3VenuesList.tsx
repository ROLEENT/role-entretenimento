import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AdminVenueFilters } from '@/components/admin/venues/AdminVenueFilters';
import { AdminVenueTable } from '@/components/admin/venues/AdminVenueTable';
import { useAdminVenuesData } from '@/hooks/useAdminVenuesData';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { toast } from 'sonner';

const AdminV3VenuesList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [city, setCity] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState<any>(null);

  const { venues, cities, isLoading, error, deleteVenue } = useAdminVenuesData({
    search: search || undefined,
    status: status !== 'all' ? status : undefined,
    city: city !== 'all' ? city : undefined,
  });

  const breadcrumbs = [
    { label: 'Admin', path: '/admin-v3' },
    { label: 'Agentes', path: '/admin-v3/agentes' },
    { label: 'Locais' },
  ];

  const actions = (
    <Button asChild>
      <Link to="/admin-v3/agentes/venues/create">
        <Plus className="h-4 w-4 mr-2" />
        Novo Local
      </Link>
    </Button>
  );

  const handleDuplicate = async (venue: any) => {
    toast.info('Funcionalidade de duplicar será implementada em breve');
  };

  const handleDeactivate = async (venue: any) => {
    toast.info('Funcionalidade de desativar será implementada em breve');
  };

  const handleDelete = (venue: any) => {
    setVenueToDelete(venue);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (venueToDelete) {
      deleteVenue(venueToDelete.id);
      setDeleteDialogOpen(false);
      setVenueToDelete(null);
    }
  };

  const statsCards = [
    {
      title: 'Total de Locais',
      value: venues?.length || 0,
      icon: MapPin,
      change: '+8%'
    },
    {
      title: 'Locais Ativos',
      value: venues?.filter((v: any) => v.status === 'active')?.length || 0,
      icon: MapPin,
      change: '+5%'
    },
    {
      title: 'Casas de Show',
      value: venues?.filter((v: any) => v.venue_type === 'house')?.length || 0,
      icon: MapPin,
      change: '+12%'
    },
    {
      title: 'Teatros',
      value: venues?.filter((v: any) => v.venue_type === 'theater')?.length || 0,
      icon: MapPin,
      change: '+3%'
    }
  ];

  if (error) {
    return (
      <AdminPageWrapper
        title="Locais (Venues)"
        description="Gerencie casas de show, bares, clubes e espaços culturais"
        breadcrumbs={breadcrumbs}
        actions={actions}
      >
        <div className="text-center py-12">
          <p className="text-destructive">Erro ao carregar locais: {error.message}</p>
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="Locais (Venues)"
      description="Gerencie casas de show, bares, clubes e espaços culturais"
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.change} desde o último mês
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <AdminVenueFilters
              search={search}
              onSearchChange={setSearch}
              status={status}
              onStatusChange={setStatus}
              city={city}
              onCityChange={setCity}
              cities={cities || []}
            />
          </CardContent>
        </Card>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <AdminVenueTable
                venues={venues || []}
                onDuplicate={handleDuplicate}
                onDeactivate={handleDeactivate}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>
        )}

        {venues && venues.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Mostrando {venues.length} local(is)
          </div>
        )}
      </div>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir Local"
        description={`Tem certeza que deseja excluir o local "${venueToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </AdminPageWrapper>
  );
};

export default AdminV3VenuesList;