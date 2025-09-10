import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Instagram, ExternalLink, Share2 } from 'lucide-react';
import { Profile } from '@/features/profiles/api';
import { FollowEntityButton } from '@/components/follow/FollowEntityButton';

interface ArtistHeaderProps {
  profile: Profile;
  showActions?: boolean;
}

export function ArtistHeader({ profile, showActions = false }: ArtistHeaderProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').slice(0, 2).toUpperCase();
  };


  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile.name} - Rolezeiro`,
        text: `Confira o perfil de ${profile.name} no Rolezeiro`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="bg-card rounded-lg p-6">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Avatar className="h-24 w-24 md:h-32 md:w-32">
          <AvatarImage src={profile.avatar_url || ''} alt={profile.name} />
          <AvatarFallback className="text-xl md:text-2xl">
            {getInitials(profile.name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold">{profile.name}</h1>
              {profile.verified && (
                <Badge variant="secondary" className="text-xs">
                  Verificado
                </Badge>
              )}
            </div>
            
            {profile.category_name && (
              <Badge variant="outline" className="mb-2">
                {profile.category_name}
              </Badge>
            )}
            
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              {profile.city && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {profile.city}, {profile.state}
                </div>
              )}
            </div>
          </div>
          
          {profile.bio_short && (
            <p className="text-foreground">{profile.bio_short}</p>
          )}
          
          {profile.tags && profile.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {profile.tags.slice(0, 5).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex gap-2">
            {profile.instagram && (
              <Button variant="outline" size="sm" asChild>
                <a 
                  href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Instagram className="h-4 w-4" />
                  Instagram
                </a>
              </Button>
            )}
            
            {profile.links?.map((link) => (
              <Button key={link.type} variant="outline" size="sm" asChild>
                <a 
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  {link.type.charAt(0).toUpperCase() + link.type.slice(1)}
                </a>
              </Button>
            ))}
          </div>
          
          {showActions && (
            <div className="flex gap-2 pt-2">
              <FollowEntityButton 
                entityType="artist" 
                entityId={profile.id}
                entityName={profile.name}
              />
              <Button variant="outline" onClick={handleShare} className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Compartilhar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}