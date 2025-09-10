import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { useFollowEntity } from '@/hooks/useFollowEntity';

interface FollowEntityButtonProps {
  entityType: 'artist' | 'venue' | 'organizer';
  entityId: string;
  entityName?: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'secondary';
}

export function FollowEntityButton({ 
  entityType, 
  entityId, 
  entityName,
  className, 
  size = 'default',
  variant = 'outline'
}: FollowEntityButtonProps) {
  const { isFollowing, loading, toggleFollow, isAuthenticated } = useFollowEntity(entityType, entityId);

  const handleClick = () => {
    if (!isAuthenticated) {
      // Aqui poderia abrir um modal de auth, por ora só mostra toast
      return;
    }
    
    toggleFollow();
  };

  const getButtonText = () => {
    if (isFollowing) {
      return 'Seguindo';
    }
    
    switch (entityType) {
      case 'artist':
        return 'Seguir Artista';
      case 'venue':
        return 'Seguir Local';
      case 'organizer':
        return 'Seguir Organizador';
      default:
        return 'Seguir';
    }
  };

  if (!isAuthenticated) {
    return null; // Ou mostrar botão que abre auth dialog
  }

  return (
    <Button
      variant={isFollowing ? "default" : variant}
      size={size}
      onClick={handleClick}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : isFollowing ? (
        <UserCheck className="w-4 h-4 mr-2" />
      ) : (
        <UserPlus className="w-4 h-4 mr-2" />
      )}
      {getButtonText()}
    </Button>
  );
}