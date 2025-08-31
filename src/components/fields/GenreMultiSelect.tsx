"use client";
import RHFMultiSelectAsync from '@/components/form/RHFMultiSelectAsync';

interface GenreMultiSelectProps {
  name?: string;
  label?: string;
}

export default function GenreMultiSelect({ 
  name = "genre_ids",
  label = "Gêneros musicais"
}: GenreMultiSelectProps) {
  return (
    <RHFMultiSelectAsync
      name={name}
      label={label}
      query={{
        table: "genres",
        fields: "id,name",
        orderBy: "name"
      }}
      mapRow={(r) => ({ 
        value: String(r.id), 
        label: r.name 
      })}
      parseValue={(v) => String(v)}
      serializeValue={(v) => String(v ?? "")}
    />
  );
}