import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurationCriteriaDrawer } from '@/components/events/CurationCriteriaDrawer';
import { Badge } from '@/components/ui/badge';

// Mock data para teste
const mockCriteria = [
  { key: 'relevancia' as const, status: 'met' as const, is_primary: true },
  { key: 'qualidade' as const, status: 'met' as const, is_primary: true },
  { key: 'diversidade' as const, status: 'partial' as const, is_primary: false },
  { key: 'impacto' as const, status: 'met' as const, is_primary: false },
  { key: 'coerencia' as const, status: 'partial' as const, is_primary: true },
  { key: 'experiencia' as const, status: 'met' as const, is_primary: false },
  { key: 'tecnica' as const, status: 'na' as const, is_primary: false },
  { key: 'acessibilidade' as const, status: 'met' as const, is_primary: false },
];

const mockNotes = "Este evento destaca-se pela excelente curadoria musical que conecta artistas emergentes com nomes consolidados da cena eletrônica. A proposta curatorial demonstra profundo conhecimento da cultura local e consegue criar uma experiência única que dialoga com a diversidade cultural da cidade.";

export default function CurationDrawerTest() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Teste do Drawer de Curadoria</h1>
          <p className="text-muted-foreground mb-8">
            Teste o novo componente CurationCriteriaDrawer com funcionalidades mobile e desktop
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Componente CurationCriteriaDrawer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2">Funcionalidades Implementadas:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>✅ Drawer bottom no mobile, modal central no desktop</li>
                  <li>✅ Header fixo com título e botão fechar</li>
                  <li>✅ Footer fixo com botões de ação</li>
                  <li>✅ Conteúdo com scroll limitado (max-h: 80vh)</li>
                  <li>✅ Fechamento por múltiplas formas</li>
                  <li>✅ Safe area para iOS</li>
                  <li>✅ Focus trap e acessibilidade</li>
                  <li>✅ Swipe down para fechar (mobile)</li>
                  <li>✅ History.back() support</li>
                  <li>✅ Acordeão com critérios</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Critérios Mock:</h3>
                <div className="space-y-2">
                  {mockCriteria.map((criterion) => (
                    <div key={criterion.key} className="flex items-center gap-2">
                      <Badge 
                        variant={criterion.status === 'met' ? 'default' : 
                                criterion.status === 'partial' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {criterion.status === 'met' ? 'Atende' :
                         criterion.status === 'partial' ? 'Parcial' : 'N/A'}
                      </Badge>
                      <span className="text-sm">
                        {criterion.key}
                        {criterion.is_primary && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Destaque
                          </Badge>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Testes Recomendados:</h3>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <div>🔄 Abrir e fechar por botão X</div>
                <div>👆 Swipe down para fechar (mobile)</div>
                <div>⌨️ Tecla Esc para fechar</div>
                <div>🖱️ Click no backdrop para fechar</div>
                <div>◀️ Botão Voltar do navegador</div>
                <div>📱 Verificar safe area no iOS</div>
                <div>🎯 Testar focus trap</div>
                <div>📖 Testar com leitor de tela</div>
              </div>
            </div>

            <Button 
              onClick={() => setIsDrawerOpen(true)}
              className="w-full"
              size="lg"
            >
              Abrir Drawer de Curadoria
            </Button>
          </CardContent>
        </Card>

        <CurationCriteriaDrawer
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          eventTitle="Festival de Música Eletrônica - Summer Edition 2024"
          curatorialCriteria={{
            cultural_relevance: { checked: true, note: mockNotes },
            lineup: { checked: true, note: "Lineup diversificado e de qualidade" },
            diversity_inclusion: { checked: false, note: "Melhorar diversidade" }
          }}
        />
      </div>
    </div>
  );
}