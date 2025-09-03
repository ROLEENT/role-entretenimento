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
    <header 
      className="sticky top-0 z-40 backdrop-blur bg-black/50 md:hidden"
      style={{ paddingTop: 'calc(8px + env(safe-area-inset-top))' }}
    >
      <div className="mx-auto max-w-screen-sm px-4 py-2 flex items-center gap-2">
        {/* Back button */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(-1)}
          className="p-2 rounded-full"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        {/* Profile name (truncated) */}
        <div className="text-base font-semibold truncate flex-1">
          {profile.name}
        </div>

        {/* More options button only */}
        <Button 
          variant="outline" 
          size="sm"
          className="p-2 rounded-full"
          aria-label="Mais opções"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}