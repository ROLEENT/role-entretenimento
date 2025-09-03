"use client";
import { RHFSelectAsync } from '@/components/form/RHFSelectAsync';

interface ArtistCategorySelectProps {
  name?: string;
  placeholder?: string;
}

export default function ArtistCategorySelect({ 
  name = "category_id",
  placeholder = "Selecione a categoria"
}: ArtistCategorySelectProps) {
  return (
    <RHFSelectAsync
      name={name}
      query={{ table: "artist_categories", fields: "id,name,slug", orderBy: "name" }}
      mapRow={(r) => ({ value: String(r.id), label: r.name })}
      parseValue={(v) => v}
      serializeValue={(v) => String(v ?? "")}
      placeholder={placeholder}
    />
  );
}