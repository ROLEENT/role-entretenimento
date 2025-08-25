import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface LikeSystemProps {
  entityId: string;
  entityType: 'event' | 'highlight';
  initialLikeCount?: number;
  showCount?: boolean;
}

export const LikeSystem: React.FC<LikeSystemProps> = ({
  entityId,
  entityType,
  initialLikeCount = 0,
  showCount = true
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkUserLike();
    }
    fetchLikeCount();
  }, [user, entityId]);

  const checkUserLike = async () => {
    if (!user) return;

    try {
      const tableName = entityType === 'event' ? 'event_favorites' : 'highlight_likes';
      const columnName = entityType === 'event' ? 'event_id' : 'highlight_id';
      
      const { data, error } = await supabase
        .from(tableName)
        .select('id')
        .eq(columnName, entityId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao verificar curtida:', error);
        return;
      }

      setIsLiked(!!data);
    } catch (error) {
      console.error('Erro ao verificar curtida:', error);
    }
  };

  const fetchLikeCount = async () => {
    try {
      const tableName = entityType === 'event' ? 'event_favorites' : 'highlight_likes';
      const columnName = entityType === 'event' ? 'event_id' : 'highlight_id';
      
      const { count, error } = await supabase
        .from(tableName)
        .select('id', { count: 'exact' })
        .eq(columnName, entityId);

      if (error) {
        console.error('Erro ao buscar contagem de curtidas:', error);
        return;
      }

      setLikeCount(count || 0);
    } catch (error) {
      console.error('Erro ao buscar contagem de curtidas:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para curtir este conteúdo",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const tableName = entityType === 'event' ? 'event_favorites' : 'highlight_likes';
      const columnName = entityType === 'event' ? 'event_id' : 'highlight_id';

      if (isLiked) {
        // Remover curtida
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq(columnName, entityId)
          .eq('user_id', user.id);

        if (error) throw error;

        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        // Adicionar curtida
        const { error } = await supabase
          .from(tableName)
          .insert({
            [columnName]: entityId,
            user_id: user.id
          });

        if (error) throw error;

        setIsLiked(true);
        setLikeCount(prev => prev + 1);

        // Criar atividade no feed
        await supabase.rpc('create_activity', {
          p_user_id: user.id, // O dono do conteúdo recebe a notificação
          p_actor_id: user.id,
          p_type: entityType === 'event' ? 'event_favorite' : 'highlight_like',
          p_object_type: entityType,
          p_object_id: entityId,
          p_data: {
            [entityType === 'event' ? 'event_title' : 'highlight_title']: 'Conteúdo'
          }
        });
      }
    } catch (error) {
      console.error('Erro ao curtir:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua curtida",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={isLoading}
      className={`group flex items-center gap-2 transition-all duration-200 ${
        isLiked 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-muted-foreground hover:text-red-500'
      }`}
    >
      <Heart 
        className={`h-4 w-4 transition-all duration-300 ${
          isLiked ? 'fill-current animate-pulse' : ''
        } ${
          isLoading ? 'animate-bounce' : 'group-hover:scale-110'
        }`} 
      />
      {showCount && (
        <span className={`transition-all duration-300 ${
          isLoading ? 'animate-pulse' : ''
        }`}>
          {likeCount}
        </span>
      )}
    </Button>
  );
};