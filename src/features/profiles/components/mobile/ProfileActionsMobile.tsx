import { MessageSquare, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FollowButton } from "@/components/profiles/FollowButton";
import { Profile } from "@/features/profiles/api";

interface ProfileActionsMobileProps {
  profile: Profile;
}

export function ProfileActionsMobile({ profile }: ProfileActionsMobileProps) {
  return (
    <div className="px-4 py-3 md:hidden">
      <div className="flex gap-3">
        {/* Follow button with primary color */}
        <FollowButton 
          profileId={profile.id} 
          className="flex-1 bg-[#c77dff] hover:bg-[#b968f5] text-black border-0 font-medium h-10"
        />
        
        {/* Message button */}
        <Button 
          variant="outline" 
          className="flex-1 h-10"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Mensagem
        </Button>
        
        {/* More options */}
        <Button 
          variant="outline" 
          size="icon"
          className="h-10 w-10 flex-shrink-0"
          aria-label="Mais opções"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}