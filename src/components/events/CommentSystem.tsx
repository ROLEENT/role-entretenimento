import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, MoreHorizontal, Trash, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  parent_id?: string;
  profiles?: {
    display_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

interface CommentSystemProps {
  entityId: string;
  entityType: 'event' | 'highlight';
}

export const CommentSystem: React.FC<CommentSystemProps> = ({
  entityId,
  entityType
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, [entityId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const tableName = entityType === 'event' ? 'event_comments' : 'highlight_comments';
      const columnName = entityType === 'event' ? 'event_id' : 'highlight_id';
      
      const { data, error } = await supabase
        .from(tableName)
        .select(`
          *,
          profiles:user_id(display_name, username, avatar_url)
        `)
        .eq(columnName, entityId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os comentários",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para comentar",
        variant: "destructive"
      });
      return;
    }

    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const tableName = entityType === 'event' ? 'event_comments' : 'highlight_comments';
      const columnName = entityType === 'event' ? 'event_id' : 'highlight_id';
      
      const { error } = await supabase
        .from(tableName)
        .insert({
          [columnName]: entityId,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      await fetchComments();

      // Criar atividade no feed
      await supabase.rpc('create_activity', {
        p_user_id: user.id, // O dono do conteúdo recebe a notificação
        p_actor_id: user.id,
        p_type: 'comment',
        p_object_type: entityType,
        p_object_id: entityId,
        p_data: {
          comment_preview: newComment.substring(0, 50)
        }
      });

      toast({
        title: "Comentário enviado!",
        description: "Seu comentário foi publicado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o comentário",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!user || !replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      const tableName = entityType === 'event' ? 'event_comments' : 'highlight_comments';
      const columnName = entityType === 'event' ? 'event_id' : 'highlight_id';
      
      const { error } = await supabase
        .from(tableName)
        .insert({
          [columnName]: entityId,
          user_id: user.id,
          content: replyContent.trim(),
          parent_id: parentId
        });

      if (error) throw error;

      setReplyContent('');
      setReplyingTo(null);
      await fetchComments();
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a resposta",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editingContent.trim()) return;

    try {
      const tableName = entityType === 'event' ? 'event_comments' : 'highlight_comments';
      
      const { error } = await supabase
        .from(tableName)
        .update({
          content: editingContent.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId);

      if (error) throw error;

      setEditingId(null);
      setEditingContent('');
      await fetchComments();
    } catch (error) {
      console.error('Erro ao editar comentário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível editar o comentário",
        variant: "destructive"
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const tableName = entityType === 'event' ? 'event_comments' : 'highlight_comments';
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      await fetchComments();
      toast({
        title: "Comentário excluído",
        description: "O comentário foi removido com sucesso"
      });
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o comentário",
        variant: "destructive"
      });
    }
  };

  const renderComment = (comment: Comment) => {
    const isOwner = user?.id === comment.user_id;
    const replies = comments.filter(c => c.parent_id === comment.id);
    
    return (
      <div key={comment.id} className="space-y-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.profiles?.avatar_url} />
                  <AvatarFallback>
                    {(comment.profiles?.display_name || comment.profiles?.username || 'U')[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">
                      {comment.profiles?.display_name || comment.profiles?.username || 'Usuário'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                  
                  {editingId === comment.id ? (
                    <div className="mt-2 space-y-2">
                      <Textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        placeholder="Edite seu comentário..."
                        className="min-h-[60px]"
                      />
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleEditComment(comment.id)}
                          disabled={!editingContent.trim()}
                        >
                          Salvar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setEditingId(null);
                            setEditingContent('');
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm">{comment.content}</p>
                  )}
                  
                  <div className="mt-2 flex items-center space-x-2">
                    {user && !editingId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="text-xs"
                      >
                        Responder
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {isOwner && editingId !== comment.id && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditingContent(comment.content);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-600"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            {replyingTo === comment.id && (
              <div className="mt-3 pl-11 space-y-2">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Escreva uma resposta..."
                  className="min-h-[60px]"
                />
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={!replyContent.trim() || isSubmitting}
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Responder
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Respostas */}
        {replies.length > 0 && (
          <div className="ml-8 space-y-3">
            {replies.map(reply => renderComment(reply))}
          </div>
        )}
      </div>
    );
  };

  const topLevelComments = comments.filter(c => !c.parent_id);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <MessageCircle className="h-5 w-5" />
        <h3 className="text-lg font-semibold">
          Comentários ({topLevelComments.length})
        </h3>
      </div>

      {user && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escreva um comentário..."
                className="min-h-[80px]"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Enviando...' : 'Comentar'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-4">
          <p className="text-muted-foreground">Carregando comentários...</p>
        </div>
      ) : topLevelComments.length > 0 ? (
        <div className="space-y-4">
          {topLevelComments.map(comment => renderComment(comment))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Seja o primeiro a comentar!
          </p>
        </div>
      )}
    </div>
  );
};