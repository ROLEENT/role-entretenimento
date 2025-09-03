"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
 } from "@/components/ui/form";
import { SelectUniversal } from "@/components/ui/select-universal";

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface RHFSelectProps {
  name: string;
  label?: string;
  placeholder?: string;
  options: Option[];
  disabled?: boolean;
  required?: boolean;
  className?: string;
  // Support for legacy API
  parseValue?: (value: any) => any;
  serializeValue?: (value: any) => string;
}

export function RHFSelect({
  name,
  label,
  placeholder = "Selecione uma opção",
  options,
  disabled = false,
  required = false,
  className,
  parseValue = (v) => v,
  serializeValue = (v) => String(v ?? ""),
}: RHFSelectProps) {
  const { control } = useFormContext();

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
          <FormControl>
            <SelectUniversal
              onValueChange={(value) => field.onChange(parseValue(value))}
              value={serializeValue(field.value)}
              options={options}
              placeholder={placeholder}
              disabled={disabled}
              className={className}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}