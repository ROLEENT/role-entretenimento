import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Trophy, Award, Target, TrendingUp } from 'lucide-react';
import GamificationDashboard from '@/components/GamificationDashboard';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const GamificationPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-accent/30">
        <Helmet>
          <title>Sistema de Conquistas - ROLÊ</title>
          <meta name="description" content="Ganhe pontos, conquiste badges e suba no ranking participando de eventos culturais no ROLÊ." />
        </Helmet>
        <Header />
        
        <main className="pt-20">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              
              <h1 className="text-2xl font-bold mb-4">
                Sistema de Conquistas
              </h1>
              
              <p className="text-muted-foreground mb-8">
                Ganhe pontos participando de eventos, conquiste badges exclusivos e compita no ranking com outros usuários da comunidade ROLÊ.
              </p>
              
              <div className="space-y-4">
                <Link to="/auth">
                  <Button size="lg" className="w-full">
                    <Trophy className="h-5 w-5 mr-2" />
                    Começar a Conquistar
                  </Button>
                </Link>
                
                <Link to="/">
                  <Button variant="outline" size="lg" className="w-full">
                    Voltar ao Início
                  </Button>
                </Link>
              </div>

              <div className="mt-12 grid grid-cols-1 gap-4 text-left">
                <div className="bg-card p-4 rounded-lg border">
                  <h3 className="font-semibold text-sm mb-2 flex items-center">
                    <Target className="h-4 w-4 mr-2 text-primary" />
                    Ganhe Pontos
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Check-in em eventos (+10), avaliações (+15), e muito mais
                  </p>
                </div>
                
                <div className="bg-card p-4 rounded-lg border">
                  <h3 className="font-semibold text-sm mb-2 flex items-center">
                    <Award className="h-4 w-4 mr-2 text-primary" />
                    Conquiste Badges
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Desbloqueie conquistas por atividades e marcos especiais
                  </p>
                </div>
                
                <div className="bg-card p-4 rounded-lg border">
                  <h3 className="font-semibold text-sm mb-2 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                    Suba no Ranking
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Compita com outros usuários nos rankings mensal e geral
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/30">
      <Helmet>
        <title>Minhas Conquistas - ROLÊ</title>
        <meta name="description" content="Acompanhe seus pontos, badges e posição no ranking do ROLÊ." />
      </Helmet>
      <Header />
      
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Sistema de Conquistas</h1>
              <p className="text-muted-foreground">
                Acompanhe seus pontos, badges conquistados e posição no ranking da comunidade
              </p>
            </div>

            <GamificationDashboard />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GamificationPage;