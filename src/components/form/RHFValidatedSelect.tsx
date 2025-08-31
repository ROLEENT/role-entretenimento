"use client";

import React from "react";
import { RHFFormField } from "./RHFFormField";
import { BaseFormFieldProps } from "@/lib/forms";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

interface RHFValidatedSelectProps extends BaseFormFieldProps {
  options: SelectOption[];
  placeholder?: string;
  parseValue?: (value: string) => any;
  serializeValue?: (value: any) => string;
  onValueChange?: (value: any) => void;
  allowClear?: boolean;
}

export const RHFValidatedSelect: React.FC<RHFValidatedSelectProps> = ({
  name,
  label,
  description,
  disabled,
  required,
  className,
  options,
  placeholder = "Selecione...",
  parseValue,
  serializeValue,
  onValueChange,
  allowClear = false,
}) => {
  return (
    <RHFFormField
      name={name}
      label={label}
      description={description}
      required={required}
      disabled={disabled}
      className={className}
    >
      {({ field, fieldState }) => (
        <Select
          onValueChange={(value) => {
            if (value === "__clear__" && allowClear) {
              field.onChange(undefined);
              onValueChange?.(undefined);
              return;
            }
            
            const parsedValue = parseValue ? parseValue(value) : value;
            field.onChange(parsedValue);
            onValueChange?.(parsedValue);
          }}
          value={serializeValue ? serializeValue(field.value) : (field.value as string) || ""}
          disabled={disabled}
        >
          <SelectTrigger 
            className={cn(
              fieldState.error && "border-destructive focus:border-destructive"
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          
          <SelectContent position="popper" className="z-[9999] bg-popover border shadow-lg max-h-[300px] overflow-y-auto">
            {allowClear && field.value && (
              <SelectItem value="__clear__" className="text-muted-foreground italic">
                Limpar seleção
              </SelectItem>
            )}
            
            {options.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
                className={cn(
                  option.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex flex-col">
                  <span>{option.label}</span>
                  {option.description && (
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </RHFFormField>
  );
};

export default RHFValidatedSelect;