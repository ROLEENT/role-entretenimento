import React from 'react';
import { InstitutionalPageWrapper } from '@/components/layouts/InstitutionalPageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Target, Megaphone, BarChart, ArrowRight } from 'lucide-react';

const HowToPromoteEvent = () => {
  const promotionTypes = [
    {
      icon: Calendar,
      title: "Vitrine Cultural",
      description: "Publicação direta e acessível, já no feed e site.",
      features: ["Formato acessível", "Visibilidade garantida", "Publicação rápida"]
    },
    {
      icon: Target,
      title: "Posts editoriais",
      description: "Carrosséis e matérias com narrativa cultural, pensados pra engajar.",
      features: ["Narrativa cultural", "Conteúdo elaborado", "Maior engajamento"]
    },
    {
      icon: Megaphone,
      title: "Combos",
      description: "União de formatos (feed + stories + reels) com mais alcance.",
      features: ["Múltiplos formatos", "Alcance ampliado", "Maior impacto"]
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
      title="Quer seu rolê no ROLÊ?"
      description="O ROLÊ é mais que agenda. A gente cria narrativas, conecta públicos e dá visibilidade real pra festas, shows, peças e festivais."
      seoTitle="Como divulgar evento | ROLÊ ENTRETENIMENTO"
      seoDescription="Aprenda as melhores estratégias para promover seu evento no ROLÊ. Guia para organizadores e produtores culturais."
      lastUpdated="10 de setembro de 2025"
    >
      <div className="space-y-12">
        {/* Introduction */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Se você quer divulgar seu evento, esse é o caminho certo.
            </p>
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

        {/* How it works */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-6 w-6 text-primary" />
              Como funciona
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold mx-auto mb-3">
                  1
                </div>
                <h3 className="font-semibold mb-2">Escolha o pacote</h3>
                <p className="text-muted-foreground text-sm">
                  Escolha o pacote que faz sentido pra sua produção.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold mx-auto mb-3">
                  2
                </div>
                <h3 className="font-semibold mb-2">Preencha o briefing</h3>
                <p className="text-muted-foreground text-sm">
                  Preencha o briefing com descrição, imagens e links de ingresso.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold mx-auto mb-3">
                  3
                </div>
                <h3 className="font-semibold mb-2">Nosso time cria</h3>
                <p className="text-muted-foreground text-sm">
                  Nosso time cria a publicação no tom ROLÊ.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold mx-auto mb-3">
                  4
                </div>
                <h3 className="font-semibold mb-2">Você aprova</h3>
                <p className="text-muted-foreground text-sm">
                  Você aprova antes de ir pro ar.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Values */}
        <Card>
          <CardHeader>
            <CardTitle>Valores e condições</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Temos preços acessíveis, taxa de urgência quando necessário e condições especiais para produções independentes. 
              Portfólio completo disponível <a href="#" className="text-primary hover:underline">aqui</a>.
            </p>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Seu evento pode ser só mais um post no feed…</h2>
              <p className="text-muted-foreground mb-6">
                ou pode virar conversa na cidade. Escolhe o formato e cola com a gente.
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