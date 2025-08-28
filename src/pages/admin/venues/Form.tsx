import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminForm } from '@/components/admin/AdminForm';
import { venueSchema } from '@/lib/venueSchema';
import { useVenueManagement } from '@/hooks/useVenueManagement';
import { withAdminAuth } from '@/components/withAdminAuth';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'file' | 'array' | 'email' | 'url' | 'number' | 'datetime-local';
  placeholder?: string;
  description?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  section?: string;
  defaultOptions?: string[];
}

interface VenueFormProps {
  mode: 'create' | 'edit';
}

function VenueForm({ mode }: VenueFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { createVenue, updateVenue, getVenue, isCreating, isUpdating } = useVenueManagement();

  const { data: venue, isLoading: isLoadingVenue } = mode === 'edit' && id 
    ? getVenue(id) 
    : { data: null, isLoading: false };

  const handleSubmit = async (data: any) => {
    try {
      if (mode === 'create') {
        await createVenue(data);
      } else if (id) {
        await updateVenue({ id, data });
      }
      navigate('/admin-v2/venues');
    } catch (error) {
      console.error('Error submitting venue:', error);
    }
  };

  const handleCancel = () => {
    navigate('/admin-v2/venues');
  };

  const venueFormFields: FormField[] = [
    // Required Fields Section
    {
      name: 'name',
      label: 'Nome do Local',
      type: 'text',
      required: true,
      placeholder: 'Ex: Bar do João',
      section: 'required'
    },
    {
      name: 'type',
      label: 'Tipo de Local',
      type: 'select',
      required: true,
      options: [
        { value: 'bar', label: 'Bar' },
        { value: 'clube', label: 'Clube' },
        { value: 'casa_de_shows', label: 'Casa de Shows' },
        { value: 'teatro', label: 'Teatro' },
        { value: 'galeria', label: 'Galeria' },
        { value: 'espaco_cultural', label: 'Espaço Cultural' },
        { value: 'restaurante', label: 'Restaurante' }
      ],
      section: 'required'
    },
    {
      name: 'address',
      label: 'Endereço',
      type: 'text',
      required: true,
      placeholder: 'Rua das Flores, 123',
      section: 'required'
    },
    {
      name: 'city',
      label: 'Cidade',
      type: 'text',
      required: true,
      placeholder: 'São Paulo',
      section: 'required'
    },
    {
      name: 'state',
      label: 'Estado',
      type: 'text',
      required: true,
      placeholder: 'SP',
      section: 'required'
    },
    {
      name: 'zip_code',
      label: 'CEP',
      type: 'text',
      required: true,
      placeholder: '01234-567',
      section: 'required'
    },
    {
      name: 'maps_url',
      label: 'URL do Google Maps',
      type: 'url',
      required: true,
      placeholder: 'https://maps.google.com/...',
      section: 'required'
    },
    {
      name: 'instagram',
      label: 'Instagram',
      type: 'text',
      required: true,
      placeholder: '@nomedolocal',
      section: 'required'
    },
    {
      name: 'booking_email',
      label: 'Email para Contato',
      type: 'email',
      required: true,
      placeholder: 'contato@local.com',
      section: 'required'
    },
    {
      name: 'booking_whatsapp',
      label: 'WhatsApp',
      type: 'text',
      required: true,
      placeholder: '(11) 99999-9999',
      section: 'required'
    },
    {
      name: 'cover_image_url',
      label: 'Imagem de Capa',
      type: 'file',
      section: 'required'
    },
    // Complementary Fields Section
    {
      name: 'capacity',
      label: 'Capacidade',
      type: 'number',
      placeholder: '150',
      section: 'complementary'
    },
    {
      name: 'min_age',
      label: 'Idade Mínima',
      type: 'number',
      placeholder: '18',
      section: 'complementary'
    },
    {
      name: 'website_url',
      label: 'Site',
      type: 'url',
      placeholder: 'https://www.local.com',
      section: 'complementary'
    },
    {
      name: 'opening_hours',
      label: 'Horário de Funcionamento',
      type: 'textarea',
      placeholder: 'Seg a Sex: 18h às 2h, Sáb e Dom: 16h às 3h',
      section: 'complementary'
    },
    {
      name: 'resources',
      label: 'Recursos Disponíveis',
      type: 'array',
      defaultOptions: [
        'Som profissional',
        'Iluminação',
        'Palco',
        'Camarim',
        'Estacionamento',
        'Wi-Fi gratuito',
        'Bar/Lanchonete',
        'Segurança',
        'Ar condicionado'
      ],
      section: 'complementary'
    },
    {
      name: 'accessibility',
      label: 'Acessibilidade',
      type: 'array',
      defaultOptions: [
        'Rampa de acesso',
        'Banheiro adaptado',
        'Elevador',
        'Piso tátil',
        'Intérprete de Libras',
        'Audio descrição',
        'Vagas especiais'
      ],
      section: 'complementary'
    },
    {
      name: 'photo_policy',
      label: 'Política de Fotos',
      type: 'textarea',
      placeholder: 'Política do local sobre fotografias e filmagens...',
      section: 'complementary'
    },
    // Internal Fields Section
    {
      name: 'responsible_name',
      label: 'Nome do Responsável',
      type: 'text',
      placeholder: 'João Silva',
      section: 'internal'
    },
    {
      name: 'priority',
      label: 'Prioridade',
      type: 'number',
      placeholder: '0',
      description: 'Número para ordenação (maior = maior prioridade)',
      section: 'internal'
    },
    {
      name: 'internal_notes',
      label: 'Anotações Internas',
      type: 'textarea',
      placeholder: 'Observações internas sobre o local...',
      section: 'internal'
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Ativo' },
        { value: 'inactive', label: 'Inativo' }
      ],
      section: 'internal'
    }
  ];

  const formSections = [
    {
      title: 'Campos Obrigatórios',
      description: 'Informações essenciais do local',
      fields: venueFormFields.filter(f => f.section === 'required').map(f => f.name)
    },
    {
      title: 'Campos Complementares',
      description: 'Informações adicionais sobre o local',
      fields: venueFormFields.filter(f => f.section === 'complementary').map(f => f.name)
    },
    {
      title: 'Campos Internos',
      description: 'Informações para uso interno da equipe',
      fields: venueFormFields.filter(f => f.section === 'internal').map(f => f.name)
    }
  ];

  if (mode === 'edit' && isLoadingVenue) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AdminForm
      title={mode === 'create' ? 'Criar Novo Local' : 'Editar Local'}
      description={mode === 'create' 
        ? 'Adicione um novo local onde eventos podem acontecer'
        : 'Edite as informações do local'
      }
      schema={venueSchema}
      fields={venueFormFields}
      sections={formSections}
      defaultValues={venue || undefined}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isCreating || isUpdating}
      submitLabel={mode === 'create' ? 'Criar Local' : 'Salvar Alterações'}
    />
  );
}

export default withAdminAuth(VenueForm, 'editor');