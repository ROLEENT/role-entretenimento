"use client";

import { useState } from "react";
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

interface AsyncOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface RHFSelectAsyncProps {
  name: string;
  label?: string;
  placeholder?: string;
  loadOptions: () => Promise<AsyncOption[]>;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  defaultOptions?: AsyncOption[];
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
}: RHFSelectAsyncProps) {
  const { control } = useFormContext();
  const [options, setOptions] = useState<AsyncOption[]>(defaultOptions);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(defaultOptions.length > 0);

  const handleOpenChange = async (open: boolean) => {
    if (open && !hasLoaded && !isLoading) {
      setIsLoading(true);
      try {
        const newOptions = await loadOptions();
        setOptions(newOptions);
        setHasLoaded(true);
      } catch (error) {
        console.error("Error loading options:", error);
      } finally {
        setIsLoading(false);
      }
    }
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
            onValueChange={field.onChange}
            value={field.value}
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