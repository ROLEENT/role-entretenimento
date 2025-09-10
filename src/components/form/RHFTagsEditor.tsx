import React, { useState, KeyboardEvent } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RHFTagsEditorProps {
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  maxTags?: number;
  className?: string;
}

export const RHFTagsEditor: React.FC<RHFTagsEditorProps> = ({
  name,
  label,
  placeholder = "Digite uma tag e pressione Enter",
  description,
  disabled,
  required,
  maxTags = 20,
  className,
}) => {
  const { control } = useFormContext();
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    fieldValue: string[],
    onChange: (value: string[]) => void
  ) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmedValue = inputValue.trim();
      
      if (trimmedValue && !fieldValue.includes(trimmedValue) && fieldValue.length < maxTags) {
        onChange([...fieldValue, trimmedValue]);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && !inputValue && fieldValue.length > 0) {
      onChange(fieldValue.slice(0, -1));
    }
  };

  const removeTag = (indexToRemove: number, fieldValue: string[], onChange: (value: string[]) => void) => {
    onChange(fieldValue.filter((_, index) => index !== indexToRemove));
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
          <FormControl>
            <div className="space-y-2">
              {/* Tags Display */}
              {field.value && field.value.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {field.value.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                      {!disabled && (
                        <button
                          type="button"
                          onClick={() => removeTag(index, field.value || [], field.onChange)}
                          className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Input Field */}
              <div className="relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, field.value || [], field.onChange)}
                  placeholder={placeholder}
                  disabled={disabled || (field.value && field.value.length >= maxTags)}
                  className="pr-16"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                  {field.value ? field.value.length : 0}/{maxTags}
                </div>
              </div>
            </div>
          </FormControl>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};