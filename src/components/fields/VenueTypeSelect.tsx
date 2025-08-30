"use client";
import { Controller, useFormContext } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const VENUE_TYPES = [
  { value: "house", label: "Casa de Show" },
  { value: "theater", label: "Teatro" },
  { value: "club", label: "Clube" },
  { value: "arena", label: "Arena" },
  { value: "bar", label: "Bar" },
  { value: "restaurant", label: "Restaurante" },
  { value: "pub", label: "Pub" },
  { value: "lounge", label: "Lounge" },
  { value: "outdoor", label: "Espaço Aberto" },
  { value: "cultural_center", label: "Centro Cultural" },
  { value: "gallery", label: "Galeria" },
  { value: "studio", label: "Estúdio" },
  { value: "warehouse", label: "Galpão" },
  { value: "other", label: "Outro" }
];

interface VenueTypeSelectProps {
  name?: string;
  placeholder?: string;
}

export default function VenueTypeSelect({ 
  name = "venue_type",
  placeholder = "Tipo de local"
}: VenueTypeSelectProps) {
  const { control } = useFormContext();
  
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select 
          value={field.value ?? ""} 
          onValueChange={field.onChange}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {VENUE_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
}