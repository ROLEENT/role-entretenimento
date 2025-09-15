import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminV3Guard } from '@/components/AdminV3Guard';
import { AdminV3Header } from '@/components/AdminV3Header';
import { AdminV3Breadcrumb } from '@/components/AdminV3Breadcrumb';
import { MagazineFormV5 } from '@/components/v5/forms/MagazineFormV5';

export default function MagazineEditPageV5() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id !== 'novo';

  const { data: magazinePost, isLoading } = useQuery({
    queryKey: ['magazine_post', id],
    queryFn: async () => {
      if (!isEditing) return null;
      const { data, error } = await supabase
        .from('magazine_posts')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  const handleSuccess = () => {
    navigate('/admin-v3/revista');
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
            { label: 'Revista', path: '/admin-v3/revista' },
            { label: isEditing ? 'Editar Artigo' : 'Novo Artigo' },
          ]}
        />

        <MagazineFormV5 initialData={magazinePost || undefined} onSuccess={handleSuccess} />
      </div>
    </AdminV3Guard>
  );
}