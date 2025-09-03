import React, { useState, useEffect } from 'react';
import { UseControllerProps, useController } from 'react-hook-form';
import { ComboboxAsync, ComboboxAsyncOption } from '@/components/ui/combobox-async';
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface RHFComboboxAsyncProps extends UseControllerProps {
  label?: string;
  placeholder?: string;
  emptyText?: string;
  createNewText?: string;
  loadingText?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  onSearch: (query: string) => Promise<ComboboxAsyncOption[]>;
  onCreateNew?: () => void;
  onCreated?: (newOption: ComboboxAsyncOption) => void;
}

export function RHFComboboxAsync({
  name,
  control,
  rules,
  defaultValue,
  label,
  placeholder,
  emptyText,
  createNewText,
  loadingText,
  description,
  className,
  disabled = false,
  onSearch,
  onCreateNew,
  onCreated,
  ...props
}: RHFComboboxAsyncProps) {
  const {
    field: { value, onChange, ...fieldProps },
    fieldState: { error }
  } = useController({
    name,
    control,
    rules,
    defaultValue,
    ...props
  });

  const [selectedOption, setSelectedOption] = useState<ComboboxAsyncOption | null>(null);

  // Effect para buscar opção atual quando value muda
  useEffect(() => {
    if (value && !selectedOption) {
      // Se temos um value mas não temos a opção selecionada,
      // fazemos uma busca para encontrar os detalhes
      const searchForCurrentValue = async () => {
        try {
          const results = await onSearch('');
          const found = results.find(opt => opt.value === value);
          if (found) {
            setSelectedOption(found);
          }
        } catch (error) {
          console.error('Error searching for current value:', error);
        }
      };
      
      searchForCurrentValue();
    } else if (!value) {
      setSelectedOption(null);
    }
  }, [value, selectedOption, onSearch]);

  const handleValueChange = (newValue: string | undefined) => {
    onChange(newValue);
  };

  const handleCreateNew = () => {
    onCreateNew?.();
  };

  // Método público para atualizar a opção selecionada após criação
  React.useImperativeHandle(React.createRef(), () => ({
    setCreatedOption: (option: ComboboxAsyncOption) => {
      setSelectedOption(option);
      onChange(option.value);
      onCreated?.(option);
    }
  }));

  return (
    <FormItem>
      {label && <FormLabel>{label}</FormLabel>}
      <ComboboxAsync
        {...fieldProps}
        value={value}
        onValueChange={handleValueChange}
        onSearch={onSearch}
        onCreateNew={handleCreateNew}
        placeholder={placeholder}
        emptyText={emptyText}
        createNewText={createNewText}
        loadingText={loadingText}
        className={className}
        disabled={disabled}
      />
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <FormMessage>{error?.message}</FormMessage>
    </FormItem>
  );
}