import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MapPin, Globe, Instagram, Mail, Phone, Eye, Edit } from 'lucide-react';
import { Profile } from '@/hooks/useProfiles';

interface ProfileCardProps {
  profile: Profile;
  onView?: (profile: Profile) => void;
  onEdit?: (profile: Profile) => void;
  showActions?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onView,
  onEdit,
  showActions = true
}) => {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'artist': return 'Artista';
      case 'venue': return 'Local';
      case 'organizer': return 'Organizador';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'artist': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'venue': return 'bg-green-100 text-green-800 border-green-200';
      case 'organizer': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'bg-green-100 text-green-800 border-green-200';
      case 'private': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Cover Image */}
      {profile.cover_url && (
        <div className="h-32 w-full overflow-hidden">
          <img
            src={profile.cover_url}
            alt={`Capa de ${profile.name}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback>
              {profile.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{profile.name}</h3>
            <p className="text-sm text-muted-foreground">@{profile.handle}</p>
            
            <div className="flex gap-2 mt-2">
              <Badge 
                variant="outline" 
                className={getTypeColor(profile.type)}
              >
                {getTypeLabel(profile.type)}
              </Badge>
              
              <Badge 
                variant="outline" 
                className={getVisibilityColor(profile.visibility)}
              >
                {profile.visibility === 'public' ? 'Público' : 
                 profile.visibility === 'private' ? 'Privado' : 'Rascunho'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {profile.bio}
          </p>
        )}

        {/* Info */}
        <div className="space-y-2 mb-4">
          {profile.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{profile.location}</span>
            </div>
          )}

          {profile.website && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <a 
                href={profile.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary truncate"
              >
                {profile.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}

          {profile.instagram && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Instagram className="h-4 w-4" />
              <span>{profile.instagram}</span>
            </div>
          )}

          {profile.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a 
                href={`mailto:${profile.email}`}
                className="hover:text-primary truncate"
              >
                {profile.email}
              </a>
            </div>
          )}

          {profile.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{profile.phone}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            {onView && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(profile)}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver
              </Button>
            )}
            
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(profile)}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};