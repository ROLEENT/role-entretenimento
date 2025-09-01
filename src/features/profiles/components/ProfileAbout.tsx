import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPinIcon, CalendarIcon, LinkIcon, InstagramIcon, GlobeIcon, MailIcon, PhoneIcon } from "lucide-react";
import { Profile } from "@/features/profiles/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProfileAboutProps {
  profile: Profile;
}

export function ProfileAbout({ profile }: ProfileAboutProps) {
  const renderTypeSpecificInfo = () => {
    switch (profile.type) {
      case 'artista':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Informações Artísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(profile as any).artist?.real_name && (
                <div>
                  <span className="text-sm font-medium">Nome Real:</span>
                  <p className="text-muted-foreground">{(profile as any).artist.real_name}</p>
                </div>
              )}
              {(profile as any).artist?.genre_primary && (
                <div>
                  <span className="text-sm font-medium">Gênero Principal:</span>
                  <p className="text-muted-foreground">{(profile as any).artist.genre_primary}</p>
                </div>
              )}
              {(profile as any).artist?.genres_secondary && (profile as any).artist.genres_secondary.length > 0 && (
                <div>
                  <span className="text-sm font-medium">Outros Gêneros:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(profile as any).artist.genres_secondary.map((genre: string) => (
                      <Badge key={genre} variant="secondary" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {(profile as any).artist?.formation_year && (
                <div>
                  <span className="text-sm font-medium">Ano de Formação:</span>
                  <p className="text-muted-foreground">{(profile as any).artist.formation_year}</p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'local':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Informações do Local</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(profile as any).profile_venue?.address && (
                <div>
                  <span className="text-sm font-medium">Endereço:</span>
                  <p className="text-muted-foreground">{(profile as any).profile_venue.address}</p>
                </div>
              )}
              {(profile as any).profile_venue?.capacity && (
                <div>
                  <span className="text-sm font-medium">Capacidade:</span>
                  <p className="text-muted-foreground">{(profile as any).profile_venue.capacity} pessoas</p>
                </div>
              )}
              {(profile as any).profile_venue?.venue_type && (
                <div>
                  <span className="text-sm font-medium">Tipo de Local:</span>
                  <p className="text-muted-foreground">{(profile as any).profile_venue.venue_type}</p>
                </div>
              )}
              {(profile as any).profile_venue?.operating_hours && (
                <div>
                  <span className="text-sm font-medium">Horário de Funcionamento:</span>
                  <p className="text-muted-foreground">{(profile as any).profile_venue.operating_hours}</p>
                </div>
              )}
              {(profile as any).profile_venue?.accessibility_features && (profile as any).profile_venue.accessibility_features.length > 0 && (
                <div>
                  <span className="text-sm font-medium">Acessibilidade:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(profile as any).profile_venue.accessibility_features.map((feature: string) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'organizador':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Informações da Organização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(profile as any).profile_org?.company_name && (
                <div>
                  <span className="text-sm font-medium">Empresa:</span>
                  <p className="text-muted-foreground">{(profile as any).profile_org.company_name}</p>
                </div>
              )}
              {(profile as any).profile_org?.founded_year && (
                <div>
                  <span className="text-sm font-medium">Fundado em:</span>
                  <p className="text-muted-foreground">{(profile as any).profile_org.founded_year}</p>
                </div>
              )}
              {(profile as any).profile_org?.event_types && (profile as any).profile_org.event_types.length > 0 && (
                <div>
                  <span className="text-sm font-medium">Tipos de Eventos:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(profile as any).profile_org.event_types.map((type: string) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {(profile as any).profile_org?.specializations && (profile as any).profile_org.specializations.length > 0 && (
                <div>
                  <span className="text-sm font-medium">Especializações:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(profile as any).profile_org.specializations.map((spec: string) => (
                      <Badge key={spec} variant="secondary" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Biography */}
      {profile.bio && (
        <Card>
          <CardHeader>
            <CardTitle>Biografia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              {profile.bio.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações de Contato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <MapPinIcon className="h-4 w-4 text-muted-foreground" />
            <span>{profile.city}</span>
          </div>
          
          {profile.contact_phone && (
            <div className="flex items-center gap-3">
              <PhoneIcon className="h-4 w-4 text-muted-foreground" />
              <span>{profile.contact_phone}</span>
            </div>
          )}
          
          {profile.contact_email && (
            <div className="flex items-center gap-3">
              <MailIcon className="h-4 w-4 text-muted-foreground" />
              <span>{profile.contact_email}</span>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span>Membro desde {format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })}</span>
          </div>
        </CardContent>
      </Card>

      {/* External Links */}
      {profile.links && profile.links.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Links Externos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profile.links.map((link, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.type === 'instagram' && <InstagramIcon className="h-4 w-4 mr-2" />}
                    {link.type === 'website' && <GlobeIcon className="h-4 w-4 mr-2" />}
                    {link.type === 'other' && <LinkIcon className="h-4 w-4 mr-2" />}
                    {link.type}
                  </a>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {profile.tags && profile.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Type-specific Information */}
      {renderTypeSpecificInfo()}
    </div>
  );
}