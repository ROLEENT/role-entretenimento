import { MessageSquare, MoreHorizontal, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FollowButton } from "@/components/profiles/FollowButton";
import { Profile } from "@/features/profiles/api";
import { useProfileShare } from "@/hooks/useProfileShare";

interface ProfileActionsMobileProps {
  profile: Profile;
}

export function ProfileActionsMobile({ profile }: ProfileActionsMobileProps) {
  const { shareProfile } = useProfileShare();

  return (
    <div className="mx-auto max-w-screen-sm px-4 mt-6 md:hidden">
      <div className="flex gap-2">
        {/* Follow button with primary color */}
        <FollowButton 
          profileId={profile.id} 
          className="min-h-[44px] px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground border-0 font-medium active:scale-95 transition-all"
        />
        
        {/* Message button */}
        <Button 
          variant="outline" 
          className="min-h-[44px] px-4 rounded-xl border-border active:scale-95 transition-all"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Mensagem
        </Button>
        
        {/* Share button */}
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => shareProfile(profile)}
          className="min-h-[44px] min-w-[44px] rounded-xl border-border active:scale-95 transition-all hover:bg-accent"
          aria-label="Compartilhar perfil"
        >
          <Share className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}