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
    <header className="relative h-64 md:h-80 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${profile.avatar_url || "/placeholder.svg"})`
        }}
      />
      
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/40" />
      
      {/* Content */}
      <div className="relative h-full container mx-auto px-3 md:px-6">
        <div className="h-full flex flex-col justify-end pb-6 md:pb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
            
            {/* Main Info Card */}
            <div className="md:col-span-6">
              <div className="backdrop-blur-md bg-black/20 border border-white/10 rounded-lg p-4 md:p-6">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
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
                    {profile.type === 'artista' ? 'Artista' : 
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

            {/* Stats Card */}
            <div className="md:col-span-3">
              <div className="backdrop-blur-md bg-black/20 border border-white/10 rounded-lg p-4">
                <div className="grid grid-cols-3 md:grid-cols-1 gap-3 md:gap-4 text-center md:text-left">
                  <div>
                    <div className="text-xl md:text-2xl font-bold text-white">
                      {stats?.followers_count || 0}
                    </div>
                    <div className="text-xs text-white/70">seguidores</div>
                  </div>
                  <div>
                    <div className="text-xl md:text-2xl font-bold text-white">
                      {stats?.events_count || 0}
                    </div>
                    <div className="text-xs text-white/70">eventos</div>
                  </div>
                  <div>
                    <div className="text-xl md:text-2xl font-bold text-white">
                      {stats?.total_reviews || 0}
                    </div>
                    <div className="text-xs text-white/70">avaliações</div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs Card */}
            <div className="md:col-span-3">
              <div className="backdrop-blur-md bg-black/20 border border-white/10 rounded-lg p-4">
                <div className="flex flex-col gap-2">
                  <FollowButton 
                    profileId={profile.id} 
                    size="default"
                    className="w-full bg-primary/90 hover:bg-primary text-white border-white/20"
                  />
                  <Button 
                    asChild
                    variant="outline"
                    className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    <a href="#contato">Enviar mensagem</a>
                  </Button>
                </div>
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