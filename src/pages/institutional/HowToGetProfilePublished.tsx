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
      title="Quer estar no mapa do ROLÊ?"
      description="O ROLÊ é curadoria cultural. A gente conecta artistas, coletivos, locais e produtores com quem vive a cena."
      seoTitle="Como ter perfil publicado | ROLÊ ENTRETENIMENTO"
      seoDescription="Aprenda como conseguir destaque no ROLÊ. Guia para artistas, organizadores e locais serem destacados em nossa curadoria editorial."
      lastUpdated="10 de setembro de 2025"
    >
      <div className="space-y-12">
        {/* Introduction */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Pra ter seu perfil publicado aqui, não basta só preencher um cadastro — precisa ter relevância, diversidade e estar em sintonia com a cultura noturna e urbana.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Quem pode pedir publicação</h3>
                <p className="text-muted-foreground text-sm">
                  Artistas (DJs, performers, atrizes, bandas, drags…), locais (bares, clubes, teatros, casas noturnas) e organizadores (coletivos, produtoras, agências).
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">O que analisamos</h3>
                <p className="text-muted-foreground text-sm">
                  Autenticidade, conexão com a cidade, qualidade da comunicação e respeito à diversidade.
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">O que você precisa enviar</h3>
                <ul className="text-muted-foreground text-sm space-y-1">
                  <li>• Foto ou logo em boa qualidade</li>
                  <li>• Bio curta (quem é, o que faz, trajetória)</li>
                  <li>• Links oficiais (Instagram, site, Spotify, portfólio)</li>
                  <li>• Gêneros ou linguagens artísticas</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How it works */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-primary" />
              Como funciona
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-muted-foreground text-lg leading-relaxed">
                Preencha o formulário oficial → nosso time analisa → se aprovado, seu perfil aparece público e conectado aos eventos.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Mostra quem tu é</h2>
              <p className="text-muted-foreground mb-6">
                Preencha o formulário e bora colocar seu nome na pista.
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