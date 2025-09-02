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
    <header className="relative h-48 md:h-72 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${profile.avatar_url || "/placeholder.svg"})`
        }}
      />
      
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      
      {/* Content */}
      <div className="relative h-full container mx-auto px-3 md:px-6">
        <div className="h-full flex flex-col md:flex-row md:items-end md:justify-between pb-4 md:pb-8">
          
          {/* Main Info Card - Left Side */}
          <div className="flex-1 max-w-sm md:max-w-md">
            <div className="backdrop-blur-md bg-black/30 border md:border-2 border-white/40 rounded-lg p-3 md:p-6">
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-1 md:mb-2">
                {profile.name}
              </h1>
              {profile.handle && (
                <p className="text-base md:text-lg text-white/80 mb-2 md:mb-3">
                  @{profile.handle}
                </p>
              )}
              
              {/* Type and Location */}
              <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-xs md:text-sm">
                <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-primary/80 text-white font-medium">
                  {profile.type === 'artista' ? 'Artista' : 
                   profile.type === 'local' ? 'Local' : 'Organizador'}
                </span>
                {profile.city && (
                  <span className="text-white/70 text-xs md:text-sm">
                    {profile.city}{profile.state ? `, ${profile.state}` : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Stats - Compact Version */}
          <div className="md:hidden mt-3">
            <div className="backdrop-blur-md bg-black/30 border border-white/40 rounded-lg p-2">
              <div className="flex justify-center gap-4 text-center">
                <div>
                  <div className="text-sm font-bold text-white">
                    {stats?.followers_count || 0}
                  </div>
                  <div className="text-xs text-white/70">seguidores</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-white">
                    {stats?.events_count || 0}
                  </div>
                  <div className="text-xs text-white/70">eventos</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-white">
                    {stats?.total_reviews || 0}
                  </div>
                  <div className="text-xs text-white/70">avaliações</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Cards */}
          <div className="hidden md:flex flex-col gap-3 ml-6">
            
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