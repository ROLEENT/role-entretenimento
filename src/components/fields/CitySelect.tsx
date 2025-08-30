"use client";
import { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type City = { 
  id: number; 
  name: string; 
  uf: string;
};

interface CitySelectProps {
  name?: string;
  placeholder?: string;
}

export default function CitySelect({ 
  name = "city_id", 
  placeholder = "Selecione a cidade" 
}: CitySelectProps) {
  const { control } = useFormContext();
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const fetchCities = async () => {
      try {
        const { data, error } = await supabase
          .from("cities")
          .select("id, name, uf")
          .order("name");
        
        if (!mounted) return;
        
        if (error) {
          console.error("Erro ao carregar cidades:", error);
        } else if (data) {
          setCities(data);
        }
      } catch (err) {
        console.error("Erro ao buscar cidades:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchCities();
    
    return () => { 
      mounted = false; 
    };
  }, []);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select 
          disabled={loading} 
          value={field.value ? String(field.value) : ""} 
          onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder={loading ? "Carregando..." : placeholder} />
          </SelectTrigger>
          <SelectContent>
            {cities.map(city => (
              <SelectItem key={city.id} value={String(city.id)}>
                {city.name} - {city.uf}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
}