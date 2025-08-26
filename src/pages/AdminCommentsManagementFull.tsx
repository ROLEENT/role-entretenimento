import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MessageSquare, Check, X, Trash2, Filter } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  author_email: string;
  content: string;
  is_approved: boolean;
  created_at: string;
  post_title: string;
}

const AdminCommentsManagementFull = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_blog_comments_admin');

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
      toast.error('Erro ao carregar comentários');
    } finally {
      setLoading(false);
    }
  };

  const approveComment = async (commentId: string) => {
    try {
      const { error } = await supabase.rpc('approve_blog_comment', {
        p_comment_id: commentId
      });

      if (error) throw error;

      toast.success('Comentário aprovado com sucesso');
      fetchComments();
    } catch (error) {
      console.error('Erro ao aprovar comentário:', error);
      toast.error('Erro ao aprovar comentário');
    }
  };

  const rejectComment = async (commentId: string) => {
    try {
      const { error } = await supabase.rpc('reject_blog_comment', {
        p_comment_id: commentId
      });

      if (error) throw error;

      toast.success('Comentário rejeitado com sucesso');
      fetchComments();
    } catch (error) {
      console.error('Erro ao rejeitar comentário:', error);
      toast.error('Erro ao rejeitar comentário');
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase.rpc('delete_blog_comment', {
        p_comment_id: commentId
      });

      if (error) throw error;

      toast.success('Comentário deletado com sucesso');
      fetchComments();
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
      toast.error('Erro ao deletar comentário');
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const filteredComments = comments.filter(comment => {
    if (filter === 'approved') return comment.is_approved;
    if (filter === 'pending') return !comment.is_approved;
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestão de Comentários</h1>
          <p className="text-muted-foreground">
            Modere comentários do blog e destaques
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <Select value={filter} onValueChange={(value: 'all' | 'approved' | 'pending') => setFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="approved">Aprovados</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {filteredComments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum comentário encontrado</h3>
            <p className="text-muted-foreground text-center">
              {filter !== 'all' ? `Nenhum comentário ${filter === 'approved' ? 'aprovado' : 'pendente'} encontrado` : 'Ainda não há comentários para moderar'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredComments.map((comment) => (
            <Card key={comment.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {comment.author_name}
                      <Badge variant={comment.is_approved ? 'default' : 'secondary'}>
                        {comment.is_approved ? 'Aprovado' : 'Pendente'}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      <div className="space-y-1">
                        <div>Email: {comment.author_email}</div>
                        <div>Post: {comment.post_title}</div>
                        <div>Data: {formatDate(comment.created_at)}</div>
                      </div>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm bg-muted p-3 rounded-lg">
                    {comment.content}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  {!comment.is_approved && (
                    <Button 
                      size="sm" 
                      onClick={() => approveComment(comment.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Aprovar
                    </Button>
                  )}
                  
                  {comment.is_approved && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => rejectComment(comment.id)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Rejeitar
                    </Button>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Deletar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. O comentário será permanentemente deletado.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteComment(comment.id)}>
                          Deletar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCommentsManagementFull;