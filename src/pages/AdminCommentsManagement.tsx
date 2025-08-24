import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, X, Trash2 } from 'lucide-react';

interface BlogComment {
  id: string;
  post_id: string;
  author_name: string;
  author_email: string;
  content: string;
  is_approved: boolean;
  created_at: string;
  post_title: string;
}

const AdminCommentsManagement = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchComments();
    }
  }, [isAuthenticated, user]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase.rpc('get_blog_comments_admin');
      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
      toast.error('Erro ao carregar comentários');
    } finally {
      setLoadingComments(false);
    }
  };

  const approveComment = async (id: string) => {
    try {
      const { error } = await supabase.rpc('approve_blog_comment', { p_comment_id: id });
      if (error) throw error;
      setComments(prev => 
        prev.map(comment => 
          comment.id === id ? { ...comment, is_approved: true } : comment
        )
      );
      toast.success('Comentário aprovado');
    } catch (error) {
      console.error('Erro ao aprovar comentário:', error);
      toast.error('Erro ao aprovar comentário');
    }
  };

  const rejectComment = async (id: string) => {
    try {
      const { error } = await supabase.rpc('reject_blog_comment', { p_comment_id: id });
      if (error) throw error;
      setComments(prev => 
        prev.map(comment => 
          comment.id === id ? { ...comment, is_approved: false } : comment
        )
      );
      toast.success('Comentário rejeitado');
    } catch (error) {
      console.error('Erro ao rejeitar comentário:', error);
      toast.error('Erro ao rejeitar comentário');
    }
  };

  const deleteComment = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este comentário?')) return;
    
    try {
      const { error } = await supabase.rpc('delete_blog_comment', { p_comment_id: id });
      if (error) throw error;
      setComments(prev => prev.filter(comment => comment.id !== id));
      toast.success('Comentário deletado');
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
      toast.error('Erro ao deletar comentário');
    }
  };

  const getStatusColor = (is_approved: boolean) => {
    return is_approved ? 'bg-green-500' : 'bg-yellow-500';
  };

  const getStatusLabel = (is_approved: boolean) => {
    return is_approved ? 'Aprovado' : 'Pendente';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Carregando...</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Gerenciar Comentários</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie os comentários dos artigos do blog
            </p>
          </div>

          {loadingComments ? (
            <div className="text-center py-8">
              <p>Carregando comentários...</p>
            </div>
          ) : comments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">Nenhum comentário encontrado</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <Card key={comment.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{comment.post_title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Por: {comment.author_name} ({comment.author_email})
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(comment.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <Badge className={getStatusColor(comment.is_approved)}>
                        {getStatusLabel(comment.is_approved)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Comentário:</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex gap-2">
                        {!comment.is_approved && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => approveComment(comment.id)}
                            className="gap-2"
                          >
                            <Check className="h-4 w-4" />
                            Aprovar
                          </Button>
                        )}
                        {comment.is_approved && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => rejectComment(comment.id)}
                            className="gap-2"
                          >
                            <X className="h-4 w-4" />
                            Rejeitar
                          </Button>
                        )}
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deleteComment(comment.id)}
                          className="gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Deletar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminCommentsManagement;