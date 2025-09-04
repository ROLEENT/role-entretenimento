import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText, Users, Calendar, TrendingUp, Plus, Target, Zap } from "lucide-react";

export function EventIntegrationSummary() {
  const navigate = useNavigate();

  const integrationStatus = {
    newEventsSystem: {
      title: "Sistema de Eventos V3",
      description: "EventCreateWizard com 6 passos e validação progressiva",
      status: "completed",
      progress: 100,
      features: [
        "✅ Wizard de 6 passos (Básico, Data/Local, Lineup, Mídia, Links, Revisão)",
        "✅ Validação progressiva com Zod",
        "✅ Auto-slug generation",
        "✅ Busca assíncrona de venues",
        "✅ Preview em tempo real",
        "✅ Integração com eventsApi"
      ]
    },
    eventCards: {
      title: "EventCardV3 com Highlight Variations",
      description: "Cards responsivos com suporte a destaques e vitrines",
      status: "completed", 
      progress: 100,
      features: [
        "✅ Variações por highlight_type (none, curatorial, vitrine)",
        "✅ Múltiplos layouts (default, compact, grid, featured)",
        "✅ Animações Framer Motion",
        "✅ Responsive design",
        "✅ Badges de status e preço"
      ]
    },
    publishChecklist: {
      title: "Sistema de Checklist de Publicação",
      description: "Validação automática de completude de eventos",
      status: "completed",
      progress: 100,
      features: [
        "✅ Categorias: Obrigatório, Recomendado, SEO, Avançado",
        "✅ Progresso visual por categoria",
        "✅ Widget compacto para sidebar",
        "✅ Indicadores de prioridade",
        "✅ Validação para publicação"
      ]
    },
    adminIntegration: {
      title: "Integração Admin V3",
      description: "Páginas administrativas atualizadas",
      status: "completed",
      progress: 100,
      features: [
        "✅ AdminV3EventsDashboard com stats",
        "✅ AdminV3EventsCreateEdit com wizard",
        "✅ Substituição de AdminEventFormV3",
        "✅ Navegação integrada",
        "✅ Feedback visual melhorado"
      ]
    },
    publicIntegration: {
      title: "Integração Páginas Públicas",
      description: "Agenda e páginas públicas com novos componentes",
      status: "completed",
      progress: 100,
      features: [
        "✅ AgendaCidade com EventCardV3",
        "✅ Adaptadores para dados legacy",
        "✅ EventGrid responsivo",
        "✅ Manutenção da funcionalidade existente",
        "✅ SEO preservado"
      ]
    },
    cssSystem: {
      title: "Sistema de Design CSS",
      description: "Estilos para highlight variations e estados",
      status: "completed",
      progress: 100,
      features: [
        "✅ Classes para highlight variations",
        "✅ Animações de hover e transições",
        "✅ Status colors (draft, published, etc)",
        "✅ Checklist priority colors",
        "✅ Dark mode support"
      ]
    }
  };

  const overallProgress = Object.values(integrationStatus).reduce((sum, item) => sum + item.progress, 0) / Object.keys(integrationStatus).length;

  const benefits = [
    {
      icon: Target,
      title: "Estrutura Unificada",
      description: "Sistema único para criação e edição de eventos com nova estrutura de banco de dados"
    },
    {
      icon: Zap,
      title: "UX Melhorada", 
      description: "Wizard intuitivo de 6 passos com validação em tempo real e preview"
    },
    {
      icon: TrendingUp,
      title: "Escalabilidade",
      description: "Suporte a lineup estruturado, partners, performances e artistas visuais"
    },
    {
      icon: Users,
      title: "Gestão Avançada",
      description: "Checklist de publicação, status tracking e analytics integrados"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Fase 7: Integração Completa</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Sistema de eventos V3 totalmente integrado e operacional
        </p>
        
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{Math.round(overallProgress)}%</div>
            <div className="text-sm text-muted-foreground">Concluído</div>
          </div>
          <Progress value={overallProgress} className="w-48" />
        </div>

        <Badge variant="default" className="mb-6 text-base px-4 py-2">
          ✅ Integração Finalizada
        </Badge>
      </div>

      {/* Integration Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(integrationStatus).map(([key, item]) => (
          <Card key={key} className="relative overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <Badge 
                  variant={item.status === 'completed' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {item.status === 'completed' ? '✅ Completo' : '🟡 Em Progresso'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span>{item.progress}%</span>
                </div>
                <Progress value={item.progress} />
              </div>
              
              <div className="space-y-2">
                {item.features.map((feature, index) => (
                  <div key={index} className="text-xs text-muted-foreground">
                    {feature}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Benefícios da Nova Implementação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <benefit.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximos Passos Recomendados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <h4 className="font-medium">Migração de Dados Legacy</h4>
                <p className="text-sm text-muted-foreground">
                  Migrar eventos existentes de agenda_itens para a nova tabela events
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <h4 className="font-medium">Testes de Performance</h4>
                <p className="text-sm text-muted-foreground">
                  Validar performance com volume real de dados e usuários
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <h4 className="font-medium">Treinamento de Usuários</h4>
                <p className="text-sm text-muted-foreground">
                  Capacitar equipe administrativa no novo sistema
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">4</div>
              <div>
                <h4 className="font-medium">Monitoramento</h4>
                <p className="text-sm text-muted-foreground">
                  Implementar métricas e alertas para acompanhar saúde do sistema
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <Button 
              onClick={() => navigate("/admin-v3/eventos")}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Testar Sistema Novo
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate("/agenda")}
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              Ver Agenda Pública
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}