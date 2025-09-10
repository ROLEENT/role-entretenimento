import React from 'react';
import { InstitutionalPageWrapper } from '@/components/layouts/InstitutionalPageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star, Users, Award, ArrowRight } from 'lucide-react';

const HowToGetProfilePublished = () => {
  const steps = [
    {
      number: "01",
      title: "Crie seu perfil",
      description: "[PLACEHOLDER] Instruções para criar perfil completo na plataforma."
    },
    {
      number: "02", 
      title: "Complete suas informações",
      description: "[PLACEHOLDER] Quais informações são necessárias para ter um perfil completo."
    },
    {
      number: "03",
      title: "Aguarde nossa avaliação",
      description: "[PLACEHOLDER] Processo de curadoria e tempo de resposta da equipe editorial."
    },
    {
      number: "04",
      title: "Perfil publicado",
      description: "[PLACEHOLDER] O que acontece após aprovação e como manter o perfil ativo."
    }
  ];

  const criteria = [
    {
      icon: Star,
      title: "Relevância Cultural",
      description: "[PLACEHOLDER] Critérios sobre relevância na cena cultural local."
    },
    {
      icon: Users,
      title: "Engajamento",
      description: "[PLACEHOLDER] Importância do engajamento com a comunidade."
    },
    {
      icon: Award,
      title: "Qualidade do Conteúdo",
      description: "[PLACEHOLDER] Padrões de qualidade para perfis e eventos."
    }
  ];

  return (
    <InstitutionalPageWrapper
      title="Como ter seu perfil publicado no ROLÊ"
      description="Guia completo para artistas, organizadores e locais conseguirem destaque na nossa curadoria."
      seoTitle="Como ter perfil publicado | ROLÊ ENTRETENIMENTO"
      seoDescription="Aprenda como conseguir destaque no ROLÊ. Guia para artistas, organizadores e locais serem destacados em nossa curadoria editorial."
      lastUpdated="10 de setembro de 2025"
    >
      <div className="space-y-12">
        {/* Introduction */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">Destaque na cena cultural</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                [PLACEHOLDER] Texto introdutório sobre a importância de ter um perfil destacado no ROLÊ
                e como isso pode impactar a carreira de artistas e organizadores.
              </p>
            </div>
            
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <p className="text-sm text-muted-foreground">
                <strong>Conteúdo será inserido na Fase 2:</strong><br/>
                • Texto editorial no tom ROLÊ sobre destaque cultural<br/>
                • Benefícios de ter perfil curado<br/>
                • Exemplos de sucesso na plataforma
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-primary" />
              Passo a passo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Criteria */}
        <Card>
          <CardHeader>
            <CardTitle>Critérios de avaliação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {criteria.map((criterion, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <criterion.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{criterion.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {criterion.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Pronto para começar?</h2>
              <p className="text-muted-foreground mb-6">
                [PLACEHOLDER] Call to action motivacional para criar perfil.
              </p>
              <Button size="lg" className="gap-2">
                Criar meu perfil
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </InstitutionalPageWrapper>
  );
};

export default HowToGetProfilePublished;