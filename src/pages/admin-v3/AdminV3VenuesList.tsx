import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AdminV3VenuesList: React.FC = () => {
  // TODO: Implementar hook useAdminVenuesData
  const venues = []; // Placeholder
  const isLoading = false;

  const breadcrumbs = [
    { label: 'Admin', path: '/admin-v3' },
    { label: 'Agentes', path: '/admin-v3/agentes' },
    { label: 'Locais' },
  ];

  const actions = (
    <Button asChild>
      <Link to="/admin-v3/agentes/venues/create">
        <Plus className="h-4 w-4 mr-2" />
        Novo Local
      </Link>
    </Button>
  );

  const statsCards = [
    {
      title: 'Total de Locais',
      value: venues?.length || 0,
      icon: MapPin,
      change: '+8%'
    },
    {
      title: 'Locais Ativos',
      value: venues?.filter((v: any) => v.status === 'active')?.length || 0,
      icon: MapPin,
      change: '+5%'
    },
    {
      title: 'Casas de Show',
      value: venues?.filter((v: any) => v.venue_type === 'house')?.length || 0,
      icon: MapPin,
      change: '+12%'
    },
    {
      title: 'Teatros',
      value: venues?.filter((v: any) => v.venue_type === 'theater')?.length || 0,
      icon: MapPin,
      change: '+3%'
    }
  ];

  return (
    <AdminPageWrapper
      title="Locais (Venues)"
      description="Gerencie casas de show, bares, clubes e espaços culturais"
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
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardHeader>
            <CardTitle className="text-amber-800 dark:text-amber-200 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Sistema de Locais em Desenvolvimento
            </CardTitle>
          </CardHeader>
          <CardContent className="text-amber-700 dark:text-amber-300">
            <div className="space-y-4">
              <p>O sistema completo de gestão de locais está sendo desenvolvido e incluirá:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cadastro completo de casas de show, bares, clubes e espaços culturais</li>
                <li>Gerenciamento de capacidade e características técnicas</li>
                <li>Integração com mapas e localização</li>
                <li>Sistema de avaliações e comentários</li>
                <li>Galeria de fotos dos espaços</li>
                <li>Histórico de eventos realizados</li>
                <li>Relatórios de performance e ocupação</li>
              </ul>
              <div className="flex items-center gap-2 pt-4">
                <Badge variant="secondary">Previsão: Março 2025</Badge>
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
                <span className="text-sm">Cadastrar Local</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2" disabled>
                <MapPin className="h-6 w-6" />
                <span className="text-sm">Importar Locais</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2" disabled>
                <MapPin className="h-6 w-6" />
                <span className="text-sm">Relatório de Locais</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 mb-4 text-muted-foreground">
            <MapPin className="w-full h-full" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Sistema em Desenvolvimento</h3>
          <p className="text-muted-foreground mb-6">
            O módulo de gestão de locais está sendo desenvolvido com funcionalidades completas para gerenciar todos os tipos de espaços culturais.
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

export default AdminV3VenuesList;