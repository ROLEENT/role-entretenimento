import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserCheck, UserPlus, MapPin, ExternalLink, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface UserCardProps {
  user: {
    user_id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
    bio?: string;
    location?: string;
    website?: string;
    followers_count?: number;
    following_count?: number;
    is_verified?: boolean;
    created_at?: string;
  };
  isFollowing?: boolean;
  onToggleFollow?: () => void;
  loading?: boolean;
  showFollowButton?: boolean;
  variant?: 'default' | 'compact';
}

export const UserCard = ({ 
  user, 
  isFollowing, 
  onToggleFollow, 
  loading, 
  showFollowButton = true,
  variant = 'default'
}: UserCardProps) => {
  const userInitials = user.display_name?.split(' ').map(n => n[0]).join('') || 
                      user.username?.slice(0, 2).toUpperCase() || '??';

  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-between p-3 hover:bg-accent/50 rounded-lg transition-colors">
        <Link to={`/perfil/${user.username || user.user_id}`} className="flex items-center gap-3 flex-1">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar_url} alt={user.display_name} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="font-medium text-sm truncate">{user.display_name}</p>
              {user.is_verified && (
                <UserCheck className="h-4 w-4 text-primary fill-current" />
              )}
            </div>
            {user.username && (
              <p className="text-xs text-muted-foreground">@{user.username}</p>
            )}
          </div>
        </Link>
        {showFollowButton && onToggleFollow && (
          <Button
            size="sm"
            variant={isFollowing ? "outline" : "default"}
            onClick={onToggleFollow}
            disabled={loading}
            className="ml-2"
          >
            {isFollowing ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <Link to={`/perfil/${user.username || user.user_id}`} className="flex items-center gap-3">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar_url} alt={user.display_name} />
              <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{user.display_name}</h3>
                {user.is_verified && (
                  <Badge variant="secondary" className="h-5">
                    <UserCheck className="h-3 w-3" />
                  </Badge>
                )}
              </div>
              {user.username && (
                <p className="text-muted-foreground">@{user.username}</p>
              )}
            </div>
          </Link>
          
          {showFollowButton && onToggleFollow && (
            <Button
              variant={isFollowing ? "outline" : "default"}
              onClick={onToggleFollow}
              disabled={loading}
              className="shrink-0"
            >
              {isFollowing ? (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Seguindo
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Seguir
                </>
              )}
            </Button>
          )}
        </div>

        {user.bio && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{user.bio}</p>
        )}

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-4">
          {user.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{user.location}</span>
            </div>
          )}
          {user.website && (
            <div className="flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              <a 
                href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary"
              >
                Website
              </a>
            </div>
          )}
          {user.created_at && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Desde {new Date(user.created_at).getFullYear()}</span>
            </div>
          )}
        </div>

        <div className="flex gap-4 text-sm">
          <span>
            <span className="font-semibold">{user.following_count || 0}</span>{' '}
            <span className="text-muted-foreground">Seguindo</span>
          </span>
          <span>
            <span className="font-semibold">{user.followers_count || 0}</span>{' '}
            <span className="text-muted-foreground">Seguidores</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
};