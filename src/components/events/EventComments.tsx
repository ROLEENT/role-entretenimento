import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Send, Reply } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationTriggers } from '@/hooks/useNotificationTriggers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id?: string;
  user?: {
    display_name?: string;
    avatar_url?: string;
  };
  replies?: Comment[];
}

interface EventCommentsProps {
  eventId: string;
}

const EventComments = ({ eventId }: EventCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const { isAuthenticated, user } = useAuth();
  const { triggerCommentReplyNotification } = useNotificationTriggers();

  useEffect(() => {
    fetchComments();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('event_comments')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'event_comments',
          filter: `event_id=eq.${eventId}`
        }, 
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('event_comments')
        .select(`
          *
        `)
        .eq('event_id', eventId as any)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Organize comments into a tree structure
      const commentMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];

      // First pass: create comment objects
      data?.forEach((comment: any) => {
        const commentObj: Comment = {
          ...comment,
          replies: []
        };
        commentMap.set(comment.id, commentObj);
        
        if (!comment.parent_id) {
          rootComments.push(commentObj);
        }
      });

      // Second pass: organize replies
      data?.forEach((comment: any) => {
        if (comment.parent_id) {
          const parent = commentMap.get(comment.parent_id);
          const child = commentMap.get(comment.id);
          if (parent && child) {
            parent.replies!.push(child);
          }
        }
      });

      setComments(rootComments);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar comentários.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('event_comments')
        .insert({
          event_id: eventId,
          user_id: user!.id,
          content: newComment.trim()
        } as any);

      if (error) throw error;

      setNewComment('');
      toast({
        title: "Sucesso",
        description: "Comentário enviado!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao enviar comentário.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    
    if (!replyContent.trim()) return;

    try {
      setSubmitting(true);
      
      const { data, error } = await supabase
        .from('event_comments')
        .insert({
          event_id: eventId,
          user_id: user!.id,
          content: replyContent.trim(),
          parent_id: parentId
        } as any)
        .select()
        .single();

      if (error) throw error;

      // Trigger notificação de resposta
      if (data) {
        triggerCommentReplyNotification({
          parent_comment_id: parentId,
          replier_user_id: user!.id,
          content: replyContent.trim(),
          entity_type: 'event',
          entity_id: eventId
        });
      }

      setReplyContent('');
      setReplyingTo(null);
      toast({
        title: "Sucesso",
        description: "Resposta enviada!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao enviar resposta.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-12 border-l-2 border-muted pl-4' : ''}`}>
      <div className="flex items-start gap-3">
        <Avatar className="w-8 h-8">
          <AvatarFallback>
            U
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">
              Usuário
            </span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(comment.created_at), "d 'de' MMM 'às' HH:mm", { locale: ptBR })}
            </span>
          </div>
          
          <p className="text-sm text-foreground whitespace-pre-wrap mb-2">
            {comment.content}
          </p>
          
          {!isReply && isAuthenticated && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(comment.id)}
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
            >
              <Reply className="w-3 h-3 mr-1" />
              Responder
            </Button>
          )}
          
          {/* Reply Form */}
          {replyingTo === comment.id && (
            <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="mt-3">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Escreva sua resposta..."
                className="min-h-[60px] text-sm"
                disabled={submitting}
              />
              <div className="flex gap-2 mt-2">
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={submitting || !replyContent.trim()}
                  className="gap-1"
                >
                  {submitting ? (
                    <div className="w-3 h-3 animate-spin rounded-full border border-current border-t-transparent" />
                  ) : (
                    <Send className="w-3 h-3" />
                  )}
                  Responder
                </Button>
                
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Comentários ({comments.reduce((total, comment) => total + 1 + (comment.replies?.length || 0), 0)})
        </CardTitle>
        <CardDescription>
          Compartilhe suas experiências e tire dúvidas sobre o evento
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Comment Form */}
        {isAuthenticated ? (
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Deixe seu comentário sobre o evento..."
              className="min-h-[80px]"
              disabled={submitting}
            />
            
            <Button 
              type="submit" 
              disabled={submitting || !newComment.trim()}
              className="gap-2"
            >
              {submitting ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Comentar
            </Button>
          </form>
        ) : (
          <div className="text-center py-6 bg-muted/50 rounded-lg">
            <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground mb-3">
              Faça login para comentar
            </p>
            <Button onClick={() => window.location.href = '/auth'} size="sm">
              Fazer Login
            </Button>
          </div>
        )}

        {/* Comments List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted rounded w-1/4" />
                    <div className="h-3 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum comentário ainda. Seja o primeiro a comentar!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment, index) => (
              <div key={comment.id}>
                {renderComment(comment)}
                {index < comments.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventComments;