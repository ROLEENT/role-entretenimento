import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MicIcon, 
  MapPinIcon, 
  InstagramIcon, 
  MailIcon, 
  PhoneIcon,
  GlobeIcon,
  BuildingIcon,
  UsersIcon,
  CalendarIcon,
  MusicIcon
} from "lucide-react";
import { Profile } from "@/features/profiles/api";
import { useProfileGenres } from "@/features/profiles/hooks/useProfileGenres";
import { useProfileStats } from "@/features/profiles/hooks/useProfileStats";

interface ProfileSidebarNewProps {
  profile: Profile;
}

export function ProfileSidebarNew({ profile }: ProfileSidebarNewProps) {
  const { data: genres = [] } = useProfileGenres(profile.id, profile.type);
  const { stats } = useProfileStats(profile.id);

  const getTypeIcon = () => {
    switch (profile.type) {
      case 'artista':
        return <MicIcon className="w-4 h-4" />;
      case 'local':
        return <BuildingIcon className="w-4 h-4" />;
      case 'organizador':
        return <UsersIcon className="w-4 h-4" />;
      default:
        return <MicIcon className="w-4 h-4" />;
    }
  };

  const getTypeLabel = () => {
    switch (profile.type) {
      case 'artista':
        return 'Artista';
      case 'local':
        return 'Local';
      case 'organizador':
        return 'Organizador';
      default:
        return 'Perfil';
    }
  };

  return (
    <div className="space-y-6 sticky top-6">
      {/* Main Info Card */}
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Informações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Type */}
          <div className="flex items-center gap-3">
            {getTypeIcon()}
            <div>
              <p className="text-sm font-medium">{getTypeLabel()}</p>
              <p className="text-xs text-muted-foreground">Tipo de perfil</p>
            </div>
          </div>


          {/* Contact Email */}
          {profile.contact_email && (
            <div className="flex items-center gap-3">
              <MailIcon className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{profile.contact_email}</p>
                <p className="text-xs text-muted-foreground">Email</p>
              </div>
            </div>
          )}

          {/* Contact Phone */}
          {profile.contact_phone && (
            <div className="flex items-center gap-3">
              <PhoneIcon className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{profile.contact_phone}</p>
                <p className="text-xs text-muted-foreground">Telefone</p>
              </div>
            </div>
          )}

          {/* Instagram (Artist specific) */}
          {profile.type === 'artista' && (profile as any).artist?.instagram && (
            <div className="flex items-center gap-3">
              <InstagramIcon className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <Button
                  variant="link"
                  className="h-auto p-0 text-sm font-medium text-left justify-start"
                  asChild
                >
                  <a 
                    href={`https://instagram.com/${(profile as any).artist.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    @{(profile as any).artist.instagram.replace('@', '')}
                  </a>
                </Button>
                <p className="text-xs text-muted-foreground">Instagram</p>
              </div>
            </div>
          )}

          {/* External Links */}
          {profile.links && typeof profile.links === 'object' && Object.entries(profile.links).map(([key, value]) => {
            if (!value || typeof value !== 'string') return null;
            
            return (
              <div key={key} className="flex items-center gap-3">
                <GlobeIcon className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <Button
                    variant="link"
                    className="h-auto p-0 text-sm font-medium text-left justify-start"
                    asChild
                  >
                    <a href={value} target="_blank" rel="noopener noreferrer">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </a>
                  </Button>
                  <p className="text-xs text-muted-foreground">Link externo</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Stats Card */}
      {stats && (
        <Card className="shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Estatísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stats.followers_count}</p>
                <p className="text-xs text-muted-foreground">Seguidores</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stats.events_count}</p>
                <p className="text-xs text-muted-foreground">Eventos</p>
              </div>
            </div>
            
            {stats.average_rating > 0 && (
              <div className="text-center pt-2 border-t">
                <p className="text-2xl font-bold text-primary">
                  {stats.average_rating.toFixed(1)}
                  <span className="text-sm text-muted-foreground ml-1">★</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {stats.total_reviews} {stats.total_reviews === 1 ? 'avaliação' : 'avaliações'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Genres/Tags Card */}
      {(genres.length > 0 || (profile.tags && profile.tags.length > 0)) && (
        <Card className="shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <MusicIcon className="w-4 h-4" />
              Tags Musicais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Genres */}
              {genres.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Gêneros</p>
                  <div className="flex flex-wrap gap-2">
                    {genres.map((genre) => (
                      <Button
                        key={genre.id}
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white"
                      >
                        {genre.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Other Tags */}
              {profile.tags && profile.tags.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary"
                        className="text-xs cursor-pointer hover:bg-primary hover:text-white transition-colors"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call to Action Card */}
      <Card className="shadow-card bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6 text-center">
          <h3 className="font-semibold text-primary mb-2">Gostou do perfil?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Siga para receber notificações sobre novos eventos e conteúdos.
          </p>
          <Button className="w-full bg-primary hover:bg-primary-hover">
            Seguir {profile.name}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
