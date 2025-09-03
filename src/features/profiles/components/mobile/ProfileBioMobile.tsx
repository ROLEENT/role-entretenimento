import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Profile } from "@/features/profiles/api";

interface ProfileBioMobileProps {
  profile: Profile;
}

export function ProfileBioMobile({ profile }: ProfileBioMobileProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!profile.bio && !profile.bio_short) return null;

  const bioText = profile.bio || profile.bio_short || "";
  const shouldShowExpand = bioText.length > 150;

  return (
    <div className="px-4 py-3 md:hidden">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Bio</h3>
        
        <div className="space-y-2">
          <p 
            className={`text-sm text-muted-foreground leading-relaxed ${
              !isExpanded && shouldShowExpand ? 'line-clamp-3' : ''
            }`}
          >
            {bioText}
          </p>
          
          {shouldShowExpand && (
            <Button
              variant="link"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-0 h-auto text-[#c77dff] hover:text-[#b968f5] text-sm font-medium"
            >
              {isExpanded ? "Ver menos" : "Ver mais"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}