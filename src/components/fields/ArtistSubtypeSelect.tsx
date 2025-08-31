"use client";
import { RHFSelect } from '@/components/form/RHFSelect';

const ARTIST_SUBTYPES = [
  { value: 'banda', label: 'Banda' },
  { value: 'dj', label: 'DJ' },
  { value: 'solo', label: 'Solo' },
  { value: 'drag', label: 'Drag' },
];

interface ArtistSubtypeSelectProps {
  name?: string;
  placeholder?: string;
}

export default function ArtistSubtypeSelect({ 
  name = "artist_subtype",
  placeholder = "Tipo de artista"
}: ArtistSubtypeSelectProps) {
  return (
    <RHFSelect
      name={name}
      options={ARTIST_SUBTYPES}
      placeholder={placeholder}
    />
  );
}