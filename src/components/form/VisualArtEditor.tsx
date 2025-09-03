import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

interface VisualArtist {
  name: string;
  work?: string;
  portfolio_url?: string;
}

interface VisualArtEditorProps {
  value: VisualArtist[];
  onChange: (value: VisualArtist[]) => void;
  disabled?: boolean;
}

export const VisualArtEditor = ({ value, onChange, disabled }: VisualArtEditorProps) => {
  const addArtist = () => {
    const newArtist: VisualArtist = {
      name: '',
    };
    onChange([...value, newArtist]);
  };

  const updateArtist = (index: number, field: keyof VisualArtist, newValue: string) => {
    const updated = value.map((item, i) => 
      i === index ? { ...item, [field]: newValue } : item
    );
    onChange(updated);
  };

  const removeArtist = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Artistas Visuais</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addArtist}
          disabled={disabled}
          className="h-8"
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar Artista Visual
        </Button>
      </div>

      {value.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">Nenhum artista visual adicionado</p>
          <p className="text-xs">Clique em "Adicionar Artista Visual" para começar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {value.map((artist, index) => (
            <Card key={index} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Artista Visual #{index + 1}</CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeArtist(index)}
                    disabled={disabled}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`artist-name-${index}`}>Nome*</Label>
                    <Input
                      id={`artist-name-${index}`}
                      value={artist.name}
                      onChange={(e) => updateArtist(index, 'name', e.target.value)}
                      placeholder="Nome do artista visual..."
                      disabled={disabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`artist-work-${index}`}>Obra/Projeto</Label>
                    <Input
                      id={`artist-work-${index}`}
                      value={artist.work || ''}
                      onChange={(e) => updateArtist(index, 'work', e.target.value)}
                      placeholder="Nome da obra ou projeto..."
                      disabled={disabled}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`artist-portfolio-${index}`}>URL do Portfólio</Label>
                  <Input
                    id={`artist-portfolio-${index}`}
                    type="url"
                    value={artist.portfolio_url || ''}
                    onChange={(e) => updateArtist(index, 'portfolio_url', e.target.value)}
                    placeholder="https://..."
                    disabled={disabled}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};