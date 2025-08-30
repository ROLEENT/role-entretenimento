"use client";
import RHFSelectAsync from '@/components/form/RHFSelectAsync';

interface CitySelectProps {
  name?: string;
  placeholder?: string;
}

export default function CitySelect({ 
  name = "city_id", 
  placeholder = "Selecione a cidade" 
}: CitySelectProps) {
  return (
    <RHFSelectAsync
      name={name}
      query={{ table: "cities", fields: "id,name,uf", orderBy: "name" }}
      mapRow={(r) => ({ value: String(r.id), label: `${r.name} - ${r.uf}` })}
      parseValue={(v) => Number(v)}
      serializeValue={(v) => String(v ?? "")}
      placeholder={placeholder}
    />
  );
}