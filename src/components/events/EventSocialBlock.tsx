import { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Users2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useSocialActions, EventSocialData } from '@/hooks/useSocialActions';

interface EventSocialBlockProps {
  eventId: string;
  className?: string;
}

export function EventSocialBlock({ eventId, className }: EventSocialBlockProps) {
  const { getEventSocial } = useSocialActions();
  const [socialData, setSocialData] = useState<EventSocialData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSocialData = async () => {
      setLoading(true);
      const data = await getEventSocial(eventId, 12);
      setSocialData(data);
      setLoading(false);
    };

    fetchSocialData();
  }, [eventId, getEventSocial]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Quem vai
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-muted rounded" />
              <div className="h-6 w-16 bg-muted rounded" />
              <div className="h-6 w-16 bg-muted rounded" />
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-8 w-8 bg-muted rounded-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!socialData) {
    return null;
  }

  const { going_count, maybe_count, went_count, avatars } = socialData;
  const totalCount = going_count + maybe_count + went_count;

  if (totalCount === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Quem vai
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Seja o primeiro a marcar presença neste evento!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Quem vai
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statistics */}
        <div className="flex flex-wrap gap-2">
          {going_count > 0 && (
            <Badge variant="secondary" className="gap-1">
              <UserCheck className="h-3 w-3" />
              {going_count} {going_count === 1 ? 'pessoa vai' : 'pessoas vão'}
            </Badge>
          )}
          {maybe_count > 0 && (
            <Badge variant="outline" className="gap-1">
              <Users2 className="h-3 w-3" />
              {maybe_count} talvez {maybe_count === 1 ? 'vá' : 'vão'}
            </Badge>
          )}
          {went_count > 0 && (
            <Badge variant="outline" className="gap-1">
              <UserX className="h-3 w-3" />
              {went_count} {went_count === 1 ? 'foi' : 'foram'}
            </Badge>
          )}
        </div>

        {/* Avatars */}
        {avatars.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Pessoas que marcaram presença:
            </p>
            <div className="flex flex-wrap gap-2">
              {avatars.map((avatarUrl, index) => (
                <Avatar key={index} className="h-8 w-8">
                  <AvatarImage src={avatarUrl} alt={`Pessoa ${index + 1}`} />
                  <AvatarFallback className="text-xs">
                    {(index + 1).toString()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {totalCount > avatars.length && (
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  +{totalCount - avatars.length}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}