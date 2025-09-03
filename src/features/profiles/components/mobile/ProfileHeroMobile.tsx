import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VerifiedIcon } from "lucide-react";
import { Profile } from "@/features/profiles/api";

interface ProfileHeroMobileProps {
  profile: Profile;
}

export function ProfileHeroMobile({ profile }: ProfileHeroMobileProps) {
  return (
    <div className="relative w-full md:hidden">
      {/* Hero Sentinel for sticky header */}
      <div id="hero-sentinel" className="absolute top-0 left-0 w-full h-4 pointer-events-none" />
      
      {/* Cover Image with Gradient Overlay */}
      <div className="relative h-44 w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: profile.cover_url 
              ? `url(${profile.cover_url})` 
              : 'linear-gradient(135deg, #c77dff 0%, #9d4edd 100%)'
          }}
        />
        
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
          
          {/* Location info if available */}
          {(profile.city || profile.state) && (
            <p className="text-sm text-white/70">
              {profile.city}{profile.city && profile.state && ', '}{profile.state}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}