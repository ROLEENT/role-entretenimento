import { useState, useEffect } from "react";
import { ChevronLeft, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FollowButton } from "@/components/profiles/FollowButton";
import { Profile } from "@/features/profiles/api";

interface ProfileStickyHeaderMobileProps {
  profile: Profile;
}

export function ProfileStickyHeaderMobile({ profile }: ProfileStickyHeaderMobileProps) {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const sentinel = document.getElementById('hero-sentinel');
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    
    return () => observer.disconnect();
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-sm border-b transition-all duration-300"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Back button */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(-1)}
          className="p-2 -ml-2"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        {/* Profile name (truncated) */}
        <div className="flex-1 px-3 min-w-0">
          <h2 className="text-base font-semibold text-foreground truncate">
            {profile.name}
          </h2>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <FollowButton 
            profileId={profile.id} 
            size="sm"
            className="bg-[#c77dff] hover:bg-[#b968f5] text-black border-0"
          />
          
          <Button 
            variant="outline" 
            size="sm"
            className="p-2"
            aria-label="Mais opções"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}