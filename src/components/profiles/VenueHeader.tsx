import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, ExternalLink, Share2, Phone, Mail } from 'lucide-react';
import { Profile } from '@/features/profiles/api';
import { FollowEntityButton } from '@/components/follow/FollowEntityButton';

interface VenueHeaderProps {
  profile: Profile;
  showActions?: boolean;
}

export function VenueHeader({ profile, showActions = false }: VenueHeaderProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').slice(0, 2).toUpperCase();
  };


  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile.name} - Rolezeiro`,
        text: `Conheça ${profile.name} no Rolezeiro`,
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
            
            <Badge variant="outline" className="mb-2">
              Local de Eventos
            </Badge>
            
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
          
          <div className="flex gap-2">
            {profile.contact_phone && (
              <Button variant="outline" size="sm" asChild>
                <a 
                  href={`tel:${profile.contact_phone}`}
                  className="flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Telefone
                </a>
              </Button>
            )}
            
            {profile.contact_email && (
              <Button variant="outline" size="sm" asChild>
                <a 
                  href={`mailto:${profile.contact_email}`}
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email
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
                entityType="venue" 
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