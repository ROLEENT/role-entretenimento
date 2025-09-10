import React, { useState, useRef, useEffect } from 'react';
import { Check, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Input } from './input';
import { Badge } from './badge';

interface Option {
  label: string;
  value: string;
}

export interface MultiSelectOption {
  id: string;
  name: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxSelected?: number;
  allowCustom?: boolean;
  className?: string;
}

interface MultiSelectOldProps {
  options: MultiSelectOption[];
  selected: MultiSelectOption[];
  onSelectionChange: (selected: MultiSelectOption[]) => void;
  onCreateNew?: (name: string) => Promise<string>; // Returns the new ID
  placeholder?: string;
  searchPlaceholder?: string;
  maxSelections?: number;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  emptyText?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value = [],
  onChange,
  placeholder = "Selecione opções",
  maxSelected,
  allowCustom = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customInput, setCustomInput] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !value.includes(option.value)
  );

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      if (!maxSelected || value.length < maxSelected) {
        onChange([...value, optionValue]);
      }
    }
  };

  const removeOption = (optionValue: string) => {
    onChange(value.filter(v => v !== optionValue));
  };

  const addCustomOption = () => {
    if (customInput.trim() && !value.includes(customInput.trim())) {
      if (!maxSelected || value.length < maxSelected) {
        onChange([...value, customInput.trim()]);
        setCustomInput('');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && allowCustom && customInput.trim()) {
      e.preventDefault();
      addCustomOption();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getOptionLabel = (optionValue: string) => {
    const option = options.find(opt => opt.value === optionValue);
    return option ? option.label : optionValue;
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div
        className={cn(
          "flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          isOpen && "ring-2 ring-ring ring-offset-2"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {value.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            value.map((optionValue) => (
              <Badge
                key={optionValue}
                variant="secondary"
                className="text-xs"
              >
                {getOptionLabel(optionValue)}
                <button
                  type="button"
                  className="ml-1 hover:bg-muted rounded-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeOption(optionValue);
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          )}
        </div>
        <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="p-2">
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8"
            />
          </div>

          {allowCustom && (
            <div className="p-2 border-b">
              <div className="flex gap-2">
                <Input
                  placeholder="Adicionar personalizado..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-8 flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={addCustomOption}
                  disabled={!customInput.trim() || value.includes(customInput.trim()) || (maxSelected && value.length >= maxSelected)}
                >
                  Adicionar
                </Button>
              </div>
            </div>
          )}

          <div className="p-1">
            {filteredOptions.length === 0 && !allowCustom ? (
              <div className="px-2 py-3 text-center text-sm text-muted-foreground">
                Nenhuma opção encontrada
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                    value.includes(option.value) && "bg-accent",
                    maxSelected && value.length >= maxSelected && !value.includes(option.value) && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => {
                    if (!maxSelected || value.length < maxSelected || value.includes(option.value)) {
                      toggleOption(option.value);
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </div>
              ))
            )}
          </div>

          {maxSelected && (
            <div className="p-2 border-t text-xs text-muted-foreground text-center">
              {value.length}/{maxSelected} selecionados
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export function MultiSelectOld({
  options,
  selected,
  onSelectionChange,
  onCreateNew,
  placeholder = "Selecionar itens...",
  searchPlaceholder = "Buscar ou criar...",
  maxSelections = 8,
  className,
  disabled = false,
  loading = false,
  emptyText = "Nenhum item encontrado",
}: MultiSelectOldProps) {
  return <div>Legacy MultiSelect - use new version</div>;
}