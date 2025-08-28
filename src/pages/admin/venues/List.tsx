import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { useVenueManagement } from '@/hooks/useVenueManagement';
import { withAdminAuth } from '@/components/withAdminAuth';

interface Venue {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  status: string;
  capacity?: number;
  instagram?: string;
  created_at: string;
}

const typeLabels = {
  bar: 'Bar',
  clube: 'Clube',
  casa_de_shows: 'Casa de Shows',
  teatro: 'Teatro',
  galeria: 'Galeria',
  espaco_cultural: 'Espaço Cultural',
  restaurante: 'Restaurante',
};

function VenuesList() {
  const navigate = useNavigate();
  const { venues, isLoading, deleteVenue } = useVenueManagement();

  const columns = [
    {
      key: 'name',
      label: 'Nome',
      sortable: true,
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (value: any, venue: Venue) => typeLabels[venue.type as keyof typeof typeLabels] || venue.type,
    },
    {
      key: 'city',
      label: 'Cidade',
      sortable: true,
    },
    {
      key: 'address',
      label: 'Endereço',
    },
    {
      key: 'capacity',
      label: 'Capacidade',
      render: (value: any, venue: Venue) => venue.capacity || '-',
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: any, venue: Venue) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          venue.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {venue.status === 'active' ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
  ];

  const filters = [
    {
      key: 'type',
      label: 'Tipo de Local',
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
      onClick: (venue: Venue) => navigate(`/admin-v2/venues/edit/${venue.id}`),
    },
    {
      type: 'delete' as const,
      label: 'Excluir',
      onClick: (venue: Venue) => handleDelete(venue),
      variant: 'destructive' as const,
    },
  ];

  const handleDelete = async (venue: Venue) => {
    try {
      await deleteVenue(venue.id);
    } catch (error) {
      console.error('Erro ao excluir local:', error);
    }
  };

  return (
    <AdminDataTable
      title="Gerenciar Locais"
      description="Gerencie os locais onde os eventos acontecem"
      data={venues}
      columns={columns}
      filters={filters}
      actions={actions}
      loading={isLoading}
      searchPlaceholder="Buscar por nome, endereço ou cidade..."
      createButton={{
        label: "Novo Local",
        href: "/admin-v2/venues/create"
      }}
      emptyMessage="Nenhum local cadastrado. Comece adicionando seu primeiro local."
      onDelete={deleteVenue}
    />
  );
}

export default withAdminAuth(VenuesList, 'editor');