import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Users, MapPin, Tag } from 'lucide-react';
import { Group } from '@/hooks/useGroups';

interface GroupCardProps {
  group: Group;
  onJoin?: (groupId: string) => void;
  onLeave?: (groupId: string) => void;
  onClick?: (group: Group) => void;
  loading?: boolean;
}

export const GroupCard = ({ group, onJoin, onLeave, onClick, loading }: GroupCardProps) => {
  const handleCardClick = () => {
    if (onClick) {
      onClick(group);
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (group.is_member && onLeave) {
      onLeave(group.id);
    } else if (!group.is_member && onJoin) {
      onJoin(group.id);
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={group.image_url} alt={group.name} />
              <AvatarFallback>
                {group.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{group.name}</CardTitle>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{group.city}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Tag className="h-3 w-3" />
                  <span>{group.category}</span>
                </div>
              </div>
            </div>
          </div>
          {group.user_role === 'admin' && (
            <Badge variant="secondary" className="text-xs">
              Admin
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {group.description && (
          <CardDescription className="mb-4 line-clamp-2">
            {group.description}
          </CardDescription>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{group.current_members_count} membros</span>
            {group.max_members && (
              <span className="text-xs">/ {group.max_members}</span>
            )}
          </div>

          {(onJoin || onLeave) && (
            <Button
              onClick={handleActionClick}
              variant={group.is_member ? "outline" : "default"}
              size="sm"
              disabled={loading}
            >
              {group.is_member ? 'Sair' : 'Entrar'}
            </Button>
          )}
        </div>

        {group.is_member && (
          <div className="mt-3 pt-3 border-t">
            <Badge 
              variant={group.is_public ? "secondary" : "outline"} 
              className="text-xs"
            >
              {group.is_public ? 'Público' : 'Privado'}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};