"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AsyncQuery {
  table: string;
  fields: string;
  orderBy?: string;
}

interface SelectOption {
  value: string;
  label: string;
}

interface RHFSelectAsyncProps {
  name: string;
  query: AsyncQuery;
  mapRow: (row: any) => SelectOption;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  parseValue?: (value: string) => any;
  serializeValue?: (value: any) => string;
}

export default function RHFSelectAsync({
  name,
  query,
  mapRow,
  label,
  placeholder = "Carregando...",
  disabled,
  className,
  parseValue,
  serializeValue,
}: RHFSelectAsyncProps) {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    formState: { errors },
  } = useFormContext();

  const fieldError = errors[name];

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
        setLoading(true);
        setError(null);
        
        const q = supabase.from(query.table).select(query.fields);
        if (query.orderBy) q.order(query.orderBy);
        
        const { data, error } = await q;
        
        if (!alive) return;
        
        if (error) {
          console.error(`Erro ao carregar ${query.table}:`, error);
          setError(`Erro ao carregar dados: ${error.message}`);
          setOptions([]);
        } else if (data) {
          const mappedOptions = data.map(stableMapRow);
          setOptions(mappedOptions);
        } else {
          setOptions([]);
        }
      } catch (err) {
        if (!alive) return;
        console.error(`Erro inesperado:`, err);
        setError(`Erro inesperado: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
        setOptions([]);
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => { alive = false; };
  }, [queryKey, stableMapRow, query.table, query.fields, query.orderBy]);

  const finalPlaceholder = loading ? "Carregando..." : error ? `Erro: ${error}` : placeholder;
  const isDisabled = disabled || loading || !!error;

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name} className={fieldError ? "text-destructive" : ""}>
          {label}
        </Label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            onValueChange={(value) => {
              const parsedValue = parseValue ? parseValue(value) : value;
              field.onChange(parsedValue);
            }}
            value={serializeValue ? serializeValue(field.value) : field.value}
            disabled={isDisabled}
          >
            <SelectTrigger className={className} aria-invalid={!!fieldError}>
              <SelectValue placeholder={finalPlaceholder} />
            </SelectTrigger>
            <SelectContent position="popper" className="z-[9999] bg-popover border shadow-lg">
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {fieldError && (
        <p className="text-sm text-destructive">
          {fieldError.message as string}
        </p>
      )}
    </div>
  );
}
