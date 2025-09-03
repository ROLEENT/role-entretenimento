import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventCardV3 } from "@/components/events/EventCardV3";
import { EventGrid } from "@/components/events/EventGrid";
import { PublishChecklist } from "@/components/events/PublishChecklist";
import { ChecklistWidget } from "@/components/events/ChecklistWidget";
import { getEventDefaults } from "@/schemas/eventSchema";

// Sample event data for testing
const sampleEvents = [
  {
    id: "1",
    title: "Festival de Música Eletrônica",
    subtitle: "Uma noite inesquecível de música e tecnologia",
    summary: "O maior festival de música eletrônica da região, com os principais DJs nacionais e internacionais.",
    city: "São Paulo",
    location_name: "Arena Digital",
    date_start: "2024-03-15T22:00:00Z",
    date_end: "2024-03-16T06:00:00Z",
    doors_open_utc: "2024-03-15T21:00:00Z",
    image_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=300&fit=crop",
    price_min: 80,
    price_max: 150,
    currency: "BRL",
    highlight_type: "vitrine" as const,
    is_sponsored: true,
    age_rating: "18" as const,
    genres: ["Eletrônica", "Techno", "House"],
    slug: "festival-musica-eletronica-2024",
    ticket_url: "https://example.com/tickets",
    lineup: [
      { name: "DJ Premium", is_headliner: true },
      { name: "Tech Master", is_headliner: true },
      { name: "Bass Drop", is_headliner: false }
    ]
  },
  {
    id: "2", 
    title: "Noite do Jazz",
    subtitle: "Clássicos e novidades do jazz brasileiro",
    summary: "Uma noite especial dedicada ao melhor do jazz nacional, com artistas renomados.",
    city: "Rio de Janeiro",
    location_name: "Blue Note RJ",
    date_start: "2024-03-20T21:00:00Z",
    image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=300&fit=crop",
    price_min: 45,
    price_max: 80,
    highlight_type: "destaque" as const,
    age_rating: "L" as const,
    genres: ["Jazz", "MPB"],
    slug: "noite-do-jazz",
    lineup: [
      { name: "João Bosco", is_headliner: true },
      { name: "Maria Rita", is_headliner: false }
    ]
  },
  {
    id: "3",
    title: "Stand-up Comedy Night",
    summary: "Os melhores humoristas da cidade em uma noite divertida.",
    city: "Curitiba", 
    location_name: "Comedy Club",
    date_start: "2024-03-22T20:00:00Z",
    image_url: "https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?w=500&h=300&fit=crop",
    price_min: 25,
    price_max: 40,
    highlight_type: "none" as const,
    age_rating: "16" as const,
    genres: ["Comédia"],
    slug: "stand-up-comedy-night"
  }
];

export default function ComponentsTestPage() {
  const [selectedEvent, setSelectedEvent] = useState(sampleEvents[0]);
  const [checklistData, setChecklistData] = useState(getEventDefaults());

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Teste de Componentes V3</h1>
          <p className="text-lg text-muted-foreground">
            Demonstração dos novos componentes de eventos integrados
          </p>
          <Badge variant="default" className="text-base px-4 py-2">
            Fase 7: Integração Completa
          </Badge>
        </div>

        <Tabs defaultValue="cards" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cards">Event Cards</TabsTrigger>
            <TabsTrigger value="grid">Event Grid</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="widget">Widget</TabsTrigger>
          </TabsList>

          {/* Event Cards Test */}
          <TabsContent value="cards" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>EventCardV3 - Todas as Variações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Default Variant */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Variant: Default</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sampleEvents.map((event) => (
                      <EventCardV3
                        key={event.id}
                        event={event}
                        variant="default"
                        onClick={() => console.log("Clicked:", event.title)}
                      />
                    ))}
                  </div>
                </div>

                {/* Compact Variant */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Variant: Compact</h3>
                  <div className="space-y-3">
                    {sampleEvents.map((event) => (
                      <EventCardV3
                        key={event.id}
                        event={event}
                        variant="compact"
                        onClick={() => console.log("Clicked:", event.title)}
                      />
                    ))}
                  </div>
                </div>

                {/* Featured Variant */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Variant: Featured</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {sampleEvents.slice(0, 2).map((event) => (
                      <EventCardV3
                        key={event.id}
                        event={event}
                        variant="featured"
                        onClick={() => console.log("Clicked:", event.title)}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Event Grid Test */}
          <TabsContent value="grid" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>EventGrid - Layouts Responsivos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Grid 3 Colunas (Default)</h3>
                  <EventGrid
                    events={sampleEvents}
                    variant="default"
                    columns={3}
                    onEventClick={(event) => console.log("Grid clicked:", event.title)}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Grid Compacto (1 Coluna)</h3>
                  <EventGrid
                    events={sampleEvents}
                    variant="compact"
                    columns={1}
                    onEventClick={(event) => console.log("Grid clicked:", event.title)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Checklist Test */}
          <TabsContent value="checklist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>PublishChecklist - Sistema de Validação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Evento Incompleto</h3>
                    <PublishChecklist eventData={{
                      title: "Evento Teste",
                      city: "São Paulo"
                    }} />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Evento Completo</h3>
                    <PublishChecklist eventData={sampleEvents[0]} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Widget Test */}
          <TabsContent value="widget" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Conteúdo Principal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Este é um exemplo de como o ChecklistWidget aparece na sidebar
                      junto com o conteúdo principal da página.
                    </p>
                    
                    <div className="space-y-4">
                      <Button 
                        onClick={() => setChecklistData({ 
                          title: "Novo Evento", 
                          city: "São Paulo",
                          date_start: new Date().toISOString()
                        })}
                      >
                        Simular Evento Básico
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={() => setChecklistData(sampleEvents[0])}
                      >
                        Simular Evento Completo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">ChecklistWidget - Sidebar</h3>
                <ChecklistWidget
                  eventData={checklistData}
                  onItemClick={(itemId) => {
                    console.log("Focus field:", itemId);
                  }}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Integration Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notas de Integração</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold">✅ Funcionalidades Implementadas</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• EventCardV3 com 4 variações</li>
                  <li>• Highlight variations (none, destaque, vitrine)</li>
                  <li>• EventGrid responsivo</li>
                  <li>• PublishChecklist por categorias</li>
                  <li>• ChecklistWidget para sidebar</li>
                  <li>• Animações Framer Motion</li>
                  <li>• CSS system para cores e estados</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">🔄 Integração Realizada</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• AdminEventFormV3 → EventCreateWizard</li>
                  <li>• AgendaCidade com EventCardV3</li>
                  <li>• Adaptadores para dados legacy</li>
                  <li>• Admin V3 pages atualizadas</li>
                  <li>• Navegação preservada</li>
                  <li>• Feedback visual melhorado</li>
                </ul>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>Status:</strong> Fase 7 completa - Sistema totalmente integrado e pronto para produção.
                Todos os componentes estão funcionais e a migração de dados pode ser iniciada.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}