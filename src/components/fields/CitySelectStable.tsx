"use client";
import { memo, useCallback } from 'react';
import { RHFSelectAsync } from '@/components/form/RHFSelectAsync';

interface CitySelectStableProps {
  name?: string;
  placeholder?: string;
}

const CitySelectStable = memo(function CitySelectStable({ 
  name = "city_id", 
  placeholder = "Selecione a cidade" 
}: CitySelectStableProps) {
  
  // Memoize the mapRow function to prevent re-creation
  const mapRow = useCallback((r: any) => ({ 
    value: String(r.id), 
    label: `${r.name} - ${r.uf}` 
  }), []);

  // Memoize parse/serialize functions
  const parseValue = useCallback((v: string) => Number(v), []);
  const serializeValue = useCallback((v: any) => String(v ?? ""), []);

  return (
    <RHFSelectAsync
      name={name}
      query={{ table: "cities", fields: "id,name,uf", orderBy: "name" }}
      mapRow={mapRow}
      parseValue={parseValue}
      serializeValue={serializeValue}
      placeholder={placeholder}
    />
  );
});

export default CitySelectStable;