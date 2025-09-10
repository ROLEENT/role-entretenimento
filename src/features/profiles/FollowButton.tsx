import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, HeartHandshake } from "lucide-react";
import { useFollowProfile } from "@/hooks/useFollowProfile";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface FollowButtonProps {
  profileId: string;
  className?: string;
  size?: "sm" | "default" | "lg";
}

export default function FollowButton({ profileId, className, size = "default" }: FollowButtonProps) {
  const { isFollowing, loading, toggleFollow, isAuthenticated } = useFollowProfile(profileId);

  if (!isAuthenticated) {
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

  return (
    <Button
      variant={isFollowing ? "default" : "outline"}
      size={size}
      onClick={toggleFollow}
      disabled={loading}
      className={className}
    >
      {isFollowing ? (
        <HeartHandshake className="w-4 h-4 mr-2" />
      ) : (
        <Heart className="w-4 h-4 mr-2" />
      )}
      {isFollowing ? "Seguindo" : "Seguir"}
    </Button>
  );
}