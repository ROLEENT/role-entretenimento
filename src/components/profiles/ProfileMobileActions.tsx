import { Heart, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FollowButton } from "@/components/profiles/FollowButton";
import { Profile } from "@/features/profiles/api";

interface ProfileMobileActionsProps {
  profile: Profile;
}

export function ProfileMobileActions({ profile }: ProfileMobileActionsProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t border-border p-3 flex gap-3 md:hidden">
      <FollowButton 
        profileId={profile.id} 
        className="flex-1"
        size="default"
      />
      
      {profile.contact_email ? (
        <Button 
          className="flex-1"
          asChild
        >
          <a href={`mailto:${profile.contact_email}`}>
            <Mail className="w-4 h-4 mr-2" />
            Contato
          </a>
        </Button>
      ) : (
        <Button className="flex-1">
          <Heart className="w-4 h-4 mr-2" />
          Apoiar
        </Button>
      )}
    </div>
  );
}