import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { VerifiedIcon, MapPinIcon } from "lucide-react";
import { Profile } from "@/features/profiles/api";
import { LazyImage } from "@/components/ui/lazy-image";

interface ProfileHeroMobileProps {
  profile: Profile;
}

export function ProfileHeroMobile({ profile }: ProfileHeroMobileProps) {
  return (
    <div className="relative w-full md:hidden">
      {/* Hero Sentinel for sticky header */}
      <div id="hero-sentinel" className="absolute top-0 left-0 w-full h-16 pointer-events-none" />
      
      {/* Cover Image with Gradient Overlay */}
      <div className="relative h-44 w-full overflow-hidden">
        {profile.cover_url ? (
          <LazyImage 
            src={profile.cover_url}
            alt={`${profile.name} cover`}
            className="absolute inset-0"
            loading="eager"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-primary/60" />
        )}
        
        {/* Gradient for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        
        {/* Watermark - hidden on mobile */}
        <span className="hidden md:block absolute inset-0 text-white/10 text-[10vw] font-semibold select-none pointer-events-none flex items-center justify-center">
          ROLÊ
        </span>
      </div>

      {/* Avatar overlapping cover */}
      <div className="mx-auto max-w-screen-sm -mt-12 px-4 flex items-end gap-3">
        <Avatar className="w-24 h-24 border-2 border-white/20 shadow-lg">
          <AvatarImage src={profile.avatar_url} alt={profile.name} />
          <AvatarFallback className="text-black text-xl font-bold bg-white">
            {profile.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        {/* Profile info next to avatar */}
        <div className="pb-2 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-semibold text-foreground">{profile.name}</h1>
            {profile.verified && (
              <VerifiedIcon className="w-5 h-5 text-[#c77dff] fill-current" />
            )}
          </div>
          
          <p className="text-sm text-white/70">@{profile.handle}</p>
          
          {/* Location and Category badges */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {profile.city && (
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <MapPinIcon className="w-3 h-3 mr-1" />
                {profile.city}
              </Badge>
            )}
            {profile.category_name && (
              <Badge variant="outline" className="bg-white/10 text-white border-white/30 backdrop-blur-sm">
                {profile.category_name}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}