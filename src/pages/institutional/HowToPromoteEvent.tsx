import React from 'react';
import { InstitutionalPageWrapper } from '@/components/layouts/InstitutionalPageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Target, Megaphone, BarChart, ArrowRight } from 'lucide-react';

const HowToPromoteEvent = () => {
  const promotionTypes = [
    {
      icon: Calendar,
      title: "Curadoria Editorial",
      description: "[PLACEHOLDER] Como eventos entram na curadoria editorial semanal do ROLÊ.",
      features: ["Destaque gratuito", "Reach orgânico", "Credibilidade editorial"]
    },
    {
      icon: Target,
      title: "Promoção Paga",
      description: "[PLACEHOLDER] Opções de promoção paga para maior alcance e visibilidade.",
      features: ["Reach direcionado", "Analytics detalhado", "Suporte dedicado"]
    },
    {
      icon: Megaphone,
      title: "Parcerias",
      description: "[PLACEHOLDER] Oportunidades de parceria estratégica com o ROLÊ.",
      features: ["Colaboração editorial", "Cross-promotion", "Eventos especiais"]
    }
  ];

  const tips = [
    {
      title: "Timing perfeito",
      description: "[PLACEHOLDER] Quando e como submeter eventos para máxima visibilidade."
    },
    {
      title: "Conteúdo visual",
      description: "[PLACEHOLDER] Importância de fotos e vídeos de qualidade para destaque."
    },
    {
      title: "Descrição envolvente",
      description: "[PLACEHOLDER] Como escrever descrições que chamam atenção."
    },
    {
      title: "Engajamento",
      description: "[PLACEHOLDER] Estratégias para aumentar engajamento antes e durante evento."
    }
  ];

  return (
    <InstitutionalPageWrapper
      title="Como divulgar seu evento"
      description="Guia completo para organizadores maximizarem o alcance e impacto dos seus eventos no ROLÊ."
      seoTitle="Como divulgar evento | ROLÊ ENTRETENIMENTO"
      seoDescription="Aprenda as melhores estratégias para promover seu evento no ROLÊ. Guia para organizadores e produtores culturais."
      lastUpdated="10 de setembro de 2025"
    >
      <div className="space-y-12">
        {/* Introduction */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">Alcance a audiência certa</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                [PLACEHOLDER] Texto sobre a importância de uma estratégia bem planejada para 
                divulgação de eventos culturais e como o ROLÊ pode amplificar seu alcance.
              </p>
            </div>
            
            <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-6">
              <p className="text-sm text-muted-foreground">
                <strong>Conteúdo será inserido na Fase 2:</strong><br/>
                • Estratégias de marketing cultural<br/>
                • Cases de sucesso na plataforma<br/>
                • Métricas e resultados esperados
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Promotion Types */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center">Tipos de promoção</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {promotionTypes.map((type, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <type.icon className="h-6 w-6 text-primary" />
                    {type.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {type.description}
                  </p>
                  <ul className="space-y-2">
                    {type.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-6 w-6 text-primary" />
              Dicas para maximizar resultados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {tips.map((tip, index) => (
                <div key={index} className="p-4 border border-border rounded-lg">
                  <h3 className="font-semibold mb-2">{tip.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {tip.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Process */}
        <Card>
          <CardHeader>
            <CardTitle>Processo de submissão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="font-semibold mb-3">Eventos gratuitos (curadoria editorial)</h3>
                <p className="text-muted-foreground mb-4">
                  [PLACEHOLDER] Processo para submissão de eventos para curadoria editorial.
                </p>
                <Button variant="outline">
                  Submeter evento
                </Button>
              </div>
              
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                <h3 className="font-semibold mb-3">Promoção paga</h3>
                <p className="text-muted-foreground mb-4">
                  [PLACEHOLDER] Como contratar promoção paga e opções disponíveis.
                </p>
                <Button>
                  Ver opções de promoção
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Comece a divulgar hoje</h2>
              <p className="text-muted-foreground mb-6">
                [PLACEHOLDER] Call to action para entrar em contato ou submeter evento.
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" className="gap-2">
                  Submeter evento
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg">
                  Falar com nossa equipe
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </InstitutionalPageWrapper>
  );
};

export default HowToPromoteEvent;