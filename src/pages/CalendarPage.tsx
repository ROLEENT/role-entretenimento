import React from 'react';
import { Helmet } from 'react-helmet';
import PersonalCalendar from '@/components/PersonalCalendar';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Calendar, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

const CalendarPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <>
        <Helmet>
          <title>Calendário Pessoal - ROLÊ</title>
          <meta name="description" content="Organize seus eventos culturais favoritos em um calendário pessoal sincronizado." />
        </Helmet>

        <div className="min-h-screen bg-gradient-to-br from-background to-accent/30">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              
              <h1 className="text-2xl font-bold mb-4">
                Calendário Pessoal
              </h1>
              
              <p className="text-muted-foreground mb-8">
                Organize seus eventos culturais favoritos, configure lembretes automáticos e sincronize com seus calendários externos.
              </p>
              
              <div className="space-y-4">
                <Link to="/auth">
                  <Button size="lg" className="w-full">
                    <LogIn className="h-5 w-5 mr-2" />
                    Fazer Login
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
                  <h3 className="font-semibold text-sm mb-2">📅 Organização Inteligente</h3>
                  <p className="text-xs text-muted-foreground">
                    Todos os seus eventos favoritos organizados em um calendário visual
                  </p>
                </div>
                
                <div className="bg-card p-4 rounded-lg border">
                  <h3 className="font-semibold text-sm mb-2">🔔 Lembretes Personalizados</h3>
                  <p className="text-xs text-muted-foreground">
                    Configure notificações para nunca perder um evento importante
                  </p>
                </div>
                
                <div className="bg-card p-4 rounded-lg border">
                  <h3 className="font-semibold text-sm mb-2">🔄 Sincronização</h3>
                  <p className="text-xs text-muted-foreground">
                    Integre com Google Calendar e outros calendários externos
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Meu Calendário - ROLÊ</title>
        <meta name="description" content="Seu calendário pessoal de eventos culturais no ROLÊ." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background to-accent/30">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Meu Calendário</h1>
              <p className="text-muted-foreground">
                Organize e acompanhe todos os seus eventos culturais favoritos
              </p>
            </div>

            <PersonalCalendar />
          </div>
        </div>
      </div>
    </>
  );
};

export default CalendarPage;