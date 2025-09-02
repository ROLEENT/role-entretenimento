import { Share2, Mail, Phone, MapPin, ExternalLink, Heart, Shield } from "lucide-react";
import { VerificationBadge } from '@/components/VerificationBadge';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Profile } from "../api";
import { FollowButton } from "@/components/profiles/FollowButton";
import { useProfileStats } from "../hooks/useProfileStats";
import { useProfileGenres } from "../hooks/useProfileGenres";
import { ClaimProfileDialog } from "@/components/profiles/ClaimProfileDialog";
import { getCountryDisplay } from "@/utils/countryUtils";
import { useState } from "react";

interface ProfileHeaderProps {
  profile: Profile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const { stats, loading: statsLoading } = useProfileStats(profile.id);
  const { data: genres = [], isLoading: genresLoading } = useProfileGenres(profile.id, profile.type);
  const [showClaimDialog, setShowClaimDialog] = useState(false);

  return (
    <header className="relative h-32 md:h-48 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${profile.cover_url || profile.avatar_url || "/placeholder.svg"})`
        }}
      />
      
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      
      {/* Content */}
      <div className="relative h-full container mx-auto px-4 md:px-6">
        
        {/* Mobile Layout - Compact */}
        <div className="md:hidden h-full flex flex-col justify-end pb-3">
          <div className="space-y-1.5">
            {/* Artist Name */}
            <h1 className="text-xl font-bold text-white drop-shadow-lg">
              {profile.name}
            </h1>
            
            {/* Handle */}
            {profile.handle && (
              <p className="text-xs text-white/70 drop-shadow">
                @{profile.handle}
              </p>
            )}
            
            {/* Type Badge and Location */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 text-xs font-medium bg-primary/80 text-white rounded-md backdrop-blur-sm">
                {profile.type === 'artista' ? (profile.artist_subtype || 'Artista') : 
                 profile.type === 'local' ? 'Local' : 'Organizador'}
              </span>
              {profile.country && (
                <span className="text-xs text-white/90 drop-shadow font-medium">
                  {getCountryDisplay(profile.country)}
                </span>
              )}
            </div>

            {/* Genres */}
            {profile.type === 'artista' && genres.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {genres.slice(0, 3).map((genre) => (
                  <Badge key={genre.id} variant="outline" className="text-xs px-2 py-0.5 bg-white/20 text-white border-white/30">
                    {genre.name}
                  </Badge>
                ))}
                {genres.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5 bg-white/20 text-white border-white/30">
                    +{genres.length - 3}
                  </Badge>
                )}
              </div>
            )}
            
            {/* Stats - Inline */}
            <div className="flex gap-3 text-xs text-white/80 mt-1.5">
              <span className="drop-shadow">
                <span className="font-semibold text-white">{stats?.followers_count || 0}</span> seguidores
              </span>
              <span className="drop-shadow">
                <span className="font-semibold text-white">{stats?.events_count || 0}</span> eventos
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Compact Cards */}
        <div className="hidden md:flex h-full items-end justify-between pb-4">
          
          {/* Main Info Card - Left Side */}
          <div className="flex-1 max-w-lg">
            <div className="backdrop-blur-md bg-black/30 border border-white/30 rounded-lg p-4">
              <h1 className="text-2xl font-bold text-white mb-1">
                {profile.name}
              </h1>
              {profile.handle && (
                <p className="text-sm text-white/70 mb-2">
                  @{profile.handle}
                </p>
              )}
              
              {/* Type and Location */}
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 rounded-full bg-primary/80 text-white text-sm font-medium">
                  {profile.type === 'artista' ? (profile.artist_subtype || 'Artista') : 
                   profile.type === 'local' ? 'Local' : 'Organizador'}
                </span>
                {profile.country && (
                  <span className="text-white/90 text-sm font-medium">
                    {getCountryDisplay(profile.country)}
                  </span>
                )}
              </div>

              {/* Genres for Artists */}
              {profile.type === 'artista' && genres.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {genres.map((genre) => (
                    <Badge key={genre.id} variant="outline" className="text-xs px-2 py-1 bg-white/10 text-white border-white/20 hover:bg-white/20 transition-colors">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side Cards */}
          <div className="flex flex-col gap-2 ml-4">
            
            {/* Stats Card - Compact */}
            <div className="backdrop-blur-md bg-black/30 border border-white/30 rounded-lg p-3 min-w-[180px]">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <div className="text-lg font-bold text-white">
                    {stats?.followers_count || 0}
                  </div>
                  <div className="text-xs text-white/70">seguidores</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">
                    {stats?.events_count || 0}
                  </div>
                  <div className="text-xs text-white/70">eventos</div>
                </div>
              </div>
            </div>

            {/* CTAs Card - Compact */}
            <div className="backdrop-blur-md bg-black/30 border border-white/30 rounded-lg p-3">
              <div className="flex gap-2">
                <FollowButton 
                  profileId={profile.id} 
                  size="sm"
                  className="bg-primary/90 hover:bg-primary text-white border-white/20 text-xs px-3 py-1.5"
                />
                <Button 
                  asChild
                  variant="outline"
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs px-3 py-1.5"
                >
                  <a href="#contato">Mensagem</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ClaimProfileDialog
        isOpen={showClaimDialog}
        onClose={() => setShowClaimDialog(false)}
        profile={{
          id: profile.id,
          handle: profile.handle,
          name: profile.name,
          bio: profile.bio_short,
          avatar_url: profile.avatar_url
        }}
      />
    </header>
  );
}