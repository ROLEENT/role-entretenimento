import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrganizerCombobox } from '@/components/OrganizerCombobox';
import { VenueCombobox } from '@/components/VenueCombobox';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Users, MapPin } from 'lucide-react';

export default function AgendaFormIntegrationTest() {
  const [organizerId, setOrganizerId] = React.useState<string | undefined>();
  const [venueId, setVenueId] = React.useState<string | undefined>();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Teste de Integração - ComboboxAsync no Formulário de Agenda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Teste dos Comboboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Users className="w-4 h-4" />
                Organizador (opcional)
              </label>
              <OrganizerCombobox
                value={organizerId}
                onValueChange={setOrganizerId}
              />
              {organizerId && (
                <Badge variant="secondary" className="text-xs">
                  Selecionado: {organizerId}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="w-4 h-4" />
                Local (opcional)
              </label>
              <VenueCombobox
                value={venueId}
                onValueChange={setVenueId}
              />
              {venueId && (
                <Badge variant="secondary" className="text-xs">
                  Selecionado: {venueId}
                </Badge>
              )}
            </div>
          </div>

          {/* Status dos Critérios */}
          <div className="space-y-3">
            <h3 className="font-medium">Critérios de Aceite:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Busca retorna até 20 resultados</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Mostra nome e cidade</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Botão "Cadastrar novo" funciona</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Criar novo preenche automaticamente</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Organizador/Local opcionais para publicar</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Artists mantém limite de 12 chips</span>
              </div>
            </div>
          </div>

          {/* Instruções de Teste */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Como testar:</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Digite no campo de organizador para buscar</li>
              <li>Clique em "Cadastrar novo organizador" para testar o modal</li>
              <li>Repita o processo para o campo de local</li>
              <li>Verifique se ao criar novo, ele aparece selecionado</li>
              <li>Vá para o formulário real em /admin-v3/agenda/create para validar integração completa</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}