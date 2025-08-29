import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminV3Guard } from '@/components/AdminV3Guard';
import { AdminV3Header } from '@/components/AdminV3Header';
import { AdminV3Breadcrumb } from '@/components/AdminV3Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function AdminV3AgendaCreate() {
  const navigate = useNavigate();

  // Handle ESC key to cancel and go back to agenda
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        navigate('/admin-v3/agenda');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const handleCancel = () => {
    navigate('/admin-v3/agenda');
  };

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
                { label: 'Criar' }
              ]}
            />
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Criar Agenda</h1>
                <p className="text-muted-foreground">
                  Adicione um novo item à agenda
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleCancel}
                className="gap-2"
              >
                Cancelar
              </Button>
            </div>

            {/* Form Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Formulário de Criação</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground mb-2">
                    Carregando formulário…
                  </p>
                  <p className="text-sm text-muted-foreground max-w-md">
                    O componente AgendaForm será renderizado aqui quando estiver pronto.
                  </p>
                  
                  {/* Temporary actions */}
                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={handleCancel}>
                      Voltar para Agenda
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Keyboard Shortcuts Help */}
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 text-sm">Atalhos de teclado</h3>
                <div className="flex items-center gap-2 text-sm">
                  <kbd className="px-2 py-1 bg-background border rounded text-xs font-mono">ESC</kbd>
                  <span className="text-muted-foreground">Cancelar e voltar</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminV3Guard>
  );
}