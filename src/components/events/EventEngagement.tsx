import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Users, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface EventEngagementProps {
  eventId: string;
  eventDate: Date;
  className?: string;
}

interface EngagementData {
  likes: number;
  comments: number;
  reactions: {
    interested: number;
    going: number;
    maybe: number;
    not_going: number;
  };
  userReaction?: string;
  userLiked: boolean;
}

export function EventEngagement({ eventId, eventDate, className }: EventEngagementProps) {
  const { user } = useAuth();
  const [engagement, setEngagement] = useState<EngagementData>({
    likes: 0,
    comments: 0,
    reactions: { interested: 0, going: 0, maybe: 0, not_going: 0 },
    userReaction: undefined,
    userLiked: false
  });
  const [loading, setLoading] = useState(false);
  const isEventPassed = new Date() > eventDate;

  useEffect(() => {
    fetchEngagementData();
    subscribeToRealTimeUpdates();
  }, [eventId, user?.id]);

  const fetchEngagementData = async () => {
    try {
      // Fetch likes count
      const { count: likesCount } = await supabase
        .from('event_likes')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('reaction_type', 'like');

      // Fetch comments count  
      const { count: commentsCount } = await supabase
        .from('event_comments')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);

      // Fetch reactions count
      const { data: reactionsData } = await supabase
        .from('event_reactions')
        .select('reaction_type')
        .eq('event_id', eventId);

      const reactions = {
        interested: reactionsData?.filter(r => r.reaction_type === 'interested').length || 0,
        going: reactionsData?.filter(r => r.reaction_type === 'going').length || 0,
        maybe: reactionsData?.filter(r => r.reaction_type === 'maybe').length || 0,
        not_going: reactionsData?.filter(r => r.reaction_type === 'not_going').length || 0,
      };

      // Check user's reactions if authenticated
      let userReaction = undefined;
      let userLiked = false;

      if (user?.id) {
        const { data: userReactionData } = await supabase
          .from('event_reactions')
          .select('reaction_type')
          .eq('event_id', eventId)
          .eq('user_id', user.id)
          .maybeSingle();

        const { data: userLikeData } = await supabase
          .from('event_likes')
          .select('id')
          .eq('event_id', eventId)
          .eq('user_id', user.id)
          .eq('reaction_type', 'like')
          .maybeSingle();

        userReaction = userReactionData?.reaction_type;
        userLiked = !!userLikeData;
      }

      setEngagement({
        likes: likesCount || 0,
        comments: commentsCount || 0,
        reactions,
        userReaction,
        userLiked
      });
    } catch (error) {
      console.error('Error fetching engagement data:', error);
    }
  };

  const subscribeToRealTimeUpdates = () => {
    const channel = supabase
      .channel(`event-engagement-${eventId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'event_likes',
        filter: `event_id=eq.${eventId}`
      }, () => {
        fetchEngagementData();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'event_reactions',
        filter: `event_id=eq.${eventId}`
      }, () => {
        fetchEngagementData();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'event_comments',
        filter: `event_id=eq.${eventId}`
      }, () => {
        fetchEngagementData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleLike = async () => {
    if (!user?.id) {
      toast.error('Você precisa estar logado para curtir');
      return;
    }

    setLoading(true);
    try {
      if (engagement.userLiked) {
        // Remove like
        await supabase
          .from('event_likes')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id)
          .eq('reaction_type', 'like');
        
        toast.success('Curtida removida');
      } else {
        // Add like
        await supabase
          .from('event_likes')
          .insert({
            event_id: eventId,
            user_id: user.id,
            reaction_type: 'like'
          });
        
        toast.success('Evento curtido!');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Erro ao curtir evento');
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (reactionType: string) => {
    if (!user?.id) {
      toast.error('Você precisa estar logado para reagir');
      return;
    }

    setLoading(true);
    try {
      if (engagement.userReaction === reactionType) {
        // Remove reaction
        await supabase
          .from('event_reactions')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);
        
        toast.success('Reação removida');
      } else {
        // Add/update reaction
        await supabase
          .from('event_reactions')
          .upsert({
            event_id: eventId,
            user_id: user.id,
            reaction_type: reactionType
          });
        
        const reactionText = {
          interested: 'Tenho interesse',
          going: 'Vou participar',
          maybe: 'Talvez vá',
          not_going: 'Não vou'
        }[reactionType];
        
        toast.success(`Marcado como: ${reactionText}`);
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
      toast.error('Erro ao atualizar reação');
    } finally {
      setLoading(false);
    }
  };

  const getReactionEmoji = (type: string) => {
    switch (type) {
      case 'interested': return '🤔';
      case 'going': return '✅';
      case 'maybe': return '🤷';
      case 'not_going': return '❌';
      default: return '';
    }
  };

  const getReactionText = (type: string) => {
    switch (type) {
      case 'interested': return 'Interessado';
      case 'going': return 'Vou';
      case 'maybe': return 'Talvez';
      case 'not_going': return 'Não vou';
      default: return '';
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-4">
        {/* Engagement Stats */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span>{engagement.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{engagement.comments}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{Object.values(engagement.reactions).reduce((a, b) => a + b, 0)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        {user && !isEventPassed && (
          <div className="space-y-3">
            {/* Like Button */}
            <div className="flex gap-2">
              <Button
                variant={engagement.userLiked ? "default" : "outline"}
                size="sm"
                onClick={handleLike}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Heart className={`h-4 w-4 ${engagement.userLiked ? 'fill-current' : ''}`} />
                Curtir
              </Button>
            </div>

            {/* Reaction Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {(['interested', 'going', 'maybe', 'not_going'] as const).map((type) => (
                <Button
                  key={type}
                  variant={engagement.userReaction === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleReaction(type)}
                  disabled={loading}
                  className="flex items-center gap-2 text-xs"
                >
                  <span>{getReactionEmoji(type)}</span>
                  {getReactionText(type)}
                  {engagement.reactions[type] > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                      {engagement.reactions[type]}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Reaction Summary for Past Events */}
        {isEventPassed && Object.values(engagement.reactions).some(v => v > 0) && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Interesse do público:</h4>
            <div className="flex flex-wrap gap-2">
              {(['going', 'interested', 'maybe'] as const).map((type) => (
                engagement.reactions[type] > 0 && (
                  <Badge key={type} variant="outline" className="flex items-center gap-1">
                    <span>{getReactionEmoji(type)}</span>
                    {engagement.reactions[type]} {getReactionText(type).toLowerCase()}
                  </Badge>
                )
              ))}
            </div>
          </div>
        )}

        {/* Login Prompt */}
        {!user && (
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">
              <span>Faça login para curtir e reagir aos eventos</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}