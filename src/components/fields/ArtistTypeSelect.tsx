"use client";
import RHFSelectAsync from '@/components/form/RHFSelectAsync';

interface ArtistTypeSelectProps {
  name?: string;
  label?: string;
}

export default function ArtistTypeSelect({ 
  name = "artist_type_id",
  label = "Tipo de artista"
}: ArtistTypeSelectProps) {
  return (
    <RHFSelectAsync
      name={name}
      query={{
        table: "artist_types",
        fields: "id,name",
        orderBy: "name"
      }}
      mapRow={(r) => ({ 
        value: String(r.id), 
        label: r.name 
      })}
      parseValue={(v) => String(v)}
      serializeValue={(v) => String(v ?? "")}
      placeholder={label}
    />
  );
}