"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import RHFSelect from "./RHFSelect";

type AsyncProps = {
  name: string;
  placeholder?: string;
  /** query: { table, fields, orderBy } */
  query: { table: string; fields: string; orderBy?: string };
  /** mapeia linha -> { value, label } */
  mapRow: (row: any) => { value: string; label: string };
  /** parse/serialize para tipos não-string (ex: number) */
  parseValue?: (v: string) => any;
  serializeValue?: (v: any) => string;
  disabled?: boolean;
};

export default function RHFSelectAsync({
  name,
  placeholder,
  query,
  mapRow,
  parseValue,
  serializeValue,
  disabled,
}: AsyncProps) {
  const [opts, setOpts] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize query key to prevent unnecessary re-renders
  const queryKey = useMemo(() => 
    `${query.table}-${query.fields}-${query.orderBy || 'none'}`, 
    [query.table, query.fields, query.orderBy]
  );

  // Stable mapRow function
  const stableMapRow = useCallback(mapRow, []);

  useEffect(() => {
    let alive = true;
    
    const loadData = async () => {
      try {
        console.log(`[RHFSelectAsync] Carregando dados para: ${queryKey}`);
        setLoading(true);
        setError(null);
        
        const q = supabase.from(query.table).select(query.fields);
        if (query.orderBy) q.order(query.orderBy);
        
        const { data, error } = await q;
        
        if (!alive) return;
        
        if (error) {
          console.error(`[RHFSelectAsync] Erro ao carregar ${query.table}:`, error);
          setError(`Erro ao carregar dados: ${error.message}`);
          setOpts([]);
        } else if (data) {
          console.log(`[RHFSelectAsync] Dados carregados (${data.length} items):`, data);
          const mappedOptions = data.map(stableMapRow);
          setOpts(mappedOptions);
        } else {
          setOpts([]);
        }
      } catch (err) {
        if (!alive) return;
        console.error(`[RHFSelectAsync] Erro inesperado:`, err);
        setError(`Erro inesperado: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
        setOpts([]);
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => { alive = false; };
  }, [queryKey, stableMapRow, query.table, query.fields, query.orderBy]);

  return (
    <RHFSelect
      name={name}
      options={opts}
      placeholder={
        loading 
          ? "Carregando..." 
          : error 
            ? `Erro: ${error}` 
            : (placeholder ?? "Selecione...")
      }
      disabled={disabled || loading || !!error}
      parseValue={parseValue}
      serializeValue={serializeValue}
    />
  );
}