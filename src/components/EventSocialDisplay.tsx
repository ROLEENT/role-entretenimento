import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface EventSocialData {
  going_count: number;
  maybe_count: number;
  went_count: number;
  avatars: string[];
}

interface EventSocialDisplayProps {
  eventId: string;
  className?: string;
}

export const EventSocialDisplay: React.FC<EventSocialDisplayProps> = ({
  eventId,
  className
}) => {
  const [socialData, setSocialData] = useState<EventSocialData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSocialData = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_event_social', {
            p_event_id: eventId,
            p_limit: 12
          });

        if (error) throw error;

        if (data && data.length > 0) {
          setSocialData(data[0]);
        }
      } catch (error) {
        console.error('Error fetching social data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSocialData();
  }, [eventId]);

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
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="flex gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 w-10 bg-gray-200 rounded-full"></div>
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
            Seja o primeiro a confirmar presença!
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
        {/* Attendance Stats */}
        <div className="flex gap-4 text-sm">
          {going_count > 0 && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">{going_count}</span>
              <span className="text-muted-foreground">
                {going_count === 1 ? 'vai' : 'vão'}
              </span>
            </div>
          )}
          
          {maybe_count > 0 && (
            <div className="flex items-center gap-1 text-yellow-600">
              <Clock className="h-4 w-4" />
              <span className="font-medium">{maybe_count}</span>
              <span className="text-muted-foreground">talvez</span>
            </div>
          )}
          
          {went_count > 0 && (
            <div className="flex items-center gap-1 text-blue-600">
              <Users className="h-4 w-4" />
              <span className="font-medium">{went_count}</span>
              <span className="text-muted-foreground">
                {went_count === 1 ? 'foi' : 'foram'}
              </span>
            </div>
          )}
        </div>

        {/* Avatar Grid */}
        {avatars.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {avatars.length > 6 ? `${avatars.length} pessoas` : 'Pessoas que confirmaram:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {avatars.slice(0, 12).map((avatarUrl, index) => (
                <Avatar key={index} className="h-10 w-10">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="bg-primary/10 text-xs">
                    {index + 1}
                  </AvatarFallback>
                </Avatar>
              ))}
              {avatars.length > 12 && (
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  +{avatars.length - 12}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};