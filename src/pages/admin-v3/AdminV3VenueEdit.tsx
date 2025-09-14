import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminV3Guard } from '@/components/AdminV3Guard';
import { AdminV3Header } from '@/components/AdminV3Header';
import { AdminV3Breadcrumb } from '@/components/AdminV3Breadcrumb';
import { VenueFormV5 } from '@/components/v5/forms/VenueFormV5';

export default function AdminV3VenueEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id !== 'novo';

  const { data: venue, isLoading } = useQuery({
    queryKey: ['venue', id],
    queryFn: async () => {
      if (!isEditing) return null;
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  const handleSuccess = () => {
    navigate('/admin-v3/venues');
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
            { label: 'Locais', path: '/admin-v3/venues' },
            { label: isEditing ? 'Editar Local' : 'Novo Local' },
          ]}
        />

        <VenueFormV5 initialData={venue || undefined} onSuccess={handleSuccess} backUrl="/admin-v3/venues" />
      </div>
    </AdminV3Guard>
  );
}