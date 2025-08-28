import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { useVenueManagement } from '@/hooks/useVenueManagement';
import { MapPin, Mail, Phone, Instagram, Users, Eye, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { withAdminAuth } from '@/components/withAdminAuth';

function VenuesList() {
  const navigate = useNavigate();
  const { venues, deleteVenue, isLoading } = useVenueManagement();

  const handleDelete = async (venueId: string) => {
    try {
      await deleteVenue(venueId);
    } catch (error) {
      console.error('Error deleting venue:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Ativo</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inativo</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeLabels = {
      bar: 'Bar',
      clube: 'Clube',
      casa_de_shows: 'Casa de Shows',
      teatro: 'Teatro',
      galeria: 'Galeria',
      espaco_cultural: 'Espaço Cultural',
      restaurante: 'Restaurante'
    };
    return <Badge variant="outline">{typeLabels[type as keyof typeof typeLabels] || type}</Badge>;
  };

  const columns = [
    {
      key: 'name',
      label: 'Local',
      render: (item: any) => (
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{item.name}</p>
          <div className="flex items-center gap-2 mt-1">
            {getTypeBadge(item.type)}
            {getStatusBadge(item.status || 'active')}
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Localização',
      render: (item: any) => (
        <div className="text-sm">
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="truncate">{item.city}, {item.state}</span>
          </div>
          {item.address && (
            <p className="text-xs text-muted-foreground truncate mt-1">
              {item.address}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'capacity',
      label: 'Capacidade',
      render: (item: any) => (
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-2" />
          {item.capacity || '-'}
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contato',
      render: (item: any) => (
        <div className="text-sm space-y-1">
          {item.booking_email && (
            <div className="flex items-center text-muted-foreground">
              <Mail className="h-3 w-3 mr-2" />
              <span className="truncate text-xs">{item.booking_email}</span>
            </div>
          )}
          {item.booking_whatsapp && (
            <div className="flex items-center text-muted-foreground">
              <Phone className="h-3 w-3 mr-2" />
              <span className="text-xs">{item.booking_whatsapp}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'social',
      label: 'Social',
      render: (item: any) => (
        <div className="text-sm">
          {item.instagram && (
            <div className="flex items-center text-muted-foreground">
              <Instagram className="h-4 w-4 mr-2" />
              <span className="text-xs">{item.instagram}</span>
            </div>
          )}
        </div>
      ),
    },
  ];

  const actions = [
    {
      type: 'edit' as const,
      label: 'Editar',
      href: (item: any) => `/admin-v2/venues/edit/${item.id}`,
    },
    {
      type: 'delete' as const,
      label: 'Excluir',
      onClick: (item: any) => handleDelete(item.id),
    },
  ];

  return (
    <AdminDataTable
      title="Locais"
      description="Gerenciar bares, casas de show e espaços culturais"
      data={venues}
      columns={columns}
      actions={actions}
      loading={isLoading}
      createButton={{
        label: 'Novo Local',
        href: '/admin-v2/venues/create',
      }}
    />
  );
}

export default withAdminAuth(VenuesList, 'editor');