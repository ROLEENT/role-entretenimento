import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Search, Edit, Eye, Calendar, User, FileText, Clock, History, RotateCcw, Diff } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  author_name: string;
  status: 'draft' | 'published' | 'scheduled';
  published_at: string | null;
  scheduled_at: string | null;
  views: number;
  created_at: string;
  updated_at: string;
  cover_image: string | null;
  summary: string;
  reading_time: number;
  featured: boolean;
  author_id: string;
  content_html: string | null;
}

interface BlogPostRevision {
  id: string;
  post_id: string;
  content_json: any;
  title: string;
  summary: string;
  created_at: string;
  created_by: string | null;
  revision_number: number;
  change_description: string;
}

const AdminBlogPostsHistory = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [authorFilter, setAuthorFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  
  // Revision modal state
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [revisions, setRevisions] = useState<BlogPostRevision[]>([]);
  const [revisionsDialogOpen, setRevisionsDialogOpen] = useState(false);
  const [loadingRevisions, setLoadingRevisions] = useState(false);
  
  // Diff modal state
  const [diffDialogOpen, setDiffDialogOpen] = useState(false);
  const [selectedRevision, setSelectedRevision] = useState<BlogPostRevision | null>(null);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('updated_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (authorFilter !== 'all') {
        query = query.eq('author_id', authorFilter);
      }

      if (dateFilter !== 'all') {
        const days = parseInt(dateFilter);
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - days);
        query = query.gte('updated_at', dateThreshold.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      toast.error('Erro ao carregar posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchRevisions = async (postId: string) => {
    try {
      setLoadingRevisions(true);
      const { data, error } = await supabase
        .from('blog_post_revisions')
        .select('*')
        .eq('post_id', postId)
        .order('revision_number', { ascending: false });

      if (error) throw error;
      setRevisions(data || []);
    } catch (error) {
      console.error('Erro ao carregar revisões:', error);
      toast.error('Erro ao carregar revisões');
    } finally {
      setLoadingRevisions(false);
    }
  };

  const handleShowRevisions = async (post: BlogPost) => {
    setSelectedPost(post);
    setRevisionsDialogOpen(true);
    await fetchRevisions(post.id);
  };

  const handleShowDiff = (revision: BlogPostRevision, post: BlogPost) => {
    setSelectedRevision(revision);
    setCurrentPost(post);
    setDiffDialogOpen(true);
  };

  const handleRestoreRevision = async (revision: BlogPostRevision) => {
    if (!selectedPost) return;

    try {
      const { error } = await supabase.rpc('restore_blog_post_revision', {
        p_post_id: selectedPost.id,
        p_revision_id: revision.id
      });

      if (error) throw error;

      toast.success(`Revisão #${revision.revision_number} restaurada com sucesso`);
      setRevisionsDialogOpen(false);
      fetchPosts();
    } catch (error: any) {
      console.error('Erro ao restaurar revisão:', error);
      toast.error(error.message || 'Erro ao restaurar revisão');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [statusFilter, authorFilter, dateFilter]);

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: { variant: 'secondary' as const, label: 'Rascunho' },
      published: { variant: 'default' as const, label: 'Publicado' },
      scheduled: { variant: 'outline' as const, label: 'Agendado' }
    };
    
    return variants[status as keyof typeof variants] || variants.draft;
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderDiffView = () => {
    if (!selectedRevision || !currentPost) return null;

    const revisionContent = selectedRevision.content_json;
    const currentTitle = currentPost.title;
    const currentSummary = currentPost.summary;
    const revisionTitle = revisionContent.title || selectedRevision.title;
    const revisionSummary = revisionContent.summary || selectedRevision.summary;

    return (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Título</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Atual</p>
              <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
                {currentTitle}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Revisão #{selectedRevision.revision_number}</p>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                {revisionTitle}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Resumo</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Atual</p>
              <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
                {currentSummary}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Revisão #{selectedRevision.revision_number}</p>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                {revisionSummary}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Conteúdo</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Atual</p>
              <div className="p-3 bg-green-50 border border-green-200 rounded text-sm max-h-40 overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: currentPost.content_html || 'Sem conteúdo' }} />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Revisão #{selectedRevision.revision_number}</p>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm max-h-40 overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: revisionContent.content_html || 'Sem conteúdo' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/admin')}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Histórico de Posts do Blog</h1>
                <p className="text-muted-foreground">
                  Gerencie posts e visualize o histórico de revisões
                </p>
              </div>
            </div>
            <Button onClick={() => navigate('/admin/posts/new')}>
              <FileText className="h-4 w-4 mr-2" />
              Novo Post
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="scheduled">Agendado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os períodos</SelectItem>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 3 meses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-pulse text-lg">Carregando posts...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const statusInfo = getStatusBadge(post.status);
              
              return (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      {post.cover_image && (
                        <div className="w-full md:w-48 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={post.cover_image} 
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold line-clamp-2">{post.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {post.summary}
                            </p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleShowRevisions(post)}
                            >
                              <History className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/admin/posts/edit/${post.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {post.status === 'published' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{post.author_name}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{post.views} visualizações</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{post.reading_time} min de leitura</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Badge {...statusInfo}>
                            {statusInfo.label}
                          </Badge>
                          
                          {post.featured && (
                            <Badge variant="outline">
                              Destaque
                            </Badge>
                          )}

                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {post.status === 'published' && post.published_at ? (
                              <span>Publicado em {format(new Date(post.published_at), 'dd/MM/yyyy', { locale: ptBR })}</span>
                            ) : post.status === 'scheduled' && post.scheduled_at ? (
                              <span>Agendado para {format(new Date(post.scheduled_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                            ) : (
                              <span>Atualizado em {format(new Date(post.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filteredPosts.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum post encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca' 
                : 'Comece criando seu primeiro post'
              }
            </p>
            <Button onClick={() => navigate('/admin/posts/new')}>
              <FileText className="h-4 w-4 mr-2" />
              Criar Post
            </Button>
          </div>
        )}

        {/* Revisions Dialog */}
        <Dialog open={revisionsDialogOpen} onOpenChange={setRevisionsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Histórico de Revisões</DialogTitle>
              <DialogDescription>
                {selectedPost?.title}
              </DialogDescription>
            </DialogHeader>

            {loadingRevisions ? (
              <div className="text-center py-8">
                <div className="animate-pulse">Carregando revisões...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {revisions.map((revision) => (
                  <Card key={revision.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">
                              Revisão #{revision.revision_number}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(revision.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </span>
                          </div>
                          <h4 className="font-medium">{revision.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {revision.change_description}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShowDiff(revision, selectedPost!)}
                          >
                            <Diff className="h-4 w-4 mr-1" />
                            Diff
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestoreRevision(revision)}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Restaurar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {revisions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma revisão encontrada para este post
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Diff Dialog */}
        <Dialog open={diffDialogOpen} onOpenChange={setDiffDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Comparar Versões</DialogTitle>
              <DialogDescription>
                Comparação entre a versão atual e a revisão #{selectedRevision?.revision_number}
              </DialogDescription>
            </DialogHeader>

            {renderDiffView()}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDiffDialogOpen(false)}>
                Fechar
              </Button>
              {selectedRevision && (
                <Button onClick={() => handleRestoreRevision(selectedRevision)}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restaurar Esta Revisão
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminBlogPostsHistory;