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
import { toast } from 'sonner';

const AdminV3VenuesList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [city, setCity] = useState('all');
  const [completion, setCompletion] = useState('all');

  const { 
    venues, 
    cities, 
    isLoading, 
    error,
    duplicateVenue,
    updateVenueStatus,
    deleteVenue,
    isDuplicating,
    isUpdatingStatus,
    isDeleting
  } = useAdminVenuesData({
    search: search || undefined,
    status: status !== 'all' ? status : undefined,
    city: city !== 'all' ? city : undefined,
    completion: completion !== 'all' ? completion : undefined,
  });

  const breadcrumbs = [
    { label: 'Admin', path: '/admin-v3' },
    { label: 'Agentes', path: '/admin-v3/agentes' },
    { label: 'Locais' },
  ];

    const actions = (
      <div className="flex gap-2">
        <Button asChild>
          <Link to="/admin-v3/agentes/venues/novo">
            <Plus className="h-4 w-4 mr-2" />
            Novo Local
          </Link>
        </Button>
      </div>
    );

  const handleDuplicate = (venueId: string) => {
    duplicateVenue(venueId);
  };

  const handleStatusChange = (venueId: string, status: string) => {
    updateVenueStatus(venueId, status);
  };

  const handleDelete = (venueId: string) => {
    deleteVenue(venueId);
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
              completion={completion}
              onCompletionChange={setCompletion}
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
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                isLoading={isDuplicating || isUpdatingStatus || isDeleting}
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
    </AdminPageWrapper>
  );
};

export default AdminV3VenuesList;