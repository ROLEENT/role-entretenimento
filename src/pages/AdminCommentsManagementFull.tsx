import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Search, 
  Eye, 
  EyeOff, 
  Trash2, 
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  post_id: string;
  user_id: string | null;
  display_name: string;
  email_hash: string;
  content: string;
  created_at: string;
  is_hidden: boolean;
  parent_id: string | null;
  post_title?: string;
}

interface BlogPost {
  id: string;
  title: string;
}

interface PaginationData {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

const AdminCommentsManagement = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPost, setSelectedPost] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Paginação
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    perPage: 20,
    total: 0,
    totalPages: 0
  });

  // Carregar posts para filtro
  const loadPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title')
        .eq('status', 'published')
        .order('title');

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar posts:', error);
    }
  }, []);

  // Carregar comentários com paginação
  const loadComments = useCallback(async () => {
    try {
      setLoading(true);

      const offset = (pagination.page - 1) * pagination.perPage;

      // Query base
      let query = supabase
        .from('blog_comments')
        .select(`
          id,
          post_id,
          user_id,
          display_name,
          email_hash,
          content,
          created_at,
          is_hidden,
          parent_id,
          blog_posts!inner(title)
        `, { count: 'exact' });

      // Aplicar filtros
      if (selectedPost !== 'all') {
        query = query.eq('post_id', selectedPost);
      }

      if (statusFilter === 'visible') {
        query = query.eq('is_hidden', false);
      } else if (statusFilter === 'hidden') {
        query = query.eq('is_hidden', true);
      }

      if (searchTerm.trim()) {
        query = query.or(`display_name.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      // Aplicar paginação e ordenação
      const { data, error, count } = await query
        .range(offset, offset + pagination.perPage - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mapear dados com título do post
      const commentsWithPostTitle = (data || []).map(comment => ({
        ...comment,
        post_title: (comment.blog_posts as any)?.title || 'Post não encontrado'
      }));

      setComments(commentsWithPostTitle);
      
      // Atualizar paginação
      setPagination(prev => ({
        ...prev,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / prev.perPage)
      }));

    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar comentários: ' + error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage, selectedPost, statusFilter, searchTerm]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Ocultar/mostrar comentário
  const toggleCommentVisibility = async (commentId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('blog_comments')
        .update({ is_hidden: !currentStatus })
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: `Comentário ${!currentStatus ? 'ocultado' : 'exibido'} com sucesso`
      });

      loadComments();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao alterar visibilidade: ' + error.message,
        variant: 'destructive'
      });
    }
  };

  // Deletar comentário
  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('blog_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Comentário deletado com sucesso'
      });

      loadComments();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao deletar comentário: ' + error.message,
        variant: 'destructive'
      });
    }
  };

  // Formatação de data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // Handlers de filtro
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePostFilter = (value: string) => {
    setSelectedPost(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handlePerPageChange = (newPerPage: string) => {
    setPagination(prev => ({
      ...prev,
      page: 1,
      perPage: parseInt(newPerPage)
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedPost('all');
    setStatusFilter('all');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (loading && pagination.page === 1) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando comentários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Gerenciar Comentários</h1>
          <p className="text-muted-foreground">
            Modere comentários do blog de forma segura
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou conteúdo..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filtro por Post */}
            <Select value={selectedPost} onValueChange={handlePostFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por post" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os posts</SelectItem>
                {posts.map(post => (
                  <SelectItem key={post.id} value={post.id}>
                    {post.title.length > 30 ? `${post.title.substring(0, 30)}...` : post.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro por Status */}
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="visible">Visíveis</SelectItem>
                <SelectItem value="hidden">Ocultos</SelectItem>
              </SelectContent>
            </Select>

            {/* Itens por página */}
            <Select value={pagination.perPage.toString()} onValueChange={handlePerPageChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 por página</SelectItem>
                <SelectItem value="20">20 por página</SelectItem>
                <SelectItem value="50">50 por página</SelectItem>
              </SelectContent>
            </Select>

            {/* Limpar filtros */}
            <Button variant="outline" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Comentários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comentários ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Carregando...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || selectedPost !== 'all' || statusFilter !== 'all'
                  ? 'Nenhum comentário encontrado com os filtros aplicados.'
                  : 'Nenhum comentário encontrado.'}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {comments.map((comment) => (
                  <Card key={comment.id} className={`${comment.is_hidden ? 'bg-muted/50 border-dashed' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{comment.display_name}</span>
                            <Badge 
                              variant={comment.is_hidden ? "destructive" : "default"}
                              className="text-xs"
                            >
                              {comment.is_hidden ? 'Oculto' : 'Visível'}
                            </Badge>
                            {comment.parent_id && (
                              <Badge variant="outline" className="text-xs">
                                Resposta
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            <strong>Post:</strong> {comment.post_title}
                          </p>
                          
                          <p className="text-sm text-muted-foreground">
                            {formatDate(comment.created_at)}
                          </p>
                          
                          <div className="bg-muted/30 p-3 rounded-lg">
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleCommentVisibility(comment.id, comment.is_hidden)}
                            title={comment.is_hidden ? 'Exibir comentário' : 'Ocultar comentário'}
                          >
                            {comment.is_hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja deletar este comentário de "{comment.display_name}"?
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteComment(comment.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Deletar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Paginação */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {(pagination.page - 1) * pagination.perPage + 1} a{' '}
                    {Math.min(pagination.page * pagination.perPage, pagination.total)} de{' '}
                    {pagination.total} comentários
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm">
                      Página {pagination.page} de {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCommentsManagement;