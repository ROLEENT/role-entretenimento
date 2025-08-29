import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminV3Guard } from '@/components/AdminV3Guard';
import { AdminV3Header } from '@/components/AdminV3Header';
import { AdminV3Breadcrumb } from '@/components/AdminV3Breadcrumb';
import { ArtistForm } from '@/components/ArtistForm';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Artist {
  id: string;
  stage_name: string;
  slug: string;
  artist_type: string;
  status: string;
  city?: string;
  instagram?: string;
  booking_email: string;
  booking_whatsapp: string;
  bio_short: string;
  profile_image_url: string;
}

function ArtistEditContent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadArtist() {
      if (!id) {
        setError('ID do artista não fornecido');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('artists')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            setError('Artista não encontrado');
          } else {
            throw fetchError;
          }
          return;
        }

        setArtist(data);
      } catch (err) {
        console.error('Erro ao carregar artista:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        toast({
          title: "Erro",
          description: "Falha ao carregar dados do artista",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }

    loadArtist();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-muted-foreground">Carregando dados do artista...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/admin-v3/artists')}
          >
            Voltar para lista
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!artist) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Artista não encontrado</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/admin-v3/artists')}
          >
            Voltar para lista
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return <ArtistForm initialData={artist} mode="edit" />;
}

export default function AdminV3ArtistsEdit() {
  const { id } = useParams<{ id: string }>();
  
  return (
    <AdminV3Guard>
      <div className="min-h-screen bg-background">
        <AdminV3Header />
        <div className="pt-16 p-6">
          <div className="max-w-4xl mx-auto">
            <AdminV3Breadcrumb 
              items={[
                { label: 'Dashboard', path: '/admin-v3' },
                { label: 'Artistas', path: '/admin-v3/artists' },
                { label: 'Editar' }
              ]} 
            />
            <ArtistEditContent />
          </div>
        </div>
      </div>
    </AdminV3Guard>
  );
}