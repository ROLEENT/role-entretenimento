import { Share2, Mail, Phone, MapPin, ExternalLink, Heart, Shield } from "lucide-react";
import { VerificationBadge } from '@/components/VerificationBadge';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Profile } from "../api";
import { FollowButton } from "@/components/profiles/FollowButton";
import { useProfileStats } from "../hooks/useProfileStats";
import { ClaimProfileDialog } from "@/components/profiles/ClaimProfileDialog";
import { useState } from "react";

interface ProfileHeaderProps {
  profile: Profile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const { stats, loading: statsLoading } = useProfileStats(profile.id);
  const [showClaimDialog, setShowClaimDialog] = useState(false);

  return (
    <header className="relative h-40 md:h-72 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${profile.avatar_url || "/placeholder.svg"})`
        }}
      />
      
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
      
      {/* Content */}
      <div className="relative h-full container mx-auto px-4 md:px-6">
        
        {/* Mobile Layout - Last.fm Style */}
        <div className="md:hidden h-full flex flex-col justify-end pb-4">
          <div className="space-y-2">
            {/* Artist Name */}
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">
              {profile.name}
            </h1>
            
            {/* Type Badge - Subtle */}
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-medium bg-white/20 text-white rounded-md backdrop-blur-sm">
                {profile.type === 'artista' ? (profile.artist_subtype || 'Artista') : 
                 profile.type === 'local' ? 'Local' : 'Organizador'}
              </span>
              {profile.city && (
                <span className="text-sm text-white/80 drop-shadow">
                  {profile.city}{profile.state ? `, ${profile.state}` : ''}
                </span>
              )}
            </div>

            {/* Handle */}
            {profile.handle && (
              <p className="text-sm text-white/70 drop-shadow">
                @{profile.handle}
              </p>
            )}
            
            {/* Stats - Inline */}
            <div className="flex gap-4 text-xs text-white/80 mt-2">
              <span className="drop-shadow">
                <span className="font-semibold text-white">{stats?.followers_count || 0}</span> seguidores
              </span>
              <span className="drop-shadow">
                <span className="font-semibold text-white">{stats?.events_count || 0}</span> eventos
              </span>
              <span className="drop-shadow">
                <span className="font-semibold text-white">{stats?.total_reviews || 0}</span> avaliações
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Keep Cards */}
        <div className="hidden md:flex h-full items-end justify-between pb-8">
          
          {/* Main Info Card - Left Side */}
          <div className="flex-1 max-w-md">
            <div className="backdrop-blur-md bg-black/30 border-2 border-white/40 rounded-lg p-6">
              <h1 className="text-4xl font-bold text-white mb-2">
                {profile.name}
              </h1>
              {profile.handle && (
                <p className="text-lg text-white/80 mb-3">
                  @{profile.handle}
                </p>
              )}
              
              {/* Type and Location */}
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="px-3 py-1 rounded-full bg-primary/80 text-white font-medium">
                  {profile.type === 'artista' ? (profile.artist_subtype || 'Artista') : 
                   profile.type === 'local' ? 'Local' : 'Organizador'}
                </span>
                {profile.city && (
                  <span className="text-white/70">
                    {profile.city}{profile.state ? `, ${profile.state}` : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Side Cards */}
          <div className="flex flex-col gap-3 ml-6">
            
            {/* Stats Card */}
            <div className="backdrop-blur-md bg-black/30 border-2 border-white/40 rounded-lg p-4 min-w-[200px]">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-white">
                    {stats?.followers_count || 0}
                  </div>
                  <div className="text-xs text-white/70">seguidores</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white">
                    {stats?.events_count || 0}
                  </div>
                  <div className="text-xs text-white/70">eventos</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white">
                    {stats?.total_reviews || 0}
                  </div>
                  <div className="text-xs text-white/70">avaliações</div>
                </div>
              </div>
            </div>

            {/* CTAs Card */}
            <div className="backdrop-blur-md bg-black/30 border-2 border-white/40 rounded-lg p-4">
              <div className="flex gap-2">
                <FollowButton 
                  profileId={profile.id} 
                  size="default"
                  className="bg-primary/90 hover:bg-primary text-white border-white/20"
                />
                <Button 
                  asChild
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  <a href="#contato">Enviar mensagem</a>
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