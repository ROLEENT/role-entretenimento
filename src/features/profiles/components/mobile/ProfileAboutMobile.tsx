import { ExternalLink, Instagram, Globe, Mail, MapPin, PhoneIcon, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Profile } from "@/features/profiles/api";
import { Component, ReactNode } from "react";

interface ProfileAboutMobileProps {
  profile: Profile;
}

class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary capturou erro:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

function ErrorFallback() {
  return (
    <div className="px-4 py-6 text-center">
      <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
      <h3 className="text-sm font-medium text-foreground mb-2">Informações indisponíveis</h3>
      <p className="text-xs text-muted-foreground">
        Não foi possível carregar as informações do perfil no momento.
      </p>
    </div>
  );
}

function ProfileAboutMobileContent({ profile }: ProfileAboutMobileProps) {
  console.log('ProfileAboutMobile renderizando com profile:', profile);
  
  // Verificações defensivas
  if (!profile) {
    console.error('Profile não fornecido para ProfileAboutMobile');
    return <ErrorFallback />;
  }

  // Safe access para links
  let links: any[] = [];
  let instagramLink: string | undefined;
  let websiteLink: string | undefined;

  try {
    links = Array.isArray(profile.links) ? profile.links : [];
    instagramLink = links.find(link => link?.type === 'instagram')?.url;
    websiteLink = links.find(link => link?.type === 'website')?.url;
  } catch (error) {
    console.error('Erro ao processar links:', error);
    links = [];
  }
  
  return (
    <div className="space-y-6">
      {/* Categoria e cidade destacada para locais */}
      {profile.type === 'local' && (
        <div className="px-4">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {profile.city && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                📍 {profile.city}
              </Badge>
            )}
            {profile.category_name && (
              <Badge variant="outline">
                {profile.category_name}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Bio completa */}
      {profile.bio && (
        <div className="px-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Sobre</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {profile.bio}
          </p>
        </div>
      )}

      {/* Localização */}
      {(profile.city || profile.state) && (
        <div className="px-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Localização</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>
              {profile.city}{profile.city && profile.state && ', '}{profile.state}
              {profile.country && profile.country !== 'BR' && `, ${profile.country}`}
            </span>
          </div>
        </div>
      )}

      {/* Informações de contato */}
      {(profile.contact_phone || profile.contact_email) && (
        <div className="px-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Contato</h3>
          <div className="space-y-2">
            {profile.contact_phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <PhoneIcon className="w-4 h-4" />
                <span>{profile.contact_phone}</span>
              </div>
            )}
            {profile.contact_email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{profile.contact_email}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Links oficiais */}
      {(instagramLink || profile.instagram || websiteLink || profile.contact_email) && (
        <div className="px-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Links</h3>
          <div className="space-y-3">
            {/* Instagram */}
            {(instagramLink || profile.instagram) && (
              <Card className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-3">
                  <a 
                    href={instagramLink || profile.instagram || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 min-h-[44px]"
                    aria-label="Perfil no Instagram"
                  >
                    <Instagram className="w-5 h-5 text-[#E4405F]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">Instagram</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {(instagramLink || profile.instagram)?.replace('https://instagram.com/', '@')}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Website */}
            {websiteLink && (
              <Card className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-3">
                  <a 
                    href={websiteLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 min-h-[44px]"
                    aria-label="Website oficial"
                  >
                    <Globe className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">Website</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {websiteLink.replace(/^https?:\/\//, '')}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Email de contato */}
            {profile.contact_email && (
              <Card className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-3">
                  <a 
                    href={`mailto:${profile.contact_email}`}
                    className="flex items-center gap-3 min-h-[44px]"
                    aria-label="Enviar email"
                  >
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">Email</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {profile.contact_email}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </a>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function ProfileAboutMobile({ profile }: ProfileAboutMobileProps) {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <ProfileAboutMobileContent profile={profile} />
    </ErrorBoundary>
  );
}