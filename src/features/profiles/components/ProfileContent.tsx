import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { Profile } from "../api";

interface ProfileContentProps {
  profile: Profile;
  activeTab: string;
}

export function ProfileContent({ profile, activeTab }: ProfileContentProps) {
  if (activeTab === 'sobre') {
    return (
      <div className="space-y-6">
        {/* Bio */}
        {profile.bio && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Sobre</h2>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap leading-relaxed">{profile.bio}</p>
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
                    className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors group"
                  >
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.profile_artist.genres && profile.profile_artist.genres.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Gêneros Musicais</h3>
                    <div className="flex flex-wrap gap-2">
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
                    <h3 className="font-medium mb-2">Agência</h3>
                    <p className="text-muted-foreground">{profile.profile_artist.agency}</p>
                  </div>
                )}
                {profile.profile_artist.fee_band && (
                  <div>
                    <h3 className="font-medium mb-2">Faixa de Cachê</h3>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.profile_venue.capacity && (
                  <div>
                    <h3 className="font-medium mb-2">Capacidade</h3>
                    <p className="text-muted-foreground">{profile.profile_venue.capacity} pessoas</p>
                  </div>
                )}
                {profile.profile_venue.age_policy && (
                  <div>
                    <h3 className="font-medium mb-2">Política de Idade</h3>
                    <p className="text-muted-foreground">{profile.profile_venue.age_policy}</p>
                  </div>
                )}
                {profile.profile_venue.address && (
                  <div className="md:col-span-2">
                    <h3 className="font-medium mb-2">Endereço</h3>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.profile_org.brand_name && (
                  <div>
                    <h3 className="font-medium mb-2">Nome da Marca</h3>
                    <p className="text-muted-foreground">{profile.profile_org.brand_name}</p>
                  </div>
                )}
                {profile.profile_org.manager_name && (
                  <div>
                    <h3 className="font-medium mb-2">Responsável</h3>
                    <p className="text-muted-foreground">{profile.profile_org.manager_name}</p>
                  </div>
                )}
                {profile.profile_org.cities && (
                  <div className="md:col-span-2">
                    <h3 className="font-medium mb-2">Cidades de Atuação</h3>
                    <p className="text-muted-foreground">{profile.profile_org.cities}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Placeholder content for other tabs
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Em breve</h2>
        <p className="text-muted-foreground">
          Esta seção estará disponível em breve.
        </p>
      </CardContent>
    </Card>
  );
}