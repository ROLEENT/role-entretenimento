import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminForm } from '@/components/admin/AdminForm';
import { eventSchema, EventFormData } from '@/lib/eventSchema';
import { useEventManagement } from '@/hooks/useEventManagement';
import { withAdminAuth } from '@/components/withAdminAuth';

interface EventFormProps {
  mode: 'create' | 'edit';
}

function EventForm({ mode }: EventFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { createEvent, updateEvent, getEvent, loading } = useEventManagement();

  const cities = [
    'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador', 
    'Brasília', 'Fortaleza', 'Recife', 'Curitiba', 'Porto Alegre', 'Goiânia'
  ];

  const states = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'DF', 'CE', 'PE', 'GO'];

  const handleSubmit = async (data: any) => {
    try {
      const eventData = data as unknown as EventFormData;
      if (mode === 'create') {
        await createEvent(eventData);
      } else if (id) {
        await updateEvent(id, eventData);
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
      name: 'venue_name',
      label: 'Local',
      type: 'text' as const,
      required: true,
      placeholder: 'Ex: Teatro Municipal',
    },
    {
      name: 'venue_address',
      label: 'Endereço do Local',
      type: 'text' as const,
      placeholder: 'Ex: Rua das Flores, 123',
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
      name: 'organizer_name',
      label: 'Organizador',
      type: 'text' as const,
      placeholder: 'Ex: Produtora Musical XYZ',
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
      name: 'category',
      label: 'Categoria',
      type: 'select' as const,
      options: [
        { value: 'show', label: 'Show' },
        { value: 'festival', label: 'Festival' },
        { value: 'festa', label: 'Festa' },
        { value: 'teatro', label: 'Teatro' },
        { value: 'cinema', label: 'Cinema' },
        { value: 'exposicao', label: 'Exposição' },
        { value: 'workshop', label: 'Workshop' },
        { value: 'outros', label: 'Outros' },
      ],
    },
    {
      name: 'tags',
      label: 'Tags',
      type: 'array' as const,
      placeholder: 'Adicionar tag...',
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'active', label: 'Ativo' },
        { value: 'draft', label: 'Rascunho' },
        { value: 'cancelled', label: 'Cancelado' },
        { value: 'completed', label: 'Finalizado' },
      ],
      defaultValue: 'active',
    },
  ];

  const sections = [
    {
      title: 'Informações Básicas',
      fields: ['title', 'description', 'cover_url', 'category', 'status'],
    },
    {
      title: 'Data e Local',
      fields: ['start_at', 'end_at', 'venue_name', 'venue_address', 'city', 'state'],
    },
    {
      title: 'Detalhes Adicionais',
      fields: ['external_url', 'organizer_name', 'price_min', 'price_max', 'tags'],
    },
  ];

  return (
    <AdminForm
      title={mode === 'create' ? 'Criar Evento' : 'Editar Evento'}
      schema={eventSchema}
      fields={fields}
      sections={sections}
      defaultValues={mode === 'edit' && id ? undefined : {
        title: '',
        description: '',
        cover_url: '',
        start_at: '',
        end_at: '',
        venue_name: '',
        venue_address: '',
        city: '',
        state: '',
        external_url: '',
        organizer_name: '',
        price_min: 0,
        price_max: 0,
        category: '',
        tags: [],
        status: 'active',
      }}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={loading}
    />
  );
}

export default withAdminAuth(EventForm, 'editor');