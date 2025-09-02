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
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile.name} - @${profile.handle}`,
        text: profile.bio_short || `Confira o perfil de ${profile.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const getAvatarShape = () => {
    switch (profile.type) {
      case 'artista':
        return 'rounded-full';
      case 'local':
      case 'organizador':
        return 'rounded-xl';
      default:
        return 'rounded-full';
    }
  };

  return (
    <div className="relative">
      {/* Cover Image - Compacto */}
      <div className="relative h-48 md:h-56 bg-gradient-to-br from-primary/20 to-accent/10 overflow-hidden rounded-b-2xl">
        {profile.cover_url && (
          <img 
            src={profile.cover_url} 
            alt={`Capa de ${profile.name}`}
            className="w-full h-full object-cover"
            width={1200}
            height={400}
            loading="eager"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />
      </div>

      {/* Profile Content */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-12 md:-mt-16">
          <div className="flex flex-col lg:flex-row lg:items-end gap-4">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
              {/* Avatar - Compacto */}
              <div className="relative">
                <Avatar className={`w-20 h-20 md:w-24 md:h-24 border-4 border-background shadow-card ${getAvatarShape()}`}>
                  <AvatarImage 
                    src={profile.avatar_url || undefined} 
                    alt={`Avatar de ${profile.name}`}
                    width={96}
                    height={96}
                  />
                  <AvatarFallback className={`text-lg md:text-xl font-bold bg-primary/10 text-primary ${getAvatarShape()}`}>
                    {profile.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <VerificationBadge 
                  verified={profile.verified} 
                  size="md" 
                  className="absolute -bottom-1 -right-1"
                />
              </div>

              {/* Name and Handle - Compacto */}
              <div className="text-center sm:text-left flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl md:text-2xl font-bold truncate">
                    {profile.name}
                  </h1>
                  <VerificationBadge verified={profile.verified} size="md" />
                </div>
                <p className="text-muted-foreground text-sm mb-2">
                  @{profile.handle}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {profile.type === 'artista' ? 'Artista' :
                   profile.type === 'local' ? 'Local' :
                   profile.type === 'organizador' ? 'Organizador' : profile.type}
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 lg:flex-nowrap lg:gap-3">
              <FollowButton profileId={profile.id} />
              
              {!profile.user_id && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowClaimDialog(true)}
                  className="gap-2"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">É seu perfil?</span>
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleShare}
                className="gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Compartilhar</span>
              </Button>

              {profile.contact_email && (
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                  className="gap-2"
                >
                  <a href={`mailto:${profile.contact_email}`}>
                    <Mail className="w-4 h-4" />
                    <span className="hidden sm:inline">Contato</span>
                  </a>
                </Button>
              )}

              <Button 
                variant="outline" 
                size="sm"
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Apoiar</span>
              </Button>
            </div>
          </div>

          {/* Location and Stats - Compacto */}
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{profile.city}, {profile.state}</span>
              </div>
              {profile.contact_phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <span>{profile.contact_phone}</span>
                </div>
              )}
            </div>

            {profile.bio_short && (
              <p className="text-sm leading-relaxed max-w-2xl text-muted-foreground">
                {profile.bio_short}
              </p>
            )}

            {/* Tags - Compacto */}
            {profile.tags && profile.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {profile.tags.slice(0, 4).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {profile.tags.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{profile.tags.length - 4}
                  </Badge>
                )}
              </div>
            )}

            {/* Stats Row - Compacto */}
            <div className="flex gap-4 pt-3 border-t border-border">
              <div className="text-center">
                <div className="text-base font-bold">
                  {statsLoading ? (
                    <div className="w-6 h-5 bg-muted animate-pulse rounded" />
                  ) : (
                    stats.followers_count.toLocaleString()
                  )}
                </div>
                <div className="text-xs text-muted-foreground">Seguidores</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold">
                  {statsLoading ? (
                    <div className="w-6 h-5 bg-muted animate-pulse rounded" />
                  ) : (
                    stats.events_count.toLocaleString()
                  )}
                </div>
                <div className="text-xs text-muted-foreground">Eventos</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold">
                  {statsLoading ? (
                    <div className="w-6 h-5 bg-muted animate-pulse rounded" />
                  ) : stats.total_reviews > 0 ? (
                    stats.average_rating.toFixed(1)
                  ) : (
                    '-'
                  )}
                </div>
                <div className="text-xs text-muted-foreground">Avaliação</div>
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
    </div>
  );
}