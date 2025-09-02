import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquareIcon, UserPlusIcon, UserCheckIcon, VerifiedIcon } from "lucide-react";
import { Profile } from "@/features/profiles/api";
import { useProfileGenres } from "@/features/profiles/hooks/useProfileGenres";
import { useResponsive } from "@/hooks/useResponsive";
import { FollowButton } from "@/components/profiles/FollowButton";

interface NewProfileHeaderProps {
  profile: Profile;
}

export function NewProfileHeader({ profile }: NewProfileHeaderProps) {
  const { isMobile } = useResponsive();
  const { data: genres = [] } = useProfileGenres(profile.id, profile.type);

  return (
    <div className="relative w-full">
      {/* Cover Image with Gradient Overlay */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: profile.cover_url 
              ? `url(${profile.cover_url})` 
              : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-variant)) 100%)'
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              {/* Avatar */}
              <Avatar className="w-20 h-20 md:w-24 md:h-24 border-4 border-white shadow-lg">
                <AvatarImage src={profile.avatar_url} alt={profile.name} />
                <AvatarFallback className="text-black text-xl md:text-2xl font-bold">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Profile Info */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-4xl font-bold">{profile.name}</h1>
                  {profile.verified && (
                    <VerifiedIcon className="w-6 h-6 text-primary fill-current" />
                  )}
                </div>
                
                <p className="text-white/90 text-sm">@{profile.handle}</p>
                
                {/* Tags/Genres */}
                {genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {genres.slice(0, 4).map((genre) => (
                      <Badge 
                        key={genre.id} 
                        className="bg-primary/90 text-white border-0 hover:bg-primary"
                      >
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Bio Preview */}
                {profile.bio_short && (
                  <p className="text-white/90 text-sm md:text-base max-w-2xl line-clamp-2 mt-3">
                    {profile.bio_short}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4 md:mt-0">
                <FollowButton 
                  profileId={profile.id} 
                  className="bg-primary hover:bg-primary-hover text-white border-0 shadow-lg"
                  size={isMobile ? "sm" : "default"}
                />
                <Button 
                  variant="outline" 
                  size={isMobile ? "sm" : "default"}
                  className="bg-black/50 border-white/30 text-white hover:bg-black/70 hover:text-white shadow-lg"
                >
                  <MessageSquareIcon className="w-4 h-4 mr-2" />
                  Mensagem
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}