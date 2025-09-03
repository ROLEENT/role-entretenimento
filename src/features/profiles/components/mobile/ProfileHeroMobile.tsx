import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VerifiedIcon } from "lucide-react";
import { Profile } from "@/features/profiles/api";

interface ProfileHeroMobileProps {
  profile: Profile;
}

export function ProfileHeroMobile({ profile }: ProfileHeroMobileProps) {
  return (
    <div className="relative w-full md:hidden">
      {/* Cover Image with Gradient Overlay */}
      <div className="relative h-40 w-full overflow-hidden">
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
      </div>

      {/* Avatar overlapping cover */}
      <div className="relative -mt-9 px-4">
        <Avatar className="w-18 h-18 border-2 border-white/20 shadow-lg">
          <AvatarImage src={profile.avatar_url} alt={profile.name} />
          <AvatarFallback className="text-black text-xl font-bold bg-white">
            {profile.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Profile info below avatar */}
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-bold text-foreground">{profile.name}</h1>
          {profile.verified && (
            <VerifiedIcon className="w-5 h-5 text-[#c77dff] fill-current" />
          )}
        </div>
        
        <p className="text-sm text-muted-foreground mb-3">@{profile.handle}</p>
        
        {/* Location info if available */}
        {(profile.city || profile.state) && (
          <p className="text-sm text-muted-foreground">
            {profile.city}{profile.city && profile.state && ', '}{profile.state}
          </p>
        )}
      </div>
    </div>
  );
}