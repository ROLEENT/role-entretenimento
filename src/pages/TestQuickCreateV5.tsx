import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArtistSelectAsync, 
  VenueSelectAsync, 
  OrganizerSelectAsync,
  EventSelectAsync 
} from '@/components/v5/forms';

interface TestForm {
  artist_id: string;
  venue_id: string; 
  organizer_id: string;
  event_id: string;
}

export default function TestQuickCreateV5() {
  const form = useForm<TestForm>({
    defaultValues: {
      artist_id: '',
      venue_id: '',
      organizer_id: '',
      event_id: '',
    }
  });

  const onSubmit = (data: TestForm) => {
    console.log('Form data:', data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quick Create Modals V5 - Teste
          </h1>
          <p className="text-gray-600">
            Teste os modais de criação rápida integrados aos comboboxes V5
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Formulário de Teste</CardTitle>
            <CardDescription>
              Use os comboboxes abaixo para testar a funcionalidade de criação rápida.
              Clique em "Criar novo" para abrir o modal de criação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ArtistSelectAsync
                    name="artist_id"
                    label="Artista"
                    placeholder="Buscar ou criar artista..."
                    enableQuickCreate={true}
                  />

                  <VenueSelectAsync
                    name="venue_id"
                    label="Local"
                    placeholder="Buscar ou criar local..."
                    enableQuickCreate={true}
                  />

                  <OrganizerSelectAsync
                    name="organizer_id"
                    label="Organizador"
                    placeholder="Buscar ou criar organizador..."
                    enableQuickCreate={true}
                  />

                  <EventSelectAsync
                    name="event_id"
                    label="Evento"
                    placeholder="Buscar evento..."
                  />
                </div>

                <div className="flex justify-end">
                  <button 
                    type="submit"
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Testar Submit
                  </button>
                </div>
              </form>
            </FormProvider>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Como Testar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">1. Busca Existente</h4>
              <p className="text-sm text-gray-600">
                Digite no campo para buscar itens existentes no banco de dados.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">2. Criação Rápida</h4>
              <p className="text-sm text-gray-600">
                Clique em "Criar novo" para abrir o modal de criação rápida.
                Preencha os campos essenciais e o item será criado e selecionado automaticamente.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">3. Validações</h4>
              <p className="text-sm text-gray-600">
                O modal valida campos obrigatórios e verifica se o slug já existe.
                Aguarde a verificação do slug antes de salvar.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}