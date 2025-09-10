import React from 'react';
import { InstitutionalPageWrapper } from '@/components/layouts/InstitutionalPageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, ArrowRight, Users, Target, Star } from 'lucide-react';

const HowToPublishProfile = () => {
  const profileTypes = [
    {
      icon: Users,
      title: "Artista",
      description: "Músicos, performers, criadores de conteúdo e talentos",
      requirements: ["Press kit atualizado", "Portfólio de trabalhos", "Redes sociais ativas"]
    },
    {
      icon: Target,
      title: "Organizador",
      description: "Produtoras, coletivos, empresas e organizadores de eventos",
      requirements: ["Histórico de eventos", "Equipe definida", "Projeto cultural consistente"]
    },
    {
      icon: Star,
      title: "Local",
      description: "Casas de shows, teatros, galerias e espaços culturais",
      requirements: ["Licenças de funcionamento", "Programação regular", "Estrutura adequada"]
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Prepare sua documentação",
      description: "Reúna bio, fotos de qualidade, links das redes sociais e histórico de trabalhos.",
      duration: "1-2 dias"
    },
    {
      number: "2", 
      title: "Preencha o formulário",
      description: "Complete todas as informações solicitadas no formulário de candidatura.",
      duration: "30 min"
    },
    {
      number: "3",
      title: "Análise da curadoria",
      description: "Nossa equipe avalia seu perfil com base nos critérios editoriais do ROLÊ.",
      duration: "5-7 dias"
    },
    {
      number: "4",
      title: "Aprovação e publicação",
      description: "Perfil aprovado vai ao ar no site e recebe acesso ao painel de controle.",
      duration: "24h"
    }
  ];

  const criteria = [
    "Qualidade e consistência do trabalho artístico",
    "Relevância para a cena cultural local",
    "Atividade regular e presença digital",
    "Alinhamento com valores do ROLÊ",
    "Potencial de engajamento com público",
    "Originalidade e proposta diferenciada"
  ];

  return (
    <InstitutionalPageWrapper
      title="Como ter seu perfil publicado no ROLÊ"
      description="Guia completo para artistas, organizadores e locais que querem fazer parte da nossa plataforma cultural."
      seoTitle="Como ter perfil publicado | ROLÊ ENTRETENIMENTO"
      seoDescription="Saiba como ter seu perfil de artista, organizador ou local aprovado no ROLÊ. Critérios, processo e dicas para candidatura."
      lastUpdated="10 de setembro de 2025"
    >
      <div className="space-y-12">
        {/* Introduction */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-lg leading-relaxed">
              O ROLÊ é uma plataforma curatorial. Isso significa que não é qualquer perfil que entra. 
              A gente seleciona quem tem a ver com nosso olhar cultural e pode agregar valor real 
              para quem busca entretenimento de qualidade.
            </p>
          </CardContent>
        </Card>

        {/* Profile Types */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center">Tipos de perfil</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {profileTypes.map((type, index) => (
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
                  <h4 className="font-semibold mb-2">Requisitos básicos:</h4>
                  <ul className="space-y-2">
                    {type.requirements.map((req, reqIndex) => (
                      <li key={reqIndex} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Process */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center">Como funciona o processo</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold mx-auto">
                    {step.number}
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    {step.description}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-primary">
                    <Clock className="h-4 w-4" />
                    {step.duration}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Criteria */}
        <Card>
          <CardHeader>
            <CardTitle>Critérios de avaliação</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Nossa curadoria avalia candidaturas com base nesses critérios principais:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {criteria.map((criterion, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{criterion}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Dicas para aumentar suas chances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">📸 Caprichem nas fotos</h4>
                <p className="text-muted-foreground text-sm">
                  Fotos de qualidade fazem toda diferença. Invistam em um press kit visual que represente bem seu trabalho.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">📝 Bio consistente</h4>
                <p className="text-muted-foreground text-sm">
                  Escrevam uma bio que conte sua história de forma clara e envolvente. Menos é mais.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🎯 Portfólio relevante</h4>
                <p className="text-muted-foreground text-sm">
                  Mostrem trabalhos que representem sua identidade artística atual, não tudo que já fizeram.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🌐 Presença digital ativa</h4>
                <p className="text-muted-foreground text-sm">
                  Redes sociais atualizadas e engajamento real com público demonstram profissionalismo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Pronto para fazer parte do ROLÊ?</h2>
              <p className="text-muted-foreground mb-6">
                Se você tem um trabalho consistente e quer ter visibilidade na cena cultural, 
                essa é sua chance.
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" className="gap-2">
                  Candidatar perfil
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg">
                  Ver exemplos de perfis
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </InstitutionalPageWrapper>
  );
};

export default HowToPublishProfile;