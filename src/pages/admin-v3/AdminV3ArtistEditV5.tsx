import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminV3Guard } from '@/components/AdminV3Guard';
import { AdminV3Header } from '@/components/AdminV3Header';
import { AdminV3Breadcrumb } from '@/components/AdminV3Breadcrumb';
import { ArtistFormV5 } from '@/components/v5/forms/ArtistFormV5';

export default function AdminV3ArtistEditV5() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id !== "novo";

  const { data: artist, isLoading } = useQuery({
    queryKey: ["artist", id],
    queryFn: async () => {
      if (!isEditing) return null;
      
      const { data, error } = await supabase
        .from("artists")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  const handleSuccess = (data: any) => {
    navigate("/admin-v3/artistas");
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
            { label: "Dashboard", path: "/admin-v3" },
            { label: "Artistas", path: "/admin-v3/artistas" },
            { label: isEditing ? "Editar Artista" : "Novo Artista" },
          ]}
        />

        <ArtistFormV5
          initialData={artist || undefined}
          onSuccess={handleSuccess}
          backUrl="/admin-v3/artistas"
        />
      </div>
    </AdminV3Guard>
  );
}