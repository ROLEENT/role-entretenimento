import { Share2, Mail, Phone, MapPin, ExternalLink, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Profile } from "../api";
import FollowButton from "../FollowButton";
import { useProfileStats } from "../hooks/useProfileStats";

interface ProfileHeaderProps {
  profile: Profile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const { stats, loading: statsLoading } = useProfileStats(profile.id);
  
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
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 lg:h-80 bg-gradient-to-br from-primary/20 to-accent/10 overflow-hidden">
        {profile.cover_url && (
          <img 
            src={profile.cover_url} 
            alt={`Capa de ${profile.name}`}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      </div>

      {/* Profile Content */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-16 md:-mt-20">
          <div className="flex flex-col lg:flex-row lg:items-end gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 lg:gap-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className={`w-24 h-24 md:w-32 md:h-32 border-4 border-background shadow-card ${getAvatarShape()}`}>
                  <AvatarImage 
                    src={profile.avatar_url || undefined} 
                    alt={`Avatar de ${profile.name}`}
                  />
                  <AvatarFallback className={`text-2xl md:text-3xl font-bold bg-primary/10 text-primary ${getAvatarShape()}`}>
                    {profile.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {profile.verified && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Name and Handle */}
              <div className="text-center sm:text-left flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1 truncate">
                  {profile.name}
                </h1>
                <p className="text-muted-foreground text-sm md:text-base mb-2">
                  @{profile.handle}
                </p>
                <Badge variant="secondary" className="mb-2">
                  {profile.type === 'artista' ? 'Artista' :
                   profile.type === 'local' ? 'Local' :
                   profile.type === 'organizador' ? 'Organizador' : profile.type}
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 lg:flex-nowrap lg:gap-3">
              <FollowButton profileId={profile.id} />
              
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

          {/* Location and Short Bio */}
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{profile.city}, {profile.state}, {profile.country}</span>
              </div>
              {profile.contact_phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <span>{profile.contact_phone}</span>
                </div>
              )}
            </div>

            {profile.bio_short && (
              <p className="text-sm md:text-base leading-relaxed max-w-2xl">
                {profile.bio_short}
              </p>
            )}

            {/* Tags */}
            {profile.tags && profile.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.tags.slice(0, 5).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {profile.tags.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{profile.tags.length - 5} mais
                  </Badge>
                )}
              </div>
            )}

            {/* Quick Links */}
            {profile.links && profile.links.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.links.slice(0, 3).map((link: any, index: number) => (
                  <a 
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {link.type}
                  </a>
                ))}
              </div>
            )}

            {/* Stats Row */}
            <div className="flex flex-wrap gap-6 pt-4 border-t border-border">
              <div className="text-center">
                <div className="text-lg md:text-xl font-bold">
                  {statsLoading ? (
                    <div className="w-8 h-6 bg-muted animate-pulse rounded" />
                  ) : (
                    stats.followers_count.toLocaleString()
                  )}
                </div>
                <div className="text-xs text-muted-foreground">Seguidores</div>
              </div>
              <div className="text-center">
                <div className="text-lg md:text-xl font-bold">
                  {statsLoading ? (
                    <div className="w-8 h-6 bg-muted animate-pulse rounded" />
                  ) : (
                    stats.events_count.toLocaleString()
                  )}
                </div>
                <div className="text-xs text-muted-foreground">Eventos</div>
              </div>
              <div className="text-center">
                <div className="text-lg md:text-xl font-bold">
                  {statsLoading ? (
                    <div className="w-8 h-6 bg-muted animate-pulse rounded" />
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
    </div>
  );
}