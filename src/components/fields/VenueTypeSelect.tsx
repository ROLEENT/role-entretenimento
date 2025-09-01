"use client";
import RHFSelectAsync from '@/components/form/RHFSelectAsync';

interface VenueTypeSelectProps {
  name?: string;
  placeholder?: string;
}

export default function VenueTypeSelect({ 
  name = "venue_type_id",
  placeholder = "Tipo de local"
}: VenueTypeSelectProps) {
  return (
    <RHFSelectAsync
      name={name}
      query={{ table: "venue_types", fields: "id,name,slug", orderBy: "name" }}
      mapRow={(r) => ({ value: String(r.id), label: r.name })}
      parseValue={(v) => Number(v)}
      serializeValue={(v) => String(v ?? "")}
      placeholder={placeholder}
    />
  );
}