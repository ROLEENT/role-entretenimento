import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminForm } from '@/components/admin/AdminForm';
import { eventSchema } from '@/lib/eventSchema';
import { useEventsManagement } from '@/hooks/useEventsManagement';
import { useVenueManagement } from '@/hooks/useVenueManagement';
import { useOrganizerManagement } from '@/hooks/useOrganizerManagement';
import { withAdminAuth } from '@/components/withAdminAuth';

interface EventFormProps {
  mode: 'create' | 'edit';
}

function EventForm({ mode }: EventFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { createEvent, updateEvent, getEvent, isCreating, isUpdating } = useEventsManagement();
  const { venues } = useVenueManagement();
  const { organizers } = useOrganizerManagement();

  const { data: event, isLoading: isLoadingEvent } = mode === 'edit' && id 
    ? getEvent(id) 
    : { data: null, isLoading: false };

  const cities = [
    'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador', 
    'Brasília', 'Fortaleza', 'Recife', 'Curitiba', 'Porto Alegre', 'Goiânia'
  ];

  const states = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'DF', 'CE', 'PE', 'GO'];

  const handleSubmit = async (data: any) => {
    try {
      if (mode === 'create') {
        await createEvent(data);
      } else if (id) {
        await updateEvent({ id, data });
      }
      navigate('/admin-v2/events');
    } catch (error) {
      console.error('Error submitting event:', error);
    }
  };

  const handleCancel = () => {
    navigate('/admin-v2/events');
  };

  const fields = [
    {
      name: 'title',
      label: 'Título do Evento',
      type: 'text' as const,
      required: true,
      placeholder: 'Ex: Festival de Rock',
    },
    {
      name: 'description',
      label: 'Descrição',
      type: 'textarea' as const,
      required: true,
      placeholder: 'Descreva o evento...',
      maxLength: 500,
    },
    {
      name: 'cover_url',
      label: 'Imagem de Capa',
      type: 'file' as const,
      bucket: 'events',
    },
    {
      name: 'start_at',
      label: 'Data/Hora de Início',
      type: 'datetime-local' as const,
      required: true,
    },
    {
      name: 'end_at',
      label: 'Data/Hora de Fim',
      type: 'datetime-local' as const,
    },
    {
      name: 'venue_id',
      label: 'Local',
      type: 'select' as const,
      required: true,
      options: venues.map(venue => ({ 
        value: venue.id, 
        label: `${venue.name} - ${venue.address || venue.city}` 
      })),
    },
    {
      name: 'city',
      label: 'Cidade',
      type: 'select' as const,
      required: true,
      options: cities.map(city => ({ value: city, label: city })),
    },
    {
      name: 'state',
      label: 'Estado',
      type: 'select' as const,
      required: true,
      options: states.map(state => ({ value: state, label: state })),
    },
    {
      name: 'external_url',
      label: 'Link de Ingressos',
      type: 'url' as const,
      placeholder: 'https://exemplo.com/ingressos',
    },
    {
      name: 'organizer_id',
      label: 'Organizador',
      type: 'select' as const,
      options: [
        { value: '', label: 'Selecionar organizador (opcional)' },
        ...organizers.map(org => ({ 
          value: org.id, 
          label: org.name 
        }))
      ],
    },
    {
      name: 'price_min',
      label: 'Preço Mínimo (R$)',
      type: 'number' as const,
      min: 0,
      step: 0.01,
    },
    {
      name: 'price_max',
      label: 'Preço Máximo (R$)',
      type: 'number' as const,
      min: 0,
      step: 0.01,
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'draft', label: 'Rascunho' },
        { value: 'published', label: 'Publicado' },
      ],
      defaultValue: 'draft',
    },
  ];

  const sections = [
    {
      title: 'Informações Básicas',
      fields: ['title', 'description', 'cover_url', 'status'],
    },
    {
      title: 'Data e Local',
      fields: ['start_at', 'end_at', 'venue_id', 'city', 'state'],
    },
    {
      title: 'Detalhes Adicionais',
      fields: ['external_url', 'organizer_id', 'price_min', 'price_max'],
    },
  ];

  if (mode === 'edit' && isLoadingEvent) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AdminForm
      title={mode === 'create' ? 'Criar Evento' : 'Editar Evento'}
      schema={eventSchema}
      fields={fields}
      sections={sections}
      defaultValues={event || undefined}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isCreating || isUpdating}
    />
  );
}

export default withAdminAuth(EventForm, 'editor');