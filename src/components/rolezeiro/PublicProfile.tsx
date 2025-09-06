import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FollowButton } from '@/components/profiles/FollowButton';
import { 
  User, MapPin, Phone, Globe, Instagram, Calendar, 
  Heart, Users, Clock, Music, AccessibilityIcon 
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  city: string;
  phone: string;
  instagram: string;
  website: string;
  birth_date: string;
  is_profile_public: boolean;
  preferred_genres: string[];
  accessibility_notes: string;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  saved_events_count: number;
  attendances_count: number;
  following_count: number;
}

interface PublicProfileProps {
  profile: UserProfile;
  stats?: UserStats | null;
  showFollowButton?: boolean;
}

export function PublicProfile({ profile, stats, showFollowButton = true }: PublicProfileProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <Avatar className="h-24 w-24 md:h-32 md:w-32">
              <AvatarImage src={profile.avatar_url || ''} />
              <AvatarFallback className="text-xl">
                {getInitials(profile.display_name || profile.username)}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {profile.display_name || profile.username}
                </h1>
                {profile.display_name && (
                  <p className="text-muted-foreground">@{profile.username}</p>
                )}
                {profile.bio && (
                  <p className="mt-2 text-muted-foreground">{profile.bio}</p>
                )}
              </div>

              {/* Stats */}
              {stats && (
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{stats.saved_events_count}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Eventos</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{stats.attendances_count}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Presenças</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{stats.following_count}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Seguindo</p>
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {profile.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.city}</span>
                  </div>
                )}
                {profile.instagram && (
                  <div className="flex items-center gap-1">
                    <Instagram className="h-4 w-4" />
                    <a 
                      href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary"
                    >
                      {profile.instagram}
                    </a>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    <a 
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary"
                    >
                      Website
                    </a>
                  </div>
                )}
                {profile.created_at && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Desde {formatDate(profile.created_at)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Follow Button */}
            {showFollowButton && (
              <div className="w-full md:w-auto">
                <FollowButton profileId={profile.user_id} className="w-full md:w-auto" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preferred Genres */}
      {profile.preferred_genres && profile.preferred_genres.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Gêneros Favoritos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.preferred_genres.map((genre) => (
                <Badge key={genre} variant="secondary">
                  {genre}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accessibility Notes */}
      {profile.accessibility_notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AccessibilityIcon className="h-5 w-5" />
              Acessibilidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{profile.accessibility_notes}</p>
          </CardContent>
        </Card>
      )}

      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.bio ? (
            <p>{profile.bio}</p>
          ) : (
            <p className="text-muted-foreground italic">
              Este usuário ainda não adicionou uma biografia.
            </p>
          )}

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Membro desde:</strong>
              <p className="text-muted-foreground">
                {formatDate(profile.created_at)}
              </p>
            </div>
            {profile.city && (
              <div>
                <strong>Localização:</strong>
                <p className="text-muted-foreground">{profile.city}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}