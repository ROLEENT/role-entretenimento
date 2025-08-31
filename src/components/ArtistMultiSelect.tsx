import { useState } from 'react';
import { ComboboxAsync, ComboboxAsyncOption } from '@/components/ui/combobox-async';
import { useEntityLookup } from '@/hooks/useEntityLookup';
import { useDebounce } from 'use-debounce';
import { Badge } from '@/components/ui/badge';

interface ArtistMultiSelectProps {
  value?: string[];
  onValueChange: (value: string[]) => void;
  className?: string;
  disabled?: boolean;
  maxItems?: number;
}

export function ArtistMultiSelect({
  value = [],
  onValueChange,
  className,
  disabled = false,
  maxItems = 12,
}: ArtistMultiSelectProps) {
  const [selectedArtists, setSelectedArtists] = useState<ComboboxAsyncOption[]>([]);
  const { searchEntities } = useEntityLookup({ type: 'artists' });

  const handleArtistSelect = (artist: ComboboxAsyncOption) => {
    if (value.includes(artist.id)) return;
    
    const newValue = [...value, artist.id];
    if (newValue.length <= maxItems) {
      onValueChange(newValue);
      setSelectedArtists([...selectedArtists, artist]);
    }
  };

  const handleRemoveArtist = (artistId: string) => {
    const newValue = value.filter(id => id !== artistId);
    onValueChange(newValue);
    setSelectedArtists(selectedArtists.filter(artist => artist.id !== artistId));
  };

  return (
    <div className="space-y-2">
      {/* Selected artists */}
      {selectedArtists.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedArtists.map((artist) => (
            <Badge
              key={artist.id}
              variant="default"
              className="cursor-pointer"
              onClick={() => handleRemoveArtist(artist.id)}
            >
              {artist.name} ×
            </Badge>
          ))}
        </div>
      )}
      
      {/* Search combobox */}
      <ComboboxAsync
        value=""
        onValueChange={(artistId) => {
          if (artistId) {
            // Find the artist data from the search results and add it
            searchEntities('').then(artists => {
              const artist = artists.find(a => a.id === artistId);
              if (artist) handleArtistSelect(artist);
            });
          }
        }}
        onSearch={searchEntities}
        placeholder={`Busque artistas... (${value.length}/${maxItems})`}
        emptyText="Nenhum artista encontrado"
        className={className}
        disabled={disabled || value.length >= maxItems}
      />
    </div>
  );
}