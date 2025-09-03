"use client";
import { RHFSelectAsync } from '@/components/form/RHFSelectAsync';

interface VenueCategorySelectProps {
  name?: string;
  placeholder?: string;
}

export default function VenueCategorySelect({ 
  name = "category_id",
  placeholder = "Selecione a categoria"
}: VenueCategorySelectProps) {
  return (
    <RHFSelectAsync
      name={name}
      query={{ table: "venue_categories", fields: "id,name,slug", orderBy: "name" }}
      mapRow={(r) => ({ value: String(r.id), label: r.name })}
      parseValue={(v) => v}
      serializeValue={(v) => String(v ?? "")}
      placeholder={placeholder}
    />
  );
}