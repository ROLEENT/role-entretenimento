import React, { useState, KeyboardEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChipInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  value: string[];
  onChange: (value: string[]) => void;
  onBlur?: () => void;
  maxItems?: number;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export const ChipInput = ({
  name,
  label,
  placeholder = "Digite e pressione Enter para adicionar...",
  value,
  onChange,
  onBlur,
  maxItems,
  disabled,
  error,
  className,
}: ChipInputProps) => {
  const [inputValue, setInputValue] = useState('');

  const addChip = (text: string) => {
    const trimmed = text.trim();
    if (trimmed && !value.includes(trimmed)) {
      if (!maxItems || value.length < maxItems) {
        onChange([...value, trimmed]);
      }
    }
    setInputValue('');
  };

  const removeChip = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addChip(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeChip(value.length - 1);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addChip(inputValue);
    }
    onBlur?.();
  };

  const isMaxReached = maxItems && value.length >= maxItems;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
          {maxItems && (
            <span className="ml-2 text-xs text-muted-foreground">
              {value.length}/{maxItems}
            </span>
          )}
        </Label>
      )}
      
      <div className={cn(
        "min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        error && "border-destructive",
        disabled && "cursor-not-allowed opacity-50"
      )}>
        <div className="flex flex-wrap gap-1 mb-2">
          {value.map((chip, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-xs flex items-center gap-1"
            >
              {chip}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeChip(index)}
                  className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                  aria-label={`Remover ${chip}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
        
        {!isMaxReached && (
          <Input
            id={name}
            name={name}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className="border-0 p-0 h-auto shadow-none focus-visible:ring-0"
          />
        )}
      </div>

      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
      
      {isMaxReached && (
        <p className="text-xs text-muted-foreground mt-1">
          Máximo de {maxItems} itens atingido
        </p>
      )}
    </div>
  );
};