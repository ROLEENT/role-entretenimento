import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { useEventManagement } from '@/hooks/useEventManagement';
import { Calendar, MapPin, DollarSign, Eye, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { withAdminAuth } from '@/components/withAdminAuth';

function AdminEventsIndex() {
  const navigate = useNavigate();
  const { getEvents, deleteEvent, loading } = useEventManagement();
  
  const [events, setEvents] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });

  useEffect(() => {
    fetchEvents();
  }, [pagination]);

  const fetchEvents = async (searchTerm = '', filters = {}) => {
    const data = await getEvents({ ...filters, search: searchTerm });
    setEvents(data || []);
  };

  const handleDelete = async (eventId: string) => {
    await deleteEvent(eventId);
    fetchEvents();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Ativo</Badge>;
      case 'draft':
        return <Badge variant="secondary">Rascunho</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      case 'completed':
        return <Badge variant="outline">Finalizado</Badge>;
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
        year: 'numeric'
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
      key: 'date_start',
      label: 'Data',
      render: (item: any) => (
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2" />
          {formatDate(item.date_start)}
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Local',
      render: (item: any) => (
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2" />
          <span className="truncate">{item.city}, {item.state}</span>
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

  const filters = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: '', label: 'Todos os status' },
        { value: 'active', label: 'Ativo' },
        { value: 'draft', label: 'Rascunho' },
        { value: 'cancelled', label: 'Cancelado' },
        { value: 'completed', label: 'Finalizado' },
      ],
    },
    {
      key: 'city',
      label: 'Cidade',
      type: 'select' as const,
      options: [
        { value: '', label: 'Todas as cidades' },
        { value: 'São Paulo', label: 'São Paulo' },
        { value: 'Rio de Janeiro', label: 'Rio de Janeiro' },
        { value: 'Belo Horizonte', label: 'Belo Horizonte' },
        { value: 'Salvador', label: 'Salvador' },
        { value: 'Brasília', label: 'Brasília' },
        { value: 'Fortaleza', label: 'Fortaleza' },
        { value: 'Recife', label: 'Recife' },
        { value: 'Curitiba', label: 'Curitiba' },
        { value: 'Porto Alegre', label: 'Porto Alegre' },
        { value: 'Goiânia', label: 'Goiânia' },
      ],
    },
  ];

  const actions = [
    {
      type: 'view' as const,
      label: 'Visualizar',
      href: (item: any) => `/evento/${item.id}`,
    },
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
      filters={filters}
      actions={actions}
      loading={loading}
      onSearch={fetchEvents}
      onFilter={fetchEvents}
      createButton={{
        label: 'Novo Evento',
        href: '/admin-v2/events/create',
      }}
    />
  );
}

export default withAdminAuth(AdminEventsIndex, 'editor');