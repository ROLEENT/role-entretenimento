import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FollowButton } from '@/components/profiles/FollowButton';
import { MapPin, Heart, Calendar, Users } from 'lucide-react';

interface RolezeiroStats {
  saved_events_count: number;
  attendances_count: number;
  following_count: number;
}

interface Rolezeiro {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  city: string;
  preferred_genres: string[];
  created_at: string;
  stats?: RolezeiroStats;
}

interface RolezeiroCardProps {
  rolezeiro: Rolezeiro;
  showFollowButton?: boolean;
  compact?: boolean;
}

export function RolezeiroCard({ rolezeiro, showFollowButton = true, compact = false }: RolezeiroCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={rolezeiro.avatar_url || ''} />
              <AvatarFallback>
                {getInitials(rolezeiro.display_name || rolezeiro.username)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">
                {rolezeiro.display_name || rolezeiro.username}
              </h3>
              {rolezeiro.city && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground truncate">
                    {rolezeiro.city}
                  </span>
                </div>
              )}
            </div>
            {showFollowButton && (
              <FollowButton profileId={rolezeiro.user_id} size="sm" />
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={rolezeiro.avatar_url || ''} />
              <AvatarFallback>
                {getInitials(rolezeiro.display_name || rolezeiro.username)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">
                {rolezeiro.display_name || rolezeiro.username}
              </h3>
              {rolezeiro.display_name && (
                <p className="text-sm text-muted-foreground truncate">
                  @{rolezeiro.username}
                </p>
              )}
              {rolezeiro.city && (
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground truncate">
                    {rolezeiro.city}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {rolezeiro.bio && (
            <p className="text-sm text-muted-foreground">
              {truncateText(rolezeiro.bio, 100)}
            </p>
          )}

          {/* Genres */}
          {rolezeiro.preferred_genres && rolezeiro.preferred_genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {rolezeiro.preferred_genres.slice(0, 3).map((genre) => (
                <Badge key={genre} variant="secondary" className="text-xs">
                  {genre}
                </Badge>
              ))}
              {rolezeiro.preferred_genres.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{rolezeiro.preferred_genres.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Stats */}
          {rolezeiro.stats && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                <span>{rolezeiro.stats.saved_events_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{rolezeiro.stats.attendances_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{rolezeiro.stats.following_count || 0}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <a href={`/u/${rolezeiro.username}`}>
                Ver Perfil
              </a>
            </Button>
            {showFollowButton && (
              <FollowButton profileId={rolezeiro.user_id} size="sm" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}