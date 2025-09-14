import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MagazineFormV5 } from "@/components/v5/forms/MagazineFormV5";
import { Loader2 } from "lucide-react";

export default function AdminV3MagazineEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: magazine, isLoading, error } = useQuery({
    queryKey: ['magazine', id],
    queryFn: async () => {
      if (!id) throw new Error('ID não fornecido');
      
      const { data, error } = await supabase
        .from('magazine_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleSuccess = () => {
    navigate("/admin-v3/magazine");
  };

  const handleCancel = () => {
    navigate("/admin-v3/magazine");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando revista...</span>
        </div>
      </div>
    );
  }

  if (error || !magazine) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">
            Erro ao carregar revista
          </h2>
          <p className="text-muted-foreground mt-2">
            {error?.message || 'Revista não encontrada'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <MagazineFormV5
        initialData={magazine}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}