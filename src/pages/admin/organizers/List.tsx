import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { useOrganizerManagement } from '@/hooks/useOrganizerManagement';
import { withAdminAuth } from '@/components/withAdminAuth';

interface Organizer {
  id: string;
  name: string;
  type: string;
  city: string;
  contact_email: string;
  instagram?: string;
  website_url?: string;
  status: string;
  created_at: string;
}

const typeLabels = {
  organizador: 'Organizador',
  produtora: 'Produtora',
  coletivo: 'Coletivo',
  selo: 'Selo',
};

function OrganizersList() {
  const navigate = useNavigate();
  const { organizers, isLoading, deleteOrganizer } = useOrganizerManagement();

  const columns = [
    {
      key: 'name',
      label: 'Nome',
      sortable: true,
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (value: any, organizer: Organizer) => typeLabels[organizer.type as keyof typeof typeLabels] || organizer.type,
    },
    {
      key: 'city',
      label: 'Cidade',
      sortable: true,
    },
    {
      key: 'contact_email',
      label: 'Email',
    },
    {
      key: 'instagram',
      label: 'Instagram',
      render: (value: any, organizer: Organizer) => organizer.instagram || '-',
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: any, organizer: Organizer) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          organizer.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {organizer.status === 'active' ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
  ];

  const filters = [
    {
      key: 'type',
      label: 'Tipo',
      type: 'select' as const,
      options: Object.entries(typeLabels).map(([value, label]) => ({ value, label })),
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'active', label: 'Ativo' },
        { value: 'inactive', label: 'Inativo' },
      ],
    },
  ];

  const actions = [
    {
      type: 'edit' as const,
      label: 'Editar',
      onClick: (organizer: Organizer) => navigate(`/admin-v2/organizers/edit/${organizer.id}`),
    },
    {
      type: 'delete' as const,
      label: 'Excluir',
      onClick: (organizer: Organizer) => handleDelete(organizer),
      variant: 'destructive' as const,
    },
  ];

  const handleDelete = async (organizer: Organizer) => {
    if (window.confirm(`Tem certeza que deseja excluir o organizador "${organizer.name}"?`)) {
      try {
        await deleteOrganizer(organizer.id);
      } catch (error) {
        console.error('Erro ao excluir organizador:', error);
      }
    }
  };

  return (
    <AdminDataTable
      title="Gerenciar Organizadores"
      description="Gerencie os organizadores de eventos da plataforma"
      data={organizers}
      columns={columns}
      filters={filters}
      actions={actions}
      loading={isLoading}
      searchPlaceholder="Buscar por nome, email ou cidade..."
      createButton={{
        label: "Novo Organizador",
        href: "/admin-v2/organizers/create"
      }}
      emptyMessage="Nenhum organizador cadastrado. Comece adicionando seu primeiro organizador."
      onDelete={async (id: string) => {
        await deleteOrganizer(id);
      }}
    />
  );
}

export default withAdminAuth(OrganizersList, 'editor');