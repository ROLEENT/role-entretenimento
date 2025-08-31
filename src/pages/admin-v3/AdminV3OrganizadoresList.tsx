import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AdminV3OrganizadoresList: React.FC = () => {
  // TODO: Implementar hook useAdminOrganizadoresData
  const organizadores = []; // Placeholder
  const isLoading = false;

  const breadcrumbs = [
    { label: 'Admin', path: '/admin-v3' },
    { label: 'Agentes', path: '/admin-v3/agentes' },
    { label: 'Organizadores' },
  ];

  const actions = (
    <Button asChild>
      <Link to="/admin-v3/agentes/organizadores/create">
        <Plus className="h-4 w-4 mr-2" />
        Novo Organizador
      </Link>
    </Button>
  );

  const statsCards = [
    {
      title: 'Total de Organizadores',
      value: organizadores?.length || 0,
      icon: Building2,
      change: '+15%'
    },
    {
      title: 'Organizadores Ativos',
      value: organizadores?.filter((o: any) => o.status === 'active')?.length || 0,
      icon: Building2,
      change: '+12%'
    },
    {
      title: 'Produtoras',
      value: organizadores?.filter((o: any) => o.type === 'producer')?.length || 0,
      icon: Building2,
      change: '+8%'
    },
    {
      title: 'Coletivos',
      value: organizadores?.filter((o: any) => o.type === 'collective')?.length || 0,
      icon: Building2,
      change: '+20%'
    }
  ];

  return (
    <AdminPageWrapper
      title="Organizadores"
      description="Gerencie organizadores, produtoras, coletivos e selos musicais"
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
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Sistema de Organizadores em Desenvolvimento
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700 dark:text-blue-300">
            <div className="space-y-4">
              <p>O sistema completo de gestão de organizadores está sendo desenvolvido e incluirá:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cadastro de organizadores, produtoras, coletivos e selos musicais</li>
                <li>Histórico completo de eventos organizados</li>
                <li>Sistema de avaliações e reputação</li>
                <li>Relatórios de performance e métricas</li>
                <li>Ferramentas de comunicação integradas</li>
                <li>Gestão de contratos e documentos</li>
                <li>Dashboard analítico personalizado</li>
              </ul>
              <div className="flex items-center gap-2 pt-4">
                <Badge variant="secondary">Previsão: Fevereiro 2025</Badge>
                <Badge variant="outline">Em desenvolvimento ativo</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-24 flex flex-col gap-2" disabled>
                <Plus className="h-6 w-6" />
                <span className="text-sm">Cadastrar Organizador</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2" disabled>
                <Building2 className="h-6 w-6" />
                <span className="text-sm">Importar Organizadores</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2" disabled>
                <Building2 className="h-6 w-6" />
                <span className="text-sm">Relatório de Performance</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 mb-4 text-muted-foreground">
            <Building2 className="w-full h-full" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Sistema em Desenvolvimento</h3>
          <p className="text-muted-foreground mb-6">
            O módulo de gestão de organizadores está sendo desenvolvido com funcionalidades abrangentes para todos os tipos de organizadores de eventos.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild variant="outline">
              <Link to="/admin-v3/agentes/artistas">
                Gerenciar Artistas
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin-v3/agenda">
                Ver Agenda
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </AdminPageWrapper>
  );
};

export default AdminV3OrganizadoresList;