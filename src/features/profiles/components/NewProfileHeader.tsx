import { Profile } from "@/features/profiles/api";
import { LazyImage } from "@/components/performance/LazyImage";
import { FollowButton } from "@/components/profiles/FollowButton";
import { ShareButton } from "@/components/ui/share-button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewProfileHeaderProps {
  profile: Profile;
}

export function NewProfileHeader({ profile }: NewProfileHeaderProps) {
  return (
    <header className="relative">
      {/* Cover Image */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <LazyImage
          src={profile.cover_url || '/placeholder.svg'}
          alt={`Capa de ${profile.name}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Profile Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container mx-auto flex items-end gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <LazyImage
                src={profile.avatar_url || '/placeholder.svg'}
                alt={profile.name}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg"
              />
              {profile.verified && (
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-white">
                  <Star className="w-4 h-4 text-primary-foreground fill-current" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold truncate">
                    {profile.name}
                  </h1>
                  <p className="text-white/90 text-lg">@{profile.handle}</p>
                  
                  {/* Type and Location */}
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {profile.type === 'artista' ? 'Artista' : 
                       profile.type === 'local' ? 'Local' : 'Organizador'}
                    </Badge>
                    
                    {profile.city && (
                      <div className="flex items-center gap-1 text-white/90">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.city}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <ShareButton 
                    url={`${window.location.origin}/perfil/@${profile.handle}`}
                    title={`${profile.name} - Rolê`}
                    variant="secondary"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  />
                  <FollowButton 
                    profileId={profile.id}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  />
                </div>
              </div>

              {/* Bio */}
              {profile.bio_short && (
                <p className="mt-4 text-white/90 text-sm md:text-base line-clamp-2">
                  {profile.bio_short}
                </p>
              )}

              {/* Links */}
              {profile.links && profile.links.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  {profile.links.slice(0, 3).map((link, index) => (
                    <Button
                      key={index}
                      asChild
                      variant="outline"
                      size="sm"
                      className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        {link.type}
                      </a>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}