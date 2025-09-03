import { ExternalLink, Instagram, Globe, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Profile } from "@/features/profiles/api";

interface ProfileAboutMobileProps {
  profile: Profile;
}

export function ProfileAboutMobile({ profile }: ProfileAboutMobileProps) {
  const links = profile.links || [];
  const instagramLink = links.find(link => link.type === 'instagram')?.url;
  const websiteLink = links.find(link => link.type === 'website')?.url;
  
  return (
    <div className="space-y-6">
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

      {/* Links oficiais */}
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
    </div>
  );
}