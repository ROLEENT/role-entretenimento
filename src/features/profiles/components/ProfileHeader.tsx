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
  
  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/perfil/@${profile.handle}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} - Revista Aplauso`,
          url: profileUrl,
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback para clipboard
      try {
        await navigator.clipboard.writeText(profileUrl);
        // Aqui você pode adicionar um toast de sucesso
      } catch (error) {
        console.log('Erro ao copiar para clipboard:', error);
      }
    }
  };

  const coverImage = profile.avatar_url || "/placeholder.svg";

  return (
    <header className="mb-4">
      {/* Cover using avatar as blurred background */}
      <div className="relative h-56 md:h-64 w-full overflow-hidden rounded-3xl">
        <img 
          src={coverImage} 
          alt={`Foto de ${profile.name}`}
          className="h-full w-full object-cover scale-110 blur-[6px] brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Profile Info - Positioned below cover */}
      <div className="-mt-10 md:-mt-12 flex items-end gap-4 px-3 md:px-0">
        {/* Avatar */}
        <img
          src={profile.avatar_url || "/placeholder.svg"}
          alt={`Avatar de ${profile.name}`}
          className="h-20 w-20 md:h-24 md:w-24 rounded-full ring-4 ring-background object-cover"
        />

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">
            {profile.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {profile.handle ? `@${profile.handle}` : ''}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="px-2 py-0.5 rounded-full bg-[hsl(280_100%_70%_/_0.1)] text-[hsl(280_100%_70%)]">
              {profile.type === 'artista' ? 'Artista' : 
               profile.type === 'local' ? 'Local' : 'Organizador'}
            </span>
            {profile.city && (
              <span>• {profile.city}{profile.state ? `, ${profile.state}` : ''}</span>
            )}
            {profile.contact_email && (
              <a href={`mailto:${profile.contact_email}`} className="underline">
                • {profile.contact_email}
              </a>
            )}
          </div>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex gap-2">
          <FollowButton profileId={profile.id} size="sm" />
          <Button 
            asChild
            className="bg-[hsl(280_100%_70%)] text-black hover:bg-[hsl(280_100%_70%_/_0.9)] font-semibold"
          >
            <a href="#contato">Contato</a>
          </Button>
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