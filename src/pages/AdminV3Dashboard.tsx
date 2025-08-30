import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminV3Guard } from '@/components/AdminV3Guard';
import { AdminV3Header } from '@/components/AdminV3Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Calendar, FileText, Clock, TrendingUp, RefreshCw, AlertTriangle, Plus, Info, ExternalLink, Users, BookOpen, Mail, Send } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAdminDashboardCounts } from '@/hooks/useAdminDashboardCounts';

interface DashboardStats {
  drafts: number;
  published: number;
  today: number;
  thisWeek: number;
  lastUpdated?: Date;
}

function DashboardContent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [stats, setStats] = useState<DashboardStats>({
    drafts: 0,
    published: 0,
    today: 0,
    thisWeek: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { counts, loading: countsLoading } = useAdminDashboardCounts();

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const todayEnd = today + 'T23:59:59.999Z';
      const todayStart = today + 'T00:00:00.000Z';
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T23:59:59.999Z';

      // Buscar estatísticas com queries otimizadas
      const [draftsResult, publishedResult, todayResult, weekResult] = await Promise.all([
        supabase.from('agenda_itens')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'draft')
          .is('deleted_at', null),
        
        supabase.from('agenda_itens')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'published')
          .is('deleted_at', null),
        
        supabase.from('agenda_itens')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'published')
          .is('deleted_at', null)
          .gte('start_at', todayStart)
          .lte('start_at', todayEnd),
        
        supabase.from('agenda_itens')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'published')
          .is('deleted_at', null)
          .gte('start_at', todayStart)
          .lte('start_at', weekFromNow)
      ]);

      // Check for errors
      if (draftsResult.error) throw draftsResult.error;
      if (publishedResult.error) throw publishedResult.error;
      if (todayResult.error) throw todayResult.error;
      if (weekResult.error) throw weekResult.error;

      setStats({
        drafts: draftsResult.count || 0,
        published: publishedResult.count || 0,
        today: todayResult.count || 0,
        thisWeek: weekResult.count || 0,
        lastUpdated: new Date()
      });

      toast({
        title: "Dados atualizados"
      });
      
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      toast({
        title: "Erro",
        description: "Falha ao carregar estatísticas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // c - Create Agenda
      if (e.key === 'c' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        navigate('/admin-v3/agenda/create');
        toast({
          title: "Criando agenda"
        });
      }

      // r - Reload cards
      if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        loadStats();
      }

      // g a - Go to agenda
      if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
        const handleSecondKey = (secondEvent: KeyboardEvent) => {
          if (secondEvent.key === 'a') {
            secondEvent.preventDefault();
            navigate('/admin-v3/agenda');
            toast({
              title: "Indo para agenda"
            });
          }
          document.removeEventListener('keydown', handleSecondKey);
        };
        document.addEventListener('keydown', handleSecondKey);
        
        // Remove listener after 2 seconds if second key not pressed
        setTimeout(() => {
          document.removeEventListener('keydown', handleSecondKey);
        }, 2000);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate, toast]);

  useEffect(() => {
    loadStats();
  }, []);

  const handleCardClick = (cardType: string) => {
    const params = new URLSearchParams();
    
    switch (cardType) {
      case 'drafts':
        params.set('status', 'draft');
        break;
      case 'published':
        params.set('status', 'published');
        break;
      case 'today':
        params.set('from', 'today');
        params.set('to', 'today');
        break;
      case 'thisWeek':
        params.set('from', 'today');
        params.set('to', '+7d');
        break;
    }
    
    navigate(`/admin-v3/agenda?${params.toString()}`);
    toast({
      title: "Filtros aplicados"
    });
  };

  const getEmptyState = (title: string) => {
    switch (title) {
      case 'Publicados':
        return {
          text: 'Sem itens publicados',
          buttonText: 'Criar Agenda',
          action: () => navigate('/admin-v3/agenda/create')
        };
      case 'Hoje':
        return {
          text: 'Nenhum evento hoje',
          buttonText: 'Ver todos',
          action: () => handleCardClick('published')
        };
      case 'Próximos 7 dias':
        return {
          text: 'Nada nesta semana',
          buttonText: 'Ver Agenda',
          action: () => navigate('/admin-v3/agenda')
        };
      default:
        return null;
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    description, 
    onCardClick,
    onReload,
    isLoading,
    hasError,
    tooltipText
  }: {
    title: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    onCardClick: () => void;
    onReload: () => void;
    isLoading: boolean;
    hasError: boolean;
    tooltipText: string;
  }) => {
    const emptyState = getEmptyState(title);
    const showEmptyState = !isLoading && !hasError && value === 0 && emptyState;

    return (
      <Card className="shadow-md rounded-xl border-0 bg-gradient-to-br from-background to-muted/30 hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">{title}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onReload();
              }}
              disabled={isLoading}
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          ) : hasError ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <span className="text-sm text-destructive">Erro ao carregar</span>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onReload();
                }}
                className="gap-2"
              >
                <RefreshCw className="h-3 w-3" />
                Tentar de novo
              </Button>
            </div>
          ) : showEmptyState ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <Icon className="h-12 w-12 text-muted-foreground opacity-50" />
              <div>
                <p className="text-sm text-muted-foreground mb-3">{emptyState.text}</p>
                <Button
                  size="sm"
                  onClick={emptyState.action}
                  className="gap-2"
                >
                  {emptyState.buttonText}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={onCardClick}
                    className="text-left w-full group"
                  >
                    <div className="text-3xl font-bold mb-1 group-hover:text-primary transition-colors cursor-pointer">
                      {value.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tooltipText}</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Timestamp footer */}
              <div className="mt-4 pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  Atualizado às {stats.lastUpdated ? stats.lastUpdated.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }) : '--:--'}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      {/* Scheduling Jobs Warning */}
      <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
        <Info className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-sm">
            Jobs de agendamento estão desativados. Alguns recursos podem não funcionar corretamente.
          </span>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-1 text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200"
          >
            <a 
              href="https://docs.lovable.dev/features/scheduling-jobs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              Ver docs
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </AlertDescription>
      </Alert>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral da sua agenda
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => navigate('/admin-v3/agenda/create')} 
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Criar Agenda
          </Button>
          <Button 
            onClick={loadStats} 
            variant="outline" 
            size="sm" 
            className="gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Recarregar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <TooltipProvider>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Rascunhos"
            value={stats.drafts}
            icon={FileText}
            description="Itens não publicados"
            onCardClick={() => handleCardClick('drafts')}
            onReload={loadStats}
            isLoading={loading}
            hasError={!!error}
            tooltipText="Clique para ver todos os rascunhos"
          />
          <StatCard
            title="Publicados"
            value={stats.published}
            icon={TrendingUp}
            description="Itens ativos"
            onCardClick={() => handleCardClick('published')}
            onReload={loadStats}
            isLoading={loading}
            hasError={!!error}
            tooltipText="Clique para ver todos os itens publicados"
          />
          <StatCard
            title="Hoje"
            value={stats.today}
            icon={Calendar}
            description="Eventos de hoje"
            onCardClick={() => handleCardClick('today')}
            onReload={loadStats}
            isLoading={loading}
            hasError={!!error}
            tooltipText="Clique para ver eventos de hoje"
          />
          <StatCard
            title="Próximos 7 dias"
            value={stats.thisWeek}
            icon={Clock}
            description="Esta semana"
            onCardClick={() => handleCardClick('thisWeek')}
            onReload={loadStats}
            isLoading={loading}
            hasError={!!error}
            tooltipText="Clique para ver eventos dos próximos 7 dias"
          />
        </div>
      </TooltipProvider>

      {/* Error State */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div className="flex-1">
                <h4 className="font-medium text-destructive">Erro ao carregar dados</h4>
                <p className="text-sm text-destructive/80 mt-1">{error}</p>
              </div>
              <Button onClick={loadStats} variant="outline" size="sm" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Tentar de novo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">Acesso Rápido</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2 bg-background hover:bg-muted"
              onClick={() => navigate('/admin-v3/agenda')}
            >
              <Calendar className="w-6 h-6" />
              <span>Ver Agenda</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2 bg-background hover:bg-muted"
              onClick={() => navigate('/admin-v3/agentes')}
            >
              <Users className="w-6 h-6" />
              <span>Gerenciar Artistas</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2 bg-background hover:bg-muted"
              onClick={() => navigate('/admin-v3/revista')}
            >
              <BookOpen className="w-6 h-6" />
              <span>Revista</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Management Cards */}
      {!countsLoading && counts && (
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg">Gestão</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-24 flex-col gap-2 bg-background hover:bg-muted"
                onClick={() => navigate('/admin-v3/contatos')}
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-semibold">{counts.contacts.total}</div>
                    <div className="text-xs text-muted-foreground">+{counts.contacts.last_7d} esta semana</div>
                  </div>
                </div>
                <span className="text-sm">Contatos</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex-col gap-2 bg-background hover:bg-muted"
                onClick={() => navigate('/admin-v3/newsletter')}
              >
                <div className="flex items-center gap-2">
                  <Send className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-semibold">{counts.newsletter.total}</div>
                    <div className="text-xs text-muted-foreground">+{counts.newsletter.last_7d} esta semana</div>
                  </div>
                </div>
                <span className="text-sm">Newsletter</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex-col gap-2 bg-background hover:bg-muted"
                onClick={() => navigate('/admin-v3/candidaturas')}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-semibold">{counts.job_applications.total}</div>
                    <div className="text-xs text-muted-foreground">+{counts.job_applications.last_7d} esta semana</div>
                  </div>
                </div>
                <span className="text-sm">Candidaturas</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keyboard Shortcuts Help */}
      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3">Atalhos de teclado</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-background border rounded text-xs font-mono">C</kbd>
              <span className="text-muted-foreground">Criar Agenda</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-background border rounded text-xs font-mono">R</kbd>
              <span className="text-muted-foreground">Recarregar cards</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-background border rounded text-xs font-mono">G</kbd>
              <kbd className="px-2 py-1 bg-background border rounded text-xs font-mono">A</kbd>
              <span className="text-muted-foreground">Ir para Agenda</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminV3Dashboard() {
  return (
    <AdminV3Guard>
      <div className="min-h-screen bg-background">
        <AdminV3Header />
        <div className="pt-16 p-6">
          <div className="max-w-7xl mx-auto">
            <DashboardContent />
          </div>
        </div>
      </div>
    </AdminV3Guard>
  );
}