import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreateProfile } from '../../schemas';
import { Eye, EyeOff, Music, MapPin, Users, Hash, Mail, Phone, Link } from 'lucide-react';

interface ReviewStepProps {
  form: UseFormReturn<CreateProfile>;
}

export function ReviewStep({ form }: ReviewStepProps) {
  const formData = form.getValues();

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'artista': return 'Artista';
      case 'local': return 'Local';
      case 'organizador': return 'Organizador';
      default: return type;
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    return visibility === 'public' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Revise suas informações</h3>
        <p className="text-muted-foreground">
          Confirme se todos os dados estão corretos antes de criar o perfil
        </p>
      </div>

      {/* Preview Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {formData.avatar_file && (
              <img
                src={URL.createObjectURL(formData.avatar_file)}
                alt="Preview avatar"
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-xl font-semibold">{formData.name}</h4>
                <Badge variant="outline">{getTypeLabel(formData.type)}</Badge>
              </div>
              <p className="text-muted-foreground">@{formData.handle}</p>
              <p className="text-sm mt-2">{formData.bio_short}</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {formData.city}, {formData.state} - {formData.country}
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm">
              {getVisibilityIcon(formData.visibility)}
              {formData.visibility === 'public' ? 'Público' : 'Privado'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nome</label>
              <p>{formData.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Handle</label>
              <p>@{formData.handle}</p>
            </div>
          </div>
          
          {formData.bio && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Bio completa</label>
              <p className="text-sm">{formData.bio}</p>
            </div>
          )}

          {formData.tags && formData.tags.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tags</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Information */}
      {(formData.contact_email || formData.contact_phone) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {formData.contact_email && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p>{formData.contact_email}</p>
                </div>
              )}
              {formData.contact_phone && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                  <p>{formData.contact_phone}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Links */}
      {formData.links && formData.links.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="w-5 h-5" />
              Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {formData.links.map((link, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">{link.type}</Badge>
                  <span className="text-muted-foreground">{link.url}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Type-specific Information */}
      {formData.type === 'artista' && formData.genres && formData.genres.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="w-5 h-5" />
              Informações do Artista
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Gêneros</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.genres.map((genre, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
            {formData.agency && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Agência</label>
                <p>{formData.agency}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {formData.type === 'local' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Informações do Local
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {formData.capacity && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Capacidade</label>
                  <p>{formData.capacity} pessoas</p>
                </div>
              )}
              {formData.age_policy && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Política de idade</label>
                  <p>{formData.age_policy}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {formData.type === 'organizador' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Informações do Organizador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.brand_name && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome da marca</label>
                <p>{formData.brand_name}</p>
              </div>
            )}
            {formData.cities && formData.cities.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Cidades de atuação</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.cities.map((city, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {city}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Images Preview */}
      {(formData.avatar_file || formData.cover_file) && (
        <Card>
          <CardHeader>
            <CardTitle>Imagens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.cover_file && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Capa</label>
                <img
                  src={URL.createObjectURL(formData.cover_file)}
                  alt="Preview capa"
                  className="w-full aspect-[3/1] object-cover rounded-lg mt-2"
                />
              </div>
            )}
            {formData.avatar_file && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Avatar</label>
                <img
                  src={URL.createObjectURL(formData.avatar_file)}
                  alt="Preview avatar"
                  className="w-24 h-24 rounded-full object-cover mt-2"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}