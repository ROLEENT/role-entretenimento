import React, { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { EventFormData } from '@/schemas/eventSchema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Music, 
  Star, 
  Users, 
  Mic,
  X,
  ChevronUp,
  ChevronDown,
  GripVertical
} from 'lucide-react';
import { ComboboxAsync } from '@/components/ui/combobox-async';
import { useEntityLookup } from '@/hooks/useEntityLookup';

// Drag handle component
const DragHandle: React.FC<{ 
  onMoveUp: () => void; 
  onMoveDown: () => void; 
  canMoveUp: boolean; 
  canMoveDown: boolean;
}> = ({ onMoveUp, onMoveDown, canMoveUp, canMoveDown }) => (
  <div className="flex flex-col gap-1">
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onMoveUp}
      disabled={!canMoveUp}
      className="h-6 w-6 p-0"
    >
      <ChevronUp className="h-3 w-3" />
    </Button>
    <GripVertical className="h-4 w-4 text-muted-foreground" />
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onMoveDown}
      disabled={!canMoveDown}
      className="h-6 w-6 p-0"
    >
      <ChevronDown className="h-3 w-3" />
    </Button>
  </div>
);

// Role icon mapping
const getRoleIcon = (role: string) => {
  switch (role) {
    case 'headliner':
      return <Star className="w-3 h-3" />;
    case 'support':
      return <Users className="w-3 h-3" />;
    case 'special-guest':
      return <Mic className="w-3 h-3" />;
    default:
      return <Music className="w-3 h-3" />;
  }
};

// Role label mapping
const getRoleLabel = (role: string) => {
  switch (role) {
    case 'headliner':
      return 'Headliner';
    case 'support':
      return 'Support';
    case 'special-guest':
      return 'Convidado';
    default:
      return 'Performer';
  }
};

export const SimpleArtistSelector: React.FC = () => {
  const { control } = useFormContext<EventFormData>();
  const [selectedArtistId, setSelectedArtistId] = useState<string>('');
  
  const { searchEntities: searchArtists } = useEntityLookup({ type: 'artists' });

  const {
    fields: artists,
    append: appendArtist,
    remove: removeArtist,
    move: moveArtist
  } = useFieldArray({
    control,
    name: 'artists'
  });

  const handleArtistSelect = async (artistId: string | undefined) => {
    if (!artistId) {
      setSelectedArtistId('');
      return;
    }

    // Check if artist is already selected
    const existingArtist = artists.find((artist: any) => artist.artist_id === artistId);
    if (existingArtist) {
      setSelectedArtistId('');
      return;
    }

    try {
      // Get artist data from search
      const searchResults = await searchArtists('');
      const selectedArtist = searchResults.find(artist => artist.value === artistId);
      
      if (selectedArtist) {
        appendArtist({
          artist_id: selectedArtist.value,
          artist_name: selectedArtist.name,
          position: artists.length,
          role: 'performer'
        });
      } else {
        // Fallback
        appendArtist({
          artist_id: artistId,
          artist_name: `Artista ${artistId.slice(0, 8)}...`,
          position: artists.length,
          role: 'performer'
        });
      }
    } catch (error) {
      console.error('Error adding artist:', error);
      // Fallback
      appendArtist({
        artist_id: artistId,
        artist_name: `Artista ${artistId.slice(0, 8)}...`,
        position: artists.length,
        role: 'performer'
      });
    }
    
    setSelectedArtistId('');
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-primary" />
            <FormLabel className="text-base font-semibold">Lineup Musical</FormLabel>
          </div>
          
          {/* Artist search and add */}
          <div className="space-y-2">
            <ComboboxAsync
              placeholder="Buscar e adicionar artista..."
              emptyText="Nenhum artista encontrado"
              onSearch={searchArtists}
              onValueChange={handleArtistSelect}
              value={selectedArtistId}
            />
          </div>

          {/* Selected artists list */}
          {artists.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-muted-foreground">
                Artistas selecionados ({artists.length})
              </div>
              
              {artists.map((artist, artistIndex) => (
                <div key={artist.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
                  <DragHandle
                    onMoveUp={() => moveArtist(artistIndex, artistIndex - 1)}
                    onMoveDown={() => moveArtist(artistIndex, artistIndex + 1)}
                    canMoveUp={artistIndex > 0}
                    canMoveDown={artistIndex < artists.length - 1}
                  />
                  
                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex-1">
                      <div className="font-medium">{(artist as any).artist_name}</div>
                      <div className="text-sm text-muted-foreground">
                        Posição {artistIndex + 1}
                      </div>
                    </div>
                    
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {getRoleIcon((artist as any).role)}
                      {getRoleLabel((artist as any).role)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FormField
                      control={control}
                      name={`artists.${artistIndex}.role`}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="performer">Performer</SelectItem>
                            <SelectItem value="headliner">Headliner</SelectItem>
                            <SelectItem value="support">Support</SelectItem>
                            <SelectItem value="special-guest">Convidado</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArtist(artistIndex)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {artists.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <div className="text-sm">Nenhum artista selecionado</div>
              <div className="text-xs">Use o campo acima para buscar e adicionar artistas</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};