"use client";

import { useFormContext } from "react-hook-form";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SimpleDropdown } from "@/components/ui/dropdown-simple";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface RHFDropdownSelectProps {
  name: string;
  label?: string;
  placeholder?: string;
  options: Option[];
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function RHFDropdownSelect({
  name,
  label,
  placeholder = "Selecione uma opção",
  options,
  disabled = false,
  required = false,
  className,
}: RHFDropdownSelectProps) {
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
            <SimpleDropdown
              disabled={disabled}
              aria-label={label || placeholder}
              trigger={
                <div className={cn(
                  "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm",
                  "ring-offset-background placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  !field.value && "text-muted-foreground"
                )}>
                  <span className="line-clamp-1">
                    {field.value 
                      ? options.find(opt => opt.value === field.value)?.label || placeholder
                      : placeholder
                    }
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </div>
              }
              items={options.map(option => ({
                label: option.label,
                value: option.value,
                disabled: option.disabled,
                onClick: () => {
                  if (!option.disabled) {
                    field.onChange(option.value);
                  }
                }
              }))}
              className="w-full"
              menuClassName="w-full"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}