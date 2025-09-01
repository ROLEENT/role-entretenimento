import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, Users, Mail, FileText, BarChart, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AdminV3GestaoList: React.FC = () => {
  const breadcrumbs = [
    { label: 'Admin', path: '/admin-v3' },
    { label: 'Gestão' },
  ];

  const systemModules = [
    {
      title: 'Mensagens de Contato',
      description: 'Gerenciar mensagens recebidas via formulário de contato',
      icon: Mail,
      status: 'Em desenvolvimento',
      color: 'blue'
    },
    {
      title: 'Newsletter',
      description: 'Sistema de gerenciamento de newsletter e campanhas',
      icon: Mail,
      status: 'Em desenvolvimento',
      color: 'green'
    },
    {
      title: 'Candidaturas',
      description: 'Processo de candidaturas e gestão de RH',
      icon: Users,
      status: 'Em desenvolvimento',
      color: 'purple'
    },
    {
      title: 'Configurações Gerais',
      description: 'Configurações do sistema e preferências',
      icon: Settings,
      status: 'Em desenvolvimento',
      color: 'orange'
    },
    {
      title: 'Relatórios e Analytics',
      description: 'Dashboard analítico e relatórios personalizados',
      icon: BarChart,
      status: 'Em desenvolvimento',
      color: 'red'
    },
    {
      title: 'Notificações',
      description: 'Sistema de notificações e alertas',
      icon: Bell,
      status: 'Em desenvolvimento',
      color: 'yellow'
    }
  ];

  const statsCards = [
    {
      title: 'Mensagens Pendentes',
      value: 0,
      icon: Mail,
      change: '0%'
    },
    {
      title: 'Assinantes Newsletter',
      value: 0,
      icon: Users,
      change: '0%'
    },
    {
      title: 'Candidaturas Ativas',
      value: 0,
      icon: FileText,
      change: '0%'
    },
    {
      title: 'Alertas do Sistema',
      value: 0,
      icon: Bell,
      change: '0%'
    }
  ];

  return (
    <AdminPageWrapper
      title="Gestão do Sistema"
      description="Configurações, usuários, taxonomias e ferramentas administrativas"
      breadcrumbs={breadcrumbs}
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
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardHeader>
            <CardTitle className="text-orange-800 dark:text-orange-200 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Sistema de Gestão em Desenvolvimento
            </CardTitle>
          </CardHeader>
          <CardContent className="text-orange-700 dark:text-orange-300">
            <div className="space-y-4">
              <p>O sistema completo de gestão está sendo desenvolvido com módulos integrados para administração eficiente da plataforma.</p>
              <div className="flex items-center gap-2 pt-4">
                <Badge variant="secondary">Previsão: Janeiro 2025</Badge>
                <Badge variant="outline">Em desenvolvimento ativo</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {systemModules.map((module, index) => (
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

        {/* Quick Access */}
        <Card>
          <CardHeader>
            <CardTitle>Acesso Rápido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button asChild variant="outline" className="h-16 flex flex-col gap-2">
                <Link to="/admin-v3/agenda">
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">Agenda</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-16 flex flex-col gap-2">
                <Link to="/admin-v3/agentes/artistas">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Artistas</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-16 flex flex-col gap-2">
                <Link to="/admin-v3/revista">
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">Revista</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-16 flex flex-col gap-2">
                <Link to="/admin-v3/destaques">
                  <BarChart className="h-6 w-6" />
                  <span className="text-sm">Destaques</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 mb-4 text-muted-foreground">
            <Settings className="w-full h-full" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Centro de Controle em Desenvolvimento</h3>
          <p className="text-muted-foreground mb-6">
            Todas as ferramentas administrativas estarão centralizadas aqui para uma gestão eficiente da plataforma.
          </p>
        </div>
      </div>
    </AdminPageWrapper>
  );
};

export default AdminV3GestaoList;