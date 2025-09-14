import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminV3Guard } from '@/components/AdminV3Guard';
import { AdminV3Header } from '@/components/AdminV3Header';
import { AdminV3Breadcrumb } from '@/components/AdminV3Breadcrumb';
import { EventFormV5 } from '@/components/v5/forms/EventFormV5';

export default function EventEditPageV5() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id !== 'novo';

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      if (!isEditing) return null;
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      
      // Convert dates for form
      if (data.start_utc) data.start_utc = new Date(data.start_utc);
      if (data.end_utc) data.end_utc = new Date(data.end_utc);
      
      return data;
    },
    enabled: isEditing,
  });

  const handleSuccess = () => {
    navigate('/admin-v3/eventos');
  };

  if (isEditing && isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <AdminV3Guard>
      <AdminV3Header />
      <div className="container mx-auto py-6">
        <AdminV3Breadcrumb
          items={[
            { label: 'Dashboard', path: '/admin-v3' },
            { label: 'Eventos', path: '/admin-v3/eventos' },
            { label: isEditing ? 'Editar Evento' : 'Novo Evento' },
          ]}
        />

        <EventFormV5 
          initialData={event || undefined} 
          onSuccess={handleSuccess} 
          backUrl="/admin-v3/eventos" 
        />
      </div>
    </AdminV3Guard>
  );
}