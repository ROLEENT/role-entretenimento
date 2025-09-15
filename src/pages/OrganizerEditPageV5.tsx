import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminV3Guard } from '@/components/AdminV3Guard';
import { AdminV3Header } from '@/components/AdminV3Header';
import { AdminV3Breadcrumb } from '@/components/AdminV3Breadcrumb';
import { OrganizerFormV5 } from '@/components/v5/forms/OrganizerFormV5';

export default function OrganizerEditPageV5() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id !== 'novo';

  const { data: organizer, isLoading } = useQuery({
    queryKey: ['organizer', id],
    queryFn: async () => {
      if (!isEditing) return null;
      const { data, error } = await supabase
        .from('organizers')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  const handleSuccess = () => {
    navigate('/admin-v3/agentes/organizadores');
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
            { label: 'Organizadores', path: '/admin-v3/agentes/organizadores' },
            { label: isEditing ? 'Editar Organizador' : 'Novo Organizador' },
          ]}
        />

        <OrganizerFormV5 initialData={organizer || undefined} onSuccess={handleSuccess} backUrl="/admin-v3/agentes/organizadores" />
      </div>
    </AdminV3Guard>
  );
}