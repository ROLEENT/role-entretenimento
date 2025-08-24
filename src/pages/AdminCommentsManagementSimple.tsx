import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

const AdminCommentsManagementSimple = () => {
  const { isAuthenticated } = useAdminAuth();
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchComments();
    }
  }, [isAuthenticated]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_blog_comments_admin');

      if (error) throw error;
      setComments(data || []);
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      toast.error('Erro ao carregar comentários');
    } finally {
      setLoading(false);
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
      
      toast.success('Comentário aprovado!');
    } catch (error: any) {
      console.error('Error approving comment:', error);
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
      
      toast.success('Comentário rejeitado!');
    } catch (error: any) {
      console.error('Error rejecting comment:', error);
      toast.error('Erro ao rejeitar comentário');
    }
  };

  const deleteComment = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este comentário?')) return;
    
    try {
      const { error } = await supabase.rpc('delete_blog_comment', { p_comment_id: id });
      
      if (error) throw error;
      
      setComments(prev => prev.filter(comment => comment.id !== id));
      
      toast.success('Comentário excluído!');
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      toast.error('Erro ao excluir comentário');
    }
  };

  const getStatusColor = (is_approved: boolean) => {
    return is_approved ? 'default' : 'secondary';
  };

  const getStatusLabel = (is_approved: boolean) => {
    return is_approved ? 'Aprovado' : 'Pendente';
  };

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Comentários</h1>
            <p className="text-muted-foreground mt-2">
              Moderar comentários do blog
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Comentário no artigo: {comment.post_title}
                    </CardTitle>
                    <CardDescription>
                      Por: <strong>{comment.author_name}</strong> ({comment.author_email})
                      <br />
                      Enviado em: {new Date(comment.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusColor(comment.is_approved)}>
                    {getStatusLabel(comment.is_approved)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="whitespace-pre-wrap">{comment.content}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    {!comment.is_approved && (
                      <Button
                        size="sm"
                        onClick={() => approveComment(comment.id)}
                      >
                        Aprovar
                      </Button>
                    )}
                    {comment.is_approved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectComment(comment.id)}
                      >
                        Rejeitar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteComment(comment.id)}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {comments.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Nenhum comentário encontrado.</p>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AdminCommentsManagementSimple;