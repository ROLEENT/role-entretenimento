import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { commentService, type BlogComment } from '@/services/commentService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, X, Trash2, Filter, CheckSquare } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';


const AdminCommentsManagement = () => {
  const { isAuthenticated, loading } = useAdminAuth();
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [selectedComments, setSelectedComments] = useState<string[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchComments();
    }
  }, [isAuthenticated]);

  const fetchComments = async () => {
    try {
      const data = await commentService.getAllComments();
      setComments(data);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
      toast.error('Erro ao carregar comentários');
    } finally {
      setLoadingComments(false);
    }
  };

  const approveComment = async (id: string) => {
    try {
      await commentService.approveComment(id);
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
      await commentService.rejectComment(id);
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
      await commentService.deleteComment(id);
      setComments(prev => prev.filter(comment => comment.id !== id));
      toast.success('Comentário deletado');
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
      toast.error('Erro ao deletar comentário');
    }
  };

  const bulkApprove = async () => {
    try {
      await Promise.all(selectedComments.map(id => commentService.approveComment(id)));
      setComments(prev => 
        prev.map(comment => 
          selectedComments.includes(comment.id) ? { ...comment, is_approved: true } : comment
        )
      );
      setSelectedComments([]);
      toast.success(`${selectedComments.length} comentários aprovados`);
    } catch (error) {
      console.error('Erro ao aprovar comentários em lote:', error);
      toast.error('Erro ao aprovar comentários');
    }
  };

  const toggleCommentSelection = (commentId: string) => {
    setSelectedComments(prev => 
      prev.includes(commentId) 
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  const toggleSelectAll = () => {
    const filteredComments = getFilteredComments();
    const allSelected = filteredComments.every(comment => selectedComments.includes(comment.id));
    
    if (allSelected) {
      setSelectedComments([]);
    } else {
      setSelectedComments(filteredComments.map(comment => comment.id));
    }
  };

  const getFilteredComments = () => {
    switch (statusFilter) {
      case 'pending':
        return comments.filter(comment => !comment.is_approved);
      case 'approved':
        return comments.filter(comment => comment.is_approved);
      default:
        return comments;
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
    return <Navigate to="/admin/login" replace />;
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
            
            {/* Filters and Bulk Actions */}
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os comentários</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="approved">Aprovados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {selectedComments.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={bulkApprove}
                    className="gap-2"
                  >
                    <CheckSquare className="h-4 w-4" />
                    Aprovar selecionados ({selectedComments.length})
                  </Button>
                </div>
              )}
            </div>
          </div>

          {loadingComments ? (
            <div className="text-center py-8">
              <p>Carregando comentários...</p>
            </div>
          ) : getFilteredComments().length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">Nenhum comentário encontrado</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Select All Checkbox */}
              <div className="flex items-center gap-2 p-2 border rounded">
                <Checkbox
                  checked={getFilteredComments().length > 0 && getFilteredComments().every(comment => selectedComments.includes(comment.id))}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm">Selecionar todos ({getFilteredComments().length})</span>
              </div>
              
              {getFilteredComments().map((comment) => (
                <Card key={comment.id} className={selectedComments.includes(comment.id) ? 'ring-2 ring-primary' : ''}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedComments.includes(comment.id)}
                          onCheckedChange={() => toggleCommentSelection(comment.id)}
                        />
                        <div>
                          <CardTitle className="text-lg">{comment.post_title || 'Artigo sem título'}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Por: {comment.author_name} ({comment.author_email})
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(comment.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
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