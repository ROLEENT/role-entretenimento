import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { useOrganizerManagement } from '@/hooks/useOrganizerManagement';
import { MapPin, Mail, Phone, Instagram, Eye, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { withAdminAuth } from '@/components/withAdminAuth';

function OrganizersList() {
  const navigate = useNavigate();
  const { organizers, deleteOrganizer, isLoading } = useOrganizerManagement();

  const handleDelete = async (organizerId: string) => {
    try {
      await deleteOrganizer(organizerId);
    } catch (error) {
      console.error('Error deleting organizer:', error);
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
      organizador: 'Organizador',
      produtora: 'Produtora',
      coletivo: 'Coletivo',
      selo: 'Selo'
    };
    return <Badge variant="outline">{typeLabels[type as keyof typeof typeLabels] || type}</Badge>;
  };

  const columns = [
    {
      key: 'name',
      label: 'Organizador',
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
      key: 'city',
      label: 'Cidade',
      render: (item: any) => (
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2" />
          {item.city}
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contato',
      render: (item: any) => (
        <div className="text-sm space-y-1">
          {item.contact_email && (
            <div className="flex items-center text-muted-foreground">
              <Mail className="h-3 w-3 mr-2" />
              <span className="truncate text-xs">{item.contact_email}</span>
            </div>
          )}
          {item.contact_whatsapp && (
            <div className="flex items-center text-muted-foreground">
              <Phone className="h-3 w-3 mr-2" />
              <span className="text-xs">{item.contact_whatsapp}</span>
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
    {
      key: 'priority',
      label: 'Prioridade',
      render: (item: any) => (
        <div className="text-sm text-muted-foreground">
          {item.priority || 0}
        </div>
      ),
    },
  ];

  const actions = [
    {
      type: 'edit' as const,
      label: 'Editar',
      href: (item: any) => `/admin-v2/organizers/edit/${item.id}`,
    },
    {
      type: 'delete' as const,
      label: 'Excluir',
      onClick: (item: any) => handleDelete(item.id),
    },
  ];

  return (
    <AdminDataTable
      title="Organizadores"
      description="Gerenciar organizadores, produtoras e coletivos"
      data={organizers}
      columns={columns}
      actions={actions}
      loading={isLoading}
      createButton={{
        label: 'Novo Organizador',
        href: '/admin-v2/organizers/create',
      }}
    />
  );
}

export default withAdminAuth(OrganizersList, 'editor');