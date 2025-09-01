import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useProfiles, type Profile } from '@/hooks/useProfiles';
import { Edit, MapPin, Globe, Instagram, Mail, Phone, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileViewPage() {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const { loading, getProfileByHandle } = useProfiles();

  useEffect(() => {
    if (handle) {
      getProfileByHandle(handle).then(setProfile);
    }
  }, [handle, getProfileByHandle]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          
          <div className="space-y-6">
            <div className="relative">
              <Skeleton className="h-64 w-full rounded-lg" />
              <div className="absolute -bottom-16 left-8">
                <Skeleton className="h-32 w-32 rounded-full border-4 border-background" />
              </div>
            </div>
            
            <div className="pt-16 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-10 w-24" />
              </div>
              
              <Skeleton className="h-20 w-full" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Perfil não encontrado</h1>
          <p className="text-muted-foreground mb-6">
            O perfil @{handle} não existe ou foi removido.
          </p>
          <Button onClick={() => navigate('/perfis')}>
            Ver todos os perfis
          </Button>
        </div>
      </div>
    );
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'artist': return 'Artista';
      case 'venue': return 'Local';
      case 'organizer': return 'Organizador';
      default: return type;
    }
  };

  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'Público';
      case 'private': return 'Privado';
      case 'draft': return 'Rascunho';
      default: return visibility;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="space-y-6">
          {/* Cover Image */}
          <div className="relative">
            <div className="h-64 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg overflow-hidden">
              {profile.cover_url && (
                <img
                  src={profile.cover_url}
                  alt={`Capa de ${profile.name}`}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            {/* Avatar */}
            <div className="absolute -bottom-16 left-8">
              <div className="h-32 w-32 rounded-full bg-background border-4 border-background overflow-hidden">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-16 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                <p className="text-lg text-muted-foreground">@{profile.handle}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {getTypeLabel(profile.type)}
                  </Badge>
                  <Badge variant={profile.visibility === 'public' ? 'default' : 'outline'}>
                    {getVisibilityLabel(profile.visibility)}
                  </Badge>
                </div>
              </div>
              
              <Button asChild>
                <Link to={`/perfil/${profile.handle}/editar`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Link>
              </Button>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div>
                <p className="text-foreground leading-relaxed">{profile.bio}</p>
              </div>
            )}

            <Separator />

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações</h3>
                <div className="space-y-2">
                  {profile.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${profile.email}`} className="hover:text-foreground">
                        {profile.email}
                      </a>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${profile.phone}`} className="hover:text-foreground">
                        {profile.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Links</h3>
                <div className="space-y-2">
                  {profile.website && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      <a 
                        href={profile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-foreground"
                      >
                        Website
                      </a>
                    </div>
                  )}
                  {profile.instagram && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Instagram className="h-4 w-4" />
                      <a 
                        href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground"
                      >
                        @{profile.instagram.replace('@', '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Metadata */}
            {profile.metadata && Object.keys(profile.metadata).length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informações Adicionais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(profile.metadata).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </span>
                        <p className="text-sm">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Timestamps */}
            <Separator />
            <div className="text-sm text-muted-foreground">
              <p>Criado em {new Date(profile.created_at).toLocaleDateString('pt-BR')}</p>
              {profile.updated_at !== profile.created_at && (
                <p>Atualizado em {new Date(profile.updated_at).toLocaleDateString('pt-BR')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}