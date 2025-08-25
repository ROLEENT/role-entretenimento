import { MessageCircle } from 'lucide-react';
import { useCommentCount } from '@/hooks/useCommentCount';

interface CommentCounterProps {
  entityId: string;
  entityType: 'event' | 'highlight' | 'blog';
  className?: string;
}

export const CommentCounter = ({ entityId, entityType, className = '' }: CommentCounterProps) => {
  const { commentCount, loading } = useCommentCount(entityId, entityType);

  if (loading || commentCount === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1 text-sm text-muted-foreground ${className}`}>
      <MessageCircle className="h-4 w-4" />
      <span>{commentCount} comentário{commentCount !== 1 ? 's' : ''}</span>
    </div>
  );
};