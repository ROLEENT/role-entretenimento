import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { useEventsManagement } from '@/hooks/useEventsManagement';
import { Calendar, MapPin, DollarSign, Eye, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { withAdminAuth } from '@/components/withAdminAuth';

function AdminEventsList() {
  const navigate = useNavigate();
  const { events, deleteEvent, togglePublished, isLoading, isDeleting } = useEventsManagement();

  const handleDelete = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleTogglePublished = async (eventId: string) => {
    try {
      await togglePublished(eventId);
    } catch (error) {
      console.error('Error toggling event status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default">Publicado</Badge>;
      case 'draft':
        return <Badge variant="secondary">Rascunho</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (date: string) => {
    if (!date) return 'Data não definida';
    try {
      return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data inválida';
    }
  };

  const formatPrice = (min?: number, max?: number) => {
    if (min === 0) return 'Gratuito';
    if (!min) return '-';
    return max && max !== min 
      ? `R$ ${min} - R$ ${max}` 
      : `R$ ${min}`;
  };

  const columns = [
    {
      key: 'title',
      label: 'Evento',
      render: (item: any) => (
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{item.title}</p>
          <div className="flex items-center gap-2 mt-1">
            {getStatusBadge(item.status || 'draft')}
          </div>
        </div>
      ),
    },
    {
      key: 'start_at',
      label: 'Data de Início',
      render: (item: any) => (
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2" />
          {formatDate(item.start_at)}
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Local',
      render: (item: any) => (
        <div className="text-sm">
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="truncate">{item.city}, {item.state}</span>
          </div>
          {item.venues && (
            <p className="text-xs text-muted-foreground truncate mt-1">
              {item.venues.name}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'organizer',
      label: 'Organizador',
      render: (item: any) => (
        <div className="text-sm text-muted-foreground">
          {item.organizers ? item.organizers.name : '-'}
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Preço',
      render: (item: any) => (
        <div className="flex items-center text-sm text-muted-foreground">
          <DollarSign className="h-4 w-4 mr-2" />
          {formatPrice(item.price_min, item.price_max)}
        </div>
      ),
    },
  ];

  const actions = [
    {
      type: 'edit' as const,
      label: 'Editar',
      href: (item: any) => `/admin-v2/events/edit/${item.id}`,
    },
    {
      type: 'delete' as const,
      label: 'Excluir',
      onClick: (item: any) => handleDelete(item.id),
    },
  ];

  return (
    <AdminDataTable
      title="Eventos"
      description="Gerenciar eventos do sistema"
      data={events}
      columns={columns}
      actions={actions}
      loading={isLoading}
      createButton={{
        label: 'Novo Evento',
        href: '/admin-v2/events/create',
      }}
    />
  );
}

export default withAdminAuth(AdminEventsList, 'editor');