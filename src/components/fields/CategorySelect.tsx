"use client";
import RHFSelectAsync from '@/components/form/RHFSelectAsync';

interface CategorySelectProps {
  name?: string;
  placeholder?: string;
  kind?: 'revista' | 'agenda' | 'ambos';
  multiple?: boolean;
}

export default function CategorySelect({ 
  name = "category_id", 
  placeholder = "Selecione a categoria",
  kind = 'ambos'
}: CategorySelectProps) {
  // Build query based on kind filter
  const getQuery = () => {
    const baseQuery = { 
      table: "categories", 
      fields: "id,name,slug,kind", 
      orderBy: "name" 
    };
    
    // If specific kind requested, we would add a filter
    // For now, returning all categories as the RHFSelectAsync doesn't support filters yet
    return baseQuery;
  };

  return (
    <RHFSelectAsync
      name={name}
      query={getQuery()}
      mapRow={(r) => ({ 
        value: String(r.id), 
        label: `${r.name}${r.kind !== 'ambos' ? ` (${r.kind})` : ''}` 
      })}
      parseValue={(v) => Number(v)}
      serializeValue={(v) => String(v ?? "")}
      placeholder={placeholder}
    />
  );
}