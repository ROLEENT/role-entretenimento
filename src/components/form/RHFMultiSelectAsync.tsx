"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
  value: string | number;
  label: string;
}

interface AsyncQuery {
  table: string;
  fields: string;
  orderBy?: string;
}

interface RHFMultiSelectAsyncProps {
  name: string;
  label?: string;
  query: AsyncQuery;
  mapRow: (row: any) => MultiSelectOption;
  parseValue?: (value: string) => any;
  serializeValue?: (value: any) => string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function RHFMultiSelectAsync({
  name,
  label,
  query,
  mapRow,
  parseValue = (v) => v,
  serializeValue = (v) => String(v ?? ""),
  placeholder = "Selecione...",
  disabled,
  className,
}: RHFMultiSelectAsyncProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const [options, setOptions] = useState<MultiSelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const fieldError = errors[name];

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        setError(null);

        let queryBuilder = supabase
          .from(query.table)
          .select(query.fields);

        if (query.orderBy) {
          queryBuilder = queryBuilder.order(query.orderBy);
        }

        const { data, error } = await queryBuilder;

        if (error) throw error;

        const mappedOptions = (data || []).map(mapRow);
        setOptions(mappedOptions);
      } catch (err: any) {
        console.error('Error fetching options:', err);
        setError(err.message || 'Erro ao carregar opções');
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [query.table, query.fields, query.orderBy, mapRow]);

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
        render={({ field }) => {
          const selectedValues = field.value || [];
          const selectedOptions = options.filter(option => 
            selectedValues.includes(parseValue(serializeValue(option.value)))
          );

          const handleSelect = (option: MultiSelectOption) => {
            const value = parseValue(serializeValue(option.value));
            const newValues = selectedValues.includes(value)
              ? selectedValues.filter((v: any) => v !== value)
              : [...selectedValues, value];
            
            field.onChange(newValues);
          };

          const handleRemove = (valueToRemove: any) => {
            const newValues = selectedValues.filter((v: any) => v !== valueToRemove);
            field.onChange(newValues);
          };

          return (
            <div className="space-y-2">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                      "w-full justify-between",
                      !selectedOptions.length && "text-muted-foreground",
                      className
                    )}
                    disabled={disabled || loading}
                  >
                    {selectedOptions.length > 0
                      ? `${selectedOptions.length} selecionado(s)`
                      : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar..." />
                    <CommandList>
                      <CommandEmpty>
                        {loading ? "Carregando..." : error || "Nenhum resultado encontrado."}
                      </CommandEmpty>
                      <CommandGroup>
                        {options.map((option) => {
                          const value = parseValue(serializeValue(option.value));
                          const isSelected = selectedValues.includes(value);
                          
                          return (
                            <CommandItem
                              key={serializeValue(option.value)}
                              value={option.label}
                              onSelect={() => handleSelect(option)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  isSelected ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {option.label}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Selected items */}
              {selectedOptions.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedOptions.map((option) => {
                    const value = parseValue(serializeValue(option.value));
                    return (
                      <Badge
                        key={serializeValue(option.value)}
                        variant="secondary"
                        className="text-xs"
                      >
                        {option.label}
                        <button
                          type="button"
                          className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleRemove(value);
                            }
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={() => handleRemove(value)}
                          disabled={disabled}
                        >
                          <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }}
      />
      {fieldError && (
        <p className="text-sm text-destructive">
          {fieldError.message as string}
        </p>
      )}
    </div>
  );
}