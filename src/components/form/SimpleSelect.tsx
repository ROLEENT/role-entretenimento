"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SimpleSelectProps {
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export default function SimpleSelect({ onValueChange, placeholder = "Selecione..." }: SimpleSelectProps) {
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCities() {
      console.log("[SimpleSelect] Iniciando carregamento das cidades...");
      try {
        const { data, error } = await supabase
          .from('cities')
          .select('id, name, uf')
          .order('name');

        console.log("[SimpleSelect] Resposta do Supabase:", { data, error });

        if (error) {
          console.error("[SimpleSelect] Erro:", error);
        } else {
          console.log("[SimpleSelect] Cidades carregadas:", data);
          setCities(data || []);
        }
      } catch (err) {
        console.error("[SimpleSelect] Erro inesperado:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCities();
  }, []);

  return (
    <Select onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={loading ? "Carregando..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {cities.map((city) => (
          <SelectItem key={city.id} value={String(city.id)}>
            {city.name} - {city.uf}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}