import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { X, Plus, Link as LinkIcon } from 'lucide-react';

interface Link {
  type: string;
  url: string;
}

interface LinkEditorProps {
  value: Link[];
  onChange: (links: Link[]) => void;
}

const linkTypes = [
  { value: 'website', label: 'Website', placeholder: 'https://meusite.com' },
  { value: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/usuario' },
  { value: 'spotify', label: 'Spotify', placeholder: 'https://open.spotify.com/artist/...' },
  { value: 'soundcloud', label: 'SoundCloud', placeholder: 'https://soundcloud.com/usuario' },
  { value: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/channel/...' },
  { value: 'bandcamp', label: 'Bandcamp', placeholder: 'https://usuario.bandcamp.com' },
  { value: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/pagina' },
  { value: 'twitter', label: 'Twitter/X', placeholder: 'https://twitter.com/usuario' },
  { value: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@usuario' },
  { value: 'linktree', label: 'Linktree', placeholder: 'https://linktr.ee/usuario' },
  { value: 'email', label: 'Email', placeholder: 'contato@exemplo.com' },
  { value: 'whatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/5511999999999' },
  { value: 'telegram', label: 'Telegram', placeholder: 'https://t.me/usuario' },
  { value: 'twitch', label: 'Twitch', placeholder: 'https://twitch.tv/usuario' },
  { value: 'other', label: 'Outro', placeholder: 'https://exemplo.com' }
];

export function LinkEditor({ value = [], onChange }: LinkEditorProps) {
  const [newLink, setNewLink] = useState<Link>({ type: '', url: '' });
  const [showForm, setShowForm] = useState(false);

  const addLink = () => {
    if (newLink.type && newLink.url.trim()) {
      let processedUrl = newLink.url.trim();
      
      // Add https:// if not present and not email
      if (newLink.type !== 'email' && !processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
        processedUrl = `https://${processedUrl}`;
      }
      
      onChange([...value, { ...newLink, url: processedUrl }]);
      setNewLink({ type: '', url: '' });
      setShowForm(false);
    }
  };

  const removeLink = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: keyof Link, newValue: string) => {
    const updatedLinks = value.map((link, i) => 
      i === index ? { ...link, [field]: newValue } : link
    );
    onChange(updatedLinks);
  };

  const getLinkTypeLabel = (type: string) => {
    return linkTypes.find(t => t.value === type)?.label || type;
  };

  const getPlaceholder = (type: string) => {
    return linkTypes.find(t => t.value === type)?.placeholder || 'https://exemplo.com';
  };

  return (
    <div className="space-y-3">
      {/* Existing Links */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((link, index) => (
            <Card key={index}>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  
                  <Select
                    value={link.type}
                    onValueChange={(newType) => updateLink(index, 'type', newType)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {linkTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    value={link.url}
                    onChange={(e) => updateLink(index, 'url', e.target.value)}
                    placeholder={getPlaceholder(link.type)}
                    className="flex-1"
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLink(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Link Form */}
      {showForm ? (
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              
              <Select
                value={newLink.type}
                onValueChange={(type) => setNewLink({ ...newLink, type })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  {linkTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                placeholder={newLink.type ? getPlaceholder(newLink.type) : 'Selecione o tipo primeiro'}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addLink();
                  }
                }}
              />

              <Button
                type="button"
                size="sm"
                onClick={addLink}
                disabled={!newLink.type || !newLink.url.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  setNewLink({ type: '', url: '' });
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowForm(true)}
          className="w-full flex items-center gap-2"
          disabled={value.length >= 10}
        >
          <Plus className="w-4 h-4" />
          Adicionar Link {value.length > 0 && `(${value.length}/10)`}
        </Button>
      )}

      {value.length >= 10 && (
        <p className="text-xs text-muted-foreground">
          Máximo de 10 links permitidos
        </p>
      )}
    </div>
  );
}
