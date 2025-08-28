import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminForm } from '@/components/admin/AdminForm';
import { eventSchema } from '@/lib/eventSchema';
import { useEventManagement, EventFormData } from '@/hooks/useEventManagement';
import { useVenueManagement } from '@/hooks/useVenueManagement';
import { useOrganizerManagement } from '@/hooks/useOrganizerManagement';
import { withAdminAuth } from '@/components/withAdminAuth';

interface EventFormProps {
  mode: 'create' | 'edit';
}

function EventForm({ mode }: EventFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { createEvent, updateEvent, getEvent, getArtists, loading } = useEventManagement();
  const { venues } = useVenueManagement();
  const { organizers } = useOrganizerManagement();
  
  const [artists, setArtists] = useState<any[]>([]);

  useEffect(() => {
    const fetchArtists = async () => {
      const artistsData = await getArtists();
      setArtists(artistsData);
    };
    fetchArtists();
  }, [getArtists]);

  const cities = [
    'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador', 
    'Brasília', 'Fortaleza', 'Recife', 'Curitiba', 'Porto Alegre', 'Goiânia'
  ];

  const states = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'DF', 'CE', 'PE', 'GO'];

  const handleSubmit = async (data: any) => {
    try {
      // Validate the form data using the schema first
      const validatedData = eventSchema.parse(data);
      
      // Transform to EventFormData format
      const eventData: EventFormData = {
        title: validatedData.title,
        description: validatedData.description,
        start_at: validatedData.start_at,
        city: validatedData.city,
        state: validatedData.state,
        venue_id: validatedData.venue_id,
        end_at: validatedData.end_at,
        organizer_id: validatedData.organizer_id,
        cover_url: validatedData.cover_url,
        external_url: validatedData.external_url,
        price_min: validatedData.price_min,
        price_max: validatedData.price_max,
        category: validatedData.category,
        tags: validatedData.tags,
        status: validatedData.status,
        instagram_post_url: validatedData.instagram_post_url,
        social_links: validatedData.social_links,
        benefits: validatedData.benefits,
        age_range: validatedData.age_range,
        observations: validatedData.observations,
        artist_ids: validatedData.artist_ids,
      };
      
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
      name: 'artist_ids',
      label: 'Artistas',
      type: 'multiselect' as const,
      options: artists.map(artist => ({ 
        value: artist.id, 
        label: artist.artist_name 
      })),
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
        { value: 'draft', label: 'Rascunho' },
        { value: 'active', label: 'Ativo/Publicado' },
        { value: 'cancelled', label: 'Cancelado' },
        { value: 'completed', label: 'Finalizado' },
      ],
      defaultValue: 'draft',
    },
  ];

  const sections = [
    {
      title: 'Informações Básicas',
      fields: ['title', 'description', 'cover_url', 'category', 'status'],
    },
    {
      title: 'Data e Local',
      fields: ['start_at', 'end_at', 'venue_id', 'city', 'state'],
    },
    {
      title: 'Detalhes Adicionais',
      fields: ['external_url', 'organizer_id', 'price_min', 'price_max', 'artist_ids', 'tags'],
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
        venue_id: '',
        city: '',
        state: '',
        external_url: '',
        organizer_id: '',
        price_min: 0,
        price_max: 0,
        category: '',
        artist_ids: [],
        tags: [],
        status: 'draft',
      }}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={loading}
    />
  );
}

export default withAdminAuth(EventForm, 'editor');