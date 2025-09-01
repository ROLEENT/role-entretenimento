import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, FileText, Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AdminBlogFilters } from '@/components/admin/blog/AdminBlogFilters';
import { AdminBlogTable } from '@/components/admin/blog/AdminBlogTable';
import { useAdminBlogPosts } from '@/hooks/useAdminBlogPosts';
import { toast } from 'sonner';

const AdminV3RevistaList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');

  const { posts, categories, isLoading, error, deletePost, duplicatePost } = useAdminBlogPosts({
    search: search || undefined,
    status: status !== 'all' ? status : undefined,
    category: category !== 'all' ? category : undefined,
  });

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

  const handleDuplicate = async (post: any) => {
    try {
      await duplicatePost(post);
      toast.success('Post duplicado com sucesso!');
    } catch (error) {
      toast.error('Erro ao duplicar post');
    }
  };

  const handleDelete = async (post: any) => {
    if (confirm(`Tem certeza que deseja excluir o post "${post.title}"?`)) {
      try {
        await deletePost(post.id);
        toast.success('Post excluído com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir post');
      }
    }
  };

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

  if (error) {
    return (
      <AdminPageWrapper
        title="Revista Digital"
        description="Sistema de publicação de matérias, entrevistas e conteúdo editorial"
        breadcrumbs={breadcrumbs}
        actions={actions}
      >
        <div className="text-center py-12">
          <p className="text-destructive">Erro ao carregar posts: {(error as Error)?.message || 'Erro desconhecido'}</p>
        </div>
      </AdminPageWrapper>
    );
  }

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

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <AdminBlogFilters
              search={search}
              onSearchChange={setSearch}
              status={status}
              onStatusChange={setStatus}
              category={category}
              onCategoryChange={setCategory}
              categories={categories || []}
            />
          </CardContent>
        </Card>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <AdminBlogTable
                posts={posts || []}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>
        )}

        {posts && posts.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Mostrando {posts.length} post(s)
          </div>
        )}
      </div>
    </AdminPageWrapper>
  );
};

export default AdminV3RevistaList;