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
          className="h-10 px-4 rounded-xl bg-[#c77dff] hover:bg-[#b968f5] text-black border-0 font-medium"
        />
        
        {/* Message button */}
        <Button 
          variant="outline" 
          className="h-10 px-4 rounded-xl border-white/20"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Mensagem
        </Button>
        
        {/* More options */}
        <Button 
          variant="outline" 
          size="icon"
          className="h-10 w-10 rounded-xl border-white/20"
          aria-label="Mais opções"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}