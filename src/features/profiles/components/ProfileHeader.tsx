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
    <header className="border-b bg-background">
      <div className="container mx-auto px-3 md:px-0 py-6">
        <div className="flex items-start gap-6">
          {/* Left side - Profile info */}
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              {profile.name}
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              {profile.handle ? `@${profile.handle}` : ''}
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{stats?.followers_count || 0}</span>
                <span className="text-muted-foreground">seguidores</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{stats?.events_count || 0}</span>
                <span className="text-muted-foreground">eventos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{stats?.total_reviews || 0}</span>
                <span className="text-muted-foreground">avaliações</span>
              </div>
            </div>

            {/* Info tags */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="px-2 py-1 rounded bg-primary/10 text-primary">
                {profile.type === 'artista' ? 'Artista' : 
                 profile.type === 'local' ? 'Local' : 'Organizador'}
              </span>
              {profile.city && (
                <span className="text-muted-foreground">
                  {profile.city}{profile.state ? `, ${profile.state}` : ''}
                </span>
              )}
            </div>

            {/* Desktop CTAs */}
            <div className="hidden md:flex gap-3 mt-6">
              <FollowButton profileId={profile.id} size="default" />
              <Button 
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <a href="#contato">Enviar mensagem</a>
              </Button>
            </div>
          </div>

          {/* Right side - Avatar */}
          <div className="flex-shrink-0">
            <img
              src={profile.avatar_url || "/placeholder.svg"}
              alt={`Avatar de ${profile.name}`}
              className="w-32 h-32 md:w-40 md:h-40 rounded object-cover"
            />
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