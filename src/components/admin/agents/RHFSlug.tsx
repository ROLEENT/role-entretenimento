import React, { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useSlugValidation } from '@/hooks/useSlugValidation';
import { useDebounce } from '@/hooks/useDebounce';
import { Check, X, Loader2 } from 'lucide-react';

interface RHFSlugProps {
  name: string;
  label: string;
  sourceField: string;
  table: 'artists' | 'organizers' | 'venues';
  excludeId?: string;
  required?: boolean;
}

export const RHFSlug: React.FC<RHFSlugProps> = ({
  name,
  label,
  sourceField,
  table,
  excludeId,
  required
}) => {
  const { control, setValue, getValues } = useFormContext();
  const { generateSlug, checkSlug, available, loading } = useSlugValidation(table);
  
  const sourceValue = useWatch({ control, name: sourceField });
  const slugValue = useWatch({ control, name });
  const debouncedSlug = useDebounce(slugValue, 500);

  // Auto-generate slug from source field
  useEffect(() => {
    if (sourceValue && !slugValue) {
      const generatedSlug = generateSlug(sourceValue);
      setValue(name, generatedSlug);
    }
  }, [sourceValue, slugValue, setValue, name, generateSlug]);

  // Check slug availability
  useEffect(() => {
    if (debouncedSlug && debouncedSlug.length >= 3) {
      checkSlug(debouncedSlug, excludeId);
    }
  }, [debouncedSlug, checkSlug, excludeId]);

  const getStatusIcon = () => {
    if (!slugValue || slugValue.length < 3) return null;
    if (loading) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    if (available) return <Check className="h-4 w-4 text-green-600" />;
    return <X className="h-4 w-4 text-red-600" />;
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                {...field}
                placeholder="slug-do-artista"
                className="pr-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {getStatusIcon()}
              </div>
            </div>
          </FormControl>
          {slugValue && slugValue.length >= 3 && !loading && !available && (
            <p className="text-sm text-red-600">Este slug já está em uso</p>
          )}
          {slugValue && slugValue.length >= 3 && !loading && available && (
            <p className="text-sm text-green-600">Slug disponível</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};