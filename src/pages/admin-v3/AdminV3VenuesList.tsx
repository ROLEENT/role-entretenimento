import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { VenueTableSkeleton } from '@/components/skeletons/VenueTableSkeleton';
import { AdminVenueFilters } from '@/components/admin/venues/AdminVenueFilters';
import { AdminVenueTable } from '@/components/admin/venues/AdminVenueTable';
import { VenueActionDialog } from '@/components/admin/venues/VenueActionDialog';
import { useAdminVenuesData } from '@/hooks/useAdminVenuesData';
import { useUpsertVenue } from '@/hooks/useUpsertAgents';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminV3VenuesList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [city, setCity] = useState('all');
  const [completion, setCompletion] = useState('all');
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: 'duplicate' | 'deactivate';
    venue: any;
  }>({ open: false, action: 'duplicate', venue: null });

  const { venues, cities, isLoading, error, refetch } = useAdminVenuesData({
    search: search || undefined,
    status: status !== 'all' ? status : undefined,
    city: city !== 'all' ? city : undefined,
    completion: completion !== 'all' ? completion : undefined,
  });

  const upsertVenue = useUpsertVenue();

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

  const handleDuplicate = (venue: any) => {
    setActionDialog({ open: true, action: 'duplicate', venue });
  };

  const handleDeactivate = (venue: any) => {
    setActionDialog({ open: true, action: 'deactivate', venue });
  };

  const executeAction = async () => {
    if (!actionDialog.venue) return;

    try {
      if (actionDialog.action === 'duplicate') {
        // Create a duplicate with modified name and slug
        const duplicateData = {
          ...actionDialog.venue,
          id: undefined, // Remove ID to create new record
          name: `${actionDialog.venue.name} (Cópia)`,
          slug: undefined, // Let the system generate a new slug
          created_at: undefined,
          updated_at: undefined,
        };
        
        await upsertVenue.mutateAsync(duplicateData);
        toast.success("Local duplicado com sucesso!");
      } else {
        // Deactivate/activate venue
        const newStatus = actionDialog.venue.status === 'active' ? 'inactive' : 'active';
        const { error } = await supabase
          .from('venues')
          .update({ status: newStatus })
          .eq('id', actionDialog.venue.id);

        if (error) throw error;
        
        toast.success(`Local ${newStatus === 'inactive' ? 'desativado' : 'ativado'} com sucesso!`);
      }
      
      refetch(); // Refresh the data
      setActionDialog({ open: false, action: 'duplicate', venue: null });
    } catch (error) {
      console.error("Error executing action:", error);
      toast.error(`Erro ao ${actionDialog.action === 'duplicate' ? 'duplicar' : 'alterar status do'} local`);
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
              completion={completion}
              onCompletionChange={setCompletion}
              cities={cities || []}
            />
          </CardContent>
        </Card>

        {/* Content */}
        {isLoading ? (
          <VenueTableSkeleton />
        ) : (
          <Card>
            <CardContent className="p-0">
              <AdminVenueTable
                venues={venues || []}
                onDuplicate={handleDuplicate}
                onDeactivate={handleDeactivate}
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

      <VenueActionDialog
        open={actionDialog.open}
        onOpenChange={(open) => 
          setActionDialog(prev => ({ ...prev, open }))
        }
        action={actionDialog.action}
        venueName={actionDialog.venue?.name || ''}
        isActive={actionDialog.venue?.status === 'active'}
        onConfirm={executeAction}
      />
    </AdminPageWrapper>
  );
};

export default AdminV3VenuesList;