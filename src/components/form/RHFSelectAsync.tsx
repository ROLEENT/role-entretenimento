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

  useEffect(() => {
    let alive = true;
    (async () => {
      const q = supabase.from(query.table).select(query.fields);
      if (query.orderBy) q.order(query.orderBy);
      const { data, error } = await q;
      if (!alive) return;
      if (!error && data) {
        setOpts(data.map(mapRow));
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [query.table, query.fields, query.orderBy, mapRow]);

  return (
    <RHFSelect
      name={name}
      options={opts}
      placeholder={loading ? "Carregando..." : (placeholder ?? "Selecione...")}
      disabled={disabled || loading}
      parseValue={parseValue}
      serializeValue={serializeValue}
    />
  );
}