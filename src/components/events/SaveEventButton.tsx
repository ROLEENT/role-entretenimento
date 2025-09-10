import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAnimatedToast } from '@/hooks/useAnimatedToast';

interface SaveEventButtonProps {
  eventId: string;
  className?: string;
}

export function SaveEventButton({ eventId, className }: SaveEventButtonProps) {
  const { user } = useAuth();
  const { showAnimatedToast } = useAnimatedToast();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      checkIfSaved();
    }
  }, [user?.id, eventId]);

  const checkIfSaved = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('event_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('event_id', eventId)
        .maybeSingle();

      if (error) throw error;
      setIsSaved(!!data);
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const toggleSave = async () => {
    if (!user?.id) {
      showAnimatedToast({
        title: 'Entre na sua conta!',
        description: 'Faça login para salvar seus rolês favoritos',
        icon: 'star',
      });
      return;
    }

    setLoading(true);
    try {
      if (isSaved) {
        // Remove from favorites
        await supabase
          .from('event_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('event_id', eventId);

        setIsSaved(false);
        showAnimatedToast({
          title: 'Removido dos salvos',
          description: 'Rolê removido da sua lista',
          icon: 'star',
        });
      } else {
        // Add to favorites
        await supabase
          .from('event_favorites')
          .insert({
            user_id: user.id,
            event_id: eventId
          });

        setIsSaved(true);
        showAnimatedToast({
          title: 'Salvo para depois! 📌',
          description: 'Rolê adicionado aos seus favoritos',
          icon: 'star',
        });
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      showAnimatedToast({
        title: 'Ops, algo deu errado',
        description: 'Tente novamente em alguns segundos',
        icon: 'copy',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isSaved ? "default" : "outline"}
      size="sm"
      onClick={toggleSave}
      disabled={loading}
      className={`flex items-center gap-2 ${className}`}
    >
      {isSaved ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {isSaved ? 'Salvo' : 'Salvar para depois'}
    </Button>
  );
}