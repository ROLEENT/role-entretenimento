import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from 'use-debounce';

interface RHFSlugProps {
  name: string;
  label: string;
  table: string;
  generateFrom?: string;
  className?: string;
  required?: boolean;
}

export function RHFSlug({ 
  name, 
  label, 
  table,
  generateFrom,
  className,
  required 
}: RHFSlugProps) {
  const { register, formState: { errors }, watch, setValue } = useFormContext();
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  
  const error = errors[name];
  const slugValue = watch(name);
  const sourceValue = generateFrom ? watch(generateFrom) : null;
  
  const [debouncedSlug] = useDebounce(slugValue, 500);

  // Generate slug from source field
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .slice(0, 80); // Limit to 80 chars
  };

  // Auto-generate slug when source changes
  useEffect(() => {
    if (generateFrom && sourceValue && !slugValue) {
      const generated = generateSlug(sourceValue);
      setValue(name, generated);
    }
  }, [sourceValue, generateFrom, slugValue, name, setValue]);

  // Check slug uniqueness
  useEffect(() => {
    if (!debouncedSlug) {
      setIsAvailable(null);
      return;
    }

    setIsChecking(true);
    
    (async () => {
      try {
        const { data } = await supabase
          .from(table)
          .select('slug')
          .eq('slug', debouncedSlug)
          .maybeSingle();
        
        setIsAvailable(!data);
        setIsChecking(false);
      } catch (error) {
        setIsAvailable(null);
        setIsChecking(false);
      }
    })();
  }, [debouncedSlug, table]);

  const handleGenerate = () => {
    if (generateFrom && sourceValue) {
      const generated = generateSlug(sourceValue);
      setValue(name, generated);
    }
  };

  return (
    <div className={className}>
      <Label htmlFor={name} className="flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            id={name}
            placeholder="url-amigavel"
            {...register(name)}
            aria-invalid={!!error}
            className={`${error || isAvailable === false ? 'border-destructive' : ''} ${isAvailable === true ? 'border-green-500' : ''}`}
          />
        </div>
        {generateFrom && (
          <Button 
            type="button" 
            variant="outline" 
            size="icon"
            onClick={handleGenerate}
            disabled={!sourceValue}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="flex items-center gap-2 mt-1">
        {isChecking && (
          <span className="text-sm text-muted-foreground">Verificando...</span>
        )}
        {isAvailable === true && (
          <span className="text-sm text-green-600">✓ Disponível</span>
        )}
        {isAvailable === false && (
          <span className="text-sm text-destructive">✗ Já existe</span>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-destructive mt-1">
          {error.message as string}
        </p>
      )}
    </div>
  );
}