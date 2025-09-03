import { MessageSquare, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FollowButton } from "@/components/profiles/FollowButton";
import { Profile } from "@/features/profiles/api";

interface ProfileActionsMobileProps {
  profile: Profile;
}

export function ProfileActionsMobile({ profile }: ProfileActionsMobileProps) {
  return (
    <div className="mx-auto max-w-screen-sm px-4 mt-3 md:hidden">
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
        
        {/* More options */}
        <Button 
          variant="outline" 
          size="icon"
          className="min-h-[44px] min-w-[44px] rounded-xl border-border active:scale-95 transition-all"
          aria-label="Mais opções"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}