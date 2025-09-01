import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { useFollowProfile } from '@/hooks/useFollowProfile';
import { PublicAuthDialog } from '@/components/auth/PublicAuthDialog';
import { AuthRequiredDialog } from '@/components/auth/AuthRequiredDialog';

interface FollowButtonProps {
  profileId: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export function FollowButton({ profileId, className, size = 'default' }: FollowButtonProps) {
  const { isFollowing, loading, toggleFollow, isAuthenticated } = useFollowProfile(profileId);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showAuthRequired, setShowAuthRequired] = useState(false);

  const handleClick = () => {
    if (!isAuthenticated) {
      setShowAuthRequired(true);
      return;
    }
    
    toggleFollow();
  };

  const handleSignIn = () => {
    setShowAuthRequired(false);
    setShowAuthDialog(true);
  };

  return (
    <>
      <Button
        variant={isFollowing ? "default" : "outline"}
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
        {isFollowing ? 'Seguindo' : 'Seguir'}
      </Button>

      <AuthRequiredDialog
        open={showAuthRequired}
        onOpenChange={setShowAuthRequired}
        action="follow"
        onSignIn={handleSignIn}
      />

      <PublicAuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        defaultTab="signin"
      />
    </>
  );
}