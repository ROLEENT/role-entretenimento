"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";

interface AsyncOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface RHFSelectAsyncProps {
  name: string;
  label?: string;
  placeholder?: string;
  loadOptions?: () => Promise<AsyncOption[]>;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  defaultOptions?: AsyncOption[];
  // Support for legacy API
  query?: {
    table: string;
    fields: string;
    orderBy?: string;
    filter?: string;
  };
  mapRow?: (row: any) => { value: string; label: string };
  parseValue?: (value: any) => any;
  serializeValue?: (value: any) => string;
}

export function RHFSelectAsync({
  name,
  label,
  placeholder = "Selecione uma opção",
  loadOptions,
  disabled = false,
  required = false,
  className,
  defaultOptions = [],
  // Legacy API support
  query,
  mapRow,
  parseValue = (v) => v,
  serializeValue = (v) => String(v ?? ""),
}: RHFSelectAsyncProps) {
  const { control } = useFormContext();
  const [options, setOptions] = useState<AsyncOption[]>(defaultOptions);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(defaultOptions.length > 0);

  // Create loadOptions from legacy query API if needed
  const queryLoadOptions = useCallback(async (): Promise<AsyncOption[]> => {
    if (!query || !mapRow) return [];
    
    try {
      let queryBuilder = supabase
        .from(query.table)
        .select(query.fields);

      if (query.orderBy) {
        queryBuilder = queryBuilder.order(query.orderBy);
      }

      if (query.filter) {
        // Simple filter support - can be extended
        queryBuilder = queryBuilder.eq(query.filter.split('=')[0], query.filter.split('=')[1]);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;

      return (data || []).map(mapRow);
    } catch (error) {
      console.error("Error loading query options:", error);
      return [];
    }
  }, [query, mapRow]);

  const finalLoadOptions = useMemo(() => {
    return loadOptions || queryLoadOptions;
  }, [loadOptions, queryLoadOptions]);

  // Load options on component mount
  useEffect(() => {
    if (!hasLoaded && !isLoading && finalLoadOptions) {
      setIsLoading(true);
      finalLoadOptions()
        .then((newOptions) => {
          setOptions(newOptions);
          setHasLoaded(true);
        })
        .catch((error) => {
          console.error("Error loading options:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [finalLoadOptions, hasLoaded, isLoading]);

  const handleOpenChange = async (open: boolean) => {
    // Options are now loaded on mount, no need to load on open
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
            <Select
              onValueChange={(value) => field.onChange(parseValue(value))}
              value={serializeValue(field.value)}
              disabled={disabled || isLoading}
              onOpenChange={handleOpenChange}
            >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <LoadingSpinner className="w-4 h-4" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Carregando...
                  </span>
                </div>
              ) : (
                options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}