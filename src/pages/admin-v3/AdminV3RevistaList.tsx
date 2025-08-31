import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, FileText, Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AdminV3RevistaList: React.FC = () => {
  // TODO: Implementar hook useAdminBlogPosts
  const posts = []; // Placeholder
  const isLoading = false;

  const breadcrumbs = [
    { label: 'Admin', path: '/admin-v3' },
    { label: 'Revista' },
  ];

  const actions = (
    <Button asChild>
      <Link to="/admin-v3/revista/create">
        <Plus className="h-4 w-4 mr-2" />
        Novo Post
      </Link>
    </Button>
  );

  const statsCards = [
    {
      title: 'Total de Posts',
      value: posts?.length || 0,
      icon: FileText,
      change: '+12%'
    },
    {
      title: 'Posts Publicados',
      value: posts?.filter((p: any) => p.status === 'published')?.length || 0,
      icon: Eye,
      change: '+8%'
    },
    {
      title: 'Rascunhos',
      value: posts?.filter((p: any) => p.status === 'draft')?.length || 0,
      icon: FileText,
      change: '+15%'
    },
    {
      title: 'Agendados',
      value: posts?.filter((p: any) => p.scheduled_at)?.length || 0,
      icon: Calendar,
      change: '+5%'
    }
  ];

  return (
    <AdminPageWrapper
      title="Revista Digital"
      description="Sistema de publicação de matérias, entrevistas e conteúdo editorial"
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
        <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950">
          <CardHeader>
            <CardTitle className="text-purple-800 dark:text-purple-200 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Sistema de Revista em Desenvolvimento
            </CardTitle>
          </CardHeader>
          <CardContent className="text-purple-700 dark:text-purple-300">
            <div className="space-y-4">
              <p>O sistema completo de revista digital está sendo desenvolvido e incluirá:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Editor de conteúdo avançado com recursos rich text</li>
                <li>Sistema completo de gerenciamento de categorias e tags</li>
                <li>SEO otimizado para melhor indexação</li>
                <li>Sistema de comentários e interação</li>
                <li>Agendamento de publicações</li>
                <li>Galeria de mídia integrada</li>
                <li>Analytics de engajamento e performance</li>
                <li>Newsletter automática</li>
              </ul>
              <div className="flex items-center gap-2 pt-4">
                <Badge variant="secondary">Previsão: Abril 2025</Badge>
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
                <span className="text-sm">Criar Post</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2" disabled>
                <FileText className="h-6 w-6" />
                <span className="text-sm">Gerenciar Categorias</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2" disabled>
                <Eye className="h-6 w-6" />
                <span className="text-sm">Analytics de Posts</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feature Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview das Funcionalidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Editor Avançado</h4>
                <div className="bg-muted rounded-lg p-4 h-32 flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Rich Text Editor</span>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Gerenciamento de Mídia</h4>
                <div className="bg-muted rounded-lg p-4 h-32 flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Media Gallery</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 mb-4 text-muted-foreground">
            <BookOpen className="w-full h-full" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Sistema em Desenvolvimento</h3>
          <p className="text-muted-foreground mb-6">
            O módulo de revista digital está sendo desenvolvido com todas as funcionalidades necessárias para um CMS completo.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild variant="outline">
              <Link to="/admin-v3/agenda">
                Ver Agenda
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin-v3/agentes/artistas">
                Gerenciar Artistas
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </AdminPageWrapper>
  );
};

export default AdminV3RevistaList;