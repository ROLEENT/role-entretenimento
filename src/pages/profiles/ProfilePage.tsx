import { useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Mail, Phone, ExternalLink } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useProfile } from "@/features/profiles/hooks/useProfiles";
import FollowButton from "@/features/profiles/FollowButton";

export default function ProfilePage() {
  const { handle } = useParams<{ handle: string }>();
  const cleanHandle = handle?.replace(/^@/, "").toLowerCase() || "";

  const { data: profile, isLoading, error } = useProfile(cleanHandle);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !profile) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{profile.name} - @{profile.handle}</title>
        <meta name="description" content={profile.bio_short ?? `Perfil de ${profile.name}`} />
        {profile.cover_url && <meta property="og:image" content={profile.cover_url} />}
        <link rel="canonical" href={`/perfil/${profile.handle}`} />
      </Helmet>

      {/* Cover Section */}
      <div className="relative h-64 bg-gradient-to-r from-primary/20 to-primary/10">
        {profile.cover_url && (
          <img 
            src={profile.cover_url} 
            alt={`Capa de ${profile.name}`}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Profile Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="relative -mt-20 z-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Profile Info Card */}
            <Card className="lg:w-1/3">
              <CardContent className="p-6">
                {/* Avatar and basic info */}
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-4 overflow-hidden border-4 border-background shadow-lg">
                    {profile.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={`Avatar de ${profile.name}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-primary">
                        {profile.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold mb-2">{profile.name}</h1>
                  <p className="text-muted-foreground mb-2">@{profile.handle}</p>
                  <Badge variant="secondary" className="mb-4">
                    {profile.type === 'artista' ? 'Artista' :
                     profile.type === 'local' ? 'Local' :
                     profile.type === 'organizador' ? 'Organizador' : profile.type}
                  </Badge>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.city}, {profile.state}, {profile.country}</span>
                </div>

                {/* Bio Short */}
                <p className="text-sm leading-relaxed mb-6">{profile.bio_short}</p>

                {/* Contact Info */}
                {(profile.contact_email || profile.contact_phone) && (
                  <div className="space-y-2 mb-6">
                    {profile.contact_email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <a href={`mailto:${profile.contact_email}`} className="text-primary hover:underline">
                          {profile.contact_email}
                        </a>
                      </div>
                    )}
                    {profile.contact_phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{profile.contact_phone}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Tags */}
                {profile.tags && profile.tags.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-medium mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Follow Button */}
                <FollowButton profileId={profile.id} className="w-full" />
              </CardContent>
            </Card>

            {/* Main Content */}
            <div className="lg:w-2/3 space-y-6">
              {/* Bio */}
              {profile.bio && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Sobre</h2>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{profile.bio}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Links */}
              {profile.links && profile.links.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Links</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {profile.links.map((link: any, index: number) => (
                        <a 
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{link.type}</span>
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Type-specific content */}
              {profile.type === 'artista' && profile.profile_artist && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Informações Artísticas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {profile.profile_artist.genres && profile.profile_artist.genres.length > 0 && (
                        <div>
                          <span className="font-medium">Gêneros:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {profile.profile_artist.genres.map((genre: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {genre}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {profile.profile_artist.agency && (
                        <div>
                          <span className="font-medium">Agência:</span>
                          <p className="text-muted-foreground">{profile.profile_artist.agency}</p>
                        </div>
                      )}
                      {profile.profile_artist.fee_band && (
                        <div>
                          <span className="font-medium">Faixa de cachê:</span>
                          <p className="text-muted-foreground">{profile.profile_artist.fee_band}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {profile.type === 'local' && profile.profile_venue && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Informações do Local</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {profile.profile_venue.capacity && (
                        <div>
                          <span className="font-medium">Capacidade:</span>
                          <p className="text-muted-foreground">{profile.profile_venue.capacity} pessoas</p>
                        </div>
                      )}
                      {profile.profile_venue.age_policy && (
                        <div>
                          <span className="font-medium">Política de idade:</span>
                          <p className="text-muted-foreground">{profile.profile_venue.age_policy}</p>
                        </div>
                      )}
                      {profile.profile_venue.address && (
                        <div className="md:col-span-2">
                          <span className="font-medium">Endereço:</span>
                          <p className="text-muted-foreground">{profile.profile_venue.address}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {profile.type === 'organizador' && profile.profile_org && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Informações da Organização</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {profile.profile_org.brand_name && (
                        <div>
                          <span className="font-medium">Nome da marca:</span>
                          <p className="text-muted-foreground">{profile.profile_org.brand_name}</p>
                        </div>
                      )}
                      {profile.profile_org.manager_name && (
                        <div>
                          <span className="font-medium">Responsável:</span>
                          <p className="text-muted-foreground">{profile.profile_org.manager_name}</p>
                        </div>
                      )}
                      {profile.profile_org.cities && (
                        <div className="md:col-span-2">
                          <span className="font-medium">Cidades de atuação:</span>
                          <p className="text-muted-foreground">{profile.profile_org.cities}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}