import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import AdminEventForm from '@/components/admin/agenda/AdminEventForm';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';

export default function AdminV3AgendaEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['agenda-item', id],
    queryFn: async () => {
      if (!id) throw new Error('ID não fornecido');
      
      const { data, error } = await supabase
        .from('agenda_itens')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const breadcrumbs = [
    { label: 'Dashboard', path: '/admin-v3' },
    { label: 'Agenda', path: '/admin-v3/agenda' },
    { label: 'Editar Evento' }
  ];

  const handleSave = () => {
    navigate('/admin-v3/agenda');
  };

  const handleCancel = () => {
    navigate('/admin-v3/agenda');
  };

  if (isLoading) {
    return (
      <AdminPageWrapper
        title="Carregando..."
        description="Carregando dados do evento"
        breadcrumbs={breadcrumbs}
      >
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Carregando evento...</span>
          </CardContent>
        </Card>
      </AdminPageWrapper>
    );
  }

  if (error || !event) {
    return (
      <AdminPageWrapper
        title="Erro"
        description="Erro ao carregar evento"
        breadcrumbs={breadcrumbs}
      >
        <Card>
          <CardContent className="flex items-center justify-center py-12 text-destructive">
            <AlertCircle className="w-8 h-8" />
            <span className="ml-2">
              {error?.message || 'Evento não encontrado'}
            </span>
          </CardContent>
        </Card>
      </AdminPageWrapper>
    );
  }

  // Transform the data to match the form schema
  const initialData = {
    id: event.id,
    title: event.title || '',
    slug: event.slug || '',
    status: (event.status === 'published' ? 'published' : 'draft') as "draft" | "published",
    city_id: event.city_id || '',
    venue_id: event.venue_id || null,
    organizer_id: event.organizer_id || null,
    starts_at: event.starts_at || '',
    ends_at: event.end_at || '',
    price_min: event.price_min || null,
    price_max: event.price_max || null,
    age_rating: event.age_rating || null,
    artists: [], // Changed from lineup to match schema
    excerpt: event.summary || null,
    content: event.summary || null,
    links: {}, // Changed from array to object to match schema
    cover_url: event.cover_url || null,
    gallery: [],
    seo_title: event.meta_title || null,
    seo_description: event.meta_description || null,
  };

  return (
    <AdminPageWrapper
      title="Editar Evento"
      description="Edite as informações do evento"
      breadcrumbs={breadcrumbs}
    >
      <AdminEventForm 
        initialData={initialData}
        eventId={id}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </AdminPageWrapper>
  );
}