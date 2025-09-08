import React, { useState } from 'react';
import { HighlightBadge } from './HighlightBadge';
import { CurationInfoBar } from './CurationInfoBar';
import { CurationChips } from './CurationChips';
import { CurationCriteriaDrawer } from './CurationCriteriaDrawer';
import { EventSEO } from './EventSEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function CurationSystemDemo() {
  const [showDrawer, setShowDrawer] = useState(false);

  // Dados simulados do evento "Hate Moss & Vulto no Caos"
  const mockEvent = {
    id: '4aa8f4d0-77cf-470c-87e8-113979f93024',
    title: 'Hate Moss (Ita) & Vulto no Caos',
    highlight_type: 'editorial',
    is_sponsored: false,
    curation_score: 7,
    curation_notes: 'Show raro em POA. Combina pós punk, eletrônica sombria e cena local. Artista internacional de qualidade com proposta coerente.',
    summary: 'Show raro em POA combinando pós-punk, eletrônica sombria e cena local.',
    city: 'Porto Alegre',
    location_name: 'Caos',
    curatorial_criteria: {
      cultural_relevance: { checked: true, note: 'A Hate Moss tem trajetória internacional e é uma das bandas ítalo-brasileiras mais interessantes do circuito pós-punk/electroclash atual.' },
      lineup: { checked: true, note: 'A banda é consistente na sua identidade sombria e experimental, e a presença do Resp3x soma diversidade com rock, punk e indie.' },
      city_connection: { checked: true, note: 'É a estreia da Hate Moss em Curitiba, num lugar simbólico para a cena independente.' },
      engagement_potential: { checked: true, note: 'Há narrativa de "primeira vez na cidade", o que gera expectativa e compartilhamento.' }
    }
  };

  const mockCriteria = [
    { key: 'relevancia', status: 'met', is_primary: true },
    { key: 'qualidade', status: 'met', is_primary: true },
    { key: 'diversidade', status: 'partial', is_primary: false },
    { key: 'impacto', status: 'met', is_primary: true },
    { key: 'coerencia', status: 'met', is_primary: false },
    { key: 'experiencia', status: 'met', is_primary: false },
    { key: 'tecnica', status: 'met', is_primary: false },
    { key: 'acessibilidade', status: 'partial', is_primary: false }
  ];

  const mockSponsoredEvent = {
    ...mockEvent,
    title: 'Festival Eletrônico Premium',
    highlight_type: 'sponsored',
    is_sponsored: true,
    curation_score: 0,
    curation_notes: null
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <EventSEO event={mockEvent} highlightType={mockEvent.highlight_type} />
      
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Sistema de Curadoria - Demo</h1>
        <p className="text-muted-foreground">
          Demonstração do sistema de diferenciação entre eventos curatoriais e vitrine cultural.
        </p>
      </div>

      {/* Seção: Badges */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Badges de Destaque</h2>
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Badge Curatorial */}
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-medium mb-4">Destaque Curatorial</h3>
            <div className="space-y-3">
              <HighlightBadge type="editorial" />
              <HighlightBadge type="curatorial" />
              <div className="text-sm text-muted-foreground">
                Cor: #c77dff • Outline • Estrela vazada • Tooltip: "Selecionado pela curadoria do ROLÊ"
              </div>
            </div>
          </div>

          {/* Badge Vitrine */}
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-medium mb-4">Vitrine Cultural</h3>
            <div className="space-y-3">
              <HighlightBadge type="sponsored" isSponsored={true} />
              <HighlightBadge type="vitrine" isSponsored={true} />
              <div className="text-sm text-muted-foreground">
                Cor: #c77dff • Sólido • Megafone • Sub-rótulo "patrocinado"
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção: Barras Contextuais */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Barras Contextuais</h2>
        <div className="space-y-4">
          
          {/* Barra Curatorial */}
          <div>
            <h3 className="text-lg font-medium mb-2">Evento Curatorial</h3>
            <CurationInfoBar 
              type="editorial" 
              onShowCriteria={() => setShowDrawer(true)}
            />
          </div>

          {/* Barra Vitrine */}
          <div>
            <h3 className="text-lg font-medium mb-2">Evento Vitrine</h3>
            <CurationInfoBar type="sponsored" />
          </div>
        </div>
      </section>

      {/* Seção: Chips de Critérios */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Chips de Critérios</h2>
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-medium mb-3">
            Este evento se destaca por 
            <Badge variant="outline" className="ml-2 text-xs">
              {mockEvent.curation_score} de 8 critérios
            </Badge>
          </h3>
          <CurationChips 
            chips={['relevancia', 'qualidade', 'impacto']} 
            variant="secondary"
            maxChips={3}
          />
          <p className="text-sm text-muted-foreground mt-3 bg-muted/50 p-3 rounded-lg border-l-2 border-[#c77dff]">
            {mockEvent.curation_notes}
          </p>
        </div>
      </section>

      {/* Seção: Drawer Completo */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Drawer de Critérios</h2>
        <div className="p-6 border rounded-lg">
          <Button onClick={() => setShowDrawer(true)}>
            Abrir Drawer de Critérios Completo
          </Button>
          <div className="text-sm text-muted-foreground mt-2">
            Mostra os 8 critérios detalhados, score, notas da curadoria e link para política.
          </div>
        </div>
      </section>

      {/* Drawer */}
      <CurationCriteriaDrawer
        open={showDrawer}
        onOpenChange={setShowDrawer}
        eventTitle={mockEvent.title}
        curatorialCriteria={mockEvent.curatorial_criteria}
      />

      {/* Seção: Especificações Técnicas */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Especificações Técnicas</h2>
        <div className="grid gap-6 md:grid-cols-2">
          
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-medium mb-3">Mapeamento de Tipos</h3>
            <div className="space-y-2 text-sm">
              <div><code>editorial</code> → <code>curatorial</code></div>
              <div><code>sponsored</code> → <code>vitrine</code></div>
              <div className="pt-2 text-muted-foreground">
                Sistema mantém compatibilidade com dados existentes
              </div>
            </div>
          </div>

          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-medium mb-3">SEO e Transparência</h3>
            <div className="space-y-2 text-sm">
              <div>✅ Meta tags com aviso "Publicidade"</div>
              <div>✅ Schema.org com additionalType</div>
              <div>✅ Data attributes para tracking</div>
              <div>✅ Contraste e acessibilidade</div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção: 8 Critérios */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Os 8 Critérios de Curadoria</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { key: 'relevancia', label: 'Relevância Cultural', desc: 'Diálogo real com a cena da cidade' },
            { key: 'qualidade', label: 'Qualidade Artística', desc: 'Entrega consistente do line-up e proposta' },
            { key: 'diversidade', label: 'Diversidade e Inclusão', desc: 'Representatividade no palco e na pista' },
            { key: 'impacto', label: 'Impacto Local', desc: 'Contribuição para a comunidade e circulação' },
            { key: 'coerencia', label: 'Coerência Curatorial', desc: 'Conceito, narrativa e execução alinhados' },
            { key: 'experiencia', label: 'Experiência do Público', desc: 'Cuidado com acolhimento e fluidez' },
            { key: 'tecnica', label: 'Técnica e Produção', desc: 'Som, luz, segurança e operação' },
            { key: 'acessibilidade', label: 'Acessibilidade', desc: 'Informações claras, estrutura e preço justo' }
          ].map((criterion) => (
            <div key={criterion.key} className="p-4 border rounded-lg">
              <h4 className="font-medium text-sm">{criterion.label}</h4>
              <p className="text-xs text-muted-foreground mt-1">{criterion.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}