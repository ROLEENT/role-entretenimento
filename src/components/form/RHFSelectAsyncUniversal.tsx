"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { ChevronDown, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BaseFormFieldProps } from "@/lib/forms";

interface AsyncSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface RHFSelectAsyncUniversalProps extends BaseFormFieldProps {
  loadOptions: (search: string) => Promise<AsyncSelectOption[]>;
  onCreate?: (inputValue: string) => Promise<AsyncSelectOption>;
  onValueChange?: (value: string) => void;
  searchPlaceholder?: string;
  emptyText?: string;
  createText?: string;
  align?: 'left' | 'right';
  defaultOptions?: AsyncSelectOption[];
}

export default function RHFSelectAsyncUniversal({
  name,
  label,
  placeholder = "Selecione uma opção",
  description,
  disabled,
  required,
  className,
  loadOptions,
  onCreate,
  onValueChange,
  searchPlaceholder = "Digite para buscar...",
  emptyText = "Nenhuma opção encontrada",
  createText = "Criar novo",
  align = 'left',
  defaultOptions = []
}: RHFSelectAsyncUniversalProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const fieldError = errors[name];
  
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<AsyncSelectOption[]>(defaultOptions);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(async () => {
      if (search.trim()) {
        setLoading(true);
        try {
          const results = await loadOptions(search.trim());
          setOptions(results);
        } catch (error) {
          console.error('Error loading options:', error);
          setOptions([]);
        } finally {
          setLoading(false);
        }
      } else {
        setOptions(defaultOptions);
      }
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [search, isOpen, loadOptions, defaultOptions]);

  // Portal and positioning logic
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearch("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    // Portal menu to body with intelligent positioning
    if (menuRef.current && containerRef.current) {
      const menu = menuRef.current;
      const trigger = containerRef.current;
      const rect = trigger.getBoundingClientRect();
      
      document.body.appendChild(menu);
      
      // Position intelligently
      const spaceBelow = window.innerHeight - rect.bottom - 8;
      const spaceAbove = rect.top - 8;
      const shouldOpenUpward = spaceBelow < 250 && spaceAbove > spaceBelow;
      
      menu.style.position = 'fixed';
      menu.style.zIndex = '9999';
      menu.style.width = `${rect.width}px`;
      
      if (align === 'right') {
        menu.style.right = `${window.innerWidth - rect.right}px`;
      } else {
        menu.style.left = `${rect.left}px`;
      }
      
      if (shouldOpenUpward) {
        menu.style.bottom = `${window.innerHeight - rect.top + 8}px`;
      } else {
        menu.style.top = `${rect.bottom + 8}px`;
      }

      // Focus search input
      if (searchRef.current) {
        searchRef.current.focus();
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      
      // Clean up portal
      if (menuRef.current?.parentNode === document.body) {
        document.body.removeChild(menuRef.current);
      }
    };
  }, [isOpen, align]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen && defaultOptions.length > 0) {
        setOptions(defaultOptions);
      }
    }
  };

  const handleSelect = (option: AsyncSelectOption, field: any) => {
    if (!option.disabled) {
      field.onChange(option.value);
      onValueChange?.(option.value);
      setIsOpen(false);
      setSearch("");
    }
  };

  const handleCreate = async (field: any) => {
    if (!onCreate || !search.trim() || creating) return;

    setCreating(true);
    try {
      const newOption = await onCreate(search.trim());
      field.onChange(newOption.value);
      onValueChange?.(newOption.value);
      setIsOpen(false);
      setSearch("");
    } catch (error) {
      console.error('Error creating option:', error);
    } finally {
      setCreating(false);
    }
  };

  const getSelectedOption = (value: string) => {
    return [...defaultOptions, ...options].find(opt => opt.value === value);
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
        render={({ field }) => {
          const selectedOption = getSelectedOption(field.value);
          
          return (
            <div
              ref={containerRef}
              className="dd relative"
              data-dd
              data-dd-open={isOpen}
              data-dd-align={align}
            >
              <button
                type="button"
                className={cn(
                  "dd-trigger flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  !selectedOption && "text-muted-foreground",
                  className
                )}
                data-dd-trigger
                onClick={handleToggle}
                disabled={disabled}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
              >
                <span>{selectedOption?.label || placeholder}</span>
                <ChevronDown className="h-4 w-4" data-dd-icon />
              </button>

              <div
                ref={menuRef}
                className="dd-menu w-full max-h-60 overflow-hidden flex flex-col"
                data-dd-menu
                role="listbox"
                style={{ display: isOpen ? 'flex' : 'none' }}
              >
                {/* Search Input */}
                <div className="p-2 border-b border-border">
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder={searchPlaceholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-input rounded bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                {/* Options List */}
                <div className="flex-1 overflow-auto">
                  {loading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">Carregando...</span>
                    </div>
                  ) : options.length > 0 ? (
                    options.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={cn(
                          "flex w-full items-center px-3 py-2 text-sm text-left",
                          "hover:bg-muted focus:bg-muted focus:outline-none",
                          option.disabled && "opacity-50 cursor-not-allowed",
                          option.value === field.value && "bg-accent text-accent-foreground"
                        )}
                        onClick={() => handleSelect(option, field)}
                        disabled={option.disabled}
                        role="option"
                        aria-selected={option.value === field.value}
                      >
                        {option.label}
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-2">{emptyText}</p>
                      {onCreate && search.trim() && (
                        <button
                          type="button"
                          onClick={() => handleCreate(field)}
                          disabled={creating}
                          className="flex items-center justify-center gap-2 w-full px-3 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
                        >
                          {creating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                          {createText}: "{search.trim()}"
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }}
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