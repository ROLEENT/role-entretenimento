import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, Instagram, Map, Music, Video, ArrowLeft } from 'lucide-react';

interface LinksData {
  site?: string;
  instagram?: string;
  map?: string;
  playlist?: string;
  video?: string;
  previous_edition?: string;
}

interface LinksEditorProps {
  value: LinksData;
  onChange: (value: LinksData) => void;
  disabled?: boolean;
}

const linkFields = [
  {
    key: 'site' as keyof LinksData,
    label: 'Site Oficial',
    placeholder: 'https://site-do-evento.com',
    icon: Globe,
  },
  {
    key: 'instagram' as keyof LinksData,
    label: 'Instagram',
    placeholder: 'https://instagram.com/evento',
    icon: Instagram,
  },
  {
    key: 'map' as keyof LinksData,
    label: 'Mapa/Localização',
    placeholder: 'https://maps.google.com/...',
    icon: Map,
  },
  {
    key: 'playlist' as keyof LinksData,
    label: 'Playlist',
    placeholder: 'https://spotify.com/playlist/...',
    icon: Music,
  },
  {
    key: 'video' as keyof LinksData,
    label: 'Vídeo/Teaser',
    placeholder: 'https://youtube.com/watch?v=...',
    icon: Video,
  },
  {
    key: 'previous_edition' as keyof LinksData,
    label: 'Edição Anterior',
    placeholder: 'https://link-para-edicao-anterior.com',
    icon: ArrowLeft,
  },
];

export const LinksEditor = ({ value, onChange, disabled }: LinksEditorProps) => {
  const updateField = (field: keyof LinksData, newValue: string) => {
    onChange({ ...value, [field]: newValue || undefined });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Links do Evento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {linkFields.map((field) => {
            const Icon = field.icon;
            return (
              <div key={field.key} className="space-y-2">
                <Label 
                  htmlFor={`link-${field.key}`}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {field.label}
                </Label>
                <Input
                  id={`link-${field.key}`}
                  type="url"
                  value={value[field.key] || ''}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  disabled={disabled}
                />
              </div>
            );
          })}
        </div>

        <div className="text-xs text-muted-foreground">
          <p>Todos os links são opcionais. URLs devem ser completas incluindo https://</p>
          <p>Estes links aparecerão na página do evento para facilitar o acesso dos usuários.</p>
        </div>
      </CardContent>
    </Card>
  );
};