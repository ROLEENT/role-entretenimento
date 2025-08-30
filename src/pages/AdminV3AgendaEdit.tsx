import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminV3Guard } from '@/components/AdminV3Guard';
import { AdminV3Header } from '@/components/AdminV3Header';
import { AdminV3Breadcrumb } from '@/components/AdminV3Breadcrumb';
import { AgendaForm } from '@/components/AgendaForm';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminV3AgendaEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agendaData, setAgendaData] = useState<any>(null);
  
  useEffect(() => {
    const loadAgendaData = async () => {
      if (!id) {
        setError('ID do item não fornecido');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // TODO: Replace with actual API call to GET /api/agenda/:id
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - replace with actual API response
        const mockData = {
          id,
          title: 'Evento de Teste',
          slug: 'evento-de-teste',
          city: 'sao-paulo',
          visibility_type: 'curadoria',
          status: 'draft',
          artists_names: ['Artista 1', 'Artista 2'],
          priority: 0,
          tags: [],
          noindex: false,
          patrocinado: false,
          focal_point_x: 0.5,
          focal_point_y: 0.5,
        };
        
        setAgendaData(mockData);
      } catch (error) {
        console.error('Error loading agenda data:', error);
        setError('Erro ao carregar dados do item');
      } finally {
        setLoading(false);
      }
    };
    
    loadAgendaData();
  }, [id]);
  
  const handleRetry = () => {
    setError(null);
    window.location.reload();
  };
  
  if (loading) {
    return (
      <AdminV3Guard>
        <div className="min-h-screen bg-background">
          <AdminV3Header />
          <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <AdminV3Breadcrumb 
                items={[
                  { label: 'Agenda', path: '/admin-v3/agenda' },
                  { label: 'Editar' }
                ]}
              />
              
              <Card>
                <CardContent className="p-8">
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <LoadingSpinner />
                    <p className="text-muted-foreground">Carregando dados do item...</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AdminV3Guard>
    );
  }
  
  if (error) {
    return (
      <AdminV3Guard>
        <div className="min-h-screen bg-background">
          <AdminV3Header />
          <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <AdminV3Breadcrumb 
                items={[
                  { label: 'Agenda', path: '/admin-v3/agenda' },
                  { label: 'Editar' }
                ]}
              />
              
              <Card className="border-destructive/50 bg-destructive/10">
                <CardContent className="p-8 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <AlertTriangle className="h-12 w-12 text-destructive" />
                    <div>
                      <h3 className="text-lg font-semibold text-destructive mb-2">
                        Erro ao carregar item
                      </h3>
                      <p className="text-sm text-destructive/80 mb-4">
                        {error}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handleRetry} className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Tentar novamente
                      </Button>
                      <Button variant="outline" onClick={() => navigate('/admin-v3/agenda')}>
                        Voltar para Agenda
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AdminV3Guard>
    );
  }

  return (
    <AdminV3Guard>
      <div className="min-h-screen bg-background">
        <AdminV3Header />
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Breadcrumb */}
            <AdminV3Breadcrumb 
              items={[
                { label: 'Agenda', path: '/admin-v3/agenda' },
                { label: 'Editar' }
              ]}
            />
            
            {/* AgendaForm with loaded data */}
            <AgendaForm mode="edit" agendaId={id} />
          </div>
        </div>
      </div>
    </AdminV3Guard>
  );
}