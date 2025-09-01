import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, HeartHandshake } from "lucide-react";
import { useFollowMutation } from "./hooks/useProfiles";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface FollowButtonProps {
  profileId: string;
  className?: string;
  size?: "sm" | "default" | "lg";
}

export default function FollowButton({ profileId, className, size = "default" }: FollowButtonProps) {
  const { user } = useAuth();
  const { follow, unfollow, isFollowing, isUnfollowing } = useFollowMutation();
  const [isFollowingProfile, setIsFollowingProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const checkFollowStatus = async () => {
      try {
        const { data } = await supabase
          .from('followers')
          .select('id')
          .eq('profile_id', profileId)
          .eq('user_id', user.id)
          .maybeSingle();
        
        setIsFollowingProfile(!!data);
      } catch (error) {
        console.error('Error checking follow status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkFollowStatus();
  }, [profileId, user]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Button variant="outline" size={size} disabled className={className}>
        <Heart className="w-4 h-4 mr-2" />
        Carregando...
      </Button>
    );
  }

  const handleClick = () => {
    if (isFollowingProfile) {
      unfollow({ profileId });
      setIsFollowingProfile(false);
    } else {
      follow({ profileId });
      setIsFollowingProfile(true);
    }
  };

  return (
    <Button
      variant={isFollowingProfile ? "default" : "outline"}
      size={size}
      onClick={handleClick}
      disabled={isFollowing || isUnfollowing}
      className={className}
    >
      {isFollowingProfile ? (
        <HeartHandshake className="w-4 h-4 mr-2" />
      ) : (
        <Heart className="w-4 h-4 mr-2" />
      )}
      {isFollowingProfile ? "Seguindo" : "Seguir"}
    </Button>
  );
}