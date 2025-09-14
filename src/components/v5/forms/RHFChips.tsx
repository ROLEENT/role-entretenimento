"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useState, KeyboardEvent } from "react";

interface RHFChipsProps {
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  options?: Array<{ value: string; label: string }>;
  onCreateNew?: (value: string) => void;
  maxItems?: number;
  showCounter?: boolean;
}

export function RHFChips({
  name,
  label,
  placeholder = "Digite e pressione Enter para adicionar",
  description,
  disabled,
  required,
  className,
  options = [],
  onCreateNew,
  maxItems = 12,
  showCounter = true,
}: RHFChipsProps) {
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
        if (currentValue.length >= maxItems) {
          // Could show toast: "Máximo de {maxItems} itens permitido"
          return;
        }
        
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
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <Controller
        name={name}
        control={control}
        defaultValue={[]}
        render={({ field }) => (
          <div className="space-y-2">
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
                  placeholder={field.value?.length >= maxItems ? "Máximo atingido" : placeholder}
                  disabled={disabled || field.value?.length >= maxItems}
                  className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                  aria-invalid={!!fieldError}
                  aria-describedby={description ? `${name}-description` : undefined}
                  aria-required={required}
                />
              )}
            </div>
            
            {showCounter && (
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{field.value?.length || 0}/{maxItems} itens</span>
                {field.value?.length >= maxItems && (
                  <span className="text-amber-600">Limite máximo atingido</span>
                )}
              </div>
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