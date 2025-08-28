import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminForm } from '@/components/admin/AdminForm';
import { organizerSchema } from '@/lib/organizerSchema';
import { useOrganizerManagement } from '@/hooks/useOrganizerManagement';
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

interface OrganizerFormProps {
  mode: 'create' | 'edit';
}

function OrganizerForm({ mode }: OrganizerFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { createOrganizer, updateOrganizer, getOrganizer, isCreating, isUpdating } = useOrganizerManagement();

  const { data: organizer, isLoading: isLoadingOrganizer } = mode === 'edit' && id 
    ? getOrganizer(id) 
    : { data: null, isLoading: false };

  const handleSubmit = async (data: any) => {
    try {
      if (mode === 'create') {
        await createOrganizer(data);
      } else if (id) {
        await updateOrganizer({ id, data });
      }
      navigate('/admin-v2/organizers');
    } catch (error) {
      console.error('Error submitting organizer:', error);
    }
  };

  const handleCancel = () => {
    navigate('/admin-v2/organizers');
  };

  const organizerFormFields: FormField[] = [
    // Required Fields Section
    {
      name: 'name',
      label: 'Nome',
      type: 'text',
      required: true,
      placeholder: 'Ex: Produtora Music Wave',
      section: 'required'
    },
    {
      name: 'type',
      label: 'Tipo',
      type: 'select',
      required: true,
      options: [
        { value: 'organizador', label: 'Organizador' },
        { value: 'produtora', label: 'Produtora' },
        { value: 'coletivo', label: 'Coletivo' },
        { value: 'selo', label: 'Selo' }
      ],
      section: 'required'
    },
    {
      name: 'city',
      label: 'Cidade Principal',
      type: 'text',
      required: true,
      placeholder: 'Porto Alegre',
      section: 'required'
    },
    {
      name: 'contact_email',
      label: 'Email de Contato',
      type: 'email',
      required: true,
      placeholder: 'contato@organizador.com',
      section: 'required'
    },
    {
      name: 'contact_whatsapp',
      label: 'WhatsApp',
      type: 'text',
      required: true,
      placeholder: '(11) 99999-9999',
      section: 'required'
    },
    {
      name: 'instagram',
      label: 'Instagram',
      type: 'text',
      required: true,
      placeholder: '@organizador',
      section: 'required'
    },
    // Complementary Fields Section
    {
      name: 'logo_url',
      label: 'Logo',
      type: 'file',
      section: 'complementary'
    },
    {
      name: 'cover_image_url',
      label: 'Imagem de Capa',
      type: 'file',
      section: 'complementary'
    },
    {
      name: 'bio_short',
      label: 'Bio Curta',
      type: 'textarea',
      placeholder: 'Descrição curta para cards e listagens...',
      description: 'Máximo 300 caracteres',
      section: 'complementary'
    },
    {
      name: 'bio_long',
      label: 'Bio Longa',
      type: 'textarea',
      placeholder: 'Descrição completa para página de perfil...',
      description: 'Máximo 1500 caracteres',
      section: 'complementary'
    },
    {
      name: 'website_url',
      label: 'Website',
      type: 'url',
      placeholder: 'https://www.organizador.com',
      section: 'complementary'
    },
    {
      name: 'portfolio_url',
      label: 'Portfólio',
      type: 'url',
      placeholder: 'https://portfolio.organizador.com',
      section: 'complementary'
    },
    {
      name: 'cities_active',
      label: 'Cidades de Atuação',
      type: 'array',
      defaultOptions: [
        'Porto Alegre',
        'São Paulo',
        'Rio de Janeiro',
        'Florianópolis',
        'Curitiba',
        'Belo Horizonte',
        'Salvador',
        'Brasília',
        'Recife',
        'Fortaleza'
      ],
      section: 'complementary'
    },
    {
      name: 'genres',
      label: 'Gêneros Musicais',
      type: 'array',
      defaultOptions: [
        'Rock',
        'Pop',
        'Eletrônica',
        'Hip Hop',
        'Reggae',
        'Folk',
        'Jazz',
        'Blues',
        'Country',
        'Funk',
        'MPB',
        'Sertanejo',
        'Forró',
        'Pagode',
        'Samba'
      ],
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
      name: 'responsible_role',
      label: 'Cargo do Responsável',
      type: 'text',
      placeholder: 'Diretor',
      section: 'internal'
    },
    {
      name: 'booking_whatsapp',
      label: 'WhatsApp Booking',
      type: 'text',
      placeholder: '(11) 88888-8888',
      section: 'internal'
    },
    {
      name: 'booking_email',
      label: 'Email Booking',
      type: 'email',
      placeholder: 'booking@organizador.com',
      section: 'internal'
    },
    {
      name: 'internal_notes',
      label: 'Anotações Internas',
      type: 'textarea',
      placeholder: 'Observações internas sobre o organizador...',
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
      description: 'Informações essenciais do organizador',
      fields: organizerFormFields.filter(f => f.section === 'required').map(f => f.name)
    },
    {
      title: 'Campos Complementares',
      description: 'Informações adicionais sobre o organizador',
      fields: organizerFormFields.filter(f => f.section === 'complementary').map(f => f.name)
    },
    {
      title: 'Campos Internos',
      description: 'Informações para uso interno da equipe',
      fields: organizerFormFields.filter(f => f.section === 'internal').map(f => f.name)
    }
  ];

  if (mode === 'edit' && isLoadingOrganizer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AdminForm
      title={mode === 'create' ? 'Criar Novo Organizador' : 'Editar Organizador'}
      description={mode === 'create' 
        ? 'Adicione um novo organizador de eventos'
        : 'Edite as informações do organizador'
      }
      schema={organizerSchema}
      fields={organizerFormFields}
      sections={formSections}
      defaultValues={organizer || undefined}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isCreating || isUpdating}
      submitLabel={mode === 'create' ? 'Criar Organizador' : 'Salvar Alterações'}
    />
  );
}

export default withAdminAuth(OrganizerForm, 'editor');