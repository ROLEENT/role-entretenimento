import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Star, TrendingUp, Calendar, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AdminV3DestaquesList: React.FC = () => {
  // TODO: Implementar hook useAdminDestaquesData
  const destaques = []; // Placeholder
  const isLoading = false;

  const breadcrumbs = [
    { label: 'Admin', path: '/admin-v3' },
    { label: 'Destaques' },
  ];

  const actions = (
    <Button asChild>
      <Link to="/admin-v3/destaques/create">
        <Plus className="h-4 w-4 mr-2" />
        Novo Destaque
      </Link>
    </Button>
  );

  const statsCards = [
    {
      title: 'Total de Destaques',
      value: destaques?.length || 0,
      icon: Star,
      change: '+18%'
    },
    {
      title: 'Destaques Ativos',
      value: destaques?.filter((d: any) => d.status === 'active')?.length || 0,
      icon: TrendingUp,
      change: '+12%'
    },
    {
      title: 'Agendados',
      value: destaques?.filter((d: any) => d.scheduled_at)?.length || 0,
      icon: Calendar,
      change: '+25%'
    },
    {
      title: 'Campanhas Ativas',
      value: destaques?.filter((d: any) => d.type === 'campaign')?.length || 0,
      icon: Target,
      change: '+8%'
    }
  ];

  const featureModules = [
    {
      title: 'Criação de Highlights',
      description: 'Sistema para criar e gerenciar conteúdo em destaque',
      icon: Star,
      status: 'Em desenvolvimento',
      color: 'yellow'
    },
    {
      title: 'Curadoria Automática',
      description: 'Algoritmo inteligente para seleção automática de conteúdo',
      icon: TrendingUp,
      status: 'Em desenvolvimento',
      color: 'blue'
    },
    {
      title: 'Agenda Curatorial',
      description: 'Calendário de publicações e agendamento de conteúdo',
      icon: Calendar,
      status: 'Em desenvolvimento',
      color: 'green'
    },
    {
      title: 'Sistema de Votação',
      description: 'Votação comunitária para seleção de destaques',
      icon: Target,
      status: 'Em desenvolvimento',
      color: 'purple'
    }
  ];

  return (
    <AdminPageWrapper
      title="Destaques Editoriais"
      description="Curadoria de conteúdo, vitrine cultural e gerenciamento de banners"
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.change} desde o último mês
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Development Notice */}
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardHeader>
            <CardTitle className="text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
              <Star className="h-5 w-5" />
              Sistema de Destaques em Desenvolvimento
            </CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-700 dark:text-yellow-300">
            <div className="space-y-4">
              <p>O sistema completo de destaques editoriais está sendo desenvolvido com funcionalidades avançadas de curadoria e engajamento.</p>
              <div className="flex items-center gap-2 pt-4">
                <Badge variant="secondary">Previsão: Maio 2025</Badge>
                <Badge variant="outline">Em desenvolvimento ativo</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featureModules.map((module, index) => (
            <Card key={index} className="transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${module.color}-100 dark:bg-${module.color}-900`}>
                    <module.icon className={`h-5 w-5 text-${module.color}-600 dark:text-${module.color}-400`} />
                  </div>
                  <span className="text-base">{module.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {module.description}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {module.status}
                  </Badge>
                  <Button variant="ghost" size="sm" disabled>
                    Configurar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Curadoria Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview da Curadoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Highlights Automáticos</h4>
                <div className="bg-muted rounded-lg p-6 h-32 flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">Seleção por IA</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Votação Comunitária</h4>
                <div className="bg-muted rounded-lg p-6 h-32 flex items-center justify-center">
                  <div className="text-center">
                    <Target className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">Escolha da Comunidade</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Integração Social</h4>
                <div className="bg-muted rounded-lg p-6 h-32 flex items-center justify-center">
                  <div className="text-center">
                    <Star className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">Redes Sociais</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 mb-4 text-muted-foreground">
            <Star className="w-full h-full" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Sistema em Desenvolvimento</h3>
          <p className="text-muted-foreground mb-6">
            O módulo de destaques editoriais está sendo desenvolvido com funcionalidades avançadas de curadoria, votação comunitária e integração com redes sociais.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild variant="outline">
              <Link to="/admin-v3/agenda">
                Ver Agenda
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin-v3/revista">
                Gerenciar Revista
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </AdminPageWrapper>
  );
};

export default AdminV3DestaquesList;