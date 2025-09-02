import { Heart, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      
      <Button 
        asChild
        className="flex-1 bg-[hsl(280_100%_70%)] text-black hover:bg-[hsl(280_100%_70%_/_0.9)] font-semibold"
      >
        <a href="#contato">Contato</a>
      </Button>
    </div>
  );
}