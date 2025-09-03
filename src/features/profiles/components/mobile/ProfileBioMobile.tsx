import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Profile } from "@/features/profiles/api";

interface ProfileBioMobileProps {
  profile: Profile;
}

export function ProfileBioMobile({ profile }: ProfileBioMobileProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const bioText = profile.bio || profile.bio_short || "";
  const shouldShowExpand = bioText.length > 150;
  
  if (!bioText.trim()) return null;

  return (
    <section className="mx-auto max-w-screen-sm px-4 mt-4 md:hidden">
      <h3 className="text-lg font-semibold mb-2">Bio</h3>
      <p 
        className={`text-sm text-muted-foreground leading-relaxed ${
          !isExpanded && shouldShowExpand ? 'line-clamp-3' : ''
        }`}
      >
        {bioText}
      </p>
      {shouldShowExpand && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 min-h-[44px] text-sm text-primary hover:text-primary/80 font-medium active:scale-95 transition-all px-2 py-2 rounded-md hover:bg-accent"
        >
          {isExpanded ? "Ver menos" : "Ver mais"}
        </button>
      )}
    </section>
  );
}