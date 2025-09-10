import { Profile } from "@/features/profiles/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin, Mail, Phone, ExternalLink, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRealProfileStats } from "@/hooks/useRealProfileStats";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileSidebarNewProps {
  profile: Profile;
}

export function ProfileSidebarNew({ profile }: ProfileSidebarNewProps) {
  const { data: stats, isLoading } = useRealProfileStats(profile.id, profile.type);

  return (
    <div className="space-y-6">
      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações de Contato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile.city && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{profile.city}, {profile.state}</span>
            </div>
          )}
          
          {profile.contact_email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <a 
                href={`mailto:${profile.contact_email}`}
                className="text-primary hover:underline"
              >
                {profile.contact_email}
              </a>
            </div>
          )}
          
          {profile.contact_phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <a 
                href={`tel:${profile.contact_phone}`}
                className="text-primary hover:underline"
              >
                {profile.contact_phone}
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Links */}
      {profile.links && profile.links.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {profile.links.map((link, index) => (
              <Button
                key={index}
                asChild
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {link.type}
                </a>
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {profile.tags && profile.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estatísticas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>Seguidores</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-5 w-8" />
            ) : (
              <span className="font-semibold">
                {stats?.followersCount || 0}
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>Eventos</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-5 w-8" />
            ) : (
              <span className="font-semibold">
                {stats?.eventCount || 0}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category */}
      {profile.category_name && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="w-full justify-center">
              {profile.category_name}
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
}