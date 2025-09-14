import React, { useState, useEffect } from 'react';
import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { ComboboxAsync, ComboboxAsyncOption } from '@/components/ui/combobox-async';
import { QuickCreateModalV5 } from '@/components/v5/modals/QuickCreateModalV5';

interface RHFComboboxAsyncProps {
  name: string;
  label?: string;
  placeholder?: string;
  emptyText?: string;
  createNewText?: string;
  loadingText?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  onSearch: (query: string) => Promise<ComboboxAsyncOption[]>;
  onCreateNew?: () => void;
  onCreated?: (newOption: ComboboxAsyncOption) => void;
  // V5 Quick Create Integration
  quickCreateType?: 'artist' | 'venue' | 'organizer';
  enableQuickCreate?: boolean;
}

export function RHFComboboxAsync({
  name,
  label,
  placeholder,
  emptyText,
  createNewText,
  loadingText,
  description,
  className,
  disabled = false,
  required = false,
  onSearch,
  onCreateNew,
  onCreated,
  quickCreateType,
  enableQuickCreate = false,
}: RHFComboboxAsyncProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const fieldError = errors[name];
  const [selectedOption, setSelectedOption] = useState<ComboboxAsyncOption | null>(null);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  const handleValueChange = (newValue: string | undefined, onChange: (value: any) => void, currentValue: any) => {
    onChange(newValue);
  };

  const handleCreateNew = () => {
    if (enableQuickCreate && quickCreateType) {
      setQuickCreateOpen(true);
    } else {
      onCreateNew?.();
    }
  };

  const handleQuickCreateSuccess = (newOption: ComboboxAsyncOption) => {
    setSelectedOption(newOption);
    onCreated?.(newOption);
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
          // Effect para buscar opção atual quando value muda
          useEffect(() => {
            if (field.value && !selectedOption) {
              // Se temos um value mas não temos a opção selecionada,
              // fazemos uma busca para encontrar os detalhes
              const searchForCurrentValue = async () => {
                try {
                  const results = await onSearch('');
                  const found = results.find(opt => opt.value === field.value);
                  if (found) {
                    setSelectedOption(found);
                  }
                } catch (error) {
                  console.error('Error searching for current value:', error);
                }
              };
              
              searchForCurrentValue();
            } else if (!field.value) {
              setSelectedOption(null);
            }
          }, [field.value, selectedOption, onSearch]);

          return (
            <ComboboxAsync
              value={field.value}
              onValueChange={(newValue) => handleValueChange(newValue, field.onChange, field.value)}
              onSearch={onSearch}
              onCreateNew={handleCreateNew}
              placeholder={placeholder}
              emptyText={emptyText}
              createNewText={createNewText}
              loadingText={loadingText}
              className={className}
              disabled={disabled}
              aria-invalid={!!fieldError}
              aria-describedby={description ? `${name}-description` : undefined}
              aria-required={required}
            />
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

      {/* Quick Create Modal */}
      {enableQuickCreate && quickCreateType && (
        <QuickCreateModalV5
          open={quickCreateOpen}
          onOpenChange={setQuickCreateOpen}
          agentType={quickCreateType}
          onCreated={handleQuickCreateSuccess}
        />
      )}
    </div>
  );
}