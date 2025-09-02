import { Heart, Mail } from "lucide-react";
import { EnhancedButton } from "@/components/enhanced/EnhancedButton";
import { FollowButton } from "@/components/profiles/FollowButton";
import { Profile } from "@/features/profiles/api";

interface ProfileMobileActionsProps {
  profile: Profile;
}

export function ProfileMobileActions({ profile }: ProfileMobileActionsProps) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-background/95 backdrop-blur border-t p-3 flex gap-3">
      <FollowButton 
        profileId={profile.id} 
        className="flex-1"
        size="default"
      />
      
      <EnhancedButton 
        asChild
        ripple
        className="flex-1 bg-primary text-primary-foreground hover:bg-primary-hover font-semibold"
      >
        <a href="#contato">Contato</a>
      </EnhancedButton>
    </div>
  );
}