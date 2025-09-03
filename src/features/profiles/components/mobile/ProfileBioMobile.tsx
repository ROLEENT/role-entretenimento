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
    <section className="mx-auto max-w-screen-sm px-4 mt-4 md:hidden">
      <h3 className="text-lg font-semibold mb-2">Bio</h3>
      <p 
        className={`text-sm text-white/80 leading-relaxed ${
          !isExpanded && shouldShowExpand ? 'line-clamp-3' : ''
        }`}
      >
        {bioText}
      </p>
      {shouldShowExpand && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-sm text-[#c77dff] hover:text-[#b968f5] font-medium"
        >
          {isExpanded ? "Ver menos" : "Ver mais"}
        </button>
      )}
    </section>
  );
}