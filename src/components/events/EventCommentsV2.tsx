import React, { useState } from 'react';
import { MessageCircle, Heart, Reply, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useEventComments, EventComment } from '@/hooks/useEventComments';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventCommentsProps {
  eventId: string;
  className?: string;
}

interface CommentItemProps {
  comment: EventComment;
  onReply: (parentId: string) => void;
  onEdit: (commentId: string, content: string) => Promise<boolean>;
  onDelete: (commentId: string) => Promise<boolean>;
  onLike: (commentId: string) => Promise<boolean>;
  isReply?: boolean;
  currentUserId?: string;
}

function CommentItem({ 
  comment, 
  onReply, 
  onEdit, 
  onDelete, 
  onLike, 
  isReply = false,
  currentUserId 
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const isOwner = currentUserId === comment.user_id;
  const displayName = comment.user_profiles?.display_name || 'Usuário';
  const avatarUrl = comment.user_profiles?.avatar_url;

  const handleEdit = async () => {
    if (editContent.trim() && editContent !== comment.content) {
      const success = await onEdit(comment.id, editContent);
      if (success) {
        setIsEditing(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleReply = (parentId: string) => {
    onReply(parentId);
    setShowReplyForm(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className={`space-y-3 ${isReply ? 'ml-8 border-l-2 border-muted pl-4' : ''}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="text-xs">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{displayName}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </span>
            {comment.is_edited && (
              <Badge variant="outline" className="text-xs">
                editado
              </Badge>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[80px]"
                placeholder="Edite seu comentário..."
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleEdit}>
                  Salvar
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>

              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onLike(comment.id)}
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                >
                  <Heart className={`h-3 w-3 mr-1 ${comment.user_liked ? 'fill-current text-red-500' : ''}`} />
                  {comment.like_count > 0 && (
                    <span className="text-xs">{comment.like_count}</span>
                  )}
                </Button>

                {!isReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="h-8 px-2 text-muted-foreground hover:text-foreground"
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    <span className="text-xs">Responder</span>
                  </Button>
                )}

                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit2 className="h-3 w-3 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(comment.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reply Form */}
      {showReplyForm && !isReply && (
        <div className="ml-11">
          <CommentForm
            onSubmit={(content) => handleReply(comment.id)}
            placeholder="Escreva uma resposta..."
            buttonText="Responder"
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onLike={onLike}
              isReply={true}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CommentFormProps {
  onSubmit: (content: string) => Promise<boolean> | void;
  placeholder?: string;
  buttonText?: string;
  onCancel?: () => void;
}

function CommentForm({ onSubmit, placeholder = "Escreva um comentário...", buttonText = "Comentar", onCancel }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    const result = await onSubmit(content);
    if (result !== false) {
      setContent('');
      onCancel?.();
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="min-h-[100px]"
        disabled={submitting}
      />
      <div className="flex gap-2">
        <Button 
          type="submit" 
          disabled={!content.trim() || submitting}
          size="sm"
        >
          {submitting ? 'Enviando...' : buttonText}
        </Button>
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            size="sm"
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}

export function EventComments({ eventId, className }: EventCommentsProps) {
  const { user } = useAuth();
  const {
    comments,
    loading,
    submitting,
    addComment,
    editComment,
    deleteComment,
    toggleCommentLike
  } = useEventComments(eventId);

  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const handleReply = (parentId: string) => {
    setReplyingTo(parentId);
  };

  const handleSubmitReply = async (content: string) => {
    if (replyingTo) {
      const success = await addComment(content, replyingTo);
      if (success) {
        setReplyingTo(null);
      }
      return success;
    }
    return false;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <MessageCircle className="h-6 w-6 animate-pulse text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Carregando os comentários do rolê...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comentários
          {comments.length > 0 && (
            <Badge variant="secondary">{comments.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        {user ? (
          <CommentForm
            onSubmit={(content) => addComment(content)}
            placeholder="Como foi o rolê? Conta aí..."
          />
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p>Entre na conversa! Faça login para comentar</p>
          </div>
        )}

        {/* Comments List */}
        {comments.length > 0 ? (
          <div className="space-y-6">
            <Separator />
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={handleReply}
                onEdit={editComment}
                onDelete={deleteComment}
                onLike={toggleCommentLike}
                currentUserId={user?.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum comentário ainda... que tal ser o primeiro a mandar um salve? 👋</p>
          </div>
        )}

        {/* Reply Form Modal */}
        {replyingTo && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle>Responder comentário</CardTitle>
              </CardHeader>
              <CardContent>
                <CommentForm
                  onSubmit={handleSubmitReply}
                  placeholder="Escreva sua resposta..."
                  buttonText="Responder"
                  onCancel={() => setReplyingTo(null)}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}