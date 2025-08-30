"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        console.log(`[RHFSelectAsync] Carregando dados da tabela: ${query.table}`);
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
          console.log(`[RHFSelectAsync] Dados carregados de ${query.table}:`, data);
          const mappedOptions = data.map(mapRow);
          console.log(`[RHFSelectAsync] Opções mapeadas:`, mappedOptions);
          setOpts(mappedOptions);
        } else {
          console.warn(`[RHFSelectAsync] Nenhum dado encontrado na tabela ${query.table}`);
          setOpts([]);
        }
      } catch (err) {
        console.error(`[RHFSelectAsync] Erro inesperado:`, err);
        setError(`Erro inesperado: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
        setOpts([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [query.table, query.fields, query.orderBy, mapRow]);

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