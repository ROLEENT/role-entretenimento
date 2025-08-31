"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useState, KeyboardEvent } from "react";
import { BaseFormFieldProps } from "@/lib/forms";

interface RHFComboboxChipsProps extends BaseFormFieldProps {
  options?: Array<{ value: string; label: string }>;
  onCreateNew?: (value: string) => void;
  maxItems?: number;
}

export default function RHFComboboxChips({
  name,
  label,
  placeholder = "Digite e pressione Enter para adicionar",
  description,
  disabled,
  className,
  options = [],
  onCreateNew,
  maxItems,
}: RHFComboboxChipsProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const [inputValue, setInputValue] = useState("");
  const fieldError = errors[name];

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    onChange: (value: string[]) => void,
    currentValue: string[]
  ) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmedValue = inputValue.trim();
      
      if (trimmedValue && !currentValue.includes(trimmedValue)) {
        if (maxItems && currentValue.length >= maxItems) return;
        
        const newValue = [...currentValue, trimmedValue];
        onChange(newValue);
        setInputValue("");
        
        if (onCreateNew) {
          onCreateNew(trimmedValue);
        }
      }
    } else if (e.key === "Backspace" && !inputValue && currentValue.length > 0) {
      const newValue = currentValue.slice(0, -1);
      onChange(newValue);
    }
  };

  const removeItem = (indexToRemove: number, onChange: (value: string[]) => void, currentValue: string[]) => {
    const newValue = currentValue.filter((_, index) => index !== indexToRemove);
    onChange(newValue);
  };

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
        defaultValue={[]}
        render={({ field }) => (
          <div className={`min-h-[40px] p-2 border rounded-md focus-within:ring-2 focus-within:ring-ring ${className}`}>
            <div className="flex flex-wrap gap-1 mb-2">
              {field.value?.map((item: string, index: number) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {item}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => removeItem(index, field.onChange, field.value)}
                      className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                      aria-label={`Remover ${item}`}
                    >
                      <X size={12} />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            
            {(!maxItems || field.value?.length < maxItems) && (
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, field.onChange, field.value || [])}
                placeholder={placeholder}
                disabled={disabled}
                className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                aria-invalid={!!fieldError}
                aria-describedby={description ? `${name}-description` : undefined}
              />
            )}
          </div>
        )}
      />
      
      {description && (
        <p id={`${name}-description`} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      {fieldError && (
        <p className="text-sm text-destructive" role="alert">
          {fieldError.message as string}
        </p>
      )}
    </div>
  );
}